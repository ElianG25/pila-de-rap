import type { EventStatus } from "@/lib/domain/league/types";

type EventStatusBadgeProps = {
  status: EventStatus | string;
};

const STATUS_LABELS: Record<string, string> = {
  futura: "Por anunciar",
  anunciada: "Anunciada",
  inscripciones: "Inscripciones abiertas",
  en_vivo: "En vivo",
  finalizada: "Finalizada",
  oculta: "Oculta"
};

const STATUS_STYLES: Record<string, string> = {
  futura: "border-zinc-700 bg-zinc-900/80 text-zinc-300",
  anunciada: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  inscripciones: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  en_vivo: "border-red-500/50 bg-red-500/15 text-red-100",
  finalizada: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  oculta: "border-zinc-800 bg-zinc-950 text-zinc-500"
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const normalizedStatus = status || "futura";

  return (
    <span
      className={`font-display inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
        STATUS_STYLES[normalizedStatus] || STATUS_STYLES.futura
      }`}
    >
      {STATUS_LABELS[normalizedStatus] || normalizedStatus}
    </span>
  );
}
