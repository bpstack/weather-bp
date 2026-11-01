"use client";

import { useRef, useMemo, useState } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";
import {
  getWeatherInfo,
  isNightAt,
  isNightTime,
} from "@/app/weather/services/weather-utils";
import { WeatherIcon } from "@/components/weather/icons/WeatherIcon";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import HourlyDetailModal from "./HourlyDetailModal";

interface HourlyForecastProps {
  weather: WeatherData;
  formatTemp: (temp: number | null) => string;
  tempUnit: "C" | "F";
}

function formatUtcOffset(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours >= 0 ? `+${hours}` : `${hours}`;
}

function getUserUtcOffsetSeconds(): number {
  return -new Date().getTimezoneOffset() * 60;
}

export default function HourlyForecast({
  weather,
  formatTemp,
}: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(
    null,
  );

  const hourlyData = weather?.hourly;
  const currentCode = weather?.current?.weather_code ?? 0;
  const currentTime = weather?.current?.time;
  const currentTemp = weather?.current?.temperature_2m;
  const currentIsNight = isNightTime(weather);
  const cityUtcOffset = weather?.utc_offset_seconds ?? 0;
  const timezoneAbbr = weather?.timezone_abbreviation ?? "";

  const timezoneInfo = useMemo(() => {
    const userOffset = getUserUtcOffsetSeconds();
    const diffSeconds = cityUtcOffset - userOffset;
    const diffHours = Math.round(diffSeconds / 3600);
    if (Math.abs(diffHours) >= 1) {
      const sign = diffHours > 0 ? "+" : "";
      return {
        showIndicator: true,
        diffText: `${sign}${diffHours}h`,
        fullText: `UTC${formatUtcOffset(cityUtcOffset)}`,
        abbr: timezoneAbbr,
      };
    }
    return { showIndicator: false, diffText: "", fullText: "", abbr: "" };
  }, [cityUtcOffset, timezoneAbbr]);

  const hours = useMemo(() => {
    if (!hourlyData?.time?.length) return [];

    let startIndex = 0;
    if (currentTime) {
      const currentHourPrefix = currentTime.slice(0, 13);
      startIndex = hourlyData.time.findIndex(
        (time) => time.slice(0, 13) === currentHourPrefix,
      );
      if (startIndex === -1) {
        startIndex = hourlyData.time.findIndex(
          (time) => time.slice(0, 13) > currentHourPrefix,
        );
      }
    }
    if (startIndex === -1) startIndex = 0;

    return hourlyData.time.slice(startIndex, startIndex + 24).map((time, i) => {
      const actualIndex = startIndex + i;
      const hour = parseInt(time.slice(11, 13), 10);
      const isNow = i === 0;
      const precipProb = hourlyData.precipitation_probability[actualIndex] ?? 0;
      // "Ahora" mirrors the current-conditions card above it; every other hour
      // shows that hour's own forecast, the same one its detail modal shows.
      const temp = isNow
        ? (currentTemp ?? hourlyData.temperature_2m[actualIndex])
        : hourlyData.temperature_2m[actualIndex];
      const weatherCode = isNow
        ? currentCode
        : hourlyData.weather_code[actualIndex];
      const night = isNow ? currentIsNight : isNightAt(time, weather);

      return {
        time: isNow ? "Ahora" : `${hour}:00`,
        temp,
        precipProb,
        weatherCode,
        condition: getWeatherInfo(weatherCode).text,
        isNow,
        night,
        actualIndex,
      };
    });
  }, [
    weather,
    hourlyData,
    currentCode,
    currentTime,
    currentTemp,
    currentIsNight,
  ]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  if (hours.length === 0) return null;

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold text-text-tertiary uppercase"
            style={{ fontSize: 11.5, letterSpacing: "0.09em" }}
          >
            Próximas 24 horas
          </h3>
          {timezoneInfo.showIndicator && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-layer-2 text-text-tertiary text-[10px]">
              <Globe className="w-3 h-3" />
              <span>hora local {timezoneInfo.diffText}</span>
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
            aria-label="Desplazar a la izquierda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
            aria-label="Desplazar a la derecha"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory py-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          touchAction: "pan-x pan-y",
        }}
      >
        {hours.map((hour) => (
          <button
            key={hour.time + hour.actualIndex}
            onClick={() => setSelectedHourIndex(hour.actualIndex)}
            aria-label={`${hour.time}: ${formatTemp(hour.temp)}°, ${hour.condition}, ${hour.precipProb}% de lluvia`}
            className={`snap-start flex-shrink-0 flex flex-col items-center gap-[7px] px-1 py-3 rounded-[18px] transition-all cursor-pointer ${
              hour.isNow
                ? "bg-accent-soft border border-transparent"
                : "bg-white/40 dark:bg-white/[0.045] border border-[rgba(0,0,0,0.07)] dark:border-[rgba(255,255,255,0.09)] hover:bg-white/60 dark:hover:bg-white/10"
            }`}
            style={{ width: 66 }}
          >
            {/* Time */}
            <span className="text-[12px] text-text-secondary">{hour.time}</span>

            {/* Icon */}
            <div className="flex items-center justify-center">
              <WeatherIcon
                code={hour.weatherCode}
                night={hour.night}
                size={36}
              />
            </div>

            {/* Temperature */}
            <span className="text-[15px] font-semibold text-text-primary">
              {formatTemp(hour.temp)}°
            </span>

            {/* Precipitation */}
            <span
              className="text-[11px] font-medium"
              style={{
                color:
                  hour.precipProb > 25 ? "var(--color-rain)" : "transparent",
              }}
            >
              {hour.precipProb}%
            </span>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedHourIndex !== null && (
        <HourlyDetailModal
          weather={weather}
          hourIndex={selectedHourIndex}
          formatTemp={formatTemp}
          onClose={() => setSelectedHourIndex(null)}
        />
      )}
    </div>
  );
}
