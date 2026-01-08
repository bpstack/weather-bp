"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Solo registrar en producción y si el navegador soporta Service Workers
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

          console.log(
            "[SW] Service Worker registrado correctamente:",
            registration,
          );

          // Verificar actualizaciones cada hora
          setInterval(
            () => {
              registration.update();
            },
            60 * 60 * 1000,
          ); // 1 hora

          // Escuchar cuando hay un nuevo SW instalado
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // Hay una nueva versión disponible
                  console.log("[SW] Nueva versión disponible");

                  // Disparar evento personalizado para mostrar notificación
                  window.dispatchEvent(
                    new CustomEvent("swUpdateAvailable", {
                      detail: { registration },
                    }),
                  );
                }
              });
            }
          });
        } catch (error) {
          console.error("[SW] Error al registrar Service Worker:", error);
        }
      };

      registerSW();
    }
  }, []);

  return null;
}
