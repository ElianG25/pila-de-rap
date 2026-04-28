"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  const [open, setOpen] = useState(false);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  // ⏳ Loader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ⏳ Countdown
  useEffect(() => {
    const targetDate = new Date("2026-05-30T20:00:00");

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 Loader UI
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-yellow-400 text-xs tracking-[0.3em] animate-pulse">
            PILA DE RA'
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen text-white flex items-center justify-center px-6 text-center overflow-hidden">

      {/* 🎥 VIDEO */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          className="
            absolute top-1/2 left-1/2
            w-[177.77vh] h-[100vh]
            min-w-[100vw] min-h-[56.25vw]
            -translate-x-1/2 -translate-y-1/2
            pointer-events-none opacity-50 blur-[2px]
            md:scale-110
          "
          src="https://www.youtube.com/embed/15qGFxbi8sM?autoplay=1&mute=1&loop=1&playlist=15qGFxbi8sM&controls=0&modestbranding=1"
          title="Background video"
          allow="autoplay"
          allowFullScreen
        />
      </div>

      <div className="absolute inset-0 bg-black/60" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />

      {/* Glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute w-[500px] h-[500px] bg-yellow-400/20 blur-[120px] rounded-full top-[-100px] left-[-100px]"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute w-[400px] h-[400px] bg-yellow-300/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]"
      />

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg mx-auto"
      >
        <motion.h1
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-yellow-400 leading-tight"
        >
          🔋 Pila de Ra'
        </motion.h1>

        <p className="text-lg md:text-xl text-gray-300 mb-6">
          ¡LA PLAZA SIGUE VIVA!
        </p>

        <p className="text-lg md:text-xl text-gray-300 mb-6">
          Formatos sorpresas, premios en efectivo y pila de vibras.
        </p>

        {/* ⏳ Countdown */}
        <div className="mb-8 flex justify-center gap-3 text-yellow-300 font-semibold">
          {Object.entries(timeLeft).map(([label, value]) => (
            <motion.div
              key={label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black/60 border border-yellow-400/20 rounded-lg px-3 py-2 min-w-[60px]"
            >
              <div className="text-xl md:text-2xl">{value}</div>
              <div className="text-xs text-gray-400 uppercase">
                {label === "d"
                  ? "Días"
                  : label === "h"
                    ? "Horas"
                    : label === "m"
                      ? "Min"
                      : "Seg"}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-black/60 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold mb-3 text-yellow-400">
            Próximo Evento
          </h2>

          <p className="text-lg mb-2">
            📅 Sábado, 30 de mayo
          </p>

          <p className="text-gray-400 mb-2">
            Barras, flow y competencia real.
          </p>

          <p className="text-xs text-gray-500 mb-6">
            📍 Tropical Skatepark, Mirador Sur • Entrada libre
          </p>

          <motion.button
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold overflow-hidden w-full"
          >
            📝 Inscripciones
          </motion.button>

          <a
            href="https://instagram.com/piladera"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500 hover:text-yellow-300 transition hover:scale-105"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.75 2C4.57 2 2 4.57 2 7.75v8.5C2 19.43 4.57 22 7.75 22h8.5C19.43 22 22 19.43 22 16.25v-8.5C22 4.57 19.43 2 16.25 2h-8.5zm0 2h8.5C18.55 4 20 5.45 20 7.75v8.5c0 2.3-1.45 3.75-3.75 3.75h-8.5C5.45 20 4 18.55 4 16.25v-8.5C4 5.45 5.45 4 7.75 4zm8.25 1.5a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z" />
            </svg>
            Síguenos en Instagram
          </a>
        </motion.div>

        <p className="text-xs text-gray-600 mt-12">
          © {new Date().getFullYear()} ❤️ Pila de Ra'
        </p>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
              className="bg-black border border-yellow-400/30 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center relative"
            >
              {/* ❌ Cerrar */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                📝 Inscripciones
              </h2>

              {/* ✅ FORM */}
              <form
                className="space-y-4 text-left"
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (sending) return;

                  const form = e.target as HTMLFormElement;

                  const data = {
                    nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value,
                    alias: (form.elements.namedItem("alias") as HTMLInputElement).value,
                    telefono: (form.elements.namedItem("telefono") as HTMLInputElement).value,
                    instagram: (form.elements.namedItem("instagram") as HTMLInputElement).value,
                    fecha: "FECHA 1 | 30 de mayo",
                  };

                  try {
                    setSending(true);

                    const res = await fetch("/api/register", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(data),
                    });

                    if (!res.ok) throw new Error();

                    setOpen(false);
                    setSuccess(true);
                    form.reset();

                    setTimeout(() => setSuccess(false), 5000);
                  } catch (err) {
                    alert("Error al enviar, intenta de nuevo");
                  } finally {
                    setSending(false);
                  }
                }}
              >
                {/* Fecha visible */}
                <div className="w-full p-2 rounded bg-black border border-yellow-400/20 text-gray-300 text-center">
                  📅 FECHA 1 | 30 de mayo
                </div>

                {/* Hidden */}
                <input type="hidden" name="fecha" value="FECHA 1 | 30 de mayo" />

                <input
                  name="nombre"
                  placeholder="Nombre real"
                  required
                  className="w-full p-2 rounded bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none"
                />

                <input
                  name="alias"
                  placeholder="Nombre artístico (MC)"
                  required
                  className="w-full p-2 rounded bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none"
                />

                <input
                  name="telefono"
                  placeholder="Teléfono / WhatsApp"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full p-2 rounded bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none"
                />

                <input
                  name="instagram"
                  placeholder="@instagram (opcional)"
                  className="w-full p-2 rounded bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none"
                />

                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={!sending ? { scale: 1.05 } : {}}
                  whileTap={!sending ? { scale: 0.95 } : {}}
                  className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${sending
                      ? "bg-yellow-200 text-black cursor-not-allowed"
                      : "bg-yellow-400 text-black hover:bg-yellow-300"
                    }`}
                >
                  {sending && (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {sending ? "Enviando..." : "Enviar inscripción"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
  {success && (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-black border border-yellow-400/30 text-yellow-300 px-6 py-4 rounded-xl shadow-xl max-w-sm text-center">
        🔥 Ya estás dentro

        <p className="text-sm text-gray-300 mt-2">
          Pronto te llegará un mensaje con los detalles.
        </p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      </main>
  );
}