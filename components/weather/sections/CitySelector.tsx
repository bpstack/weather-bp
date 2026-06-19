"use client";

import { MapPin, Navigation, Loader2 } from "lucide-react";
import { GeocodingCity } from "@/app/weather/services/city-utils";

interface Props {
  selectedCity: GeocodingCity;
  setShowCitySelector: (v: boolean) => void;
  onLocate: () => void;
  isLocating: boolean;
  locationError: string | null;
}

export default function CitySelector({
  selectedCity,
  setShowCitySelector,
  onLocate,
  isLocating,
  locationError,
}: Props) {
  return (
    <div className="relative flex items-center justify-between py-4">
      {/* Location info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
        <div className="min-w-0">
          <p
            className="font-semibold text-text-primary truncate"
            style={{ fontSize: 22 }}
            title={selectedCity.name}
          >
            {selectedCity.name}
          </p>
          <p className="text-text-tertiary truncate" style={{ fontSize: 12.5 }}>
            {selectedCity.country}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onLocate}
          disabled={isLocating}
          className="p-2.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all disabled:opacity-50"
          aria-label="Usar mi ubicación"
          title="Usar mi ubicación"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
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
