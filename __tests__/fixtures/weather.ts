import type { WeatherData } from "@/app/weather/services/weather-service";

/**
 * Minimal-but-valid WeatherData. Every field the Zod schema requires is here,
 * with calm values that trigger no alert, so each test only has to override
 * the one thing it is about.
 */
export function makeWeather(overrides: DeepPartial<WeatherData> = {}) {
  const base: WeatherData = {
    cityName: "Madrid",
    country: "ES",
    timezone: "Europe/Madrid",
    timezone_abbreviation: "GMT+2",
    utc_offset_seconds: 7200,
    current: {
      time: "2026-08-04T12:00",
      temperature_2m: 22,
      apparent_temperature: 22,
      relative_humidity_2m: 50,
      wind_speed_10m: 10,
      precipitation: 0,
      pressure_msl: 1015,
      weather_code: 0,
      cloud_cover: 10,
      is_day: 1,
    },
    hourly: {
      time: ["2026-08-04T12:00", "2026-08-04T13:00", "2026-08-04T14:00"],
      temperature_2m: [22, 23, 24],
      relative_humidity_2m: [50, 48, 45],
      apparent_temperature: [22, 23, 24],
      precipitation_probability: [0, 0, 0],
      precipitation: [0, 0, 0],
      weather_code: [0, 0, 0],
      cloud_cover: [10, 10, 10],
      visibility: [24000, 24000, 24000],
      wind_speed_10m: [10, 10, 10],
      wind_direction_10m: [180, 180, 180],
      wind_gusts_10m: [15, 15, 15],
    },
    daily: {
      time: ["2026-08-04"],
      temperature_2m_max: [28],
      temperature_2m_min: [16],
      apparent_temperature_max: [29],
      apparent_temperature_min: [15],
      weather_code: [0],
      sunrise: ["2026-08-04T07:10"],
      sunset: ["2026-08-04T21:20"],
      daylight_duration: [51000],
      sunshine_duration: [45000],
      uv_index_max: [6],
      precipitation_sum: [0],
      rain_sum: [0],
      showers_sum: [0],
      snowfall_sum: [0],
      precipitation_hours: [0],
      precipitation_probability_max: [0],
      wind_speed_10m_max: [14],
      wind_gusts_10m_max: [22],
      wind_direction_10m_dominant: [180],
    },
  };

  return mergeDeep(base, overrides);
}

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

function mergeDeep<T>(base: T, patch: DeepPartial<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch as object)) {
    const current = out[key];
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof current === "object" &&
      current !== null &&
      !Array.isArray(current)
    ) {
      out[key] = mergeDeep(current, value as DeepPartial<typeof current>);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as T;
}
