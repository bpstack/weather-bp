"use client";

import { useEffect, useState, useCallback } from "react";
import { track } from "@vercel/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY_DISMISSED = "weather-bp-install-dismissed";

/* -------------------- helpers -------------------- */

function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: window-controls-overlay)").matches)
    return true;
  if (
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  )
    return true;
  if (document.referrer.startsWith("android-app://")) return true;
  return false;
}

function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  // iPhone, iPad, iPod classic detection
  if (/iP(hone|od|ad)/.test(ua)) return true;
  // iPadOS 13+ reports as Mac with touch support
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

function isInSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  // Safari but not Chrome/Firefox/Edge on iOS
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
}

/* -------------------- component -------------------- */

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return isAppInstalled();
  });
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY_DISMISSED) === "true";
  });

  const isIOS = typeof window !== "undefined" && isIOSDevice();
  const isSafari = typeof window !== "undefined" && isInSafari();

  // Listen for beforeinstallprompt (Chrome, Edge, etc.)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    track("pwa_install", { outcome, platform: "android" });
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  }, [isIOS, deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowIOSInstructions(false);
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
    track("pwa_install", {
      outcome: "dismissed",
      platform: isIOS ? "ios" : "android",
    });
  }, [isIOS]);

  const handleCloseIOSModal = useCallback(() => {
    setShowIOSInstructions(false);
  }, []);

  // Don't render anything if already installed
  if (installed) return null;

  // Determine if we should show the install button
  const canShowNativePrompt = deferredPrompt !== null;
  const canShowIOSPrompt = isIOS;
  const shouldShowButton =
    !dismissed && (canShowNativePrompt || canShowIOSPrompt);

  if (!shouldShowButton && !showIOSInstructions) return null;

  return (
    <>
      {/* Floating install button */}
      {shouldShowButton && (
        <div className="fixed bottom-6 left-6 z-50 animate-fade-in">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 text-sm font-medium"
            aria-label="Instalar aplicación"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Instalar App</span>
          </button>

          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 bg-white/90 dark:bg-gray-800/90 rounded-full w-6 h-6 flex items-center justify-center shadow text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}

      {/* iOS instructions modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={handleCloseIOSModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Instalar Weather BP
              </h3>
              <button
                onClick={handleCloseIOSModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {!isSafari ? (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Para instalar esta app necesitas usar Safari.
                </p>
                <p>
                  Abre esta misma URL en Safari y sigue las instrucciones de
                  instalación.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Para instalar esta app en tu dispositivo:
                </p>

                <ol className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-semibold">
                      1
                    </span>
                    <span className="pt-0.5">
                      Pulsa el botón{" "}
                      <strong className="text-[#007AFF]">Compartir</strong>{" "}
                      <svg
                        className="inline w-4 h-4 text-[#007AFF]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>{" "}
                      en la barra de Safari
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-semibold">
                      2
                    </span>
                    <span className="pt-0.5">
                      Desplázate y toca{" "}
                      <strong>&quot;Añadir a pantalla de inicio&quot;</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-semibold">
                      3
                    </span>
                    <span className="pt-0.5">
                      Pulsa <strong>&quot;Añadir&quot;</strong> arriba a la
                      derecha
                    </span>
                  </li>
                </ol>
              </>
            )}

            <button
              onClick={handleCloseIOSModal}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
