export default function Footer() {
  return (
    <footer className="mt-10 text-center">
      <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[11px] text-gray-500 backdrop-blur">
        <span>© {new Date().getFullYear()} | Pila de Ra'</span>

        <span className="text-white/15">•</span>

        <a
          href="https://t.me/Ztyl3"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-yellow-400 hover:text-yellow-300"
        >
          Elian Gomez
        </a>
      </div>
    </footer>
  );
}