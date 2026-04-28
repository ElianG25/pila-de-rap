import { NextResponse } from "next/server";

const MAX_CUPOS = 24;

export async function GET() {
  try {
    const res = await fetch(process.env.SHEETS_GET_URL!);
    const data = await res.json();

    const total = data.data?.length || 0;

    return NextResponse.json({
      total,
      restantes: MAX_CUPOS - total,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({
      total: 0,
      restantes: MAX_CUPOS,
    });
  }
}