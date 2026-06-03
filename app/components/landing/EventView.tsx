"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import {
  cardBase,
  eyebrow,
  fadeUp,
  mutedEyebrow,
  sectionDivider,
  sectionGlow,
  softCard,
  statCard,
} from "@/app/lib/landing/styles";

import type {
  EventConfig,
  LeagueEvent,
  View,
} from "@/app/lib/landing/types";

type EventViewProps = {
  jueces: { nombre: string; ig: string }[];
  events: LeagueEvent[];
  eventConfig: EventConfig;
  canRegister: boolean;
  isFull: boolean;
  isPreEvent: boolean;
  isLiveEvent: boolean;
  isPostEvent: boolean;
  slots: number | null;
  revealedCount: number;
  rosterTotal: number;
  championAlias: string;
  runnerUpAlias: string;
  thirdPlaceAlias: string;
  setOpen: (value: boolean) => void;
  setView: (value: View) => void;
};

export default function EventView({
  jueces,
  events,
  eventConfig,
  canRegister,
  isFull,
  isPreEvent,
  isLiveEvent,
  isPostEvent,
  slots,
  revealedCount,
  rosterTotal,
  championAlias,
  runnerUpAlias,
  thirdPlaceAlias,
  setOpen,
  setView,
}: EventViewProps) {
  return (
    <motion.div
      key="evento"
      {...fadeUp}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full max-w-xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`${cardBase} border-yellow-400/20 p-5 md:p-7`}
      >
        <div className={sectionGlow} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className={`${statCard} px-3 py-3`}>
                  <p className={mutedEyebrow}>Fecha</p>

                  <p className="mt-1 text-xs font-black leading-tight text-white sm:text-sm">
                    {eventConfig.activeEventLabel}
                  </p>
                </div>

                <div className={`${statCard} px-3 py-3`}>
                  <p className={mutedEyebrow}>Estado</p>

                  <p
                    className={`mt-1 text-xs font-black sm:text-sm ${isLiveEvent
                        ? "text-green-300"
                        : isPostEvent
                          ? "text-gray-300"
                          : "text-yellow-300"
                      }`}
                  >
                    {isPostEvent
                      ? "Finalizada"
                      : isLiveEvent
                        ? "En vivo"
                        : "Próxima"}
                  </p>
                </div>

                <div className={`${statCard} px-3 py-3`}>
                  <p className={mutedEyebrow}>MCs</p>

                  <p className="mt-1 text-xs font-black text-white sm:text-sm">
                    {revealedCount}/{rosterTotal}
                  </p>
                </div>

                <div className={`${statCard} px-3 py-3`}>
                  <p className={mutedEyebrow}>Hora</p>

                  <p className="mt-1 text-xs font-black text-white sm:text-sm">
                    3:00 PM
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className={sectionDivider} />

          {isLiveEvent && (
            <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-white/[0.03] px-4 py-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                Evento activo en
              </p>

              <p className="mt-2 text-lg font-black text-white">
                {eventConfig.currentRound}
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Consulta el ranking y las batallas oficiales.
              </p>

              {(eventConfig.showRanking || eventConfig.showBattles) && (
                <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                  {eventConfig.showRanking && (
                    <button
                      type="button"
                      onClick={() => setView("ranking")}
                      className="rounded-full bg-yellow-400 px-5 py-2 text-xs font-black uppercase tracking-wide text-black hover:bg-yellow-300"
                    >
                      Ver ranking
                    </button>
                  )}

                  {eventConfig.showBattles && (
                    <button
                      type="button"
                      onClick={() => setView("batallas")}
                      className="rounded-full border border-white/10 bg-black/40 px-5 py-2 text-xs font-black uppercase tracking-wide text-gray-200 hover:border-yellow-400/30 hover:text-yellow-300"
                    >
                      Ver batallas
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {isPostEvent && (
            <div className={`${cardBase} mt-5 border-yellow-400/20 p-5`}>
              <div className="text-center">
                <p className={eyebrow}>Fecha finalizada</p>

                <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                  {eventConfig.eventLabel}
                </h3>

                {eventConfig.eventSummary && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">
                    {eventConfig.eventSummary}
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  {
                    label: "Campeón",
                    value: championAlias || "Pendiente",
                    highlight: true,
                  },
                  {
                    label: "Subcampeón",
                    value: runnerUpAlias || "Pendiente",
                    highlight: false,
                  },
                  {
                    label: "3er lugar",
                    value: thirdPlaceAlias || "Pendiente",
                    highlight: false,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border px-4 py-3 text-left ${item.highlight
                        ? "border-yellow-400/30 bg-yellow-400/10"
                        : "border-white/10 bg-black/30"
                      }`}
                  >
                    <p className={mutedEyebrow}>{item.label}</p>

                    <p className="mt-1 break-words text-xl font-black leading-tight text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {(eventConfig.showRanking || eventConfig.showBattles) && (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {eventConfig.showRanking && (
                    <button
                      type="button"
                      onClick={() => setView("ranking")}
                      className="rounded-2xl bg-yellow-400 px-5 py-3 text-xs font-black uppercase tracking-wide text-black hover:bg-yellow-300"
                    >
                      Ver ranking
                    </button>
                  )}

                  {eventConfig.showBattles && (
                    <button
                      type="button"
                      onClick={() => setView("batallas")}
                      className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-xs font-black uppercase tracking-wide text-gray-200 hover:border-yellow-400/30 hover:text-yellow-300"
                    >
                      Ver batallas
                    </button>
                  )}
                </div>
              )}

              {eventConfig.nextEventLabel && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
                  <p className={mutedEyebrow}>Próxima fecha</p>

                  <p className="mt-1 text-lg font-black leading-tight text-yellow-300">
                    {eventConfig.nextEventLabel}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className={`${softCard} mb-6 mt-6 px-4 py-3`}>
            <p className={`text-center ${mutedEyebrow}`}>Jueces</p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {jueces.map((juez, i) => (
                <div key={juez.nombre} className="flex items-center gap-3">
                  {juez.ig ? (
                    <a
                      href={`https://instagram.com/${juez.ig}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-yellow-300 transition hover:text-yellow-200"
                    >
                      {juez.nombre}
                    </a>
                  ) : (
                    <span className="text-xs font-black text-yellow-300">
                      {juez.nombre}
                    </span>
                  )}

                  {i < jueces.length - 1 && (
                    <span className="text-white/15">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={`${softCard} mb-6 p-3`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className={mutedEyebrow}>Ubicación oficial</p>

                <p className="mt-1 text-xs font-bold leading-tight text-gray-300">
                  Al lado de la Estación del Metro Casandra Damirón
                </p>
              </div>

              <a
                href="https://maps.app.goo.gl/RDw8cWd9wncq2xVGA"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
              >
                Abrir
              </a>
            </div>

            <a
              href="https://maps.app.goo.gl/RDw8cWd9wncq2xVGA"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative overflow-hidden rounded-2xl border border-yellow-400/20"
              >
                <Image
                  src="/map-preview.jpg"
                  alt="Ubicación del evento"
                  width={900}
                  height={360}
                  className="h-36 w-full object-cover opacity-75 transition duration-300 group-hover:opacity-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              </motion.div>
            </a>
          </div>

          <div>
            <div className={`${softCard} mb-4 px-4 py-3 text-center`}>
              <p className={mutedEyebrow}>Inscripciones</p>

              <p
                className={`mt-1 text-sm font-black ${canRegister
                    ? "text-green-300"
                    : isFull
                      ? "text-red-300"
                      : "text-gray-300"
                  }`}
              >
                {canRegister
                  ? "Abiertas"
                  : isFull
                    ? "Cupos agotados"
                    : "Cerradas"}
              </p>
            </div>

            <motion.button
              onClick={() => {
                if (canRegister) {
                  setOpen(true);
                  return;
                }

                if (isLiveEvent) {
                  setView(eventConfig.showRanking ? "ranking" : "batallas");
                  return;
                }

                if (isPostEvent) {
                  setView(eventConfig.showBattles ? "batallas" : "ranking");
                  return;
                }
              }}
              disabled={
                (!canRegister && isPreEvent) ||
                ((isLiveEvent || isPostEvent) &&
                  !eventConfig.showRanking &&
                  !eventConfig.showBattles)
              }
              whileHover={
                canRegister || isLiveEvent || isPostEvent
                  ? { scale: 1.02 }
                  : {}
              }
              whileTap={
                canRegister || isLiveEvent || isPostEvent
                  ? { scale: 0.98 }
                  : {}
              }
              className={`w-full rounded-2xl py-3.5 text-sm font-black uppercase tracking-wide transition-all duration-200 ${canRegister
                  ? "bg-yellow-400 text-black hover:bg-yellow-300"
                  : (isLiveEvent || isPostEvent) &&
                    (eventConfig.showRanking || eventConfig.showBattles)
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "cursor-not-allowed bg-gray-700 text-gray-400"
                }`}
            >
              {canRegister
                ? "📝 Inscribirme"
                : (isLiveEvent || isPostEvent) &&
                  !eventConfig.showRanking &&
                  !eventConfig.showBattles
                  ? "Información no disponible"
                  : isLiveEvent
                    ? eventConfig.showRanking
                      ? "🏆 Ver ranking"
                      : "⚔️ Ver batallas"
                    : isPostEvent
                      ? eventConfig.showBattles
                        ? "⚔️ Ver batallas"
                        : "🏆 Ver ranking"
                      : "Inscripciones cerradas"}
            </motion.button>

            {isPreEvent && typeof slots === "number" && (
              <motion.div
                key={slots}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${softCard} mt-4 px-4 py-3 text-center`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-left">
                    <p className={mutedEyebrow}>Cupos</p>

                    <p
                      className={`mt-1 text-sm font-black ${slots <= 0 ? "text-red-300" : "text-yellow-300"
                        }`}
                    >
                      {slots <= 0 ? "Agotados" : `${slots} disponibles`}
                    </p>
                  </div>

                  <p className="text-xl font-black text-white tabular-nums">
                    {Math.max(0, 32 - slots)}/32
                  </p>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-yellow-400/10 bg-black/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        Math.max(0, ((32 - slots) / 32) * 100)
                      )}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${slots <= 0 ? "bg-red-400" : "bg-yellow-400"
                      }`}
                  />
                </div>
              </motion.div>
            )}

            <div className={sectionDivider} />

            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                {
                  label: "YouTube",
                  href: "https://www.youtube.com/@piladerap",
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.5v-7l6.2 3.5-6.2 3.5z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: "https://instagram.com/piladera",
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.75 2C4.57 2 2 4.57 2 7.75v8.5C2 19.43 4.57 22 7.75 22h8.5C19.43 22 22 19.43 22 16.25v-8.5C22 4.57 19.43 2 16.25 2h-8.5zm0 2h8.5C18.55 4 20 5.45 20 7.75v8.5c0 2.3-1.45 3.75-3.75 3.75h-8.5C5.45 20 4 18.55 4 16.25v-8.5C4 5.45 5.45 4 7.75 4zm8.25 1.5a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <motion.a
                  key={item.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-black text-gray-300 transition hover:border-yellow-400/30 hover:bg-yellow-400 hover:text-black"
                >
                  {item.icon}
                  {item.label}
                </motion.a>
              ))}
            </div>

            {events.length > 0 && (
              <>
                <div className={sectionDivider} />

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur">
                  <div className="mb-5 text-center">
                    <p className={eyebrow}>Timeline de la liga</p>

                    <p className="mt-2 text-xs text-gray-500">
                      Historial y próximas fechas oficiales.
                    </p>
                  </div>

                  <div className="relative space-y-4">
                    <div className="absolute bottom-2 left-[17px] top-2 w-px bg-yellow-400/15" />

                    {events.map((eventItem, index) => {
                      const status = String(eventItem.estado || "")
                        .trim()
                        .toLowerCase();
                      const isFinished = status === "finalizada";
                      const isNext =
                        status === "próxima" || status === "proxima";
                      const isFuture = status === "futura";

                      return (
                        <div
                          key={`${eventItem.fecha}-${index}`}
                          className="relative grid grid-cols-[34px_1fr] gap-3"
                        >
                          <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-yellow-400/20 bg-black text-sm">
                            {isFinished ? "🏆" : isNext ? "⏳" : "○"}
                          </div>

                          <div
                            className={`rounded-2xl border p-4 ${isFinished
                                ? "border-yellow-400/20 bg-yellow-400/10"
                                : isNext
                                  ? "border-yellow-400/15 bg-black/45"
                                  : "border-white/10 bg-black/30"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words font-black leading-tight text-white">
                                  {eventItem.fecha}
                                </p>

                                <p className="mt-1 text-xs font-bold text-gray-500">
                                  {eventItem.fechaEvento || "Fecha pendiente"}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${isFinished
                                    ? "bg-yellow-400 text-black"
                                    : isNext
                                      ? "bg-yellow-400/10 text-yellow-300"
                                      : "bg-white/5 text-gray-400"
                                  }`}
                              >
                                {eventItem.estado || "Pendiente"}
                              </span>
                            </div>

                            {isFinished && (
                              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="rounded-xl border border-yellow-400/10 bg-black/30 px-3 py-2">
                                  <p className={mutedEyebrow}>Campeón</p>

                                  <p className="mt-1 break-words text-sm font-black leading-tight text-yellow-300">
                                    {eventItem.campeon || "Pendiente"}
                                  </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                                  <p className={mutedEyebrow}>Subcampeón</p>

                                  <p className="mt-1 break-words text-sm font-black leading-tight text-white">
                                    {eventItem.subcampeon || "Pendiente"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {isNext && (
                              <p className="mt-3 rounded-xl border border-yellow-400/10 bg-yellow-400/5 px-3 py-2 text-xs font-bold text-yellow-200">
                                Próxima jornada activa en calendario.
                              </p>
                            )}

                            {isFuture && (
                              <p className="mt-3 text-xs font-bold text-gray-500">
                                Fecha pendiente de anuncio oficial.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}