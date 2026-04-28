import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(process.env.SHEETS_GET_URL!, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Error al consultar Sheets");
    }

    const data = await res.json();

    return NextResponse.json({
      total: data.total ?? 0,
      restantes: data.restantes ?? 0,
      max: data.max ?? 24,
    });

  } catch (err) {
    console.error("SLOTS ERROR:", err);

    return NextResponse.json({
      total: 0,
      restantes: 0,
      max: 24,
      error: true,
    });
  }
}