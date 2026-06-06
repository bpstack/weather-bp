"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WeatherData } from "@/app/weather/services/weather-service";
import { ArrowUpRight, Linkedin, Github } from "lucide-react";

interface HeaderProps {
  weather?: WeatherData | null;
}

function HeaderBar({ weather }: HeaderProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        {/* 3-column grid prevents center element from overlapping sides */}
        <div className="grid h-14" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
          {/* Left: brand */}
          <Link
            href="https://stackbp.es/"
            className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors group self-center justify-self-start"
          >
            <ArrowUpRight className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-medium text-[10px] sm:text-[11.5px] whitespace-nowrap overflow-hidden text-ellipsis">
              Created by stackbp
            </span>
          </Link>

          {/* Center: title + live badge */}
          <div className="flex items-center gap-2 self-center">
            <h1 className="font-semibold text-text-primary text-xs sm:text-sm whitespace-nowrap">
              <span className="sm:hidden">☁️</span>
              <span className="hidden sm:inline">☁️ Weather App</span>
            </h1>
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold"
              style={{ opacity: weather ? 1 : 0.5, color: "var(--color-live)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full wx-glow"
                style={{
                  background: "var(--color-live)",
                  boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-live) 22%, transparent)",
                }}
              />
              {weather ? "Live" : "···"}
            </span>
          </div>

          {/* Right: social + notifications + theme */}
          <div className="flex items-center gap-1 self-center justify-self-end">
            <a
              href="https://www.linkedin.com/in/salvadorperez2021/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/bpstack/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-layer-2 transition-all"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HeaderBar;
