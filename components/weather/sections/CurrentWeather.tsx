"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import { getWeatherIcon, getWeatherInfo, icons as defaultIcons } from "@/app/weather/services/weather-utils";

interface Props {
  icons?: typeof defaultIcons;
  weather: WeatherData;
  tempUnit: "C" | "F";
  setTempUnit: (unit: "C" | "F") => void;
  convertTemp: (t: number | null) => number | string;
  getWeatherInfo: typeof getWeatherInfo;
  getWeatherIcon: typeof getWeatherIcon;
}

export default function CurrentWeather({
  icons = defaultIcons,
  weather,
  tempUnit,
  setTempUnit,
  convertTemp,
  getWeatherInfo,
  getWeatherIcon,
}: Props) {
  return (
    <div className="bg-layer-1 border border-layer-3 rounded-lg overflow-hidden">
      <div className={`p-5 bg-gradient-to-r ${getWeatherInfo(weather.current.weather_code ?? null).bg} dark:bg-none`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-5xl font-bold text-text-primary">
                {convertTemp(weather.current.temperature_2m)}°
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setTempUnit("C")}
                  className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
                    tempUnit === "C" ? "bg-accent text-white" : "bg-layer-2 text-text-secondary hover:bg-layer-3"
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit("F")}
                  className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
                    tempUnit === "F" ? "bg-accent text-white" : "bg-layer-2 text-text-secondary hover:bg-layer-3"
                  }`}
                >
                  °F
                </button>
              </div>
            </div>

            <div className={`text-lg font-medium mb-1 ${getWeatherInfo(weather.current.weather_code ?? null).color}`}>
              {getWeatherInfo(weather.current.weather_code ?? null).text}
            </div>

            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <icons.Thermometer className="w-3 h-3" />
              <span>Sensación: {convertTemp(weather.current.apparent_temperature)}°</span>
            </div>
          </div>

           <div className="hidden sm:block">{getWeatherIcon(weather.current.weather_code ?? null, "lg")}</div>

        </div>
      </div>
    </div>
  );
}
