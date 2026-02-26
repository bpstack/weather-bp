"use client";

import { Coffee } from "lucide-react";
import { icons as defaultIcons } from "@/app/weather/services/weather-utils";

interface Props {
  icons?: typeof defaultIcons;
}

export default function FooterInfo({ icons = defaultIcons }: Props) {
  return (
    <div className="py-8 mt-8">
      <div className="text-center space-y-4">
        {/* Data attribution */}
        <div className="text-xs text-text-tertiary">
          <span>Datos meteorológicos por </span>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-opacity hover:opacity-70"
          >
            Open-Meteo.com
          </a>
          <span> · </span>
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-opacity hover:opacity-70"
          >
            CC BY 4.0
          </a>
        </div>

        {/* Blog link */}
        <a
          href="https://stackbp.es/blog/open-meteo-API"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-accent transition-colors group"
        >
          <span>Cómo se construyó esta app</span>
          <icons.ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        {/* Credits */}
        <div className="flex items-center justify-center gap-1 text-[11px] text-text-tertiary/60">
          <span>Desarrollado por Bori</span>
          <Coffee className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
