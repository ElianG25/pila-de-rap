import type { RankingItem } from "@/app/lib/league/types";

type CompactRankingProps = {
  ranking: RankingItem[];
  limit?: number;
};

function getMovementLabel(movement: string) {
  if (!movement) return null;
  if (movement === "0" || movement === "-") return null;
  return movement;
}

export function CompactRanking({ ranking, limit = 5 }: CompactRankingProps) {
  const topRanking = ranking.slice(0, limit);
  const hasMovement = topRanking.some((mc) => Boolean(mc.movimiento));

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">Tabla</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">Ranking</h2>
        </div>
        <p className="text-sm font-bold text-zinc-500">Top {topRanking.length}</p>
      </div>

      {topRanking.length ? (
        <div className="space-y-3">
          {topRanking.map((mc, index) => (
            <article
              key={`${mc.alias}-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-sm font-black text-black">
                #{index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-black uppercase text-white">{mc.alias}</h3>
                <p className="text-xs font-bold text-zinc-500">{mc.victorias}V · {mc.derrotas}D · {mc.replicas}R</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white">{mc.puntosLiga}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">pts</p>
              </div>
              {hasMovement && (
                <div className="hidden w-10 text-right text-xs font-black text-zinc-500 sm:block">
                  {getMovementLabel(mc.movimiento) ?? "—"}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">Todavia no hay ranking disponible.</p>
      )}
    </section>
  );
}
