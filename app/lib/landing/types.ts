export const TOTAL_MCS = 32;

export type View = "evento" | "mcs" | "ranking" | "batallas";

export type EventPhase = "pre_event" | "live_event" | "post_event";

export type EventConfig = {
  registrationOpen: boolean;
  currentRound: string;
  youtubeLiveUrl: string;
  eventDate: string;
  eventLabel: string;
  activeEventLabel: string;
  champion: string;
  runnerUp: string;
  eventSummary: string;
  nextEventLabel: string;
  nextEventDate: string;
  showRanking: boolean;
  showBattles: boolean;
  showRoster: boolean;
};

export type RankingMC = {
  alias: string;
  puntosLiga: number;
  puntosBatalla: number;
  victorias: number;
  derrotas: number;
  replicas: number;
  bonus: number;
  estado: "activo" | "clasificado" | "eliminado" | "campeon" | string;
};

export type Battle = {
  fecha: string;
  ronda: string;
  mc1: string;
  mc2: string;
  ganador: string;
  youtubeUrl: string;
  estado: string;
  tipoResultado: "directa" | "replica" | "pendiente" | string;
  cuentaParaLiga: boolean;
};

export type LeagueEvent = {
  fecha: string;
  estado: string;
  campeon: string;
  subcampeon: string;
  fechaEvento: string;
};

export type Mc = {
  alias: string;
  visible: boolean;
  justRevealed?: boolean;
};