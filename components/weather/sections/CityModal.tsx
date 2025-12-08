"use client";

import { icons as defaultIcons } from "@/app/weather/services/weather-utils";
import { GeocodingCity } from "@/app/weather/services/city-utils";

interface Props {
  icons?: typeof defaultIcons;
  filteredCities: GeocodingCity[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchLoading: boolean;
  continents: string[];
  selectedContinent: string;
  setSelectedContinent: (v: string) => void;
  handleCitySelect: (city: GeocodingCity) => void;
  setShowCitySelector: (v: boolean) => void;
}

export default function CityModal({
  icons = defaultIcons,
  filteredCities,
  searchQuery,
  setSearchQuery,
  searchLoading,
  continents,
  selectedContinent,
  setSelectedContinent,
  handleCitySelect,
  setShowCitySelector,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-layer-3 rounded-xl w-full max-w-lg max-h-[75vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-layer-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-text-primary">Buscar ciudad</h2>
            <button
              onClick={() => {
                setShowCitySelector(false);
                setSearchQuery("");
                setSelectedContinent("Todos");
              }}
              className="p-1.5 rounded-lg hover:bg-layer-2 transition-colors"
              aria-label="Cerrar"
            >
              <icons.X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (filteredCities.length > 0) {
                handleCitySelect(filteredCities[0]);
              }
            }}
            className="relative mb-3"
          >
            <icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Escribe una ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2 bg-layer-1 border border-layer-3 rounded-lg focus:outline-none focus:border-accent text-text-primary placeholder:text-text-secondary text-sm"
            />
            {searchLoading && (
              <icons.Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-accent" />
            )}
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <icons.Globe className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
            <div className="flex gap-1.5">
              {continents.map((continent) => (
                <button
                  key={continent}
                  onClick={() => setSelectedContinent(continent)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedContinent === continent ? "bg-accent text-white" : "bg-layer-2 text-text-secondary hover:bg-layer-3"
                  }`}
                >
                  {continent}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredCities.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              {searchQuery.length < 2 ? "Escribe al menos 2 caracteres para buscar" : "No se encontraron ciudades en este continente"}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase tracking-wider text-text-secondary font-medium">
                  {searchQuery.length >= 2 ? "Resultados" : "Ciudades populares"}
                </h3>
                <span className="text-xs text-text-secondary bg-layer-2 px-2 py-0.5 rounded">{filteredCities.length}</span>
              </div>
              <div className="space-y-1">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-layer-1 hover:bg-layer-2 border border-layer-3 hover:border-accent-border transition-all text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary text-sm group-hover:text-accent truncate">{city.name}</div>
                      <div className="text-xs text-text-secondary truncate">
                        {city.admin1 && `${city.admin1}, `}
                        {city.country} • {city.continent}
                      </div>
                    </div>
                    <icons.MapPin className="w-3.5 h-3.5 text-text-secondary group-hover:text-accent flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
