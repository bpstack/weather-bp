"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import {
  getWeatherInfo,
  isNightTime,
} from "@/app/weather/services/weather-utils";
import { WeatherIcon, codeToKey } from "@/components/weather/icons/WeatherIcon";
import { Droplets, Wind, Zap, Thermometer } from "lucide-react";

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
  const weatherInfo = getWeatherInfo(weather.current.weather_code ?? null);
  const night = isNightTime(weather);
  const conditionKey = codeToKey(weather.current.weather_code, night);

  const stats = [
    {
      icon: Droplets,
      label: "Humedad",
      value: `${weather.current.relative_humidity_2m}%`,
      colorClass: "text-rain",
    },
    {
      icon: Wind,
      label: "Viento",
      value: `${Math.round(weather.current.wind_speed_10m)} km/h`,
      colorClass: "text-text-tertiary",
    },
    {
      icon: Zap,
      label: "Índice UV",
      value: Math.round(weather.daily.uv_index_max?.[0] ?? 0).toString(),
      colorClass: "text-sun",
    },
  ];

  return (
    <div className="glass-card p-5 sm:p-6 mb-4">
      {/* Top row: left=temp+unit toggles, right=icon */}
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Left: temperature + unit toggles */}
        <div>
          <div className="flex items-start gap-2">
            <span
              className="font-extralight text-text-primary leading-none"
              style={{ fontSize: 84, letterSpacing: "-0.04em" }}
            >
              {convertTemp(weather.current.temperature_2m)}
            </span>
            <div className="flex flex-col gap-1 mt-2">
              {(["C", "F"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setTempUnit(u)}
                  className={`w-[34px] h-[34px] rounded-full text-sm font-medium transition-all ${
                    tempUnit === u
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/50 dark:hover:bg-white/10"
                  }`}
                >
                  °{u}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-[19px] font-medium text-text-primary mt-1 mb-2">
            {weatherInfo.text}
          </p>

          {/* Feels like */}
          <p className="text-[13px] text-text-secondary flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5" />
            Sensación térmica {convertTemp(weather.current.apparent_temperature)}°
          </p>
        </div>

        {/* Right: animated weather icon 118px */}
        <div className="flex-shrink-0 pt-1">
          <WeatherIcon
            condition={conditionKey}
            night={night}
            size={118}
          />
        </div>
      </div>

      {/* Footer stats row */}
      <div className="flex items-center justify-around pt-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
        {stats.map(({ icon: Icon, label, value, colorClass }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <Icon className={`w-4 h-4 ${colorClass}`} />
            <span className="text-[11px] text-text-tertiary">{label}</span>
            <span className="text-sm font-medium text-text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
