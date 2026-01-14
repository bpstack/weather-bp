"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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

const fetcher = async (key: string, city: GeocodingCity, days: 7 | 16) => {
  return fetchWeather({
    latitude: city.latitude,
    longitude: city.longitude,
    cityName: city.name,
    country: city.country,
    days,
  });
};

export default function WeatherClient() {
  const [selectedCity, setSelectedCity] = useState<GeocodingCity | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] =
    useState<string>("En todo el mundo");
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [forecastDays, setForecastDays] = useState<7 | 16>(7);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");

  const continents = [
    "En todo el mundo",
    "Europa",
    "América",
    "Asia",
    "Oceanía",
    "África",
  ];
  const popularCities = getPopularCities();

  // Function to request geolocation
  const requestGeolocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);

    const result = await getUserLocation();

    if (result.city) {
      setSelectedCity(result.city);
      setLocationError(null);
    } else if (result.error) {
      setLocationError(result.error);
    }

    setIsLocating(false);
    return result;
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    const detectLocation = async () => {
      await requestGeolocation();
      setIsInitializing(false);
    };

    detectLocation();
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

  const [filteredSearch, setFilteredSearch] = useState<GeocodingCity[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search with debounce - triggers at 3+ characters
  useEffect(() => {
    if (searchQuery.length < 3) {
      setFilteredSearch([]);
      setSearchLoading(false);
      return;
    }
    const controller = new AbortController();
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=50&language=es&format=json`,
          { signal: controller.signal },
        );
        const data = await res.json();
        const results = (data.results || []).map((city: GeocodingCity) => ({
          ...city,
          continent: getContinent(city.country_code),
        }));
        setFilteredSearch(results);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setFilteredSearch([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

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
    setFilteredSearch([]);
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
      <div className="min-h-screen bg-background p-4 pt-16">
        <div className="max-w-4xl mx-auto">
          <HeaderBar weather={null} icons={icons} />

          <div className="bg-layer-1 border border-layer-3 rounded-lg p-6 mb-4 text-center">
            <icons.MapPin className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Selecciona una ubicación
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              No pudimos detectar tu ubicación automáticamente. Puedes
              intentarlo de nuevo o buscar una ciudad manualmente.
            </p>

            {locationError && (
              <div className="mb-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                {locationError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={requestGeolocation}
                disabled={isLocating}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-layer-2 border border-layer-3 text-text-primary hover:border-accent/30 hover:text-accent transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all font-medium text-sm shadow-sm hover:shadow-md"
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
            continents={continents}
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
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-600 dark:text-red-400">
            No se pudieron obtener los datos del tiempo
          </div>
        )}

        {currentWeather && !isLoading && !error && (
          <>
            <WeatherAlerts weather={currentWeather} />

            <div className="space-y-4">
              <CurrentWeather
                icons={icons}
                weather={currentWeather}
                tempUnit={tempUnit}
                setTempUnit={setTempUnit}
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
            </div>
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
          continents={continents}
          selectedContinent={selectedContinent}
          setSelectedContinent={setSelectedContinent}
          handleCitySelect={handleCitySelect}
          setShowCitySelector={setShowCitySelector}
        />
      )}
    </div>
  );
}
