import { z } from "zod";

const weatherSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    relative_humidity_2m: z.number(),
    wind_speed_10m: z.number(),
    precipitation: z.number(),
    pressure_msl: z.number(),
    weather_code: z.number(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number().nullable()),
    temperature_2m_min: z.array(z.number().nullable()),
    weather_code: z.array(z.number().nullable()),
  }),
});

export type WeatherData = z.infer<typeof weatherSchema> & {
  cityName: string;
  country: string;
};

interface FetchWeatherArgs {
  latitude: number;
  longitude: number;
  cityName: string;
  country: string;
  days?: 16 | 7;
}

const fillNulls = (value: number | null | undefined, fallback: number | null = null) =>
  value === null || value === undefined ? fallback : value;

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather({
  latitude,
  longitude,
  cityName,
  country,
  days = 16,
}: FetchWeatherArgs): Promise<WeatherData> {
  const url = `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=${days}&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error("No se pudieron obtener los datos del tiempo");
  }

  const json = await res.json();

  // Algunas ubicaciones devuelven null en daily; normalizamos a number | null y rellenamos si es necesario
  const normalizeDaily = (arr: Array<number | null> | undefined, fill: number | null = null) => {
    if (!Array.isArray(arr)) return [] as Array<number | null>;
    return arr.map((v) => (v === null ? fill : v));
  };

  const safeJson = {
    ...json,
    daily: {
      ...json.daily,
      temperature_2m_max: normalizeDaily(json.daily?.temperature_2m_max).map((v) => fillNulls(v)),
      temperature_2m_min: normalizeDaily(json.daily?.temperature_2m_min).map((v) => fillNulls(v)),
      weather_code: normalizeDaily(json.daily?.weather_code).map((v) => fillNulls(v)),
    },
  };

  const parsed = weatherSchema.parse(safeJson);

  return {
    ...parsed,
    cityName,
    country,
  };
}
