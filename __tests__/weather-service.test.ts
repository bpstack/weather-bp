import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchWeather } from "@/app/weather/services/weather-service";
import { makeWeather } from "./fixtures/weather";

const MADRID = {
  latitude: 40.41,
  longitude: -3.7,
  cityName: "Madrid",
  country: "ES",
};

afterEach(() => {
  vi.restoreAllMocks();
});

/** Open-Meteo shape: same as the fixture, minus the fields we attach ourselves. */
function apiPayload(overrides: Record<string, unknown> = {}) {
  const rest = { ...makeWeather() } as Record<string, unknown>;
  delete rest.cityName;
  delete rest.country;
  return { ...rest, ...overrides };
}

describe("fetchWeather (success)", () => {
  it("parses a valid response and attaches the city identity", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => apiPayload() });
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchWeather(MADRID);

    expect(data.cityName).toBe("Madrid");
    expect(data.country).toBe("ES");
    expect(data.current.temperature_2m).toBe(22);
    expect(data.timezone).toBe("Europe/Madrid");
  });

  it("requests the coordinates it was given and defaults to 16 days", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => apiPayload() });
    vi.stubGlobal("fetch", fetchMock);

    await fetchWeather(MADRID);

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("latitude=40.41");
    expect(url).toContain("longitude=-3.7");
    expect(url).toContain("forecast_days=16");
    expect(url).toContain("timezone=auto");
  });

  it("honours an explicit day count", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => apiPayload() });
    vi.stubGlobal("fetch", fetchMock);

    await fetchWeather({ ...MADRID, days: 7 });

    expect(String(fetchMock.mock.calls[0][0])).toContain("forecast_days=7");
  });

  it("replaces null hourly readings with 0 so the UI never renders NaN", async () => {
    const payload = apiPayload();
    const hourly = payload.hourly as Record<string, unknown[]>;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...payload,
        hourly: {
          ...hourly,
          precipitation_probability: [null, 20, null],
          wind_gusts_10m: [null, null, null],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchWeather(MADRID);

    expect(data.hourly.precipitation_probability).toEqual([0, 20, 0]);
    expect(data.hourly.wind_gusts_10m).toEqual([0, 0, 0]);
  });

  it("keeps minutely_15 undefined when the API omits it", async () => {
    const payload = apiPayload();
    delete (payload as Record<string, unknown>).minutely_15;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => payload }),
    );

    const data = await fetchWeather(MADRID);

    expect(data.minutely_15).toBeUndefined();
  });
});

describe("fetchWeather", () => {
  it("throws a user-facing message when the API returns a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    await expect(fetchWeather(MADRID)).rejects.toThrow(
      "No se pudieron obtener los datos del tiempo",
    );
  });

  it("propagates AbortError when the request times out", async () => {
    const timeout = new DOMException("Signal timed out.", "TimeoutError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));

    await expect(fetchWeather(MADRID)).rejects.toMatchObject({
      name: "TimeoutError",
    });
  });

  it("throws a Zod validation error when the API returns unexpected shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ unexpected: true }),
      }),
    );

    await expect(fetchWeather(MADRID)).rejects.toThrow();
  });
});
