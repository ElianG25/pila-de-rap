import { NextResponse } from "next/server";
import { getLeague } from "@/lib/application/league/getLeague";
import { registerParticipant } from "@/lib/application/league/registerParticipant";
import { getErrorStatus } from "@/lib/domain/league/registrationErrors";
import {
  isSheetsConfigured,
  SheetsConfigError,
  SheetsInvalidResponseError,
  SheetsUnavailableError,
} from "@/lib/infrastructure/sheets/sheetsClient";
import { isHoneypotTriggered } from "@/lib/infrastructure/security/honeypot";
import { getClientIp, isRateLimited } from "@/lib/infrastructure/security/rateLimiter";

// Revalidación del GET cada 45s (ISR). Evita golpear Apps Script en cada visita.
export const revalidate = 45;

function normalizePhone(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ ok: false, error: "SHEETS_GET_URL no configurado" }, { status: 500 });
  }

  try {
    const league = await getLeague(45);
    return NextResponse.json(
      { ok: true, league },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=45, stale-while-revalidate=120" } }
    );
  } catch (error) {
    if (error instanceof SheetsConfigError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    if (error instanceof SheetsUnavailableError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ ok: false, error: "SHEETS_GET_URL no configurado" }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Honeypot: aceptamos en falso (200) para no darle pistas al bot, sin escribir nada.
    if (isHoneypotTriggered(body.website)) {
      return NextResponse.json({ ok: true, restantes: null });
    }

    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json({ ok: false, error: "RATE_LIMITED" }, { status: getErrorStatus("RATE_LIMITED") });
    }

    const nombre = String(body.nombre ?? "").trim();
    const alias = String(body.alias ?? "").trim();
    const telefono = normalizePhone(body.telefono);
    const instagram = String(body.instagram ?? "").trim();
    const eventId = String(body.eventId ?? "").trim();

    if (!nombre || !alias || !telefono) {
      return NextResponse.json({ ok: false, error: "CAMPOS_INCOMPLETOS" }, { status: getErrorStatus("CAMPOS_INCOMPLETOS") });
    }

    if (!/^\d{10}$/.test(telefono)) {
      return NextResponse.json({ ok: false, error: "TELEFONO_INVALIDO" }, { status: getErrorStatus("TELEFONO_INVALIDO") });
    }

    const result = await registerParticipant({ nombre, alias, telefono, instagram, eventId });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, restantes: result.restantes },
        { status: getErrorStatus(result.error) }
      );
    }

    return NextResponse.json({ ok: true, restantes: result.restantes });
  } catch (error) {
    if (error instanceof SheetsInvalidResponseError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    console.error("POST /api/league error:", error);
    return NextResponse.json({ ok: false, error: "ERROR_INTERNO" }, { status: 500 });
  }
}
