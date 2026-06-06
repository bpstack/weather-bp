"use client";

import { ArrowUpRight } from "lucide-react";

export default function FooterInfo() {
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
          <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        {/* Ko-fi pill */}
        <div>
          <a
            href="https://ko-fi.com/I2I31XW2OT"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:shadow-sm"
          >
            <span className="relative inline-block" aria-hidden="true">
              <span className="steam-waft absolute -top-2 left-[15%] w-[2px] h-2.5 rounded-full bg-text-tertiary opacity-0" />
              <span className="steam-waft absolute -top-2.5 left-[65%] w-[2px] h-3 rounded-full bg-text-tertiary opacity-0" />
              <span className="text-sm inline-block transition-transform duration-300 group-hover:scale-125">☕</span>
            </span>
            <span className="text-xs text-text-tertiary/60 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-300">
              ¿Te ha servido? Apóyalo con un café
            </span>
            <span className="text-xs text-amber-500 dark:text-amber-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
              →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
