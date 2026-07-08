import Image from "next/image";

export function LoadingScreen() {
  return (
    <div className="min-h-[100svh] bg-black px-4 sm:px-6" aria-busy="true" aria-label="Cargando la liga">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between pt-5 pb-2">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Pila de Ra'" width={44} height={44} priority
              className="h-9 w-auto opacity-80 drop-shadow-[0_0_22px_rgba(250,204,21,0.35)]" />
            <div className="space-y-2"><div className="skeleton h-3 w-24" /><div className="skeleton h-2 w-16" /></div>
          </div>
          <div className="skeleton hidden h-7 w-32 rounded-full sm:block" />
        </div>
        <div className="flex flex-col items-center gap-4 py-14">
          <div className="skeleton h-3 w-44 rounded-full" />
          <div className="skeleton h-16 w-64 sm:h-24 sm:w-[28rem]" />
          <div className="skeleton h-7 w-40 rounded-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="skeleton h-64" />)}
        </div>
      </div>
    </div>
  );
}
