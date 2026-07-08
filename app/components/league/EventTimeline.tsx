"use client";

import { motion } from "framer-motion";
import type { LeagueEvent } from "@/lib/domain/league/types";
import { EventStatusBadge } from "./EventStatusBadge";

type EventTimelineProps = { events: LeagueEvent[] };

const STATE_BORDER: Record<string, string> = {
  en_vivo:       "border-l-yellow-400",
  inscripciones: "border-l-yellow-400/60",
  anunciada:     "border-l-sky-500/50",
  finalizada:    "border-l-zinc-600",
  futura:        "border-l-zinc-700",
};

export function EventTimeline({ events }: EventTimelineProps) {
  if (!events.length) {
    return (
      <section className="arena-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <svg className="h-3.5 w-3.5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <p className="kicker text-[10px] text-yellow-400">Temporada</p>
        </div>
        <h2 className="section-title text-3xl text-white mb-6">Fechas</h2>
        <div className="flex flex-col items-center gap-4 py-10">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="opacity-20">
            <rect x="4" y="10" width="44" height="38" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-yellow-400"/>
            <path d="M4 20h44" stroke="currentColor" strokeWidth="1.5" className="text-yellow-400"/>
            <path d="M16 4v12M36 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-yellow-400"/>
            <rect x="12" y="28" width="8" height="8" rx="1.5" fill="currentColor" className="text-yellow-400" opacity="0.4"/>
            <rect x="24" y="28" width="8" height="8" rx="1.5" fill="currentColor" className="text-yellow-400" opacity="0.4"/>
          </svg>
          <div className="text-center">
            <p className="text-sm font-display font-bold uppercase tracking-[0.16em] text-zinc-500">Sin fechas aún</p>
            <p className="mt-1 text-xs text-zinc-600">Las fechas de la temporada se anunciarán pronto</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="arena-card p-5 sm:p-6">

      {/* Header */}
      <div className="mb-6 flex items-end justify-between border-b border-white/[0.05] pb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="h-3.5 w-3.5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <p className="kicker text-[10px] text-yellow-400">Temporada 2026</p>
          </div>
          <h2 className="section-title text-3xl text-white">Fechas de la liga</h2>
        </div>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-zinc-600">
          {events.length} {events.length === 1 ? "fecha" : "fechas"}
        </span>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, i) => (
          <motion.article
            key={event.eventId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.06, 0.4) }}
            className={`group relative rounded-xl border border-white/[0.06] border-l-2 bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12] hover:bg-yellow-400/[0.025] ${
              STATE_BORDER[event.estado] ?? "border-l-zinc-700"
            }`}
          >
            {/* Event label & badge */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <p className="text-[10px] font-display font-bold uppercase tracking-[0.26em] text-zinc-600">
                Fecha {event.numero ?? event.orden}
              </p>
              <EventStatusBadge status={event.estado} />
            </div>

            {/* Title */}
            <h3 className="font-display text-xl font-bold uppercase text-white leading-tight mb-3">
              {event.titulo}
            </h3>

            {/* Info rows with icons */}
            <div className="space-y-2">
              {event.fechaEvento && (
                <div className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span className="text-xs font-bold text-zinc-300">{event.fechaEvento}</span>
                </div>
              )}
              {event.ubicacion && (
                <div className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="text-xs font-bold text-zinc-300">{event.ubicacion}</span>
                </div>
              )}
              {event.campeon && (
                <div className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401Z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs font-display font-bold text-yellow-400">{event.campeon}</span>
                </div>
              )}
              {event.mvp && !event.campeon && (
                <div className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-sky-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                  <span className="text-xs font-display font-bold text-white">{event.mvp}</span>
                </div>
              )}
            </div>

            {event.resumen && (
              <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-zinc-600 border-t border-white/[0.04] pt-3">
                {event.resumen}
              </p>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}
