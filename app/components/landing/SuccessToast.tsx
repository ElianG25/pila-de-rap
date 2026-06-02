"use client";

import { AnimatePresence, motion } from "framer-motion";

type SuccessToastProps = {
  show: boolean;
};

export default function SuccessToast({ show }: SuccessToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4"
        >
          <div className="rounded-2xl border border-yellow-400/30 bg-black/90 px-5 py-4 text-center text-yellow-300 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-400">
              Inscripción recibida
            </p>

            <p className="mt-1 text-base font-black text-white">
              🔥 Ya estás dentro
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Pronto te llegará un mensaje con los detalles.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}