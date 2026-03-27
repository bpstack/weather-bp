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
  const [selectedCity, setSelectedCityState] = useState<GeocodingCity | null>(
    () => getStoredCity(),
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const setSelectedCity = useCallback((city: GeocodingCity | null) => {
    setSelectedCityState(city);
    if (typeof window === "undefined") return;
    if (city) {
      localStorage.setItem(STORAGE_KEY_CITY, JSON.stringify(city));
    } else {
      localStorage.removeItem(STORAGE_KEY_CITY);
    }
  }, []);

  const requestGeolocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);

    const result = await getUserLocation();

    if (result.city) {
      setSelectedCity(result.city);
    } else if (result.error) {
      setLocationError(result.error);
    }

    setIsLocating(false);
    return result;
  }, [setSelectedCity]);

  useEffect(() => {
    const init = async () => {
      const stored = getStoredCity();
      if (stored) {
        setSelectedCityState(stored);
        setIsInitializing(false);
      }
      await requestGeolocation();
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
