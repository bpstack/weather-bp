"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GeocodingCity,
  getUserLocation,
  reverseGeocode,
  haversineKm,
} from "@/app/weather/services/city-utils";

const STORAGE_KEY_CITY = "weather-bp-selected-city";
const STORAGE_KEY_MODE = "weather-bp-location-mode";

type LocationMode = "gps" | "manual";

// Re-geocode while following GPS only after moving this far, to respect
// Nominatim usage limits and avoid churn from tiny position jitter.
const MIN_MOVE_KM = 2;

function getStoredCity(): GeocodingCity | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_CITY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getStoredMode(): LocationMode {
  if (typeof window === "undefined") return "gps";
  return localStorage.getItem(STORAGE_KEY_MODE) === "manual" ? "manual" : "gps";
}

export function useWeatherLocation() {
  // Start null on both server and client to avoid hydration mismatch;
  // the stored city / geolocation is resolved in the effect below.
  const [selectedCity, setSelectedCityState] = useState<GeocodingCity | null>(
    null,
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // "gps" follows the device location (load + movement); "manual" pins a
  // user-chosen city. Kept in a ref so the watch callback reads it freshly.
  const modeRef = useRef<LocationMode>("gps");
  // Last coords we reverse-geocoded, to gate re-lookups by distance.
  const lastFixRef = useRef<{ lat: number; lon: number } | null>(null);

  // Manual selection: pins a city and switches off GPS-follow. Persisted so
  // it survives reloads.
  const setSelectedCity = useCallback((city: GeocodingCity | null) => {
    setSelectedCityState(city);
    if (typeof window === "undefined") return;
    if (city) {
      modeRef.current = "manual";
      localStorage.setItem(STORAGE_KEY_CITY, JSON.stringify(city));
      localStorage.setItem(STORAGE_KEY_MODE, "manual");
    } else {
      modeRef.current = "gps";
      localStorage.removeItem(STORAGE_KEY_CITY);
      localStorage.setItem(STORAGE_KEY_MODE, "gps");
    }
  }, []);

  // One-shot geolocation. Also (re)enables GPS-follow mode — tapping the
  // locate button is how the user opts back in after a manual pick.
  const requestGeolocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    modeRef.current = "gps";
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_MODE, "gps");
      localStorage.removeItem(STORAGE_KEY_CITY);
    }

    const result = await getUserLocation();

    if (result.city) {
      lastFixRef.current = {
        lat: result.city.latitude,
        lon: result.city.longitude,
      };
      setSelectedCityState(result.city);
    } else if (result.error) {
      setLocationError(result.error);
    }

    setIsLocating(false);
    return result;
  }, []);

  // Initial resolution: GPS-follow locates now; manual restores the pin.
  useEffect(() => {
    modeRef.current = getStoredMode();
    const init = async () => {
      if (modeRef.current === "manual") {
        const stored = getStoredCity();
        if (stored) {
          setSelectedCityState(stored);
        } else {
          await requestGeolocation();
        }
      } else {
        await requestGeolocation();
      }
      setIsInitializing(false);
    };
    init();
  }, [requestGeolocation]);

  // Follow movement while in GPS mode: re-geocode after meaningful moves.
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    let cancelled = false;
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        if (modeRef.current !== "gps") return;
        const { latitude, longitude } = position.coords;
        const last = lastFixRef.current;
        if (
          last &&
          haversineKm(last.lat, last.lon, latitude, longitude) < MIN_MOVE_KM
        ) {
          return;
        }
        lastFixRef.current = { lat: latitude, lon: longitude };
        const city = await reverseGeocode(latitude, longitude);
        if (!cancelled && modeRef.current === "gps") {
          setSelectedCityState(city);
        }
      },
      () => {
        // Ignore watch errors; the one-shot locate already surfaces them.
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return {
    selectedCity,
    setSelectedCity,
    isInitializing,
    isLocating,
    locationError,
    requestGeolocation,
  };
}
