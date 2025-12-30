"use client";

import { useRef } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";
import { getWeatherIcon } from "@/app/weather/services/weather-utils";
import { ChevronLeft, ChevronRight, Droplets } from "lucide-react";

interface HourlyForecastProps {
  weather: WeatherData;
  convertTemp: (temp: number | null) => string | number;
  tempUnit: "C" | "F";
}

// Get weather code for an hour based on precipitation probability
function getHourlyWeatherCode(precipProb: number, currentCode: number): number {
  // If precipitation probability is high, show rain icon
  if (precipProb >= 60) return 61; // Rain
  if (precipProb >= 30) return 51; // Drizzle
  // Otherwise use current weather code as base
  return currentCode;
}

export default function HourlyForecast({
  weather,
  convertTemp,
  tempUnit,
}: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const hourlyData = weather?.hourly;
  const currentCode = weather?.current?.weather_code ?? 0;

  if (!hourlyData?.time?.length) return null;

  // Get next 24 hours of data
  const now = new Date();
  const currentHour = now.getHours();

  // Find the index of the current hour in the data
  const startIndex = hourlyData.time.findIndex((time) => {
    const date = new Date(time);
    return date.getDate() === now.getDate() && date.getHours() >= currentHour;
  });

  // Get 24 hours starting from current hour
  const hours = hourlyData.time
    .slice(startIndex, startIndex + 24)
    .map((time, i) => {
      const actualIndex = startIndex + i;
      const date = new Date(time);
      const hour = date.getHours();
      const temp = hourlyData.temperature_2m[actualIndex];
      const precipProb = hourlyData.precipitation_probability[actualIndex] ?? 0;
      const weatherCode = getHourlyWeatherCode(precipProb, currentCode);

      return {
        time:
          hour === currentHour && date.getDate() === now.getDate()
            ? "Ahora"
            : `${hour}:00`,
        temp,
        precipProb,
        weatherCode,
        isNow: hour === currentHour && date.getDate() === now.getDate(),
      };
    });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-layer-1 border border-layer-3 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">
          Próximas 24 horas
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-md bg-layer-2 border border-layer-3 text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all"
            aria-label="Desplazar a la izquierda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-md bg-layer-2 border border-layer-3 text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all"
            aria-label="Desplazar a la derecha"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {hours.map((hour, index) => (
          <div
            key={index}
            className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all min-w-[70px] ${
              hour.isNow
                ? "bg-accent/10 border-accent/30"
                : "bg-layer-2 border-layer-3 hover:border-accent/20"
            }`}
          >
            <span
              className={`text-xs font-medium ${
                hour.isNow ? "text-accent" : "text-text-secondary"
              }`}
            >
              {hour.time}
            </span>

            <div className="w-8 h-8 flex items-center justify-center">
              {getWeatherIcon(hour.weatherCode, "sm")}
            </div>

            <span className="text-sm font-semibold text-text-primary">
              {convertTemp(hour.temp)}°{tempUnit}
            </span>

            {hour.precipProb > 0 && (
              <div className="flex items-center gap-1 text-blue-500">
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
