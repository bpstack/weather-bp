"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

const STORAGE_KEY_HIDDEN = "weather-bp-install-prompt-hidden";
const STORAGE_KEY_IOS_SHOWN = "weather-bp-ios-instructions-shown";

/* -------------------- helpers -------------------- */

function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if ((window.navigator as NavigatorWithStandalone).standalone === true) return true;
  return false;
}

function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const notMSStream = !(window as WindowWithMSStream).MSStream;
  return isIOS && notMSStream;
}

/* -------------------- component -------------------- */

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const isIOS = isIOSDevice();

  /* -------- initial decision -------- */
  useEffect(() => {
    if (isAppInstalled()) return;
    if (localStorage.getItem(STORAGE_KEY_HIDDEN) && !isIOS) return;

    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, isIOS ? 5000 : 0);

    return () => clearTimeout(timer);
  }, [isIOS]);

  /* -------- Android / Chrome -------- */
  useEffect(() => {
    if (isIOS) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isIOS]);

  /* -------- actions -------- */
  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      localStorage.setItem(STORAGE_KEY_IOS_SHOWN, "true");
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    if (isIOS) {
      setShowIOSInstructions(false);
      localStorage.setItem(STORAGE_KEY_IOS_SHOWN, "true");
    }
    setShowPrompt(false);
  };

  const handleResetInstructions = () => {
    setShowIOSInstructions(true);
  };

  if (!showPrompt) {
    if (isIOS && !localStorage.getItem(STORAGE_KEY_IOS_SHOWN)) {
      return (
        <button
          onClick={handleResetInstructions}
          className="fixed bottom-6 left-6 z-50 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-full shadow-lg text-xs hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
          aria-label="Ver cómo instalar"
        >
          📲 ¿Cómo instalar?
        </button>
      );
    }
    return null;
  }

  /* -------------------- UI -------------------- */

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 text-sm font-medium"
          aria-label="Instalar aplicación"
        >
          <span>📲</span>
          <span>Instalar App</span>
        </button>

        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1 shadow"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Modal iOS */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Instalar en iOS
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Para instalar esta app en tu iPhone/iPad:
            </p>

            <ol className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <span className="pt-0.5">
                  Pulsa el botón <strong style={{color: '#007AFF'}}>⬆️ Compartir</strong> en la barra inferior de Safari
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <span className="pt-0.5">
                  Desplázate hacia abajo y toca <strong>&quot;Añadir a pantalla de inicio&quot;</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <span className="pt-0.5">
                  Pulsa <strong>&quot;Añadir&quot;</strong> arriba a la derecha
                </span>
              </li>
            </ol>

            <button
              onClick={handleClose}
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
