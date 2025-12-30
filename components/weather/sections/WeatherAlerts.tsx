"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import {
  CloudRain,
  Thermometer,
  Snowflake,
  Zap,
  Wind,
  Sun,
} from "lucide-react";

interface WeatherAlertsProps {
  weather: WeatherData;
}

interface Alert {
  id: string;
  type: "rain" | "heat" | "cold" | "storm" | "wind" | "uv" | "snow";
  icon: React.ReactNode;
  title: string;
  description: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  dotClass: string;
}

// Thresholds
const THRESHOLDS = {
  rain: 30, // % probability
  heat: 35, // °C
  cold: 5, // °C
  wind: 30, // km/h
  uv: 8, // UV index
  storm: 95, // weather code
  snow: 71, // weather code start
};

export default function WeatherAlerts({ weather }: WeatherAlertsProps) {
  const alerts: Alert[] = [];

  // Rain Alert - Check next 3 hours
  const rainAlert = (() => {
    if (!weather?.hourly?.precipitation_probability?.length) return null;
    const prob = weather.hourly.precipitation_probability
      .slice(0, 3)
      .map((p) => p ?? 0);
    const precip =
      weather.hourly.precipitation?.slice(0, 3).map((p) => p ?? 0) ?? [];

    const maxProb = Math.max(...prob);
    if (maxProb < THRESHOLDS.rain) return null;

    const maxIndex = prob.findIndex((p) => p === maxProb);
    const amount = precip[maxIndex] ?? 0;

    return { probability: maxProb, amount };
  })();

  if (rainAlert) {
    alerts.push({
      id: "rain",
      type: "rain",
      icon: <CloudRain className="w-4 h-4" />,
      title: "Lluvia probable",
      description: `${Math.round(rainAlert.probability)}% probabilidad, ~${rainAlert.amount.toFixed(1)} mm esperados`,
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/30",
      textClass: "text-blue-700 dark:text-blue-200",
      dotClass: "bg-blue-500",
    });
  }

  // Heat Alert
  const tempC = weather?.current?.temperature_2m;
  if (tempC !== undefined && tempC !== null && tempC >= THRESHOLDS.heat) {
    alerts.push({
      id: "heat",
      type: "heat",
      icon: <Thermometer className="w-4 h-4" />,
      title: "Alerta de calor",
      description: `Temperatura actual ${Math.round(tempC)}°C (≥${THRESHOLDS.heat}°C)`,
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      textClass: "text-orange-700 dark:text-orange-200",
      dotClass: "bg-orange-500",
    });
  }

  // Cold Alert
  if (tempC !== undefined && tempC !== null && tempC <= THRESHOLDS.cold) {
    alerts.push({
      id: "cold",
      type: "cold",
      icon: <Snowflake className="w-4 h-4" />,
      title: "Alerta de frío",
      description: `Temperatura actual ${Math.round(tempC)}°C (≤${THRESHOLDS.cold}°C)`,
      bgClass: "bg-cyan-500/10",
      borderClass: "border-cyan-500/30",
      textClass: "text-cyan-700 dark:text-cyan-200",
      dotClass: "bg-cyan-500",
    });
  }

  // Storm Alert (weather_code >= 95)
  const weatherCode = weather?.current?.weather_code;
  if (weatherCode !== undefined && weatherCode >= THRESHOLDS.storm) {
    alerts.push({
      id: "storm",
      type: "storm",
      icon: <Zap className="w-4 h-4" />,
      title: "Tormenta eléctrica",
      description: "Condiciones de tormenta activas en la zona",
      bgClass: "bg-purple-500/10",
      borderClass: "border-purple-500/30",
      textClass: "text-purple-700 dark:text-purple-200",
      dotClass: "bg-purple-500",
    });
  }

  // Snow Alert (weather_code 71-77)
  if (
    weatherCode !== undefined &&
    weatherCode >= THRESHOLDS.snow &&
    weatherCode <= 77
  ) {
    alerts.push({
      id: "snow",
      type: "snow",
      icon: <Snowflake className="w-4 h-4" />,
      title: "Nevando",
      description: "Condiciones de nieve activas",
      bgClass: "bg-sky-500/10",
      borderClass: "border-sky-500/30",
      textClass: "text-sky-700 dark:text-sky-200",
      dotClass: "bg-sky-500",
    });
  }

  // Wind Alert
  const windSpeed = weather?.current?.wind_speed_10m;
  if (windSpeed !== undefined && windSpeed >= THRESHOLDS.wind) {
    alerts.push({
      id: "wind",
      type: "wind",
      icon: <Wind className="w-4 h-4" />,
      title: "Viento fuerte",
      description: `Velocidad actual ${Math.round(windSpeed)} km/h (≥${THRESHOLDS.wind} km/h)`,
      bgClass: "bg-teal-500/10",
      borderClass: "border-teal-500/30",
      textClass: "text-teal-700 dark:text-teal-200",
      dotClass: "bg-teal-500",
    });
  }

  // UV Alert - Check today's max UV
  const uvMax = weather?.daily?.uv_index_max?.[0];
  if (uvMax !== undefined && uvMax !== null && uvMax >= THRESHOLDS.uv) {
    alerts.push({
      id: "uv",
      type: "uv",
      icon: <Sun className="w-4 h-4" />,
      title: "UV extremo",
      description: `Índice UV máximo hoy: ${Math.round(uvMax)} (≥${THRESHOLDS.uv})`,
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/30",
      textClass: "text-amber-700 dark:text-amber-200",
      dotClass: "bg-amber-500",
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${alert.bgClass} border ${alert.borderClass} ${alert.textClass} rounded-lg p-3 flex items-center gap-3 text-xs sm:text-sm`}
          role="alert"
        >
          <span
            className={`w-2 h-2 rounded-full ${alert.dotClass} animate-pulse flex-shrink-0`}
            aria-hidden="true"
          />
          <span className="flex-shrink-0">{alert.icon}</span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{alert.title}</span>
            <span className="opacity-75">{alert.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
