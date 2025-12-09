"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WeatherData } from "@/app/weather/services/weather-service";
import { icons as defaultIcons } from "@/app/weather/services/weather-utils";

interface HeaderProps {
  weather?: WeatherData;
  icons?: typeof defaultIcons;
}

function HeaderBar({ weather, icons = defaultIcons }: HeaderProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-layer-3">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group"
          >
            <icons.ArrowUpRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-sm hidden sm:inline">Created by stackbp</span>
            <span className="font-medium text-sm sm:hidden">Back</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <h1 className="text-base font-bold text-text-primary">☁️ Weather App</h1>
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
              <icons.Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/bpstack/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-canvas-subtle transition-colors"
              aria-label="GitHub"
            >
              <icons.Github className="h-4 w-4" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HeaderBar;
