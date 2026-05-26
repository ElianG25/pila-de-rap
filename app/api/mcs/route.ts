import { NextResponse } from "next/server";

const MAX_CUPOS = 32;
const MC_PER_DROP = 2;

const FIRST_REVEAL_AT_UTC = Date.UTC(2026, 3, 28, 23, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

export const revalidate = 60;

type SheetMc = Record<string, unknown> & {
  alias?: unknown;
  nombre?: unknown;
};

function getVisibleCount(total: number, now: number = Date.now()): number {
  if (now < FIRST_REVEAL_AT_UTC) return 0;

  const dropsPassed = Math.floor((now - FIRST_REVEAL_AT_UTC) / DAY_MS) + 1;
  return Math.min(total, dropsPassed * MC_PER_DROP, MAX_CUPOS);
}

function getNextRevealAt(
  revealed: number,
  now: number = Date.now()
): number | null {
  if (revealed >= MAX_CUPOS) return null;

  if (now < FIRST_REVEAL_AT_UTC) return FIRST_REVEAL_AT_UTC;

  const dropsPassed = Math.floor((now - FIRST_REVEAL_AT_UTC) / DAY_MS) + 1;
  return FIRST_REVEAL_AT_UTC + dropsPassed * DAY_MS;
}

function getHypeCount(
  total: number,
  revealed: number,
  now: number = Date.now()
): number {
  const minutes = Math.floor(now / 60000);
  const wave = Math.abs(Math.sin(minutes / 11)) * 140;
  const pulse = Math.abs(Math.cos(minutes / 5)) * 45;

  return Math.round(420 + total * 9 + revealed * 16 + wave + pulse);
}

export async function GET() {
  try {
    const sheetsUrl = process.env.SHEETS_GET_URL;

    if (!sheetsUrl) {
      throw new Error("Missing SHEETS_GET_URL");
    }

    const now = Date.now();

    const res = await fetch(sheetsUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Sheets request failed: ${res.status}`);
    }

    const json = await res.json();

    const data: SheetMc[] = Array.isArray(json?.data)
      ? json.data.slice(0, MAX_CUPOS)
      : [];

    const total = data.length;
    const visibleCount = getVisibleCount(total, now);
    const isRosterComplete = visibleCount >= MAX_CUPOS;
    const restantes = Math.max(0, MAX_CUPOS - visibleCount);
    const nextRevealAt = getNextRevealAt(visibleCount, now);

    const safeResult = data.map((mc, index) => {
      const visible = index < visibleCount;

      return {
        ...mc,
        alias: String(mc.alias ?? mc.nombre ?? "MC"),
        visible,
        justRevealed:
          !isRosterComplete &&
          visible &&
          index >= Math.max(0, visibleCount - MC_PER_DROP),
      };
    });

    return NextResponse.json(
      {
        data: safeResult,
        total,
        restantes,
        max: MAX_CUPOS,
        revealed: visibleCount,
        isRosterComplete,
        serverTime: now,
        nextRevealAt,
        nextRevealHour: isRosterComplete ? null : "7:00 PM RD",
        hypeCount: getHypeCount(total, visibleCount, now),
        mcPerDrop: MC_PER_DROP,
        config: json?.config ?? null,
        ranking: json?.ranking ?? [],
        battles: json?.battles ?? [],
      },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Error loading MCs:", err);

    const now = Date.now();

    return NextResponse.json(
      {
        data: [],
        total: 0,
        restantes: MAX_CUPOS,
        max: MAX_CUPOS,
        revealed: 0,
        isRosterComplete: false,
        serverTime: now,
        nextRevealAt: getNextRevealAt(0, now),
        nextRevealHour: "7:00 PM RD",
        hypeCount: getHypeCount(0, 0, now),
        mcPerDrop: MC_PER_DROP,
        error: "No se pudieron cargar los MCs",
        config: null,
        ranking: [],
        battles: [],
      },
      { status: 500 }
    );
  }
}