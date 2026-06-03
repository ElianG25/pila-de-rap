"use client";

import { motion } from "framer-motion";

import {
    cardBase,
    eyebrow,
    fadeUp,
    goldSoftCard,
    mutedEyebrow,
    sectionGlow,
    sectionTitle,
} from "@/app/lib/landing/styles";

import { getRankingStatusClass } from "@/app/lib/landing/helpers";
import type { RankingMC } from "@/app/lib/landing/types";

type RankingViewProps = {
    ranking: RankingMC[];
};

export default function RankingView({ ranking }: RankingViewProps) {
    const topThree = ranking.slice(0, 3);
    const restRanking = ranking.slice(3);

    return (
        <motion.div
            key="ranking"
            {...fadeUp}
            transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-4xl mx-auto"
        >
            <div className={`${cardBase} p-4 sm:p-6 md:p-8`}>
                <div className={sectionGlow} />

                <div className="relative z-10 mb-7 text-center">
                    <div
                        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-4xl ${goldSoftCard}`}
                    >
                        🏆
                    </div>

                    <p className={eyebrow}>Tabla oficial</p>

                    <h2 className={sectionTitle}>Ranking de MCs</h2>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400 md:text-base">
                        Clasificación general de la liga por puntos, victorias y rendimiento.
                    </p>
                </div>

                {ranking.length === 0 ? (
                    <div className="relative z-10 rounded-2xl border border-yellow-400/10 bg-black/50 p-7 text-center">
                        <p className="text-xl font-black text-yellow-400">
                            Ranking pendiente
                        </p>

                        <p className="mt-2 text-sm text-gray-400">
                            Aún no hay datos oficiales en el ranking.
                        </p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        {topThree.length > 0 && (
                            <div className="mb-8">
                                <div className="mb-5 text-center">
                                    <p className={eyebrow}>Podio actual de la liga</p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-3 md:items-end">
                                    {topThree.map((mc, index) => {
                                        const place = index + 1;

                                        const podiumClass =
                                            place === 1
                                                ? "order-1 border-yellow-400/50 bg-yellow-400/15 md:order-2 md:min-h-[260px]"
                                                : place === 2
                                                    ? "order-2 border-white/10 bg-black/35 md:order-1 md:min-h-[220px]"
                                                    : "order-3 border-white/10 bg-black/35 md:min-h-[200px]";

                                        return (
                                            <motion.div
                                                key={`${mc.alias}-podium-${index}`}
                                                initial={{ opacity: 0, y: 18 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.08 }}
                                                className={`relative flex overflow-hidden rounded-[2rem] border p-4 text-center transition hover:border-yellow-400/30 ${podiumClass}`}
                                            >
                                                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-yellow-400/10 blur-2xl" />

                                                <div className="relative z-10 flex w-full flex-col justify-between">
                                                    <div>
                                                        <p className="text-4xl">
                                                            {place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉"}
                                                        </p>

                                                        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                                                            {place === 1
                                                                ? "1er lugar"
                                                                : place === 2
                                                                    ? "2do lugar"
                                                                    : "3er lugar"}
                                                        </p>

                                                        <h3 className="mt-2 break-words text-2xl font-black leading-tight text-white">
                                                            {mc.alias}
                                                        </h3>
                                                    </div>

                                                    <div className="mt-5">
                                                        <p className="text-4xl font-black leading-none text-yellow-400 tabular-nums">
                                                            {mc.puntosLiga.toLocaleString("es-DO")}
                                                        </p>

                                                        <p className={mutedEyebrow}>pts liga</p>

                                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                                            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2">
                                                                <p className="text-sm font-black text-white">
                                                                    {mc.victorias}
                                                                </p>
                                                                <p className={mutedEyebrow}>Vic</p>
                                                            </div>

                                                            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2">
                                                                <p className="text-sm font-black text-white">
                                                                    {mc.derrotas}
                                                                </p>
                                                                <p className={mutedEyebrow}>Der</p>
                                                            </div>

                                                            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2">
                                                                <p className="text-sm font-black text-white">
                                                                    {mc.replicas}
                                                                </p>
                                                                <p className={mutedEyebrow}>Rep</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {restRanking.length > 0 && (
                            <div className="mb-4 text-center">
                                <p className={eyebrow}>Tabla general</p>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/35">
                            <div className="grid
grid-cols-[30px_minmax(96px,1fr)_42px_38px_26px_26px_26px]
md:grid-cols-[60px_minmax(0,2fr)_110px_90px_70px_70px_70px] gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-3 text-[9px] md:text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                                <span>#</span>
                                <span>MC</span>
                                <span className="text-center">Liga</span>
                                <span className="text-center">Pts B</span>
                                <span className="text-center">V</span>
                                <span className="text-center">D</span>
                                <span className="text-center">R</span>
                            </div>

                            {ranking.map((mc, index) => (
                                <motion.div
                                    key={`${mc.alias}-${index}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.02, 0.2) }}
                                    className={`grid
grid-cols-[30px_minmax(96px,1fr)_42px_38px_26px_26px_26px]
md:grid-cols-[60px_minmax(0,2fr)_110px_90px_70px_70px_70px] gap-2 border-b border-white/5 px-3 py-3 last:border-b-0 ${index === 0
                                            ? "bg-yellow-400/10"
                                            : "bg-black/20 hover:bg-white/[0.03]"
                                        }`}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black ${index === 0
                                            ? "bg-yellow-400 text-black"
                                            : "bg-white/10 text-white"
                                            }`}
                                    >
                                        {index + 1}
                                    </div>

                                    <div className="min-w-0 text-left">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <p className="
text-sm
md:text-base
font-black
leading-tight
text-white
break-words
">
                                                {mc.alias}
                                            </p>

                                            <span
                                                className={`hidden rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide sm:inline-flex ${getRankingStatusClass(
                                                    mc.estado
                                                )}`}
                                            >
                                                {mc.estado || "activo"}
                                            </span>
                                        </div>

                                        <p className="mt-0.5 text-left text-[10px] font-bold text-gray-500 sm:hidden">
                                            {mc.estado || "activo"}
                                        </p>
                                    </div>

                                    <p className="
text-center
text-sm
md:text-base
font-black
text-yellow-300 tabular-nums">
                                        {mc.puntosLiga.toLocaleString("es-DO")}
                                    </p>

                                    <p className="text-center text-sm md:text-base font-black text-cyan-300 tabular-nums">
                                        {Math.round(Number(mc.puntosBatalla || 0)).toLocaleString("es-DO")}
                                    </p>

                                    <p className="
text-center
text-sm
md:text-base
font-black
text-white tabular-nums">
                                        {mc.victorias}
                                    </p>

                                    <p className="
text-center
text-sm
md:text-base
font-black
text-white tabular-nums">
                                        {mc.derrotas}
                                    </p>

                                    <p className="
text-center
text-sm
md:text-base
font-black
text-white tabular-nums">
                                        {mc.replicas}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}