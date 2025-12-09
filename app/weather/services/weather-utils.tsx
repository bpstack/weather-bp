import { ReactNode } from "react";
import {
  ArrowUpRight,
  Cloud,
  CloudRain,
  CloudSnow,
  Droplets,
  Gauge,
  Info,
  MapPin,
  Search,
  Sun,
  Thermometer,
  Wind,
  Zap,
  Globe,
  X,
  Loader2,
  Github,
  Linkedin,
} from "lucide-react";

export const icons = {
  ArrowUpRight,
  Cloud,
  CloudRain,
  CloudSnow,
  Droplets,
  Gauge,
  Info,
  MapPin,
  Search,
  Sun,
  Thermometer,
  Wind,
  Zap,
  Globe,
  X,
  Loader2,
  Github,
  Linkedin,
};


export const getWeatherIcon = (code: number | null, size: "sm" | "lg" = "lg"): ReactNode => {
  const sizeClass = size === "lg" ? "w-12 h-12" : "w-5 h-5";

  if (code === null || code === undefined) return <Cloud className={`${sizeClass} text-text-secondary`} />;
  if (code === 0) return <Sun className={`${sizeClass} text-yellow-500`} />;
  if (code <= 2)
    return (
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

export const getWeatherInfo = (
  code: number | null,
): { text: string; color: string; bg: string } => {
  const info: { [key: number]: { text: string; color: string; bg: string } } = {
    0: { text: "Despejado", color: "text-yellow-600", bg: "from-yellow-50 to-orange-50" },
    1: { text: "Principalmente despejado", color: "text-yellow-600", bg: "from-yellow-50 to-orange-50" },
    2: { text: "Parcialmente nublado", color: "text-blue-600", bg: "from-blue-50 to-gray-50" },
    3: { text: "Nublado", color: "text-gray-600", bg: "from-gray-50 to-gray-100" },
    45: { text: "Niebla", color: "text-gray-500", bg: "from-gray-100 to-gray-200" },
    51: { text: "Llovizna ligera", color: "text-blue-500", bg: "from-blue-50 to-blue-100" },
    61: { text: "Lluvia ligera", color: "text-blue-600", bg: "from-blue-100 to-blue-200" },
    71: { text: "Nieve ligera", color: "text-cyan-500", bg: "from-cyan-50 to-blue-50" },
    95: { text: "Tormenta", color: "text-purple-600", bg: "from-purple-50 to-gray-100" },
  };
  if (code === null || code === undefined) {
    return { text: "Desconocido", color: "text-gray-500", bg: "from-gray-50 to-gray-100" };
  }
  return info[code] || { text: "Desconocido", color: "text-gray-500", bg: "from-gray-50 to-gray-100" };
};
