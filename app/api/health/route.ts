export async function GET() {
  const timestamp = new Date().toISOString();

  const services = {
    weather: await checkWeather(),
    air_quality: await checkAirQuality(),
    geocoding: await checkGeocoding(),
    geocoding_osm: await checkGeocodingOSM(),
  };

  const failCount = Object.values(services).filter(
    (s) => s.status === "error",
  ).length;
  const totalServices = Object.keys(services).length;

  const status =
    failCount === 0 ? "ok" : failCount === totalServices ? "down" : "degraded";

  return Response.json(
    {
      status,
      timestamp,
      services,
    },
    { status: status === "ok" ? 200 : 503 },
  );
}

async function checkWeather() {
  const start = Date.now();
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=40.42&longitude=-3.70&current=temperature_2m",
      { signal: AbortSignal.timeout(5000) },
    );
    const latency_ms = Date.now() - start;

    if (!res.ok) {
      return { status: "error", latency_ms, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    if (!data.current || typeof data.current.temperature_2m !== "number") {
      return { status: "error", latency_ms, error: "Respuesta inválida" };
    }

    return { status: "ok", latency_ms };
  } catch (err) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

async function checkAirQuality() {
  const start = Date.now();
  try {
    const res = await fetch(
      "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=40.42&longitude=-3.70&current=european_aqi",
      { signal: AbortSignal.timeout(5000) },
    );
    const latency_ms = Date.now() - start;

    if (!res.ok) {
      return { status: "error", latency_ms, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    if (!data.current || typeof data.current.european_aqi !== "number") {
      return { status: "error", latency_ms, error: "Respuesta inválida" };
    }

    return { status: "ok", latency_ms };
  } catch (err) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

async function checkGeocoding() {
  const start = Date.now();
  try {
    const res = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=Madrid&count=1&language=es&format=json",
      { signal: AbortSignal.timeout(5000) },
    );
    const latency_ms = Date.now() - start;

    if (!res.ok) {
      return { status: "error", latency_ms, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    if (
      !data.results ||
      !Array.isArray(data.results) ||
      data.results.length === 0
    ) {
      return { status: "error", latency_ms, error: "Respuesta inválida" };
    }

    return { status: "ok", latency_ms };
  } catch (err) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

async function checkGeocodingOSM() {
  const start = Date.now();
  try {
    const res = await fetch(
      "https://nominatim.openstreetmap.org/reverse?lat=40.42&lon=-3.70&format=json&accept-language=es",
      { signal: AbortSignal.timeout(5000) },
    );
    const latency_ms = Date.now() - start;

    if (!res.ok) {
      return { status: "error", latency_ms, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    if (!data || typeof data.lat !== "string" || typeof data.lon !== "string") {
      return { status: "error", latency_ms, error: "Respuesta inválida" };
    }

    return { status: "ok", latency_ms };
  } catch (err) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
