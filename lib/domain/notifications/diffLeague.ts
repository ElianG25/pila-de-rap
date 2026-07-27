import { sortRanking } from "@/lib/domain/league/rules";
import type { Battle, LeagueEvent, LeaguePayload } from "@/lib/domain/league/types";
import type { NotificationEvent } from "./types";

const LOW_CAPACITY_THRESHOLD = 5;

function buildAnnouncedEvent(ev: LeagueEvent): NotificationEvent {
  return {
    kind: "event_announced",
    title: "🔥 ¡Nueva fecha en la plaza!",
    body: `${ev.titulo || "La próxima fecha"} ya tiene día. Entérate antes que nadie.`,
    url: "/?s=fechas",
  };
}

function buildRegistrationOpenEvent(ev: LeagueEvent): NotificationEvent {
  return {
    kind: "registration_open",
    title: "🎤 ¡Se abrió el mic!",
    body: `Inscripciones para ${ev.titulo || "la próxima fecha"} ya están activas. Anótate ahora.`,
    url: "/?s=inscripcion",
  };
}

function buildLowCapacityEvent(ev: LeagueEvent, restantes: number): NotificationEvent {
  return {
    kind: "low_capacity",
    title: `⚡ ¡Quedan ${restantes} cupos!`,
    body: `${ev.titulo || "La fecha"} se está llenando rápido. Si vas a entrar, es ahora o nunca.`,
    url: "/?s=inscripcion",
  };
}

function buildLiveEvent(ev: LeagueEvent): NotificationEvent {
  return {
    kind: "event_live",
    title: "🔴 ¡Estamos en vivo!",
    body: `${ev.titulo || "La plaza"} está que arde ahora mismo. No te lo pierdas.`,
    url: "/",
  };
}

function buildChampionEvent(ev: LeagueEvent): NotificationEvent {
  return {
    kind: "champion_crowned",
    title: "👑 ¡Tenemos campeón!",
    body: `${ev.campeon} se llevó ${ev.titulo || "la fecha"}. Mira cómo pasó todo.`,
    url: "/",
  };
}

function buildNewVideoEvent(battle: Battle): NotificationEvent {
  const mcs = [battle.mc1, battle.mc2, battle.mc3, battle.mc4].filter(Boolean).join(" vs ");
  return {
    kind: "new_video",
    title: "🎥 Nuevo video en el archivo",
    body: `${mcs || "Una nueva batalla"} ya está arriba. Dale play.`,
    url: "/?s=batallas",
  };
}

function buildRankingShuffleEvent(top3: string[]): NotificationEvent {
  return {
    kind: "ranking_shuffle",
    title: "📈 ¡Sacudida en el Top 3!",
    body: `Ahora es: 1. ${top3[0]} · 2. ${top3[1]} · 3. ${top3[2]}. ¿Aguantará la corona?`,
    url: "/?s=ranking",
  };
}

/** Único usado desde afuera del dominio (application) para el recordatorio del día del evento. */
export function buildDayOfReminder(ev: LeagueEvent): NotificationEvent {
  return {
    kind: "event_reminder",
    title: "📅 ¡Hoy es el día!",
    body: `${ev.titulo || "La fecha"} es hoy${ev.horaEvento ? ` a las ${ev.horaEvento}` : ""}. Nos vemos en la plaza.`,
    url: "/?s=fechas",
  };
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Compara el snapshot anterior de la liga contra el actual y devuelve qué
 * notificar. Pura: sin fetch, sin Date.now() (el recordatorio del día vive
 * en application/ porque depende de la fecha actual, no de un cambio de
 * estado). Si no hay snapshot anterior (primera corrida), no notifica nada
 * — solo hay una base para comparar de ahí en adelante.
 */
export function diffLeagueForNotifications(
  previous: LeaguePayload | null,
  current: LeaguePayload
): NotificationEvent[] {
  if (!previous) return [];

  const events: NotificationEvent[] = [];

  for (const ev of current.events) {
    const prevEv = previous.events.find((e) => e.eventId === ev.eventId);

    if (ev.estado === "anunciada" && prevEv?.estado !== "anunciada") {
      events.push(buildAnnouncedEvent(ev));
    }
    if (ev.estado === "inscripciones" && prevEv?.estado !== "inscripciones") {
      events.push(buildRegistrationOpenEvent(ev));
    }
    if (ev.estado === "en_vivo" && prevEv?.estado !== "en_vivo") {
      events.push(buildLiveEvent(ev));
    }
    if (ev.estado === "finalizada" && ev.campeon && prevEv?.campeon !== ev.campeon) {
      events.push(buildChampionEvent(ev));
    }
  }

  const currActive = current.activeEvent;
  if (currActive && current.capacity.restantes <= LOW_CAPACITY_THRESHOLD) {
    const prevRestantes = previous.activeEvent?.eventId === currActive.eventId
      ? previous.capacity.restantes
      : Infinity;
    if (prevRestantes > LOW_CAPACITY_THRESHOLD) {
      events.push(buildLowCapacityEvent(currActive, current.capacity.restantes));
    }
  }

  for (const battle of current.battles) {
    if (!battle.youtubeUrl) continue;
    const prevBattle = previous.battles.find((b) => b.battleId === battle.battleId);
    if (!prevBattle?.youtubeUrl) {
      events.push(buildNewVideoEvent(battle));
    }
  }

  const prevTop3 = sortRanking(previous.ranking).slice(0, 3).map((r) => r.alias);
  const currTop3 = sortRanking(current.ranking).slice(0, 3).map((r) => r.alias);
  if (prevTop3.length === 3 && currTop3.length === 3 && !arraysEqual(prevTop3, currTop3)) {
    events.push(buildRankingShuffleEvent(currTop3));
  }

  return events;
}
