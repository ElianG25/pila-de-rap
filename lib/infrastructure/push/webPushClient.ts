import webpush from "web-push";
import type { PushSubscriptionData } from "@/lib/domain/notifications/types";

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys no configuradas (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)");
  }
  webpush.setVapidDetails("mailto:hello@piladerap.vercel.app", publicKey, privateKey);
  configured = true;
}

export type SendPushResult = { ok: true } | { ok: false; shouldRemove: boolean };

/** Envía una notificación a una suscripción. Si el navegador la dio de baja (404/410), avisa que hay que borrarla. */
export async function sendPushToSubscription(
  subscription: PushSubscriptionData,
  payload: unknown
): Promise<SendPushResult> {
  ensureConfigured();
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true };
  } catch (err) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      return { ok: false, shouldRemove: true };
    }
    console.error("web-push error:", err);
    return { ok: false, shouldRemove: false };
  }
}
