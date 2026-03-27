"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import {
  getWeatherIcon,
  getWeatherInfo,
  icons as defaultIcons,
} from "@/app/weather/services/weather-utils";

interface Props {
  weather: WeatherData;
  tempUnit: "C" | "F";
  setTempUnit: (unit: "C" | "F") => void;
  convertTemp: (t: number | null) => number | string;
}

export default function CurrentWeather({
  weather,
  tempUnit,
  setTempUnit,
  convertTemp,
}: Props) {
  const icons = defaultIcons;
  const weatherInfo = getWeatherInfo(weather.current.weather_code ?? null);

  return (
    <div className={`py-8 sm:py-12 px-6 -mx-4 sm:-mx-6 rounded-3xl bg-gradient-to-br ${weatherInfo.bg} dark:bg-none dark:bg-transparent`}>
      <div className="flex flex-row items-start justify-between gap-4">
        {/* Left: Temperature and conditions */}
        <div className="flex-1">
          {/* Temperature display */}
          <div className="flex items-start gap-3 mb-4">
            <span className="text-7xl sm:text-8xl font-extralight tracking-tighter text-text-primary">
              {convertTemp(weather.current.temperature_2m)}
            </span>
            <div className="pt-3 flex flex-col gap-1">
              <div className="flex gap-1">
                <button
                  onClick={() => setTempUnit("C")}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    tempUnit === "C"
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-white/10"
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit("F")}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    tempUnit === "F"
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-white/10"
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
          </div>

          {/* Weather description */}
          <p className={`text-xl sm:text-2xl font-medium mb-2 ${weatherInfo.color} dark:text-text-secondary`}>
            {weatherInfo.text}
          </p>

          {/* Feels like */}
          <p className="text-sm text-text-secondary flex items-center gap-2">
            <icons.Thermometer className="w-4 h-4" />
            Sensación térmica {convertTemp(weather.current.apparent_temperature)}°
          </p>
        </div>

        {/* Right: Weather icon */}
        <div className="flex items-center justify-center pt-2">
          <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
            {getWeatherIcon(weather.current.weather_code ?? null, "lg")}
          </div>
        </div>
      </div>
    </div>
  );
}
