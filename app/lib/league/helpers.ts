import type { Battle, LeagueEvent, RankingItem } from "./types";

export function sortRanking(ranking: RankingItem[]) {
  return [...ranking].sort((a, b) => {
    if (b.puntosLiga !== a.puntosLiga) return b.puntosLiga - a.puntosLiga;
    if (b.victorias !== a.victorias) return b.victorias - a.victorias;
    if (b.replicas !== a.replicas) return b.replicas - a.replicas;
    if (a.derrotas !== b.derrotas) return a.derrotas - b.derrotas;
    if (b.puntosBatalla !== a.puntosBatalla) return b.puntosBatalla - a.puntosBatalla;
    return a.alias.localeCompare(b.alias);
  });
}

export function getPublicEvents(events: LeagueEvent[]) {
  return events
    .filter((event) => event.visible && event.estado !== "oculta")
    .sort((a, b) => a.orden - b.orden);
}

export function getPublishedBattles(battles: Battle[]) {
  return battles
    .filter((battle) => battle.estado !== "oculta")
    .sort((a, b) => {
      if (a.eventId !== b.eventId) return a.eventId.localeCompare(b.eventId);
      return a.orden - b.orden;
    });
}

export function getEventById(events: LeagueEvent[], eventId: string) {
  return events.find((event) => event.eventId === eventId) || null;
}

/**
 * Flags de Config (showRanking, showBattles, showEvents, ...). El backend
 * (Apps Script) ya fusiona sus propios defaults, así que llegan siempre como
 * "TRUE"/"FALSE"; solo se consideran deshabilitados si dicen "FALSE" explícito.
 */
export function isSectionEnabled(config: Record<string, string> | undefined | null, key: string): boolean {
  return config?.[key] !== "FALSE";
}