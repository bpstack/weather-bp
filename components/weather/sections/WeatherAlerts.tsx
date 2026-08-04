"use client";

import { useState, useEffect } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";
import {
  ALERT_THRESHOLDS as THRESHOLDS,
  RAIN_MM,
  NOWCAST_IMMINENT_MIN,
  NOWCAST_WINDOW_MIN,
} from "@/app/weather/config/alert-thresholds";
import { AlertTriangle } from "lucide-react";

interface WeatherAlertsProps {
  weather: WeatherData;
}

export default function WeatherAlerts({ weather }: WeatherAlertsProps) {
  const alerts: { id: string; title: string; description: string }[] = [];

  // "Now" as state so render stays pure; refreshes each minute so the rain
  // countdown stays accurate without remounting.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Nowcasting: when does rain start within the next hour? Uses the 15-min
  // resolution block. Times are in the location's local zone, so we shift
  // "now" by the location's UTC offset and treat both as UTC for comparison.
  const nowcast = (() => {
    const m15 = weather?.minutely_15;
    if (!m15?.time?.length) return null;
    const locationNow = now + (weather.utc_offset_seconds ?? 0) * 1000;
    for (let i = 0; i < m15.time.length; i++) {
      const slotMs = Date.parse(`${m15.time[i]}:00Z`);
      if (Number.isNaN(slotMs)) continue;
      const minutes = Math.round((slotMs - locationNow) / 60000);
      if (minutes < 0 || minutes > NOWCAST_WINDOW_MIN) continue;
      if ((m15.precipitation[i] ?? 0) >= RAIN_MM) {
        return { minutes, amount: m15.precipitation[i] ?? 0 };
      }
    }
    return null;
  })();
  // Only flag upcoming rain if it isn't already raining now.
  const alreadyRaining = (weather?.current?.precipitation ?? 0) >= RAIN_MM;
  const showNowcast = nowcast !== null && !alreadyRaining;
  if (nowcast && showNowcast) {
    const { minutes, amount } = nowcast;
    alerts.push({
      id: "nowcast",
      title:
        minutes <= NOWCAST_IMMINENT_MIN ? "Lluvia inminente" : "Lluvia próxima",
      description:
        minutes <= NOWCAST_IMMINENT_MIN
          ? `En unos minutos · ~${amount.toFixed(1)} mm`
          : `En ~${minutes} min · ~${amount.toFixed(1)} mm`,
    });
  }

  // Rain (next 3h probability) — skipped if the more specific nowcast fired.
  const rainAlertData = (() => {
    if (showNowcast) return null;
    if (!weather?.hourly?.precipitation_probability?.length) return null;
    const prob = weather.hourly.precipitation_probability
      .slice(0, 3)
      .map((p) => p ?? 0);
    const precip =
      weather.hourly.precipitation?.slice(0, 3).map((p) => p ?? 0) ?? [];
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
    alerts.push({
      id: "heat",
      title: "Calor extremo",
      description: `${Math.round(tempC)}°C`,
    });
  }
  if (tempC != null && tempC <= THRESHOLDS.cold) {
    alerts.push({
      id: "cold",
      title: "Frío intenso",
      description: `${Math.round(tempC)}°C`,
    });
  }

  const weatherCode = weather?.current?.weather_code;
  if (weatherCode != null && weatherCode >= THRESHOLDS.storm) {
    alerts.push({
      id: "storm",
      title: "Tormenta eléctrica",
      description: "Activa",
    });
  }
  if (
    weatherCode != null &&
    weatherCode >= THRESHOLDS.snow &&
    weatherCode <= THRESHOLDS.snowMax
  ) {
    alerts.push({ id: "snow", title: "Nevando", description: "Activo" });
  }

  const windSpeed = weather?.current?.wind_speed_10m;
  if (windSpeed != null && windSpeed >= THRESHOLDS.wind) {
    alerts.push({
      id: "wind",
      title: "Viento fuerte",
      description: `${Math.round(windSpeed)} km/h`,
    });
  }

  const uvMax = weather?.daily?.uv_index_max?.[0];
  if (uvMax != null && uvMax >= THRESHOLDS.uv) {
    alerts.push({
      id: "uv",
      title: "UV extremo",
      description: `Índice ${Math.round(uvMax)}`,
    });
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
          <span className="font-medium text-amber-700 dark:text-amber-400">
            {alert.title}
          </span>
          <span className="text-text-secondary">{alert.description}</span>
        </div>
      ))}
    </div>
  );
}
