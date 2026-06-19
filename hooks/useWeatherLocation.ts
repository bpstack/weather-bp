"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GeocodingCity,
  getUserLocation,
} from "@/app/weather/services/city-utils";

const STORAGE_KEY_CITY = "weather-bp-selected-city";

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

export function useWeatherLocation() {
  // Start null on both server and client to avoid hydration mismatch;
  // the stored city / geolocation is resolved in the effect below.
  const [selectedCity, setSelectedCityState] = useState<GeocodingCity | null>(
    null,
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Manual selection: persisted so it survives reloads.
  const setSelectedCity = useCallback((city: GeocodingCity | null) => {
    setSelectedCityState(city);
    if (typeof window === "undefined") return;
    if (city) {
      localStorage.setItem(STORAGE_KEY_CITY, JSON.stringify(city));
    } else {
      localStorage.removeItem(STORAGE_KEY_CITY);
    }
  }, []);

  // Geolocation: applied to state but NOT persisted — it is recomputed on
  // every visit so a stale GPS city never gets "stuck".
  const requestGeolocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);

    const result = await getUserLocation();

    if (result.city) {
      setSelectedCityState(result.city);
    } else if (result.error) {
      setLocationError(result.error);
    }

    setIsLocating(false);
    return result;
  }, []);

  useEffect(() => {
    const init = async () => {
      // A manually-chosen city always wins on reload; skip geolocation.
      const stored = getStoredCity();
      if (stored) {
        setSelectedCityState(stored);
      } else {
        await requestGeolocation();
      }
      setIsInitializing(false);
    };
    init();
  }, [requestGeolocation]);

  return {
    selectedCity,
    setSelectedCity,
    isInitializing,
    isLocating,
    locationError,
    requestGeolocation,
  };
}
