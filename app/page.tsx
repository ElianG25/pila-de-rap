"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"evento" | "mcs" | "ranking">("evento");

  const [timeLeft, setTimeLeft] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  const jueces = [
    { nombre: "H-OFER", ig: "mchoferrap" },
    { nombre: "???", ig: null },
    { nombre: "JAVIER", ig: "javierreynoso20" },
  ];

  const [open, setOpen] = useState(false);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const [slots, setSlots] = useState<number | null>(null);

  // ✅ más seguro
  const isFull = slots !== null && slots <= 0;

  // 🔥 MCs
  const [mcs, setMcs] = useState<
    { alias: string; visible: boolean; justRevealed?: boolean }[]
  >([]);

  const [serverOffset, setServerOffset] = useState(0);
  const [nextRevealAt, setNextRevealAt] = useState<number | null>(null);
  const [hypeCount, setHypeCount] = useState(0);
  const [isLive, setIsLive] = useState(false);

  // 🔁 Persistencia de vista (MEJORADO)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("view");
    if (saved === "evento" || saved === "mcs" || saved === "ranking") {
      setView(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("view", view);
  }, [view]);

  // 🔁 Flip card
  const [flipped, setFlipped] = useState(false);

  // ⏳ Próximo reveal
  const [nextReveal, setNextReveal] = useState({
    h: 0,
    m: 0,
    s: 0,
  });

  const syncedNow = useCallback(() => Date.now() + serverOffset, [serverOffset]);

  const getNextRevealDate = useCallback(() => {
    if (nextRevealAt) return new Date(nextRevealAt);

    const now = new Date(syncedNow());
    const next = new Date(now);

    // 7:00 PM República Dominicana = 23:00 UTC.
    next.setUTCHours(23, 0, 0, 0);

    if (now.getTime() >= next.getTime()) {
      next.setUTCDate(next.getUTCDate() + 1);
    }

    return next;
  }, [nextRevealAt, syncedNow]);

  // 🎤 Fetch DATA
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/mcs", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Error fetching data");

      const data = await res.json();

      // ✅ MCs
      setMcs(Array.isArray(data.data) ? data.data : []);

      if (typeof data.serverTime === "number") {
        setServerOffset(data.serverTime - Date.now());
      }

      if (typeof data.nextRevealAt === "number") {
        setNextRevealAt(data.nextRevealAt);
      }

      if (typeof data.hypeCount === "number") {
        setHypeCount(data.hypeCount);
      }

      // ✅ Slots robusto
      const rawSlots = data.restantes;
      let parsedSlots: number | null = null;

      if (typeof rawSlots === "number") {
        parsedSlots = rawSlots;
      } else if (typeof rawSlots === "string") {
        const n = Number(rawSlots);
        parsedSlots = Number.isNaN(n) ? null : n;
      }

      setSlots(parsedSlots);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setMcs([]);
      setSlots(null);
    }
  }, []);

  // 🔁 Carga inicial + refresco periódico para que se revelen sin recargar la página
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // 🔴 Tiempo real vía Server-Sent Events: sincroniza reloj, hype y refresca al reveal.
  useEffect(() => {
    if (typeof window === "undefined" || !("EventSource" in window)) return;

    const source = new EventSource("/api/realtime");

    source.addEventListener("open", () => setIsLive(true));

    source.addEventListener("tick", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data);

        if (typeof payload.serverTime === "number") {
          setServerOffset(payload.serverTime - Date.now());
        }

        if (typeof payload.nextRevealAt === "number") {
          setNextRevealAt(payload.nextRevealAt);
        }

        if (typeof payload.hypeCount === "number") {
          setHypeCount(payload.hypeCount);
        }

        if (typeof payload.nextRevealAt === "number") {
          const diff = payload.nextRevealAt - payload.serverTime;
          if (diff <= 1500) fetchData();
        }
      } catch (error) {
        console.error("Realtime payload inválido:", error);
      }
    });

    source.addEventListener("error", () => {
      setIsLive(false);
    });

    return () => {
      source.close();
      setIsLive(false);
    };
  }, [fetchData]);

  // 🔁 Auto flip (SOLO cuando estás en la vista de MCs)
  useEffect(() => {
    if (view !== "mcs") return;

    const interval = setInterval(() => {
      setFlipped((prev) => !prev);
    }, 10000);

    return () => clearInterval(interval);
  }, [view]);

  // ⏳ Próxima revelación
  useEffect(() => {
    const updateNextReveal = () => {
      const diff = Math.max(0, getNextRevealDate().getTime() - syncedNow());

      setNextReveal({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });

      // Justo al llegar a las 7:00 PM RD, refresca los MCs revelados.
      if (diff <= 1000) {
        fetchData();
      }
    };

    updateNextReveal();
    const interval = setInterval(updateNextReveal, 1000);

    return () => clearInterval(interval);
  }, [fetchData, getNextRevealDate, syncedNow]);

  // ⏳ Loader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // un poco más rápido
    return () => clearTimeout(timer);
  }, []);

  // ⏳ Countdown evento
  useEffect(() => {
    const targetDate = new Date("2026-05-31T00:00:00.000Z"); // 30 mayo 2026, 8:00 PM RD

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const visibleMcs = useMemo(() => mcs.filter((mc) => mc.visible), [mcs]);
  const revealedCount = visibleMcs.length;

  const shareLineup = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `🔥 Ya hay ${revealedCount} MCs revelados en PILA DE RA'. Próximo drop hoy a las 7:00 PM.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "PILA DE RA' - MC Reveal",
          text,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(`${text} ${url}`);
      alert("Link copiado para compartir 🔥");
    } catch (error) {
      console.error("No se pudo compartir:", error);
    }
  }, [revealedCount]);

  // 🔥 Skeleton loading elegante
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50 px-5">
        <div className="w-full max-w-md rounded-3xl border border-yellow-400/15 bg-white/[0.03] p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded-full bg-yellow-400/20 animate-pulse" />
              <div className="h-3 w-1/2 rounded-full bg-white/10 animate-pulse" />
            </div>
          </div>

          <div className="h-44 rounded-3xl bg-gradient-to-br from-yellow-400/20 via-white/5 to-transparent animate-pulse" />

          <div className="grid grid-cols-4 gap-2 mt-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-xl bg-white/10 animate-pulse"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>

          <p className="mt-5 text-center text-yellow-400 text-xs tracking-[0.3em] animate-pulse">
            CARGANDO LINEUP
          </p>
        </div>
      </div>
    );
  }

  return (

    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white touch-manipulation">

      {/* 🎥 VIDEO BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden z-0">

        {/* VIDEO */}
        <iframe
          className="
        absolute
        top-1/2
        left-1/2
        w-[177.77vh]
        h-[100vh]
        min-w-[100vw]
        min-h-[56.25vw]
        -translate-x-1/2
        -translate-y-1/2
        scale-110
        opacity-40
        pointer-events-none
      "
          src="https://www.youtube.com/embed/7IH3cXRUKsI?autoplay=1&mute=1&loop=1&playlist=7IH3cXRUKsI&controls=0&modestbranding=1"
          title="Background video"
          allow="autoplay"
          allowFullScreen
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/70" />

        {/* NOISE */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.06] mix-blend-overlay" />
      </div>

      {/* ✨ GLOWS */}
      <motion.div
        animate={{
          opacity: [0.15, 0.3, 0.15],
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        }}
        className="
      absolute
      -top-32
      -left-32
      w-[420px]
      h-[420px]
      rounded-full
      bg-yellow-400/20
      blur-[120px]
      z-10
    "
      />

      <motion.div
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scale: [1, 1.08, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
        className="
      absolute
      -bottom-32
      -right-32
      w-[380px]
      h-[380px]
      rounded-full
      bg-yellow-300/20
      blur-[120px]
      z-10
    "
      />

      {/* 🔥 MAIN CONTENT */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-10">

        {/* WIDTH CONTAINER */}
        <div className="w-full max-w-6xl mx-auto">

          {/* 🧠 HERO */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-center max-w-2xl mx-auto"
          >

            {/* TITLE */}
            <motion.h1
              animate={{ y: [0, -3, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
              className="
            text-5xl
            md:text-7xl
            font-black
            tracking-tight
            text-yellow-400
            leading-none
            mb-5
          "
            >
              🔋 Pila de Ra'
            </motion.h1>

            {/* SUBTITLE */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="
            text-lg
            md:text-2xl
            text-gray-200
            font-medium
            mb-3
          "
            >
              ¡LA PLAZA SIGUE VIVA!
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="
            text-sm
            md:text-lg
            text-gray-400
            max-w-lg
            mx-auto
            leading-relaxed
            mb-10
          "
            >
              Formatos sorpresa, premio en efectivo y pila de vibras.
            </motion.p>

            {/* ⏳ COUNTDOWN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.45,
                duration: 0.5,
              }}
              className="flex justify-center gap-3 flex-wrap mb-10"
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
                  className="
                min-w-[72px]
                px-4
                py-3
                rounded-2xl
                bg-black/50
                backdrop-blur-md
                border
                border-yellow-400/20
                shadow-lg
              "
                >
                  <div className="text-2xl md:text-3xl font-black text-yellow-300">
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

          </motion.div>

          {/* TOGGLE PAGS */}
          <div className="flex justify-center mb-10">
            <div className="relative flex bg-black/60 border border-yellow-400/20 rounded-xl p-1 w-full max-w-md">

              {/* 🔥 PILL ANIMADO */}
              <motion.div
                layoutId="toggle-pill"
                className="absolute top-1 bottom-1 left-1 right-1 rounded-lg bg-yellow-400"
                style={{
                  width: `calc(100% / 3 - 4px)`,
                }}
                animate={{
                  x:
                    view === "evento"
                      ? "0%"
                      : view === "mcs"
                        ? "100%"
                        : "200%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />

              {[
                { key: "evento", label: "📅 Evento" },
                { key: "mcs", label: "🎤 MCs" },
                { key: "ranking", label: "🏆 Ranking" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key as any)}
                  className={`relative z-10 flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200
        ${view === item.key
                      ? "text-black"
                      : "text-gray-400 hover:text-yellow-300"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 🔥 CONTENIDO */}
          <div className="w-full max-w-xl mx-auto">

            <AnimatePresence mode="wait">

              {view === "evento" && (
                <motion.div
                  key="evento"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-full"
                >

                  {/* EVENT CARD */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
            relative overflow-hidden
            bg-black/60 backdrop-blur-xl
            border border-yellow-400/20
            rounded-3xl
            p-6 md:p-8
            shadow-[0_0_40px_rgba(250,204,21,0.08)]
          "
                  >

                    {/* 🔥 Glow */}
                    <div className="absolute inset-0 bg-yellow-400/5 blur-3xl pointer-events-none" />

                    {/* CONTENT */}
                    <div className="relative z-10">

                      {/* HEADER */}
                      <div className="text-center">

                        <motion.h2
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 }}
                          className="text-3xl md:text-4xl font-black text-yellow-400 tracking-tight mb-3"
                        >
                          Próximo Evento
                        </motion.h2>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-1"
                        >
                          <p className="text-lg text-gray-200">
                            📅 Sábado, 30 de mayo
                          </p>

                          <p className="text-lg text-gray-300">
                            🕒 3:00 PM
                          </p>
                        </motion.div>

                      </div>

                      {/* JUECES */}
                      <div className="flex justify-center gap-3 mt-8 mb-7 flex-wrap">

                        {jueces.map((juez, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -3 }}
                            className="
                    bg-black/50
                    border border-yellow-400/15
                    rounded-xl
                    px-4 py-3
                    min-w-[90px]
                    text-center
                    transition-all
                  "
                          >

                            {juez.ig ? (
                              <a
                                href={`https://instagram.com/${juez.ig}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-yellow-300 font-bold hover:text-yellow-200 transition"
                              >
                                {juez.nombre}
                              </a>
                            ) : (
                              <div className="text-sm text-yellow-300 font-bold">
                                {juez.nombre}
                              </div>
                            )}

                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                              Juez
                            </div>

                          </motion.div>
                        ))}

                      </div>

                      {/* MAP */}
                      <div className="mb-7">

                        <p className="text-xs text-gray-500 mb-3 text-center uppercase tracking-[0.2em]">
                          📍 Tropical Skatepark • Mirador Sur
                        </p>

                        <a
                          href="https://maps.app.goo.gl/YBgeMyMwmDQ6AqhE8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >

                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="
                    relative overflow-hidden
                    rounded-2xl
                    border border-yellow-400/20
                  "
                          >

                            <img
                              src="/map-preview.jpg"
                              alt="Ubicación del evento"
                              className="
                      w-full h-40 object-cover
                      opacity-80 group-hover:opacity-100
                      transition duration-300
                    "
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">

                              <div className="
                      px-4 py-2 rounded-full
                      bg-black/60 border border-yellow-400/20
                      backdrop-blur-sm
                    ">
                                <span className="text-xs text-yellow-300 font-semibold tracking-wide">
                                  Abrir en Google Maps
                                </span>
                              </div>

                            </div>

                          </motion.div>

                        </a>

                      </div>

                      {/* ACTIONS */}
                      <div>

                        {/* BUTTON */}
                        <motion.button
                          onClick={() => {
                            if (!isFull) setOpen(true);
                          }}
                          disabled={isFull}
                          whileHover={!isFull ? { scale: 1.02 } : {}}
                          whileTap={!isFull ? { scale: 0.98 } : {}}
                          className={`
                  w-full py-3 rounded-2xl font-bold text-sm
                  transition-all duration-200
                  ${isFull
                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-yellow-400 text-black hover:bg-yellow-300"
                            }
                `}
                        >
                          {isFull
                            ? "❌ Inscripciones cerradas"
                            : "📝 Inscripciones"}
                        </motion.button>

                        {/* CUPOS */}
                        {typeof slots === "number" && (
                          <motion.div
                            key={slots}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-center"
                          >

                            <p
                              className={`text-sm font-semibold ${slots <= 0
                                ? "text-red-400"
                                : "text-yellow-300"
                                }`}
                            >
                              {slots <= 0
                                ? "❌ Cupos agotados"
                                : `⚠️ Quedan ${slots} cupos disponibles`}
                            </p>

                            {/* Progress */}
                            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-yellow-400/10 mt-3">

                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${((32 - slots) / 32) * 100}%`,
                                }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-yellow-400"
                              />

                            </div>

                          </motion.div>
                        )}

                        {/* SOCIAL */}
                        <div className="flex items-center justify-center gap-4 mt-7 flex-wrap">

                          {/* YouTube */}
                          <motion.a
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            href="https://www.youtube.com/@piladerap"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                    group flex items-center gap-2
                    px-4 py-2 rounded-xl
                    bg-black/40
                    border border-yellow-400/15
                    hover:bg-yellow-400
                    hover:text-black
                    transition-all duration-200
                  "
                          >

                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="transition-transform duration-200 group-hover:scale-110"
                            >
                              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.5v-7l6.2 3.5-6.2 3.5z" />
                            </svg>

                            <span className="text-sm font-semibold">
                              YouTube
                            </span>

                          </motion.a>

                          {/* Instagram */}
                          <motion.a
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            href="https://instagram.com/piladera"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                    group flex items-center gap-2
                    px-4 py-2 rounded-xl
                    bg-black/40
                    border border-yellow-400/15
                    hover:bg-yellow-400
                    hover:text-black
                    transition-all duration-200
                  "
                          >

                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="transition-transform duration-200 group-hover:scale-110"
                            >
                              <path d="M7.75 2C4.57 2 2 4.57 2 7.75v8.5C2 19.43 4.57 22 7.75 22h8.5C19.43 22 22 19.43 22 16.25v-8.5C22 4.57 19.43 2 16.25 2h-8.5zm0 2h8.5C18.55 4 20 5.45 20 7.75v8.5c0 2.3-1.45 3.75-3.75 3.75h-8.5C5.45 20 4 18.55 4 16.25v-8.5C4 5.45 5.45 4 7.75 4zm8.25 1.5a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z" />
                            </svg>

                            <span className="text-sm font-semibold">
                              Instagram
                            </span>

                          </motion.a>

                        </div>

                      </div>

                    </div>

                  </motion.div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>

          {view === "mcs" && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full max-w-xl mx-auto"
            >
              <div className="mb-5 grid grid-cols-2 gap-3 px-1">

                {/* 🔥 HYPE LIVE */}
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  className="
      relative overflow-hidden
      rounded-2xl
      border border-yellow-400/20
      bg-gradient-to-br from-yellow-400/15 via-yellow-300/10 to-orange-400/15
      p-4
      text-center
      shadow-[0_0_35px_rgba(250,204,21,0.10)]
      backdrop-blur-xl
    "
                >

                  {/* Glow */}
                  <div className="absolute inset-0 bg-yellow-300/10 blur-3xl pointer-events-none" />

                  {/* Live Pulse */}
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: "easeInOut",
                    }}
                    className="
        absolute top-3 right-3
        w-2.5 h-2.5
        rounded-full
        bg-green-400
        shadow-[0_0_14px_rgba(74,222,128,0.9)]
      "
                  />

                  {/* Label */}
                  <p className="
      text-[10px]
      uppercase
      tracking-[0.35em]
      text-yellow-100/70
      font-bold
    ">
                    🔥 Hype en vivo
                  </p>

                  {/* Number */}
                  <motion.p
                    key={hypeCount}
                    initial={{
                      opacity: 0,
                      scale: 0.82,
                      filter: "blur(10px)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
        mt-2
        text-3xl
        md:text-4xl
        font-black
        tracking-tight
        text-yellow-300
        drop-shadow-[0_0_18px_rgba(250,204,21,0.45)]
      "
                  >
                    {hypeCount.toLocaleString("es-DO")}
                  </motion.p>

                  {/* Subtitle */}
                  <p className="
      mt-1
      text-[11px]
      text-yellow-100/55
      tracking-wide
    ">
                    personas esperando el reveal ⚡
                  </p>

                </motion.div>

                {/* 🚀 SHARE BUTTON */}
                <motion.button
                  type="button"
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={shareLineup}
                  className="
      relative overflow-hidden
      rounded-2xl
      border border-yellow-400/30
      bg-yellow-400
      text-black
      p-4
      text-center
      font-black
      shadow-[0_0_35px_rgba(250,204,21,0.20)]
      transition-all
      duration-300
    "
                >

                  {/* Shine */}
                  <motion.div
                    animate={{
                      x: ["-120%", "220%"],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                      ease: "easeInOut",
                    }}
                    className="
        absolute inset-y-0
        w-1/2
        bg-white/25
        blur-xl
        rotate-12
      "
                  />

                  {/* Top */}
                  <span className="
      relative z-10
      block
      text-[10px]
      uppercase
      tracking-[0.3em]
      opacity-70
    ">
                    Compartir
                  </span>

                  {/* Main */}
                  <span className="
      relative z-10
      mt-2
      block
      text-lg
      md:text-xl
      leading-none
    ">
                    🚀 Lineup
                  </span>

                  {/* Bottom */}
                  <span className="
      relative z-10
      mt-2
      block
      text-[11px]
      font-semibold
      opacity-70
    ">
                    súbelo a stories 🔥
                  </span>

                </motion.button>

              </div>

              <div className="mb-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-gray-400">
                <span className={`h-2 w-2 rounded-full ${isLive ? "bg-green-400" : "bg-yellow-400"}`} />
                {isLive ? "Tiempo real activo" : "Sincronizando cada minuto"}
              </div>

              {/* 🔥 FLIP CARD MCs */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl mx-auto [perspective:1000px]"
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative w-full cursor-pointer [transform-style:preserve-3d]"
                  style={{ minHeight: flipped ? "auto" : "280px" }}
                  onClick={() => setFlipped(!flipped)}
                >

                  {/* 🟡 FRONT */}
                  <div className="absolute inset-0 overflow-hidden bg-yellow-400 text-black rounded-2xl p-5 sm:p-6 flex flex-col justify-between [backface-visibility:hidden]">

                    {/* BACKGROUND FX */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-white/20 blur-3xl" />
                      <div className="absolute -bottom-24 -left-20 w-60 h-60 rounded-full bg-orange-500/20 blur-3xl" />
                      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:18px_18px]" />
                    </div>

                    {/* TOP */}
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] opacity-65 font-black">
                          Último MC revelado
                        </p>

                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1">
                          <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.9)]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                            Live drop
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.18em] opacity-60 font-bold">
                          Revelados
                        </p>
                        <p className="text-2xl font-black leading-none">
                          {revealedCount}
                          <span className="text-sm opacity-50">/{mcs.length || 32}</span>
                        </p>
                      </div>
                    </div>

                    {/* CENTER */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
                      {(() => {
                        const last = visibleMcs[visibleMcs.length - 1];
                        const previous = visibleMcs[visibleMcs.length - 2];

                        return last ? (
                          <>
                            <motion.div
                              key={last.alias}
                              initial={{ opacity: 0, scale: 0.75, filter: "blur(14px)" }}
                              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                              className="text-center"
                            >
                              <p className="text-[11px] uppercase tracking-[0.3em] opacity-55 font-black mb-2">
                                Ahora en tarima
                              </p>

                              <h3 className="text-5xl sm:text-6xl md:text-7xl font-black text-center leading-none drop-shadow-[0_0_22px_rgba(0,0,0,0.30)]">
                                🎤 {last.alias}
                              </h3>
                            </motion.div>

                            {previous && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="mt-5 rounded-2xl bg-black/10 px-4 py-3 text-center"
                              >
                                <p className="text-[10px] uppercase tracking-[0.22em] opacity-55 font-black">
                                  También revelado hoy
                                </p>
                                <p className="mt-1 text-lg font-black">
                                  🎤 {previous.alias}
                                </p>
                              </motion.div>
                            )}
                          </>
                        ) : (
                          <div className="text-center">
                            <p className="text-4xl font-black">???</p>
                            <p className="mt-2 text-sm font-bold opacity-60">
                              Próximamente…
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* BOTTOM */}
                    <div className="relative z-10 text-center">

                      {/* PROGRESS */}
                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] font-black opacity-60">
                          <span>Lineup</span>
                          <span>{Math.round((revealedCount / Math.max(mcs.length || 32, 1)) * 100)}%</span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-black/15">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                100,
                                (revealedCount / Math.max(mcs.length || 32, 1)) * 100
                              )}%`,
                            }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full rounded-full bg-black/80"
                          />
                        </div>
                      </div>

                      <p className="text-xs uppercase tracking-[0.22em] opacity-65 font-black mb-2">
                        Próximo drop en
                      </p>

                      {/* TIMER */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "HRS", value: nextReveal.h },
                          { label: "MIN", value: nextReveal.m },
                          { label: "SEG", value: nextReveal.s },
                        ].map((item) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="bg-black/10 rounded-xl px-3 py-3"
                          >
                            <div className="text-xl font-black leading-none">
                              {item.value.toString().padStart(2, "0")}
                            </div>

                            <div className="text-[9px] uppercase tracking-widest opacity-55 mt-1">
                              {item.label}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-black/10 px-4 py-2">
                        <span className="text-[11px] font-black">
                          2 MCs diarios • 7:00 PM
                        </span>
                        <span className="opacity-40">|</span>
                        <span className="text-[11px] font-black opacity-70">
                          toca para ver todos
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* ⚫ BACK */}
                  <div className="bg-black border border-yellow-400/20 rounded-2xl p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">

                    {/* HEADER */}
                    <div className="text-center mb-5">

                      <h3 className="text-yellow-400 font-black text-xl tracking-tight">
                        🎤 Lista de MCs
                      </h3>

                      <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-[0.2em]">
                        Próximo drop en
                      </p>

                      {/* ⏳ TIMER */}
                      <div className="flex items-center justify-center gap-2 mt-3">

                        {[
                          { label: "HRS", value: nextReveal.h },
                          { label: "MIN", value: nextReveal.m },
                          { label: "SEG", value: nextReveal.s },
                        ].map((item) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="bg-yellow-400/10 border border-yellow-400/10 rounded-lg px-3 py-2 min-w-[62px]"
                          >
                            <div className="text-lg font-black text-yellow-300 leading-none">
                              {item.value.toString().padStart(2, "0")}
                            </div>

                            <div className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">
                              {item.label}
                            </div>
                          </motion.div>
                        ))}

                      </div>

                      <p className="text-[10px] text-gray-500 mt-3">
                        🔥 2 MCs diarios • 7:00 PM
                      </p>

                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 gap-2 text-sm">

                      {Array.from({ length: 32 }).map((_, i) => {
                        const mc = mcs[i];

                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.82, y: 12, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: i * 0.018, duration: 0.35 }}
                            className={`
                              relative overflow-hidden rounded-xl py-3 px-2 text-center border transition-all duration-300 min-h-[48px]
                              ${mc?.visible
                                ? "bg-yellow-400/15 border-yellow-400/35 text-yellow-200 shadow-[0_0_22px_rgba(250,204,21,0.10)]"
                                : "bg-black/60 border-yellow-400/10 text-gray-500"
                              }
                            `}
                          >
                            {mc?.visible && mc.justRevealed && (
                              <motion.span
                                initial={{ x: "-120%" }}
                                animate={{ x: "130%" }}
                                transition={{ duration: 1.1, ease: "easeOut" }}
                                className="absolute inset-y-0 w-1/2 bg-white/25 blur-xl"
                              />
                            )}

                            {mc ? (
                              mc.visible ? (
                                <motion.span
                                  key={mc.alias}
                                  initial={{ letterSpacing: "0.18em", opacity: 0 }}
                                  animate={{ letterSpacing: "0em", opacity: 1 }}
                                  transition={{ duration: 0.45 }}
                                  className="relative z-10 font-black text-xs sm:text-sm"
                                >
                                  {mc.alias}
                                </motion.span>
                              ) : (
                                <span className="relative z-10 blur-[1px]">???</span>
                              )
                            ) : (
                              <span className="relative z-10 text-gray-700">—</span>
                            )}
                          </motion.div>
                        );
                      })}

                    </div>

                    {/* FOOTER */}
                    {mcs.length > 0 && (
                      <div className="mt-5 text-center">

                        {/* Progress */}
                        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-yellow-400/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${mcs.length > 0 ? (revealedCount / mcs.length) * 100 : 0}%`
                            }}
                            transition={{ duration: 0.6 }}
                            className="h-full bg-yellow-400"
                          />
                        </div>

                        <p className="text-xs text-gray-500 mt-3">
                          🔓 {revealedCount} revelados de {mcs.length}
                        </p>

                      </div>
                    )}

                  </div>

                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {view === "ranking" && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full max-w-xl mx-auto"
            >
              <div className="relative overflow-hidden bg-black/60 border border-yellow-400/20 rounded-2xl p-8 text-center backdrop-blur-xl">

                {/* 🔥 Glow */}
                <div className="absolute inset-0 bg-yellow-400/5 blur-3xl pointer-events-none" />

                {/* 🏆 ICON */}
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                  }}
                  className="text-6xl mb-5"
                >
                  🏆
                </motion.div>

                {/* TITLE */}
                <h2 className="text-3xl md:text-4xl font-black text-yellow-400 tracking-tight mb-3">
                  Ranking Oficial
                </h2>

                {/* SUBTITLE */}
                <p className="text-gray-300 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  Después de la primera fecha podrás ver:
                </p>

                {/* FEATURES */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">

                  {[
                    "📊 Puntajes",
                    "🔥 MVPs",
                    "🏅 Clasificados",
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-black/50 border border-yellow-400/10 rounded-xl py-4 px-3"
                    >
                      <span className="text-sm text-yellow-300 font-medium">
                        {item}
                      </span>
                    </motion.div>
                  ))}

                </div>

                {/* STATUS */}
                <div className="mt-8">

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                      }}
                      className="w-2 h-2 rounded-full bg-yellow-400"
                    />

                    <span className="text-xs uppercase tracking-[0.2em] text-yellow-300">
                      Próximamente
                    </span>
                  </div>

                </div>

                {/* FOOTER */}
                <p className="text-[11px] text-gray-500 mt-6">
                  Disponible después de la primera jornada
                </p>

              </div>
            </motion.div>
          )}

          {/* FOOTER */}
          <p className="text-xs text-gray-600 mt-12 text-center">
            © {new Date().getFullYear()} ❤️ Pila de Ra'
          </p>

          {/* Modal */}
          <AnimatePresence>
            {open && !isFull && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 40 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-black border border-yellow-400/30 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center relative"
                >
                  {/* ❌ Cerrar */}
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-4 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>

                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                    📝 Inscripciones
                  </h2>

                  {/* 🔥 CONTADOR */}
                  {typeof slots === "number" && (
                    <p className="text-yellow-300 text-sm mb-4">
                      🔥 {32 - slots}/32 MCs confirmados
                    </p>
                  )}

                  {/* FORM */}
                  <form
                    className="space-y-4 text-left"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (sending) return;

                      const form = e.currentTarget as HTMLFormElement;

                      const data = {
                        nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value.trim(),
                        alias: (form.elements.namedItem("alias") as HTMLInputElement).value.trim(),
                        telefono: (form.elements.namedItem("telefono") as HTMLInputElement).value.trim(),
                        instagram: (form.elements.namedItem("instagram") as HTMLInputElement).value.trim(),
                        fecha: "FECHA 1 | 30 de mayo",
                      };

                      // 🔒 Validación frontend
                      if (!/^\d{10}$/.test(data.telefono)) {
                        alert("⚠️ El teléfono debe tener 10 dígitos");
                        return;
                      }

                      try {
                        setSending(true);

                        const res = await fetch("/api/register", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(data),
                        });

                        const result = await res.json();

                        if (!res.ok) {
                          if (result.error === "CUPOS_AGOTADOS") {
                            alert("🔥 Se llenaron los cupos");
                          } else if (result.error === "YA_INSCRITO") {
                            alert("⚠️ Ya estás inscrito con ese número");
                          } else {
                            alert(result.error || "Error inesperado");
                          }
                          return;
                        }

                        // ✅ CORRECTO: usar 'restantes'
                        if (typeof result.restantes === "number") {
                          setSlots(result.restantes);
                        }

                        setOpen(false);
                        setSuccess(true);
                        form.reset();

                        setTimeout(() => setSuccess(false), 5000);

                      } catch (err) {
                        console.error(err);
                        alert("Error de conexión, intenta de nuevo");
                      } finally {
                        setSending(false);
                      }
                    }}
                  >
                    {/* Fecha visible */}
                    <div className="w-full p-2 rounded bg-black border border-yellow-400/20 text-gray-300 text-center">
                      📅 FECHA 1 | 30 de mayo
                    </div>

                    <input type="hidden" name="fecha" value="FECHA 1 | 30 de mayo" />

                    <input
                      name="nombre"
                      placeholder="Nombre real"
                      required
                      className="w-full p-2 rounded bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none"
                    />

                    <input
                      name="alias"
                      placeholder="Nombre artístico (MC)"
                      required
                      className="w-full p-2 rounded bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none"
                    />

                    <input
                      name="telefono"
                      placeholder="Teléfono / WhatsApp"
                      required
                      pattern="\d{10}"
                      maxLength={10}
                      inputMode="numeric"
                      className="w-full p-2 rounded bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none"
                    />

                    <input
                      name="instagram"
                      placeholder="@instagram (opcional)"
                      className="w-full p-2 rounded bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none"
                    />

                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileHover={!sending ? { scale: 1.05 } : {}}
                      whileTap={!sending ? { scale: 0.95 } : {}}
                      className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${sending
                        ? "bg-yellow-200 text-black cursor-not-allowed"
                        : "bg-yellow-400 text-black hover:bg-yellow-300"
                        }`}
                    >
                      {sending && (
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      )}
                      {sending ? "Enviando..." : "Enviar inscripción"}
                    </motion.button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✅ TOAST */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 60, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md"
              >
                <div className="bg-black/90 backdrop-blur-xl border border-yellow-400/30 text-yellow-300 px-6 py-4 rounded-xl shadow-2xl text-center">
                  <p className="font-bold">🔥 Ya estás dentro</p>

                  <p className="text-sm text-gray-300 mt-2">
                    Pronto te llegará un mensaje con los detalles.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </main>
  );
}