"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X, Loader2, Globe, ChevronDown } from "lucide-react";
import { GeocodingCity } from "@/app/weather/services/city-utils";

interface Props {
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
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialHeight = window.innerHeight;
    const updateHeight = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setViewportHeight(vh);
      setKeyboardOpen(vh < initialHeight * 0.75);
    };
    updateHeight();
    window.visualViewport?.addEventListener("resize", updateHeight);
    window.addEventListener("resize", updateHeight);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // rAF trick for reliable slide-in even if tab was in background
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.style.transform = "translateY(100%)";
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.style.transform = "";
        el.classList.add("wx-sheet");
      }, 16);
    });
  }, []);

  const handleClose = () => {
    setShowCitySelector(false);
    setSearchQuery("");
    setSelectedContinent("En todo el mundo");
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center ${
        keyboardOpen ? "items-start pt-2" : "items-end sm:items-center"
      }`}
      style={{ height: viewportHeight ? `${viewportHeight}px` : "100dvh" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar modal"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative bg-layer-1 w-full sm:max-w-md flex flex-col shadow-2xl ${
          keyboardOpen
            ? "rounded-[28px] mx-2 max-h-full"
            : "rounded-t-[28px] sm:rounded-[28px] max-h-[85vh] sm:max-h-[70vh]"
        }`}
      >
        {/* Grabber */}
        {!keyboardOpen && (
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-[38px] h-[5px] rounded-full bg-layer-3" />
          </div>
        )}

        {/* Search header */}
        <div className="flex-shrink-0 p-4 pb-2 bg-layer-1 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Buscar ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-layer-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 text-text-primary placeholder:text-text-tertiary text-base"
            />
            {searchLoading ? (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-text-tertiary" />
            ) : searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-layer-3 transition-colors"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`mt-3 flex items-center gap-2 text-sm transition-colors ${
              selectedContinent !== "En todo el mundo"
                ? "text-accent"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>
              {selectedContinent !== "En todo el mundo"
                ? selectedContinent
                : "Filtrar por continente"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {continents.map((continent) => (
                <button
                  key={continent}
                  onClick={() => {
                    setSelectedContinent(continent);
                    if (continent !== "En todo el mundo") setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedContinent === continent
                      ? "bg-accent text-white"
                      : "bg-layer-2 text-text-secondary hover:bg-layer-3"
                  }`}
                >
                  {continent === "En todo el mundo" ? "Todos" : continent}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
          {filteredCities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
              <MapPin className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery.length > 0 && searchQuery.length < 3
                  ? "Escribe al menos 3 letras"
                  : searchQuery.length >= 3
                    ? "No se encontraron ciudades"
                    : "Escribe para buscar una ciudad"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {searchQuery.length < 3 && (
                <p className="text-xs text-text-tertiary mb-2 px-1">Ciudades populares</p>
              )}
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-layer-2 active:bg-layer-3 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-layer-2 group-hover:bg-layer-3 flex items-center justify-center flex-shrink-0 transition-colors">
                    <MapPin className="w-4 h-4 text-text-tertiary group-hover:text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{city.name}</p>
                    <p className="text-sm text-text-tertiary truncate">
                      {city.admin1 && `${city.admin1}, `}{city.country}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop close */}
        <button
          onClick={handleClose}
          className="hidden sm:flex absolute top-4 right-4 p-2 rounded-full hover:bg-layer-2 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-text-tertiary" />
        </button>
      </div>
    </div>
  );
}
