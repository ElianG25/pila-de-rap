import { fetchLeaguePayloadRaw } from "@/lib/infrastructure/sheets/sheetsClient";
import { adaptPayload } from "@/lib/infrastructure/sheets/payloadMapper";
import type { LeaguePayload } from "@/lib/domain/league/types";

/**
 * Caso de uso: obtener la liga completa y ya validada. Usado por la ruta
 * `/api/league` (GET) y por `/api/og`. Propaga los errores tipados de
 * `sheetsClient` tal cual — el adaptador HTTP que llama a esto decide cómo
 * traducirlos a una respuesta.
 */
export async function getLeague(revalidateSeconds: number): Promise<LeaguePayload> {
  const raw = await fetchLeaguePayloadRaw(revalidateSeconds);
  return adaptPayload(raw as Record<string, unknown>).league;
}
