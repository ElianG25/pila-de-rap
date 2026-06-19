"use client";

import { motion } from "framer-motion";

type SeasonStatsProps = {
  mcs: number;
  batallas: number;
  fechas: number;
};

export function SeasonStats({ mcs, batallas, fechas }: SeasonStatsProps) {
  const stats = [
    { label: "MCs", value: mcs },
    { label: "Batallas", value: batallas },
    { label: "Fechas", value: fechas },
  ];

  // No mostrar la barra si todo está en cero (liga aún sin datos)
  if (mcs + batallas + fechas === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="arena-card arena-stripes p-4 sm:p-5"
      aria-label="Cifras de la temporada"
    >
      <div className="grid grid-cols-3 divide-x divide-white/[0.07]">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
            className="flex flex-col items-center px-2"
          >
            <span className="font-mono text-3xl font-extrabold tabular-nums text-white leading-none sm:text-4xl">
              {s.value}
            </span>
            <span className="kicker mt-2 text-[9px] text-yellow-400/70">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
