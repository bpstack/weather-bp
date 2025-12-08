import { Suspense } from "react";
import { fetchWeather } from "./services/weather-service";
import { getPopularCities } from "./services/city-utils";
import WeatherClient from "@/components/weather/WeatherClient";

export const dynamic = "force-dynamic";

export default async function WeatherPage() {
  const defaultCity = getPopularCities()[4];
  const weather = await fetchWeather({
    latitude: defaultCity.latitude,
    longitude: defaultCity.longitude,
    cityName: defaultCity.name,
    country: defaultCity.country,
  });

  return (
    <Suspense fallback={null}>
      <WeatherClient initialCity={defaultCity} initialWeather={weather} />
    </Suspense>
  );
}
