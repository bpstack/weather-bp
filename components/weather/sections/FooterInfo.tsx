"use client";

import { icons as defaultIcons } from "@/app/weather/services/weather-utils";

interface Props {
  icons?: typeof defaultIcons;
}

export default function FooterInfo({ icons = defaultIcons }: Props) {
  return (
    <div className="mt-8 pt-6 border-t border-layer-3">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-text-secondary text-xs">
          <icons.Info className="w-3 h-3" />
          <span>
            Datos proporcionados por{" "}
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
          <icons.Info className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Cómo se construyó esta app</span>
          <icons.ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <div className="flex items-center justify-center gap-3 text-[11px] text-text-secondary/70 italic">
          <span>Desarrollado por Bori</span>
        </div>
      </div>
    </div>
  );
}
