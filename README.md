# Weather BP

A pragmatic Next.js weather dashboard that leans on the free **Open-Meteo** APIs for both forecast data and geocoding. It is built to feel production-ready while staying lightweight: typed data flows, thoughtful component boundaries, and a UI that works across light/dark without custom theming gymnastics.

## Quick start
- Install deps: `pnpm install`
- Run locally: `pnpm dev` (http://localhost:3000)
- Build: `pnpm build`
- Lint: `pnpm lint`

## What this app does
- Fetches live weather from the free Open-Meteo forecast API with 5‑minute revalidation and sensible null/number normalization.
- Uses the Open-Meteo geocoding endpoint for city search with a simple debounce and continent filtering.
- Shows a curated default city server-side, then hydrates to a client experience powered by SWR (avoids duplicate fetches, uses fallback data, and skips focus revalidation).
- Lets you flip between Celsius/Fahrenheit, 7- vs 16-day forecasts, and browse popular cities quickly.
- Surfaces rain and heat heads-up banners, humidity/wind/pressure stats, sunrise/sunset, and UV max in a single glance.
- Respects light/dark mode via a theme toggle and Tailwind semantic tokens (no hardcoded colors).

## Componentized by design
- `app/weather/page.tsx`: Server entry; picks a popular city, fetches initial weather, and passes data into the client shell.
- `components/weather/WeatherClient.tsx`: The stateful orchestrator (selected city, search, units, forecast length) plus SWR data fetching.
- Sections under `components/weather/sections/` keep responsibilities tight:
  - `HeaderBar`: Top bar with theme toggle and live badge.
  - `CitySelector` + `CityModal`: Current city summary and modal for searching/filtering cities.
  - `CurrentWeather`: Hero block with temp toggle, condition label, and icon.
  - `WeatherDetails`: Humidity, wind, precipitation, pressure, sunrise/sunset, UV.
  - `Forecast`: 7/16 day list with icons and max/min temps.
  - `FooterInfo`: API attribution and tech stack note.
- Services and utils live in `app/weather/services/`:
  - `weather-service.ts`: Typed fetcher (zod schema), normalization, and API URL builder.
  - `city-utils.ts`: Popular cities list and continent mapping for geocoding results.
  - `weather-utils.tsx`: Icon map plus helpers for condition text and styling.

## Data flow and API usage
- Default render happens on the server with `dynamic = "force-dynamic"` to avoid stale cache, then the client keeps data fresh with SWR.
- Requests hit `https://api.open-meteo.com/v1/forecast` with current/hourly/daily blocks; errors show a friendly inline alert instead of breaking the page.
- City search calls `https://geocoding-api.open-meteo.com/v1/search` and enriches results with continent info for filtering.
- Everything stays free-tier friendly—no keys, no paid limits—while still behaving like a real product.

## Developer notes
- Stack: Next.js App Router, TypeScript (strict), Tailwind CSS, SWR, zod.
- Theming: `darkMode: "class"` with CSS variables in `app/globals.css`; stick to semantic classes like `bg-layer-1`, `text-text-secondary`, etc.
- Imports: react/next first, then third-party, then `@/` aliases, then relative.
- No environment variables needed; if you add any, prefer `.env.local` and keep secrets server-side.
- Accessibility: semantic HTML, focusable buttons, and icon-only buttons carry `aria-label`.

## How to extend it
- Swap the default city in `app/weather/page.tsx` by picking another from `getPopularCities()`.
- Add more metrics by expanding the `weather-service.ts` schema and reusing `WeatherDetails` tiles.
- Introduce caching or revalidate windows per route if you start seeing heavier traffic.
- Want charts? Lazy-load them and keep the bundle lean.

Built to be read and tweaked by humans, not a black box. Enjoy shipping.
