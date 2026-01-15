"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import { icons as defaultIcons } from "@/app/weather/services/weather-utils";

interface Props {
  weather: WeatherData;
  icons?: typeof defaultIcons;
}

export default function WeatherDetails({
  weather,
  icons = defaultIcons,
}: Props) {
  const details = [
    {
      icon: icons.Droplets,
      label: "Humedad",
      value: `${weather.current.relative_humidity_2m}%`,
    },
    {
      icon: icons.Wind,
      label: "Viento",
      value: `${Math.round(weather.current.wind_speed_10m)} km/h`,
    },
    {
      icon: icons.CloudRain,
      label: "Precipitación",
      value: `${weather.current.precipitation} mm`,
    },
    {
      icon: icons.Gauge,
      label: "Presión",
      value: `${Math.round(weather.current.pressure_msl)} hPa`,
    },
    {
      icon: icons.Zap,
      label: "Índice UV",
      value: Math.round(weather.daily.uv_index_max?.[0] ?? 0).toString(),
    },
    {
      icon: icons.Sun,
      label: "Amanecer",
      value: new Date(weather.daily.sunrise?.[0] ?? "").toLocaleTimeString(
        "es-ES",
        { hour: "2-digit", minute: "2-digit" }
      ),
    },
    {
      icon: icons.Sun,
      label: "Atardecer",
      value: new Date(weather.daily.sunset?.[0] ?? "").toLocaleTimeString(
        "es-ES",
        { hour: "2-digit", minute: "2-digit" }
      ),
      iconRotate: true,
    },
  ];

  return (
    <div className="py-6 border-t border-border-subtle">
      <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-6">
        Detalles
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="text-text-tertiary">
                <Icon
                  className={`w-5 h-5 ${detail.iconRotate ? "rotate-180" : ""}`}
                />
              </div>
              <div>
                <p className="text-xs text-text-tertiary">{detail.label}</p>
                <p className="text-base font-medium text-text-primary">
                  {detail.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
