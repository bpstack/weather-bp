"use client";

import { useEffect, useRef } from "react";
import { Droplets, Wind, Thermometer, X, Sun, Sunrise, Sunset } from "lucide-react";
import { WeatherData } from "@/app/weather/services/weather-service";
import { getWeatherInfo } from "@/app/weather/services/weather-utils";
import { WeatherIcon } from "@/components/weather/icons/WeatherIcon";

interface DailyDetailModalProps {
  weather: WeatherData;
  dayIndex: number;
  formatTemp: (temp: number | null) => string;
  onClose: () => void;
}

const WIND_DIRS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

function windDirection(degrees: number | null): string {
  if (degrees === null || degrees === undefined) return "-";
  return WIND_DIRS[Math.round(degrees / 45) % 8];
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function DailyDetailModal({
  weather,
  dayIndex,
  formatTemp,
  onClose,
}: DailyDetailModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const daily = weather.daily;
  const date = daily.time[dayIndex] ? new Date(daily.time[dayIndex]) : null;

  const dayStr = date
    ? date.toLocaleDateString("es-ES", { weekday: "long" })
    : "-";
  const dateStr = date
    ? date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })
    : "-";

  const weatherCode = daily.weather_code[dayIndex];
  const weatherInfo = getWeatherInfo(weatherCode ?? 0);

  const windDeg = daily.wind_direction_10m_dominant[dayIndex];

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.style.transform = "translateY(100%)";
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.style.transform = "";
        el.classList.add("wx-sheet");
      }, 16);
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const details = [
    { icon: Thermometer, label: "Sensación máx.", value: `${formatTemp(daily.apparent_temperature_max[dayIndex])}°`, colorClass: "text-sun" },
    { icon: Thermometer, label: "Sensación mín.", value: `${formatTemp(daily.apparent_temperature_min[dayIndex])}°`, colorClass: "text-rain" },
    {
      icon: Wind,
      label: "Viento máx.",
      value: `${Math.round(daily.wind_speed_10m_max[dayIndex] ?? 0)} km/h`,
      colorClass: "text-text-tertiary",
      sub: windDirection(windDeg),
    },
    { icon: Wind, label: "Ráfagas máx.", value: `${Math.round(daily.wind_gusts_10m_max[dayIndex] ?? 0)} km/h`, colorClass: "text-text-tertiary" },
    { icon: Droplets, label: "Precipitación", value: `${daily.precipitation_sum[dayIndex] ?? 0} mm`, colorClass: "text-rain" },
    { icon: Droplets, label: "Prob. lluvia", value: `${daily.precipitation_probability_max[dayIndex] ?? 0}%`, colorClass: "text-rain" },
    { icon: Droplets, label: "Horas de lluvia", value: `${daily.precipitation_hours[dayIndex] ?? 0} h`, colorClass: "text-rain" },
    { icon: Sun, label: "Índice UV", value: `${Math.round(daily.uv_index_max[dayIndex] ?? 0)}`, colorClass: "text-sun" },
    {
      icon: Sunrise,
      label: "Amanecer",
      value: daily.sunrise[dayIndex]
        ? new Date(daily.sunrise[dayIndex]!).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        : "-",
      colorClass: "text-sun",
    },
    {
      icon: Sunset,
      label: "Atardecer",
      value: daily.sunset[dayIndex]
        ? new Date(daily.sunset[dayIndex]!).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        : "-",
      colorClass: "text-sun",
    },
    { icon: Sun, label: "Horas de sol", value: formatDuration(daily.sunshine_duration[dayIndex]), colorClass: "text-sun" },
    { icon: Sun, label: "Horas de luz", value: formatDuration(daily.daylight_duration[dayIndex]), colorClass: "text-sun" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        role="button"
        tabIndex={-1}
        aria-label="Cerrar modal"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative bg-layer-1 w-full max-w-lg mx-auto rounded-t-[28px] sm:rounded-[22px] flex flex-col shadow-2xl max-h-[90vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber — solo móvil */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-[38px] h-[5px] rounded-full bg-layer-3" />
        </div>

        {/* Fixed header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle flex-shrink-0">
          <div>
            <p className="text-lg font-semibold text-text-primary capitalize">{dayStr}</p>
            <p className="text-sm text-text-tertiary">{dateStr} · {weatherInfo.text}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-layer-2 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Hero */}
          <div className="flex flex-col items-center py-5 gap-2">
            <WeatherIcon code={weatherCode ?? undefined} size={84} />
            <div className="flex items-baseline gap-2">
              <p className="font-extralight text-text-primary" style={{ fontSize: 52, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {formatTemp(daily.temperature_2m_max[dayIndex])}°
              </p>
              <p className="text-xl text-text-tertiary">
                / {formatTemp(daily.temperature_2m_min[dayIndex])}°
              </p>
            </div>
            <p className="text-sm text-text-secondary">{weatherInfo.text}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {details.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.label}
                  className="glass-card p-3 flex items-center gap-3"
                  style={{ borderRadius: 16 }}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${d.colorClass}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-text-tertiary">{d.label}</p>
                    <p className="text-[15px] font-medium text-text-primary">
                      {d.value}
                      {d.sub && <span className="text-xs text-text-tertiary ml-1">{d.sub}</span>}
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
