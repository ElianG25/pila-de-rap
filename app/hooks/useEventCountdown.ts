"use client";

import { useEffect, useState } from "react";
import type { LeagueEvent } from "@/lib/domain/league/types";

export type Countdown = { d: number; h: number; m: number; s: number };
const ZERO: Countdown = { d: 0, h: 0, m: 0, s: 0 };

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

/** Cuenta regresiva hacia un evento; { 0,0,0,0 } si no aplica (finalizado, en vivo, futura o sin fecha). */
export function useEventCountdown(event: LeagueEvent | null | undefined): Countdown {
  const [timeLeft, setTimeLeft] = useState<Countdown>(ZERO);

  useEffect(() => {
    const reset = () => setTimeLeft(ZERO);
    if (!event || event.estado === "finalizada" || event.estado === "en_vivo" || event.estado === "futura") {
      const raf = requestAnimationFrame(reset);
      return () => cancelAnimationFrame(raf);
    }
    const target = parseEventDate(event.fechaEvento, event.horaEvento);
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
  }, [event]);

  return timeLeft;
}
