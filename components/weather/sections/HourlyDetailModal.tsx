"use client";

import { useEffect, useRef } from "react";
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
import { WeatherIcon } from "@/components/weather/icons/WeatherIcon";

interface HourlyDetailModalProps {
  weather: WeatherData;
  hourIndex: number;
  formatTemp: (temp: number | null) => string;
  onClose: () => void;
}

const WIND_DIRS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
const WIND_DEGS: Record<string, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SO: 225,
  O: 270,
  NO: 315,
};

function windDirection(degrees: number | null): string {
  if (degrees === null || degrees === undefined) return "-";
  return WIND_DIRS[Math.round(degrees / 45) % 8];
}

function hourIsNight(hour: number): boolean {
  return hour < 7 || hour >= 21;
}

export default function HourlyDetailModal({
  weather,
  hourIndex,
  formatTemp,
  onClose,
}: HourlyDetailModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hourly = weather.hourly;
  const timeStr = hourly.time[hourIndex] ?? "";
  const time = timeStr ? new Date(timeStr) : null;

  const hourNum = timeStr ? parseInt(timeStr.slice(11, 13), 10) : 12;
  const night = hourIsNight(hourNum);

  const hourStr = time
    ? time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    : "-";
  const dateStr = time
    ? time.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "-";

  const windDeg = hourly.wind_direction_10m[hourIndex];
  const windDir = windDirection(windDeg);
  const windDegIcon =
    windDeg !== null && windDeg !== undefined
      ? windDeg
      : (WIND_DEGS[windDir] ?? 0);

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
    {
      icon: Thermometer,
      label: "Temperatura",
      value: `${formatTemp(hourly.temperature_2m[hourIndex])}°`,
      colorClass: "text-text-tertiary",
    },
    {
      icon: Thermometer,
      label: "Sensación",
      value: `${formatTemp(hourly.apparent_temperature[hourIndex])}°`,
      colorClass: "text-text-tertiary",
    },
    {
      icon: Droplets,
      label: "Humedad",
      value: `${hourly.relative_humidity_2m[hourIndex] ?? "-"}%`,
      colorClass: "text-rain",
    },
    {
      icon: Cloud,
      label: "Nubes",
      value: `${hourly.cloud_cover[hourIndex] ?? "-"}%`,
      colorClass: "text-text-tertiary",
    },
    {
      icon: Wind,
      label: "Viento",
      value: `${Math.round(hourly.wind_speed_10m[hourIndex] ?? 0)} km/h`,
      colorClass: "text-text-tertiary",
      extra: (
        <span className="inline-flex items-center gap-0.5 text-xs text-text-tertiary ml-1">
          <Navigation
            className="w-3 h-3"
            style={{ transform: `rotate(${windDegIcon}deg)` }}
          />
          {windDir}
        </span>
      ),
    },
    {
      icon: Wind,
      label: "Ráfagas",
      value: `${Math.round(hourly.wind_gusts_10m[hourIndex] ?? 0)} km/h`,
      colorClass: "text-text-tertiary",
    },
    {
      icon: CloudRain,
      label: "Precipitación",
      value: `${hourly.precipitation[hourIndex] ?? 0} mm`,
      colorClass: "text-rain",
    },
    {
      icon: Droplets,
      label: "Prob. lluvia",
      value: `${hourly.precipitation_probability[hourIndex] ?? 0}%`,
      colorClass: "text-rain",
    },
  ];

  const weatherCode = hourly.weather_code[hourIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      onClick={onClose}
    >
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
            <p className="text-lg font-semibold text-text-primary">{hourStr}</p>
            <p className="text-sm text-text-tertiary">
              {dateStr} · Detalle por hora
            </p>
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
            <WeatherIcon code={weatherCode} night={night} size={84} />
            <p
              className="font-extralight text-text-primary"
              style={{ fontSize: 52, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {formatTemp(hourly.temperature_2m[hourIndex])}°
            </p>
            <p className="text-sm text-text-secondary">
              Sensación {formatTemp(hourly.apparent_temperature[hourIndex])}°
            </p>
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
                    <p className="text-[15px] font-medium text-text-primary flex items-center gap-1 flex-wrap">
                      {d.value}
                      {d.extra}
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
