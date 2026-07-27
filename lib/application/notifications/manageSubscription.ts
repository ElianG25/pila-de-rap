import { saveSubscription, removeSubscription } from "@/lib/infrastructure/push/subscriptionStore";
import type { PushSubscriptionData } from "@/lib/domain/notifications/types";

export async function subscribeToPush(subscription: PushSubscriptionData): Promise<void> {
  await saveSubscription(subscription);
}

export async function unsubscribeFromPush(endpoint: string): Promise<void> {
  await removeSubscription(endpoint);
}
