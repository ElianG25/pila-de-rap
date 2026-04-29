import { NextResponse } from "next/server";

const START_DATE = new Date("2026-04-28");
const MAX_CUPOS = 32;

export async function GET() {
  try {
    const res = await fetch(process.env.SHEETS_GET_URL!, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Error fetching sheets");

    const json = await res.json();

    // ✅ ORDEN ORIGINAL DEL SHEET (sin shuffle)
    const data = json.data || [];

    // 📊 métricas reales
    const total = data.length;
    const restantes = Math.max(0, MAX_CUPOS - total);

    // ⏳ días desde inicio
    const now = new Date();
    const diffTime = now.getTime() - START_DATE.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 🎤 visibles (1 por día)
    const visibleCount = Math.max(0, daysPassed + 1);

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