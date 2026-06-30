import { ReactNode } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { WeatherIcon } from "@/components/weather/icons/WeatherIcon";
import type { WeatherData } from "./weather-service";

export const icons = { MapPin, Navigation, Loader2 };

export function isNightTime(weather: WeatherData): boolean {
  // Prefer the API's is_day flag (handles polar day/night, DST, etc.);
  // fall back to sunrise/sunset comparison when it is unavailable.
  if (typeof weather.current.is_day === "number") {
    return weather.current.is_day === 0;
  }
  const hour = parseInt(weather.current.time.slice(11, 13), 10);
  const sunrise = weather.daily.sunrise?.[0];
  const sunset = weather.daily.sunset?.[0];
  const sunriseH = sunrise ? parseInt(sunrise.slice(11, 13), 10) : 7;
  const sunsetH = sunset ? parseInt(sunset.slice(11, 13), 10) : 20;
  return hour < sunriseH || hour >= sunsetH;
}

export const getWeatherIcon = (
  code: number | null,
  size: "sm" | "lg" = "lg",
  night = false,
): ReactNode => {
  const px = size === "sm" ? 36 : 64;
  return <WeatherIcon code={code ?? undefined} night={night} size={px} />;
};

// ── Dynamic background palette (from design reference) ────────────────
type ThemeColors = {
  light: [string, string, string];
  dark: [string, string, string];
  glow: string;
};

const WX_THEME: Record<string, ThemeColors> = {
  "clear-day": {
    light: ["#FFF6E3", "#FDE7C2", "#FAD9F0"],
    dark: ["#1B2233", "#241F33", "#2A2436"],
    glow: "#F7B733",
  },
  "partly-day": {
    light: ["#F2F7FF", "#E6EEFA", "#FBEFD9"],
    dark: ["#161E2E", "#1C2336", "#23283A"],
    glow: "#7FB2F0",
  },
  cloudy: {
    light: ["#F4F6FA", "#E8ECF3", "#DEE3EC"],
    dark: ["#16181F", "#1B1E27", "#212530"],
    glow: "#9AA6BC",
  },
  fog: {
    light: ["#F1F3F6", "#E5E9EF", "#DADFE7"],
    dark: ["#15171C", "#1A1D24", "#1F232B"],
    glow: "#AEB7C7",
  },
  drizzle: {
    light: ["#EEF5FC", "#DFEBF7", "#D2E3F2"],
    dark: ["#121821", "#16202D", "#1B2735"],
    glow: "#5FA8E8",
  },
  rain: {
    light: ["#E9F1F9", "#D6E5F2", "#C4D8EC"],
    dark: ["#0F151E", "#131D29", "#172534"],
    glow: "#4F9BE6",
  },
  snow: {
    light: ["#F3F8FC", "#E6F0F8", "#DCEAF5"],
    dark: ["#13181F", "#181F28", "#1D2733"],
    glow: "#BcdcF5",
  },
  thunder: {
    light: ["#F0EEF7", "#E2DEF0", "#D8D2EC"],
    dark: ["#16141F", "#1B1826", "#211C30"],
    glow: "#9B7BE0",
  },
  "clear-night": {
    light: ["#EDF1FA", "#E2E8F5", "#D8DFF0"],
    dark: ["#0E1320", "#12172A", "#171C33"],
    glow: "#5B6CC0",
  },
  "partly-night": {
    light: ["#EDF1FA", "#E2E8F5", "#D8DFF0"],
    dark: ["#0E1320", "#12172A", "#171C33"],
    glow: "#5B6CC0",
  },
};

export function getWeatherBackground(
  conditionKey: string,
  isDark: boolean,
): string {
  const t = WX_THEME[conditionKey] ?? WX_THEME["cloudy"];
  const mode = isDark ? "dark" : "light";
  const [a, b, c] = t[mode];
  const opacity = isDark ? "30" : "55";
  return (
    `radial-gradient(125% 78% at 82% -12%, ${t.glow}${opacity}, transparent 58%), ` +
    `linear-gradient(168deg, ${a} 0%, ${b} 52%, ${c} 100%)`
  );
}

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

  if (code === 0)
    return {
      text: "Despejado",
      color: "text-amber-600",
      bg: "from-amber-100/80 to-orange-100/60",
    };
  if (code === 1)
    return {
      text: "Principalmente despejado",
      color: "text-amber-600",
      bg: "from-amber-100/70 to-yellow-100/50",
    };
  if (code === 2)
    return {
      text: "Parcialmente nublado",
      color: "text-sky-600",
      bg: "from-sky-100/60 to-slate-100/40",
    };
  if (code === 3)
    return {
      text: "Nublado",
      color: "text-slate-600",
      bg: "from-slate-100/70 to-slate-200/50",
    };

  if (code === 45)
    return {
      text: "Niebla",
      color: "text-slate-500",
      bg: "from-slate-200/60 to-slate-100/40",
    };
  if (code === 48)
    return {
      text: "Niebla con escarcha",
      color: "text-slate-500",
      bg: "from-slate-200/70 to-cyan-100/30",
    };

  if (code === 51)
    return {
      text: "Llovizna ligera",
      color: "text-sky-500 dark:text-sky-400",
      bg: "from-sky-100/60 to-blue-100/40",
    };
  if (code === 53)
    return {
      text: "Llovizna moderada",
      color: "text-sky-600 dark:text-sky-400",
      bg: "from-sky-100/70 to-blue-100/50",
    };
  if (code === 55)
    return {
      text: "Llovizna intensa",
      color: "text-blue-600 dark:text-sky-400",
      bg: "from-blue-100/70 to-sky-100/50",
    };
  if (code === 56)
    return {
      text: "Llovizna helada ligera",
      color: "text-sky-500 dark:text-sky-400",
      bg: "from-sky-100/60 to-cyan-100/40",
    };
  if (code === 57)
    return {
      text: "Llovizna helada intensa",
      color: "text-blue-600 dark:text-sky-400",
      bg: "from-blue-100/70 to-cyan-100/50",
    };

  if (code === 61)
    return {
      text: "Lluvia ligera",
      color: "text-blue-600 dark:text-sky-400",
      bg: "from-blue-100/70 to-sky-100/50",
    };
  if (code === 63)
    return {
      text: "Lluvia moderada",
      color: "text-blue-600 dark:text-sky-400",
      bg: "from-blue-200/70 to-blue-100/50",
    };
  if (code === 65)
    return {
      text: "Lluvia intensa",
      color: "text-blue-700 dark:text-sky-400",
      bg: "from-blue-200/80 to-slate-200/50",
    };
  if (code === 66)
    return {
      text: "Lluvia helada ligera",
      color: "text-blue-600 dark:text-sky-400",
      bg: "from-blue-100/70 to-cyan-100/50",
    };
  if (code === 67)
    return {
      text: "Lluvia helada intensa",
      color: "text-blue-700 dark:text-sky-400",
      bg: "from-blue-200/80 to-cyan-100/50",
    };

  if (code === 71)
    return {
      text: "Nevada ligera",
      color: "text-cyan-600 dark:text-sky-300",
      bg: "from-cyan-100/60 to-sky-100/40",
    };
  if (code === 73)
    return {
      text: "Nevada moderada",
      color: "text-cyan-600 dark:text-sky-300",
      bg: "from-cyan-100/70 to-blue-100/50",
    };
  if (code === 75)
    return {
      text: "Nevada intensa",
      color: "text-cyan-700 dark:text-sky-300",
      bg: "from-cyan-200/70 to-blue-100/50",
    };
  if (code === 77)
    return {
      text: "Granizo",
      color: "text-cyan-600 dark:text-sky-300",
      bg: "from-slate-200/60 to-cyan-100/40",
    };

  if (code === 80)
    return {
      text: "Chubascos ligeros",
      color: "text-blue-600 dark:text-sky-400",
      bg: "from-blue-100/70 to-sky-100/50",
    };
  if (code === 81)
    return {
      text: "Chubascos moderados",
      color: "text-blue-600 dark:text-sky-400",
      bg: "from-blue-200/70 to-sky-100/50",
    };
  if (code === 82)
    return {
      text: "Chubascos intensos",
      color: "text-blue-700 dark:text-sky-400",
      bg: "from-blue-200/80 to-slate-200/50",
    };
  if (code === 85)
    return {
      text: "Chubascos de nieve ligeros",
      color: "text-cyan-600 dark:text-sky-300",
      bg: "from-cyan-100/70 to-blue-100/50",
    };
  if (code === 86)
    return {
      text: "Chubascos de nieve intensos",
      color: "text-cyan-700 dark:text-sky-300",
      bg: "from-cyan-200/70 to-blue-100/50",
    };

  if (code === 95)
    return {
      text: "Tormenta y lluvia",
      color: "text-violet-600 dark:text-violet-400",
      bg: "from-violet-100/70 to-slate-200/50",
    };
  if (code === 96)
    return {
      text: "Tormenta, lluvia y granizo ligero",
      color: "text-violet-700 dark:text-violet-400",
      bg: "from-violet-200/70 to-slate-200/50",
    };
  if (code === 99)
    return {
      text: "Tormenta, lluvia y granizo intenso",
      color: "text-purple-700 dark:text-violet-400",
      bg: "from-purple-200/70 to-slate-200/50",
    };

  return {
    text: "Desconocido",
    color: "text-gray-500",
    bg: "from-gray-50 to-gray-100",
  };
};
