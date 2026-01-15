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
  color: string;
}

const THRESHOLDS = {
  rain: 30,
  heat: 35,
  cold: 5,
  wind: 30,
  uv: 8,
  storm: 95,
  snow: 71,
};

export default function WeatherAlerts({ weather }: WeatherAlertsProps) {
  const alerts: Alert[] = [];

  // Rain Alert
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
      description: `${Math.round(rainAlert.probability)}% · ~${rainAlert.amount.toFixed(1)} mm`,
      color: "text-blue-600 dark:text-blue-400",
    });
  }

  // Heat Alert
  const tempC = weather?.current?.temperature_2m;
  if (tempC !== undefined && tempC !== null && tempC >= THRESHOLDS.heat) {
    alerts.push({
      id: "heat",
      type: "heat",
      icon: <Thermometer className="w-4 h-4" />,
      title: "Calor extremo",
      description: `${Math.round(tempC)}°C`,
      color: "text-orange-600 dark:text-orange-400",
    });
  }

  // Cold Alert
  if (tempC !== undefined && tempC !== null && tempC <= THRESHOLDS.cold) {
    alerts.push({
      id: "cold",
      type: "cold",
      icon: <Snowflake className="w-4 h-4" />,
      title: "Frío intenso",
      description: `${Math.round(tempC)}°C`,
      color: "text-cyan-600 dark:text-cyan-400",
    });
  }

  // Storm Alert
  const weatherCode = weather?.current?.weather_code;
  if (weatherCode !== undefined && weatherCode >= THRESHOLDS.storm) {
    alerts.push({
      id: "storm",
      type: "storm",
      icon: <Zap className="w-4 h-4" />,
      title: "Tormenta eléctrica",
      description: "Activa",
      color: "text-purple-600 dark:text-purple-400",
    });
  }

  // Snow Alert
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
      description: "Activo",
      color: "text-sky-600 dark:text-sky-400",
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
      description: `${Math.round(windSpeed)} km/h`,
      color: "text-teal-600 dark:text-teal-400",
    });
  }

  // UV Alert
  const uvMax = weather?.daily?.uv_index_max?.[0];
  if (uvMax !== undefined && uvMax !== null && uvMax >= THRESHOLDS.uv) {
    alerts.push({
      id: "uv",
      type: "uv",
      icon: <Sun className="w-4 h-4" />,
      title: "UV extremo",
      description: `Índice ${Math.round(uvMax)}`,
      color: "text-amber-600 dark:text-amber-400",
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 py-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-layer-2 text-sm ${alert.color}`}
          role="alert"
        >
          <span className="flex-shrink-0">{alert.icon}</span>
          <span className="font-medium">{alert.title}</span>
          <span className="text-text-tertiary">{alert.description}</span>
        </div>
      ))}
    </div>
  );
}
