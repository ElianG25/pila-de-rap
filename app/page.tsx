"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { LeaguePayload } from "@/app/lib/league/types";
import { fetchLeague } from "@/app/lib/league/api";
import {
  getPublicEvents,
  getPublishedBattles,
  sortRanking,
} from "@/app/lib/league/helpers";
import { LeagueHero } from "@/app/components/league/LeagueHero";
import { EventTimeline } from "@/app/components/league/EventTimeline";
import { CompactRanking } from "@/app/components/league/CompactRanking";
import { LatestResults } from "@/app/components/league/LatestResults";
import { BattleArchive } from "@/app/components/league/BattleArchive";
import { RegistrationCard } from "@/app/components/league/RegistrationCard";

type Section = "inicio" | "ranking" | "fechas" | "batallas" | "inscripcion";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "inicio", label: "📅 Inicio" },
  { id: "ranking", label: "🏆 Rank" },
  { id: "fechas", label: "📆 Fechas" },
  { id: "batallas", label: "⚔️ Batallas" },
  { id: "inscripcion", label: "✍️ Inscripcion" },
];

const BG_VIDEO_ID = "jw-aW3a7pSM";

function parseEventDate(fechaEvento: string, horaEvento: string): Date | null {
  if (!fechaEvento) return null;
  try {
    // Support "yyyy-MM-dd" or "yyyy-MM-ddTHH:mm:ss"
    const base = fechaEvento.includes("T") ? fechaEvento : fechaEvento + "T00:00:00";
    const d = new Date(base);
    if (isNaN(d.getTime())) return null;
    // If we have a horaEvento like "15:00" override the time
    if (horaEvento && /^\d{1,2}:\d{2}/.test(horaEvento)) {
      const [h, m] = horaEvento.split(":").map(Number);
      d.setHours(h, m, 0, 0);
    }
    return d;
  } catch {
    return null;
  }
}

function getHeroBadge(league: LeaguePayload): string {
  const ev = league.featuredEvent;
  if (!ev) return "Próxima fecha";
  if (ev.estado === "en_vivo") return "Evento en vivo";
  if (ev.estado === "finalizada") return "Fecha finalizada";
  if (ev.estado === "inscripciones") return "Inscripciones abiertas";
  if (ev.estado === "anunciada") return ev.titulo || "Fecha confirmada";
  return "Próxima fecha";
}

function getHeroTitle(league: LeaguePayload): string {
  const ev = league.featuredEvent;
  if (!ev) return "Pila de Ra'";
  if (ev.estado === "en_vivo") return "La plaza está encendida";
  if (ev.estado === "finalizada") return "Resultados oficiales";
  return "Pila de Ra'";
}

function getHeroSubtitle(league: LeaguePayload): string {
  const ev = league.featuredEvent;
  const slogan = league.config?.brandSlogan || "Vamo' a prender la plaza";
  if (!ev) return slogan;
  if (ev.estado === "en_vivo") {
    return "Estamos en vivo. Sigue el ranking y las batallas oficiales.";
  }
  if (ev.estado === "finalizada") {
    return ev.resumen || `Consulta los resultados de ${ev.titulo}, ranking y batallas.`;
  }
  if (ev.estado === "inscripciones") {
    return "Inscríbete y forma parte de la próxima jornada de freestyle.";
  }
  if (ev.estado === "anunciada") {
    return `${ev.titulo} ya está confirmada. Prepárate para una nueva jornada.`;
  }
  const next = league.config?.brandSlogan || slogan;
  return next;
}

export default function Home() {
  const [league, setLeague] = useState<LeaguePayload | null>(null);
  const [section, setSection] = useState<Section>("inicio");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchLeague();
        if (mounted) { setLeague(data); setLoading(false); }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Error desconocido");
          setLoading(false);
        }
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Countdown from featuredEvent date
  useEffect(() => {
    if (!league) return;
    const ev = league.featuredEvent;
    if (!ev || ev.estado === "finalizada" || ev.estado === "en_vivo") {
      setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      return;
    }
    const target = parseEventDate(ev.fechaEvento, ev.horaEvento);
    if (!target) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }

    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [league]);

  const ranking = useMemo(() => sortRanking(league?.ranking ?? []), [league?.ranking]);
  const events = useMemo(() => getPublicEvents(league?.events ?? []), [league?.events]);
  const battles = useMemo(() => getPublishedBattles(league?.battles ?? []), [league?.battles]);

  const bgVideoId = (league?.config as Record<string, string>)?.backgroundVideoId ?? BG_VIDEO_ID;
  const instagramUrl = league?.config?.instagramUrl ?? "";

  const showCountdown = (() => {
    const ev = league?.featuredEvent;
    if (!ev) return false;
    if (ev.estado === "finalizada" || ev.estado === "en_vivo" || ev.estado === "futura") return false;
    return Boolean(ev.fechaEvento);
  })();

  const heroBadge = league ? getHeroBadge(league) : "Próxima fecha";
  const heroTitle = league ? getHeroTitle(league) : "Pila de Ra'";
  const heroSubtitle = league ? getHeroSubtitle(league) : "Vamo' a prender la plaza";

  const activeIndex = SECTIONS.findIndex((s) => s.id === section);

  // LOADING
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50 px-5">
        <div className="w-full max-w-md rounded-3xl border border-yellow-400/15 bg-white/[0.03] p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/logo.png"
              alt="Pila de Ra'"
              width={52}
              height={52}
              className="h-12 w-auto object-contain"
              priority
            />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded-full bg-yellow-400/10 animate-pulse" />
              <div className="h-3 w-1/2 rounded-full bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="h-44 rounded-3xl bg-gradient-to-br from-yellow-400/20 via-white/5 to-transparent animate-pulse" />
          <div className="grid grid-cols-5 gap-2 mt-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 rounded-xl bg-white/10 animate-pulse"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
          <p className="mt-5 text-center text-yellow-400 text-xs tracking-[0.3em] animate-pulse font-black uppercase">
            Cargando Pila de Ra'
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error || !league) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50 px-5">
        <div className="w-full max-w-sm rounded-3xl border border-yellow-400/20 bg-white/[0.03] p-6 text-center">
          <Image
            src="/logo.png"
            alt="Pila de Ra'"
            width={48}
            height={48}
            className="h-12 w-auto object-contain mx-auto mb-4"
          />
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-2">Error</p>
          <p className="text-base font-black uppercase text-white mb-3">No se pudo cargar</p>
          <p className="text-sm text-zinc-400 mb-5">{error || "La informacion de la liga no esta disponible."}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-yellow-400 px-5 py-2 text-sm font-black uppercase tracking-wide text-black hover:bg-yellow-300 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-x-clip bg-black text-white touch-pan-y">

      {/* VIDEO BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none select-none">
        <iframe
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute top-1/2 left-1/2 w-[177.77vh] h-[100vh] min-w-[100vw] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 scale-110 opacity-40 pointer-events-none"
          src={`https://www.youtube.com/embed/${bgVideoId}?autoplay=1&mute=1&loop=1&playlist=${bgVideoId}&controls=0&modestbranding=1&playsinline=1`}
          title="Background"
          allow="autoplay"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: "url('/noise.png')" }} />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* GLOWS */}
      <motion.div
        aria-hidden
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="pointer-events-none fixed -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-yellow-400/10 blur-[120px] z-0"
      />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none fixed -bottom-32 -right-32 w-[380px] h-[380px] rounded-full bg-yellow-300/10 blur-[120px] z-0"
      />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-start justify-center px-4 py-6 sm:py-10 overflow-x-clip">
        <div className="w-full max-w-6xl mx-auto">

          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto mb-8"
          >
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

            {showCountdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-5 flex justify-center gap-2 flex-wrap mb-2"
              >
                {(Object.entries(timeLeft) as [string, number][]).map(([label, value]) => (
                  <motion.div
                    key={label}
                    whileHover={{ y: -4, scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="min-w-[66px] rounded-2xl border border-yellow-400/20 bg-black/50 px-3 py-2.5 shadow-lg backdrop-blur-md"
                  >
                    <div className="text-xl md:text-2xl font-black text-yellow-300">{value}</div>
                    <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">
                      {label === "d" ? "Días" : label === "h" ? "Horas" : label === "m" ? "Min" : "Seg"}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {instagramUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4"
              >
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-300 backdrop-blur-sm hover:border-yellow-400/40 hover:text-white transition"
                >
                  Instagram
                </a>
              </motion.div>
            )}
          </motion.div>

          {/* NAV TABS */}
          <div className="sticky top-3 z-40 mb-8 flex justify-center sm:static sm:z-auto sm:mb-10">
            <div
              className="relative grid w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/85 p-1 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              style={{ gridTemplateColumns: `repeat(${SECTIONS.length}, minmax(0, 1fr))` }}
            >
              <motion.div
                layoutId="toggle-pill"
                className="absolute top-1 bottom-1 left-1 rounded-xl bg-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.18)]"
                style={{ width: `calc((100% - 8px) / ${SECTIONS.length})` }}
                animate={{ x: `${activeIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              {SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`relative z-10 rounded-lg px-1 py-2 text-[9px] font-black transition-colors duration-200 sm:px-1.5 sm:text-[11px] ${
                    section === item.id ? "text-black" : "text-gray-400 hover:text-yellow-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="w-full overflow-x-clip">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                {section === "inicio" && (
                  <>
                    <LeagueHero
                      featuredEvent={league.featuredEvent}
                      latestCompletedEvent={league.latestCompletedEvent}
                      capacity={league.capacity}
                      slogan={league.config?.brandSlogan ?? "Vamo' a prender la plaza"}
                    />
                    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                      <CompactRanking ranking={ranking} />
                      <LatestResults latestCompletedEvent={league.latestCompletedEvent} />
                    </div>
                    <EventTimeline events={events} />
                  </>
                )}
                {section === "ranking" && (
                  <CompactRanking ranking={ranking} limit={ranking.length || 20} />
                )}
                {section === "fechas" && (
                  <EventTimeline events={events} />
                )}
                {section === "batallas" && (
                  <BattleArchive battles={battles} events={events} />
                )}
                {section === "inscripcion" && (
                  <RegistrationCard
                    activeEvent={league.activeEvent}
                    capacity={league.capacity}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FOOTER */}
          <footer className="pb-6 pt-10 px-4 text-center">
            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">
              Pila de Ra' &middot; Freestyle RD
            </p>
          </footer>

        </div>
      </div>
    </main>
  );
}
