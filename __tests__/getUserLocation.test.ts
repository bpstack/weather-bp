import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getUserLocation,
  getContinent,
} from "@/app/weather/services/city-utils";

/**
 * Expectations describe what the caller needs to be told, not what the switch
 * currently returns: the error message drives what the user is asked to do, so
 * a wrong branch sends them to the wrong settings screen.
 */

// Real GeolocationPositionError codes; jsdom does not provide the class.
const GEO_CODES = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;

function geoError(code: number) {
  return { ...GEO_CODES, code };
}

function stubGeolocation(
  impl: (
    ok: PositionCallback,
    fail: PositionErrorCallback,
    options?: PositionOptions,
  ) => void,
) {
  const getCurrentPosition = vi.fn(impl);
  vi.stubGlobal("navigator", {
    ...globalThis.navigator,
    geolocation: { getCurrentPosition },
  });
  return getCurrentPosition;
}

function stubDisplayMode({ standalone }: { standalone: boolean }) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: standalone && query.includes("standalone"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

beforeEach(() => {
  stubDisplayMode({ standalone: false });
  // reverseGeocode runs on success; keep it offline and predictable.
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: { city: "Madrid", country: "España", country_code: "es" },
      }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getUserLocation", () => {
  it("reports the browser lacking geolocation rather than throwing", async () => {
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      geolocation: undefined,
    });

    const result = await getUserLocation();

    expect(result.error).toBe("Tu navegador no soporta geolocalización");
    expect(result.city).toBeUndefined();
  });

  it("resolves the coordinates into a city", async () => {
    stubGeolocation((ok) =>
      ok({
        coords: { latitude: 40.41, longitude: -3.7 },
      } as GeolocationPosition),
    );

    const result = await getUserLocation();

    expect(result.error).toBeUndefined();
    expect(result.city?.name).toBe("Madrid");
    expect(result.city?.country_code).toBe("ES");
    expect(result.city?.continent).toBe("Europa");
  });

  it("asks for a cached, low-accuracy fix with a timeout", async () => {
    const getCurrentPosition = stubGeolocation((ok) =>
      ok({ coords: { latitude: 0, longitude: 0 } } as GeolocationPosition),
    );

    await getUserLocation();

    expect(getCurrentPosition.mock.calls[0][2]).toMatchObject({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    });
  });

  describe("error messages", () => {
    it("points a browser user at the address-bar padlock", async () => {
      stubGeolocation((_ok, fail) =>
        fail(geoError(GEO_CODES.PERMISSION_DENIED) as GeolocationPositionError),
      );

      const { error } = await getUserLocation();

      expect(error).toContain("candado");
      expect(error).not.toContain("Ajustes");
    });

    it("points an installed-PWA user at the system settings", async () => {
      stubDisplayMode({ standalone: true });
      stubGeolocation((_ok, fail) =>
        fail(geoError(GEO_CODES.PERMISSION_DENIED) as GeolocationPositionError),
      );

      const { error } = await getUserLocation();

      expect(error).toContain("Ajustes");
      expect(error).not.toContain("candado");
    });

    it("distinguishes an unavailable position from a denied permission", async () => {
      stubGeolocation((_ok, fail) =>
        fail(
          geoError(GEO_CODES.POSITION_UNAVAILABLE) as GeolocationPositionError,
        ),
      );

      const { error } = await getUserLocation();

      expect(error).toContain("GPS");
      expect(error).not.toContain("Permiso denegado");
    });

    it("distinguishes a timeout from a denied permission", async () => {
      stubGeolocation((_ok, fail) =>
        fail(geoError(GEO_CODES.TIMEOUT) as GeolocationPositionError),
      );

      const { error } = await getUserLocation();

      expect(error).toContain("Tiempo de espera");
      expect(error).not.toContain("Permiso denegado");
    });

    it("falls back to a generic message on an unknown geolocation code", async () => {
      stubGeolocation((_ok, fail) =>
        fail(geoError(99) as GeolocationPositionError),
      );

      const { error } = await getUserLocation();

      expect(error).toBe("No se pudo obtener la ubicación");
    });

    // Regression guard. A rejection that is not a GeolocationPositionError
    // has no `code` and no PERMISSION_DENIED constant; reading the codes off
    // the caught value made switch(undefined) match the first case and blame
    // the user's permissions for an unrelated crash.
    it("does not blame permissions for a non-geolocation failure", async () => {
      stubGeolocation(() => {
        throw new TypeError("boom");
      });

      const { error } = await getUserLocation();

      expect(error).toBe("No se pudo obtener la ubicación");
    });

    it("does not blame permissions when the rejection is a plain Error", async () => {
      stubGeolocation((_ok, fail) =>
        fail(new Error("nope") as unknown as GeolocationPositionError),
      );

      const { error } = await getUserLocation();

      expect(error).toBe("No se pudo obtener la ubicación");
    });

    it("does not blame permissions when the rejection is null", async () => {
      stubGeolocation((_ok, fail) =>
        fail(null as unknown as GeolocationPositionError),
      );

      const { error } = await getUserLocation();

      expect(error).toBe("No se pudo obtener la ubicación");
    });

    // A structured-clone or polyfilled error keeps `code` but loses the
    // instance constants. Classifying against those constants would compare
    // 1 against undefined and fall through to the generic message, so the
    // codes are matched against the standard numeric values instead.
    it("classifies by code even when the error lacks the constants", async () => {
      stubGeolocation((_ok, fail) =>
        fail({ code: 1 } as GeolocationPositionError),
      );

      const { error } = await getUserLocation();

      expect(error).toContain("Permiso denegado");
    });

    it("still classifies a real error whose code is 0", async () => {
      // Guarding on `typeof code === "number"` must not reject a falsy 0.
      stubGeolocation((_ok, fail) =>
        fail(geoError(0) as GeolocationPositionError),
      );

      const { error } = await getUserLocation();

      expect(error).toBe("No se pudo obtener la ubicación");
    });
  });
});

describe("getContinent", () => {
  it.each([
    ["ES", "Europa"],
    ["JP", "Asia"],
    ["US", "América"],
    ["AU", "Oceanía"],
    ["EG", "África"],
  ])("maps %s to %s", (code, continent) => {
    expect(getContinent(code)).toBe(continent);
  });

  it("falls back to 'Otros' for an unknown country code", () => {
    expect(getContinent("ZZ")).toBe("Otros");
  });

  it("does not throw on an empty code", () => {
    expect(() => getContinent("")).not.toThrow();
    expect(getContinent("")).toBe("Otros");
  });
});
