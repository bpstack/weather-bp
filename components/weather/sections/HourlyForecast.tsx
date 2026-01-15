"use client";

import { useRef, useMemo } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";
import { getWeatherIcon } from "@/app/weather/services/weather-utils";
import { ChevronLeft, ChevronRight, Droplets, Globe } from "lucide-react";

interface HourlyForecastProps {
  weather: WeatherData;
  convertTemp: (temp: number | null) => string | number;
  tempUnit: "C" | "F";
}

function getHourlyWeatherCode(precipProb: number, currentCode: number): number {
  if (precipProb >= 60) return 61;
  if (precipProb >= 30) return 51;
  return currentCode;
}

// Format UTC offset as "+X" or "-X" hours
function formatUtcOffset(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours >= 0 ? `+${hours}` : `${hours}`;
}

// Get user's local UTC offset in seconds
function getUserUtcOffsetSeconds(): number {
  return -new Date().getTimezoneOffset() * 60;
}

export default function HourlyForecast({
  weather,
  convertTemp,
}: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const hourlyData = weather?.hourly;
  const currentCode = weather?.current?.weather_code ?? 0;
  const currentTime = weather?.current?.time; // City's current time from API
  const cityUtcOffset = weather?.utc_offset_seconds ?? 0;
  const timezoneAbbr = weather?.timezone_abbreviation ?? "";

  // Calculate timezone difference info
  const timezoneInfo = useMemo(() => {
    const userOffset = getUserUtcOffsetSeconds();
    const diffSeconds = cityUtcOffset - userOffset;
    const diffHours = Math.round(diffSeconds / 3600);

    // Only show if there's a significant difference (1+ hours)
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

    // Use the city's current time from API to find the starting hour
    // This is the correct approach as both currentTime and hourlyData.time
    // are in the city's local timezone
    let startIndex = 0;

    if (currentTime) {
      // Extract hour prefix from current time (e.g., "2024-01-15T14" from "2024-01-15T14:30")
      const currentHourPrefix = currentTime.slice(0, 13);

      // Find the matching hour in hourly data
      startIndex = hourlyData.time.findIndex((time) =>
        time.slice(0, 13) === currentHourPrefix
      );

      // If exact match not found, find the closest future hour
      if (startIndex === -1) {
        startIndex = hourlyData.time.findIndex((time) =>
          time.slice(0, 13) > currentHourPrefix
        );
      }
    }

    // Fallback: start from beginning if no match found
    if (startIndex === -1) {
      startIndex = 0;
    }

    return hourlyData.time
      .slice(startIndex, startIndex + 24)
      .map((time, i) => {
        const actualIndex = startIndex + i;
        // Parse the time string - extract hour directly from the string
        // Format is "2024-01-15T14:00"
        const hourStr = time.slice(11, 13);
        const hour = parseInt(hourStr, 10);
        const temp = hourlyData.temperature_2m[actualIndex];
        const precipProb = hourlyData.precipitation_probability[actualIndex] ?? 0;
        const weatherCode = getHourlyWeatherCode(precipProb, currentCode);

        return {
          time: i === 0 ? "Ahora" : `${hour}:00`,
          temp,
          precipProb,
          weatherCode,
          isNow: i === 0,
        };
      });
  }, [hourlyData, currentCode, currentTime]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
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
          <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
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
            className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
            aria-label="Desplazar a la izquierda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
            aria-label="Desplazar a la derecha"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable hours */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {hours.map((hour, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex flex-col items-center gap-3 min-w-[60px]"
          >
            {/* Time */}
            <span
              className={`text-sm ${
                hour.isNow
                  ? "font-semibold text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {hour.time}
            </span>

            {/* Icon */}
            <div className="w-8 h-8 flex items-center justify-center opacity-70">
              {getWeatherIcon(hour.weatherCode, "sm")}
            </div>

            {/* Temperature */}
            <span
              className={`text-base ${
                hour.isNow ? "font-semibold" : "font-medium"
              } text-text-primary`}
            >
              {convertTemp(hour.temp)}°
            </span>

            {/* Precipitation */}
            {hour.precipProb > 0 && (
              <div className="flex items-center gap-1 text-blue-500/70">
                <Droplets className="w-3 h-3" />
                <span className="text-xs">{hour.precipProb}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
