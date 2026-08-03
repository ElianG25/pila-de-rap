"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TouchEvent } from "react";
import Image from "next/image";
import type { LeaguePayload, LeagueEvent, RankingItem, Battle, MediaItem } from "@/lib/domain/league/types";
import type { Countdown } from "@/app/hooks/useEventCountdown";
import type { Section } from "@/app/hooks/useSectionRouter";
import { LeagueHero } from "@/app/components/league/LeagueHero";
import { EventTimeline } from "@/app/components/league/EventTimeline";
import { CompactRanking } from "@/app/components/league/CompactRanking";
import { LatestResults } from "@/app/components/league/LatestResults";
import { BattleArchive } from "@/app/components/league/BattleArchive";
import { RegistrationCard } from "@/app/components/league/RegistrationCard";
import { SeasonStats } from "@/app/components/league/SeasonStats";
import { BackgroundLayer } from "@/app/components/home/BackgroundLayer";
import { TypewriterText } from "@/app/components/home/TypewriterText";
import { NavIcon } from "@/app/components/home/NavIcon";
import { NotificationBell } from "@/app/components/notifications/NotificationBell";
import { NotificationBanner } from "@/app/components/notifications/NotificationBanner";

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

function getShowCountdown(ev: LeagueEvent | null): boolean {
  if (!ev) return false;
  if (["finalizada", "en_vivo", "futura"].includes(ev.estado)) return false;
  return Boolean(ev.fechaEvento);
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

type HomeViewProps = {
  league: LeaguePayload;
  section: Section;
  visibleSections: { id: Section; label: string }[];
  activeIndex: number;
  direction: number;
  onNavigate: (to: Section) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  timeLeft: Countdown;
  ranking: RankingItem[];
  events: LeagueEvent[];
  battles: Battle[];
  media: MediaItem[];
  showRanking: boolean;
  reducedMotion: boolean;
  isDesktop: boolean;
  scrollY: number;
  refreshing: boolean;
  bgVideoId: string;
};

/** Vista pura de la home: toma datos ya resueltos por hooks y solo renderiza. */
export function HomeView({
  league, section, visibleSections, activeIndex, direction, onNavigate,
  onTouchStart, onTouchEnd, timeLeft, ranking, events, battles, media, showRanking,
  reducedMotion, isDesktop, scrollY, refreshing, bgVideoId,
}: HomeViewProps) {
  const heroBadge = getHeroBadge(league);
  const slogan = getHeroSlogan(league);
  const instagramUrl = league.config?.instagramUrl ?? "";
  const isLive = league.featuredEvent?.estado === "en_vivo";
  const showCountdown = getShowCountdown(league.featuredEvent);

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

      <BackgroundLayer scrollY={scrollY} reducedMotion={reducedMotion} isDesktop={isDesktop} bgVideoId={bgVideoId} />

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
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-300">Temporada 2026</span>
              </div>
              <NotificationBell />
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
                <button key={s.id} type="button" onClick={() => onNavigate(s.id)}
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
                  <NotificationBanner />
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
              {section === "batallas"    && <BattleArchive battles={battles} events={events} media={media} />}
              {section === "inscripcion" && <RegistrationCard activeEvent={league.activeEvent} capacity={league.capacity} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 text-center">
          <div className="mx-auto mb-4 h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Pila de Ra&apos; · Temporada {new Date().getFullYear()}
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
              <button key={s.id} type="button" onClick={() => onNavigate(s.id)}
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
