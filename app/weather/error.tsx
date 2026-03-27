"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function WeatherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[WeatherError]", error);
    try {
      track("route_error", {
        message: error.message,
        digest: error.digest ?? "",
      });
    } catch {
      // analytics unavailable
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-text-primary text-lg font-medium mb-2">
          Algo salió mal
        </p>
        <p className="text-text-secondary text-sm mb-6">
          No se pudieron cargar los datos del tiempo.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-all text-sm font-medium"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
