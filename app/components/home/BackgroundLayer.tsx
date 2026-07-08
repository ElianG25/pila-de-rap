"use client";

import { motion } from "framer-motion";

type BackgroundLayerProps = {
  scrollY: number;
  reducedMotion: boolean;
  isDesktop: boolean;
  bgVideoId: string;
};

/** Fondo fijo: póster en móvil, video de YouTube + parallax en desktop, más los glows ambientales. */
export function BackgroundLayer({ scrollY, reducedMotion, isDesktop, bgVideoId }: BackgroundLayerProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden"
        style={{ transform: reducedMotion ? "none" : `translateY(${Math.min(scrollY * 0.12, 90)}px)` }}
      >
        {/* Póster base: cubre siempre, evita franjas negras y sirve a móvil sin iframe */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/map-preview.jpg')", opacity: 0.45 }}
        />
        {isDesktop && !reducedMotion && (
          <iframe loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
            className="absolute pointer-events-none"
            style={{
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%) scale(1.04)",
              width: "calc(max(100vw, 177.78vh) + 240px)",
              height: "calc(max(100vh, 56.25vw) + 240px)",
              opacity: 0.35,
            }}
            src={`https://www.youtube.com/embed/${bgVideoId}?autoplay=1&mute=1&loop=1&playlist=${bgVideoId}&controls=0&modestbranding=1&playsinline=1`}
            title="Background" allow="autoplay; encrypted-media; picture-in-picture"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: "url('/noise.png')" }} />
      </div>

      <motion.div aria-hidden animate={{ opacity: [0.12, 0.25, 0.12] }} transition={{ repeat: Infinity, duration: 5 }}
        className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-yellow-400/10 blur-[130px] z-0" />
      <motion.div aria-hidden animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 7, delay: 1 }}
        className="pointer-events-none fixed -bottom-40 -right-40 w-[460px] h-[460px] rounded-full bg-yellow-300/[0.08] blur-[130px] z-0" />
    </>
  );
}
