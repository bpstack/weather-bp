"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import useSWR from "swr";
import {
  GeocodingCity,
  getContinent,
  getPopularCities,
} from "@/app/weather/services/city-utils";

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const CONTINENTS = [
  "En todo el mundo",
  "Europa",
  "América",
  "Asia",
  "Oceanía",
  "África",
];

async function geocodingFetcher(query: string): Promise<GeocodingCity[]> {
  const res = await fetch(
    `${GEOCODING_API_URL}?name=${encodeURIComponent(query)}&count=50&language=es&format=json`,
    { signal: AbortSignal.timeout(5_000) },
  );
  if (!res.ok) {
    throw new Error("No se pudo buscar la ciudad");
  }
  const data = await res.json();
  return (data.results || []).map((city: GeocodingCity) => ({
    ...city,
    continent: getContinent(city.country_code),
  }));
}

export function useCitySearch() {
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("En todo el mundo");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popularCities = useMemo(() => getPopularCities(), []);

  useEffect(() => {
    if (searchQuery.length < 3) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery]);

  const { data: searchResults = [], isLoading: searchLoading } = useSWR(
    debouncedQuery.length >= 3 ? ["geocode", debouncedQuery] : null,
    () => geocodingFetcher(debouncedQuery),
    { revalidateOnFocus: false, dedupingInterval: 1000 },
  );

  const filteredCities = useMemo(() => {
    const base = searchQuery.length >= 3 ? searchResults : popularCities;
    if (selectedContinent === "En todo el mundo") return base;
    return base.filter((city) => city.continent === selectedContinent);
  }, [searchQuery, searchResults, popularCities, selectedContinent]);

  const resetSearch = () => {
    setSearchQuery("");
    setSelectedContinent("En todo el mundo");
  };

  return {
    showCitySelector,
    setShowCitySelector,
    searchQuery,
    setSearchQuery,
    selectedContinent,
    setSelectedContinent,
    filteredCities,
    searchLoading,
    resetSearch,
    continents: CONTINENTS,
  };
}
