"use client";

import {
  Droplets,
  Wind,
  CloudRain,
  Cloud,
  Thermometer,
  X,
  Navigation,
} from "lucide-react";
import { WeatherData } from "@/app/weather/services/weather-service";
import { getWeatherIcon } from "@/app/weather/services/weather-utils";

interface HourlyDetailModalProps {
  weather: WeatherData;
  hourIndex: number;
  convertTemp: (temp: number | null) => string | number;
  onClose: () => void;
}

function getWindDirection(degrees: number | null): string {
  if (degrees === null || degrees === undefined) return "-";
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export default function HourlyDetailModal({
  weather,
  hourIndex,
  convertTemp,
  onClose,
}: HourlyDetailModalProps) {
  const hourly = weather.hourly;
  const time = hourly.time[hourIndex] ? new Date(hourly.time[hourIndex]) : null;
  
  const hourStr = time 
    ? time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    : "-";
  
  const dateStr = time
    ? time.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
    : "-";

  const details = [
    {
      icon: Thermometer,
      label: "Temperatura",
      value: convertTemp(hourly.temperature_2m[hourIndex]),
      unit: "°",
    },
    {
      icon: Thermometer,
      label: "Sensación",
      value: convertTemp(hourly.apparent_temperature[hourIndex]),
      unit: "°",
    },
    {
      icon: Droplets,
      label: "Humedad",
      value: hourly.relative_humidity_2m[hourIndex] ?? "-",
      unit: "%",
    },
    {
      icon: Cloud,
      label: "Nubes",
      value: hourly.cloud_cover[hourIndex] ?? "-",
      unit: "%",
    },
    {
      icon: Wind,
      label: "Viento",
      value: Math.round(hourly.wind_speed_10m[hourIndex] ?? 0),
      unit: "km/h",
      subValue: getWindDirection(hourly.wind_direction_10m[hourIndex]),
    },
    {
      icon: Wind,
      label: "Ráfagas",
      value: Math.round(hourly.wind_gusts_10m[hourIndex] ?? 0),
      unit: "km/h",
    },
    {
      icon: CloudRain,
      label: "Precipitación",
      value: hourly.precipitation[hourIndex] ?? 0,
      unit: "mm",
    },
    {
      icon: Droplets,
      label: "Prob. lluvia",
      value: hourly.precipitation_probability[hourIndex] ?? 0,
      unit: "%",
    },
  ];

  const weatherCode = hourly.weather_code[hourIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar modal"
      />

      {/* Modal */}
      <div
        className="relative bg-layer-1 w-full max-w-sm rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-layer-3 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {hourStr}
            </p>
            <p className="text-sm text-text-tertiary">{dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-layer-2 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Weather icon and main info */}
        <div className="flex items-center justify-center gap-4 py-6 px-6">
          <div className="w-16 h-16">
            {getWeatherIcon(weatherCode, "lg")}
          </div>
        </div>

        {/* Details grid */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {details.map((detail) => {
              const Icon = detail.icon;
              return (
                <div
                  key={detail.label}
                  className="flex items-center gap-3 p-3 bg-layer-2 rounded-xl"
                >
                  <div className="text-text-tertiary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-text-tertiary">{detail.label}</p>
                    <p className="text-base font-medium text-text-primary flex items-center gap-1">
                      {detail.value}
                      <span className="text-sm text-text-tertiary">{detail.unit}</span>
                      {detail.subValue && (
                        <span className="text-xs text-text-tertiary ml-1 flex items-center">
                          <Navigation className="w-3 h-3" style={{ transform: `rotate(${detail.subValue === "N" ? 0 : detail.subValue === "E" ? 90 : detail.subValue === "S" ? 180 : detail.subValue === "W" ? -90 : 0}deg)` }} />
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
