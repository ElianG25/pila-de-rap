"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LeagueEvent } from "@/app/lib/league/types";

type RegistrationCardProps = {
  activeEvent: LeagueEvent | null;
  capacity: { total: number; restantes: number; max: number };
};
type FormState = { nombre: string; alias: string; telefono: string; instagram: string };
const blank: FormState = { nombre: "", alias: "", telefono: "", instagram: "" };

const ERR_MAP: Record<string, string> = {
  NO_ACTIVE_EVENT:       "No hay una fecha activa para inscribirse.",
  INSCRIPCIONES_CERRADAS:"Las inscripciones no están abiertas.",
  CAMPOS_INCOMPLETOS:    "Completa nombre, AKA y teléfono.",
  TELEFONO_INVALIDO:     "El teléfono debe tener 10 dígitos.",
  CUPOS_AGOTADOS:        "Los cupos están agotados.",
  YA_INSCRITO:           "Ese teléfono ya está inscrito para esta fecha.",
  HOJA_NO_EXISTE:        "No se encontró la hoja de inscripciones.",
  RATE_LIMITED:          "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
};

export function RegistrationCard({ activeEvent, capacity }: RegistrationCardProps) {
  const [form,    setForm]    = useState<FormState>(blank);
  const [hp,      setHp]      = useState(""); // honeypot anti-spam (debe quedar vacío)
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isOpen = Boolean(activeEvent?.inscripcionesAbiertas);
  const pct    = capacity.max > 0 ? Math.min(100, Math.round((capacity.total / capacity.max) * 100)) : 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res  = await fetch("/api/league", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: hp, eventId: activeEvent?.eventId ?? "" }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setMessage(ERR_MAP[data.error] ?? "No se pudo completar la inscripción.");
        return;
      }
      setStatus("success");
      setMessage("Inscripción recibida. Te esperamos en la plaza.");
      setForm(blank);
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Inténtalo nuevamente.");
    }
  }

  const inputClass = `w-full border-b border-white/[0.1] bg-transparent py-3 text-sm font-bold text-white
    outline-none placeholder:text-zinc-600 focus:border-yellow-400/50 transition-colors
    disabled:opacity-40`;

  return (
    <section className="arena-card p-5 sm:p-8">

      {/* Header */}
      <div className="mb-8 border-b border-white/[0.05] pb-5">
        <p className="kicker text-[10px] text-yellow-400 mb-1">
          Inscripción
        </p>
        <h2 className="section-title text-4xl text-white">
          {isOpen ? "Asegura tu cupo" : "Inscripciones cerradas"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {isOpen
            ? `Cupos disponibles para ${activeEvent?.titulo || "la próxima fecha"}.`
            : "Cuando la próxima fecha abra inscripciones, el formulario estará activo aquí."}
        </p>
      </div>

      {/* Capacity bar */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.28em] text-zinc-600 mb-1">Cupos</p>
          <p className="text-4xl font-mono font-extrabold tabular-nums text-white leading-none">
            {capacity.total}
            <span className="text-xl text-zinc-600">/{capacity.max}</span>
          </p>
        </div>
        <div className="flex-1 max-w-48">
          <p className="text-right text-xs font-bold text-yellow-300 mb-1.5">
            {capacity.restantes} disponibles
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full bg-yellow-400"
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot anti-spam: oculto a humanos, los bots lo rellenan */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />
        {([
          { key: "nombre",    placeholder: "Nombre completo",       type: "text"    },
          { key: "alias",     placeholder: "AKA / Nombre artístico", type: "text"    },
          { key: "telefono",  placeholder: "Teléfono (10 dígitos)",  type: "tel"     },
          { key: "instagram", placeholder: "Instagram (opcional)",   type: "text"    },
        ] as const).map(({ key, placeholder, type }) => (
          <div key={key} className="relative">
            <input
              value={form[key]}
              type={type}
              placeholder={placeholder}
              inputMode={key === "telefono" ? "numeric" : undefined}
              onChange={(e) => {
                const val = key === "telefono"
                  ? e.target.value.replace(/\D/g, "").slice(0, 10)
                  : e.target.value;
                setForm((c) => ({ ...c, [key]: val }));
              }}
              disabled={!isOpen || status === "loading"}
              className={inputClass}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={!isOpen || status === "loading"}
          className="relative w-full overflow-hidden btn-gold rounded-xl py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
              />
              Enviando...
            </span>
          ) : "Inscribirme"}
        </button>
      </form>

      {/* Feedback */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="status" aria-live="polite"
            className={`mt-5 rounded-xl border px-4 py-3 text-sm font-bold ${
              status === "success"
                ? "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-300"
                : "border-yellow-400/25 bg-yellow-400/[0.07] text-yellow-200"
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
