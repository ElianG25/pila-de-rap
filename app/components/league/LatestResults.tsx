import type { LeagueEvent } from "@/app/lib/league/types";

type LatestResultsProps = {
  latestCompletedEvent: LeagueEvent | null;
};

export function LatestResults({ latestCompletedEvent }: LatestResultsProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">Resultados</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-white">Última fecha</h2>

      {latestCompletedEvent ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{latestCompletedEvent.label}</p>
              <h3 className="mt-1 text-xl font-black uppercase text-white">{latestCompletedEvent.titulo}</h3>
            </div>
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-200">
              Finalizada
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-black/30 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Campeón</p>
              <p className="mt-1 font-black uppercase text-white">{latestCompletedEvent.campeon || "Pendiente"}</p>
            </div>
            <div className="rounded-xl bg-black/30 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Subcampeón</p>
              <p className="mt-1 font-black uppercase text-white">{latestCompletedEvent.subcampeon || "Pendiente"}</p>
            </div>
            <div className="rounded-xl bg-black/30 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">MVP</p>
              <p className="mt-1 font-black uppercase text-white">{latestCompletedEvent.mvp || "Pendiente"}</p>
            </div>
          </div>

          {latestCompletedEvent.resumen && (
            <p className="mt-4 text-sm leading-6 text-zinc-400">{latestCompletedEvent.resumen}</p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-400">Todavía no hay una fecha finalizada registrada.</p>
      )}
    </section>
  );
}
