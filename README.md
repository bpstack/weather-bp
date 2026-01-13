# Weather BP

A no-nonsense weather dashboard built with Next.js 16, React 19, and TypeScript. Hits the free Open-Meteo APIs for forecast data and geocoding. Runs as a full PWA: installable, offline-first, and production-ready with typed data flows, clear component boundaries, and a UI that handles light/dark without fighting Tailwind.

**Live:** [weather.stackbp.es](https://weather.stackbp.es)

## Quick start

```bash
pnpm install    # deps
pnpm dev        # local at localhost:3000
pnpm build      # production build (--webpack for Serwist)
pnpm lint       # catch issues
```

## What it does

- **Real weather data** from Open-Meteo with 5-minute revalidation, null handling, and type-safe responses via Zod.
- **Auto-detects location** on first load using browser geolocation + reverse geocoding (Nominatim). Falls back to a curated city list if the user denies permission.
- **City search** via Open-Meteo's geocoding endpoint with debounce and continent filtering.
- **Server-side first render** with client hydration via SWR—no duplicate fetches, instant fallback data, no focus revalidation waste.
- **Unit toggles**: Celsius/Fahrenheit, 7-day/16-day forecasts.
- **Weather alerts** for rain and heat thresholds.
- **Hourly carousel** showing 24h forecast with temps and precipitation.
- **WMO code mapping** for every weather condition (drizzle through thunderstorms) with color coding.
- **Theme toggle** that respects system preferences with semantic Tailwind tokens.
- **Installable** on iOS, Android, and desktop as a native app.

## PWA features (the real deal)

Serwist powers this with Workbox under the hood:

- **Offline-first**: Works without network after first visit.
- **Install prompts**: Floating button on Android/desktop; iOS gets a step-by-step modal for "Add to Home Screen."
- **Auto-updates**: SW checks hourly for new versions. Toast notification appears bottom-right with "Actualizar" button for smooth reload.
- **Cache strategies**:
  - Weather API: StaleWhileRevalidate (30min TTL) — fast cached responses, background revalidation.
  - HTML: NetworkFirst — try fresh, fall back to cache if offline.
  - Images/Icons: CacheFirst (30 days, 100 entries max).
  - CSS/JS: CacheFirst (1 year, hashed assets).
  - Google Fonts: CacheFirst (1 year).

Service worker lives in `app/sw.ts`, bundled at build time to `public/sw.js`. Disabled in dev mode to avoid cache headaches.

Three client components handle the PWA lifecycle:

- `ServiceWorkerRegister`: Registers SW, polls for updates.
- `UpdateNotification`: Toast when new version is ready.
- `InstallPrompt`: Platform-aware install button + iOS instructions.

All imported in `app/layout.tsx` alongside Analytics/SpeedInsights.

## Architecture

```
app/weather/
├── page.tsx           # Server entry: picks default city, fetches initial weather
├── services/
│   ├── weather-service.ts  # Zod schema, typed fetcher, URL builder
│   ├── city-utils.ts       # Geolocation, popular cities, continent mapping
│   └── weather-utils.tsx   # WMO code → icon/text mapping (28+ conditions)
```

```
components/weather/
├── WeatherClient.tsx       # State orchestrator: city, search, units, SWR
└── sections/
    ├── HeaderBar.tsx       # Theme toggle, live badge
    ├── CitySelector.tsx    # Current city, geolocation button
    ├── CityModal.tsx       # City picker with search + continent filter
    ├── CurrentWeather.tsx  # Hero: temp toggle, condition, icon
    ├── WeatherDetails.tsx  # Humidity, wind, precip, pressure, UV, sunrise/sunset
    ├── HourlyForecast.tsx  # 24h carousel with temps + precip %
    ├── WeatherAlerts.tsx   # Rain/heat warning banners
    ├── Forecast.tsx        # 7/16 day cards with detailed WMO descriptions
    └── FooterInfo.tsx      # Attribution, tech stack
```

```
app/components/         # PWA glue
├── InstallPrompt.tsx
├── ServiceWorkerRegister.tsx
└── UpdateNotification.tsx
```

Components stay small, focused, and testable. Services handle the messy stuff (fetching, validation, geolocation).

## Data flow

1. **Server render**: `app/weather/page.tsx` runs with `dynamic = "force-dynamic"` to skip stale cache, picks a popular city from `getPopularCities()`, and passes initial weather to the client shell.
2. **Client hydration**: `WeatherClient.tsx` takes over, runs `useSWR` with the server data as fallback.
3. **Geolocation**: On mount, attempts `navigator.geolocation.getCurrentPosition()` with 10s timeout + 5min cache. Reverse-geocodes via Nominatim. Falls back to server default if denied or unavailable.
4. **Weather fetch**: SWR calls `fetchWeatherData()` which:
   - Builds URL with lat/lon, current/hourly/daily blocks
   - Validates response against Zod schema
   - Normalizes nulls/numbers
   - Returns typed `WeatherData`
5. **Revalidation**: SWR revalidates on focus (disabled), reconnect (enabled), and every hour via `refreshInterval`.

Everything stays free-tier friendly—no API keys, no paid limits.

## Stack

- Next.js 16 (App Router, React 19)
- TypeScript (strict mode)
- Tailwind CSS 3.4.18 with semantic tokens
- SWR 2.3.7 for data fetching
- Zod 3.25.76 for runtime validation
- Serwist 9.5.0 (service worker)
- Lucide React 0.469.0 for icons
- Vercel Analytics + Speed Insights

## Developer notes

- **Theming**: `darkMode: "class"` with CSS variables in `app/globals.css`. Use semantic classes like `bg-layer-1`, `text-text-secondary`—no hardcoded hex.
- **Imports order**: React/Next → third-party → `@/` aliases → relative. No unused imports.
- **Secrets**: Keep them server-side. No `.env` needed for Open-Meteo (it's free).
- **Accessibility**: Semantic HTML, `aria-label` on icon buttons, focus-visible states.
- **Build quirk**: `pnpm build --webpack` because Serwist doesn't support Turbopack yet. Handled in `package.json` scripts.

## Extending it

- **Change default city**: Edit `app/weather/page.tsx`, pick another from `getPopularCities()`.
- **Add metrics**: Expand the Zod schema in `weather-service.ts`, reuse `WeatherDetails` tiles.
- **Tweak caching**: Edit `app/sw.ts`—change `maxAgeSeconds`, `maxEntries`, or swap strategies.
- **Adjust geolocation**: Edit `city-utils.ts`—timeout, accuracy, cache duration.
- **More WMO codes**: Extend `weather-utils.tsx` with new mappings.
- **Route-level revalidate**: Add `revalidate` const if traffic increases.
- **Charts**: Lazy-load, keep initial bundle lean.

## Testing PWA features

Deploy to Vercel (HTTPS required for Service Workers):

1. **Install**: Visit on mobile/desktop, tap "Instalar App."
2. **Offline**: Install, disconnect network, open app—still works from cache.
3. **Updates**: Deploy new version, open installed app. Within an hour, toast appears. Click "Actualizar" to reload.
4. **Geolocation**: First load (or location button click) triggers browser prompt. Grant to auto-detect city.

Service Workers only run in production (HTTPS or localhost). Disabled in dev mode.

## The evolution

```
v1: Single page.tsx, useEffect + fetch          (learning API calls)
v2: Split components, SWR, Zod validation       (production data layer)
v3: PWA + service worker + manifest             (installable, offline)
v4: Geolocation + reverse geocoding + curated   (smart defaults)
v5: Multiple cache strategies + auto-updates    (bulletproof)
v6: Current - production PWA + monitoring       (shipping)
```

Started as a blog example for understanding API calls. Became a production app because why not.

Built to be read, tweaked, and enjoyed.
