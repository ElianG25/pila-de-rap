# Pila de Ra' — Liga de Freestyle (RD)

Web oficial de la liga de freestyle **Pila de Ra'** (República Dominicana): ranking,
fechas, archivo de batallas con reproductor embebido e inscripciones en vivo.

Construida con **Next.js 16**, **React 19**, **Tailwind CSS 4** y **Framer Motion**.
Los datos se sirven desde una hoja de **Google Sheets** vía un Web App de Apps Script.

## Requisitos / Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `SHEETS_GET_URL` | Sí | URL del Web App de Apps Script que sirve y recibe los datos. Sin ella, `/api/league` responde 500. |
| `TELEGRAM_TOKEN` | No | Token del bot de Telegram para notificar inscripciones. |
| `TELEGRAM_CHAT_ID` | No | Chat destino de las notificaciones. |

## Scripts

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm start       # servir el build
npm run lint    # eslint
npm test        # tests (vitest)
```

## Arquitectura

El código separa **framework** (`app/` — Next.js, routing, hooks de UI) de **núcleo**
(`lib/` — dominio, casos de uso, integraciones externas; sin dependencias de React/Next).
Ver [ARCHITECTURE.md](ARCHITECTURE.md) para el detalle completo (estructura de carpetas,
flujo de datos, y por qué está separado así).

Resumen rápido:

- `app/page.tsx` — composition root (~50 líneas): llama a los hooks y delega el render a `HomeView`.
- `app/hooks/` — `useLeagueData`, `useSectionRouter`, `useEventCountdown`, `useMediaQuery`, `useParallaxScrollY`.
- `app/components/home/` — presentación de la home (`HomeView`, `BackgroundLayer`, `LoadingScreen`, `ErrorScreen`...).
- `app/components/league/*` — componentes de dominio de liga (hero, ranking con podio, timeline, archivo de batallas, inscripción, stats).
- `lib/domain/league/` — tipos y reglas puras (`types.ts`, `rules.ts`, `registrationErrors.ts`).
- `lib/application/league/` — casos de uso (`getLeague`, `registerParticipant`, `buildShareHighlights`).
- `lib/infrastructure/` — Sheets (`sheetsClient`, `payloadMapper` con zod), Telegram, anti-spam (`rateLimiter`, `honeypot`).
- `app/api/league` — adaptador HTTP delgado sobre los casos de uso. `GET` con **revalidación de 45s** (ISR + `stale-while-revalidate`); `POST` para inscripciones con **honeypot + rate-limit por IP**.
- `app/api/og` — imagen Open Graph dinámica (edge), generada a partir de los datos reales de la liga (fecha destacada, top 3 del ranking o último campeón).
- `app/api/mcs`, `app/api/share`, `app/api/realtime` — retiradas (410 Gone); eran del "roster reveal" de la v1, previo al sistema de Liga/Eventos.

### Tipografías
Sistema de 4 familias vía `next/font`: **Anton** (impacto), **Oswald** (display/UI),
**Inter** (texto) y **JetBrains Mono** (cifras/estadísticas).

## Datos y caché
`/api/league` cachea la respuesta de Sheets 45s en el servidor, así el polling del
cliente no golpea Apps Script en cada visita. El payload se valida y normaliza con
zod en `lib/infrastructure/sheets/payloadMapper.ts` (tolerante a campos ausentes o
tipos inesperados, sin tirar la fila).
