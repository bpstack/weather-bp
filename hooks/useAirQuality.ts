"use client";

import useSWR from "swr";
import { GeocodingCity } from "@/app/weather/services/city-utils";
import { fetchAirQuality } from "@/app/weather/services/air-quality";

export function useAirQuality(city: GeocodingCity | null) {
  const { data } = useSWR(
    city ? ["air-quality", city.id] : null,
    () =>
      city
        ? fetchAirQuality({
            latitude: city.latitude,
            longitude: city.longitude,
          })
        : null,
    {
      revalidateOnFocus: false,
      // Air quality moves slowly; don't hammer the endpoint.
      dedupingInterval: 10 * 60 * 1000,
      shouldRetryOnError: false,
    },
  );

  return data ?? null;
}
