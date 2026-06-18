import { NextResponse } from "next/server";
import type { LeagueEvent, LeaguePayload, RankingItem, Battle, Registration } from "@/app/lib/league/types";

const SHEETS_URL = process.env.SHEETS_GET_URL;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizePhone(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function getErrorStatus(error: string) {
  if (error === "INSCRIPCIONES_CERRADAS") return 403;
  if (error === "CUPOS_AGOTADOS") return 409;
  if (error === "YA_INSCRITO") return 409;
  if (error === "TELEFONO_INVALIDO") return 400;
  if (error === "CAMPOS_INCOMPLETOS") return 400;
  if (error === "NO_ACTIVE_EVENT") return 400;
  return 400;
}

/** Limpia artefacto de Sheets: hora leida como fecha "1899-12-30..." */
function normalizeTime(value: string): string {
  if (!value || value.startsWith("1899-12-30")) return "";
  return value;
}

function normalizeEvent(event: LeagueEvent): LeagueEvent {
  return {
    ...event,
    horaEvento: normalizeTime(event.horaEvento),
    inscripcionesAbiertas: Boolean(event.inscripcionesAbiertas),
  };
}

/**
 * Transforma el payload crudo del Apps Script (formato viejo o nuevo)
 * al shape que espera fetchLeague(): { ok: true, league: LeaguePayload }
 */
function adaptPayload(raw: Record<string, unknown>): { ok: true; league: LeaguePayload } {
  // Formato nuevo: el Apps Script ya devuelve { ok, league }
  if (raw.ok === true && raw.league != null) {
    const league = raw.league as LeaguePayload;

    // Normalizar eventos (hora artefacto, inscripcionesAbiertas como boolean)
    const events = (league.events ?? []).map(normalizeEvent);

    // Corregir featuredEvent y activeEvent usando los IDs del config cuando hay discrepancia
    const featuredEventId = league.config?.featuredEventId;
    const activeEventId = league.config?.activeEventId;
    const latestCompletedEventId = league.config?.latestCompletedEventId;

    const featuredEvent = featuredEventId
      ? (events.find((e) => e.eventId === featuredEventId) ?? league.featuredEvent)
      : league.featuredEvent;

    const activeEvent = activeEventId
      ? (events.find((e) => e.eventId === activeEventId) ?? league.activeEvent)
      : league.activeEvent;

    const latestCompletedEvent = latestCompletedEventId
      ? (events.find((e) => e.eventId === latestCompletedEventId) ?? league.latestCompletedEvent)
      : league.latestCompletedEvent;

    const normalizedLeague: LeaguePayload = {
      ...league,
      events,
      featuredEvent: featuredEvent ? normalizeEvent(featuredEvent) : null,
      activeEvent: activeEvent ? normalizeEvent(activeEvent) : null,
      latestCompletedEvent: latestCompletedEvent ? normalizeEvent(latestCompletedEvent) : null,
    };

    return { ok: true, league: normalizedLeague };
  }

  // Formato viejo: { data: [], events: [], ranking: [], battles: [], config: {} }
  const events: LeagueEvent[] = (
    Array.isArray(raw.events) ? (raw.events as LeagueEvent[]) : []
  ).map(normalizeEvent);

  const registrations: Registration[] = Array.isArray(raw.data) ? (raw.data as Registration[]) : [];
  const ranking: RankingItem[] = Array.isArray(raw.ranking) ? (raw.ranking as RankingItem[]) : [];
  const battles: Battle[] = Array.isArray(raw.battles) ? (raw.battles as Battle[]) : [];
  const config: Record<string, string> = (raw.config ?? {}) as Record<string, string>;

  const publicEvents = events
    .filter((e) => e.visible && e.estado !== "oculta")
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  const ACTIVE_STATES = ["en_vivo", "inscripciones", "anunciada"];

  const featuredEvent =
    publicEvents.find((e) => ACTIVE_STATES.includes(e.estado)) ??
    publicEvents[0] ??
    null;

  const activeEvent =
    publicEvents.find((e) => e.inscripcionesAbiertas) ??
    publicEvents.find((e) => ["en_vivo", "inscripciones"].includes(e.estado)) ??
    null;

  const latestCompletedEvent =
    [...publicEvents].reverse().find((e) => e.estado === "finalizada") ?? null;

  const maxCupos = activeEvent?.maxCupos ?? featuredEvent?.maxCupos ?? 32;
  const total = registrations.length;

  const capacity = {
    total,
    restantes: Math.max(0, maxCupos - total),
    max: maxCupos,
  };

  const league: LeaguePayload = {
    config,
    activeEvent,
    featuredEvent,
    latestCompletedEvent,
    events,
    registrations,
    participants: [],
    ranking,
    battles,
    media: [],
    capacity,
  };

  return { ok: true, league };
}

export async function GET() {
  if (!SHEETS_URL) {
    return NextResponse.json(
      { ok: false, error: "SHEETS_GET_URL no configurado" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(SHEETS_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Error al conectar con la base de datos" },
        { status: 502 }
      );
    }

    const raw = await response.json();
    const adapted = adaptPayload(raw as Record<string, unknown>);

    return NextResponse.json(adapted, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!SHEETS_URL) {
    return NextResponse.json(
      { ok: false, error: "SHEETS_GET_URL no configurado" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const nombre = String(body.nombre ?? "").trim();
    const alias = String(body.alias ?? "").trim();
    const telefono = normalizePhone(body.telefono);
    const instagram = String(body.instagram ?? "").trim();
    const eventId = String(body.eventId ?? "").trim();

    if (!nombre || !alias || !telefono) {
      return NextResponse.json(
        { ok: false, error: "CAMPOS_INCOMPLETOS" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(telefono)) {
      return NextResponse.json(
        { ok: false, error: "TELEFONO_INVALIDO" },
        { status: 400 }
      );
    }

    const sheetsPayload = { nombre, alias, telefono, instagram, eventId };

    const response = await fetch(SHEETS_URL, {
      method: "POST",
      body: JSON.stringify(sheetsPayload),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      cache: "no-store",
    });

    const raw = await response.text();
    let payload: { ok?: boolean; error?: string; restantes?: number } = {};

    try {
      payload = JSON.parse(raw);
    } catch {
      console.error("JSON parse error from Sheets:", raw);
      return NextResponse.json(
        { ok: false, error: "RESPUESTA_INVALIDA_SHEETS" },
        { status: 500 }
      );
    }

    if (!payload.ok) {
      const error = payload.error || "ERROR_SHEETS";
      return NextResponse.json(
        { ok: false, error, restantes: payload.restantes ?? null },
        { status: getErrorStatus(error) }
      );
    }

    // Telegram notification (best-effort, fire-and-forget)
    if (process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const whatsappLink =
        "https://api.whatsapp.com/send?phone=1" +
        telefono +
        "&text=" +
        encodeURIComponent("Inscripcion recibida en Pila de Ra\' - " + alias);

      fetch(
        "https://api.telegram.org/bot" +
          process.env.TELEGRAM_TOKEN +
          "/sendMessage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            parse_mode: "HTML",
            text:
              "<b>NUEVA INSCRIPCION</b>\n\n" +
              "<b>Nombre:</b> " + escapeHtml(nombre) + "\n" +
              "<b>Alias:</b> " + escapeHtml(alias) + "\n" +
              "<b>Telefono:</b> " + escapeHtml(telefono) + "\n" +
              "<b>Instagram:</b> " + escapeHtml(instagram || "ninguno") + "\n" +
              (eventId ? "<b>Evento:</b> " + escapeHtml(eventId) + "\n" : "") +
              "\n<a href=\"" + escapeHtml(whatsappLink) + "\">WhatsApp</a>",
          }),
          cache: "no-store",
        }
      ).catch((err: unknown) => console.error("Telegram error:", err));
    }

    return NextResponse.json({ ok: true, restantes: payload.restantes });
  } catch (error) {
    console.error("POST /api/league error:", error);
    return NextResponse.json(
      { ok: false, error: "ERROR_INTERNO" },
      { status: 500 }
    );
  }
}
