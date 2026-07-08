"use client";

import { motion } from "framer-motion";
import type { LeagueEvent } from "@/lib/domain/league/types";

type LatestResultsProps = {
  latestCompletedEvent: LeagueEvent | null;
};

const PODIUM = [
  { key: "campeon",    label: "Campeón",    rank: 1 },
  { key: "subcampeon", label: "Subcampeón", rank: 2 },
  { key: "mvp",        label: "MVP",        rank: null },
] as const;

function RankIcon({ rank }: { rank: 1 | 2 | null }) {
  if (rank === 1) return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path d="M10 2 L12 7 L17.5 7.5 L13.5 11 L15 17 L10 14 L5 17 L6.5 11 L2.5 7.5 L8 7 Z"
        fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5" strokeLinejoin="round"/>
    </svg>
  );
  if (rank === 2) return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" fill="#94A3B8" opacity="0.5"/>
      <text x="10" y="14" textAnchor="middle" fontSize="8" fontWeight="900" fill="white">2</text>
    </svg>
  );
  // MVP — microphone
  return (
    <svg className="h-4 w-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

export function LatestResults({ latestCompletedEvent }: LatestResultsProps) {
  return (
    <section className="arena-card p-5 sm:p-6">

      {/* Header */}
      <div className="mb-5 flex items-end justify-between border-b border-white/[0.05] pb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401Z" clipRule="evenodd"/>
            </svg>
            <p className="kicker text-[10px] text-yellow-400">Resultados</p>
          </div>
          <h2 className="section-title text-3xl text-white">Última fecha</h2>
        </div>
        {latestCompletedEvent && (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1 text-[9px] font-display font-bold uppercase tracking-[0.22em] text-emerald-400">
            Finalizada
          </span>
        )}
      </div>

      {latestCompletedEvent ? (
        <>
          {/* Event title */}
          <div className="flex items-center gap-2 mb-5">
            <svg className="h-3.5 w-3.5 shrink-0 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <p className="text-sm font-display font-bold uppercase tracking-[0.08em] text-zinc-500">
              {latestCompletedEvent.label || latestCompletedEvent.titulo}
            </p>
          </div>

          {/* Podium */}
          <div className="space-y-2.5">
            {PODIUM.map(({ key, label, rank }, i) => {
              const name = latestCompletedEvent[key as keyof typeof latestCompletedEvent] as string | undefined;
              if (!name) return null;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    rank === 1
                      ? "border-yellow-400/25 bg-yellow-400/[0.07] hover:bg-yellow-400/[0.10]"
                      : "border-white/[0.04] bg-white/[0.02] hover:border-yellow-400/20 hover:bg-yellow-400/[0.03]"
                  }`}
                >
                  {/* Rank badge */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    rank === 1
                      ? "bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.3)]"
                      : rank === 2
                        ? "border border-white/20 bg-white/[0.06] text-zinc-300"
                        : "border border-yellow-400/20 bg-yellow-400/[0.06] text-yellow-400/80"
                  }`}>
                    <RankIcon rank={rank} />
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-base font-display font-bold uppercase tracking-[0.01em] text-white">
                      {name}
                    </p>
                    <p className="text-[10px] font-display font-bold uppercase tracking-[0.18em] text-zinc-600">
                      {label}
                    </p>
                  </div>

                  {rank === 1 && (
                    <svg className="h-5 w-5 text-yellow-400/40 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401Z" clipRule="evenodd"/>
                    </svg>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Summary */}
          {latestCompletedEvent.resumen && (
            <p className="mt-4 text-xs leading-5 text-zinc-600 line-clamp-3 border-t border-white/[0.04] pt-4">
              {latestCompletedEvent.resumen}
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-10">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="opacity-20">
            <circle cx="26" cy="26" r="22" stroke="currentColor" strokeWidth="1.5" className="text-yellow-400"/>
            <path d="M26 14 L30 22 L40 23.5 L33 30 L34.7 40 L26 35.5 L17.3 40 L19 30 L12 23.5 L22 22 Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-yellow-400"/>
          </svg>
          <div className="text-center">
            <p className="text-sm font-display font-bold uppercase tracking-[0.16em] text-zinc-500">Sin resultados aún</p>
            <p className="mt-1 text-xs text-zinc-600">Los resultados aparecerán cuando finalice la primera fecha</p>
          </div>
        </div>
      )}
    </section>
  );
}
