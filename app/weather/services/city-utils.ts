export type GeocodingCity = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  continent?: string;
};

const countryToContinent: Record<string, string> = {
  ES: "Europa",
  FR: "Europa",
  DE: "Europa",
  IT: "Europa",
  GB: "Europa",
  PT: "Europa",
  NL: "Europa",
  BE: "Europa",
  CH: "Europa",
  AT: "Europa",
  GR: "Europa",
  SE: "Europa",
  NO: "Europa",
  DK: "Europa",
  FI: "Europa",
  PL: "Europa",
  CZ: "Europa",
  HU: "Europa",
  RO: "Europa",
  IE: "Europa",
  US: "América",
  CA: "América",
  MX: "América",
  BR: "América",
  AR: "América",
  CL: "América",
  CO: "América",
  PE: "América",
  VE: "América",
  EC: "América",
  UY: "América",
  PY: "América",
  BO: "América",
  CR: "América",
  PA: "América",
  CN: "Asia",
  JP: "Asia",
  KR: "Asia",
  IN: "Asia",
  TH: "Asia",
  SG: "Asia",
  MY: "Asia",
  PH: "Asia",
  VN: "Asia",
  ID: "Asia",
  TR: "Asia",
  IL: "Asia",
  AE: "Asia",
  SA: "Asia",
  HK: "Asia",
  AU: "Oceanía",
  NZ: "Oceanía",
  FJ: "Oceanía",
  PG: "Oceanía",
  ZA: "África",
  EG: "África",
  MA: "África",
  KE: "África",
  NG: "África",
  TN: "África",
  DZ: "África",
  ET: "África",
  GH: "África",
  TZ: "África",
};

export const getContinent = (countryCode: string): string => {
  return countryToContinent[countryCode] || "Otros";
};

export const popularCities: GeocodingCity[] = [
  { id: 1, name: "Madrid", latitude: 40.4168, longitude: -3.7038, country: "España", country_code: "ES", continent: "Europa" },
  { id: 2, name: "Barcelona", latitude: 41.3874, longitude: 2.1686, country: "España", country_code: "ES", continent: "Europa" },
  { id: 3, name: "Valencia", latitude: 39.4699, longitude: -0.3763, country: "España", country_code: "ES", continent: "Europa" },
  { id: 4, name: "Sevilla", latitude: 37.3891, longitude: -5.9845, country: "España", country_code: "ES", continent: "Europa" },
  { id: 5, name: "Málaga", latitude: 36.7213, longitude: -4.4214, country: "España", country_code: "ES", continent: "Europa" },
  { id: 6, name: "Bilbao", latitude: 43.263, longitude: -2.935, country: "España", country_code: "ES", continent: "Europa" },
  { id: 7, name: "París", latitude: 48.8566, longitude: 2.3522, country: "Francia", country_code: "FR", continent: "Europa" },
  { id: 8, name: "Londres", latitude: 51.5074, longitude: -0.1278, country: "Reino Unido", country_code: "GB", continent: "Europa" },
  { id: 9, name: "Roma", latitude: 41.9028, longitude: 12.4964, country: "Italia", country_code: "IT", continent: "Europa" },
  { id: 10, name: "Berlín", latitude: 52.52, longitude: 13.405, country: "Alemania", country_code: "DE", continent: "Europa" },
  { id: 11, name: "Nueva York", latitude: 40.7128, longitude: -74.006, country: "Estados Unidos", country_code: "US", continent: "América" },
  { id: 12, name: "Los Ángeles", latitude: 34.0522, longitude: -118.2437, country: "Estados Unidos", country_code: "US", continent: "América" },
  { id: 13, name: "Toronto", latitude: 43.6532, longitude: -79.3832, country: "Canadá", country_code: "CA", continent: "América" },
  { id: 14, name: "Ciudad de México", latitude: 19.4326, longitude: -99.1332, country: "México", country_code: "MX", continent: "América" },
  { id: 15, name: "Buenos Aires", latitude: -34.6037, longitude: -58.3816, country: "Argentina", country_code: "AR", continent: "América" },
  { id: 16, name: "São Paulo", latitude: -23.5505, longitude: -46.6333, country: "Brasil", country_code: "BR", continent: "América" },
  { id: 17, name: "Tokio", latitude: 35.6762, longitude: 139.6503, country: "Japón", country_code: "JP", continent: "Asia" },
  { id: 18, name: "Pekín", latitude: 39.9042, longitude: 116.4074, country: "China", country_code: "CN", continent: "Asia" },
  { id: 19, name: "Seúl", latitude: 37.5665, longitude: 126.978, country: "Corea del Sur", country_code: "KR", continent: "Asia" },
  { id: 20, name: "Bangkok", latitude: 13.7563, longitude: 100.5018, country: "Tailandia", country_code: "TH", continent: "Asia" },
  { id: 21, name: "Dubái", latitude: 25.2048, longitude: 55.2708, country: "Emiratos Árabes", country_code: "AE", continent: "Asia" },
  { id: 22, name: "Singapur", latitude: 1.3521, longitude: 103.8198, country: "Singapur", country_code: "SG", continent: "Asia" },
  { id: 23, name: "Sídney", latitude: -33.8688, longitude: 151.2093, country: "Australia", country_code: "AU", continent: "Oceanía" },
  { id: 24, name: "Melbourne", latitude: -37.8136, longitude: 144.9631, country: "Australia", country_code: "AU", continent: "Oceanía" },
  { id: 25, name: "Auckland", latitude: -36.8485, longitude: 174.7633, country: "Nueva Zelanda", country_code: "NZ", continent: "Oceanía" },
  { id: 26, name: "Ciudad del Cabo", latitude: -33.9249, longitude: 18.4241, country: "Sudáfrica", country_code: "ZA", continent: "África" },
  { id: 27, name: "El Cairo", latitude: 30.0444, longitude: 31.2357, country: "Egipto", country_code: "EG", continent: "África" },
  { id: 28, name: "Marrakech", latitude: 31.6295, longitude: -7.9811, country: "Marruecos", country_code: "MA", continent: "África" },
];

export const getPopularCities = () => popularCities;
