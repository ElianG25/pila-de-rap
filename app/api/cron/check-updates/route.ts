import { NextResponse } from "next/server";
import { checkForUpdatesAndNotify } from "@/lib/application/notifications/checkForUpdatesAndNotify";

// Vercel Cron invoca este endpoint cada 5 min (ver vercel.json) con un header
// Authorization: Bearer <CRON_SECRET> para que nadie más pueda dispararlo.
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "NO_AUTORIZADO" }, { status: 401 });
    }
  }

  try {
    const result = await checkForUpdatesAndNotify();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("GET /api/cron/check-updates error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
