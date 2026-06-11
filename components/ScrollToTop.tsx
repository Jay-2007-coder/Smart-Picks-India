"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
      
      setScrollProgress(progress);
      setIsVisible(scrolled > 250);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check in case page starts scrolled
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Circumference of a circle with radius 18: 2 * Math.PI * 18 = 113.1
  const strokeCircumference = 113.1;
  const strokeDashoffset = strokeCircumference - (scrollProgress / 100) * strokeCircumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-45 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-border/60 text-foreground shadow-lg hover:shadow-xl hover:border-brand-500/30 transition-colors select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 group"
          aria-label="Scroll to Top"
        >
          {/* Progress Circular SVG Track */}
          <svg className="absolute inset-0 h-full w-full -rotate-90 select-none pointer-events-none" viewBox="0 0 44 44">
            {/* Background path */}
            <circle
              className="text-muted/30"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              r="18"
              cx="22"
              cy="22"
            />
            {/* Animated progress indicator path */}
            <motion.circle
              className="text-brand-600 dark:text-brand-400"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="transparent"
              r="18"
              cx="22"
              cy="22"
              style={{
                strokeDasharray: strokeCircumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>

          {/* Up arrow centered */}
          <ArrowUp className="h-4.5 w-4.5 group-hover:-translate-y-0.5 transition-transform duration-250" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
