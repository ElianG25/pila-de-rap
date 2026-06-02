"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  TOTAL_MCS,
  type Battle,
  type EventConfig,
  type EventPhase,
  type LeagueEvent,
  type Mc,
  type RankingMC,
  type View,
} from "./lib/landing/types";

import {
  cardBase,
  eyebrow,
  fadeUp,
  goldSoftCard,
  mutedEyebrow,
  sectionDescription,
  sectionDivider,
  sectionGlow,
  sectionTitle,
  softCard,
  statCard,
} from "./lib/landing/styles";

import {
  getRankingStatusClass,
  getYoutubeThumbnailUrl,
  isTruthyConfig,
} from "./lib/landing/helpers";

import RegisterModal from "./components/landing/RegisterModal";

import SuccessToast from "./components/landing/SuccessToast";
import Footer from "./components/landing/Footer";
import RankingView from "./components/landing/RankingView";
import EventView from "./components/landing/EventView";
import McsView from "./components/landing/McsView";
import BattlesView from "./components/landing/BattlesView";
import HeroHeader from "./components/landing/HeroHeader";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<View>("evento");

  const [timeLeft, setTimeLeft] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  const jueces = [
    { nombre: "H-OFER", ig: "mchoferrap" },
    { nombre: "ZTYL3", ig: "elianstyle_" },
    { nombre: "JAVIER", ig: "javierreynoso20" },
  ];

  const [open, setOpen] = useState(false);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const [slots, setSlots] = useState<number | null>(null);

  // 🔥 MCs
  const [mcs, setMcs] = useState<Mc[]>([]);

  const [serverOffset, setServerOffset] = useState(0);
  const [nextRevealAt, setNextRevealAt] = useState<number | null>(null);
  const [sseConnected, setSseConnected] = useState(false);

  const [eventPhase, setEventPhase] =
    useState<EventPhase>("pre_event");

  const [eventConfig, setEventConfig] = useState<EventConfig>({
    registrationOpen: true,
    currentRound: "Inscripciones",
    youtubeLiveUrl: "",
    eventDate: "2026-05-30T15:00:00-04:00",
    eventLabel: "FECHA 1 | 30 de mayo",
    activeEventLabel: "FECHA 1",
    champion: "",
    runnerUp: "",
    eventSummary: "",
    nextEventLabel: "",
    nextEventDate: "",
    showRanking: true,
    showBattles: true,
    showRoster: true,
  });

  // ✅ Derivados
  const isFull = slots !== null && slots <= 0;
  const isPreEvent = eventPhase === "pre_event";
  const isLiveEvent = eventPhase === "live_event";
  const isPostEvent = eventPhase === "post_event";

  const canRegister =
    isPreEvent &&
    eventConfig.registrationOpen &&
    !isFull;

  const [ranking, setRanking] = useState<RankingMC[]>([]);

  const [battles, setBattles] = useState<Battle[]>([]);
  const [events, setEvents] = useState<LeagueEvent[]>([]);
  const [battleFilter, setBattleFilter] = useState<
    "todas" | "publicada" | "pendiente" | "en_vivo"
  >("todas");

  const [battleDateFilter, setBattleDateFilter] = useState("todas");
  const [battleRoundFilter, setBattleRoundFilter] = useState("todas");

  const battleDates = useMemo(
    () =>
      Array.from(
        new Set(battles.map((battle) => battle.fecha).filter(Boolean))
      ),
    [battles]
  );

  const battleRounds = useMemo(
    () =>
      Array.from(
        new Set(battles.map((battle) => battle.ronda).filter(Boolean))
      ),
    [battles]
  );

  const visibleBattles = useMemo(() => {
    return battles.filter((battle) => {
      const status = battle.estado?.toLowerCase();

      if (status === "oculta") return false;

      if (battleDateFilter !== "todas" && battle.fecha !== battleDateFilter) {
        return false;
      }

      if (battleRoundFilter !== "todas" && battle.ronda !== battleRoundFilter) {
        return false;
      }

      if (battleFilter === "todas") return true;

      return status === battleFilter;
    });
  }, [battles, battleDateFilter, battleRoundFilter, battleFilter]);

  const battlesByDate = useMemo(() => {
    return visibleBattles.reduce<Record<string, Battle[]>>((groups, battle) => {
      const key = battle.fecha || eventConfig.eventLabel;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(battle);

      return groups;
    }, {});
  }, [visibleBattles, eventConfig.eventLabel]);

  const publishedBattlesCount = useMemo(
    () =>
      battles.filter(
        (battle) =>
          battle.estado?.toLowerCase() === "publicada" &&
          battle.youtubeUrl
      ).length,
    [battles]
  );

  const visibleBattlesCount = useMemo(
    () =>
      battles.filter(
        (battle) => battle.estado?.toLowerCase() !== "oculta"
      ).length,
    [battles]
  );

  // 🔁 Persistencia de vista (MEJORADO)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("view");
    if (
      saved === "evento" ||
      saved === "mcs" ||
      saved === "ranking" ||
      saved === "batallas"
    ) {
      setView(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("view", view);
  }, [view]);

  useEffect(() => {
    if (view === "mcs" && !eventConfig.showRoster) {
      setView("evento");
    }

    if (view === "ranking" && !eventConfig.showRanking) {
      setView("evento");
    }

    if (view === "batallas" && !eventConfig.showBattles) {
      setView("evento");
    }
  }, [
    view,
    eventConfig.showRoster,
    eventConfig.showRanking,
    eventConfig.showBattles,
  ]);

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

      const config = data.config;

      setEventPhase(
        config?.phase === "live_event" || config?.phase === "post_event"
          ? config.phase
          : "pre_event"
      );

      setEventConfig({
        registrationOpen: isTruthyConfig(config?.registrationOpen),
        currentRound: config?.currentRound || "Inscripciones",
        youtubeLiveUrl: config?.youtubeLiveUrl || "",
        eventDate: config?.eventDate || "2026-05-30T15:00:00-04:00",
        eventLabel: config?.eventLabel || "FECHA 1 | 30 de mayo",
        activeEventLabel: config?.activeEventLabel || config?.eventLabel || "FECHA 1",
        champion: config?.champion || "",
        runnerUp: config?.runnerUp || "",
        eventSummary: config?.eventSummary || "",
        nextEventLabel: config?.nextEventLabel || "",
        nextEventDate: config?.nextEventDate || "",
        showRanking: isTruthyConfig(config?.showRanking ?? "true"),
        showBattles: isTruthyConfig(config?.showBattles ?? "true"),
        showRoster: isTruthyConfig(config?.showRoster ?? "true"),
      });

      // ✅ MCs
      setMcs(Array.isArray(data.data) ? data.data : []);

      setRanking(
        Array.isArray(data.ranking)
          ? [...data.ranking].sort((a: RankingMC, b: RankingMC) => {
            if (b.puntosLiga !== a.puntosLiga) {
              return b.puntosLiga - a.puntosLiga;
            }

            if (b.victorias !== a.victorias) {
              return b.victorias - a.victorias;
            }

            if (b.puntosBatalla !== a.puntosBatalla) {
              return b.puntosBatalla - a.puntosBatalla;
            }

            return a.derrotas - b.derrotas;
          })
          : []
      );

      setBattles(
        Array.isArray(data.battles)
          ? data.battles
          : []
      );

      setEvents(Array.isArray(data.events) ? data.events : []);

      if (typeof data.serverTime === "number") {
        setServerOffset(data.serverTime - Date.now());
      }

      setNextRevealAt(
        typeof data.nextRevealAt === "number" ? data.nextRevealAt : null
      );

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
      setRanking([]);
      setBattles([]);
      setEvents([]);
      setSlots(null);
    }
  }, []);

  // 🔁 Carga inicial + refresco periódico para que se revelen sin recargar la página
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      await fetchData();
      if (mounted) setLoading(false);
    };

    load();

    const interval = setInterval(fetchData, 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  // 🔴 Tiempo real vía Server-Sent Events: sincroniza reloj, hype y refresca al reveal.
  useEffect(() => {
    if (typeof window === "undefined" || !("EventSource" in window)) return;

    const source = new EventSource("/api/realtime");

    source.addEventListener("open", () => setSseConnected(true));

    source.addEventListener("tick", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data);

        if (typeof payload.serverTime === "number") {
          setServerOffset(payload.serverTime - Date.now());
        }

        setNextRevealAt(
          typeof payload.nextRevealAt === "number" ? payload.nextRevealAt : null
        );

        if (typeof payload.nextRevealAt === "number") {
          const diff = payload.nextRevealAt - payload.serverTime;
          if (diff <= 1500) fetchData();
        }
      } catch (error) {
        console.error("Realtime payload inválido:", error);
      }
    });

    source.addEventListener("error", () => {
      setSseConnected(false);
    });

    return () => {
      source.close();
      setSseConnected(false);
    };
  }, [fetchData]);

  // ⏳ Próxima revelación
  useEffect(() => {
    const updateNextReveal = () => {
      const visibleNow = mcs.filter((mc) => mc.visible).length;
      const rosterComplete = visibleNow >= TOTAL_MCS;

      if (rosterComplete) {
        setNextReveal({ h: 0, m: 0, s: 0 });
        return;
      }

      const diff = Math.max(0, getNextRevealDate().getTime() - syncedNow());

      setNextReveal({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });

      if (diff <= 1000) {
        fetchData();
      }
    };

    updateNextReveal();

    const interval = setInterval(updateNextReveal, 1000);

    return () => clearInterval(interval);
  }, [fetchData, getNextRevealDate, syncedNow, mcs]);

  // ⏳ Countdown evento
  useEffect(() => {
    if (!eventConfig.eventDate || !isPreEvent) {
      setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      return;
    }

    const targetDate = new Date(eventConfig.eventDate);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [eventConfig.eventDate, isPreEvent]);

  const visibleMcs = useMemo(() => mcs.filter((mc) => mc.visible), [mcs]);
  const revealedCount = visibleMcs.length;
  const rosterTotal = Math.max(mcs.length || TOTAL_MCS, TOTAL_MCS);
  const isRosterComplete = revealedCount >= TOTAL_MCS;

  const revealPercent = Math.min(
    100,
    Math.round((revealedCount / rosterTotal) * 100)
  );

  const lastVisibleMc = visibleMcs[visibleMcs.length - 1];
  const previousVisibleMc = visibleMcs[visibleMcs.length - 2];

  const podium = ranking.slice(0, 3);

  const championAlias =
    eventConfig.champion || podium[0]?.alias || "";

  const runnerUpAlias =
    eventConfig.runnerUp || podium[1]?.alias || "";

  const tabs = [
    { key: "evento", label: "📅 Evento", visible: true },
    { key: "mcs", label: "🎤 MCs", visible: eventConfig.showRoster },
    { key: "ranking", label: "🏆 Rank", visible: eventConfig.showRanking },
    { key: "batallas", label: "⚔️ Videos", visible: eventConfig.showBattles },
  ] as const;

  const visibleTabs = tabs.filter((tab) => tab.visible);
  const activeTabIndex = Math.max(
    0,
    visibleTabs.findIndex((tab) => tab.key === view)
  );

  const thirdPlaceAlias =
    podium[2]?.alias || "";

  const heroBadge = isLiveEvent
    ? "Evento en vivo"
    : isPostEvent
      ? "Fecha finalizada"
      : canRegister
        ? "Inscripciones abiertas"
        : "Próxima fecha";

  const heroTitle = isLiveEvent
    ? "La plaza está encendida"
    : isPostEvent
      ? "Resultados oficiales"
      : "Pila de Ra'";

  const heroSubtitle = isLiveEvent
    ? `Estamos en ${eventConfig.currentRound}. Sigue el ranking y las batallas oficiales.`
    : isPostEvent
      ? `Consulta los resultados de ${eventConfig.eventLabel}, ranking y batallas publicadas.`
      : canRegister
        ? "Inscríbete y forma parte de la próxima jornada de freestyle."
        : eventConfig.nextEventLabel
          ? `Próxima jornada: ${eventConfig.nextEventLabel}.`
          : "La liga sigue activa. Mantente atento a las próximas fechas.";

  const shareLineup = useCallback(async () => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://pila-de-rap.vercel.app";

    const pageUrl = baseUrl;
    const imageUrl = `${baseUrl}/api/share`;
    const text = isRosterComplete
      ? `🔥 Pila de Ra': lineup oficial completo. ${eventConfig.eventLabel}, 3:00 PM RD.`
      : `🔥 Pila de Ra': ${revealedCount}/32 MCs revelados. ${eventConfig.eventLabel}, 3:00 PM RD.`;

    try {
      const imageResponse = await fetch(imageUrl, { cache: "no-store" });

      if (!imageResponse.ok) {
        throw new Error("No se pudo generar la imagen para compartir");
      }

      const contentType = imageResponse.headers.get("content-type") || "";

      if (!contentType.includes("image")) {
        throw new Error("La respuesta no es una imagen válida");
      }

      const blob = await imageResponse.blob();
      const file = new File([blob], "pila-de-rap-lineup.png", {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: isRosterComplete
            ? "Pila de Ra' - Lineup completo"
            : "Pila de Ra' - MCs revelados",
          text,
          files: [file],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: isRosterComplete
            ? "Pila de Ra' - Lineup completo"
            : "Pila de Ra' - MCs revelados",
          text,
          url: imageUrl,
        });
        return;
      }

      window.open(imageUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("No se pudo compartir:", error);

      try {
        await navigator.clipboard.writeText(`${text} ${pageUrl}`);
        alert("No se pudo abrir el menú de compartir, pero copiamos el link 🔥");
      } catch {
        window.open(pageUrl, "_blank", "noopener,noreferrer");
      }
    }
  }, [revealedCount, eventConfig.eventLabel, isRosterComplete]);

  // 🔥 Skeleton loading elegante
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
            />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded-full bg-yellow-400/10 animate-pulse" />
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
            CARGANDO PILA DE RA'
          </p>
        </div>
      </div>
    );
  }

  return (

    <main className="relative min-h-[100svh] overflow-x-clip bg-black text-white touch-pan-y">

      {/* 🎥 VIDEO BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden z-0">

        {/* VIDEO */}
        <iframe
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
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
          src="https://www.youtube.com/embed/jw-aW3a7pSM?autoplay=1&mute=1&loop=1&playlist=jw-aW3a7pSM&controls=0&modestbranding=1"
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
      bg-yellow-400/10
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
      bg-yellow-300/10
      blur-[120px]
      z-10
    "
      />

      {/* 🔥 MAIN CONTENT */}
      <div className="relative z-20 min-h-screen flex items-start justify-center px-4 py-6 sm:items-center sm:py-10 overflow-x-clip">

        {/* WIDTH CONTAINER */}
        <div className="w-full max-w-6xl mx-auto">

          {/* 🧠 HERO */}
          <HeroHeader
  heroBadge={heroBadge}
  heroTitle={heroTitle}
  heroSubtitle={heroSubtitle}
  isPreEvent={isPreEvent}
  timeLeft={timeLeft}
/>

          {/* TOGGLE PAGS */}
          <div className="sticky top-3 z-40 mb-8 flex justify-center sm:static sm:z-auto sm:mb-10">
            <div
              className="relative grid w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/85 p-1 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              style={{
                gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))`,
              }}
            >
              <motion.div
                layoutId="toggle-pill"
                className="absolute top-1 bottom-1 left-1 rounded-xl bg-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.18)]"
                style={{
                  width: `calc((100% - 8px) / ${visibleTabs.length})`,
                }}
                animate={{
                  x: `${activeTabIndex * 100}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />

              {visibleTabs.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={`relative z-10 rounded-lg px-1 py-2 text-[9px] font-black transition-colors duration-200 sm:px-1.5 sm:text-sm
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
          <div className="w-full max-w-xl mx-auto overflow-x-clip">

            <AnimatePresence mode="wait">

              {view === "evento" && (
                <EventView
                  jueces={jueces}
                  events={events}
                  eventConfig={eventConfig}
                  eventPhase={eventPhase}
                  canRegister={canRegister}
                  isFull={isFull}
                  isPreEvent={isPreEvent}
                  isLiveEvent={isLiveEvent}
                  isPostEvent={isPostEvent}
                  slots={slots}
                  revealedCount={revealedCount}
                  rosterTotal={rosterTotal}
                  championAlias={championAlias}
                  runnerUpAlias={runnerUpAlias}
                  thirdPlaceAlias={thirdPlaceAlias}
                  setOpen={setOpen}
                  setView={setView}
                />
              )}

            </AnimatePresence>

          </div>

          {view === "mcs" && (
            <McsView
              mcs={mcs}
              revealedCount={revealedCount}
              rosterTotal={rosterTotal}
              revealPercent={revealPercent}
              isPreEvent={isPreEvent}
              isLiveEvent={isLiveEvent}
              isPostEvent={isPostEvent}
              isRosterComplete={isRosterComplete}
              canRegister={canRegister}
              sseConnected={sseConnected}
              nextReveal={nextReveal}
              lastVisibleMc={lastVisibleMc}
              previousVisibleMc={previousVisibleMc}
              eventLabel={eventConfig.eventLabel}
              shareLineup={shareLineup}
            />
          )}

          {view === "ranking" && <RankingView ranking={ranking} />}

          {view === "batallas" && (
            <BattlesView
              battles={battles}
              visibleBattles={visibleBattles}
              battlesByDate={battlesByDate}
              battleDates={battleDates}
              battleRounds={battleRounds}
              battleFilter={battleFilter}
              battleDateFilter={battleDateFilter}
              battleRoundFilter={battleRoundFilter}
              visibleBattlesCount={visibleBattlesCount}
              publishedBattlesCount={publishedBattlesCount}
              setBattleFilter={setBattleFilter}
              setBattleDateFilter={setBattleDateFilter}
              setBattleRoundFilter={setBattleRoundFilter}
            />
          )}

          {/* FOOTER */}
          <Footer />

          {/* Modal */}
          <RegisterModal
            open={open}
            canRegister={canRegister}
            isPreEvent={isPreEvent}
            slots={slots}
            sending={sending}
            eventConfig={eventConfig}
            onClose={() => setOpen(false)}
            setSending={setSending}
            onSuccess={(restantes) => {
              if (typeof restantes === "number") {
                setSlots(restantes);
              }

              setOpen(false);
              setSuccess(true);
              setTimeout(() => setSuccess(false), 5000);
            }}
          />

          {/* ✅ TOAST */}
          <SuccessToast show={success} />
        </div>
      </div>

    </main >
  );
}