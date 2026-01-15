"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import {
  getWeatherIcon,
  getWeatherInfo,
} from "@/app/weather/services/weather-utils";

interface Props {
  weather: WeatherData;
  forecastDays: 7 | 16;
  setForecastDays: (d: 7 | 16) => void;
  convertTemp: (t: number | null) => number | string;
  getWeatherInfo: typeof getWeatherInfo;
  getWeatherIcon: typeof getWeatherIcon;
}

export default function Forecast({
  weather,
  forecastDays,
  setForecastDays,
  convertTemp,
  getWeatherInfo,
  getWeatherIcon,
}: Props) {
  return (
    <div className="py-6 border-t border-border-subtle">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
          Pronóstico
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setForecastDays(7)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              forecastDays === 7
                ? "bg-accent text-white"
                : "text-text-tertiary hover:text-text-primary hover:bg-layer-2"
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => setForecastDays(16)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              forecastDays === 16
                ? "bg-accent text-white"
                : "text-text-tertiary hover:text-text-primary hover:bg-layer-2"
            }`}
          >
            16 días
          </button>
        </div>
      </div>

      {/* Forecast list */}
      <div className="space-y-0">
        {weather.daily.time.slice(0, forecastDays).map((date, i) => {
          const isToday = i === 0;
          const weatherInfo = getWeatherInfo(weather.daily.weather_code[i]);

          return (
            <div
              key={date}
              className={`flex items-center justify-between py-4 ${
                i !== 0 ? "border-t border-border-subtle" : ""
              }`}
            >
              {/* Left: Day and date */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-8 h-8 flex items-center justify-center opacity-60">
                  {getWeatherIcon(weather.daily.weather_code[i] ?? null, "sm")}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      isToday ? "font-semibold" : "font-medium"
                    } text-text-primary`}
                  >
                    {isToday
                      ? "Hoy"
                      : new Date(date).toLocaleDateString("es-ES", {
                          weekday: "long",
                        })}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {new Date(date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>

                <p className="hidden sm:block text-sm text-text-secondary flex-shrink-0">
                  {weatherInfo.text}
                </p>
              </div>

              {/* Right: Temperatures */}
              <div className="flex items-center gap-4 ml-6">
                <span className="text-base font-semibold text-text-primary">
                  {convertTemp(weather.daily.temperature_2m_max[i] ?? null)}°
                </span>
                <span className="text-base text-text-tertiary w-10 text-right">
                  {convertTemp(weather.daily.temperature_2m_min[i] ?? null)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
