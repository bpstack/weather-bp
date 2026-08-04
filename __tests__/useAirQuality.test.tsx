import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useAirQuality } from "@/hooks/useAirQuality";
import type { GeocodingCity } from "@/app/weather/services/city-utils";

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

const madrid: GeocodingCity = {
  id: 1,
  name: "Madrid",
  latitude: 40.41,
  longitude: -3.7,
  country: "España",
  country_code: "ES",
  continent: "Europa",
};

const tokyo: GeocodingCity = {
  ...madrid,
  id: 2,
  name: "Tokio",
  latitude: 35.68,
  longitude: 139.69,
};

function stubAirQuality(current: Record<string, number | null> = {}) {
  const mock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      current: { european_aqi: 25, pm2_5: 8, pm10: 14, ...current },
    }),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  vi.stubGlobal("console", { ...console, error: vi.fn() });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useAirQuality", () => {
  it("returns null and asks for nothing when there is no city", () => {
    const fetchMock = stubAirQuality();

    const { result } = renderHook(() => useAirQuality(null), { wrapper });

    expect(result.current).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null before the data arrives, never a half-built object", () => {
    stubAirQuality();

    const { result } = renderHook(() => useAirQuality(madrid), { wrapper });

    expect(result.current).toBeNull();
  });

  it("exposes the air quality once loaded", async () => {
    stubAirQuality({ european_aqi: 42 });

    const { result } = renderHook(() => useAirQuality(madrid), { wrapper });

    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current?.aqi).toBe(42);
    expect(result.current?.pm2_5).toBe(8);
  });

  it("queries the coordinates of the city it was given", async () => {
    const fetchMock = stubAirQuality();

    renderHook(() => useAirQuality(madrid), { wrapper });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("latitude=40.41");
    expect(url).toContain("longitude=-3.7");
  });

  it("refetches when the city changes", async () => {
    const fetchMock = stubAirQuality();

    const { result, rerender } = renderHook(
      ({ city }: { city: GeocodingCity }) => useAirQuality(city),
      { wrapper, initialProps: { city: madrid } },
    );

    await waitFor(() => expect(result.current).not.toBeNull());
    expect(String(fetchMock.mock.calls[0][0])).toContain("latitude=40.41");

    rerender({ city: tokyo });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[1][0])).toContain("latitude=35.68");
  });

  describe("failure", () => {
    it("returns null instead of throwing when the request fails", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

      const { result } = renderHook(() => useAirQuality(madrid), { wrapper });

      await waitFor(() => expect(result.current).toBeNull());
      expect(result.current).toBeNull();
    });

    it("does not retry a failing request", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: false });
      vi.stubGlobal("fetch", fetchMock);

      renderHook(() => useAirQuality(madrid), { wrapper });

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      // Air quality is a secondary tile; a retry storm is not worth it.
      await new Promise((r) => setTimeout(r, 150));
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("returns null when the payload does not match the schema", async () => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue({ ok: true, json: async () => ({ nope: 1 }) }),
      );

      const { result } = renderHook(() => useAirQuality(madrid), { wrapper });

      await waitFor(() => expect(result.current).toBeNull());
    });
  });
});
