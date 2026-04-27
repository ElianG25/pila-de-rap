export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">

      {/* Logo / Nombre */}
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Pila de Rap 🎤
      </h1>

      {/* Under Construction */}
      <p className="text-lg md:text-xl text-gray-400 mb-8">
        Sitio en construcción...
      </p>

      {/* Evento */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-2">
          Próximo Evento
        </h2>

        <p className="text-lg mb-2">
          📅 Sábado, 30 de mayo
        </p>

        <p className="text-gray-300 mb-4">
          Prepárate para barras, flow y competencia real.
        </p>

        <button className="bg-white text-black px-6 py-2 rounded-xl font-semibold hover:bg-gray-200 transition">
          Próximamente inscripciones...
        </button>
      </div>

      <a
        href="https://instagram.com/TU_CUENTA"
        target="_blank"
        className="block mt-4 text-sm text-gray-400 hover:text-white"
      >
        Síguenos en Instagram
      </a>

      {/* Footer */}
      <p className="text-sm text-gray-500 mt-10">
        © {new Date().getFullYear()} Pila de Rap
      </p>
    </main>
  );
}