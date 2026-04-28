import { NextResponse } from "next/server";

const START_DATE = new Date("2026-04-28");
const MAX_CUPOS = 24;

// 🎲 shuffle con seed (estable)
function seededShuffle(array: any[], seed: number) {
  let m = array.length, t, i;

  while (m) {
    i = Math.floor(random(seed) * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
    seed++;
  }

  return array;
}

// 🔢 random determinístico
function random(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export async function GET() {
  try {
    const res = await fetch(process.env.SHEETS_GET_URL!, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Error fetching sheets");

    const json = await res.json();
    let data = json.data || [];

    // 📊 métricas reales
    const total = data.length;
    const restantes = Math.max(0, MAX_CUPOS - total);

    // 🎲 1. Orden fijo
    const seed = 12345;
    data = seededShuffle([...data], seed);

    // ⏳ 2. días desde inicio
    const now = new Date();
    const diffTime = now.getTime() - START_DATE.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 🎤 3. visibles
    const visibleCount = Math.max(0, daysPassed + 1);

    const result = data.map((mc: any, index: number) => ({
      ...mc,
      visible: index < visibleCount,
    }));

    return NextResponse.json({
      data: result,
      total,
      restantes,   // 👈 🔥 ESTO ES LO QUE TE FALTABA
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
    });
  }
}