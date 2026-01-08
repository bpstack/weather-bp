import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
  CacheableResponsePlugin,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // API del clima - StaleWhileRevalidate con 30 minutos
    {
      matcher: ({ url }) => url.hostname === "api.open-meteo.com",
      handler: new StaleWhileRevalidate({
        cacheName: "weather-bp-v1-api",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 60, // 30 minutos
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Páginas HTML - NetworkFirst
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "weather-bp-v1-pages",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 horas
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Imágenes - CacheFirst
    {
      matcher: ({ request }) =>
        request.destination === "image" ||
        /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(
          new URL(request.url).pathname,
        ),
      handler: new CacheFirst({
        cacheName: "weather-bp-v1-images",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // CSS y JS - CacheFirst (tienen hash en el nombre)
    {
      matcher: ({ request }) =>
        request.destination === "style" || request.destination === "script",
      handler: new CacheFirst({
        cacheName: "weather-bp-v1-static",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Fuentes de Google - CacheFirst
    {
      matcher: ({ url }) =>
        url.hostname === "fonts.googleapis.com" ||
        url.hostname === "fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "weather-bp-v1-fonts",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
