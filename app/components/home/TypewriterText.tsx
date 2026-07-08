"use client";

import { motion } from "framer-motion";

export function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: delay + i * 0.038 }}
          style={{ display: "inline-block" }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </>
  );
}
