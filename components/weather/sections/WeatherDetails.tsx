"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import { icons as defaultIcons } from "@/app/weather/services/weather-utils";

interface Props {
  weather: WeatherData;
  icons?: typeof defaultIcons;
}

export default function WeatherDetails({ weather, icons = defaultIcons }: Props) {
  return (
    <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all">
        <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
          <icons.Droplets className="w-3 h-3 group-hover:text-accent transition-colors" />
          <span className="text-xs uppercase tracking-wider">Humedad</span>
        </div>
        <div className="text-xl font-bold text-text-primary">{weather.current.relative_humidity_2m}%</div>
      </div>

      <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all">
        <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
          <icons.Wind className="w-3 h-3 group-hover:text-accent transition-colors" />
          <span className="text-xs uppercase tracking-wider">Viento</span>
        </div>
        <div className="text-xl font-bold text-text-primary">
          {Math.round(weather.current.wind_speed_10m)}
          <span className="text-xs font-normal text-text-secondary ml-1">km/h</span>
        </div>
      </div>

      <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all">
        <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
          <icons.CloudRain className="w-3 h-3 group-hover:text-accent transition-colors" />
          <span className="text-xs uppercase tracking-wider">Precipitación</span>
        </div>
        <div className="text-xl font-bold text-text-primary">
          {weather.current.precipitation}
          <span className="text-xs font-normal text-text-secondary ml-1">mm</span>
        </div>
      </div>

      <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all">
        <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
          <icons.Gauge className="w-3 h-3 group-hover:text-accent transition-colors" />
          <span className="text-xs uppercase tracking-wider">Presión</span>
        </div>
        <div className="text-xl font-bold text-text-primary">
          {Math.round(weather.current.pressure_msl)}
          <span className="text-xs font-normal text-text-secondary ml-1">hPa</span>
        </div>
      </div>

      <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all col-span-2">
        <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
          <icons.Sun className="w-3 h-3 group-hover:text-accent transition-colors" />
          <span className="text-xs uppercase tracking-wider">Amanecer / Atardecer</span>
        </div>
        <div className="flex gap-4 text-sm text-text-primary">
          <span>{new Date(weather.daily.sunrise?.[0] ?? "").toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>{new Date(weather.daily.sunset?.[0] ?? "").toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all col-span-2">
        <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
          <icons.Zap className="w-3 h-3 group-hover:text-accent transition-colors" />
          <span className="text-xs uppercase tracking-wider">Índice Ultra Violeta (máx)</span>
        </div>
        <div className="text-xl font-bold text-text-primary">
          {Math.round(weather.daily.uv_index_max?.[0] ?? 0)}
        </div>
      </div>
    </div>
  );
}

