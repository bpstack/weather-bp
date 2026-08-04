import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTempUnit } from "@/hooks/useTempUnit";

const STORAGE_KEY = "weather-bp-temp-unit";

beforeEach(() => {
  localStorage.clear();
});

describe("useTempUnit", () => {
  it("defaults to Celsius when nothing is stored", () => {
    const { result } = renderHook(() => useTempUnit());
    expect(result.current.tempUnit).toBe("C");
  });

  it("restores a stored Fahrenheit preference", () => {
    localStorage.setItem(STORAGE_KEY, "F");
    const { result } = renderHook(() => useTempUnit());
    expect(result.current.tempUnit).toBe("F");
  });

  it("falls back to Celsius on a corrupt stored value", () => {
    localStorage.setItem(STORAGE_KEY, "kelvin");
    const { result } = renderHook(() => useTempUnit());
    expect(result.current.tempUnit).toBe("C");
  });

  it("persists the unit when it changes", () => {
    const { result } = renderHook(() => useTempUnit());

    act(() => result.current.setTempUnit("F"));

    expect(result.current.tempUnit).toBe("F");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("F");
  });

  describe("convertTemp", () => {
    it("rounds Celsius without converting", () => {
      const { result } = renderHook(() => useTempUnit());
      expect(result.current.convertTemp(21.4)).toBe(21);
      expect(result.current.convertTemp(21.6)).toBe(22);
    });

    it("converts to Fahrenheit once the unit changes", () => {
      const { result } = renderHook(() => useTempUnit());

      act(() => result.current.setTempUnit("F"));

      expect(result.current.convertTemp(0)).toBe(32);
      expect(result.current.convertTemp(100)).toBe(212);
      expect(result.current.convertTemp(-40)).toBe(-40);
    });

    it("returns null for missing data instead of NaN", () => {
      const { result } = renderHook(() => useTempUnit());
      expect(result.current.convertTemp(null)).toBeNull();
    });
  });

  describe("formatTemp", () => {
    it("renders a dash for missing data", () => {
      const { result } = renderHook(() => useTempUnit());
      expect(result.current.formatTemp(null)).toBe("-");
    });

    it("renders the converted value as a string", () => {
      const { result } = renderHook(() => useTempUnit());
      expect(result.current.formatTemp(21.4)).toBe("21");

      act(() => result.current.setTempUnit("F"));
      expect(result.current.formatTemp(0)).toBe("32");
    });

    it("renders 0 rather than treating it as missing", () => {
      const { result } = renderHook(() => useTempUnit());
      expect(result.current.formatTemp(0)).toBe("0");
    });
  });
});
