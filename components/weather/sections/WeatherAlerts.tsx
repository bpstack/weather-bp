"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import { AlertTriangle } from "lucide-react";

interface WeatherAlertsProps {
  weather: WeatherData;
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
  const alerts: { id: string; title: string; description: string }[] = [];

  // Rain
  const rainAlertData = (() => {
    if (!weather?.hourly?.precipitation_probability?.length) return null;
    const prob = weather.hourly.precipitation_probability.slice(0, 3).map((p) => p ?? 0);
    const precip = weather.hourly.precipitation?.slice(0, 3).map((p) => p ?? 0) ?? [];
    const maxProb = Math.max(...prob);
    if (maxProb < THRESHOLDS.rain) return null;
    const maxIndex = prob.findIndex((p) => p === maxProb);
    return { probability: maxProb, amount: precip[maxIndex] ?? 0 };
  })();
  if (rainAlertData) {
    alerts.push({
      id: "rain",
      title: "Lluvia probable",
      description: `${Math.round(rainAlertData.probability)}% · ~${rainAlertData.amount.toFixed(1)} mm`,
    });
  }

  const tempC = weather?.current?.temperature_2m;
  if (tempC != null && tempC >= THRESHOLDS.heat) {
    alerts.push({ id: "heat", title: "Calor extremo", description: `${Math.round(tempC)}°C` });
  }
  if (tempC != null && tempC <= THRESHOLDS.cold) {
    alerts.push({ id: "cold", title: "Frío intenso", description: `${Math.round(tempC)}°C` });
  }

  const weatherCode = weather?.current?.weather_code;
  if (weatherCode != null && weatherCode >= THRESHOLDS.storm) {
    alerts.push({ id: "storm", title: "Tormenta eléctrica", description: "Activa" });
  }
  if (weatherCode != null && weatherCode >= THRESHOLDS.snow && weatherCode <= 77) {
    alerts.push({ id: "snow", title: "Nevando", description: "Activo" });
  }

  const windSpeed = weather?.current?.wind_speed_10m;
  if (windSpeed != null && windSpeed >= THRESHOLDS.wind) {
    alerts.push({ id: "wind", title: "Viento fuerte", description: `${Math.round(windSpeed)} km/h` });
  }

  const uvMax = weather?.daily?.uv_index_max?.[0];
  if (uvMax != null && uvMax >= THRESHOLDS.uv) {
    alerts.push({ id: "uv", title: "UV extremo", description: `Índice ${Math.round(uvMax)}` });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          role="alert"
          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border text-[13px]"
          style={{
            background: "rgba(251,191,36,0.10)",
            borderColor: "rgba(251,191,36,0.33)",
          }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
          <span className="font-medium text-amber-700 dark:text-amber-400">{alert.title}</span>
          <span className="text-text-secondary">{alert.description}</span>
        </div>
      ))}
    </div>
  );
}
