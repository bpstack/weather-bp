/**
 * Thresholds that decide when a weather alert is shown.
 *
 * They live here rather than inside the component so changing a criterion is a
 * one-line edit in an obvious place, and so the reasoning behind each number
 * survives. Every value is pinned at its exact boundary by
 * `__tests__/WeatherAlerts.test.tsx`: if you change one, that suite tells you
 * which alerts move.
 *
 * Comparisons are inclusive (>= for upper bounds, <= for cold).
 */
export const ALERT_THRESHOLDS = {
  /** °C — "Calor extremo". AEMET issues heat warnings from the mid-30s. */
  heat: 35,
  /** °C — "Frío intenso". Low enough to matter without firing every winter morning. */
  cold: 5,
  /** km/h — "Viento fuerte". Roughly Beaufort 5, when walking gets uncomfortable. */
  wind: 30,
  /** UV index — "UV extremo". WHO rates 8-10 as "very high". */
  uv: 8,
  /** % — "Lluvia probable", on the highest of the next 3 hours. */
  rain: 30,
  /** WMO code — thunderstorm codes are 95, 96 and 99. */
  storm: 95,
  /** WMO code — snow spans 71-77 (snow fall, grains, showers). */
  snow: 71,
  /** WMO code — upper bound of the snow range; above it are rain showers. */
  snowMax: 77,
} as const;

/**
 * mm of precipitation in a 15-minute slot below which it is not "raining".
 * Guards the nowcast against trace amounts the user would never notice.
 */
export const RAIN_MM = 0.1;

/** Minutes ahead the nowcast looks for the first wet 15-minute slot. */
export const NOWCAST_WINDOW_MIN = 60;

/** Minutes at or below which upcoming rain is announced as "imminent". */
export const NOWCAST_IMMINENT_MIN = 5;
