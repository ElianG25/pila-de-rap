import type { LeaguePayload } from "./types";

export async function fetchLeague(): Promise<LeaguePayload> {
  const response = await fetch("/api/league", {
    method: "GET",
    cache: "no-store"
  });

  const payload = await response.json();

  if (!payload.ok) {
    throw new Error(payload.error || "No se pudo cargar la liga");
  }

  return payload.league;
}