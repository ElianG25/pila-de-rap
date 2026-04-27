"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const targetDate = new Date("2026-05-30T20:00:00");

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("¡Es hoy! 🔥");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen text-white flex items-center justify-center px-6 text-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          className="w-full h-full scale-125 pointer-events-none opacity-50 blur-[2px]"
          src="https://www.youtube.com/embed/YZ3xyyYlnz0?autoplay=1&mute=1&loop=1&playlist=YZ3xyyYlnz0&controls=0&modestbranding=1"
          title="Background video"
          allow="autoplay"
        />
      </div>

      {/* Overlay oscuro más suave */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Glow con color marca */}
      <div className="absolute w-[500px] h-[500px] bg-yellow-400/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-yellow-300/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight text-yellow-400">
          🔋 Pila de Rap 🎤
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-6">
          Sitio en construcción...
        </p>

        {/* ⏳ COUNTDOWN */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-xl md:text-2xl font-semibold tracking-wide text-yellow-300"
        >
          ⏳ {timeLeft}
        </motion.div>

        {/* Card evento */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-black/60 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-2xl font-semibold mb-3 text-yellow-400">
            Próximo Evento
          </h2>

          <p className="text-lg mb-2">
            📅 Sábado, 30 de mayo
          </p>

          <p className="text-gray-400 mb-6">
            Barras, flow y competencia real. ¿Estás listo?
          </p>

          {/* 🔘 BOTÓN */}
          <button
            onClick={() => setOpen(true)}
            className="relative group bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold overflow-hidden"
          >
            <span className="relative z-10">
              Próximamente inscripciones
            </span>

            <span className="absolute inset-0 bg-yellow-300 opacity-0 group-hover:opacity-100 transition duration-300"></span>
          </button>

          <a
            href="https://instagram.com/piladera"
            target="_blank"
            className="block mt-6 text-sm text-gray-500 hover:text-yellow-300 transition"
          >
            Síguenos en Instagram
          </a>
        </motion.div>

        <p className="text-xs text-gray-600 mt-12">
          © {new Date().getFullYear()} Pila de Rap
        </p>
      </motion.div>

      {/* 🪟 MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-black border border-yellow-400/30 rounded-2xl p-8 max-w-sm w-full text-center relative">

            {/* Botón cerrar */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Inscripciones
            </h2>

            <p className="text-gray-300 mb-6">
              Próximamente estaremos habilitando las inscripciones.
            </p>

            <button
              onClick={() => setOpen(false)}
              className="bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}