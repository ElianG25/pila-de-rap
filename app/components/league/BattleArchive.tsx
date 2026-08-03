"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Battle, LeagueEvent, MediaItem } from "@/lib/domain/league/types";
import { getEventPlaylist } from "@/lib/domain/league/rules";
import { initials } from "@/lib/shared/format";

type BattleArchiveProps = {
  battles: Battle[];
  events: LeagueEvent[];
  media: MediaItem[];
};

function getBattleTitle(battle: Battle) {
  const mcs = [battle.mc1, battle.mc2, battle.mc3, battle.mc4].filter(Boolean);
  return mcs.length ? mcs.join(" vs ") : "Batalla sin MCs";
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s/]+)/);
  return m?.[1] ?? null;
}

/* ─── Reproductor embebido (modal) ─────────────────────────── */
type PlayPayload = { id: string; title: string } | null;

function VideoModal({ video, onClose }: { video: PlayPayload; onClose: () => void }) {
  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [video, onClose]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} role="dialog" aria-modal="true" aria-label={video.title}
        >
          <motion.div
            className="w-full max-w-3xl"
            initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-white truncate">{video.title}</p>
              <button type="button" onClick={onClose} aria-label="Cerrar"
                className="shrink-0 rounded-full border border-white/15 bg-white/[0.06] p-2 text-zinc-300 transition hover:border-yellow-400/40 hover:text-yellow-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Share Modal ─────────────────────────────────────── */
type SharePayload = { url: string; title: string } | null;

function ShareModal({ payload, onClose, onCopied }: {
  payload: SharePayload; onClose: () => void; onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!payload) return null;

  function copyLink() {
    navigator.clipboard.writeText(payload!.url).then(() => {
      setCopied(true); onCopied();
      setTimeout(() => { setCopied(false); onClose(); }, 1400);
    }).catch(() => {
      const inp = document.createElement("input");
      inp.value = payload!.url; document.body.appendChild(inp); inp.select();
      document.execCommand("copy"); document.body.removeChild(inp);
      setCopied(true); onCopied();
      setTimeout(() => { setCopied(false); onClose(); }, 1400);
    });
  }

  const encoded = encodeURIComponent(payload.url);
  const encodedText = encodeURIComponent("Mira esta batalla: " + payload.title + " " + payload.url);

  return (
    <AnimatePresence>
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div key="sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed bottom-0 inset-x-0 z-[60] rounded-t-3xl border-t border-white/[0.10] bg-zinc-950 px-5 pb-10 pt-5"
        style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20" />
        <p className="kicker mb-1 text-[10px] text-yellow-400">Compartir batalla</p>
        <p className="mb-6 text-sm font-bold text-white leading-tight line-clamp-1">{payload.title}</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noreferrer" onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 transition active:bg-white/[0.06]">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#25D366"/><path fillRule="evenodd" clipRule="evenodd" d="M14 5C9.03 5 5 9.03 5 14c0 1.67.46 3.23 1.26 4.57L5 23l4.56-1.23A9 9 0 1 0 14 5Zm-3.2 5.6c.17 0 .36 0 .52.01.2.01.38.06.55.43.2.43.64 1.56.7 1.67.06.12.1.25.02.4-.08.15-.13.24-.25.37-.12.13-.26.29-.37.39-.12.12-.25.25-.11.49.14.24.64 1.05 1.38 1.7.94.83 1.74 1.09 1.99 1.21.24.12.38.1.52-.06.14-.16.59-.69.75-.93.16-.24.32-.2.54-.12.22.08 1.41.67 1.66.79.24.12.4.18.47.28.06.1.06.57-.14 1.12-.2.54-.83 1.02-1.37 1.09-.54.07-1 .1-3.26-.96C9.8 18.09 7.9 15.14 7.76 14.96c-.14-.18-1.13-1.5-1.13-2.87 0-1.36.71-2.03.97-2.3.26-.28.56-.35.75-.35Z" fill="white"/></svg>
            <span className="text-[10px] font-bold text-zinc-300">WhatsApp</span>
          </a>
          <a href={`https://t.me/share/url?url=${encoded}&text=${encodeURIComponent("Mira esta batalla: " + payload.title)}`} target="_blank" rel="noreferrer" onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 transition active:bg-white/[0.06]">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#229ED9"/><path d="M7 13.6s6.3-2.6 8.5-3.5c3-1.3 3.6-.1 3.6-.1S17.9 16 17 18.9c-.6 2-2 2.1-2 2.1s-1.4-1-2.9-2.1c-1.5-1.2.5-2.7.5-2.7l3.3-3.2s-5.4 3.4-6.7 4c-1.3.7-2.2-.4-2.2-.4Z" fill="white"/></svg>
            <span className="text-[10px] font-bold text-zinc-300">Telegram</span>
          </a>
          <button type="button" onClick={copyLink}
            className={`flex flex-col items-center gap-2 rounded-2xl border py-4 transition ${copied ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/[0.08] bg-white/[0.03] active:bg-white/[0.06]"}`}>
            {copied ? (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#10B981"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} stroke="white" d="m8 14 4.5 4.5 7.5-9"/></svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#3F3F46"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} stroke="#E4E4E7" d="M17 7h-6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} stroke="#E4E4E7" d="M11 7V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/></svg>
            )}
            <span className={`text-[10px] font-bold ${copied ? "text-emerald-400" : "text-zinc-300"}`}>{copied ? "Copiado!" : "Copiar"}</span>
          </button>
        </div>
        <button type="button" onClick={onClose} className="w-full rounded-2xl border border-white/[0.06] py-3 text-sm font-bold text-zinc-400 transition active:bg-white/[0.04]">Cancelar</button>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Fila VS de competidores ──────────────────────────── */
function Competitor({ name, winner, align }: { name: string; winner: boolean; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <span className={`mc-avatar shrink-0`} style={{ width: 30, height: 30, fontSize: 12, ...(winner ? { borderColor: "rgba(250,204,21,0.6)" } : {}) }} aria-hidden>
        {initials(name)}
      </span>
      <span className={`truncate font-display text-sm font-bold uppercase tracking-tight ${winner ? "text-yellow-300" : "text-zinc-300"}`}>
        {name}
        {winner && <span className="ml-1 align-middle text-yellow-400">★</span>}
      </span>
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="opacity-20">
        <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1.5" className="text-yellow-400"/>
        <path d="M20 28 L28 20 L36 28 L36 38 L20 38 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-yellow-400"/>
        <circle cx="28" cy="20" r="2" fill="currentColor" className="text-yellow-400"/>
      </svg>
      <div className="text-center">
        <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-zinc-400">Sin batallas aún</p>
        <p className="mt-1 text-xs text-zinc-500">Las batallas aparecerán aquí cuando se publiquen</p>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────── */
export function BattleArchive({ battles, events, media }: BattleArchiveProps) {
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [selectedRonda,   setSelectedRonda]   = useState("all");
  const [onlyVideos, setOnlyVideos]           = useState(false);
  const [copiedId, setCopiedId]               = useState<string | null>(null);
  const [shareModal, setShareModal]           = useState<SharePayload>(null);
  const [playing, setPlaying]                 = useState<PlayPayload>(null);

  const eventLabelById = useMemo(() =>
    events.reduce<Record<string, string>>((acc, e) => {
      acc[e.eventId] = e.titulo || e.label || e.eventId;
      return acc;
    }, {}), [events]);

  const eventPlaylist = useMemo(
    () => (selectedEventId === "all" ? null : getEventPlaylist(media, selectedEventId)),
    [media, selectedEventId]
  );

  const rondas = useMemo(() => {
    const base = selectedEventId === "all" ? battles : battles.filter((b) => b.eventId === selectedEventId);
    return Array.from(new Set(base.map((b) => b.ronda).filter(Boolean))).sort();
  }, [battles, selectedEventId]);

  const visible = useMemo(() =>
    battles.filter((b) => {
      if (selectedEventId !== "all" && b.eventId !== selectedEventId) return false;
      if (selectedRonda   !== "all" && b.ronda   !== selectedRonda)   return false;
      if (onlyVideos && !b.youtubeUrl) return false;
      return true;
    }), [battles, selectedEventId, selectedRonda, onlyVideos]);

  function onShare(battleId: string, title: string, url: string) {
    if (typeof navigator === "undefined") return;
    if (navigator.share) {
      navigator.share({ title: `Batalla: ${title}`, text: title, url })
        .then(() => { setCopiedId(battleId); setTimeout(() => setCopiedId(null), 2000); })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setShareModal({ url, title });
        });
    } else {
      setShareModal({ url, title });
    }
  }

  return (
    <>
      <VideoModal video={playing} onClose={() => setPlaying(null)} />
      <ShareModal payload={shareModal} onClose={() => setShareModal(null)}
        onCopied={() => { const id = shareModal?.url ?? ""; setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }} />

      <section className="arena-card p-5 sm:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/[0.05] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="h-3.5 w-3.5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
              </svg>
              <p className="kicker text-[10px] text-yellow-400">Archivo</p>
            </div>
            <h2 className="section-title text-3xl text-white">Batallas</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <select value={selectedEventId} aria-label="Filtrar por fecha"
              onChange={(e) => { setSelectedEventId(e.target.value); setSelectedRonda("all"); }}
              className="rounded-xl border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs font-display font-semibold text-zinc-300 outline-none focus:border-yellow-400/30">
              <option value="all">Todas las fechas</option>
              {events.map((e) => <option key={e.eventId} value={e.eventId}>{e.titulo}</option>)}
            </select>

            {rondas.length > 1 && (
              <select value={selectedRonda} aria-label="Filtrar por ronda" onChange={(e) => setSelectedRonda(e.target.value)}
                className="rounded-xl border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs font-display font-semibold text-zinc-300 outline-none focus:border-yellow-400/30">
                <option value="all">Todas las rondas</option>
                {rondas.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            )}

            <button type="button" onClick={() => setOnlyVideos((v) => !v)} aria-pressed={onlyVideos}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-display font-bold uppercase tracking-[0.1em] transition ${
                onlyVideos ? "border-yellow-400 bg-yellow-400 text-black" : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-yellow-400/30 hover:text-zinc-200"}`}>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Con video
            </button>
          </div>
        </div>

        {/* Playlist completa del evento seleccionado (si existe) */}
        {eventPlaylist && (
          <a
            href={eventPlaylist.url} target="_blank" rel="noreferrer"
            className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3 transition hover:border-red-500/40 hover:bg-red-500/[0.1]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z"/>
              </svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-display text-xs font-bold uppercase tracking-wide text-white">
                Ver playlist completa
              </span>
              <span className="block truncate text-[11px] text-zinc-500">
                {eventPlaylist.titulo || "Todas las batallas de esta fecha en YouTube"}
              </span>
            </span>
            <span className="shrink-0 text-red-400">→</span>
          </a>
        )}

        {/* Battle grid */}
        {visible.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((battle, i) => {
                const ytUrl    = battle.youtubeUrl ?? "";
                const ytId     = ytUrl ? getYouTubeId(ytUrl) : null;
                const thumb    = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
                const title    = getBattleTitle(battle);
                const battleId = battle.battleId || `${battle.eventId}-${battle.ronda}-${i}`;
                const copied   = copiedId === battleId || copiedId === ytUrl;
                const players  = [battle.mc1, battle.mc2, battle.mc3, battle.mc4].filter(Boolean);
                const isDuel   = players.length === 2;
                const winnerOf = (n: string) => Boolean(battle.ganador) && n.trim().toLowerCase() === battle.ganador.trim().toLowerCase();

                return (
                  <motion.article key={battleId} layout
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.35) }}
                    className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition hover:border-yellow-400/25">

                    {/* Thumbnail */}
                    {thumb ? (
                      <button type="button" onClick={() => ytId && setPlaying({ id: ytId, title })}
                        className="relative block aspect-video w-full overflow-hidden bg-zinc-900" aria-label={`Reproducir ${title}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt={title} loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-95" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20 backdrop-blur-sm transition group-hover:ring-yellow-400/70 group-hover:scale-110">
                            <svg className="h-4 w-4 translate-x-0.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden><path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z"/></svg>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="aspect-video bg-zinc-900 arena-stripes flex items-center justify-center">
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Sin video</p>
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 truncate">
                          {eventLabelById[battle.eventId] || battle.eventId}{battle.ronda ? ` · ${battle.ronda}` : ""}
                        </p>
                        {battle.cuentaParaLiga && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-yellow-400/[0.1] px-2 py-0.5 text-[9px] font-display font-bold uppercase text-yellow-300 border border-yellow-400/20">Liga</span>
                        )}
                      </div>

                      {/* VS / participantes */}
                      {isDuel ? (
                        <div className="mb-3 flex items-center gap-2">
                          <Competitor name={players[0]} winner={winnerOf(players[0])} align="left" />
                          <span className="shrink-0 font-display text-[11px] font-bold italic text-zinc-600">VS</span>
                          <Competitor name={players[1]} winner={winnerOf(players[1])} align="right" />
                        </div>
                      ) : (
                        <div className="mb-3 space-y-1">
                          {players.map((p) => (
                            <Competitor key={p} name={p} winner={winnerOf(p)} align="left" />
                          ))}
                          {players.length === 0 && <p className="text-xs text-zinc-600">Sin MCs</p>}
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-2">
                        {ytId ? (
                          <button type="button" onClick={() => setPlaying({ id: ytId, title })}
                            className="btn-gold flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px]">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden><path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z"/></svg>
                            Ver batalla
                          </button>
                        ) : (
                          <div className="w-full rounded-lg border border-white/[0.06] py-2 text-center font-display text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600">Próximamente</div>
                        )}
                        {ytUrl && (
                          <button type="button" title={copied ? "¡Copiado!" : "Compartir"} aria-label="Compartir batalla"
                            onClick={() => onShare(battleId, title, ytUrl)}
                            className={`flex items-center justify-center rounded-lg border px-3 transition ${copied ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-yellow-400/30 hover:text-yellow-400"}`}>
                            {copied ? (
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684 6.632 3.316m-6.632-6 6.632-3.316m0 0a3 3 0 1 0 5.367-2.684 3 3 0 0 0-5.367 2.684Zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684Z" /></svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </>
  );
}
