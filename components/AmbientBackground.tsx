"use client";

import { motion } from "framer-motion";

export default function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Brand blob (reddish-pink) */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[5%] h-80 w-80 rounded-full bg-brand-500/10 dark:bg-brand-600/15 blur-[100px]"
      />

      {/* Accent blob (warm orange) */}
      <motion.div
        animate={{
          x: [0, -30, 40, 0],
          y: [0, 50, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[40%] right-[10%] h-96 w-96 rounded-full bg-accent-500/8 dark:bg-accent-600/12 blur-[120px]"
      />

      {/* Secondary Indigo blob (for dynamic contrast) */}
      <motion.div
        animate={{
          x: [0, 20, -30, 0],
          y: [0, 30, -50, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute bottom-[10%] left-[20%] h-80 w-80 rounded-full bg-indigo-500/8 dark:bg-indigo-600/12 blur-[100px]"
      />
    </div>
  );
}
