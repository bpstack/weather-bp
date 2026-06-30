import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWeatherLocation } from "@/hooks/useWeatherLocation";

const STORAGE_KEY_CITY = "weather-bp-selected-city";
const STORAGE_KEY_MODE = "weather-bp-location-mode";

// Madrid-ish coords; >2km away is Getafe-ish for movement tests.
const POS_MADRID = { coords: { latitude: 40.4168, longitude: -3.7038 } };
const POS_FAR = { coords: { latitude: 40.3, longitude: -3.73 } }; // ~13 km
const POS_NEAR = { coords: { latitude: 40.4172, longitude: -3.704 } }; // <1 km

type WatchCb = (pos: {
  coords: { latitude: number; longitude: number };
}) => void;

let watchCb: WatchCb | null = null;

function mockGeolocation() {
  watchCb = null;
  const geo = {
    getCurrentPosition: vi.fn((success: PositionCallback) =>
      success(POS_MADRID as unknown as GeolocationPosition),
    ),
    watchPosition: vi.fn((success: PositionCallback) => {
      watchCb = success as unknown as WatchCb;
      return 1;
    }),
    clearWatch: vi.fn(),
  };
  Object.defineProperty(navigator, "geolocation", {
    value: geo,
    configurable: true,
  });
  return geo;
}

function mockReverseGeocodeFetch(name = "Madrid") {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: { city: name, country: "España", country_code: "es" },
      }),
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  mockReverseGeocodeFetch();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useWeatherLocation", () => {
  it("auto-locates via GPS on first load (no stored state)", async () => {
    mockGeolocation();
    const { result } = renderHook(() => useWeatherLocation());

    await waitFor(() => expect(result.current.isInitializing).toBe(false));
    expect(result.current.selectedCity?.name).toBe("Madrid");
  });

  it("restores a manually-pinned city without calling GPS", async () => {
    localStorage.setItem(STORAGE_KEY_MODE, "manual");
    localStorage.setItem(
      STORAGE_KEY_CITY,
      JSON.stringify({
        id: 1,
        name: "París",
        latitude: 48.85,
        longitude: 2.35,
        country: "Francia",
        country_code: "FR",
      }),
    );
    const geo = mockGeolocation();

    const { result } = renderHook(() => useWeatherLocation());

    await waitFor(() => expect(result.current.isInitializing).toBe(false));
    expect(result.current.selectedCity?.name).toBe("París");
    expect(geo.getCurrentPosition).not.toHaveBeenCalled();
  });

  it("setSelectedCity switches to manual mode and persists", async () => {
    mockGeolocation();
    const { result } = renderHook(() => useWeatherLocation());
    await waitFor(() => expect(result.current.isInitializing).toBe(false));

    act(() => {
      result.current.setSelectedCity({
        id: 9,
        name: "Roma",
        latitude: 41.9,
        longitude: 12.5,
        country: "Italia",
        country_code: "IT",
      });
    });

    expect(result.current.selectedCity?.name).toBe("Roma");
    expect(localStorage.getItem(STORAGE_KEY_MODE)).toBe("manual");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY_CITY)!).name).toBe(
      "Roma",
    );
  });

  it("requestGeolocation re-enables gps mode and clears the manual pin", async () => {
    localStorage.setItem(STORAGE_KEY_MODE, "manual");
    localStorage.setItem(
      STORAGE_KEY_CITY,
      JSON.stringify({
        id: 1,
        name: "París",
        latitude: 48.85,
        longitude: 2.35,
        country: "Francia",
        country_code: "FR",
      }),
    );
    mockGeolocation();
    const { result } = renderHook(() => useWeatherLocation());
    await waitFor(() => expect(result.current.isInitializing).toBe(false));

    await act(async () => {
      await result.current.requestGeolocation();
    });

    expect(result.current.selectedCity?.name).toBe("Madrid");
    expect(localStorage.getItem(STORAGE_KEY_MODE)).toBe("gps");
    expect(localStorage.getItem(STORAGE_KEY_CITY)).toBeNull();
  });

  it("follows movement: updates city after moving beyond the threshold", async () => {
    mockGeolocation();
    const { result } = renderHook(() => useWeatherLocation());
    await waitFor(() => expect(result.current.isInitializing).toBe(false));

    mockReverseGeocodeFetch("Getafe");
    await act(async () => {
      watchCb?.(POS_FAR);
    });

    await waitFor(() =>
      expect(result.current.selectedCity?.name).toBe("Getafe"),
    );
  });

  it("ignores tiny movements below the threshold", async () => {
    mockGeolocation();
    const { result } = renderHook(() => useWeatherLocation());
    await waitFor(() => expect(result.current.isInitializing).toBe(false));

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ address: { city: "Otra", country_code: "es" } }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await act(async () => {
      watchCb?.(POS_NEAR);
    });

    expect(result.current.selectedCity?.name).toBe("Madrid");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not follow movement while in manual mode", async () => {
    localStorage.setItem(STORAGE_KEY_MODE, "manual");
    localStorage.setItem(
      STORAGE_KEY_CITY,
      JSON.stringify({
        id: 1,
        name: "París",
        latitude: 48.85,
        longitude: 2.35,
        country: "Francia",
        country_code: "FR",
      }),
    );
    mockGeolocation();
    const { result } = renderHook(() => useWeatherLocation());
    await waitFor(() => expect(result.current.isInitializing).toBe(false));

    await act(async () => {
      watchCb?.(POS_FAR);
    });

    expect(result.current.selectedCity?.name).toBe("París");
  });
});
