"use client";

import { useState } from "react";
import { WeatherData } from "@/app/weather/services/weather-service";
import { icons as defaultIcons } from "@/app/weather/services/weather-utils";
import {
  GeocodingCity,
  getUserLocation,
} from "@/app/weather/services/city-utils";

interface Props {
  icons?: typeof defaultIcons;
  weather?: WeatherData | null;
  selectedCity: GeocodingCity;
  setShowCitySelector: (v: boolean) => void;
  onCitySelect: (city: GeocodingCity) => void;
}

export default function CitySelector({
  icons = defaultIcons,
  weather,
  selectedCity,
  setShowCitySelector,
  onCitySelect,
}: Props) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    const result = await getUserLocation();

    if (result.error) {
      setLocationError(result.error);
      setIsLocating(false);
      return;
    }

    if (result.city) {
      onCitySelect(result.city);
    }
    setIsLocating(false);
  };

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
            <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
              Ubicación actual
            </div>
            <div className="font-semibold text-text-primary">
              {selectedCity.name}, {selectedCity.country}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGetLocation}
            disabled={isLocating}
            className="p-2 rounded-lg bg-layer-2 border border-layer-3 text-text-secondary hover:text-accent hover:border-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Usar mi ubicación"
            title="Usar mi ubicación"
          >
            {isLocating ? (
              <icons.Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <icons.Navigation className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowCitySelector(true)}
            className="px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all font-medium text-sm shadow-sm hover:shadow-md"
          >
            Cambiar
          </button>
        </div>
      </div>

      {locationError && (
        <div className="relative mt-3 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {locationError}
        </div>
      )}
    </div>
  );
}
