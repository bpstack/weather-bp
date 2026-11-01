"use client";

import { useState, useEffect } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";
import {
  ALERT_THRESHOLDS as THRESHOLDS,
  RAIN_MM,
  NOWCAST_IMMINENT_MIN,
  NOWCAST_WINDOW_MIN,
  UV_EXTREME,
} from "@/app/weather/config/alert-thresholds";
import {
  AlertTriangle,
  Info,
  OctagonAlert,
  type LucideIcon,
} from "lucide-react";

interface WeatherAlertsProps {
  weather: WeatherData;
}

/**
 * info: worth knowing (rain on the way). caution: a nuisance to plan around
 * (wind, cold, snow, very high UV). danger: a real hazard (thunderstorm,
 * extreme heat, extreme UV). Each level differs in colour, icon and a
 * spoken prefix, so it never relies on colour alone.
 */
type Severity = "info" | "caution" | "danger";

const SEVERITY: Record<
  Severity,
  {
    rank: number;
    label: string;
    Icon: LucideIcon;
    box: string;
    icon: string;
    title: string;
  }
> = {
  danger: {
    rank: 0,
    label: "Peligro",
    Icon: OctagonAlert,
    box: "bg-red-500/10 border-red-500/40",
    icon: "text-red-500",
    title: "text-red-700 dark:text-red-400",
  },
  caution: {
    rank: 1,
    label: "Precaución",
    Icon: AlertTriangle,
    box: "bg-amber-400/10 border-amber-400/35",
    icon: "text-amber-500",
    title: "text-amber-700 dark:text-amber-400",
  },
  info: {
    rank: 2,
    label: "Aviso",
    Icon: Info,
    box: "bg-sky-500/10 border-sky-500/30",
    icon: "text-sky-500",
    title: "text-sky-700 dark:text-sky-300",
  },
};

export default function WeatherAlerts({ weather }: WeatherAlertsProps) {
  const alerts: {
    id: string;
    severity: Severity;
    title: string;
    description: string;
  }[] = [];

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
      severity: "info",
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
      severity: "info",
      title: "Lluvia probable",
      description: `${Math.round(rainAlertData.probability)}% · ~${rainAlertData.amount.toFixed(1)} mm`,
    });
  }

  const tempC = weather?.current?.temperature_2m;
  if (tempC != null && tempC >= THRESHOLDS.heat) {
    alerts.push({
      id: "heat",
      severity: "danger",
      title: "Calor extremo",
      description: `${Math.round(tempC)}°C`,
    });
  }
  if (tempC != null && tempC <= THRESHOLDS.cold) {
    alerts.push({
      id: "cold",
      severity: "caution",
      title: "Frío intenso",
      description: `${Math.round(tempC)}°C`,
    });
  }

  const weatherCode = weather?.current?.weather_code;
  if (weatherCode != null && weatherCode >= THRESHOLDS.storm) {
    alerts.push({
      id: "storm",
      severity: "danger",
      title: "Tormenta eléctrica",
      description: "Activa",
    });
  }
  if (
    weatherCode != null &&
    weatherCode >= THRESHOLDS.snow &&
    weatherCode <= THRESHOLDS.snowMax
  ) {
    alerts.push({
      id: "snow",
      severity: "caution",
      title: "Nevando",
      description: "Activo",
    });
  }

  const windSpeed = weather?.current?.wind_speed_10m;
  if (windSpeed != null && windSpeed >= THRESHOLDS.wind) {
    alerts.push({
      id: "wind",
      severity: "caution",
      title: "Viento fuerte",
      description: `${Math.round(windSpeed)} km/h`,
    });
  }

  // Today's peak, named on the WHO scale: 8-10 "very high", 11+ "extreme".
  const uvMax = weather?.daily?.uv_index_max?.[0];
  if (uvMax != null && uvMax >= THRESHOLDS.uv) {
    alerts.push({
      id: "uv",
      severity: Math.round(uvMax) >= UV_EXTREME ? "danger" : "caution",
      title: Math.round(uvMax) >= UV_EXTREME ? "UV extremo" : "UV muy alto",
      description: `Máximo hoy: ${Math.round(uvMax)}`,
    });
  }

  if (alerts.length === 0) return null;

  // Most severe first; equal severities keep their evaluation order.
  const sorted = [...alerts].sort(
    (a, b) => SEVERITY[a.severity].rank - SEVERITY[b.severity].rank,
  );

  return (
    <div className="flex flex-col gap-2 mb-4">
      {sorted.map((alert) => {
        const level = SEVERITY[alert.severity];
        return (
          <div
            key={alert.id}
            role="alert"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border text-[13px] ${level.box}`}
          >
            <span className="sr-only">{level.label}:</span>
            <level.Icon
              aria-hidden="true"
              className={`w-4 h-4 flex-shrink-0 ${level.icon}`}
            />
            <span className={`font-medium ${level.title}`}>{alert.title}</span>
            <span className="text-text-secondary">{alert.description}</span>
          </div>
        );
      })}
    </div>
  );
}
