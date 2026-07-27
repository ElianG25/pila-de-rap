"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePushSubscription } from "@/app/hooks/usePushSubscription";

const DISMISSED_KEY = "pdr-notif-banner-dismissed";
const DISMISS_EVENT = "pdr-notif-banner-dismiss";

function subscribeDismissed(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(DISMISS_EVENT, callback);
  return () => window.removeEventListener(DISMISS_EVENT, callback);
}

function getDismissedSnapshot(): boolean {
  return window.localStorage.getItem(DISMISSED_KEY) === "1";
}

function dismissBanner() {
  window.localStorage.setItem(DISMISSED_KEY, "1");
  window.dispatchEvent(new Event(DISMISS_EVENT));
}

/**
 * Banner dismisseable que invita a activar notificaciones — en PC, Android
 * y iOS ya instalado muestra el botón directo; en iOS sin instalar (donde
 * el botón fallaría en silencio) muestra las instrucciones en su lugar. Es
 * el aviso principal: no depende de que alguien note la campanita del top
 * bar. Se oculta solo si ya está suscrito o el usuario lo cerró.
 */
export function NotificationBanner() {
  const { status, isSubscribed, busy, subscribe } = usePushSubscription();
  // En el server no sabemos si ya se cerró antes: arranca oculto hasta hidratar en el cliente.
  const dismissed = useSyncExternalStore(subscribeDismissed, getDismissedSnapshot, () => true);

  const needsIosInstall = status === "ios_needs_install";
  const canSubscribeDirectly = status === "ready" && !isSubscribed;
  const visible = (needsIosInstall || canSubscribeDirectly) && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="arena-card flex items-center gap-4 p-4 sm:p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-xl">
            🔔
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-white">
              No te pierdas nada de la plaza
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {needsIosInstall
                ? "En iPhone: toca Compartir → Agregar a inicio, y abre la app desde ahí para activar los avisos."
                : "Fechas nuevas, videos frescos y movimientos del ranking — directo a tu teléfono."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!needsIosInstall && (
              <button
                type="button"
                onClick={subscribe}
                disabled={busy}
                className="btn-gold whitespace-nowrap rounded-xl px-4 py-2 text-xs disabled:opacity-50"
              >
                {busy ? "..." : "Activar"}
              </button>
            )}
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Cerrar"
              className="rounded-full p-1.5 text-zinc-500 transition hover:text-zinc-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
