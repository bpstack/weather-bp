"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import useSWR from "swr";
import { fetchWeather } from "@/app/weather/services/weather-service";
import {
  GeocodingCity,
  getContinent,
  getPopularCities,
  getUserLocation,
} from "@/app/weather/services/city-utils";
import {
  getWeatherIcon,
  getWeatherInfo,
  icons,
} from "@/app/weather/services/weather-utils";
import CurrentWeather from "./sections/CurrentWeather";
import WeatherDetails from "./sections/WeatherDetails";
import Forecast from "./sections/Forecast";
import HourlyForecast from "./sections/HourlyForecast";
import CitySelector from "./sections/CitySelector";
import HeaderBar from "./sections/HeaderBar";
import FooterInfo from "./sections/FooterInfo";
import CityModal from "./sections/CityModal";
import WeatherAlerts from "./sections/WeatherAlerts";
import { WeatherSkeleton, InitialSkeleton } from "./Skeletons";

const STORAGE_KEY_CITY = "weather-bp-selected-city";
const STORAGE_KEY_TEMP_UNIT = "weather-bp-temp-unit";

function getStoredCity(): GeocodingCity | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_CITY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function setStoredCity(city: GeocodingCity | null) {
  if (typeof window === "undefined") return;
  if (city) {
    localStorage.setItem(STORAGE_KEY_CITY, JSON.stringify(city));
  } else {
    localStorage.removeItem(STORAGE_KEY_CITY);
  }
}

function getStoredTempUnit(): "C" | "F" {
  if (typeof window === "undefined") return "C";
  const stored = localStorage.getItem(STORAGE_KEY_TEMP_UNIT);
  return stored === "F" ? "F" : "C";
}

function setStoredTempUnit(unit: "C" | "F") {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_TEMP_UNIT, unit);
}

// Static data - defined outside component to avoid recreation
const CONTINENTS = [
  "En todo el mundo",
  "Europa",
  "América",
  "Asia",
  "Oceanía",
  "África",
];

const fetcher = async (key: string, city: GeocodingCity, days: 7 | 16) => {
  return fetchWeather({
    latitude: city.latitude,
    longitude: city.longitude,
    cityName: city.name,
    country: city.country,
    days,
  });
};

const geocodingFetcher = async (query: string): Promise<GeocodingCity[]> => {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=50&language=es&format=json`,
  );
  const data = await res.json();
  return (data.results || []).map((city: GeocodingCity) => ({
    ...city,
    continent: getContinent(city.country_code),
  }));
};

export default function WeatherClient() {
  const [selectedCity, setSelectedCity] = useState<GeocodingCity | null>(() => getStoredCity());
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] =
    useState<string>("En todo el mundo");
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [forecastDays, setForecastDays] = useState<7 | 16>(7);
  const [tempUnit, setTempUnit] = useState<"C" | "F">(() => getStoredTempUnit());

  // Memoize popular cities to avoid recalculation on every render
  const popularCities = useMemo(() => getPopularCities(), []);

  // Handle temperature unit change with persistence
  const handleTempUnitChange = useCallback((unit: "C" | "F") => {
    setTempUnit(unit);
    setStoredTempUnit(unit);
  }, []);

  // Function to request geolocation
  const requestGeolocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);

    const result = await getUserLocation();

    if (result.city) {
      setSelectedCity(result.city);
      setStoredCity(result.city);
      setLocationError(null);
    } else if (result.error) {
      setLocationError(result.error);
    }

    setIsLocating(false);
    return result;
  }, []);

  // Auto-detect location on mount - use cached city immediately, then update in background
  useEffect(() => {
    const initializeWithLocation = async () => {
      const storedCity = getStoredCity();
      
      if (storedCity) {
        setSelectedCity(storedCity);
        setIsInitializing(false);
      }
      
      await requestGeolocation();
      setIsInitializing(false);
    };

    initializeWithLocation();
  }, [requestGeolocation]);

  const {
    data: weather,
    isLoading,
    error,
  } = useSWR(
    selectedCity ? ["weather", selectedCity.id, forecastDays] : null,
    () =>
      selectedCity ? fetcher("weather", selectedCity, forecastDays) : null,
    {
      revalidateOnFocus: false,
    },
  );

  const [debouncedQuery, setDebouncedQuery] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchQuery.length < 3) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchQuery]);

  const {
    data: searchResults = [],
    isLoading: searchLoading,
  } = useSWR(
    debouncedQuery.length >= 3 ? ["geocode", debouncedQuery] : null,
    () => geocodingFetcher(debouncedQuery),
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    },
  );

  const filteredSearch = searchResults;

  const filteredCities = useMemo(() => {
    // If searching, use search results; otherwise show popular cities
    const base = searchQuery.length >= 3 ? filteredSearch : popularCities;

    if (selectedContinent === "En todo el mundo") return base;
    return base.filter((city) => city.continent === selectedContinent);
  }, [searchQuery, filteredSearch, popularCities, selectedContinent]);

  const handleCitySelect = useCallback((city: GeocodingCity) => {
    setSelectedCity(city);
    setShowCitySelector(false);
    setSearchQuery("");
    setSelectedContinent("En todo el mundo");
  }, []);

  const convertTemp = (temp: number | null) => {
    if (temp === null || temp === undefined) return "-";
    if (tempUnit === "F") return Math.round((temp * 9) / 5 + 32);
    return Math.round(temp);
  };

  const currentWeather = weather;

  // Initial loading state - reserve space to prevent layout shift
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background p-4 pt-16">
        <div className="max-w-4xl mx-auto">
          <InitialSkeleton />
        </div>
      </div>
    );
  }

  // No city selected state (geolocation failed/denied)
  if (!selectedCity) {
    return (
      <div className="min-h-screen bg-background p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <HeaderBar weather={null} icons={icons} />

          <div className="py-16 text-center">
            <icons.MapPin className="w-12 h-12 mx-auto mb-6 text-text-tertiary" />
            <h2 className="text-2xl font-light text-text-primary mb-3">
              Selecciona una ubicación
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              No pudimos detectar tu ubicación automáticamente. Puedes
              intentarlo de nuevo o buscar una ciudad.
            </p>

            {locationError && (
              <div className="mb-6 text-sm text-amber-600 dark:text-amber-400 max-w-md mx-auto">
                {locationError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={requestGeolocation}
                disabled={isLocating}
                className="px-5 py-2.5 rounded-full text-text-primary hover:bg-layer-2 transition-all text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isLocating ? (
                  <>
                    <icons.Loader2 className="w-4 h-4 animate-spin" />
                    Detectando...
                  </>
                ) : (
                  <>
                    <icons.Navigation className="w-4 h-4" />
                    Usar mi ubicación
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCitySelector(true)}
                className="px-5 py-2.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-all text-sm font-medium"
              >
                Buscar ciudad
              </button>
            </div>
          </div>

          <FooterInfo icons={icons} />
        </div>

        {showCitySelector && (
          <CityModal
            icons={icons}
            filteredCities={filteredCities}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchLoading={searchLoading}
            continents={CONTINENTS}
            selectedContinent={selectedContinent}
            setSelectedContinent={setSelectedContinent}
            handleCitySelect={handleCitySelect}
            setShowCitySelector={setShowCitySelector}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pt-16">
      <div className="max-w-4xl mx-auto">
        <HeaderBar weather={currentWeather} icons={icons} />

        <CitySelector
          icons={icons}
          weather={currentWeather}
          selectedCity={selectedCity}
          setShowCitySelector={setShowCitySelector}
          onCitySelect={handleCitySelect}
        />

        {isLoading && (
          <WeatherSkeleton />
        )}

        {error && (
          <div className="py-8 text-center text-red-600 dark:text-red-400">
            No se pudieron obtener los datos del tiempo
          </div>
        )}

        {currentWeather && !isLoading && !error && (
          <>
            <WeatherAlerts weather={currentWeather} />

            <CurrentWeather
              icons={icons}
              weather={currentWeather}
              tempUnit={tempUnit}
              setTempUnit={handleTempUnitChange}
              convertTemp={convertTemp}
              getWeatherInfo={getWeatherInfo}
              getWeatherIcon={getWeatherIcon}
            />

            <HourlyForecast
              weather={currentWeather}
              convertTemp={convertTemp}
              tempUnit={tempUnit}
            />

            <WeatherDetails icons={icons} weather={currentWeather} />

            {currentWeather.daily && (
              <Forecast
                weather={currentWeather}
                forecastDays={forecastDays}
                setForecastDays={setForecastDays}
                convertTemp={convertTemp}
                getWeatherInfo={getWeatherInfo}
                getWeatherIcon={getWeatherIcon}
              />
            )}
          </>
        )}

        <FooterInfo icons={icons} />
      </div>

      {showCitySelector && (
        <CityModal
          icons={icons}
          filteredCities={filteredCities}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchLoading={searchLoading}
          continents={CONTINENTS}
          selectedContinent={selectedContinent}
          setSelectedContinent={setSelectedContinent}
          handleCitySelect={handleCitySelect}
          setShowCitySelector={setShowCitySelector}
        />
      )}
    </div>
  );
}
