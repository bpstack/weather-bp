"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY_TEMP_UNIT = "weather-bp-temp-unit";

function getStoredTempUnit(): "C" | "F" {
  if (typeof window === "undefined") return "C";
  return localStorage.getItem(STORAGE_KEY_TEMP_UNIT) === "F" ? "F" : "C";
}

export function useTempUnit() {
  // Lazy initializer reads the stored preference. This is hydration-safe here
  // because tempUnit is only rendered after client-side data loads (the SSR
  // pass shows a skeleton), so there is no server/client DOM mismatch.
  const [tempUnit, setTempUnitState] = useState<"C" | "F">(getStoredTempUnit);

  const setTempUnit = useCallback((unit: "C" | "F") => {
    setTempUnitState(unit);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TEMP_UNIT, unit);
    }
  }, []);

  // Pure value conversion: returns the temperature as a number (or null when
  // there is no data). No formatting/placeholder concerns here.
  const convertTemp = useCallback(
    (temp: number | null): number | null => {
      if (temp === null || temp === undefined) return null;
      if (tempUnit === "F") return Math.round((temp * 9) / 5 + 32);
      return Math.round(temp);
    },
    [tempUnit],
  );

  // Display formatting: returns a string token ("-" when no data).
  const formatTemp = useCallback(
    (temp: number | null): string => {
      const value = convertTemp(temp);
      return value === null ? "-" : String(value);
    },
    [convertTemp],
  );

  return { tempUnit, setTempUnit, convertTemp, formatTemp };
}
