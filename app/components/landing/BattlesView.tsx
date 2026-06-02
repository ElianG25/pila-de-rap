"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import type { Battle } from "@/app/lib/landing/types";
import { getYoutubeThumbnailUrl } from "@/app/lib/landing/helpers";

import {
  cardBase,
  eyebrow,
  fadeUp,
  mutedEyebrow,
  sectionDescription,
  sectionGlow,
  sectionTitle,
  statCard,
} from "@/app/lib/landing/styles";

type BattleFilter = "todas" | "publicada" | "pendiente" | "en_vivo";

type BattlesViewProps = {
  battles: Battle[];
  visibleBattles: Battle[];
  battlesByDate: Record<string, Battle[]>;
  battleDates: string[];
  battleRounds: string[];
  battleFilter: BattleFilter;
  battleDateFilter: string;
  battleRoundFilter: string;
  visibleBattlesCount: number;
  publishedBattlesCount: number;
  setBattleFilter: (value: BattleFilter) => void;
  setBattleDateFilter: (value: string) => void;
  setBattleRoundFilter: (value: string) => void;
};

export default function BattlesView({
  battles,
  visibleBattles,
  battlesByDate,
  battleDates,
  battleRounds,
  battleFilter,
  battleDateFilter,
  battleRoundFilter,
  visibleBattlesCount,
  publishedBattlesCount,
  setBattleFilter,
  setBattleDateFilter,
  setBattleRoundFilter,
}: BattlesViewProps) {
  const publishedBattles = battles
    .filter(
      (battle) =>
        battle.estado?.toLowerCase() === "publicada" && battle.youtubeUrl
    )
    .slice(0, 3);

  return (
    <motion.div
      key="batallas"
      {...fadeUp}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className={`${cardBase} p-5 md:p-8`}>
        <div className={sectionGlow} />

        <div className="relative z-10 text-center mb-7">
          <p className={eyebrow}>Archivo oficial</p>

          <h2 className={sectionTitle}>Batallas</h2>

          <p className={sectionDescription}>
            Videos y resultados por fecha.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: "Visibles", value: visibleBattlesCount },
              { label: "Publicadas", value: publishedBattlesCount },
              { label: "Filtro", value: visibleBattles.length },
            ].map((item) => (
              <div
                key={item.label}
                className={`${statCard} px-3 py-3 text-center`}
              >
                <p className="text-lg font-black text-yellow-300 tabular-nums">
                  {item.value}
                </p>

                <p className={mutedEyebrow}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className={mutedEyebrow}>Estado</p>

            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {[
                { key: "todas", label: "Todas" },
                { key: "publicada", label: "Publicadas" },
                { key: "pendiente", label: "Pendientes" },
                { key: "en_vivo", label: "En vivo" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setBattleFilter(item.key as BattleFilter)}
                  className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wide transition ${
                    battleFilter === item.key
                      ? "bg-yellow-400 text-black"
                      : "border border-white/10 bg-black/40 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {battleDates.length > 1 && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className={mutedEyebrow}>Fecha</p>

              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setBattleDateFilter("todas")}
                  className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wide transition ${
                    battleDateFilter === "todas"
                      ? "bg-yellow-400 text-black"
                      : "border border-white/10 bg-black/40 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-300"
                  }`}
                >
                  Todas las fechas
                </button>

                {battleDates.map((fecha) => (
                  <button
                    key={fecha}
                    type="button"
                    onClick={() => setBattleDateFilter(fecha)}
                    className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wide transition ${
                      battleDateFilter === fecha
                        ? "bg-yellow-400 text-black"
                        : "border border-white/10 bg-black/40 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-300"
                    }`}
                  >
                    {fecha}
                  </button>
                ))}
              </div>
            </div>
          )}

          {battleRounds.length > 1 && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className={mutedEyebrow}>Ronda</p>

              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setBattleRoundFilter("todas")}
                  className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wide transition ${
                    battleRoundFilter === "todas"
                      ? "bg-yellow-400 text-black"
                      : "border border-white/10 bg-black/40 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-300"
                  }`}
                >
                  Todas las rondas
                </button>

                {battleRounds.map((ronda) => (
                  <button
                    key={ronda}
                    type="button"
                    onClick={() => setBattleRoundFilter(ronda)}
                    className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wide transition ${
                      battleRoundFilter === ronda
                        ? "bg-yellow-400 text-black"
                        : "border border-white/10 bg-black/40 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-300"
                    }`}
                  >
                    {ronda}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {publishedBattles.length > 0 && (
          <div className="relative z-10 mb-7">
            <div className="mb-4 text-center">
              <p className={eyebrow}>Últimos videos</p>

              <p className="mt-2 text-xs text-gray-500">
                Revive las mejores batallas publicadas.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {publishedBattles.map((battle, index) => {
                const thumbnailUrl = getYoutubeThumbnailUrl(battle.youtubeUrl);

                return (
                  <a
                    key={`featured-${index}`}
                    href={battle.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition hover:border-yellow-400/30"
                  >
                    {thumbnailUrl && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={thumbnailUrl}
                          alt={`${battle.mc1} vs ${battle.mc2}`}
                          fill
                          unoptimized
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.35)]">
                            ▶
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                        {battle.ronda}
                      </p>

                      <p className="mt-1 text-sm font-black text-white leading-tight">
                        {battle.mc1}
                      </p>

                      <p className="text-xs text-gray-500">vs {battle.mc2}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {visibleBattles.length === 0 ? (
          <div className="relative z-10 rounded-2xl border border-yellow-400/10 bg-black/50 p-7 text-center">
            <p className="text-xl font-black text-yellow-400">
              No hay batallas para este filtro
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Cambia el filtro o espera nuevas actualizaciones.
            </p>
          </div>
        ) : (
          <div className="relative z-10 grid gap-4">
            {Object.entries(battlesByDate).map(([fecha, group]) => (
              <div key={fecha} className="grid gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-yellow-400/10" />

                  <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                    {fecha}
                  </p>

                  <div className="h-px flex-1 bg-yellow-400/10" />
                </div>

                {group.map((battle, index) => {
                  const status = battle.estado?.toLowerCase();
                  const thumbnailUrl = getYoutubeThumbnailUrl(
                    battle.youtubeUrl
                  );
                  const isPublished = status === "publicada";
                  const winner = battle.ganador?.trim();

                  return (
                    <motion.div
                      key={`${battle.fecha}-${battle.ronda}-${battle.mc1}-${battle.mc2}-${index}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.25)] transition hover:border-yellow-400/25"
                    >
                      {thumbnailUrl && (
                        <a
                          href={battle.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block aspect-video overflow-hidden bg-black"
                        >
                          <Image
                            src={thumbnailUrl}
                            alt={`${battle.mc1} vs ${battle.mc2}`}
                            fill
                            unoptimized
                            className="object-cover opacity-75 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-2xl text-black shadow-[0_0_30px_rgba(250,204,21,0.35)] transition group-hover:scale-110">
                              ▶
                            </div>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-300">
                                {battle.ronda}
                              </p>

                              <h3 className="mt-1 text-xl sm:text-2xl font-black text-white leading-tight break-words">
                                {battle.mc1}
                                <span className="mx-2 text-yellow-400">vs</span>
                                {battle.mc2}
                              </h3>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                                isPublished
                                  ? "bg-green-400/15 text-green-300"
                                  : status === "en_vivo"
                                    ? "bg-red-400/15 text-red-300"
                                    : "bg-yellow-400/15 text-yellow-300"
                              }`}
                            >
                              {battle.estado || "pendiente"}
                            </span>
                          </div>
                        </a>
                      )}

                      <div className="p-4">
                        {!thumbnailUrl && (
                          <div className="mb-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs uppercase tracking-[0.25em] text-yellow-400 font-black">
                                {battle.ronda}
                              </p>

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                                  isPublished
                                    ? "bg-green-400/10 text-green-300"
                                    : status === "en_vivo"
                                      ? "bg-red-400/10 text-red-300"
                                      : "bg-yellow-400/10 text-yellow-300"
                                }`}
                              >
                                {battle.estado || "pendiente"}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                              <p className="min-w-0 text-right text-xl font-black text-white leading-tight break-words">
                                {battle.mc1}
                              </p>

                              <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-300">
                                VS
                              </span>

                              <p className="min-w-0 text-left text-xl font-black text-white leading-tight break-words">
                                {battle.mc2}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                            <p className={mutedEyebrow}>Ganador</p>

                            <p className="mt-1 text-lg font-black text-yellow-400 leading-tight break-words">
                              {winner || "Por definir"}
                            </p>
                          </div>

                          {battle.youtubeUrl ? (
                            <a
                              href={battle.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex justify-center rounded-full bg-yellow-400 px-5 py-3 text-xs font-black uppercase tracking-wide text-black transition hover:bg-yellow-300 hover:shadow-[0_0_24px_rgba(250,204,21,0.22)]"
                            >
                              Ver en YouTube
                            </a>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Video pendiente de publicación.
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}