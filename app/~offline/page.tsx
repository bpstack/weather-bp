import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — Weather BP",
  description: "No connection available right now.",
};

/**
 * Fallback served by the service worker when a navigation fails and the route
 * is not cached. It is precached via `additionalPrecacheEntries`, so it must
 * stay static and depend on neither data nor the network.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-sm text-balance opacity-80">
        This page could not be loaded because there is no connection. Weather
        you already looked up is still available.
      </p>
      <p className="text-sm opacity-60">Try again once you&apos;re back online.</p>
    </main>
  );
}
