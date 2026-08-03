import { Redis } from "@upstash/redis";

const RATE_LIMIT = 4; // inscripciones permitidas por IP
const RATE_WINDOW_SECONDS = 10 * 60; // en 10 minutos

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

/**
 * Anti-spam por IP en Redis — antes vivía en un Map en memoria por
 * instancia, que no servía en un despliegue serverless multi-instancia
 * (cada instancia tenía su propio contador, fácil de esquivar). Es una
 * ventana fija (no deslizante como el Map original): se resetea de golpe
 * cada 10 min en vez de ir descontando hit por hit, una simplificación
 * razonable para anti-spam best-effort.
 *
 * Fail-open: si Redis falla, no bloquea la inscripción — esto es una
 * protección extra, no debe tumbar el flujo principal si el store falla.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const key = `ratelimit:register:${ip}`;
    const count = await getRedis().incr(key);
    if (count === 1) {
      await getRedis().expire(key, RATE_WINDOW_SECONDS);
    }
    return count > RATE_LIMIT;
  } catch (err) {
    console.error("rateLimiter error (fail-open):", err);
    return false;
  }
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}
