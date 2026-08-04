import { describe, it, expect, vi, afterEach } from "vitest";
import {
  fetchAirQuality,
  getAqiLevel,
  getPollenLevel,
} from "@/app/weather/services/air-quality";

const MADRID = { latitude: 40.41, longitude: -3.7 };

/** Shape of the upstream response; tests override only what they care about. */
function apiPayload(current: Record<string, number | null> = {}) {
  return {
    current: {
      european_aqi: 25,
      pm2_5: 8,
      pm10: 14,
      alder_pollen: 0,
      birch_pollen: 0,
      grass_pollen: 0,
      mugwort_pollen: 0,
      olive_pollen: 0,
      ragweed_pollen: 0,
      ...current,
    },
  };
}

function stubFetch(payload: unknown, ok = true) {
  const mock = vi.fn().mockResolvedValue({ ok, json: async () => payload });
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchAirQuality", () => {
  it("maps the response onto the flat AirQualityData shape", async () => {
    stubFetch(apiPayload({ european_aqi: 42, pm2_5: 11.5, pm10: 20 }));

    const data = await fetchAirQuality(MADRID);

    expect(data.aqi).toBe(42);
    expect(data.pm2_5).toBe(11.5);
    expect(data.pm10).toBe(20);
  });

  it("requests the coordinates it was given", async () => {
    const mock = stubFetch(apiPayload());

    await fetchAirQuality(MADRID);

    const url = String(mock.mock.calls[0][0]);
    expect(url).toContain("latitude=40.41");
    expect(url).toContain("longitude=-3.7");
    expect(url).toContain("timezone=auto");
  });

  it("throws a user-facing message on a non-ok response", async () => {
    stubFetch(null, false);

    await expect(fetchAirQuality(MADRID)).rejects.toThrow(
      "No se pudo obtener la calidad del aire",
    );
  });

  it("rejects a response that does not match the schema", async () => {
    stubFetch({ unexpected: true });

    await expect(fetchAirQuality(MADRID)).rejects.toThrow();
  });

  it("propagates a timeout instead of swallowing it", async () => {
    const timeout = new DOMException("Signal timed out.", "TimeoutError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));

    await expect(fetchAirQuality(MADRID)).rejects.toMatchObject({
      name: "TimeoutError",
    });
  });

  it("accepts a null AQI, which the API is allowed to return", async () => {
    stubFetch(apiPayload({ european_aqi: null, pm2_5: null, pm10: null }));

    const data = await fetchAirQuality(MADRID);

    expect(data.aqi).toBeNull();
    expect(data.pm2_5).toBeNull();
    expect(data.pm10).toBeNull();
  });

  describe("pollenMax", () => {
    it("takes the highest pollen type, not the first", async () => {
      stubFetch(
        apiPayload({
          alder_pollen: 3,
          birch_pollen: 87,
          grass_pollen: 12,
          olive_pollen: 40,
        }),
      );

      expect((await fetchAirQuality(MADRID)).pollenMax).toBe(87);
    });

    it("ignores null pollen types when picking the max", async () => {
      stubFetch(
        apiPayload({
          alder_pollen: null,
          birch_pollen: 5,
          grass_pollen: null,
          mugwort_pollen: 22,
          olive_pollen: null,
          ragweed_pollen: null,
        }),
      );

      expect((await fetchAirQuality(MADRID)).pollenMax).toBe(22);
    });

    it("returns null (never -Infinity) when every pollen type is null", async () => {
      stubFetch(
        apiPayload({
          alder_pollen: null,
          birch_pollen: null,
          grass_pollen: null,
          mugwort_pollen: null,
          olive_pollen: null,
          ragweed_pollen: null,
        }),
      );

      const { pollenMax } = await fetchAirQuality(MADRID);

      // Math.max() of an empty array is -Infinity; the guard must hold.
      expect(pollenMax).toBeNull();
      expect(pollenMax).not.toBe(-Infinity);
    });

    it("returns null when the API omits the pollen fields entirely", async () => {
      stubFetch({ current: { european_aqi: 25, pm2_5: 8, pm10: 14 } });

      const { pollenMax } = await fetchAirQuality(MADRID);

      expect(pollenMax).toBeNull();
      expect(Number.isFinite(pollenMax as number)).toBe(false);
    });

    it("keeps a legitimate zero rather than treating it as missing", async () => {
      stubFetch(apiPayload()); // all pollen types at 0

      expect((await fetchAirQuality(MADRID)).pollenMax).toBe(0);
    });
  });
});

describe("getAqiLevel", () => {
  // European AQI bands, pinned at their exact boundaries: an off-by-one here
  // silently mislabels air quality, with no error anywhere.
  it.each([
    [0, "Buena"],
    [20, "Buena"],
    [21, "Aceptable"],
    [40, "Aceptable"],
    [41, "Moderada"],
    [60, "Moderada"],
    [61, "Mala"],
    [80, "Mala"],
    [81, "Muy mala"],
    [100, "Muy mala"],
    [101, "Extrema"],
    [300, "Extrema"],
  ])("labels AQI %i as %s", (aqi, label) => {
    expect(getAqiLevel(aqi).label).toBe(label);
  });

  it("always returns a tailwind colour class", () => {
    for (const aqi of [0, 20, 21, 40, 41, 60, 61, 80, 81, 100, 101, 500]) {
      expect(getAqiLevel(aqi).colorClass).toMatch(/^text-/);
    }
  });

  it("gives each band its own colour", () => {
    const colours = [10, 30, 50, 70, 90, 150].map(
      (aqi) => getAqiLevel(aqi).colorClass,
    );
    expect(new Set(colours).size).toBe(colours.length);
  });
});

describe("getAqiLevel — adversarial input", () => {
  // The API types european_aqi as nullable but never negative. If a bad
  // reading ever got through, "Buena" would be actively misleading.
  it.fails("should not report a negative AQI as good air", () => {
    expect(getAqiLevel(-10).label).not.toBe("Buena");
  });

  it("does not throw on NaN", () => {
    expect(() => getAqiLevel(NaN)).not.toThrow();
  });
});

describe("getPollenLevel", () => {
  // Note these bands are exclusive (<), unlike the AQI ones (<=).
  it.each([
    [0, "Bajo"],
    [9.9, "Bajo"],
    [10, "Moderado"],
    [29.9, "Moderado"],
    [30, "Alto"],
    [99.9, "Alto"],
    [100, "Muy alto"],
    [1000, "Muy alto"],
  ])("labels pollen %s as %s", (value, label) => {
    expect(getPollenLevel(value).label).toBe(label);
  });

  it("always returns a tailwind colour class", () => {
    for (const value of [0, 10, 30, 100, 5000]) {
      expect(getPollenLevel(value).colorClass).toMatch(/^text-/);
    }
  });
});
