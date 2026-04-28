import { NextResponse } from "next/server";

const START_DATE = new Date("2026-04-28"); // 👈 hoy (puedes cambiarlo)

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
    const res = await fetch(process.env.SHEETS_GET_URL!);

    if (!res.ok) throw new Error();

    const json = await res.json();
    let data = json.data || [];

    // 🔥 1. Mezclar SIEMPRE igual
    const seed = 12345; // puedes cambiarlo si quieres otro orden
    data = seededShuffle([...data], seed);

    // ⏳ 2. Calcular días desde inicio
    const now = new Date();
    const diffTime = now.getTime() - START_DATE.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 🎤 3. Marcar visibles
    const visibleCount = Math.max(0, daysPassed + 1);

    const result = data.map((mc: any, index: number) => ({
      ...mc,
      visible: index < visibleCount,
    }));

    return NextResponse.json({
      data: result,
      revealed: visibleCount,
    });

  } catch (err) {
    return NextResponse.json({ data: [] });
  }
}