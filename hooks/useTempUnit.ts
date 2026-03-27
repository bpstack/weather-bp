"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY_TEMP_UNIT = "weather-bp-temp-unit";

function getStoredTempUnit(): "C" | "F" {
  if (typeof window === "undefined") return "C";
  const stored = localStorage.getItem(STORAGE_KEY_TEMP_UNIT);
  return stored === "F" ? "F" : "C";
}

export function useTempUnit() {
  const [tempUnit, setTempUnitState] = useState<"C" | "F">(() => getStoredTempUnit());

  const setTempUnit = useCallback((unit: "C" | "F") => {
    setTempUnitState(unit);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TEMP_UNIT, unit);
    }
  }, []);

  const convertTemp = useCallback(
    (temp: number | null): number | string => {
      if (temp === null || temp === undefined) return "-";
      if (tempUnit === "F") return Math.round((temp * 9) / 5 + 32);
      return Math.round(temp);
    },
    [tempUnit],
  );

  return { tempUnit, setTempUnit, convertTemp };
}
