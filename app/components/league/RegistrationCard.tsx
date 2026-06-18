"use client";

import { FormEvent, useState } from "react";
import type { LeagueEvent } from "@/app/lib/league/types";

type RegistrationCardProps = {
  activeEvent: LeagueEvent | null;
  capacity: {
    total: number;
    restantes: number;
    max: number;
  };
};

type FormState = {
  nombre: string;
  alias: string;
  telefono: string;
  instagram: string;
};

const initialForm: FormState = { nombre: "", alias: "", telefono: "", instagram: "" };

function getErrorMessage(error: string) {
  const messages: Record<string, string> = {
    NO_ACTIVE_EVENT: "Todavia no hay una fecha activa para inscribirse.",
    INSCRIPCIONES_CERRADAS: "Las inscripciones no estan abiertas en este momento.",
    CAMPOS_INCOMPLETOS: "Completa nombre, AKA y telefono.",
    TELEFONO_INVALIDO: "El telefono debe tener 10 digitos.",
    CUPOS_AGOTADOS: "Los cupos estan agotados.",
    YA_INSCRITO: "Ese telefono ya esta inscrito para esta fecha.",
    HOJA_NO_EXISTE: "No se encontro la hoja de inscripciones."
  };
  return messages[error] || "No se pudo completar la inscripcion.";
}

export function RegistrationCard({ activeEvent, capacity }: RegistrationCardProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isOpen = Boolean(activeEvent?.inscripcionesAbiertas);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/league", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventId: activeEvent?.eventId ?? "" })
      });

      const payload = await response.json();

      if (!payload.ok) {
        setStatus("error");
        setMessage(getErrorMessage(payload.error));
        return;
      }

      setStatus("success");
      setMessage("Inscripcion recibida. Te esperamos en la plaza.");
      setForm(initialForm);
    } catch {
      setStatus("error");
      setMessage("Hubo un error de conexion. Intentalo nuevamente.");
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-400">Inscripcion</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-white">
        {isOpen ? "Asegura tu cupo" : "Inscripciones cerradas"}
      </h2>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {isOpen
          ? `Cupos disponibles para ${activeEvent?.titulo || "la proxima fecha"}.`
          : "Cuando la proxima fecha abra inscripciones, el formulario aparecera activo aqui."}
      </p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Cupos</p>
            <p className="mt-1 text-3xl font-black text-white">
              {capacity.total}<span className="text-base text-zinc-500">/{capacity.max}</span>
            </p>
          </div>
          <p className="text-sm font-black text-yellow-300">{capacity.restantes} restantes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          value={form.nombre}
          onChange={(e) => setForm((c) => ({ ...c, nombre: e.target.value }))}
          disabled={!isOpen || status === "loading"}
          placeholder="Nombre"
          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
        />
        <input
          value={form.alias}
          onChange={(e) => setForm((c) => ({ ...c, alias: e.target.value }))}
          disabled={!isOpen || status === "loading"}
          placeholder="AKA / Nombre artistico"
          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
        />
        <input
          value={form.telefono}
          onChange={(e) => setForm((c) => ({ ...c, telefono: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
          disabled={!isOpen || status === "loading"}
          placeholder="Telefono, 10 digitos"
          inputMode="numeric"
          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
        />
        <input
          value={form.instagram}
          onChange={(e) => setForm((c) => ({ ...c, instagram: e.target.value }))}
          disabled={!isOpen || status === "loading"}
          placeholder="Instagram, opcional"
          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isOpen || status === "loading"}
          className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {status === "loading" ? "Enviando..." : "Inscribirme"}
        </button>
      </form>

      {message && (
        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${
          status === "success"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            : "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
        }`}>
          {message}
        </p>
      )}
    </section>
  );
}
