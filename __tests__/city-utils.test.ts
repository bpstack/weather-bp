import { describe, it, expect, vi, afterEach } from "vitest";
import {
  haversineKm,
  reverseGeocode,
  getContinent,
} from "@/app/weather/services/city-utils";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("haversineKm", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineKm(40.4168, -3.7038, 40.4168, -3.7038)).toBe(0);
  });

  it("approximates the Madrid–Barcelona distance (~505 km)", () => {
    const d = haversineKm(40.4168, -3.7038, 41.3874, 2.1686);
    expect(d).toBeGreaterThan(490);
    expect(d).toBeLessThan(520);
  });

  it("is symmetric", () => {
    const a = haversineKm(40.4, -3.7, 48.85, 2.35);
    const b = haversineKm(48.85, 2.35, 40.4, -3.7);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe("reverseGeocode", () => {
  it("maps a Nominatim address into a GeocodingCity", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          address: {
            city: "Madrid",
            country: "España",
            country_code: "es",
          },
        }),
      }),
    );

    const city = await reverseGeocode(40.4168, -3.7038);
    expect(city.name).toBe("Madrid");
    expect(city.country).toBe("España");
    expect(city.country_code).toBe("ES");
    expect(city.continent).toBe(getContinent("ES"));
    expect(city.latitude).toBe(40.4168);
    expect(city.longitude).toBe(-3.7038);
  });

  it("falls back to a coords-only city on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const city = await reverseGeocode(10, 20);
    expect(city.name).toBe("Mi ubicación");
    expect(city.country_code).toBe("XX");
    expect(city.latitude).toBe(10);
    expect(city.longitude).toBe(20);
  });

  it("falls back when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const city = await reverseGeocode(1, 2);
    expect(city.name).toBe("Mi ubicación");
    expect(city.country).toBe("Desconocido");
  });

  it("uses town/village fallbacks when city is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          address: { village: "Pueblo", country_code: "fr" },
        }),
      }),
    );

    const city = await reverseGeocode(48, 2);
    expect(city.name).toBe("Pueblo");
    expect(city.country_code).toBe("FR");
  });
});
