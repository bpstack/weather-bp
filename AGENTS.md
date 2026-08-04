# AGENTS.md

Dashboard del tiempo en **Next.js 16 (App Router) + React 19 + TypeScript**, sobre las APIs
gratuitas de **Open-Meteo** (predicción, geocoding, calidad del aire). Es una **PWA** instalable y
offline-first mediante Serwist. En producción: [weather.stackbp.es](https://weather.stackbp.es).

## Estado real del proyecto (verificado contra el árbol, 2026-08-04)

- **Sí hay tests.** 3 archivos en `__tests__/` con 17 tests (Vitest 4 + Testing Library + jsdom),
  y scripts `pnpm test` / `pnpm test:run`. Deben pasar antes de commitear. _(Este archivo afirmaba
  lo contrario — "single test (if added)", "Testing (future)" — durante meses.)_
- **No hay React Query.** El caché de datos es **SWR 2.3.7** y solo SWR. _(También corregido: el
  texto anterior ofrecía las dos opciones.)_
- **No hay carpeta `pages/`**: todo vive en `app/` (App Router). El `tailwind.config.js` la lista
  en `content` por herencia de la plantilla, no porque exista.
- Los servicios de datos están en `app/weather/services/`, los hooks en `hooks/`, y los
  componentes de presentación en `components/weather/`.

### Qué del arnés viaja en el repo

| Ruta                    | Versionado | Por qué                                                      |
| ----------------------- | ---------- | ------------------------------------------------------------ |
| `AGENTS.md`/`CLAUDE.md` | Sí         | Las convenciones son inútiles si no llegan a la otra máquina |
| `.agents/skills/`       | Sí         | Skills en el formato agnóstico de agents.md                  |
| `.claude/`              | No         | Permisos y estado locales. Su `skills/` duplica `.agents/`   |
| `ROADMAP.md`, `TODO.md` | No         | Backlog y método de trabajo, privados                        |
| `docs/`                 | No         | Privado                                                      |

⚠️ `TODO.md` y `ROADMAP.md` no llegan al repo, así que **un agente en otra máquina no los ve**.
No asumas que existen ni cites tareas de ellos en commits.

⚠️ **`pnpm build` deja el árbol sucio**: Serwist regenera `public/sw.js` en cada build. Es
esperado, no es un cambio tuyo. **No lo cueles en un commit ajeno** — o se commitea a propósito
(`chore(sw): rebuild service worker`) o se descarta.

## Documentación actualizada (MCP context7)

Este proyecto tiene instalado el **MCP de context7** (https://context7.com/). Antes de proponer
código para las dependencias listadas abajo, consulta la documentación de la **versión exacta
instalada** — no la última publicada, no la que recuerdes.

### Flujo

1. `resolve-library-id` con el nombre de la librería.
2. `query-docs` con el ID resuelto, la versión de la tabla y el tema concreto.
3. Si la versión exacta no está indexada, usa la minor más cercana **por debajo** y di
   explícitamente en la respuesta qué versión consultaste.

Comprobar que está disponible antes de confiar en él: `claude mcp list` → `context7` Connected
(en opencode, `opencode mcp list`). Si no lo está, **dilo en la respuesta** y sigue con
conocimiento propio; no finjas haberlo consultado.

**IDs útiles ya resueltos** (evita repetir `resolve-library-id` en cada sesión):

| Librería     | ID a usar                  | Aviso                                                                            |
| ------------ | -------------------------- | -------------------------------------------------------------------------------- |
| Next.js      | `/vercel/next.js`          | Versiones indexadas: la más cercana **por debajo** de la 16.0.8 es **`v16.0.3`** |
| Vitest       | `/vitest-dev/vitest`       | La más cercana por debajo de la 4.1.2 es **`v4.0.7`** (`v4.1.6` va por encima)   |
| Tailwind CSS | `/websites/v3_tailwindcss` | **Este repo es v3.** `/websites/tailwindcss` es el de v4 — no usarlo aquí        |

⚠️ **Next 16.0.8 NO trae su documentación versionada dentro de `node_modules`.** La regla general
de "si el paquete trae doc propia, gana a context7" **no aplica aquí**: `node_modules/next/dist/docs`
no existe en esta minor (sí aparece a partir de la 16.2.x). Para Next, context7 es la fuente.

⚠️ **El pin de versión no siempre filtra.** Si un resultado de context7 contradice la tabla de
trampas, **manda la tabla**.

⚠️ **Los snippets de context7 no están escritos para `strict: true`.** La API que describen suele
ser correcta, pero omiten las guardas de null y fallan el typecheck. Añade las guardas al adaptar.

### Versiones instaladas (fuente de verdad: `pnpm-lock.yaml`, no los rangos `^` del `package.json`)

| Librería       | Versión     | Nota                                                            |
| -------------- | ----------- | --------------------------------------------------------------- |
| `next`         | **16.0.8**  | App Router. Build con **webpack** (`next build --webpack`)      |
| `react`/`-dom` | **19.2.1**  | Fijados exactos, sin `^` — deliberado                           |
| `swr`          | **2.3.7**   | Única capa de caché de datos del cliente                        |
| `zod`          | **3.25.76** | Validación de las respuestas de Open-Meteo                      |
| `serwist`      | **9.5.0**   | + `@serwist/next` 9.5.0. Fuente en `app/sw.ts` → `public/sw.js` |
| `lucide-react` | **0.469.0** | Iconos                                                          |
| `tailwindcss`  | **3.4.18**  | v3, ver trampas                                                 |
| `vitest`       | **4.1.2**   | Con `jsdom` 29.0.1 y `@vitejs/plugin-react` 6                   |
| `eslint`       | **9.39.1**  | Flat config en `eslint.config.mjs`                              |
| `prettier`     | **3.9.6**   | Config en `.prettierrc` + `.prettierignore` (excluye `sw.js`)   |
| `typescript`   | **5.9.3**   | `strict`                                                        |
| `sharp`        | **0.34.5**  | Optimización de imágenes de Next                                |
| `vite`         | 8.0.3       | Transitiva **de Vitest**, no del build de la app                |

### Trampas de versión (consultar también — aquí el modelo suele asumir mal)

| Librería      | Versión     | Trampa                                                                                                                                                                         |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tailwindcss` | **3.4.18**  | Es **v3, no v4**: config en `tailwind.config.js` (CommonJS) + directivas `@tailwind`. **NO** `@import "tailwindcss"` ni `@theme`. Otros proyectos del propietario sí van en v4 |
| `vitest`      | **4.1.2**   | v4: la API de mocks y la configuración de `environment` cambiaron respecto a v1/v2, que es lo que domina los ejemplos de internet                                              |
| `zod`         | **3.25.76** | **v3.** En v4 cambian los mensajes de error personalizados, `z.ZodError` y varios helpers de `z.string()` pasan a funciones de nivel superior                                  |
| `eslint`      | **9.39.1**  | Flat config. `pnpm lint` es `eslint` **sin argumentos** (v9 lo permite); no hay `.eslintrc`                                                                                    |
| `next`        | **16.0.8**  | Build forzado a **webpack** por Serwist (`--webpack`). No asumas Turbopack ni propongas migrarlo                                                                               |
| `@types/node` | **^20**     | Desalineado con `engines.node: 24.x`. Si un tipo de Node moderno no existe, es esto — no lo "arregles" con `any`                                                               |

### Límites

- context7 sirve para **verificar**, no para migrar. No apliques cambios de versión ni
  "modernices" código existente que funciona sin que se pida explícitamente.
- Si la doc actual recomienda un patrón distinto al que ya usa el repo, **no reescribas**:
  señálalo y sigue la convención existente salvo que el usuario decida lo contrario.
- Activación **reactiva y acotada**: solo código nuevo o modificado en la tarea en curso.
  Nunca como barrido ("revisa todo el proyecto contra la doc actual").
- No lo uses para lógica de negocio, refactors o debugging propio — solo para la API de la librería.

## Toolchain y línea base

La versión la fija el **repo**, no la máquina: `.nvmrc` (Node 24), `engines.node: "24.x"` y
`packageManager: "pnpm@9.15.0"`. El `.npmrc` lleva `engine-strict=true`, así que instalar con el
Node equivocado falla de inmediato en vez de compilar algo raro.

⚠️ Si conviven varios gestores de versiones de Node (fnm, nvm, Volta), el `pnpm` del PATH puede
venir del gestor equivocado y fallar con `ERR_PNPM_UNSUPPORTED_ENGINE`. Comprueba `node -v` antes
de instalar y, si no da 24, selecciona la versión y usa **`corepack pnpm <script>`** en lugar del
`pnpm` del PATH.

```bash
pnpm install       # reproduce desde pnpm-lock.yaml
pnpm dev           # localhost:3000
pnpm lint          # eslint (flat config)
pnpm format        # prettier --write .
pnpm format:check  # prettier --check . (falla si algo está sin formatear)
pnpm test:run      # vitest en modo CI
pnpm build         # producción (webpack, regenera public/sw.js)
```

**Línea base medida con el árbol limpio (2026-08-04, Node 24.16.0, pnpm 9.15.0):**

| Comprobación        | Resultado                                                    |
| ------------------- | ------------------------------------------------------------ |
| `pnpm lint`         | ✅ 0 problemas                                               |
| `pnpm format:check` | ✅ 0 archivos pendientes                                     |
| `pnpm test:run`     | ✅ 17 tests en 3 archivos, todos pasan (~21 s)               |
| `pnpm build`        | ✅ verde, 4 rutas estáticas — deja `public/sw.js` modificado |

Dos avisos no bloqueantes y preexistentes: `caniuse-lite` con 8 meses de antigüedad y
`baseline-browser-mapping` con más de dos. No los arregles dentro de otra tarea.

### Seguridad de dependencias (`.npmrc`)

`ignore-scripts=true` bloquea los scripts pre/post-install del registry. Las excepciones se
declaran **una a una** en `package.json > pnpm.onlyBuiltDependencies`; hoy solo está **`sharp`**,
que necesita su postinstall para los binarios de libvips. Si añades una dependencia que falle al
instalar por falta de postinstall, **no quites `ignore-scripts`**: añádela a esa allowlist y
justifícalo.

`save-exact=true`: las dependencias nuevas entran sin `^`.

⚠️ `minimum-release-age` y `block-exotic-subdeps` están escritos en el `.npmrc` pero **inertes
con pnpm 9.15** (requieren 10.16 y 10.18). No los des por activos.

## Convenciones de código

- Usa pnpm: `pnpm install` · `pnpm dev` · `pnpm build` · `pnpm lint` · un test suelto con
  `pnpm test -- <patrón>`.
- App Router: prefiere Server Components para obtener datos; marca los de cliente con `'use client'`.
- Orden de imports: react/next primero, luego third-party, luego alias `@/`, luego relativos.
  Sin imports sin usar.
- Formato: **Prettier** (`.prettierrc`: comillas dobles, `trailingComma: all`, `printWidth: 80`,
  2 espacios). `pnpm format` antes de commitear; `pnpm format:check` debe pasar. No pelees con el
  formateador a mano.
- Tipos: TS estricto; evita `any`; tipa las respuestas de API; valida con Zod lo que venga de fuera.
- Nombres: PascalCase para componentes y archivos de `components/`, camelCase para funciones y
  variables, CONSTANT_CASE para valores tipo entorno.
- Errores: mensajes claros en la UI; detalle técnico solo cuando aporte; fallos de fetch elegantes.
- Datos: evita fetches duplicados; cachea con **SWR**; memoiza derivaciones caras.
- Tailwind: `darkMode: "class"`; usa los tokens semánticos de `app/globals.css` (`bg-layer-1`,
  `text-text-secondary`…). **Nunca hex en línea.**
- Tema: paridad light/dark, transiciones sutiles, sin scroll horizontal.
- Accesibilidad: HTML semántico, `aria-label` en controles con solo icono, focus-visible intacto.
- Assets: imágenes e iconos en `public/`; `next/image` cuando proceda.
- Seguridad: nunca commitees secretos; `.env.local` con `process.env`; secretos en servidor.
- Rendimiento: aprovecha el caché/revalidate de Next para Open-Meteo; evita JS de cliente
  innecesario para datos estáticos.
- Tests: junto al módulo o en `__tests__`; deterministas; mockea la red.
- Dependencias: librerías ligeras; si añades gráficos o animación, tree-shake y carga diferida.
- Documentación: actualiza el README cuando cambien setup, comandos o variables de entorno.
- i18n: centraliza las traducciones si se añaden; nada de literales sueltos.

## Convenciones de git

- Mensajes de commit **en inglés**, imperativo, con prefijo convencional (`feat(weather):`,
  `chore(sw):`…) siguiendo el log existente. Asunto conciso + cuerpo cuando el cambio no sea trivial.
- **Cero rastro de IA en el repo**: ni `Co-Authored-By`, ni "Generated with…", ni menciones a
  Claude/agentes en commits, código, comentarios o documentación.
- **Un commit por unidad lógica de cambio.** No mezclar refactor con feature, ni arrastrar el
  `public/sw.js` regenerado dentro de un commit que no va de eso.
- **Nunca `push` sin OK explícito del propietario.** El agente commitea y lo deja dicho.
- Nunca commitees `.next/`, `node_modules/` ni secretos.
- Formato de Markdown: Prettier por defecto. Tablas estilo GitHub-flavored.
