"use client";

import { useEffect, useState } from "react";

// Activa esto cuando despliegues cambios de manifest/iconos que requieran reinstalar
const SHOW_REINSTALL_TIP = true;

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShowUpdate(true);
    };

    window.addEventListener("swUpdateAvailable", handleUpdate);

    return () => {
      window.removeEventListener("swUpdateAvailable", handleUpdate);
    };
  }, []);

  const handleUpdate = () => {
    // Recargar la página para activar el nuevo Service Worker
    window.location.reload();
  };

  const handleClose = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-2xl p-4 backdrop-blur-sm border border-white/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Nueva versión disponible
            </h3>
            <p
              className={`text-xs text-white/90 ${SHOW_REINSTALL_TIP ? "mb-2" : "mb-3"}`}
            >
              Actualiza para obtener las últimas mejoras.
            </p>
            {SHOW_REINSTALL_TIP && (
              <p className="text-xs text-white/70 mb-3">
                Para cambios visuales completos, reinstala la app (eliminar y
                añadir de nuevo).
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-white text-indigo-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Actualizar
              </button>
              <button
                onClick={handleClose}
                className="bg-white/20 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
