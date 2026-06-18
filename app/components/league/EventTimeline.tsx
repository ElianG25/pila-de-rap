import type { LeagueEvent } from "@/app/lib/league/types";
import { EventStatusBadge } from "./EventStatusBadge";

type EventTimelineProps = {
  events: LeagueEvent[];
};

export function EventTimeline({ events }: EventTimelineProps) {
  if (!events.length) {
    return (
      <section className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
        <h2 className="text-xl font-black uppercase text-white">Fechas</h2>
        <p className="mt-3 text-sm text-zinc-400">Todavía no hay fechas registradas.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">Temporada</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">Fechas de la liga</h2>
        </div>
        <p className="text-sm font-bold text-zinc-500">{events.length} fechas</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {events.map((event) => (
          <article
            key={event.eventId}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-yellow-400/40 hover:bg-yellow-400/[0.04]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  Fecha {event.numero || event.orden}
                </p>
                <h3 className="mt-1 text-lg font-black uppercase text-white">{event.titulo}</h3>
              </div>
              <EventStatusBadge status={event.estado} />
            </div>

            <div className="mt-4 space-y-2 text-sm text-zinc-400">
              <p><span className="text-zinc-600">Día:</span> {event.fechaEvento || "Por anunciar"}</p>
              <p><span className="text-zinc-600">Lugar:</span> {event.ubicacion || "Por anunciar"}</p>
              {event.campeon && (
                <p><span className="text-zinc-600">Campeón:</span> <span className="font-black text-white">{event.campeon}</span></p>
              )}
              {event.mvp && (
                <p><span className="text-zinc-600">MVP:</span> <span className="font-black text-white">{event.mvp}</span></p>
              )}
            </div>

            {event.resumen && (
              <p className="mt-4 line-clamp-3 text-xs leading-5 text-zinc-500">{event.resumen}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
