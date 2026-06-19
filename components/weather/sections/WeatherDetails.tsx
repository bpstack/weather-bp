"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import {
  AirQualityData,
  getAqiLevel,
  getPollenLevel,
} from "@/app/weather/services/air-quality";
import {
  Droplets,
  Wind,
  Cloud,
  Gauge,
  Zap,
  Eye,
  Sunrise,
  Sunset,
  Leaf,
  Factory,
} from "lucide-react";

interface Props {
  weather: WeatherData;
  airQuality?: AirQualityData | null;
}

export default function WeatherDetails({ weather, airQuality }: Props) {
  const details = [
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
      icon: Cloud,
      label: "Nubes",
      value: `${weather.current.cloud_cover ?? 0}%`,
      colorClass: "text-text-tertiary",
    },
    {
      icon: Gauge,
      label: "Presión",
      value: `${Math.round(weather.current.pressure_msl)} hPa`,
      colorClass: "text-text-tertiary",
    },
    {
      icon: Zap,
      label: "Índice UV",
      value: Math.round(weather.daily.uv_index_max?.[0] ?? 0).toString(),
      colorClass: "text-sun",
    },
    {
      icon: Eye,
      label: "Precipitación",
      value: `${weather.current.precipitation} mm`,
      colorClass: "text-rain",
    },
    {
      icon: Sunrise,
      label: "Amanecer",
      value: new Date(weather.daily.sunrise?.[0] ?? "").toLocaleTimeString(
        "es-ES",
        { hour: "2-digit", minute: "2-digit" }
      ),
      colorClass: "text-sun",
    },
    {
      icon: Sunset,
      label: "Atardecer",
      value: new Date(weather.daily.sunset?.[0] ?? "").toLocaleTimeString(
        "es-ES",
        { hour: "2-digit", minute: "2-digit" }
      ),
      colorClass: "text-sun",
    },
  ];

  if (airQuality?.aqi != null) {
    const level = getAqiLevel(airQuality.aqi);
    details.push({
      icon: Factory,
      label: "Calidad aire",
      value: `${Math.round(airQuality.aqi)} · ${level.label}`,
      colorClass: level.colorClass,
    });
  }

  if (airQuality?.pollenMax != null) {
    const level = getPollenLevel(airQuality.pollenMax);
    details.push({
      icon: Leaf,
      label: "Polen",
      value: level.label,
      colorClass: level.colorClass,
    });
  }

  return (
    <div className="py-6 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
      <h3
        className="font-semibold text-text-tertiary uppercase mb-4"
        style={{ fontSize: 11.5, letterSpacing: "0.09em" }}
      >
        Detalles
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2.5">
        {details.map(({ icon: Icon, label, value, colorClass }) => (
          <div
            key={label}
            className="glass-card p-4 sm:p-3.5 flex flex-col gap-2 sm:gap-1.5"
            style={{ borderRadius: 18 }}
          >
            <div className="flex items-center gap-1.5">
              <Icon className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${colorClass}`} />
              <span
                className="font-semibold text-text-tertiary uppercase text-[11.5px] sm:text-[10.5px]"
                style={{ letterSpacing: "0.09em" }}
              >
                {label}
              </span>
            </div>
            <span className="text-[21px] sm:text-[18px] font-medium text-text-primary leading-none">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
