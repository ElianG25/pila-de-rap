"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { TOTAL_MCS, type Mc } from "@/app/lib/landing/types";

import {
  cardBase,
  eyebrow,
  fadeUp,
  goldSoftCard,
  mutedEyebrow,
  sectionDivider,
  sectionGlow,
  statCard,
} from "@/app/lib/landing/styles";

type McsViewProps = {
  mcs: Mc[];
  revealedCount: number;
  rosterTotal: number;
  revealPercent: number;
  isPreEvent: boolean;
  isLiveEvent: boolean;
  isPostEvent: boolean;
  isRosterComplete: boolean;
  canRegister: boolean;
  sseConnected: boolean;
  nextReveal: { h: number; m: number; s: number };
  lastVisibleMc?: Mc;
  previousVisibleMc?: Mc;
  eventLabel: string;
  shareLineup: () => void;
};

type McFilter = "todos" | "revelados" | "pendientes";

export default function McsView({
  mcs,
  revealedCount,
  rosterTotal,
  revealPercent,
  isPreEvent,
  isLiveEvent,
  isPostEvent,
  isRosterComplete,
  canRegister,
  sseConnected,
  nextReveal,
  lastVisibleMc,
  previousVisibleMc,
  eventLabel,
  shareLineup,
}: McsViewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<McFilter>("todos");

  const statusLabel = isPostEvent
    ? "Finalizada"
    : isLiveEvent
      ? "Activa"
      : canRegister
        ? "Inscripción abierta"
        : "Inscripción cerrada";

  const rosterLabel =
    isPreEvent && !isRosterComplete
      ? "Próximo reveal"
      : isLiveEvent
        ? "En competencia"
        : isPostEvent
          ? "Finalizado"
          : "Roster";

  const rosterValue =
    isPreEvent && !isRosterComplete
      ? `${nextReveal.h.toString().padStart(2, "0")}:${nextReveal.m
          .toString()
          .padStart(2, "0")}:${nextReveal.s.toString().padStart(2, "0")}`
      : isLiveEvent
        ? "En competencia"
        : isPostEvent
          ? "Finalizado"
          : "Completo";

  const rosterSlots = useMemo(() => {
    return Array.from({ length: TOTAL_MCS }).map((_, index) => {
      const mc = mcs[index];

      const visible = Boolean(
        mc?.visible || isRosterComplete || isLiveEvent || isPostEvent
      );

      return {
        index,
        mc,
        visible,
        alias: visible ? mc?.alias || "MC" : "???",
      };
    });
  }, [mcs, isRosterComplete, isLiveEvent, isPostEvent]);

  const filteredSlots = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rosterSlots.filter((slot) => {
      const alias = String(slot.mc?.alias || "").toLowerCase();

      if (filter === "revelados" && !slot.visible) return false;
      if (filter === "pendientes" && slot.visible) return false;

      if (!normalizedSearch) return true;

      if (!slot.visible) return false;

      return alias.includes(normalizedSearch);
    });
  }, [rosterSlots, search, filter]);

  return (
    <motion.div
      key="mcs"
      {...fadeUp}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className={`${statCard} px-3 py-3 text-center`}>
          <p className={mutedEyebrow}>{rosterLabel}</p>

          <p className="mt-1 text-lg font-black text-yellow-300 leading-none">
            {rosterValue}
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={shareLineup}
          disabled={revealedCount <= 0}
          className={`rounded-2xl px-3 py-3 text-center font-black transition ${
            revealedCount > 0
              ? "border border-yellow-400/30 bg-yellow-400 text-black shadow-[0_0_28px_rgba(250,204,21,0.16)]"
              : "cursor-not-allowed border border-white/10 bg-black/35 text-gray-600"
          }`}
        >
          <span className="block text-[9px] uppercase tracking-[0.22em] opacity-70">
            Compartir
          </span>

          <span className="mt-1 block text-sm leading-none">
            Lineup 9:16
          </span>
        </motion.button>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
        <span
          className={`h-2 w-2 rounded-full ${
            isLiveEvent
              ? "bg-green-400"
              : isPostEvent
                ? "bg-gray-400"
                : sseConnected
                  ? "bg-green-400"
                  : "bg-yellow-400"
          }`}
        />

        {isPostEvent
          ? "Participantes de la jornada"
          : isLiveEvent
            ? "Roster en competencia"
            : isRosterComplete
              ? "Roster oficial confirmado"
              : sseConnected
                ? "Revelaciones sincronizadas"
                : "Sincronizando roster"}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={`${cardBase} p-5 sm:p-6`}
      >
        <div className={sectionGlow} />

        <div className="relative z-10">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={eyebrow}>
                {isPostEvent
                  ? "Participantes"
                  : isLiveEvent
                    ? "Competidores"
                    : "Lineup oficial"}
              </p>

              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white leading-none">
                {isPostEvent
                  ? "MCs de la fecha"
                  : isLiveEvent
                    ? "MCs en competencia"
                    : isRosterComplete
                      ? "Roster completo"
                      : "MCs revelados"}
              </h2>

              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                {isPostEvent
                  ? "Participantes que formaron parte de esta jornada."
                  : isLiveEvent
                    ? "Roster activo durante el desarrollo del evento."
                    : isRosterComplete
                      ? "Participantes confirmados."
                      : "Participantes revelados oficialmente."}
              </p>
            </div>

            <div className={`${goldSoftCard} shrink-0 px-3 py-2 text-right`}>
              <p className={mutedEyebrow}>MCs</p>

              <p className="text-xl font-black leading-none text-yellow-300">
                {revealedCount}
                <span className="text-xs text-gray-600">/{rosterTotal}</span>
              </p>
            </div>
          </div>

          {isPreEvent && !isRosterComplete && lastVisibleMc && (
            <div className="mb-5 rounded-3xl border border-yellow-400/20 bg-gradient-to-b from-yellow-400/15 to-black/30 px-4 py-5 text-center">
              <p className={mutedEyebrow}>Último MC revelado</p>

              <p className="mt-2 text-3xl font-black text-yellow-300 break-words">
                {lastVisibleMc.alias}
              </p>

              {previousVisibleMc && (
                <p className="mt-2 text-xs text-gray-400">
                  También revelado:{" "}
                  <span className="font-bold text-yellow-100">
                    {previousVisibleMc.alias}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] font-black text-gray-500">
              <span>
                {isPostEvent
                  ? "Jornada cerrada"
                  : isLiveEvent
                    ? "Evento activo"
                    : "Progreso"}
              </span>

              <span>{revealPercent}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full border border-yellow-400/10 bg-yellow-400/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${revealPercent}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.45)]"
              />
            </div>
          </div>

          <div className={sectionDivider} />

          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar MC..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-gray-600 focus:border-yellow-400/40"
            />

            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "todos", label: "Todos" },
                { key: "revelados", label: "Revelados" },
                { key: "pendientes", label: "???" },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-wide transition ${
                    filter === item.key
                      ? "bg-yellow-400 text-black"
                      : "border border-white/10 bg-black/40 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="rounded-2xl border border-yellow-400/10 bg-black/40 p-5 text-center">
              <p className="font-black text-yellow-300">
                No hay MCs con ese filtro
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Cambia la búsqueda o el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-4 sm:gap-2">
              {filteredSlots.map((slot) => (
                <motion.div
                  key={`${slot.mc?.alias || "slot"}-${slot.index}`}
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: Math.min(slot.index * 0.008, 0.18) }}
                  className={`relative flex min-h-[46px] items-center justify-center overflow-hidden rounded-xl border px-2 py-3 text-center ${
                    slot.visible
                      ? "border-yellow-400/35 bg-yellow-400/15 text-yellow-100"
                      : "border-white/10 bg-black/50 text-gray-600"
                  }`}
                >
                  {slot.visible && (
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_6rem)]" />
                  )}

                  <span
                    className={`relative z-10 text-xs font-black break-words sm:text-sm ${
                      slot.visible ? "" : "blur-[1px]"
                    }`}
                  >
                    {slot.alias}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2.5">
              <p className={mutedEyebrow}>Fecha</p>

              <p className="mt-1 text-xs font-black text-yellow-200">
                {eventLabel.replace("FECHA 1 | ", "")}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2.5">
              <p className={mutedEyebrow}>Estado</p>

              <p className="mt-1 text-xs font-black text-yellow-200">
                {statusLabel}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2.5">
              <p className={mutedEyebrow}>Lugar</p>

              <p className="mt-1 text-xs font-black text-yellow-200">
                Metro Casandra Damirón
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}