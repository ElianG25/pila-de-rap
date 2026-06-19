"use client";

import { motion } from "framer-motion";
import type { LeagueEvent } from "@/app/lib/league/types";
import { EventStatusBadge } from "./EventStatusBadge";

type LeagueHeroProps = {
  featuredEvent: LeagueEvent | null;
  latestCompletedEvent: LeagueEvent | null;
  capacity: { total: number; restantes: number; max: number };
  slogan?: string;
};

function getHeroTitle(event: LeagueEvent | null) {
  if (!event) return "La plaza\nsigue viva";
  if (event.estado === "futura")        return `${event.titulo}\npor anunciar`;
  if (event.estado === "inscripciones") return `${event.titulo}\ninscripciones abiertas`;
  if (event.estado === "anunciada")     return `${event.titulo}\nconfirmada`;
  if (event.estado === "en_vivo")       return `${event.titulo}\nen vivo`;
  if (event.estado === "finalizada")    return `${event.titulo}\nfinalizada`;
  return event.titulo;
}

function getHeroDescription(event: LeagueEvent | null) {
  if (!event) return "Freestyle, barras y competencia real en República Dominicana.";
  if (event.estado === "futura")        return event.resumen || "La próxima fecha de la liga viene en camino.";
  if (event.estado === "inscripciones") return "Los cupos están abiertos. Asegura tu lugar en la plaza.";
  if (event.estado === "anunciada")     return "La fecha ya está confirmada. Prepárate para una nueva jornada.";
  if (event.estado === "en_vivo")       return "La batalla está activa. Sigue la jornada en tiempo real.";
  if (event.estado === "finalizada")    return event.resumen || "La fecha terminó. Revisa ranking y batallas.";
  return event.resumen || "";
}

export function LeagueHero({ featuredEvent, latestCompletedEvent, capacity, slogan }: LeagueHeroProps) {
  const showCapacity = featuredEvent?.estado === "inscripciones";
  const pct = capacity.max > 0 ? Math.min(100, Math.round((capacity.total / capacity.max) * 100)) : 0;

  const titleRaw = getHeroTitle(featuredEvent);
  const [titleLine1, titleLine2] = titleRaw.split("\n");

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="arena-card"
    >
      {/* Ambient glow */}
      <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-yellow-400/[0.07] blur-3xl pointer-events-none" />

      <div className="relative p-5 sm:p-7">

        {/* Eyebrow row */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <span className="kicker text-[10px] text-zinc-500">
            Pila de Ra&apos;
          </span>
          {featuredEvent && <EventStatusBadge status={featuredEvent.estado} />}
        </div>

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            {/* Title */}
            <h1 className="font-impact uppercase leading-[0.86] text-white"
                style={{ fontSize: "clamp(2.4rem, 6.5vw, 4.5rem)", letterSpacing: "0.005em" }}>
              <span className="block">{titleLine1}</span>
              {titleLine2 && (
                <span className="block text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(180deg, #fde047, #d4a306)" }}>{titleLine2}</span>
              )}
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
              {getHeroDescription(featuredEvent)}
            </p>

            {/* Slogan */}
            {slogan && (
              <p className="font-display mt-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-yellow-400/70">
                {slogan}
              </p>
            )}

            {/* Info chips */}
            {featuredEvent && (
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: "Fecha",     val: featuredEvent.fechaEvento || "Por anunciar" },
                  { label: "Hora",      val: featuredEvent.horaEvento  || "Por anunciar" },
                  { label: "Ubicación", val: featuredEvent.ubicacion   || "Por anunciar" },
                ].map(({ label, val }) => (
                  <div key={label}
                    className="rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 text-xs">
                    <span className="font-display uppercase tracking-wider text-zinc-500">{label}:</span>{" "}
                    <span className="font-bold text-white">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="arena-stripes min-w-[180px] rounded-xl border border-white/[0.07] bg-black/30 p-4 lg:w-52">
            {showCapacity ? (
              <>
                <p className="kicker text-[10px] text-zinc-500 mb-3">
                  Cupos
                </p>
                <div className="flex items-end justify-between mb-2">
                  <p className="font-mono text-4xl font-extrabold tabular-nums text-white leading-none">
                    {capacity.total}
                    <span className="text-base text-zinc-600">/{capacity.max}</span>
                  </p>
                  <p className="font-mono text-xs font-bold text-yellow-300">{capacity.restantes} libres</p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full rounded-full bg-yellow-400"
                  />
                </div>
              </>
            ) : latestCompletedEvent ? (
              <>
                <p className="kicker text-[10px] text-zinc-500 mb-3">
                  Última fecha
                </p>
                <p className="font-display text-base font-bold uppercase text-white mb-4 leading-tight">
                  {latestCompletedEvent.titulo}
                </p>
                <div className="space-y-2.5 text-xs">
                  {[
                    { label: "Campeón",    val: latestCompletedEvent.campeon    },
                    { label: "Subcampeón", val: latestCompletedEvent.subcampeon },
                    { label: "MVP",        val: latestCompletedEvent.mvp        },
                  ].filter(({ val }) => Boolean(val)).map(({ label, val }) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
                      <span className="font-display uppercase tracking-wider text-zinc-500">{label}</span>
                      <span className="font-bold text-white">{val}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-zinc-600 leading-relaxed">
                Sin fechas finalizadas todavía.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
