"use client";

import { useEffect, useState } from "react";

/** Posición de scroll para el efecto parallax del fondo; no se trackea si `enabled` es falso. */
export function useParallaxScrollY(enabled: boolean): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return scrollY;
}
