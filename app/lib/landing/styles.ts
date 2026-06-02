export const cardBase =
  "relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl";

export const softCard =
  "rounded-2xl border border-white/10 bg-black/35 backdrop-blur";

export const goldSoftCard =
  "rounded-2xl border border-yellow-400/20 bg-yellow-400/10";

export const statCard =
  "rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/40 backdrop-blur";

export const sectionGlow =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.10),transparent_34rem)]";

export const eyebrow =
  "text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400";

export const mutedEyebrow =
  "text-[9px] font-black uppercase tracking-[0.25em] text-gray-500";

export const sectionTitle =
  "mt-3 text-3xl md:text-4xl font-black tracking-tight text-white";

export const sectionDescription =
  "mt-3 text-sm md:text-base text-gray-400";

export const sectionDivider =
  "my-6 h-px w-full bg-gradient-to-r from-transparent via-yellow-400/15 to-transparent";

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};