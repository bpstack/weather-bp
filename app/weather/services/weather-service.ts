import { z } from "zod";

const weatherSchema = z.object({
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  utc_offset_seconds: z.number(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    relative_humidity_2m: z.number(),
    wind_speed_10m: z.number(),
    precipitation: z.number(),
    pressure_msl: z.number(),
    weather_code: z.number(),
    cloud_cover: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    relative_humidity_2m: z.array(z.number()),
    apparent_temperature: z.array(z.number().nullable()),
    precipitation_probability: z.array(z.number().nullable()),
    precipitation: z.array(z.number().nullable()),
    weather_code: z.array(z.number()),
    cloud_cover: z.array(z.number().nullable()),
    wind_speed_10m: z.array(z.number().nullable()),
    wind_direction_10m: z.array(z.number().nullable()),
    wind_gusts_10m: z.array(z.number().nullable()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number().nullable()),
    temperature_2m_min: z.array(z.number().nullable()),
    apparent_temperature_max: z.array(z.number().nullable()),
    apparent_temperature_min: z.array(z.number().nullable()),
    weather_code: z.array(z.number().nullable()),
    sunrise: z.array(z.string().nullable()),
    sunset: z.array(z.string().nullable()),
    daylight_duration: z.array(z.number().nullable()),
    sunshine_duration: z.array(z.number().nullable()),
    uv_index_max: z.array(z.number().nullable()),
    precipitation_sum: z.array(z.number().nullable()),
    rain_sum: z.array(z.number().nullable()),
    showers_sum: z.array(z.number().nullable()),
    snowfall_sum: z.array(z.number().nullable()),
    precipitation_hours: z.array(z.number().nullable()),
    precipitation_probability_max: z.array(z.number().nullable()),
    wind_speed_10m_max: z.array(z.number().nullable()),
    wind_gusts_10m_max: z.array(z.number().nullable()),
    wind_direction_10m_dominant: z.array(z.number().nullable()),
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

const fillNulls = (
  value: number | null | undefined,
  fallback: number | null = null,
) => (value === null || value === undefined ? fallback : value);

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather({
  latitude,
  longitude,
  cityName,
  country,
  days = 16,
}: FetchWeatherArgs): Promise<WeatherData> {
  const url = `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl,cloud_cover&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,weather_code,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&forecast_days=${days}&timezone=auto`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error("No se pudieron obtener los datos del tiempo");
  }

  const json = await res.json();

  const normalizeDaily = (
    arr: Array<number | null> | undefined,
    fill: number | null = null,
  ) => {
    if (!Array.isArray(arr)) return [] as Array<number | null>;
    return arr.map((v) => (v === null ? fill : v));
  };

  const normalizeHourlyNumbers = (
    arr: Array<number | null> | undefined,
    fill = 0,
  ) => {
    if (!Array.isArray(arr)) return [] as number[];
    return arr.map((v) => (v === null || v === undefined ? fill : v));
  };

  const safeJson = {
    ...json,
    hourly: {
      ...json.hourly,
      temperature_2m: normalizeHourlyNumbers(json.hourly?.temperature_2m),
      relative_humidity_2m: normalizeHourlyNumbers(
        json.hourly?.relative_humidity_2m,
      ),
      apparent_temperature: normalizeHourlyNumbers(
        json.hourly?.apparent_temperature,
      ),
      precipitation_probability: normalizeHourlyNumbers(
        json.hourly?.precipitation_probability,
      ),
      precipitation: normalizeHourlyNumbers(json.hourly?.precipitation),
      weather_code: normalizeHourlyNumbers(json.hourly?.weather_code),
      cloud_cover: normalizeHourlyNumbers(json.hourly?.cloud_cover),
      wind_speed_10m: normalizeHourlyNumbers(json.hourly?.wind_speed_10m),
      wind_direction_10m: normalizeHourlyNumbers(
        json.hourly?.wind_direction_10m,
      ),
      wind_gusts_10m: normalizeHourlyNumbers(json.hourly?.wind_gusts_10m),
    },
    daily: {
      ...json.daily,
      temperature_2m_max: normalizeDaily(json.daily?.temperature_2m_max).map(
        (v) => fillNulls(v),
      ),
      temperature_2m_min: normalizeDaily(json.daily?.temperature_2m_min).map(
        (v) => fillNulls(v),
      ),
      apparent_temperature_max: normalizeDaily(json.daily?.apparent_temperature_max),
      apparent_temperature_min: normalizeDaily(json.daily?.apparent_temperature_min),
      weather_code: normalizeDaily(json.daily?.weather_code).map((v) =>
        fillNulls(v),
      ),
      sunrise: json.daily?.sunrise ?? [],
      sunset: json.daily?.sunset ?? [],
      daylight_duration: normalizeDaily(json.daily?.daylight_duration),
      sunshine_duration: normalizeDaily(json.daily?.sunshine_duration),
      uv_index_max: normalizeDaily(json.daily?.uv_index_max),
      precipitation_sum: normalizeDaily(json.daily?.precipitation_sum),
      rain_sum: normalizeDaily(json.daily?.rain_sum),
      showers_sum: normalizeDaily(json.daily?.showers_sum),
      snowfall_sum: normalizeDaily(json.daily?.snowfall_sum),
      precipitation_hours: normalizeDaily(json.daily?.precipitation_hours),
      precipitation_probability_max: normalizeDaily(json.daily?.precipitation_probability_max),
      wind_speed_10m_max: normalizeDaily(json.daily?.wind_speed_10m_max),
      wind_gusts_10m_max: normalizeDaily(json.daily?.wind_gusts_10m_max),
      wind_direction_10m_dominant: normalizeDaily(json.daily?.wind_direction_10m_dominant),
    },
  };

  const parsed = weatherSchema.parse(safeJson);

  return {
    ...parsed,
    cityName,
    country,
  };
}
