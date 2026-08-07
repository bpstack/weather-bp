# Servicios de datos

Capa de acceso a datos del cliente: funciones de red y validación, sin estado
y sin caché propia (la caché la pone SWR en `WeatherClient`). El README raíz
describe el papel de cada fichero
([arquitectura](../../../README.md#architecture)); aquí solo están los
contratos que el código no cuenta por sí solo.

## Contrato de errores

| Función                           | En caso de fallo                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `fetchWeather`, `fetchAirQuality` | Lanzan: mensaje en castellano con HTTP no ok; propagan `TimeoutError` (10 s) y `ZodError` |
| `reverseGeocode`                  | Nunca lanza: devuelve la ciudad fallback «Mi ubicación» (`country_code: "XX"`)            |
| `getUserLocation`                 | Nunca lanza: devuelve la unión `{ city } \| { error }`                                    |

Un `try/catch` alrededor de `reverseGeocode` o `getUserLocation` es código
muerto.

## Nulos

- `hourly` y `minutely_15`: los nulos se sustituyen por `0` **antes** del
  parse Zod, para que la UI nunca muestre NaN (fijado en
  `__tests__/weather-service.test.ts`). Consecuencia: en datos horarios un `0`
  puede significar «sin dato» (p. ej. `visibility: 0`).
- `daily`: los nulos se conservan; el esquema los declara `nullable()` y los
  consumidores deben contemplarlos.

## Tiempos

Con `timezone=auto`, todas las cadenas de tiempo (`current.time`,
`hourly.time`, `daily.sunrise`/`sunset`, `minutely_15.time`) son hora local
**del lugar**, en ISO 8601 sin desplazamiento. Para compararlas con «ahora»
hay que aplicar `utc_offset_seconds` (así lo hace el nowcast de
`WeatherAlerts`).

## `minutely_15`

El bloque es opcional y los consumidores deben tolerar `undefined` (fijado en
los tests). Open-Meteo solo da resolución de 15 min real en Centroeuropa y
Norteamérica (ICON-D2, AROME, HRRR); para el resto del mundo interpola desde
datos horarios.
