"use client";

import { useState } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";
import {
  getWeatherInfo,
  parseLocalDate,
} from "@/app/weather/services/weather-utils";
import { WeatherIcon } from "@/components/weather/icons/WeatherIcon";
import DailyDetailModal from "./DailyDetailModal";

interface Props {
  weather: WeatherData;
  forecastDays: 7 | 16;
  setForecastDays: (d: 7 | 16) => void;
  formatTemp: (t: number | null) => string;
}

export default function Forecast({
  weather,
  forecastDays,
  setForecastDays,
  formatTemp,
}: Props) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Open-Meteo leaves the last day null when the model run ends before that
  // local day does (seen for UTC+ cities at 16 days). A day without data is
  // dropped rather than drawn as 0°, and kept out of the shared scale.
  const days = weather.daily.time.slice(0, forecastDays).flatMap((date, i) => {
    const max = weather.daily.temperature_2m_max[i];
    const min = weather.daily.temperature_2m_min[i];
    return max == null || min == null ? [] : [{ date, i, max, min }];
  });

  // Shared min/max for the range bars, from the days actually listed.
  const weekMax = Math.max(...days.map((d) => d.max));
  const weekMin = Math.min(...days.map((d) => d.min));
  const weekSpan = weekMax - weekMin || 1;

  return (
    <div className="py-6 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="font-semibold text-text-tertiary uppercase"
          style={{ fontSize: 11.5, letterSpacing: "0.09em" }}
        >
          Pronóstico
        </h3>
        {/* Segmented toggle */}
        <div className="flex rounded-full bg-layer-2 p-0.5 gap-0.5">
          {([7, 16] as const).map((d) => (
            <button
              key={d}
              onClick={() => setForecastDays(d)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                forecastDays === d
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {d} días
            </button>
          ))}
        </div>
      </div>

      {/* Range legend */}
      <p className="text-[11.5px] text-text-tertiary mb-4 leading-snug">
        La barra indica el rango de cada día:{" "}
        <span style={{ color: "var(--color-rain)" }}>mínima</span> a la
        izquierda, <span style={{ color: "var(--color-sun)" }}>máxima</span> a
        la derecha, comparado con todos los días de la lista.
      </p>

      {/* Forecast list in a glass card */}
      <div className="glass-card overflow-hidden">
        {days.map(({ date, i, max: dayMax, min: dayMin }, row) => {
          const isToday = i === 0;
          const weatherInfo = getWeatherInfo(weather.daily.weather_code[i]);
          const day = parseLocalDate(date);

          // Range bar geometry (min 10% width)
          const barLeft = ((dayMin - weekMin) / weekSpan) * 100;
          const barWidth = Math.max(((dayMax - dayMin) / weekSpan) * 100, 10);

          return (
            <div
              key={date}
              onClick={() => setSelectedDayIndex(i)}
              className={`flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/30 dark:hover:bg-white/[0.04] transition-colors ${
                row !== 0
                  ? "border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)]"
                  : ""
              }`}
            >
              {/* Day name + date — 38px fixed */}
              <div className="w-[38px] flex-shrink-0">
                <p
                  className={`text-sm ${isToday ? "font-semibold" : "font-medium"} text-text-primary leading-tight`}
                >
                  {isToday
                    ? "Hoy"
                    : day.toLocaleDateString("es-ES", {
                        weekday: "short",
                      })}
                </p>
                <p className="text-[10px] text-text-tertiary">
                  {day.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>

              {/* Icon — 34px */}
              <div className="flex-shrink-0">
                <WeatherIcon
                  code={weather.daily.weather_code[i] ?? undefined}
                  size={34}
                />
              </div>

              {/* Description — flexible, truncated */}
              <p className="flex-1 min-w-0 text-xs text-text-secondary truncate">
                {weatherInfo.text}
              </p>

              {/* Min — 30px */}
              <span
                className="text-sm font-medium w-[30px] text-right flex-shrink-0"
                style={{ color: "var(--color-rain)" }}
              >
                {formatTemp(dayMin)}°
              </span>

              {/* Range bar — 64px */}
              <div
                className="relative flex-shrink-0 rounded-full overflow-hidden"
                style={{
                  width: 64,
                  height: 5,
                  background: "var(--color-layer-3)",
                }}
                title={`${formatTemp(dayMin)}° – ${formatTemp(dayMax)}°`}
              >
                <div
                  className="absolute top-0 bottom-0 rounded-full"
                  style={{
                    left: `${barLeft}%`,
                    width: `${barWidth}%`,
                    background: "linear-gradient(90deg, #4FA9F4, #F5B733)",
                  }}
                />
              </div>

              {/* Max — 30px */}
              <span
                className="text-sm font-medium w-[30px] text-left flex-shrink-0"
                style={{ color: "var(--color-sun)" }}
              >
                {formatTemp(dayMax)}°
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedDayIndex !== null && (
        <DailyDetailModal
          weather={weather}
          dayIndex={selectedDayIndex}
          formatTemp={formatTemp}
          onClose={() => setSelectedDayIndex(null)}
        />
      )}
    </div>
  );
}
