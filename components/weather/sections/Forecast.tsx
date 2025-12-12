"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import { getWeatherIcon, getWeatherInfo } from "@/app/weather/services/weather-utils";

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
    <div className="bg-layer-1 border border-layer-3 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Pronóstico</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setForecastDays(7)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              forecastDays === 7 ? "bg-accent text-white" : "bg-layer-2 text-text-secondary hover:bg-layer-3"
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => setForecastDays(16)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              forecastDays === 16 ? "bg-accent text-white" : "bg-layer-2 text-text-secondary hover:bg-layer-3"
            }`}
          >
            16 días
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {weather.daily.time.slice(0, forecastDays).map((date, i) => {
          const isToday = i === 0;
          return (
            <div
              key={date}
              className={`flex items-center justify-between p-3 rounded-lg transition-all border ${
                isToday ? "bg-accent/5 border-accent/20 dark:bg-accent/10" : "hover:bg-layer-2 border-transparent hover:border-layer-3"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {getWeatherIcon(weather.daily.weather_code[i] ?? null, "sm")}

                <div>
                  <span className="font-medium text-text-primary text-sm block">
                    {isToday
                      ? "Hoy"
                      : new Date(date).toLocaleDateString("es-ES", {
                          weekday: "long",
                        })}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {new Date(date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary hidden md:block">
                  {getWeatherInfo(weather.daily.weather_code[i]).text}
                </span>
                <div className="flex gap-3 text-sm">
                  <span className="font-bold text-text-primary">{convertTemp(weather.daily.temperature_2m_max[i] ?? null)}°</span>
                  <span className="text-text-secondary">{convertTemp(weather.daily.temperature_2m_min[i] ?? null)}°</span>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
