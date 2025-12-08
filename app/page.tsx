// app/weather/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Cloud, CloudRain, Sun, Wind, Droplets, Gauge, MapPin, 
  Search, X, ArrowLeft, Loader2, Github, Linkedin, BookOpen, ArrowUpRight,
  Thermometer, CloudSnow, Zap, Info, Globe
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    pressure_msl: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
  cityName: string;
  country: string;
}

interface GeocodingCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  continent?: string;
}

// Mapeo de country code a continente
const countryToContinent: { [key: string]: string } = {
  // Europa
  'ES': 'Europa', 'FR': 'Europa', 'DE': 'Europa', 'IT': 'Europa', 'GB': 'Europa',
  'PT': 'Europa', 'NL': 'Europa', 'BE': 'Europa', 'CH': 'Europa', 'AT': 'Europa',
  'GR': 'Europa', 'SE': 'Europa', 'NO': 'Europa', 'DK': 'Europa', 'FI': 'Europa',
  'PL': 'Europa', 'CZ': 'Europa', 'HU': 'Europa', 'RO': 'Europa', 'IE': 'Europa',
  
  // América
  'US': 'América', 'CA': 'América', 'MX': 'América', 'BR': 'América', 'AR': 'América',
  'CL': 'América', 'CO': 'América', 'PE': 'América', 'VE': 'América', 'EC': 'América',
  'UY': 'América', 'PY': 'América', 'BO': 'América', 'CR': 'América', 'PA': 'América',
  
  // Asia
  'CN': 'Asia', 'JP': 'Asia', 'KR': 'Asia', 'IN': 'Asia', 'TH': 'Asia',
  'SG': 'Asia', 'MY': 'Asia', 'PH': 'Asia', 'VN': 'Asia', 'ID': 'Asia',
  'TR': 'Asia', 'IL': 'Asia', 'AE': 'Asia', 'SA': 'Asia', 'HK': 'Asia',
  
  // Oceanía
  'AU': 'Oceanía', 'NZ': 'Oceanía', 'FJ': 'Oceanía', 'PG': 'Oceanía',
  
  // África
  'ZA': 'África', 'EG': 'África', 'MA': 'África', 'KE': 'África', 'NG': 'África',
  'TN': 'África', 'DZ': 'África', 'ET': 'África', 'GH': 'África', 'TZ': 'África',
};

// Función para obtener continente
const getContinent = (countryCode: string): string => {
  return countryToContinent[countryCode] || 'Otros';
};

// Ciudades populares con continente
const popularCities: GeocodingCity[] = [
  // Europa
  { id: 1, name: 'Madrid', latitude: 40.4168, longitude: -3.7038, country: 'España', country_code: 'ES', continent: 'Europa' },
  { id: 2, name: 'Barcelona', latitude: 41.3874, longitude: 2.1686, country: 'España', country_code: 'ES', continent: 'Europa' },
  { id: 3, name: 'Valencia', latitude: 39.4699, longitude: -0.3763, country: 'España', country_code: 'ES', continent: 'Europa' },
  { id: 4, name: 'Sevilla', latitude: 37.3891, longitude: -5.9845, country: 'España', country_code: 'ES', continent: 'Europa' },
  { id: 5, name: 'Málaga', latitude: 36.7213, longitude: -4.4214, country: 'España', country_code: 'ES', continent: 'Europa' },
  { id: 6, name: 'Bilbao', latitude: 43.2630, longitude: -2.9350, country: 'España', country_code: 'ES', continent: 'Europa' },
  { id: 7, name: 'París', latitude: 48.8566, longitude: 2.3522, country: 'Francia', country_code: 'FR', continent: 'Europa' },
  { id: 8, name: 'Londres', latitude: 51.5074, longitude: -0.1278, country: 'Reino Unido', country_code: 'GB', continent: 'Europa' },
  { id: 9, name: 'Roma', latitude: 41.9028, longitude: 12.4964, country: 'Italia', country_code: 'IT', continent: 'Europa' },
  { id: 10, name: 'Berlín', latitude: 52.5200, longitude: 13.4050, country: 'Alemania', country_code: 'DE', continent: 'Europa' },
  
  // América
  { id: 11, name: 'Nueva York', latitude: 40.7128, longitude: -74.0060, country: 'Estados Unidos', country_code: 'US', continent: 'América' },
  { id: 12, name: 'Los Ángeles', latitude: 34.0522, longitude: -118.2437, country: 'Estados Unidos', country_code: 'US', continent: 'América' },
  { id: 13, name: 'Toronto', latitude: 43.6532, longitude: -79.3832, country: 'Canadá', country_code: 'CA', continent: 'América' },
  { id: 14, name: 'Ciudad de México', latitude: 19.4326, longitude: -99.1332, country: 'México', country_code: 'MX', continent: 'América' },
  { id: 15, name: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816, country: 'Argentina', country_code: 'AR', continent: 'América' },
  { id: 16, name: 'São Paulo', latitude: -23.5505, longitude: -46.6333, country: 'Brasil', country_code: 'BR', continent: 'América' },
  
  // Asia
  { id: 17, name: 'Tokio', latitude: 35.6762, longitude: 139.6503, country: 'Japón', country_code: 'JP', continent: 'Asia' },
  { id: 18, name: 'Pekín', latitude: 39.9042, longitude: 116.4074, country: 'China', country_code: 'CN', continent: 'Asia' },
  { id: 19, name: 'Seúl', latitude: 37.5665, longitude: 126.9780, country: 'Corea del Sur', country_code: 'KR', continent: 'Asia' },
  { id: 20, name: 'Bangkok', latitude: 13.7563, longitude: 100.5018, country: 'Tailandia', country_code: 'TH', continent: 'Asia' },
  { id: 21, name: 'Dubái', latitude: 25.2048, longitude: 55.2708, country: 'Emiratos Árabes', country_code: 'AE', continent: 'Asia' },
  { id: 22, name: 'Singapur', latitude: 1.3521, longitude: 103.8198, country: 'Singapur', country_code: 'SG', continent: 'Asia' },
  
  // Oceanía
  { id: 23, name: 'Sídney', latitude: -33.8688, longitude: 151.2093, country: 'Australia', country_code: 'AU', continent: 'Oceanía' },
  { id: 24, name: 'Melbourne', latitude: -37.8136, longitude: 144.9631, country: 'Australia', country_code: 'AU', continent: 'Oceanía' },
  { id: 25, name: 'Auckland', latitude: -36.8485, longitude: 174.7633, country: 'Nueva Zelanda', country_code: 'NZ', continent: 'Oceanía' },
  
  // África
  { id: 26, name: 'Ciudad del Cabo', latitude: -33.9249, longitude: 18.4241, country: 'Sudáfrica', country_code: 'ZA', continent: 'África' },
  { id: 27, name: 'El Cairo', latitude: 30.0444, longitude: 31.2357, country: 'Egipto', country_code: 'EG', continent: 'África' },
  { id: 28, name: 'Marrakech', latitude: 31.6295, longitude: -7.9811, country: 'Marruecos', country_code: 'MA', continent: 'África' },
];

export default function WeatherApp() {
  const [selectedCity, setSelectedCity] = useState<GeocodingCity>(popularCities[4]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodingCity[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [selectedContinent, setSelectedContinent] = useState<string>('Todos');
  const [forecastDays, setForecastDays] = useState<7 | 16>(7); // Añadir este estado

  const continents = ['Todos', 'Europa', 'América', 'Asia', 'Oceanía', 'África'];

  // Fetch inicial
  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  // Búsqueda con debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchCities(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchCities = async (query: string) => {
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=50&language=es&format=json`
      );
      const data = await response.json();
      
      // Añadir continente a cada resultado
      const citiesWithContinent = (data.results || []).map((city: GeocodingCity) => ({
        ...city,
        continent: getContinent(city.country_code)
      }));
      
      setSearchResults(citiesWithContinent);
    } catch (error) {
      console.error('Error searching cities:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Filtrar ciudades por continente
  const filteredCities = useMemo(() => {
    const citiesToFilter = searchQuery.length >= 2 ? searchResults : popularCities;
    
    if (selectedContinent === 'Todos') {
      return citiesToFilter;
    }
    
    return citiesToFilter.filter(city => city.continent === selectedContinent);
  }, [searchQuery, searchResults, selectedContinent]);

  const fetchWeather = async (city: GeocodingCity) => {
    setLoading(true);
    setError('');
    
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=16&timezone=auto`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos');
      }
      
      const data = await response.json();
      setWeather({ 
        ...data, 
        cityName: city.name,
        country: city.country 
      });
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron obtener los datos del tiempo');
    } finally {
      setLoading(false);
    }
  };

  const convertTemp = (temp: number) => {
    if (tempUnit === 'F') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const getWeatherIcon = (code: number, size: 'sm' | 'lg' = 'lg') => {
    const sizeClass = size === 'lg' ? 'w-12 h-12' : 'w-5 h-5';
    
    if (code === 0) return <Sun className={`${sizeClass} text-yellow-500`} />;
    if (code <= 2) return (
      <div className="relative">
        <Sun className={`${sizeClass} text-yellow-500`} />
        <Cloud className={`${sizeClass} text-gray-400 absolute top-1 left-1 opacity-60`} />
      </div>
    );
    if (code === 3) return <Cloud className={`${sizeClass} text-gray-500`} />;
    if (code >= 45 && code <= 48) return <Cloud className={`${sizeClass} text-gray-400 opacity-80`} />;
    if (code >= 51 && code <= 67) return <CloudRain className={`${sizeClass} text-blue-500`} />;
    if (code >= 71 && code <= 77) return <CloudSnow className={`${sizeClass} text-blue-300`} />;
    if (code >= 95) return <Zap className={`${sizeClass} text-purple-500`} />;
    return <Cloud className={`${sizeClass} text-text-secondary`} />;
  };

  const getWeatherInfo = (code: number) => {
    const info: { [key: number]: { text: string, color: string, bg: string } } = {
      0: { text: 'Despejado', color: 'text-yellow-600', bg: 'from-yellow-50 to-orange-50' },
      1: { text: 'Principalmente despejado', color: 'text-yellow-600', bg: 'from-yellow-50 to-orange-50' },
      2: { text: 'Parcialmente nublado', color: 'text-blue-600', bg: 'from-blue-50 to-gray-50' },
      3: { text: 'Nublado', color: 'text-gray-600', bg: 'from-gray-50 to-gray-100' },
      45: { text: 'Niebla', color: 'text-gray-500', bg: 'from-gray-100 to-gray-200' },
      51: { text: 'Llovizna ligera', color: 'text-blue-500', bg: 'from-blue-50 to-blue-100' },
      61: { text: 'Lluvia ligera', color: 'text-blue-600', bg: 'from-blue-100 to-blue-200' },
      71: { text: 'Nieve ligera', color: 'text-cyan-500', bg: 'from-cyan-50 to-blue-50' },
      95: { text: 'Tormenta', color: 'text-purple-600', bg: 'from-purple-50 to-gray-100' }
    };
    return info[code] || { text: 'Desconocido', color: 'text-gray-500', bg: 'from-gray-50 to-gray-100' };
  };

  const handleCitySelect = (city: GeocodingCity) => {
    setSelectedCity(city);
    fetchWeather(city);
    setShowCitySelector(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedContinent('Todos');
  };

  return (
    <>
      {/* Header (sin cambios) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-layer-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            
            <Link
              href="/"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium text-sm hidden sm:inline">Back to Portfolio</span>
              <span className="font-medium text-sm sm:hidden">Back</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              <h1 className="text-base font-bold text-text-primary">
                ☁️ Weather App
              </h1>
              {weather && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <a
                href="https://www.linkedin.com/in/salvadorperez2021/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-canvas-subtle transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/bpstack/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-canvas-subtle transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-background p-4 pt-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Mobile title */}
          <div className="mb-6 md:hidden">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-1">
                  ☁️ El Tiempo
                </h1>
                <p className="text-sm text-text-secondary">
                  Datos meteorológicos en tiempo real
                </p>
              </div>
              {weather && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Desktop subtitle */}
          <div className="mb-6 hidden md:block">
            <p className="text-sm text-text-secondary text-center">
              Consulta el clima en tiempo real de ciudades de todo el mundo
            </p>
          </div>

          {/* City Selector */}
          <div className="bg-layer-1 border border-layer-3 rounded-lg p-4 mb-4 relative overflow-hidden">
            {weather && (
              <div className={`absolute inset-0 bg-gradient-to-r ${getWeatherInfo(weather.current.weather_code).bg} opacity-10 dark:opacity-5`} />
            )}
            
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                    Ubicación actual
                  </div>
                  <div className="font-semibold text-text-primary">
                    {selectedCity.name}, {selectedCity.country}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowCitySelector(true)}
                className="px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all font-medium text-sm shadow-sm hover:shadow-md"
              >
                Cambiar
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="text-sm text-text-secondary">Cargando datos...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-600 dark:text-red-400">
              ⚠️ {error}
            </div>
          )}

          {/* Weather Display */}
          {weather && weather.current && !loading && (
            <div className="space-y-4">
              
              {/* Current Weather */}
              <div className="bg-layer-1 border border-layer-3 rounded-lg overflow-hidden">
                <div className={`p-5 bg-gradient-to-r ${getWeatherInfo(weather.current.weather_code).bg} dark:bg-none`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-5xl font-bold text-text-primary">
                          {convertTemp(weather.current.temperature_2m)}°
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setTempUnit('C')}
                            className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
                              tempUnit === 'C' ? 'bg-accent text-white' : 'bg-layer-2 text-text-secondary hover:bg-layer-3'
                            }`}
                          >
                            °C
                          </button>
                          <button
                            onClick={() => setTempUnit('F')}
                            className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
                              tempUnit === 'F' ? 'bg-accent text-white' : 'bg-layer-2 text-text-secondary hover:bg-layer-3'
                            }`}
                          >
                            °F
                          </button>
                        </div>
                      </div>
                      
                      <div className={`text-lg font-medium mb-1 ${getWeatherInfo(weather.current.weather_code).color}`}>
                        {getWeatherInfo(weather.current.weather_code).text}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Thermometer className="w-3 h-3" />
                        <span>Sensación: {convertTemp(weather.current.apparent_temperature)}°</span>
                      </div>
                    </div>
                    
                    <div className="hidden sm:block">
                      {getWeatherIcon(weather.current.weather_code, 'lg')}
                    </div>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
                      <Droplets className="w-3 h-3 group-hover:text-accent transition-colors" />
                      <span className="text-xs uppercase tracking-wider">Humedad</span>
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {weather.current.relative_humidity_2m}%
                    </div>
                  </div>

                  <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
                      <Wind className="w-3 h-3 group-hover:text-accent transition-colors" />
                      <span className="text-xs uppercase tracking-wider">Viento</span>
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {Math.round(weather.current.wind_speed_10m)} 
                      <span className="text-xs font-normal text-text-secondary ml-1">km/h</span>
                    </div>
                  </div>

                  <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
                      <CloudRain className="w-3 h-3 group-hover:text-accent transition-colors" />
                      <span className="text-xs uppercase tracking-wider">Precipitación</span>
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {weather.current.precipitation} 
                      <span className="text-xs font-normal text-text-secondary ml-1">mm</span>
                    </div>
                  </div>

                  <div className="group bg-layer-2 rounded-lg p-3 border border-layer-3 hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
                      <Gauge className="w-3 h-3 group-hover:text-accent transition-colors" />
                      <span className="text-xs uppercase tracking-wider">Presión</span>
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {Math.round(weather.current.pressure_msl)} 
                      <span className="text-xs font-normal text-text-secondary ml-1">hPa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast */}
              {weather.daily && (
                <div className="bg-layer-1 border border-layer-3 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text-primary">
                      Pronóstico
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setForecastDays(7)}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          forecastDays === 7 ? 'bg-accent text-white' : 'bg-layer-2 text-text-secondary hover:bg-layer-3'
                        }`}
                      >
                        7 días
                      </button>
                      <button
                        onClick={() => setForecastDays(16)}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          forecastDays === 16 ? 'bg-accent text-white' : 'bg-layer-2 text-text-secondary hover:bg-layer-3'
                        }`}
                      >
                        16 días
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {weather.daily.time.slice(0, forecastDays).map((date, i) => {
                      const isToday = i === 0;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all border ${
                            isToday 
                              ? 'bg-accent/5 border-accent/20 dark:bg-accent/10' 
                              : 'hover:bg-layer-2 border-transparent hover:border-layer-3'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {getWeatherIcon(weather.daily.weather_code[i], 'sm')}
                            <div>
                              <span className="font-medium text-text-primary text-sm block">
                                {isToday ? 'Hoy' : new Date(date).toLocaleDateString('es-ES', {
                                  weekday: 'long'
                                })}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {new Date(date).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-text-secondary hidden md:block">
                              {getWeatherInfo(weather.daily.weather_code[i]).text}
                            </span>
                            <div className="flex gap-3 text-sm">
                              <span className="font-bold text-text-primary">
                                {convertTemp(weather.daily.temperature_2m_max[i])}°
                              </span>
                              <span className="text-text-secondary">
                                {convertTemp(weather.daily.temperature_2m_min[i])}°
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-layer-3">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-text-secondary text-xs">
                <Info className="w-3 h-3" />
                <span>
                  Datos proporcionados por{' '}
                  <a
                    href="https://open-meteo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-hover transition-colors"
                  >
                    Open-Meteo API
                  </a>
                </span>
              </div>
              
              <a
                href="https://stackbp.es/blog/open-meteo-API"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-layer-1 to-layer-2 border border-layer-3 text-text-secondary hover:text-accent hover:border-accent/50 transition-all group shadow-sm hover:shadow-md"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  Cómo se construyó esta app
                </span>
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              
              <div className="flex items-center justify-center gap-3 text-xs text-text-secondary/70">
                <span>Next.js 14</span>
                <span>•</span>
                <span>TypeScript</span>
                <span>•</span>
                <span>Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>

        {/* City Selector Modal CON FILTRO DE CONTINENTES */}
        {showCitySelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-layer-3 rounded-xl w-full max-w-lg max-h-[75vh] flex flex-col overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="p-4 border-b border-layer-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-text-primary">
                    Buscar ciudad
                  </h2>
                  <button
                    onClick={() => {
                      setShowCitySelector(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setSelectedContinent('Todos');
                    }}
                    className="p-1.5 rounded-lg hover:bg-layer-2 transition-colors"
                  >
                    <X className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>

                {/* Search */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Cerrar teclado
                    const input = e.currentTarget.querySelector('input');
                    if (input) input.blur();
                    
                    // Seleccionar primera ciudad si hay resultados
                    if (filteredCities.length > 0) {
                      handleCitySelect(filteredCities[0]);
                    }
                  }}
                  className="relative mb-3"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="search"
                    inputMode="search"
                    enterKeyHint="search"
                    placeholder="Escribe una ciudad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 bg-layer-1 border border-layer-3 rounded-lg focus:outline-none focus:border-accent text-text-primary placeholder:text-text-secondary text-sm"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-accent" />
                  )}
                </form>

                {/* Continent Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Globe className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                  <div className="flex gap-1.5">
                    {continents.map((continent) => (
                      <button
                        key={continent}
                        onClick={() => setSelectedContinent(continent)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                          selectedContinent === continent
                            ? 'bg-accent text-white'
                            : 'bg-layer-2 text-text-secondary hover:bg-layer-3'
                        }`}
                      >
                        {continent}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredCities.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary text-sm">
                    {searchQuery.length < 2 
                      ? 'Escribe al menos 2 caracteres para buscar'
                      : 'No se encontraron ciudades en este continente'
                    }
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs uppercase tracking-wider text-text-secondary font-medium">
                        {searchQuery.length >= 2 ? 'Resultados' : 'Ciudades populares'}
                      </h3>
                      <span className="text-xs text-text-secondary bg-layer-2 px-2 py-0.5 rounded">
                        {filteredCities.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {filteredCities.map((city) => (
                        <button
                          key={city.id}
                          onClick={() => handleCitySelect(city)}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-layer-1 hover:bg-layer-2 border border-layer-3 hover:border-accent-border transition-all text-left group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-text-primary text-sm group-hover:text-accent truncate">
                              {city.name}
                            </div>
                            <div className="text-xs text-text-secondary truncate">
                              {city.admin1 && `${city.admin1}, `}{city.country} • {city.continent}
                            </div>
                          </div>
                          <MapPin className="w-3.5 h-3.5 text-text-secondary group-hover:text-accent flex-shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}