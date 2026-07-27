import { getLeague } from "@/lib/application/league/getLeague";
import { diffLeagueForNotifications, buildDayOfReminder } from "@/lib/domain/notifications/diffLeague";
import { isEventToday } from "@/lib/domain/notifications/isEventToday";
import type { NotificationEvent } from "@/lib/domain/notifications/types";
import { sendPushToSubscription } from "@/lib/infrastructure/push/webPushClient";
import {
  getAllSubscriptions,
  getLastSnapshot,
  hasBeenRemindedToday,
  markRemindedToday,
  removeSubscription,
  saveSnapshot,
} from "@/lib/infrastructure/push/subscriptionStore";

export type CheckForUpdatesResult = {
  notifications: NotificationEvent[];
  subscriptionsNotified: number;
  subscriptionsRemoved: number;
};

/**
 * Caso de uso disparado por el cron: trae la liga fresca, la compara contra
 * el último snapshot guardado, arma las notificaciones (más el recordatorio
 * del día, que depende de la fecha actual y no de un cambio de estado), y
 * las manda a todas las suscripciones. Al final guarda el snapshot actual
 * para la próxima comparación.
 */
export async function checkForUpdatesAndNotify(now: Date = new Date()): Promise<CheckForUpdatesResult> {
  const current = await getLeague(0);
  const previous = await getLastSnapshot();

  const notifications = [...diffLeagueForNotifications(previous, current)];

  for (const ev of current.events) {
    if (!ev.visible || ev.estado === "finalizada" || ev.estado === "oculta") continue;
    if (!isEventToday(ev.fechaEvento, now)) continue;
    if (await hasBeenRemindedToday(ev.eventId, now)) continue;

    notifications.push(buildDayOfReminder(ev));
    await markRemindedToday(ev.eventId, now);
  }

  let subscriptionsNotified = 0;
  let subscriptionsRemoved = 0;

  if (notifications.length > 0) {
    const subscriptions = await getAllSubscriptions();

    for (const subscription of subscriptions) {
      for (const notification of notifications) {
        const result = await sendPushToSubscription(subscription, notification);
        if (result.ok) {
          subscriptionsNotified++;
        } else if (result.shouldRemove) {
          await removeSubscription(subscription.endpoint);
          subscriptionsRemoved++;
          break; // esta suscripción ya no existe, no insistir con el resto de notificaciones
        }
      }
    }
  }

  await saveSnapshot(current);

  return { notifications, subscriptionsNotified, subscriptionsRemoved };
}
