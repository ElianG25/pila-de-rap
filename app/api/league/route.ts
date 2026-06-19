import { NextResponse } from "next/server";
import { adaptPayload } from "@/app/lib/league/adapt";

const SHEETS_URL = process.env.SHEETS_GET_URL;

// Revalidación del GET cada 45s (ISR). Evita golpear Apps Script en cada visita.
export const revalidate = 45;

/* ── Anti-spam ────────────────────────────────────────────────────── */
const RATE_LIMIT = 4; // inscripciones permitidas por IP
const RATE_WINDOW_MS = 10 * 60 * 1000; // en 10 minutos
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  // Limpieza oportunista para no crecer sin límite
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
  }
  return arr.length > RATE_LIMIT;
}

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}

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
  if (error === "RATE_LIMITED") return 429;
  if (error === "TELEFONO_INVALIDO") return 400;
  if (error === "CAMPOS_INCOMPLETOS") return 400;
  if (error === "NO_ACTIVE_EVENT") return 400;
  return 400;
}

export async function GET() {
  if (!SHEETS_URL) {
    return NextResponse.json({ ok: false, error: "SHEETS_GET_URL no configurado" }, { status: 500 });
  }

  try {
    const response = await fetch(SHEETS_URL, {
      method: "GET",
      next: { revalidate: 45 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Error al conectar con la base de datos" },
        { status: 502 }
      );
    }

    const raw = await response.json();
    const adapted = adaptPayload(raw as Record<string, unknown>);

    return NextResponse.json(adapted, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=45, stale-while-revalidate=120" },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!SHEETS_URL) {
    return NextResponse.json({ ok: false, error: "SHEETS_GET_URL no configurado" }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Honeypot: campo oculto que un humano nunca rellena. Si viene con datos → bot.
    // Aceptamos en falso (200) para no darle pistas al bot, sin escribir nada.
    if (String(body.website ?? "").trim() !== "") {
      return NextResponse.json({ ok: true, restantes: null });
    }

    // Rate-limit por IP (best-effort en memoria por instancia)
    if (rateLimited(clientIp(request))) {
      return NextResponse.json({ ok: false, error: "RATE_LIMITED" }, { status: 429 });
    }

    const nombre = String(body.nombre ?? "").trim();
    const alias = String(body.alias ?? "").trim();
    const telefono = normalizePhone(body.telefono);
    const instagram = String(body.instagram ?? "").trim();
    const eventId = String(body.eventId ?? "").trim();

    if (!nombre || !alias || !telefono) {
      return NextResponse.json({ ok: false, error: "CAMPOS_INCOMPLETOS" }, { status: 400 });
    }

    if (!/^\d{10}$/.test(telefono)) {
      return NextResponse.json({ ok: false, error: "TELEFONO_INVALIDO" }, { status: 400 });
    }

    const sheetsPayload = { nombre, alias, telefono, instagram, eventId };

    const response = await fetch(SHEETS_URL, {
      method: "POST",
      body: JSON.stringify(sheetsPayload),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      cache: "no-store",
    });

    const raw = await response.text();
    let payload: { ok?: boolean; error?: string; restantes?: number } = {};

    try {
      payload = JSON.parse(raw);
    } catch {
      console.error("JSON parse error from Sheets:", raw);
      return NextResponse.json({ ok: false, error: "RESPUESTA_INVALIDA_SHEETS" }, { status: 500 });
    }

    if (!payload.ok) {
      const error = payload.error || "ERROR_SHEETS";
      return NextResponse.json(
        { ok: false, error, restantes: payload.restantes ?? null },
        { status: getErrorStatus(error) }
      );
    }

    // Notificación a Telegram (best-effort, fire-and-forget)
    if (process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const whatsappLink =
        "https://api.whatsapp.com/send?phone=1" +
        telefono +
        "&text=" +
        encodeURIComponent("Inscripcion recibida en Pila de Ra' - " + alias);

      fetch("https://api.telegram.org/bot" + process.env.TELEGRAM_TOKEN + "/sendMessage", {
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
      }).catch((err: unknown) => console.error("Telegram error:", err));
    }

    return NextResponse.json({ ok: true, restantes: payload.restantes });
  } catch (error) {
    console.error("POST /api/league error:", error);
    return NextResponse.json({ ok: false, error: "ERROR_INTERNO" }, { status: 500 });
  }
}
