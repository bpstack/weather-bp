"use client";

import { useState } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";
import { getWeatherInfo } from "@/app/weather/services/weather-utils";
import { WeatherIcon } from "@/components/weather/icons/WeatherIcon";
import DailyDetailModal from "./DailyDetailModal";

interface Props {
  weather: WeatherData;
  forecastDays: 7 | 16;
  setForecastDays: (d: 7 | 16) => void;
  convertTemp: (t: number | null) => number | string;
}

export default function Forecast({
  weather,
  forecastDays,
  setForecastDays,
  convertTemp,
}: Props) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const days = weather.daily.time.slice(0, forecastDays);

  // Compute week-level min/max for the range bar
  const visibleMaxes = days.map((_, i) => weather.daily.temperature_2m_max[i] ?? 0);
  const visibleMins = days.map((_, i) => weather.daily.temperature_2m_min[i] ?? 0);
  const weekMax = Math.max(...visibleMaxes);
  const weekMin = Math.min(...visibleMins);
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
        La barra indica el rango de cada día: {" "}
        <span style={{ color: "var(--color-rain)" }}>mínima</span> a la izquierda,{" "}
        <span style={{ color: "var(--color-sun)" }}>máxima</span> a la derecha,
        comparado con toda la semana.
      </p>

      {/* Forecast list in a glass card */}
      <div className="glass-card overflow-hidden">
        {days.map((date, i) => {
          const isToday = i === 0;
          const weatherInfo = getWeatherInfo(weather.daily.weather_code[i]);
          const dayMax = weather.daily.temperature_2m_max[i] ?? weekMin;
          const dayMin = weather.daily.temperature_2m_min[i] ?? weekMin;

          // Range bar geometry (min 10% width)
          const barLeft = ((dayMin - weekMin) / weekSpan) * 100;
          const barWidth = Math.max(((dayMax - dayMin) / weekSpan) * 100, 10);

          return (
            <div
              key={date}
              onClick={() => setSelectedDayIndex(i)}
              className={`flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/30 dark:hover:bg-white/[0.04] transition-colors ${
                i !== 0 ? "border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)]" : ""
              }`}
            >
              {/* Day name + date — 38px fixed */}
              <div className="w-[38px] flex-shrink-0">
                <p className={`text-sm ${isToday ? "font-semibold" : "font-medium"} text-text-primary leading-tight`}>
                  {isToday
                    ? "Hoy"
                    : new Date(date).toLocaleDateString("es-ES", { weekday: "short" })}
                </p>
                <p className="text-[10px] text-text-tertiary">
                  {new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </p>
              </div>

              {/* Icon — 34px */}
              <div className="flex-shrink-0">
                <WeatherIcon code={weather.daily.weather_code[i] ?? undefined} size={34} />
              </div>

              {/* Description — flexible, truncated */}
              <p className="flex-1 min-w-0 text-xs text-text-secondary truncate">
                {weatherInfo.text}
              </p>

              {/* Min — 30px */}
              <span className="text-sm font-medium w-[30px] text-right flex-shrink-0" style={{ color: "var(--color-rain)" }}>
                {convertTemp(dayMin)}°
              </span>

              {/* Range bar — 64px */}
              <div
                className="relative flex-shrink-0 rounded-full overflow-hidden"
                style={{ width: 64, height: 5, background: "var(--color-layer-3)" }}
                title={`${convertTemp(dayMin)}° – ${convertTemp(dayMax)}°`}
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
              <span className="text-sm font-medium w-[30px] text-left flex-shrink-0" style={{ color: "var(--color-sun)" }}>
                {convertTemp(dayMax)}°
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
          convertTemp={convertTemp}
          onClose={() => setSelectedDayIndex(null)}
        />
      )}
    </div>
  );
}
