"use client";

import { icons as defaultIcons } from "@/app/weather/services/weather-utils";

interface Props {
  icons?: typeof defaultIcons;
}

export default function FooterInfo({ icons = defaultIcons }: Props) {
  return (
    <div className="py-10 mt-8">
      <div className="text-center space-y-5">
        {/* Data attribution */}
        <div className="flex items-center justify-center gap-2 text-text-tertiary text-sm">
          <icons.Info className="w-4 h-4" />
          <span>
            Datos de{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-colors"
            >
              Open-Meteo API
            </a>
          </span>
        </div>

        {/* Blog link */}
        <a
          href="https://stackbp.es/blog/open-meteo-API"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-layer-3 text-text-tertiary hover:text-accent hover:border-accent/30 transition-all group"
        >
          <span className="text-sm">
            Cómo se construyó esta app
          </span>
          <icons.ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        {/* Credits */}
        <p className="text-xs text-text-tertiary">
          Desarrollado por Bori
        </p>
      </div>
    </div>
  );
}
