"use client";

import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import { WeatherData, fetchWeather } from "@/app/weather/services/weather-service";
import { GeocodingCity, getContinent, getPopularCities } from "@/app/weather/services/city-utils";
import { getWeatherIcon, getWeatherInfo, icons } from "@/app/weather/services/weather-utils";
import CurrentWeather from "./sections/CurrentWeather";
import WeatherDetails from "./sections/WeatherDetails";
import Forecast from "./sections/Forecast";
import CitySelector from "./sections/CitySelector";
import HeaderBar from "./sections/HeaderBar";
import FooterInfo from "./sections/FooterInfo";
import CityModal from "./sections/CityModal";

const fetcher = async (key: string, city: GeocodingCity, days: 7 | 16) => {
  return fetchWeather({
    latitude: city.latitude,
    longitude: city.longitude,
    cityName: city.name,
    country: city.country,
    days,
  });
};

interface Props {
  initialCity: GeocodingCity;
  initialWeather: WeatherData;
}

export default function WeatherClient({ initialCity, initialWeather }: Props) {
  const [selectedCity, setSelectedCity] = useState<GeocodingCity>(initialCity);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("En todo el mundo");
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [forecastDays, setForecastDays] = useState<7 | 16>(7);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");

  const continents = ["En todo el mundo", "Europa", "América", "Asia", "Oceanía", "África"];
  const popularCities = getPopularCities();

  const { data: weather, isLoading, error } = useSWR(
    ["weather", selectedCity.id, forecastDays],
    () => fetcher("weather", selectedCity, forecastDays),
    {
      fallbackData: initialCity.id === selectedCity.id && forecastDays === 7 ? initialWeather : undefined,
      revalidateOnFocus: false,
    },
  );

  const [filteredSearch, setFilteredSearch] = useState<GeocodingCity[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Búsqueda con debounce simple
  useEffect(() => {
    if (searchQuery.length < 2) {
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
    }, 500);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredCities = useMemo(() => {
    const base = searchQuery.length >= 2 ? filteredSearch : popularCities;
    if (selectedContinent === "Todos") return base;
    return base.filter((city) => city.continent === selectedContinent);
  }, [searchQuery, filteredSearch, popularCities, selectedContinent]);

  const handleCitySelect = (city: GeocodingCity) => {
    setSelectedCity(city);
    setShowCitySelector(false);
    setSearchQuery("");
    setFilteredSearch([]);
    setSelectedContinent("Todos");
  };

  const convertTemp = (temp: number | null) => {
    if (temp === null || temp === undefined) return "-";
    if (tempUnit === "F") return Math.round((temp * 9) / 5 + 32);
    return Math.round(temp);
  };

  const currentWeather = weather;

  const rainAlert = (() => {
    if (!currentWeather?.hourly?.precipitation_probability?.length) return null;
    const prob = currentWeather.hourly.precipitation_probability.slice(0, 3).map((p) => p ?? 0);
    const precip = currentWeather.hourly.precipitation?.slice(0, 3).map((p) => p ?? 0) ?? [];

    const maxProb = Math.max(...prob);
    if (maxProb < 30) return null;

    const maxIndex = prob.findIndex((p) => p === maxProb);
    const amount = precip[maxIndex] ?? 0;

    return { probability: maxProb, amount };
  })();

  const heatAlert = (() => {
    const tempC = currentWeather?.current?.temperature_2m;
    if (tempC === undefined || tempC === null) return null;
    if (tempC < 35) return null;
    return { tempC };
  })();

  return (
    <div className="min-h-screen bg-background p-4 pt-16">
      <div className="max-w-4xl mx-auto">
        <HeaderBar weather={currentWeather} icons={icons} />

        <CitySelector
          icons={icons}
          weather={currentWeather}
          selectedCity={selectedCity}
          setShowCitySelector={setShowCitySelector}
        />

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <icons.Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-sm text-text-secondary">Cargando datos...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-600 dark:text-red-400">
            ⚠️ No se pudieron obtener los datos del tiempo
          </div>
        )}

        {rainAlert && !isLoading && !error && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-200 rounded-lg p-3 mb-2 flex items-center gap-2 text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden />
            <span className="font-semibold">Lluvia probable en próximas horas</span>
            <span className="text-text-secondary">
              {`Probabilidad ${Math.round(rainAlert.probability)}%, ~${rainAlert.amount.toFixed(1)} mm esperados`}
            </span>
          </div>
        )}

        {currentWeather && !isLoading && (
          <>
            {heatAlert && !error && (
              <div className="bg-orange-500/10 border border-orange-500/30 text-orange-800 dark:text-orange-200 rounded-lg p-3 mb-2 flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" aria-hidden />
                <span className="font-semibold">Alerta de calor</span>
                <span className="text-text-secondary">{`Temperatura actual ${Math.round(heatAlert.tempC)}°C`} (≥ 35°C)</span>
              </div>
            )}

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

