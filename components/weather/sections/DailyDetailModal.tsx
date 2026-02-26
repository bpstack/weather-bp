"use client";

import {
  Droplets,
  Wind,
  CloudRain,
  Thermometer,
  X,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import { WeatherData } from "@/app/weather/services/weather-service";
import { getWeatherIcon, getWeatherInfo } from "@/app/weather/services/weather-utils";

interface DailyDetailModalProps {
  weather: WeatherData;
  dayIndex: number;
  convertTemp: (temp: number | null) => string | number;
  onClose: () => void;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "-";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function getWindDirection(degrees: number | null): string {
  if (degrees === null || degrees === undefined) return "-";
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export default function DailyDetailModal({
  weather,
  dayIndex,
  convertTemp,
  onClose,
}: DailyDetailModalProps) {
  const daily = weather.daily;
  const date = daily.time[dayIndex] ? new Date(daily.time[dayIndex]) : null;

  const dayStr = date
    ? date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    : "-";

  const details = [
    {
      icon: Thermometer,
      label: "Máxima",
      value: convertTemp(daily.temperature_2m_max[dayIndex]),
      unit: "°",
    },
    {
      icon: Thermometer,
      label: "Mínima",
      value: convertTemp(daily.temperature_2m_min[dayIndex]),
      unit: "°",
    },
    {
      icon: Thermometer,
      label: "Sensación máx.",
      value: convertTemp(daily.apparent_temperature_max[dayIndex]),
      unit: "°",
    },
    {
      icon: Thermometer,
      label: "Sensación mín.",
      value: convertTemp(daily.apparent_temperature_min[dayIndex]),
      unit: "°",
    },
    {
      icon: Wind,
      label: "Viento máx.",
      value: Math.round(daily.wind_speed_10m_max[dayIndex] ?? 0),
      unit: "km/h",
      subValue: getWindDirection(daily.wind_direction_10m_dominant[dayIndex]),
    },
    {
      icon: Wind,
      label: "Ráfagas máx.",
      value: Math.round(daily.wind_gusts_10m_max[dayIndex] ?? 0),
      unit: "km/h",
    },
    {
      icon: CloudRain,
      label: "Precipitación",
      value: daily.precipitation_sum[dayIndex] ?? 0,
      unit: "mm",
    },
    {
      icon: Droplets,
      label: "Prob. lluvia",
      value: daily.precipitation_probability_max[dayIndex] ?? 0,
      unit: "%",
    },
    {
      icon: Droplets,
      label: "Horas de lluvia",
      value: daily.precipitation_hours[dayIndex] ?? 0,
      unit: "h",
    },
    {
      icon: Sun,
      label: "Índice UV",
      value: Math.round(daily.uv_index_max[dayIndex] ?? 0),
      unit: "",
    },
    {
      icon: Sunrise,
      label: "Amanecer",
      value: daily.sunrise[dayIndex]
        ? new Date(daily.sunrise[dayIndex]).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        : "-",
      unit: "",
    },
    {
      icon: Sunset,
      label: "Atardecer",
      value: daily.sunset[dayIndex]
        ? new Date(daily.sunset[dayIndex]).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        : "-",
      unit: "",
    },
    {
      icon: Sun,
      label: "Horas de sol",
      value: formatDuration(daily.sunshine_duration[dayIndex]),
      unit: "",
    },
    {
      icon: Sun,
      label: "Horas de luz",
      value: formatDuration(daily.daylight_duration[dayIndex]),
      unit: "",
    },
  ];

  const weatherCode = daily.weather_code[dayIndex];
  const weatherInfo = getWeatherInfo(weatherCode ?? 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-layer-1 w-full max-w-sm rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-layer-3 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div>
            <p className="text-lg font-semibold text-text-primary capitalize">
              {dayStr}
            </p>
            <p className="text-sm text-text-tertiary">{weatherInfo.text}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-layer-2 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Weather icon */}
        <div className="flex items-center justify-center gap-4 py-4 px-6">
          <div className="w-16 h-16">
            {getWeatherIcon(weatherCode, "lg")}
          </div>
        </div>

        {/* Details grid */}
        <div className="px-6 pb-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {details.map((detail, index) => {
              const Icon = detail.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-layer-2 rounded-xl"
                >
                  <div className="text-text-tertiary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-tertiary truncate">{detail.label}</p>
                    <p className="text-base font-medium text-text-primary flex items-center gap-1">
                      {detail.value}
                      {detail.unit && <span className="text-sm text-text-tertiary">{detail.unit}</span>}
                      {detail.subValue && (
                        <span className="text-xs text-text-tertiary ml-1 flex items-center">
                          {detail.subValue}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
