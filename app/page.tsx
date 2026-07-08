"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import type { LeaguePayload } from "@/app/lib/league/types";
import { fetchLeague } from "@/app/lib/league/api";
import {
  getPublicEvents,
  getPublishedBattles,
  isSectionEnabled,
  sortRanking,
} from "@/app/lib/league/helpers";
import { LeagueHero }        from "@/app/components/league/LeagueHero";
import { EventTimeline }     from "@/app/components/league/EventTimeline";
import { CompactRanking }    from "@/app/components/league/CompactRanking";
import { LatestResults }     from "@/app/components/league/LatestResults";
import { BattleArchive }     from "@/app/components/league/BattleArchive";
import { RegistrationCard }  from "@/app/components/league/RegistrationCard";
import { SeasonStats }       from "@/app/components/league/SeasonStats";

type Section = "inicio" | "ranking" | "fechas" | "batallas" | "inscripcion";
const SECTION_ORDER: Section[] = ["inicio","ranking","fechas","batallas","inscripcion"];
const SECTIONS: { id: Section; label: string }[] = [
  { id: "inicio",      label: "Inicio"   },
  { id: "ranking",     label: "Ranking"  },
  { id: "fechas",      label: "Fechas"   },
  { id: "batallas",    label: "Batallas" },
  { id: "inscripcion", label: "Unirse"   },
];
const BG_VIDEO_ID = "jw-aW3a7pSM";

/** Qué flag de la hoja Config apaga cada sección (además de "inicio"/"inscripcion", siempre visibles). */
const SECTION_CONFIG_FLAG: Partial<Record<Section, string>> = {
  ranking: "showRanking",
  fechas: "showEvents",
  batallas: "showBattles",
};

function getVisibleSections(config: Record<string, string> | undefined) {
  return SECTIONS.filter((s) => {
    const flag = SECTION_CONFIG_FLAG[s.id];
    return !flag || isSectionEnabled(config, flag);
  });
}

function parseEventDate(fechaEvento: string, horaEvento: string): Date | null {
  if (!fechaEvento) return null;
  try {
    const base = fechaEvento.includes("T") ? fechaEvento : fechaEvento + "T00:00:00";
    const d = new Date(base);
    if (isNaN(d.getTime())) return null;
    if (horaEvento && /^\d{1,2}:\d{2}/.test(horaEvento)) {
      const [h, m] = horaEvento.split(":").map(Number);
      d.setHours(h, m, 0, 0);
    }
    return d;
  } catch { return null; }
}

function getHeroBadge(league: LeaguePayload): string {
  const ev = league.featuredEvent;
  if (!ev) return "Próxima fecha";
  if (ev.estado === "en_vivo")       return "En vivo ahora";
  if (ev.estado === "finalizada")    return "Fecha finalizada";
  if (ev.estado === "inscripciones") return "Inscripciones abiertas";
  if (ev.estado === "anunciada")     return ev.titulo || "Fecha confirmada";
  return "Próxima fecha";
}

function getHeroSlogan(league: LeaguePayload): string {
  return league.config?.brandSlogan || "Vamo' a prender la plaza";
}

/** Leer seccion inicial desde URL: ?s=ranking */
function getInitialSection(): Section {
  if (typeof window === "undefined") return "inicio";
  const s = new URLSearchParams(window.location.search).get("s");
  return (SECTION_ORDER.includes(s as Section) ? s : "inicio") as Section;
}

function NavIcon({ id }: { id: Section }) {
  const cls = "h-5 w-5";
  if (id === "inicio") return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
    </svg>
  );
  if (id === "ranking") return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
  if (id === "fechas") return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
  if (id === "batallas") return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
    </svg>
  );
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  );
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: delay + i * 0.038 }}
          style={{ display: "inline-block" }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </>
  );
}

/** prefers-reduced-motion sin setState dentro de un efecto (evita renders en cascada) */
const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getReducedMotionSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(RM_QUERY).matches;
}
function useReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);
}

/** Solo cargamos el video de fondo en pantallas grandes (datos/batería en móvil). */
const DESKTOP_QUERY = "(min-width: 768px)";
function subscribeDesktop(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getDesktopSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;
}
function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => false);
}

const pageVariants = {
  enter:  (dir: number) => ({ x: dir >= 0 ?  56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir >= 0 ? -56 :  56, opacity: 0 }),
};
const pageTrans = {
  duration: 0.26,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export default function Home() {
  const [league,     setLeague]     = useState<LeaguePayload | null>(null);
  const [section,    setSection]    = useState<Section>(getInitialSection);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [direction,  setDirection]  = useState(0);
  const [timeLeft,   setTimeLeft]   = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY, setScrollY]       = useState(0);
  const touchStartX = useRef(0);

  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();

  // Parallax scroll
  useEffect(() => {
    if (reducedMotion) return;
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  useEffect(() => {
    let mounted = true;
    fetchLeague()
      .then((data) => { if (mounted) { setLeague(data); setLoading(false); } })
      .catch((err)  => { if (mounted) { setError(err instanceof Error ? err.message : "Error desconocido"); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (loading || error) return;
    const isLive = league?.featuredEvent?.estado === "en_vivo";
    const ms = isLive ? 30_000 : 120_000;
    const id = setInterval(async () => {
      setRefreshing(true);
      try { const data = await fetchLeague(); setLeague(data); }
      catch { /* silent */ }
      finally { setRefreshing(false); }
    }, ms);
    return () => clearInterval(id);
  }, [loading, error, league?.featuredEvent?.estado]);

  // Countdown
  useEffect(() => {
    if (!league) return;
    const ev = league.featuredEvent;
    const reset = () => setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
    if (!ev || ev.estado === "finalizada" || ev.estado === "en_vivo" || ev.estado === "futura") {
      const raf = requestAnimationFrame(reset);
      return () => cancelAnimationFrame(raf);
    }
    const target = parseEventDate(ev.fechaEvento, ev.horaEvento);
    if (!target) {
      const raf = requestAnimationFrame(reset);
      return () => cancelAnimationFrame(raf);
    }
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { reset(); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000)   % 60),
        s: Math.floor((diff / 1000)    % 60),
      });
    };
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => { cancelAnimationFrame(raf); clearInterval(id); };
  }, [league]);

  const ranking = useMemo(() => sortRanking(league?.ranking ?? []),        [league?.ranking]);
  const events  = useMemo(() => getPublicEvents(league?.events ?? []),      [league?.events]);
  const battles = useMemo(() => getPublishedBattles(league?.battles ?? []), [league?.battles]);

  const visibleSections = useMemo(() => getVisibleSections(league?.config), [league?.config]);
  const showRanking = isSectionEnabled(league?.config, "showRanking");

  // Si la sección activa quedó deshabilitada por Config (o venía de un ?s= viejo), vuelve a inicio.
  useEffect(() => {
    if (!league) return;
    if (!visibleSections.some((s) => s.id === section)) setSection("inicio");
  }, [league, visibleSections, section]);

  const bgVideoId    = (league?.config as Record<string, string>)?.backgroundVideoId ?? BG_VIDEO_ID;
  const instagramUrl = league?.config?.instagramUrl ?? "";
  const isLive       = league?.featuredEvent?.estado === "en_vivo";

  const showCountdown = (() => {
    const ev = league?.featuredEvent;
    if (!ev) return false;
    if (["finalizada", "en_vivo", "futura"].includes(ev.estado)) return false;
    return Boolean(ev.fechaEvento);
  })();

  const activeIndex = visibleSections.findIndex((s) => s.id === section);

  function navigate(to: Section) {
    const order   = visibleSections.map((s) => s.id);
    const fromIdx = order.indexOf(section);
    const toIdx   = order.indexOf(to);
    setDirection(toIdx >= fromIdx ? 1 : -1);
    setSection(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Sync URL
    const url = to === "inicio" ? "/" : `/?s=${to}`;
    window.history.replaceState(null, "", url);
  }

  function navigateDir(dir: 1 | -1) {
    const order = visibleSections.map((s) => s.id);
    const cur   = order.indexOf(section);
    const next  = cur + dir;
    if (next >= 0 && next < order.length) {
      navigate(order[next]);
    }
  }

  // Touch swipe handlers
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 55) navigateDir(diff > 0 ? 1 : -1);
  }

  if (loading) {
    return (
      <div className="min-h-[100svh] bg-black px-4 sm:px-6" aria-busy="true" aria-label="Cargando la liga">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between pt-5 pb-2">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Pila de Ra'" width={44} height={44} priority
                className="h-9 w-auto opacity-80 drop-shadow-[0_0_22px_rgba(250,204,21,0.35)]" />
              <div className="space-y-2"><div className="skeleton h-3 w-24" /><div className="skeleton h-2 w-16" /></div>
            </div>
            <div className="skeleton hidden h-7 w-32 rounded-full sm:block" />
          </div>
          <div className="flex flex-col items-center gap-4 py-14">
            <div className="skeleton h-3 w-44 rounded-full" />
            <div className="skeleton h-16 w-64 sm:h-24 sm:w-[28rem]" />
            <div className="skeleton h-7 w-40 rounded-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1].map((i) => <div key={i} className="skeleton h-64" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 px-6">
        <Image src="/logo.png" alt="Pila de Ra'" width={48} height={48} className="h-12 w-auto mb-6 opacity-40" />
        <p className="kicker text-[10px] text-yellow-400 mb-3">Error</p>
        <p className="font-display text-xl font-bold uppercase text-white mb-2">No se pudo cargar</p>
        <p className="text-sm text-zinc-500 mb-8 text-center max-w-xs">{error || "La información de la liga no está disponible."}</p>
        <button onClick={() => window.location.reload()}
          className="btn-gold rounded-xl px-6 py-2.5 text-sm">
          Reintentar
        </button>
      </div>
    );
  }

  const heroBadge = getHeroBadge(league);
  const slogan    = getHeroSlogan(league);

  return (
    <main
      className="relative min-h-[100svh] overflow-x-clip bg-black text-white pb-16 sm:pb-0"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* REFRESH BANNER */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ y: -32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -32, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-yellow-400/90 backdrop-blur-sm py-2 text-[10px] font-display font-semibold uppercase tracking-[0.3em] text-black"
          >
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block h-3 w-3 rounded-full border-2 border-black/30 border-t-black" />
            Actualizando datos
          </motion.div>
        )}
      </AnimatePresence>

      {/* FONDO — póster en móvil; video de YouTube solo en desktop */}
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

      {/* GLOWS */}
      <motion.div aria-hidden animate={{ opacity: [0.12, 0.25, 0.12] }} transition={{ repeat: Infinity, duration: 5 }}
        className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-yellow-400/10 blur-[130px] z-0" />
      <motion.div aria-hidden animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 7, delay: 1 }}
        className="pointer-events-none fixed -bottom-40 -right-40 w-[460px] h-[460px] rounded-full bg-yellow-300/[0.08] blur-[130px] z-0" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col min-h-[100svh]">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

          {/* TOP BAR — barra de liga profesional */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between pt-5 pb-2">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Pila de Ra'" width={44} height={44} priority
                className="h-9 w-auto drop-shadow-[0_0_22px_rgba(250,204,21,0.35)]" />
              <div className="leading-none">
                <p className="font-display text-base font-bold uppercase tracking-[0.06em] text-white leading-none">Pila de Ra&apos;</p>
                <p className="kicker mt-1 text-[8px] text-yellow-400/70">Liga de Freestyle · RD</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <span className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-300">Temporada 2026</span>
            </div>
          </motion.div>

          {/* HERO */}
          <section className="relative pt-8 pb-9 text-center sm:pt-12 sm:pb-12">

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
              className="kicker mb-5 text-[10px] text-yellow-400/60">
              Freestyle · República Dominicana
            </motion.p>

            {/* Wordmark gigante de impacto */}
            <div className="relative overflow-hidden">
              {/* Marca de agua trasera */}
              <span aria-hidden className="font-impact pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-white/[0.03] leading-none"
                style={{ fontSize: "clamp(5rem, 22vw, 16rem)" }}>RD</span>
              <h1 className="font-impact relative z-10 uppercase leading-[0.82] text-white"
                  style={{ fontSize: "clamp(3rem, 13vw, 9rem)", letterSpacing: "0.01em" }}>
                <span className="block"><TypewriterText text="PILA" delay={0.22} /></span>
                <span className="block text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(180deg, #fde047, #d4a306)" }}>
                  <TypewriterText text="DE RA'" delay={0.46} />
                </span>
              </h1>
            </div>

            {/* Línea de marcador bajo el título */}
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-6 h-px w-40 origin-center bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

            {/* EN VIVO / estado */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
              className={`relative mt-6 inline-flex items-center gap-2.5 rounded-full border px-5 py-2 ${
                isLive ? "border-red-500/40 bg-red-500/[0.10]" : "border-yellow-400/25 bg-yellow-400/[0.07]"
              }`}>
              {isLive ? (
                <>
                  <span className="absolute inset-0 rounded-full border border-red-500/40 animate-ping" />
                  <span className="absolute inset-0 rounded-full border border-red-500/20" style={{ animation: "ping 1.8s cubic-bezier(0,0,0.2,1) infinite 0.4s" }} />
                  <motion.span animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                </>
              ) : (
                <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
              )}
              <span className={`font-display text-[11px] font-semibold uppercase tracking-[0.26em] ${isLive ? "text-red-100" : "text-yellow-200"}`}>
                {heroBadge}
              </span>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="font-display mt-4 text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-400">
              {slogan}
            </motion.p>

            {/* Scoreboard countdown */}
            {showCountdown && (
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35 }}
                className="mt-9 flex justify-center gap-2.5 sm:gap-3">
                {(Object.entries(timeLeft) as [string, number][]).map(([k, v]) => (
                  <div key={k} className="arena-card flex w-16 flex-col items-center px-2 py-3 sm:w-20">
                    <span className="font-mono text-2xl font-extrabold tabular-nums text-white sm:text-4xl">{String(v).padStart(2, "0")}</span>
                    <span className="kicker mt-1.5 text-[8px] text-yellow-400/60">
                      {k === "d" ? "días" : k === "h" ? "hrs" : k === "m" ? "min" : "seg"}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {instagramUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-7">
                <a href={instagramUrl} target="_blank" rel="noreferrer"
                  className="font-display inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 hover:text-yellow-400 transition">
                  Instagram <span className="text-yellow-400/60">→</span>
                </a>
              </motion.div>
            )}
          </section>
        </div>

        {/* DESKTOP NAV */}
        <div className="sticky top-0 z-40 hidden sm:block border-y border-white/[0.06] bg-black/90 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative grid" style={{ gridTemplateColumns: `repeat(${visibleSections.length}, 1fr)` }}>
              <motion.div
                className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-[0_0_18px_rgba(250,204,21,0.5)]"
                style={{ width: `calc(100% / ${visibleSections.length})` }}
                animate={{ x: `${activeIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 310, damping: 32 }}
              />
              {visibleSections.map((s) => (
                <button key={s.id} type="button" onClick={() => navigate(s.id)}
                  aria-current={section === s.id ? "page" : undefined}
                  className={`font-display relative z-10 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] transition-colors ${
                    section === s.id ? "text-yellow-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION CONTENT */}
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 overflow-x-clip">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={section} custom={direction} variants={pageVariants}
              initial="enter" animate="center" exit="exit" transition={pageTrans}
              className="space-y-6">
              {section === "inicio" && (
                <>
                  <SeasonStats mcs={ranking.length} batallas={battles.length} fechas={events.length} />
                  <LeagueHero featuredEvent={league.featuredEvent} latestCompletedEvent={league.latestCompletedEvent}
                    capacity={league.capacity} slogan={slogan} />
                  <div className={`grid gap-6 ${showRanking ? "md:grid-cols-2" : ""}`}>
                    {showRanking && <CompactRanking ranking={ranking} />}
                    <LatestResults latestCompletedEvent={league.latestCompletedEvent} />
                  </div>
                </>
              )}
              {section === "ranking"     && <CompactRanking ranking={ranking} limit={ranking.length || 30} variant="full" />}
              {section === "fechas"      && <EventTimeline events={events} />}
              {section === "batallas"    && <BattleArchive battles={battles} events={events} />}
              {section === "inscripcion" && <RegistrationCard activeEvent={league.activeEvent} capacity={league.capacity} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 text-center">
          <div className="mx-auto mb-4 h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Pila de Ra' · Temporada {new Date().getFullYear()}
          </p>
          <p className="mt-2 text-[10px] text-zinc-600">
            Hecho con ❤️ por{" "}
            <a href="https://t.me/Ztyl3" target="_blank" rel="noreferrer"
              className="font-display font-semibold text-zinc-500 hover:text-yellow-400 transition-colors">
              Elian Gomez
            </a>
          </p>
        </footer>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-white/[0.08] bg-black/95 backdrop-blur-xl"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid h-14" style={{ gridTemplateColumns: `repeat(${visibleSections.length}, 1fr)` }}>
          {visibleSections.map((s) => {
            const isActive = section === s.id;
            return (
              <button key={s.id} type="button" onClick={() => navigate(s.id)}
                aria-current={isActive ? "page" : undefined} aria-label={s.label}
                className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-yellow-400" : "text-zinc-600 active:text-zinc-400"
                }`}>
                {isActive && (
                  <motion.div layoutId="bottom-nav-dot"
                    className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-yellow-400"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                )}
                <NavIcon id={s.id} />
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.1em] leading-none">{s.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </main>
  );
}
