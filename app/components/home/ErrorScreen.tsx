"use client";

import Image from "next/image";

export function ErrorScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 px-6">
      <Image src="/logo.png" alt="Pila de Ra'" width={48} height={48} className="h-12 w-auto mb-6 opacity-40" />
      <p className="kicker text-[10px] text-yellow-400 mb-3">Error</p>
      <p className="font-display text-xl font-bold uppercase text-white mb-2">No se pudo cargar</p>
      <p className="text-sm text-zinc-500 mb-8 text-center max-w-xs">
        {message || "La información de la liga no está disponible."}
      </p>
      <button onClick={() => window.location.reload()} className="btn-gold rounded-xl px-6 py-2.5 text-sm">
        Reintentar
      </button>
    </div>
  );
}
