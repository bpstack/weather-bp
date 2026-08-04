import { z } from "zod";

const airQualitySchema = z.object({
  current: z.object({
    european_aqi: z.number().nullable(),
    pm2_5: z.number().nullable(),
    pm10: z.number().nullable(),
    alder_pollen: z.number().nullable().optional(),
    birch_pollen: z.number().nullable().optional(),
    grass_pollen: z.number().nullable().optional(),
    mugwort_pollen: z.number().nullable().optional(),
    olive_pollen: z.number().nullable().optional(),
    ragweed_pollen: z.number().nullable().optional(),
  }),
});

export interface AirQualityData {
  aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
  /** Highest pollen concentration among available types, grains/m³. */
  pollenMax: number | null;
}

const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

const POLLEN_FIELDS = [
  "alder_pollen",
  "birch_pollen",
  "grass_pollen",
  "mugwort_pollen",
  "olive_pollen",
  "ragweed_pollen",
] as const;

export async function fetchAirQuality({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Promise<AirQualityData> {
  const url = `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10,${POLLEN_FIELDS.join(",")}&timezone=auto`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error("No se pudo obtener la calidad del aire");
  }

  const json = await res.json();
  const { current } = airQualitySchema.parse(json);

  const pollenValues = POLLEN_FIELDS.map((f) => current[f]).filter(
    (v): v is number => typeof v === "number",
  );

  return {
    aqi: current.european_aqi,
    pm2_5: current.pm2_5,
    pm10: current.pm10,
    pollenMax: pollenValues.length ? Math.max(...pollenValues) : null,
  };
}

// European AQI bands (0–100+).
export function getAqiLevel(aqi: number): {
  label: string;
  colorClass: string;
} {
  if (aqi <= 20) return { label: "Buena", colorClass: "text-emerald-500" };
  if (aqi <= 40) return { label: "Aceptable", colorClass: "text-lime-500" };
  if (aqi <= 60) return { label: "Moderada", colorClass: "text-amber-500" };
  if (aqi <= 80) return { label: "Mala", colorClass: "text-orange-500" };
  if (aqi <= 100) return { label: "Muy mala", colorClass: "text-red-500" };
  return { label: "Extrema", colorClass: "text-purple-500" };
}

// Generic pollen bands (grains/m³). Coarse but enough for a qualitative tile.
export function getPollenLevel(value: number): {
  label: string;
  colorClass: string;
} {
  if (value < 10) return { label: "Bajo", colorClass: "text-emerald-500" };
  if (value < 30) return { label: "Moderado", colorClass: "text-amber-500" };
  if (value < 100) return { label: "Alto", colorClass: "text-orange-500" };
  return { label: "Muy alto", colorClass: "text-red-500" };
}
