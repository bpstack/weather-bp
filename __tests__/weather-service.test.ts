import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchWeather } from "@/app/weather/services/weather-service";

const MADRID = {
  latitude: 40.41,
  longitude: -3.7,
  cityName: "Madrid",
  country: "ES",
};

afterEach(() => {
  vi.restoreAllMocks();
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
