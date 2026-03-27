"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WeatherData } from "@/app/weather/services/weather-service";
import { icons as defaultIcons } from "@/app/weather/services/weather-utils";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  weather?: WeatherData | null;
  icons?: typeof defaultIcons;
}

function HeaderBar({ weather, icons = defaultIcons }: HeaderProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Left: Brand */}
          <Link
            href="https://stackbp.es/"
            className="flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors group"
          >
            <icons.ArrowUpRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-[10px] sm:text-xs">
              Created by stackbp
            </span>
          </Link>

          {/* Center: Title with status */}
          <div className="flex items-center gap-1.5 sm:gap-2 absolute left-1/2 -translate-x-1/2">
            <h1 className="text-xs sm:text-sm font-semibold text-text-primary">
              <span className="sm:hidden">☁️</span>
              <span className="hidden sm:inline">☁️ Weather App</span>
            </h1>
            <span
              className="flex items-center gap-1 px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs min-w-[45px] transition-colors"
              style={{ opacity: weather ? 1 : 0.5 }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  weather ? "bg-green-500 animate-pulse" : "bg-gray-300"
                }`}
              />
              <span
                className={
                  weather ? "text-green-700 dark:text-green-400" : "text-text-tertiary"
                }
              >
                {weather ? "Live" : "···"}
              </span>
            </span>
          </div>

          {/* Right: Social + Notifications + Theme */}
          <div className="flex items-center gap-1">
            <a
              href="https://www.linkedin.com/in/salvadorperez2021/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
              aria-label="LinkedIn"
            >
              <icons.Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/bpstack/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
              aria-label="GitHub"
            >
              <icons.Github className="h-4 w-4" />
            </a>
            {weather && <NotificationBell weather={weather} />}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HeaderBar;
