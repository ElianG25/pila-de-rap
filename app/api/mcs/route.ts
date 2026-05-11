import { NextResponse } from "next/server";

const MAX_CUPOS = 32;
const MC_PER_DROP = 2;

const FIRST_REVEAL_AT_UTC = Date.UTC(2026, 3, 28, 23, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

function getVisibleCount(total: number, now = Date.now()) {
  if (now < FIRST_REVEAL_AT_UTC) return 0;

  const dropsPassed = Math.floor((now - FIRST_REVEAL_AT_UTC) / DAY_MS) + 1;
  return Math.min(total, dropsPassed * MC_PER_DROP);
}

function getNextRevealAt(now = Date.now()) {
  if (now < FIRST_REVEAL_AT_UTC) return FIRST_REVEAL_AT_UTC;

  const dropsPassed = Math.floor((now - FIRST_REVEAL_AT_UTC) / DAY_MS) + 1;
  return FIRST_REVEAL_AT_UTC + dropsPassed * DAY_MS;
}

function getHypeCount(total: number, revealed: number, now = Date.now()) {
  const minutes = Math.floor(now / 60000);
  const wave = Math.abs(Math.sin(minutes / 11)) * 140;
  const pulse = Math.abs(Math.cos(minutes / 5)) * 45;

  return Math.round(420 + total * 9 + revealed * 16 + wave + pulse);
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.SHEETS_GET_URL) {
      throw new Error("Missing SHEETS_GET_URL");
    }

    const now = Date.now();

    const res = await fetch(process.env.SHEETS_GET_URL, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Sheets request failed: ${res.status}`);
    }

    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];

    const total = data.length;
    const restantes = Math.max(0, MAX_CUPOS - total);
    const visibleCount = getVisibleCount(total, now);
    const nextRevealAt = getNextRevealAt(now);

    const result = data.map((mc: any, index: number) => ({
      ...mc,
      visible: index < visibleCount,
      justRevealed:
        index >= Math.max(0, visibleCount - MC_PER_DROP) &&
        index < visibleCount,
    }));

    return NextResponse.json(
      {
        data: result,
        total,
        restantes,
        max: MAX_CUPOS,
        revealed: visibleCount,
        serverTime: now,
        nextRevealAt,
        nextRevealHour: "7:00 PM RD",
        hypeCount: getHypeCount(total, visibleCount, now),
        mcPerDrop: MC_PER_DROP,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Error loading MCs:", err);

    return NextResponse.json(
      {
        data: [],
        total: 0,
        restantes: MAX_CUPOS,
        max: MAX_CUPOS,
        revealed: 0,
        serverTime: Date.now(),
        nextRevealAt: getNextRevealAt(),
        hypeCount: getHypeCount(0, 0),
        error: "No se pudieron cargar los MCs",
      },
      { status: 500 }
    );
  }
}