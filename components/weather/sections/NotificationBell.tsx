"use client";

import { Bell, BellOff } from "lucide-react";
import { WeatherData } from "@/app/weather/services/weather-service";
import { useWeatherNotifications } from "@/hooks/useWeatherNotifications";

export default function NotificationBell({ weather }: { weather: WeatherData }) {
  const { permission, enabled, handleBellClick, notificationsSupported } =
    useWeatherNotifications(weather);

  if (!notificationsSupported) return null;

  const isActive = permission === "granted" && enabled;

  return (
    <button
      onClick={handleBellClick}
      className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
      title={
        permission === "default"
          ? "Activar notificaciones de alertas"
          : isActive
            ? "Desactivar notificaciones"
            : "Activar notificaciones"
      }
      aria-label={
        permission === "default"
          ? "Activar notificaciones"
          : isActive
            ? "Desactivar notificaciones"
            : "Activar notificaciones"
      }
    >
      {isActive ? (
        <Bell className="h-4 w-4 text-accent" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
    </button>
  );
}
