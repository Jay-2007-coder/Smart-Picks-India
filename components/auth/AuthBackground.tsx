"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function AuthBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Silky smooth spring physics for the cursor spotlight
  const springX = useSpring(mouseX, { stiffness: 80, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 250); // offset by half spotlight width (500px / 2)
      mouseY.set(e.clientY - 250);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 select-none">
      
      {/* 1. Subtle Radial Ambient Lighting Pools */}
      <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-20 w-[40rem] h-[40rem] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[160px]" />
      <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-slate-400/10 dark:bg-zinc-700/10 rounded-full blur-[120px]" />

      {/* 2. Interactive Cursor Spotlight Light Beam (Linear/Vercel style) */}
      <motion.div
        className="absolute z-10 w-[500px] h-[500px] rounded-full pointer-events-none opacity-60 dark:opacity-40 mix-blend-soft-light dark:mix-blend-screen"
        style={{
          x: springX,
          y: springY,
          background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)",
          filter: "blur(50px)"
        }}
      />

      {/* 3. SVG Precision Dot Matrix Pattern with Radial Mask */}
      <div 
        className="absolute inset-0 z-10 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          color: 'var(--border, #cbd5e1)',
          maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)'
        }}
      />

      {/* 4. Fine SVG Grain Texture Overlay (Framer/Linear style) */}
      <svg className="absolute inset-0 w-full h-full z-20 opacity-[0.035] dark:opacity-[0.05] pointer-events-none mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
