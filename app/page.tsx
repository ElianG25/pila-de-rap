"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState("");

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

      {/* 🎥 YOUTUBE BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          className="w-full h-full scale-125 pointer-events-none opacity-30"
          src="https://www.youtube.com/embed/YZ3xyyYlnz0?autoplay=1&mute=1&loop=1&playlist=YZ3xyyYlnz0&controls=0&showinfo=0&modestbranding=1"
          title="Background video"
          allow="autoplay"
        />
      </div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Glow urbano */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-red-600/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
          Pila de Rap
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-6">
          Sitio en construcción...
        </p>

        {/* ⏳ COUNTDOWN */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-xl md:text-2xl font-semibold tracking-wide"
        >
          ⏳ {timeLeft}
        </motion.div>

        {/* Card evento */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-2xl font-semibold mb-3">
            Próximo Evento
          </h2>

          <p className="text-lg mb-2">
            📅 Sábado, 30 de mayo
          </p>

          <p className="text-gray-400 mb-6">
            Barras, flow y competencia real. ¿Estás listo?
          </p>

          <button className="relative group bg-white text-black px-6 py-2 rounded-xl font-semibold overflow-hidden">
            <span className="relative z-10">
              Próximamente inscripciones
            </span>

            <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-red-500 opacity-0 group-hover:opacity-100 transition duration-300"></span>
          </button>

          <a
            href="https://instagram.com/piladera"
            target="_blank"
            className="block mt-6 text-sm text-gray-500 hover:text-white transition"
          >
            Síguenos en Instagram
          </a>
        </motion.div>

        <p className="text-xs text-gray-600 mt-12">
          © {new Date().getFullYear()} Pila de Rap
        </p>
      </motion.div>
    </main>
  );
}