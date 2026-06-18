"use client";

import { useMemo, useState } from "react";
import type { Battle, LeagueEvent } from "@/app/lib/league/types";

type BattleArchiveProps = {
  battles: Battle[];
  events: LeagueEvent[];
};

function getBattleTitle(battle: Battle) {
  const mcs = [battle.mc1, battle.mc2, battle.mc3, battle.mc4].filter(Boolean);
  if (!mcs.length) return "Batalla sin MCs";
  return mcs.join(" vs ");
}

export function BattleArchive({ battles, events }: BattleArchiveProps) {
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [onlyVideos, setOnlyVideos] = useState(false);

  const visibleBattles = useMemo(() => {
    return battles.filter((battle) => {
      if (selectedEventId !== "all" && battle.eventId !== selectedEventId) return false;
      if (onlyVideos && !battle.youtubeUrl) return false;
      return true;
    });
  }, [battles, selectedEventId, onlyVideos]);

  const eventLabelById = useMemo(() => {
    return events.reduce<Record<string, string>>((acc, event) => {
      acc[event.eventId] = event.titulo || event.label || event.eventId;
      return acc;
    }, {});
  }, [events]);

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">Archivo</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">Batallas</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm font-bold text-white outline-none"
          >
            <option value="all">Todas las fechas</option>
            {events.map((event) => (
              <option key={event.eventId} value={event.eventId}>{event.titulo}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOnlyVideos((v) => !v)}
            className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
              onlyVideos
                ? "border-yellow-400 bg-yellow-400 text-black"
                : "border-white/10 bg-white/[0.03] text-zinc-300"
            }`}
          >
            Solo videos
          </button>
        </div>
      </div>

      {visibleBattles.length ? (
        <div className="space-y-3">
          {visibleBattles.map((battle, index) => (
            <article
              key={battle.battleId || `${battle.eventId}-${battle.ronda}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    {eventLabelById[battle.eventId] || battle.eventId} · {battle.ronda}
                  </p>
                  <h3 className="mt-1 text-lg font-black uppercase text-white">{getBattleTitle(battle)}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-zinc-500">
                    {battle.ganador && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-200">
                        Ganador: {battle.ganador}
                      </span>
                    )}
                    {battle.tipoResultado && battle.tipoResultado !== "pendiente" && (
                      <span className="rounded-full bg-white/5 px-2 py-1">{battle.tipoResultado}</span>
                    )}
                    {battle.cuentaParaLiga && (
                      <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-yellow-300">Liga</span>
                    )}
                  </div>
                </div>

                {battle.youtubeUrl ? (
                  <a
                    href={battle.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-yellow-400 px-4 py-2 text-center text-sm font-black uppercase text-black transition hover:bg-yellow-300"
                  >
                    Ver batalla
                  </a>
                ) : (
                  <span className="rounded-xl border border-white/10 px-4 py-2 text-center text-sm font-black uppercase text-zinc-500">
                    Sin video
                  </span>
                )}
              </div>

              {battle.notas && (
                <p className="mt-3 text-sm leading-6 text-zinc-500">{battle.notas}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No hay batallas para los filtros seleccionados.</p>
      )}
    </section>
  );
}
