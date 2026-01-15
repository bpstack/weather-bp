import { ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Gauge,
  Info,
  MapPin,
  Navigation,
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
  ChevronDown,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Gauge,
  Info,
  MapPin,
  Navigation,
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

export const getWeatherIcon = (
  code: number | null,
  size: "sm" | "lg" = "lg",
): ReactNode => {
  const sizeClass = size === "lg" ? "w-12 h-12" : "w-5 h-5";

  if (code === null || code === undefined)
    return <Cloud className={`${sizeClass} text-text-secondary`} />;
  if (code === 0) return <Sun className={`${sizeClass} text-yellow-500`} />;
  if (code <= 2)
    return (
      <div className="relative">
        <Sun className={`${sizeClass} text-yellow-500`} />
        <Cloud
          className={`${sizeClass} text-gray-400 absolute top-1 left-1 opacity-60`}
        />
      </div>
    );
  if (code === 3) return <Cloud className={`${sizeClass} text-gray-500`} />;
  if (code >= 45 && code <= 48)
    return <Cloud className={`${sizeClass} text-gray-400 opacity-80`} />;
  if (code >= 51 && code <= 67)
    return <CloudRain className={`${sizeClass} text-blue-500`} />;
  if (code >= 71 && code <= 77)
    return <CloudSnow className={`${sizeClass} text-blue-300`} />;
  if (code >= 95)
    return <CloudLightning className={`${sizeClass} text-purple-500`} />;
  return <Cloud className={`${sizeClass} text-text-secondary`} />;
};

export const getWeatherInfo = (
  code: number | null,
): { text: string; color: string; bg: string } => {
  if (code === null || code === undefined) {
    return {
      text: "Desconocido",
      color: "text-gray-500",
      bg: "from-gray-50 to-gray-100",
    };
  }

  // WMO Weather interpretation codes
  // Clear / Sunny - warm yellows and ambers
  if (code === 0) return { text: "Despejado", color: "text-amber-600", bg: "from-amber-100/80 to-orange-100/60" };
  if (code === 1) return { text: "Principalmente despejado", color: "text-amber-600", bg: "from-amber-100/70 to-yellow-100/50" };
  if (code === 2) return { text: "Parcialmente nublado", color: "text-sky-600", bg: "from-sky-100/60 to-slate-100/40" };
  if (code === 3) return { text: "Nublado", color: "text-slate-600", bg: "from-slate-100/70 to-slate-200/50" };

  // Fog - soft grays with subtle blue
  if (code === 45) return { text: "Niebla", color: "text-slate-500", bg: "from-slate-200/60 to-slate-100/40" };
  if (code === 48) return { text: "Niebla con escarcha", color: "text-slate-500", bg: "from-slate-200/70 to-cyan-100/30" };

  // Drizzle - light blues
  if (code === 51) return { text: "Llovizna ligera", color: "text-sky-500", bg: "from-sky-100/60 to-blue-100/40" };
  if (code === 53) return { text: "Llovizna moderada", color: "text-sky-600", bg: "from-sky-100/70 to-blue-100/50" };
  if (code === 55) return { text: "Llovizna intensa", color: "text-blue-600", bg: "from-blue-100/70 to-sky-100/50" };
  if (code === 56) return { text: "Llovizna helada ligera", color: "text-sky-500", bg: "from-sky-100/60 to-cyan-100/40" };
  if (code === 57) return { text: "Llovizna helada intensa", color: "text-blue-600", bg: "from-blue-100/70 to-cyan-100/50" };

  // Rain - deeper blues
  if (code === 61) return { text: "Lluvia ligera", color: "text-blue-600", bg: "from-blue-100/70 to-sky-100/50" };
  if (code === 63) return { text: "Lluvia moderada", color: "text-blue-600", bg: "from-blue-200/70 to-blue-100/50" };
  if (code === 65) return { text: "Lluvia intensa", color: "text-blue-700", bg: "from-blue-200/80 to-slate-200/50" };
  if (code === 66) return { text: "Lluvia helada ligera", color: "text-blue-600", bg: "from-blue-100/70 to-cyan-100/50" };
  if (code === 67) return { text: "Lluvia helada intensa", color: "text-blue-700", bg: "from-blue-200/80 to-cyan-100/50" };

  // Snow - cool cyans and light blues
  if (code === 71) return { text: "Nevada ligera", color: "text-cyan-600", bg: "from-cyan-100/60 to-sky-100/40" };
  if (code === 73) return { text: "Nevada moderada", color: "text-cyan-600", bg: "from-cyan-100/70 to-blue-100/50" };
  if (code === 75) return { text: "Nevada intensa", color: "text-cyan-700", bg: "from-cyan-200/70 to-blue-100/50" };
  if (code === 77) return { text: "Granizo", color: "text-cyan-600", bg: "from-slate-200/60 to-cyan-100/40" };

  // Showers
  if (code === 80) return { text: "Chubascos ligeros", color: "text-blue-600", bg: "from-blue-100/70 to-sky-100/50" };
  if (code === 81) return { text: "Chubascos moderados", color: "text-blue-600", bg: "from-blue-200/70 to-sky-100/50" };
  if (code === 82) return { text: "Chubascos intensos", color: "text-blue-700", bg: "from-blue-200/80 to-slate-200/50" };
  if (code === 85) return { text: "Chubascos de nieve ligeros", color: "text-cyan-600", bg: "from-cyan-100/70 to-blue-100/50" };
  if (code === 86) return { text: "Chubascos de nieve intensos", color: "text-cyan-700", bg: "from-cyan-200/70 to-blue-100/50" };

  // Thunderstorm - dramatic purples
  if (code === 95) return { text: "Tormenta y lluvia", color: "text-violet-600", bg: "from-violet-100/70 to-slate-200/50" };
  if (code === 96) return { text: "Tormenta, lluvia y granizo ligero", color: "text-violet-700", bg: "from-violet-200/70 to-slate-200/50" };
  if (code === 99) return { text: "Tormenta, lluvia y granizo intenso", color: "text-purple-700", bg: "from-purple-200/70 to-slate-200/50" };

  return {
    text: "Desconocido",
    color: "text-gray-500",
    bg: "from-gray-50 to-gray-100",
  };
};
