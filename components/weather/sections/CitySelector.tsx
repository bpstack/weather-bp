"use client";

import { WeatherData } from "@/app/weather/services/weather-service";
import { icons as defaultIcons } from "@/app/weather/services/weather-utils";
import { GeocodingCity } from "@/app/weather/services/city-utils";

interface Props {
  icons?: typeof defaultIcons;
  weather?: WeatherData;
  selectedCity: GeocodingCity;
  setShowCitySelector: (v: boolean) => void;
}

export default function CitySelector({ icons = defaultIcons, weather, selectedCity, setShowCitySelector }: Props) {
  return (
    <div className="bg-layer-1 border border-layer-3 rounded-lg p-4 mb-4 relative overflow-hidden">
      {weather && (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            weather ? "from-green-50 to-blue-50" : ""
          } opacity-10 dark:opacity-5`}
        />
      )}

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
            <icons.MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">Ubicación actual</div>
            <div className="font-semibold text-text-primary">
              {selectedCity.name}, {selectedCity.country}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCitySelector(true)}
          className="px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all font-medium text-sm shadow-sm hover:shadow-md"
        >
          Cambiar
        </button>
      </div>
    </div>
  );
}
