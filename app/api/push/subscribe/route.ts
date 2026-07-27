import { NextResponse } from "next/server";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/application/notifications/manageSubscription";

function isValidSubscription(body: unknown): body is { endpoint: string; keys: { p256dh: string; auth: string } } {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.endpoint !== "string" || !b.endpoint) return false;
  const keys = b.keys as Record<string, unknown> | undefined;
  return typeof keys?.p256dh === "string" && typeof keys?.auth === "string";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isValidSubscription(body)) {
      return NextResponse.json({ ok: false, error: "SUBSCRIPTION_INVALIDA" }, { status: 400 });
    }

    await subscribeToPush({ endpoint: body.endpoint, keys: body.keys });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/push/subscribe error:", error);
    return NextResponse.json({ ok: false, error: "ERROR_INTERNO" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const endpoint = (body as { endpoint?: string })?.endpoint;
    if (!endpoint) {
      return NextResponse.json({ ok: false, error: "ENDPOINT_REQUERIDO" }, { status: 400 });
    }

    await unsubscribeFromPush(endpoint);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/push/subscribe error:", error);
    return NextResponse.json({ ok: false, error: "ERROR_INTERNO" }, { status: 500 });
  }
}
