import { describe, it, expect } from "vitest";
import { sortRanking, getPublicEvents, getPublishedBattles, getEventById } from "./helpers";
import type { RankingItem, LeagueEvent, Battle } from "./types";

const mkRank = (p: Partial<RankingItem>): RankingItem => ({
  alias: "x", puntosLiga: 0, puntosBatalla: 0, victorias: 0, derrotas: 0,
  replicas: 0, bonus: 0, estado: "", ultimaFecha: "", movimiento: "", ...p,
});
const mkEvent = (p: Partial<LeagueEvent>): LeagueEvent => ({
  eventId: "e", numero: 0, titulo: "", label: "", estado: "futura", fechaEvento: "",
  horaEvento: "", ubicacion: "", maxCupos: 0, campeon: "", subcampeon: "", mvp: "",
  resumen: "", youtubePlaylist: "", inscripcionesAbiertas: false, visible: true, orden: 0, ...p,
});
const mkBattle = (p: Partial<Battle>): Battle => ({
  battleId: "b", eventId: "e", orden: 0, ronda: "", grupo: "", mc1: "", mc2: "", mc3: "",
  mc4: "", ganador: "", perdedor: "", youtubeUrl: "", estado: "publicada", tipoResultado: "",
  cuentaParaLiga: false, puntosMc1: 0, puntosMc2: 0, notas: "", ...p,
});

describe("sortRanking", () => {
  it("ordena por puntosLiga desc y desempata por victorias", () => {
    const r = sortRanking([
      mkRank({ alias: "A", puntosLiga: 10, victorias: 1 }),
      mkRank({ alias: "B", puntosLiga: 20 }),
      mkRank({ alias: "C", puntosLiga: 10, victorias: 5 }),
    ]);
    expect(r.map((x) => x.alias)).toEqual(["B", "C", "A"]);
  });
  it("no muta el array original", () => {
    const orig = [mkRank({ alias: "A", puntosLiga: 1 }), mkRank({ alias: "B", puntosLiga: 2 })];
    sortRanking(orig);
    expect(orig[0].alias).toBe("A");
  });
});

describe("getPublicEvents", () => {
  it("excluye ocultos/invisibles y ordena por orden", () => {
    const ev = getPublicEvents([
      mkEvent({ eventId: "2", orden: 2 }),
      mkEvent({ eventId: "h", estado: "oculta", orden: 1 }),
      mkEvent({ eventId: "i", visible: false, orden: 1 }),
      mkEvent({ eventId: "1", orden: 1 }),
    ]);
    expect(ev.map((e) => e.eventId)).toEqual(["1", "2"]);
  });
});

describe("getPublishedBattles", () => {
  it("excluye ocultas y ordena por evento y orden", () => {
    const b = getPublishedBattles([
      mkBattle({ battleId: "x", eventId: "e1", orden: 2 }),
      mkBattle({ battleId: "o", estado: "oculta", eventId: "e1", orden: 1 }),
      mkBattle({ battleId: "y", eventId: "e1", orden: 1 }),
    ]);
    expect(b.map((x) => x.battleId)).toEqual(["y", "x"]);
  });
});

describe("getEventById", () => {
  it("encuentra por id o devuelve null", () => {
    const events = [mkEvent({ eventId: "a" }), mkEvent({ eventId: "b" })];
    expect(getEventById(events, "b")?.eventId).toBe("b");
    expect(getEventById(events, "z")).toBeNull();
  });
});
