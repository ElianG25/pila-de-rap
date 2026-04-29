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

  const jueces = [
    { nombre: "H-OFER", ig: "mchoferrap" },
    { nombre: "???", ig: null },
    { nombre: "???", ig: null },
  ];

  const [open, setOpen] = useState(false);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const [slots, setSlots] = useState<number | null>(null);
  const isFull = typeof slots === "number" && slots <= 0;

  // 🔥 MCs (tipado básico mejorado)
  const [mcs, setMcs] = useState<
    { alias: string; visible: boolean }[]
  >([]);

  // 🔁 Flip card
  const [flipped, setFlipped] = useState(false);

  // ⏳ Próximo reveal
  const [nextReveal, setNextReveal] = useState({
    h: 0,
    m: 0,
    s: 0,
  });

  // 🎤 Fetch MCs + cupos (UNIFICADO)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/mcs", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Error fetching data");

        const data = await res.json();

        console.log("DATA RAW:", data);

        // ✅ MCs
        setMcs(Array.isArray(data.data) ? data.data : []);

        // ✅ Slots (CORRECCIÓN CLAVE)
        const rawSlots = data.restantes;

        let parsedSlots: number | null = null;

        if (typeof rawSlots === "number") {
          parsedSlots = rawSlots;
        } else if (typeof rawSlots === "string") {
          const n = Number(rawSlots);
          parsedSlots = isNaN(n) ? null : n;
        }

        console.log("SLOTS PARSED:", parsedSlots);

        setSlots(parsedSlots);

      } catch (err) {
        console.error("Error cargando datos:", err);
        setMcs([]);
        setSlots(null);
      }
    };

    fetchData();
  }, []);

  // 🔁 Auto flip cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped((prev) => !prev);
    }, 10000); // 👈 cambia tiempo aquí

    return () => clearInterval(interval);
  }, []);

  // ⏳ Próxima revelación (cada medianoche)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();

      setNextReveal({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  // ⏳ Loader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);


  // ⏳ Countdown evento
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
    <main className="relative min-h-screen text-white px-6 overflow-hidden">

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
          src="https://www.youtube.com/embed/7IH3cXRUKsI?autoplay=1&mute=1&loop=1&playlist=7IH3cXRUKsI&controls=0&modestbranding=1"
          title="Background video"
          allow="autoplay"
          allowFullScreen
        />
      </div>

      {/* Overlay */}
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

      {/* 🔥 CONTENEDOR PRINCIPAL */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">

        {/* 🧠 HERO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-lg mx-auto"
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
            Formatos sorpresas, premio en efectivo y pila de vibras.
          </p>

          {/* ⏳ Countdown */}
          <div className="mb-10 flex justify-center gap-3 text-yellow-300 font-semibold">
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
        </motion.div>

        {/* 🔥 CARDS (AQUÍ VA EL EVENTO + FLIP) */}
        <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

          {/* EVENTO */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-black/60 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between h-full"
          >
            {/* 🔝 TOP */}
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-yellow-400">
                Próximo Evento
              </h2>

              <p className="text-lg mb-1">📅 Sábado, 30 de mayo</p>
              <p className="text-lg mb-4">🕒 3:00 PM</p>

              {/* JUECES */}
              <div className="flex justify-center gap-3 mb-6">
                {jueces.map((juez, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-black/60 border border-yellow-400/20 rounded-lg px-3 py-2 min-w-[80px] text-center hover:scale-105"
                  >
                    {/* 👇 Nombre clickeable solo si tiene IG */}
                    {juez.ig ? (
                      <a
                        href={`https://instagram.com/${juez.ig}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-yellow-300 font-bold hover:underline hover:text-yellow-200 transition hover:scale-105"
                      >
                        {juez.nombre}
                      </a>
                    ) : (
                      <div className="text-sm text-yellow-300 font-bold">
                        {juez.nombre}
                      </div>
                    )}

                    <div className="text-[10px] text-gray-400 uppercase">
                      Juez
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mb-6">

                <p className="text-xs text-gray-500 mb-3 text-center">
                  📍 Tropical Skatepark, Mirador Sur
                </p>

                <a
                  href="https://maps.app.goo.gl/YBgeMyMwmDQ6AqhE8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="relative rounded-xl overflow-hidden border border-yellow-400/20 hover:border-yellow-400/40 transition">

                    <img
                      src="/map-preview.jpg"
                      alt="Ubicación del evento"
                      className="w-full h-28 object-cover opacity-80 group-hover:opacity-100 transition"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-xs text-yellow-300 font-semibold">
                        Abrir en Google Maps
                      </span>
                    </div>

                  </div>
                </a>

              </div>
            </div>

            {/* 🔻 BOTTOM (se empuja abajo automáticamente) */}
            <div>
              {/* BOTÓN */}
              <motion.button
                onClick={() => {
                  if (!isFull) setOpen(true);
                }}
                disabled={isFull}
                whileHover={!isFull ? { scale: 1.05 } : {}}
                whileTap={!isFull ? { scale: 0.95 } : {}}
                className={`w-full py-2 rounded-xl font-bold transition
        ${isFull
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-400 text-black hover:bg-yellow-300"
                  }`}
              >
                {isFull ? "❌ Inscripciones cerradas" : "📝 Inscripciones"}
              </motion.button>

              {/* CUPOS */}
              {typeof slots === "number" && !isNaN(slots) && (
                <motion.p
                  key={slots} // 👈 fuerza re-render cuando cambia
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm mt-3 font-semibold text-center ${slots <= 0 ? "text-red-400" : "text-yellow-300"
                    }`}
                >
                  {slots <= 0
                    ? "❌ Cupos agotados"
                    : `⚠️ Quedan ${slots} cupos disponibles`}
                </motion.p>
              )}

              <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@piladerap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-yellow-400/20 hover:bg-yellow-400 hover:text-black transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.5v-7l6.2 3.5-6.2 3.5z" />
                  </svg>
                  YouTube
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/piladera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-yellow-400/20 hover:bg-yellow-400 hover:text-black transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.75 2C4.57 2 2 4.57 2 7.75v8.5C2 19.43 4.57 22 7.75 22h8.5C19.43 22 22 19.43 22 16.25v-8.5C22 4.57 19.43 2 16.25 2h-8.5zm0 2h8.5C18.55 4 20 5.45 20 7.75v8.5c0 2.3-1.45 3.75-3.75 3.75h-8.5C5.45 20 4 18.55 4 16.25v-8.5C4 5.45 5.45 4 7.75 4zm8.25 1.5a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z" />
                  </svg>
                  Instagram
                </a>

              </div>
            </div>
          </motion.div>

          {/* 🔥 FLIP CARD MCs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full max-w-lg mx-auto mt-6 [perspective:1000px]"
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full cursor-pointer [transform-style:preserve-3d]"
              style={{ minHeight: flipped ? "auto" : "260px" }}
              onClick={() => setFlipped(!flipped)}
            >

              {/* 🟡 FRONT */}
              <div className="absolute inset-0 bg-yellow-400 text-black rounded-2xl p-6 flex flex-col justify-between [backface-visibility:hidden]">

                {/* TOP */}
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-2">
                    Último MC revelado
                  </p>

                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-[10px] px-2 py-1 bg-black/10 rounded-full font-bold">
                      🔥 NUEVO
                    </span>
                  </div>
                </div>

                {/* CENTER (PROTAGONISTA) */}
                <div className="flex-1 flex items-center justify-center">
                  {(() => {
                    const visibles = mcs.filter(m => m.visible);
                    const last = visibles[visibles.length - 1];

                    return last ? (
                      <h3 className="text-4xl md:text-5xl font-black tracking-tight text-center leading-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                        🎤 {last.alias}
                      </h3>
                    ) : (
                      <p className="text-xl font-bold">Próximamente…</p>
                    );
                  })()}
                </div>

                {/* BOTTOM */}
                <div className="text-center">
                  <p className="text-xs opacity-80">
                    ⏳ Próxima revelación
                  </p>

                  <div className="flex justify-center gap-2 mt-1 text-sm font-bold">
                    <span>{nextReveal.h.toString().padStart(2, "0")}h</span>
                    <span>:</span>
                    <span>{nextReveal.m.toString().padStart(2, "0")}m</span>
                    <span>:</span>
                    <span>{nextReveal.s.toString().padStart(2, "0")}s</span>
                  </div>

                  <p className="text-[10px] mt-2 opacity-60">
                    (toca para ver todos)
                  </p>
                </div>
              </div>

              {/* ⚫ BACK */}
              <div className="bg-black border border-yellow-400/20 rounded-2xl p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">

                <div className="text-center mb-4">
                  <h3 className="text-yellow-400 font-bold">
                    🎤 Lista de MCs
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Próxima revelación en
                  </p>

                  <div className="flex justify-center gap-2 mt-2 text-yellow-300 text-sm font-semibold">
                    <span>{nextReveal.h.toString().padStart(2, "0")}h</span>
                    <span>:</span>
                    <span>{nextReveal.m.toString().padStart(2, "0")}m</span>
                    <span>:</span>
                    <span>{nextReveal.s.toString().padStart(2, "0")}s</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-sm">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const mc = mcs[i];

                    return (
                      <div
                        key={i}
                        className="bg-black/60 border border-yellow-400/20 rounded-md py-2 text-center"
                      >
                        {mc ? (
                          mc.visible ? (
                            <span className="text-yellow-300">
                              {mc.alias}
                            </span>
                          ) : (
                            <span className="text-gray-500">???</span>
                          )
                        ) : (
                          <span className="text-gray-700">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {mcs.length > 0 && (
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    🔓 {mcs.filter(m => m.visible).length} revelados de {mcs.length}
                  </p>
                )}
              </div>

            </motion.div>
          </motion.div>

        </div>

        <p className="text-xs text-gray-600 mt-12">
          © {new Date().getFullYear()} ❤️ Pila de Ra'
        </p>

      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && !isFull && (
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

              {/* 🔥 CONTADOR SEGURO */}
              {slots !== null && (
                <p className="text-yellow-300 text-sm mb-4">
                  🔥 {32 - slots}/{32} MCs confirmados
                </p>
              )}

              {/* FORM */}
              <form
                className="space-y-4 text-left"
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (sending) return;

                  const form = e.currentTarget as HTMLFormElement;

                  const data = {
                    nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value.trim(),
                    alias: (form.elements.namedItem("alias") as HTMLInputElement).value.trim(),
                    telefono: (form.elements.namedItem("telefono") as HTMLInputElement).value.trim(),
                    instagram: (form.elements.namedItem("instagram") as HTMLInputElement).value.trim(),
                    fecha: "FECHA 1 | 30 de mayo",
                  };

                  // 🔒 Validación frontend
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
                      if (result.error === "CUPOS_AGOTADOS") {
                        alert("🔥 Se llenaron los cupos");
                      } else if (result.error === "YA_INSCRITO") {
                        alert("⚠️ Ya estás inscrito con ese número");
                      } else {
                        alert(result.error || "Error inesperado");
                      }
                      return;
                    }

                    // ✅ USAR RESPUESTA REAL DEL BACKEND
                    if (typeof result.cuposRestantes === "number") {
                      setSlots(result.cuposRestantes);
                    }

                    setOpen(false);
                    setSuccess(true);
                    form.reset();

                    setTimeout(() => setSuccess(false), 5000);

                  } catch (err) {
                    console.error(err);
                    alert("Error de conexión, intenta de nuevo");
                  } finally {
                    setSending(false);
                  }
                }}
              >
                {/* Fecha visible */}
                <div className="w-full p-2 rounded bg-black border border-yellow-400/20 text-gray-300 text-center">
                  📅 FECHA 1 | 30 de mayo
                </div>

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

      {/* ✅ TOAST */}
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