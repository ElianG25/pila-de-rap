# Arquitectura

Este documento describe cómo está organizado el código después del refactor a
arquitectura limpia. El comportamiento de la app no cambió — lo que cambió es
dónde vive cada responsabilidad y quién depende de quién.

## Principio general

```
app/   → Next.js. Routing, HTTP, React, hooks de UI. "Cómo se entrega."
lib/   → Framework-agnóstico. Dominio, casos de uso, integraciones externas. "Qué hace la app."
```

`app/` puede importar de `lib/`. `lib/` nunca importa de `app/`, ni de React,
ni de Next — así el núcleo del negocio no depende de cómo se sirve (hoy es
Next.js; si algún día cambia, `lib/` no se entera).

## Estructura de carpetas

```
lib/
  domain/league/              Reglas y tipos puros — cero I/O, cero framework.
    types.ts                    Entidades: LeagueEvent, RankingItem, Battle, LeaguePayload...
    rules.ts                    sortRanking, getPublicEvents, getPublishedBattles, isSectionEnabled
    registrationErrors.ts       Códigos de error de inscripción ↔ status HTTP ↔ mensaje de usuario
                                 (única fuente — antes duplicado entre la API y el formulario)

  application/league/         Casos de uso — orquestan dominio + infraestructura.
    getLeague.ts                 Trae y valida la liga completa (usado por /api/league y /api/og)
    registerParticipant.ts       Registra un participante y dispara la notificación
    buildShareHighlights.ts      Elige qué mostrar en la imagen social (fecha destacada, top 3...)

  infrastructure/              Todo lo que toca el mundo exterior.
    sheets/
      sheetsClient.ts            Único lugar que lee SHEETS_GET_URL y hace fetch a Apps Script
      payloadMapper.ts            zod: valida/normaliza el JSON crudo de Sheets → tipos de dominio
    telegram/
      telegramNotifier.ts        Notificación best-effort de inscripciones
    security/
      rateLimiter.ts              Anti-spam por IP (en memoria, ver limitaciones abajo)
      honeypot.ts                  Detección de bots por campo oculto

  shared/
    format.ts                    Helpers de formato reusados por varios componentes (p. ej. initials)

app/
  api/
    league/route.ts             Adaptador HTTP delgado: parsea el request, llama a application/,
                                 traduce el resultado a NextResponse + status code
    og/route.tsx                 Adaptador HTTP + JSX: llama a getLeague()/buildShareHighlights(),
                                 renderiza la imagen
    mcs/, share/, realtime/      Retiradas (410 Gone) — ver historial de PRs

  hooks/                        Estado y efectos del lado del cliente (React puro, sin JSX de página).
    useLeagueData.ts             Fetch inicial + auto-refresh de la liga
    useSectionRouter.ts          Sección activa, secciones visibles según Config, URL, swipe
    useEventCountdown.ts         Cuenta regresiva hacia la fecha destacada
    useMediaQuery.ts             Suscripción genérica a media queries
    useParallaxScrollY.ts        Offset de scroll para el parallax del fondo

  lib/
    leagueClient.ts              fetch del navegador hacia nuestra propia API (no hacia Sheets)

  components/
    home/                        Presentación de la home — reciben props, no hacen fetch ni tienen estado de datos.
      HomeView.tsx                 Composición completa de la página (hero, nav, secciones, footer)
      BackgroundLayer.tsx          Fondo (póster/video/gradiente) + glows
      LoadingScreen.tsx / ErrorScreen.tsx
      NavIcon.tsx / TypewriterText.tsx
    league/                      Componentes de dominio de liga (ranking, batallas, fechas, inscripción...)
                                 — sin cambios de contenido, solo import paths actualizados
    ServiceWorkerRegistration.tsx

  page.tsx                      Composition root: llama a los hooks, deriva selectores de dominio
                                 (sortRanking, getPublicEvents...) y delega el render a <HomeView/>.
                                 ~50 líneas — antes tenía ~590 mezclando fetch, estado, routing y JSX.
```

## Flujo de datos

**Lectura (home → Sheets):**
```
HomeView (props)
  ← page.tsx (composition root)
    ← useLeagueData()            [app/hooks]
      ← fetchLeague()            [app/lib/leagueClient.ts]  — fetch("/api/league")
        ← GET /api/league        [app/api/league/route.ts]  — adaptador HTTP
          ← getLeague()          [lib/application/league]   — caso de uso
            ← fetchLeaguePayloadRaw() [lib/infrastructure/sheets/sheetsClient.ts]
            ← adaptPayload()     [lib/infrastructure/sheets/payloadMapper.ts]  — zod
```

**Escritura (inscripción):**
```
RegistrationCard (POST /api/league)
  → app/api/league/route.ts       — honeypot, rate-limit, validación de forma
    → registerParticipant()       [lib/application/league]
      → submitRegistrationRaw()   [lib/infrastructure/sheets/sheetsClient.ts]
      → notifyRegistration()      [lib/infrastructure/telegram/telegramNotifier.ts] (fire-and-forget)
```

**Imagen social:**
```
GET /api/og
  → getLeague()               [lib/application/league]     (mismo caso de uso que /api/league)
  → buildShareHighlights()    [lib/application/league]     — deriva qué mostrar
  → JSX + ImageResponse       [app/api/og/route.tsx]        — presentación, edge runtime
```

## Por qué esta separación (y no otra)

- **`sheetsClient.ts` es el único lugar que lee `SHEETS_GET_URL`.** Antes ese env var se leía por
  separado en `api/league/route.ts` y `api/og/route.tsx`. Si el backend cambia de transporte, se
  toca un solo archivo.
- **`registrationErrors.ts` es la única fuente de códigos de error.** Antes `getErrorStatus()`
  (servidor) y `ERR_MAP` (cliente) mantenían la misma lista de códigos por separado; un código nuevo
  del backend obligaba a recordar tocar los dos lados.
- **Los casos de uso (`application/`) no conocen `NextResponse` ni JSX.** Devuelven datos o lanzan
  errores tipados (`SheetsConfigError`, `SheetsUnavailableError`, `SheetsInvalidResponseError`); el
  adaptador HTTP decide el status code. Esto es lo que permite que `getLeague()` sirva tanto a
  `/api/league` (JSON) como a `/api/og` (imagen) sin duplicar la lógica de fetch+validación.
- **`domain/` no importa nada de `app/` ni de Next.** `rules.ts` y `types.ts` son funciones y tipos
  puros; se testean sin arrancar un servidor y se podrían reusar tal cual si el frontend cambiara de
  framework.
- **`page.tsx` ya no hace fetch ni maneja efectos.** Cada preocupación de la home vive en su propio
  hook (`useLeagueData`, `useSectionRouter`, `useEventCountdown`, `useMediaQuery`,
  `useParallaxScrollY`), y `HomeView` es una función pura de sus props — se puede razonar sobre cada
  pieza por separado, y un cambio en, por ejemplo, la lógica de countdown no puede romper el fetch de
  datos por accidente.

## Límites conocidos (no resueltos por este refactor)

- **`rateLimiter.ts` sigue siendo en memoria por instancia** — no es una protección real en un
  despliegue serverless multi-instancia. Reorganizar el código no lo arregla; hace falta un store
  compartido (Upstash/KV) si esto importa de verdad.
- **El contrato de error sigue siendo por convención**, no por tipos compartidos con el Apps Script
  (`google-apps-scripts.gs`). `registrationErrors.ts` es la única fuente en el lado Next.js, pero el
  `.gs` define sus propios strings de error de forma independiente; si cambian ahí, hay que
  actualizar `registrationErrors.ts` a mano.
- **`Battle.mc1..mc4`** sigue siendo campos fijos en vez de `competitors: string[]` — cambiarlo
  implica coordinar también el contrato del Apps Script, fuera del alcance de un refactor de solo
  Next.js.
