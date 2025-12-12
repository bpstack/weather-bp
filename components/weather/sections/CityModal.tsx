"use client";

import { useEffect, useState } from "react";
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
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Track visual viewport height changes (keyboard open/close)
    const updateHeight = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setViewportHeight(vh);
    };

    updateHeight();
    
    window.visualViewport?.addEventListener("resize", updateHeight);
    window.addEventListener("resize", updateHeight);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden"
      style={{ height: viewportHeight ? `${viewportHeight}px` : "100dvh" }}
    >
      <div className="bg-background sm:border sm:border-layer-3 sm:rounded-xl w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[80vh] flex flex-col overflow-hidden sm:shadow-2xl sm:m-4">
        <div className="p-3 sm:p-4 border-b border-layer-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">Buscar ciudad</h2>
            <button
              onClick={() => {
                setShowCitySelector(false);
                setSearchQuery("");
                setSelectedContinent("En todo el mundo");
              }}
              className="p-2 rounded-lg hover:bg-layer-2 transition-colors -mr-1"
              aria-label="Cerrar"
            >
              <icons.X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (filteredCities.length > 0) {
                handleCitySelect(filteredCities[0]);
              }
            }}
            className="relative mb-2 sm:mb-3"
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
              className="w-full pl-10 pr-4 py-3 sm:py-2 bg-layer-1 border border-layer-3 rounded-lg focus:outline-none focus:border-accent text-text-primary placeholder:text-text-secondary text-base sm:text-sm"
            />
            {searchLoading && (
              <icons.Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-accent" />
            )}
          </form>

          {/* Mobile: Dropdown */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 w-full px-3 py-2.5 bg-layer-1 border border-layer-3 rounded-lg text-sm font-medium text-text-primary"
            >
              <icons.Globe className="w-4 h-4 text-text-secondary" />
              <span className="flex-1 text-left">{selectedContinent}</span>
              <icons.ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className="absolute top-full left-0 right-0 mt-1 bg-layer-1 border border-layer-3 rounded-lg shadow-lg z-20 overflow-hidden">
                  {continents.map((continent) => (
                    <button
                      key={continent}
                      onClick={() => {
                        setSelectedContinent(continent);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-sm text-left transition-colors ${
                        selectedContinent === continent 
                          ? "bg-accent text-white" 
                          : "text-text-primary hover:bg-layer-2"
                      }`}
                    >
                      {continent}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop: Chips horizontales */}
          <div className="hidden sm:flex items-center gap-2">
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

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
          {filteredCities.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-text-secondary text-sm">
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
              <div className="space-y-1.5 sm:space-y-1">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="w-full flex items-center justify-between p-3 sm:p-3 rounded-lg bg-layer-1 hover:bg-layer-2 active:bg-layer-2 border border-layer-3 hover:border-accent-border transition-all text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary text-base sm:text-sm group-hover:text-accent truncate">{city.name}</div>
                      <div className="text-xs text-text-secondary truncate">
                        {city.admin1 && `${city.admin1}, `}
                        {city.country} • {city.continent}
                      </div>
                    </div>
                    <icons.MapPin className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-text-secondary group-hover:text-accent flex-shrink-0 ml-2" />
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
