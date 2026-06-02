"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type HeroHeaderProps = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  isPreEvent: boolean;
  timeLeft: {
    d: number;
    h: number;
    m: number;
    s: number;
  };
};

export default function HeroHeader({
  heroBadge,
  heroTitle,
  heroSubtitle,
  isPreEvent,
  timeLeft,
}: HeroHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="text-center max-w-2xl mx-auto"
    >
      <div className="text-center">
        <div className="mx-auto mb-5 flex justify-center">
          <Image
            src="/logo.png"
            alt="Pila de Ra'"
            width={180}
            height={180}
            priority
            className="h-20 w-auto object-contain sm:h-24 md:h-32 drop-shadow-[0_0_32px_rgba(250,204,21,0.22)]"
          />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-yellow-300">
          <div className="h-2 w-2 rounded-full bg-yellow-400" />
          {heroBadge}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 text-[2rem] sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[0.95]"
        >
          {heroTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 max-w-xl mx-auto text-sm md:text-base leading-relaxed text-gray-400"
        >
          {heroSubtitle}
        </motion.p>
      </div>

      {isPreEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.45,
            duration: 0.5,
          }}
          className="mt-5 flex justify-center gap-2 flex-wrap mb-7"
        >
          {Object.entries(timeLeft).map(([label, value]) => (
            <motion.div
              key={label}
              whileHover={{
                y: -4,
                scale: 1.03,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
              }}
              className="min-w-[66px] rounded-2xl border border-yellow-400/20 bg-black/50 px-3 py-2.5 shadow-lg backdrop-blur-md"
            >
              <div className="text-xl md:text-2xl font-black text-yellow-300">
                {value}
              </div>

              <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">
                {label === "d"
                  ? "Días"
                  : label === "h"
                    ? "Horas"
                    : label === "m"
                      ? "Min"
                      : "Seg"}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}