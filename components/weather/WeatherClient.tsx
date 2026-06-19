"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { track } from "@vercel/analytics";
import { fetchWeather } from "@/app/weather/services/weather-service";
import { GeocodingCity } from "@/app/weather/services/city-utils";
import {
  icons,
  isNightTime,
  getWeatherBackground,
} from "@/app/weather/services/weather-utils";
import { codeToKey } from "@/components/weather/icons/WeatherIcon";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useWeatherLocation } from "@/hooks/useWeatherLocation";
import { useCitySearch } from "@/hooks/useCitySearch";
import { useTempUnit } from "@/hooks/useTempUnit";
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

const fetcher = (_key: string, city: GeocodingCity, days: 7 | 16) =>
  fetchWeather({
    latitude: city.latitude,
    longitude: city.longitude,
    cityName: city.name,
    country: city.country,
    days,
  });

export default function WeatherClient() {
  const {
    selectedCity,
    setSelectedCity,
    isInitializing,
    isLocating,
    locationError,
    requestGeolocation,
  } = useWeatherLocation();

  const {
    showCitySelector,
    setShowCitySelector,
    searchQuery,
    setSearchQuery,
    selectedContinent,
    setSelectedContinent,
    filteredCities,
    searchLoading,
    resetSearch,
    continents,
  } = useCitySearch();

  const { tempUnit, setTempUnit, formatTemp } = useTempUnit();
  const [forecastDays, setForecastDays] = useState<7 | 16>(7);
  const theme = useTheme();

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
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        if (err.name === "TimeoutError" || err.name === "AbortError") return;
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 5_000);
      },
    },
  );

  const handleCitySelect = useCallback(
    (city: GeocodingCity) => {
      setSelectedCity(city);
      setShowCitySelector(false);
      resetSearch();
      track("city_select", { city: city.name, country: city.country });
    },
    [setSelectedCity, setShowCitySelector, resetSearch],
  );

  const handleTempUnitChange = useCallback(
    (unit: "C" | "F") => {
      setTempUnit(unit);
      track("temp_unit_change", { unit });
    },
    [setTempUnit],
  );

  // Compute dynamic background from current weather condition
  const dynamicBg = weather
    ? getWeatherBackground(
        codeToKey(weather.current.weather_code, isNightTime(weather)),
        theme === "dark",
      )
    : undefined;

  const cityModal = showCitySelector ? (
    <CityModal
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
  ) : null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background p-4 pt-16">
        <div className="max-w-4xl mx-auto">
          <InitialSkeleton />
        </div>
      </div>
    );
  }

  if (!selectedCity) {
    return (
      <div className="min-h-screen bg-background p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <HeaderBar weather={null} />

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

          <FooterInfo />
        </div>
        {cityModal}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 pt-16"
      style={{
        background: dynamicBg ?? "var(--color-background)",
        transition: "background 0.5s ease",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <HeaderBar weather={weather} />

        <CitySelector
          selectedCity={selectedCity}
          setShowCitySelector={setShowCitySelector}
          onLocate={requestGeolocation}
          isLocating={isLocating}
          locationError={locationError}
        />

        {isLoading && <WeatherSkeleton />}

        {error && (
          <div className="py-8 text-center text-red-600 dark:text-red-400">
            No se pudieron obtener los datos del tiempo
          </div>
        )}

        {weather && !isLoading && !error && (
          <>
            <WeatherAlerts weather={weather} />

            <CurrentWeather
              weather={weather}
              tempUnit={tempUnit}
              setTempUnit={handleTempUnitChange}
              formatTemp={formatTemp}
            />

            <HourlyForecast
              weather={weather}
              formatTemp={formatTemp}
              tempUnit={tempUnit}
            />

            <WeatherDetails weather={weather} />

            {weather.daily && (
              <Forecast
                weather={weather}
                forecastDays={forecastDays}
                setForecastDays={setForecastDays}
                formatTemp={formatTemp}
              />
            )}
          </>
        )}

        <FooterInfo />
      </div>
      {cityModal}
    </div>
  );
}
