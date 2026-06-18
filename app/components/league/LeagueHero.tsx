import type { LeagueEvent } from "@/app/lib/league/types";
import { EventStatusBadge } from "./EventStatusBadge";

type LeagueHeroProps = {
  featuredEvent: LeagueEvent | null;
  latestCompletedEvent: LeagueEvent | null;
  capacity: {
    total: number;
    restantes: number;
    max: number;
  };
  slogan?: string;
};

function getHeroTitle(event: LeagueEvent | null) {
  if (!event) return "Pila de Ra'";
  if (event.estado === "futura") return `${event.titulo} por anunciar`;
  if (event.estado === "inscripciones") return `${event.titulo}: inscripciones abiertas`;
  if (event.estado === "anunciada") return `${event.titulo} confirmada`;
  if (event.estado === "en_vivo") return `${event.titulo} en vivo`;
  if (event.estado === "finalizada") return `${event.titulo} finalizada`;
  return event.titulo;
}

function getHeroDescription(event: LeagueEvent | null) {
  if (!event) return "La plaza sigue viva. Freestyle, barras y competencia real en RD.";
  if (event.estado === "futura") return event.resumen || "La próxima fecha de la liga viene en camino.";
  if (event.estado === "inscripciones") return "Los cupos están abiertos para la próxima batalla. Asegura tu lugar en la plaza.";
  if (event.estado === "anunciada") return "La fecha ya está confirmada. Prepárate para una nueva jornada de freestyle.";
  if (event.estado === "en_vivo") return "La batalla está activa. Sigue la jornada y mantente pendiente a los resultados.";
  if (event.estado === "finalizada") return event.resumen || "La fecha terminó. Revisa resultados, ranking y batallas.";
  return event.resumen || "";
}

export function LeagueHero({
  featuredEvent,
  latestCompletedEvent,
  capacity,
  slogan = "Vamo' a prender la plaza"
}: LeagueHeroProps) {
  const showCapacity = featuredEvent?.estado === "inscripciones";
  const registered = capacity.total;
  const max = capacity.max;
  const percentage = max > 0 ? Math.min(100, Math.round((registered / max) * 100)) : 0;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-yellow-400/20 bg-zinc-950 p-5 shadow-2xl shadow-yellow-950/10 sm:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.15),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-yellow-100">
              Pila de Ra'
            </span>
            {featuredEvent && <EventStatusBadge status={featuredEvent.estado} />}
          </div>

          <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl">
            {getHeroTitle(featuredEvent)}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            {getHeroDescription(featuredEvent)}
          </p>

          <p className="mt-5 text-lg font-black uppercase tracking-[0.18em] text-yellow-300">
            {slogan}
          </p>

          {featuredEvent && (
            <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Fecha</p>
                <p className="mt-1 font-bold text-white">{featuredEvent.fechaEvento || "Por anunciar"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Hora</p>
                <p className="mt-1 font-bold text-white">{featuredEvent.horaEvento || "Por anunciar"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Ubicación</p>
                <p className="mt-1 font-bold text-white">{featuredEvent.ubicacion || "Por anunciar"}</p>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
          {showCapacity ? (
            <>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">Cupos</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-4xl font-black text-white">
                  {registered}<span className="text-lg text-zinc-500">/{max}</span>
                </p>
                <p className="text-sm font-bold text-yellow-300">{capacity.restantes} disponibles</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-yellow-400" style={{ width: `${percentage}%` }} />
              </div>
            </>
          ) : latestCompletedEvent ? (
            <>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">Última fecha</p>
              <p className="mt-3 text-2xl font-black uppercase text-white">{latestCompletedEvent.titulo}</p>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex justify-between gap-4 border-b border-white/10 pb-2">
                  <span className="text-zinc-500">Campeón</span>
                  <span className="font-black text-white">{latestCompletedEvent.campeon || "Pendiente"}</span>
                </p>
                <p className="flex justify-between gap-4 border-b border-white/10 pb-2">
                  <span className="text-zinc-500">Subcampeón</span>
                  <span className="font-black text-white">{latestCompletedEvent.subcampeon || "Pendiente"}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-zinc-500">MVP</span>
                  <span className="font-black text-white">{latestCompletedEvent.mvp || "Pendiente"}</span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400">Todavía no hay fechas finalizadas registradas.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
