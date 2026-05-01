import { NextResponse } from "next/server";

const START_DATE = new Date("2026-04-28T19:00:00");
const MAX_CUPOS = 32;
const MC_PER_DROP = 2;

export async function GET() {
  try {
    const res = await fetch(process.env.SHEETS_GET_URL!, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Error fetching sheets");
    }

    const json = await res.json();

    // ✅ Orden real del Sheets
    const data = json.data || [];

    // 📊 Métricas
    const total = data.length;
    const restantes = Math.max(0, MAX_CUPOS - total);

    // ⏰ Hora actual
    const now = new Date();

    // 🔥 Diferencia desde el primer reveal
    const diffMs = now.getTime() - START_DATE.getTime();

    // ❗ Si todavía no llega el primer reveal
    let revealsPassed = 0;

    if (diffMs >= 0) {
      revealsPassed = Math.floor(
        diffMs / (1000 * 60 * 60 * 24)
      ) + 1;
    }

    // 🎤 Cantidad visible
    const visibleCount = Math.min(
      data.length,
      revealsPassed * MC_PER_DROP
    );

    // ✅ Aplicar visible
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
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      data: [],
      total: 0,
      restantes: MAX_CUPOS,
      max: MAX_CUPOS,
      revealed: 0,
    });
  }
}