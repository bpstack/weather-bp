# Weather BP

A pragmatic Next.js weather dashboard that leans on the free **Open-Meteo** APIs for both forecast data and geocoding. Built as a full Progressive Web App: installable, offline-capable, and production-ready with typed data flows, thoughtful component boundaries, and a UI that works across light/dark without custom theming gymnastics.

**Live:** [weather.stackbp.es](https://weather.stackbp.es)

## Quick start

- Install deps: `pnpm install`
- Run locally: `pnpm dev` (http://localhost:3000)
- Build: `pnpm build` (uses --webpack flag for Serwist compatibility)
- Lint: `pnpm lint`

## What this app does

- Fetches live weather from the free Open-Meteo forecast API with 5-minute revalidation and sensible null/number normalization.
- **Auto-detects your location** on first load using browser geolocation and reverse geocoding (OpenStreetMap Nominatim), with fallback to a curated default city if denied.
- Uses the Open-Meteo geocoding endpoint for city search with debounce and continent filtering.
- Shows a curated default city server-side, then hydrates to a client experience powered by SWR (avoids duplicate fetches, uses fallback data, and skips focus revalidation).
- Lets you flip between Celsius/Fahrenheit, 7- vs 16-day forecasts, and browse popular cities quickly.
- Surfaces rain and heat heads-up banners, humidity/wind/pressure stats, sunrise/sunset, UV max, and an hourly forecast carousel in a single glance.
- **Displays comprehensive weather descriptions** for all WMO codes (drizzle, rain, snow, showers, thunderstorms with varying intensities) with color coding for visual identification.
- Respects light/dark mode via a theme toggle and Tailwind semantic tokens (no hardcoded colors).
- **Installs as a native app** on any platform (iOS, Android, desktop) with offline support and auto-updates.

## PWA capabilities

The app is a full Progressive Web App powered by Serwist (Workbox-based):

- **Offline-first**: Works without network using intelligent cache strategies.
- **Installable**: Users see a floating install button (bottom-left) that triggers native installation prompts. iOS users get step-by-step instructions for "Add to Home Screen."
- **Auto-updates**: Service Worker checks for new versions every hour. When an update is available, users see a toast notification (bottom-right) with an "Actualizar" button to apply changes.
- **Smart caching**:
  - Weather API: StaleWhileRevalidate with 30-minute expiration (fast responses, background updates)
  - HTML pages: NetworkFirst (always try fresh, fallback to cache)
  - Images/icons: CacheFirst (30-day cache, 100 entries max)
  - CSS/JS: CacheFirst (1-year cache for hashed static assets)
  - Google Fonts: CacheFirst (1-year cache)

The Service Worker source lives in `app/sw.ts`, gets bundled during build, and outputs to `public/sw.js`. It only runs in production (disabled in dev). Three client components handle the PWA lifecycle:

- `ServiceWorkerRegister`: Registers the SW and polls for updates.
- `UpdateNotification`: Toast that appears when a new version is ready.
- `InstallPrompt`: Floating button that handles installation flow for all platforms.

All three are imported in `app/layout.tsx` and render alongside Analytics/SpeedInsights.

## Componentized by design

- `app/weather/page.tsx`: Server entry; picks a popular city, fetches initial weather, and passes data into the client shell.
- `components/weather/WeatherClient.tsx`: The stateful orchestrator (selected city, search, units, forecast length, geolocation) plus SWR data fetching.
- Sections under `components/weather/sections/` keep responsibilities tight:
  - `HeaderBar`: Top bar with theme toggle and live badge.
  - `CitySelector` + `CityModal`: Current city summary, geolocation button, and modal for searching/filtering cities.
  - `CurrentWeather`: Hero block with temp toggle, condition label, and icon.
  - `WeatherDetails`: Humidity, wind, precipitation, pressure, sunrise/sunset, UV.
  - `HourlyForecast`: 24-hour forecast carousel with temps and precipitation.
  - `WeatherAlerts`: Rain and heat warning banners.
  - `Forecast`: 7/16 day list with icons, max/min temps, and detailed weather descriptions with color coding.
  - `FooterInfo`: API attribution and tech stack note.
- Services and utils live in `app/weather/services/`:
  - `weather-service.ts`: Typed fetcher (zod schema), normalization, and API URL builder.
  - `city-utils.ts`: Popular cities list, continent mapping for geocoding results, and `getUserLocation()` for browser-based geolocation with reverse geocoding.
  - `weather-utils.tsx`: Icon map plus helpers for condition text, styling, and comprehensive WMO code descriptions.
- PWA components in `app/components/`:
  - `ServiceWorkerRegister.tsx`: Handles SW registration and update detection.
  - `UpdateNotification.tsx`: Toast UI for new version notifications.
  - `InstallPrompt.tsx`: Platform-aware install button with iOS instructions modal.

## Data flow and API usage

- Default render happens on the server with `dynamic = "force-dynamic"` to avoid stale cache, then the client keeps data fresh with SWR.
- On client mount, the app attempts browser geolocation using `navigator.geolocation.getCurrentPosition()` with a 10-second timeout and 5-minute cache. Coordinates are reverse-geocoded via OpenStreetMap Nominatim to get city name and country. Falls back to server-provided default city if denied or unavailable.
- Requests hit `https://api.open-meteo.com/v1/forecast` with current/hourly/daily blocks; errors show a friendly inline alert instead of breaking the page.
- City search calls `https://geocoding-api.open-meteo.com/v1/search` and enriches results with continent info for filtering.
- Everything stays free-tier friendly—no keys, no paid limits—while still behaving like a real product.

## Developer notes

- Stack: Next.js 16 App Router, TypeScript (strict), Tailwind CSS, SWR, Zod, Serwist, Lucide React.
- Theming: `darkMode: "class"` with CSS variables in `app/globals.css`; stick to semantic classes like `bg-layer-1`, `text-text-secondary`, etc.
- Imports: react/next first, then third-party, then `@/` aliases, then relative.
- No environment variables needed; if you add any, prefer `.env.local` and keep secrets server-side.
- Accessibility: semantic HTML, focusable buttons, and icon-only buttons carry `aria-label`.
- **Build quirk**: Uses `pnpm build --webpack` because Serwist doesn't support Turbopack yet (Next.js 16 default). This is handled in `package.json` scripts.

## How to extend it

- Swap the default city in `app/weather/page.tsx` by picking another from `getPopularCities()`.
- Add more metrics by expanding the `weather-service.ts` schema and reusing `WeatherDetails` tiles.
- Tweak caching strategies in `app/sw.ts` (change `maxAgeSeconds`, `maxEntries`, or switch between NetworkFirst/CacheFirst/StaleWhileRevalidate).
- Adjust geolocation behavior in `city-utils.ts` (timeout, accuracy, cache duration).
- Extend weather descriptions in `weather-utils.tsx` by adding more WMO code mappings.
- Introduce route-level revalidate windows if you start seeing heavier traffic.
- Want charts? Lazy-load them and keep the bundle lean.

## Deployment and testing PWA features

Deploy to Vercel (or any host with HTTPS) and the PWA features activate automatically:

1. **Install**: Visit the deployed URL on mobile or desktop, tap the "Instalar App" button.
2. **Offline**: Once installed, disconnect the network and open the app—it still loads with cached data.
3. **Updates**: After a new deploy, open the installed app. Within an hour (or on next visit), the update toast appears. Click "Actualizar" to reload with the new version.
4. **Geolocation**: On first load (or when clicking the location button in CitySelector), the browser will prompt for location permission. Grant it to auto-detect your city.

Service Workers only run in production (HTTPS or localhost). In dev mode (`pnpm dev`), the SW is disabled to avoid cache conflicts.

Built to be read and tweaked by humans, not a black box. Enjoy shipping.
