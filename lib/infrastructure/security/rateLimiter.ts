/** Anti-spam best-effort en memoria por instancia — ver ARCHITECTURE.md para sus límites. */
const RATE_LIMIT = 4; // inscripciones permitidas por IP
const RATE_WINDOW_MS = 10 * 60 * 1000; // en 10 minutos
const hits = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  // Limpieza oportunista para no crecer sin límite
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
  }
  return arr.length > RATE_LIMIT;
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}
