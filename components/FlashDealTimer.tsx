"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface FlashDealTimerProps {
  endsAt: string;
}

export default function FlashDealTimer({ endsAt }: FlashDealTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endsAt).getTime() - new Date().getTime();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        totalMs: difference,
        isExpired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
        Ended
      </span>
    );
  }

  const pad = (num: number) => String(num).padStart(2, "0");
  const formattedTime = `${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`;

  // Determine state based on totalMs remaining
  // Less than 10 minutes = 10 * 60 * 1000 = 600,000 ms
  // Less than 1 hour = 60 * 60 * 1000 = 3,600,000 ms
  const isLastTenMinutes = timeLeft.totalMs < 600000;
  const isUnderOneHour = timeLeft.totalMs < 3600000;

  let containerClasses = "";
  let iconClasses = "";

  if (isLastTenMinutes) {
    // Shaking + Intense Orange Glow
    containerClasses = "bg-orange-500 text-white border border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-shake";
    iconClasses = "text-white animate-pulse";
  } else if (isUnderOneHour) {
    // Normal Orange Glow
    containerClasses = "bg-orange-500/90 text-white border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.5)]";
    iconClasses = "text-white";
  } else {
    // Standard state: orange/accent border and text, gentle background
    containerClasses = "text-accent-500 bg-accent-500/10 border border-accent-500/10";
    iconClasses = "text-accent-500";
  }

  return (
    <motion.span
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
      className={`inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg uppercase tracking-wider transition-all duration-300 ${containerClasses}`}
    >
      <Clock className={`h-2.5 w-2.5 sm:h-3 w-3 shrink-0 ${iconClasses}`} />
      {formattedTime}
    </motion.span>
  );
}
