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

- `app/page.tsx` — shell de una sola página con navegación por secciones (inicio, ranking, fechas, batallas, inscripción).
- `app/components/league/*` — componentes de UI (hero, ranking con podio, timeline de fechas, archivo de batallas, inscripción, stats).
- `app/lib/league/` — `types.ts` (tipos), `helpers.ts` (orden/filtrado), `adapt.ts` (normalización + validación zod del payload de Sheets), `api.ts` (fetch cliente).
- `app/api/league` — proxy a Sheets. `GET` con **revalidación de 45s** (ISR + `stale-while-revalidate`); `POST` para inscripciones con **honeypot + rate-limit por IP**.
- `app/api/og` y `app/api/share` — imágenes Open Graph dinámicas (`/api/og` depende de `/api/mcs`).

### Tipografías
Sistema de 4 familias vía `next/font`: **Anton** (impacto), **Oswald** (display/UI),
**Inter** (texto) y **JetBrains Mono** (cifras/estadísticas).

## Datos y caché
`/api/league` cachea la respuesta de Sheets 45s en el servidor, así el polling del
cliente no golpea Apps Script en cada visita. El payload se valida y normaliza con
zod en `adapt.ts` (tolerante a campos ausentes o tipos inesperados, sin tirar la fila).
