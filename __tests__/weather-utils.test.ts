import { describe, it, expect } from "vitest";
import {
  isNightTime,
  getWeatherBackground,
  getWeatherInfo,
} from "@/app/weather/services/weather-utils";
import type { WeatherData } from "@/app/weather/services/weather-service";
import { makeWeather } from "./fixtures/weather";

/** Simulates an API response that omits is_day, which the fixture always sets. */
function withoutIsDay(weather: WeatherData): WeatherData {
  const current = { ...weather.current } as Partial<WeatherData["current"]>;
  delete current.is_day;
  return { ...weather, current } as WeatherData;
}

describe("isNightTime", () => {
  it("trusts the API is_day flag over the clock", () => {
    // Noon, but the API says it is night (polar night, bad clock…).
    const weather = makeWeather({
      current: { is_day: 0, time: "2026-08-04T12:00" },
    });
    expect(isNightTime(weather)).toBe(true);
  });

  it("reports day when is_day is 1", () => {
    expect(isNightTime(makeWeather({ current: { is_day: 1 } }))).toBe(false);
  });

  it("falls back to sunrise/sunset when is_day is absent", () => {
    const atHour = (hour: string) =>
      withoutIsDay(
        makeWeather({
          current: { time: `2026-08-04T${hour}:00` },
          daily: {
            sunrise: ["2026-08-04T07:10"],
            sunset: ["2026-08-04T21:20"],
          },
        }),
      );

    expect(isNightTime(atHour("05"))).toBe(true); // before sunrise
    expect(isNightTime(atHour("12"))).toBe(false); // midday
    expect(isNightTime(atHour("22"))).toBe(true); // after sunset
  });

  it("uses 07:00-20:00 defaults when sunrise/sunset are missing", () => {
    const atHour = (hour: string) =>
      withoutIsDay(
        makeWeather({
          current: { time: `2026-08-04T${hour}:00` },
          daily: { sunrise: [], sunset: [] },
        }),
      );

    expect(isNightTime(atHour("06"))).toBe(true);
    expect(isNightTime(atHour("07"))).toBe(false);
    expect(isNightTime(atHour("20"))).toBe(true);
  });
});

describe("getWeatherBackground", () => {
  it("returns a different gradient per theme for the same condition", () => {
    const light = getWeatherBackground("rain", false);
    const dark = getWeatherBackground("rain", true);

    expect(light).toContain("linear-gradient");
    expect(light).not.toBe(dark);
  });

  it("falls back to the cloudy palette for an unknown condition", () => {
    expect(getWeatherBackground("not-a-condition", false)).toBe(
      getWeatherBackground("cloudy", false),
    );
  });

  it("emits no literal 'undefined' in the gradient", () => {
    for (const key of ["clear-day", "thunder", "snow", "fog", "nonsense"]) {
      for (const dark of [true, false]) {
        expect(getWeatherBackground(key, dark)).not.toContain("undefined");
      }
    }
  });
});

describe("getWeatherInfo", () => {
  it("labels a null code as unknown instead of throwing", () => {
    expect(getWeatherInfo(null).text).toBe("Desconocido");
  });

  it("maps the clear-sky code", () => {
    expect(getWeatherInfo(0).text).toBe("Despejado");
  });

  it("always returns text, color and bg", () => {
    for (const code of [0, 1, 2, 3, 45, 61, 71, 95, 99, 12345]) {
      const info = getWeatherInfo(code);
      expect(info.text).toBeTruthy();
      expect(info.color).toBeTruthy();
      expect(info.bg).toBeTruthy();
    }
  });
});
