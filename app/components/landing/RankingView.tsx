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

                    <div className="relative z-10 text-center mb-7">
                        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-4xl ${goldSoftCard}`}>
                            🏆
                        </div>

                        <p className={eyebrow}>
                            Tabla oficial
                        </p>

                        <h2 className={sectionTitle}>
                            Ranking de MCs
                        </h2>

                        <p className="mt-3 text-gray-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
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
                            {ranking.length >= 3 && (
                                <div className="mb-7">
                                    <div className="mb-4 text-center">
                                        <p className={eyebrow}>
                                            Top actual de la liga
                                        </p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3 md:items-end">
                                        {ranking.slice(0, 3).map((mc, index) => (
                                            <div
                                                key={`${mc.alias}-top-${index}`}
                                                className={`relative overflow-hidden rounded-3xl border p-4 text-center transition ${index === 0
                                                    ? "order-1 border-yellow-400/50 bg-yellow-400/15 md:order-2 md:-translate-y-4"
                                                    : index === 1
                                                        ? "order-2 border-white/10 bg-black/30 md:order-1"
                                                        : "order-3 border-white/10 bg-black/30"
                                                    }`}
                                            >
                                                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-yellow-400/10 blur-2xl" />

                                                <p className="text-3xl">
                                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                                </p>

                                                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                                                    {index === 0
                                                        ? "1er lugar"
                                                        : index === 1
                                                            ? "2do lugar"
                                                            : "3er lugar"}
                                                </p>

                                                <h3 className="mt-2 text-xl sm:text-2xl font-black text-white leading-tight break-words">
                                                    {mc.alias}
                                                </h3>

                                                <p className="mt-2 text-2xl font-black text-yellow-400 tabular-nums">
                                                    {mc.puntosLiga.toLocaleString("es-DO")}
                                                </p>

                                                <p className={mutedEyebrow}>
                                                    pts liga
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-3">
                                {ranking.map((mc, index) => (
                                    <motion.div
                                        key={`${mc.alias}-${index}`}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.035 }}
                                        className={`group rounded-3xl border p-4 transition ${index === 0
                                            ? "border-yellow-400/35 bg-yellow-400/10 shadow-[0_0_30px_rgba(250,204,21,0.08)]"
                                            : "border-white/10 bg-black/40 hover:border-yellow-400/20"
                                            }`}
                                    >
                                        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ${index === 0
                                                    ? "bg-yellow-400 text-black"
                                                    : "bg-white/10 text-white"
                                                    }`}
                                            >
                                                #{index + 1}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="max-w-full text-xl sm:text-2xl font-black text-white leading-tight break-words">
                                                        {mc.alias}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getRankingStatusClass(
                                                            mc.estado
                                                        )}`}
                                                    >
                                                        {mc.estado || "activo"}
                                                    </span>
                                                </div>

                                                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                                    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/40 px-2 py-2">
                                                        <p className="text-sm font-black text-white">
                                                            {mc.victorias}
                                                        </p>
                                                        <p className={mutedEyebrow}>
                                                            Vic
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/40 px-2 py-2">
                                                        <p className="text-sm font-black text-white">
                                                            {mc.derrotas}
                                                        </p>
                                                        <p className={mutedEyebrow}>
                                                            Der
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/40 px-2 py-2">
                                                        <p className="text-sm font-black text-white">
                                                            {mc.replicas}
                                                        </p>
                                                        <p className={mutedEyebrow}>
                                                            Rep
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`${goldSoftCard} px-4 py-3 text-left sm:text-right`}>
                                                <p className="text-3xl font-black text-yellow-400 tabular-nums leading-none">
                                                    {mc.puntosLiga.toLocaleString("es-DO")}
                                                </p>

                                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                                                    pts liga
                                                </p>

                                                <p className="mt-2 text-xs font-bold text-gray-400">
                                                    Batallas:{" "}
                                                    <span className="text-gray-200 tabular-nums">
                                                        {mc.puntosBatalla.toLocaleString("es-DO")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}