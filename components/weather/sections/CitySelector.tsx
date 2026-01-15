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
    <div className="flex items-center justify-between py-4">
      {/* Location info */}
      <div className="flex items-center gap-3">
        <div className="text-text-tertiary">
          <icons.MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="text-lg font-semibold text-text-primary">
            {selectedCity.name}
          </p>
          <p className="text-sm text-text-tertiary">{selectedCity.country}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="p-2.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all disabled:opacity-50"
          aria-label="Usar mi ubicación"
          title="Usar mi ubicación"
        >
          {isLocating ? (
            <icons.Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <icons.Navigation className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => setShowCitySelector(true)}
          className="px-4 py-2 rounded-full bg-accent text-white hover:bg-accent-hover transition-all text-sm font-medium"
        >
          Cambiar
        </button>
      </div>

      {locationError && (
        <div className="absolute left-0 right-0 top-full mt-2 text-xs text-red-600 dark:text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          {locationError}
        </div>
      )}
    </div>
  );
}
