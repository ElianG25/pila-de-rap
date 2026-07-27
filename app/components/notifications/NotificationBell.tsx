"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePushSubscription } from "@/app/hooks/usePushSubscription";

function BellIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

/** Campanita en la top bar: activa/desactiva las notificaciones push. En iOS sin instalar, muestra cómo instalarla. */
export function NotificationBell() {
  const { status, isSubscribed, busy, subscribe, unsubscribe } = usePushSubscription();
  const [showIosHint, setShowIosHint] = useState(false);

  if (status === "unsupported") return null;

  if (status === "ios_needs_install") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowIosHint((v) => !v)}
          aria-label="Cómo activar notificaciones en iPhone"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition hover:border-yellow-400/30 hover:text-yellow-400"
        >
          <BellIcon filled={false} />
        </button>
        <AnimatePresence>
          {showIosHint && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 top-11 z-50 w-60 rounded-xl border border-white/[0.1] bg-zinc-950 p-4 text-xs text-zinc-300 shadow-xl"
            >
              <p className="mb-1 font-display font-bold uppercase tracking-wide text-yellow-400">📲 Activa notificaciones</p>
              <p>En iPhone: toca <strong>Compartir</strong> → <strong>Agregar a inicio</strong>, y abre la app desde ahí para poder activarlas.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
      disabled={busy}
      aria-pressed={isSubscribed}
      aria-label={isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
      title={isSubscribed ? "Notificaciones activadas" : "Activar notificaciones"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition disabled:opacity-50 ${
        isSubscribed
          ? "border-yellow-400/40 bg-yellow-400/[0.1] text-yellow-400"
          : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-yellow-400/30 hover:text-yellow-400"
      }`}
    >
      <BellIcon filled={isSubscribed} />
    </button>
  );
}
