"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";

const STORAGE_KEY_LAST_NOTIFIED = "weather-bp-last-notified";
const STORAGE_KEY_OPTED_OUT = "weather-bp-notifications-opted-out";
const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours between notification batches

async function showAlertNotifications(weather: WeatherData): Promise<boolean> {
  if (Notification.permission !== "granted") return false;

  const alerts: string[] = [];
  const temp = Math.round(weather.current.temperature_2m);
  const wind = Math.round(weather.current.wind_speed_10m);
  const code = weather.current.weather_code;
  const rainProb = Math.max(
    ...(weather.hourly.precipitation_probability.slice(0, 3).map((p) => p ?? 0)),
  );

  if (temp >= 35) alerts.push(`Calor extremo: ${temp}°C`);
  if (temp <= 5) alerts.push(`Frío intenso: ${temp}°C`);
  if (wind >= 30) alerts.push(`Viento fuerte: ${wind} km/h`);
  if (code >= 95) alerts.push("Tormenta eléctrica activa");
  if (code >= 71 && code <= 77) alerts.push("Nevando");
  if (rainProb >= 30) alerts.push(`Lluvia probable: ${rainProb}%`);

  if (alerts.length === 0) return false;

  const title = `⚠️ Alertas — ${weather.cityName}`;
  const body = alerts.join(" · ");
  const options: NotificationOptions = {
    body,
    icon: "/icon-192x192.png",
    badge: "/favicon-32x32.png",
    tag: "weather-alert",
  };

  // Prefer SW notification (works when app is backgrounded)
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker
      .getRegistration()
      .catch(() => null);
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
  }

  // Fallback: foreground notification
  new Notification(title, options);
  return true;
}

export function useWeatherNotifications(weather: WeatherData | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window))
      return "denied";
    return Notification.permission;
  });

  // In-app opt-out: user can suppress notifications even when browser grants permission
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY_OPTED_OUT) !== "true";
  });

  const notifiedThisSession = useRef(false);

  const handleBellClick = useCallback(async () => {
    if (!("Notification" in window)) return;

    if (permission === "granted") {
      // Toggle in-app opt-out
      const next = !enabled;
      setEnabled(next);
      localStorage.setItem(STORAGE_KEY_OPTED_OUT, next ? "false" : "true");
      if (next) {
        // Re-enabled: allow immediate notification on next weather load
        notifiedThisSession.current = false;
      }
      return;
    }

    // Browser hasn't decided yet — request permission
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY_OPTED_OUT, "false");
    }
  }, [permission, enabled]);

  // Fire alert notifications when weather loads (with cooldown)
  useEffect(() => {
    if (!weather) return;
    if (!("Notification" in window)) return;
    if (permission !== "granted" || !enabled) return;
    if (notifiedThisSession.current) return;

    const lastNotified = Number(
      localStorage.getItem(STORAGE_KEY_LAST_NOTIFIED) ?? "0",
    );
    if (Date.now() - lastNotified < COOLDOWN_MS) return;

    notifiedThisSession.current = true;
    showAlertNotifications(weather)
      .then((fired) => {
        if (fired) {
          localStorage.setItem(STORAGE_KEY_LAST_NOTIFIED, String(Date.now()));
        }
      })
      .catch(() => {
        notifiedThisSession.current = false;
      });
  }, [weather, permission, enabled]);

  const notificationsSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission !== "denied";

  return { permission, enabled, handleBellClick, notificationsSupported };
}
