import { NextResponse } from "next/server";

const MAX_CUPOS = 32;
const MC_PER_DROP = 2;

// Primer reveal: 28 de abril de 2026 a las 7:00 PM en República Dominicana.
// RD es UTC-4, por eso 7:00 PM RD = 23:00 UTC.
const FIRST_REVEAL_AT_UTC = Date.UTC(2026, 3, 28, 23, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

function getVisibleCount(total: number) {
  const now = Date.now();

  if (now < FIRST_REVEAL_AT_UTC) return 0;

  const dropsPassed = Math.floor((now - FIRST_REVEAL_AT_UTC) / DAY_MS) + 1;
  return Math.min(total, dropsPassed * MC_PER_DROP);
}

export async function GET() {
  try {
    if (!process.env.SHEETS_GET_URL) {
      throw new Error("Missing SHEETS_GET_URL");
    }

    const res = await fetch(process.env.SHEETS_GET_URL, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Sheets request failed: ${res.status}`);
    }

    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];

    const total = data.length;
    const restantes = Math.max(0, MAX_CUPOS - total);
    const visibleCount = getVisibleCount(total);

    const result = data.map((mc: any, index: number) => ({
      ...mc,
      visible: index < visibleCount,
    }));

    return NextResponse.json({
      data: result,
      total,
      restantes,
      max: MAX_CUPOS,
      revealed: visibleCount,
      nextRevealHour: "7:00 PM RD",
    });
  } catch (err) {
    console.error("Error loading MCs:", err);

    return NextResponse.json(
      {
        data: [],
        total: 0,
        restantes: MAX_CUPOS,
        max: MAX_CUPOS,
        revealed: 0,
        error: "No se pudieron cargar los MCs",
      },
      { status: 500 }
    );
  }
}
