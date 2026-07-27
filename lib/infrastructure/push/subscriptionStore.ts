import { Redis } from "@upstash/redis";
import type { PushSubscriptionData } from "@/lib/domain/notifications/types";
import type { LeaguePayload } from "@/lib/domain/league/types";

const SUBSCRIPTIONS_KEY = "push:subscriptions";
const SNAPSHOT_KEY = "push:last-league-snapshot";
const REMINDED_PREFIX = "push:reminded:";
const REMINDED_TTL_SECONDS = 60 * 60 * 24 * 2;

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

export async function saveSubscription(subscription: PushSubscriptionData): Promise<void> {
  await getRedis().hset(SUBSCRIPTIONS_KEY, { [subscription.endpoint]: JSON.stringify(subscription) });
}

export async function removeSubscription(endpoint: string): Promise<void> {
  await getRedis().hdel(SUBSCRIPTIONS_KEY, endpoint);
}

export async function getAllSubscriptions(): Promise<PushSubscriptionData[]> {
  const all = await getRedis().hgetall<Record<string, string>>(SUBSCRIPTIONS_KEY);
  if (!all) return [];
  return Object.values(all)
    .map((raw) => {
      try {
        return JSON.parse(raw) as PushSubscriptionData;
      } catch {
        return null;
      }
    })
    .filter((s): s is PushSubscriptionData => s !== null);
}

export async function getLastSnapshot(): Promise<LeaguePayload | null> {
  const snapshot = await getRedis().get<LeaguePayload>(SNAPSHOT_KEY);
  return snapshot ?? null;
}

export async function saveSnapshot(snapshot: LeaguePayload): Promise<void> {
  await getRedis().set(SNAPSHOT_KEY, snapshot);
}

function reminderKey(eventId: string, now: Date): string {
  return `${REMINDED_PREFIX}${eventId}:${now.toISOString().slice(0, 10)}`;
}

export async function hasBeenRemindedToday(eventId: string, now: Date): Promise<boolean> {
  const value = await getRedis().get(reminderKey(eventId, now));
  return value != null;
}

export async function markRemindedToday(eventId: string, now: Date): Promise<void> {
  await getRedis().set(reminderKey(eventId, now), "1", { ex: REMINDED_TTL_SECONDS });
}
