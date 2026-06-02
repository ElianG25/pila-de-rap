"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { eyebrow, mutedEyebrow } from "@/app/lib/landing/styles";
import type { EventConfig } from "@/app/lib/landing/types";

type RegisterModalProps = {
  open: boolean;
  canRegister: boolean;
  isPreEvent: boolean;
  slots: number | null;
  sending: boolean;
  eventConfig: EventConfig;
  onClose: () => void;
  onSuccess: (restantes?: number) => void;
  setSending: (value: boolean) => void;
};

export default function RegisterModal({
  open,
  canRegister,
  isPreEvent,
  slots,
  sending,
  eventConfig,
  onClose,
  onSuccess,
  setSending,
}: RegisterModalProps) {
  return (
    <AnimatePresence>
      {open && canRegister && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 32 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative max-h-[90svh] w-full max-w-sm overflow-y-auto rounded-[2rem] border border-yellow-400/20 bg-black/90 p-5 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-7"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.10),transparent_28rem)]" />

            <div className="relative z-10">
              <button
                type="button"
                aria-label="Cerrar modal de inscripción"
                onClick={onClose}
                className="absolute -top-2 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-gray-400 transition hover:border-yellow-400/30 hover:text-white"
              >
                ✕
              </button>

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-2xl">
                🎤
              </div>

              <p className={eyebrow}>Registro oficial</p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Inscripción MC
              </h2>

              {isPreEvent && typeof slots === "number" && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <p className={mutedEyebrow}>Cupos</p>

                  <p className="mt-1 text-sm font-black text-yellow-300">
                    🔥 {Math.max(0, 32 - slots)}/32 MCs confirmados
                  </p>
                </div>
              )}

              <form
                className="mt-5 space-y-3 text-left"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (sending) return;

                  if (!canRegister) {
                    alert("Las inscripciones están cerradas.");
                    onClose();
                    return;
                  }

                  const form = e.currentTarget as HTMLFormElement;

                  const data = {
                    nombre: (
                      form.elements.namedItem("nombre") as HTMLInputElement
                    ).value.trim(),
                    alias: (
                      form.elements.namedItem("alias") as HTMLInputElement
                    ).value.trim(),
                    telefono: (
                      form.elements.namedItem("telefono") as HTMLInputElement
                    ).value.trim(),
                    instagram: (
                      form.elements.namedItem("instagram") as HTMLInputElement
                    ).value.trim(),
                    fecha: eventConfig.eventLabel,
                  };

                  if (!/^\d{10}$/.test(data.telefono)) {
                    alert("⚠️ El teléfono debe tener 10 dígitos");
                    return;
                  }

                  try {
                    setSending(true);

                    const res = await fetch("/api/register", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(data),
                    });

                    const result = await res.json();

                    if (!res.ok) {
                      if (result.error === "INSCRIPCIONES_CERRADAS") {
                        alert("Las inscripciones están cerradas.");
                      } else if (result.error === "CUPOS_AGOTADOS") {
                        alert("🔥 Se llenaron los cupos");
                      } else if (result.error === "YA_INSCRITO") {
                        alert("⚠️ Ya estás inscrito con ese número");
                      } else if (result.error === "TELEFONO_INVALIDO") {
                        alert("⚠️ El teléfono debe tener 10 dígitos");
                      } else if (result.error === "CAMPOS_INCOMPLETOS") {
                        alert("Completa los campos obligatorios.");
                      } else {
                        alert(result.error || "Error inesperado");
                      }

                      return;
                    }

                    form.reset();
                    onSuccess(
                      typeof result.restantes === "number"
                        ? result.restantes
                        : undefined
                    );
                  } catch (err) {
                    console.error(err);
                    alert("Error de conexión, intenta de nuevo");
                  } finally {
                    setSending(false);
                  }
                }}
              >
                <div className="w-full rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-center text-sm font-black text-yellow-300">
                  📅 {eventConfig.eventLabel}
                </div>

                <input type="hidden" name="fecha" value={eventConfig.eventLabel} />

                <input
                  name="nombre"
                  placeholder="Nombre real"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
                />

                <input
                  name="alias"
                  placeholder="Nombre artístico (MC)"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
                />

                <input
                  name="telefono"
                  placeholder="Teléfono / WhatsApp"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
                />

                <input
                  name="instagram"
                  placeholder="@instagram (opcional)"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
                />

                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={!sending ? { scale: 1.02 } : {}}
                  whileTap={!sending ? { scale: 0.98 } : {}}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-black uppercase tracking-wide transition ${
                    sending
                      ? "cursor-not-allowed bg-yellow-200 text-black"
                      : "bg-yellow-400 text-black hover:bg-yellow-300"
                  }`}
                >
                  {sending && (
                    <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  )}
                  {sending ? "Enviando..." : "Enviar inscripción"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}