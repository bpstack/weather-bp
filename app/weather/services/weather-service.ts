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
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    relative_humidity_2m: z.array(z.number()),
    precipitation_probability: z.array(z.number().nullable()),
    precipitation: z.array(z.number().nullable()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number().nullable()),
    temperature_2m_min: z.array(z.number().nullable()),
    weather_code: z.array(z.number().nullable()),
    sunrise: z.array(z.string().nullable()),
    sunset: z.array(z.string().nullable()),
    uv_index_max: z.array(z.number().nullable()),
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
  const url = `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,uv_index_max&forecast_days=${days}&timezone=auto`;


  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error("No se pudieron obtener los datos del tiempo");
  }

  const json = await res.json();

  const normalizeDaily = (arr: Array<number | null> | undefined, fill: number | null = null) => {
    if (!Array.isArray(arr)) return [] as Array<number | null>;
    return arr.map((v) => (v === null ? fill : v));
  };

  const normalizeHourlyNumbers = (arr: Array<number | null> | undefined, fill = 0) => {
    if (!Array.isArray(arr)) return [] as number[];
    return arr.map((v) => (v === null || v === undefined ? fill : v));
  };

  const normalizeHourlyProbability = (arr: Array<number | null> | undefined, fill = 0) => {
    if (!Array.isArray(arr)) return [] as number[];
    return arr.map((v) => (v === null || v === undefined ? fill : v));
  };

  const normalizeHourlyPrecip = (arr: Array<number | null> | undefined, fill = 0) => {
    if (!Array.isArray(arr)) return [] as number[];
    return arr.map((v) => (v === null || v === undefined ? fill : v));
  };

  const safeJson = {
    ...json,
    hourly: {
      ...json.hourly,
      temperature_2m: normalizeHourlyNumbers(json.hourly?.temperature_2m),
      relative_humidity_2m: normalizeHourlyNumbers(json.hourly?.relative_humidity_2m),
      precipitation_probability: normalizeHourlyProbability(json.hourly?.precipitation_probability),
      precipitation: normalizeHourlyPrecip(json.hourly?.precipitation),
    },
    daily: {
      ...json.daily,
      temperature_2m_max: normalizeDaily(json.daily?.temperature_2m_max).map((v) => fillNulls(v)),
      temperature_2m_min: normalizeDaily(json.daily?.temperature_2m_min).map((v) => fillNulls(v)),
      weather_code: normalizeDaily(json.daily?.weather_code).map((v) => fillNulls(v)),
      sunrise: json.daily?.sunrise ?? [],
      sunset: json.daily?.sunset ?? [],
      uv_index_max: normalizeDaily(json.daily?.uv_index_max),
    },
  };


  const parsed = weatherSchema.parse(safeJson);

  return {
    ...parsed,
    cityName,
    country,
  };
}
