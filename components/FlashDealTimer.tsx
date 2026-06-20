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
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endsAt).getTime() - new Date().getTime();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
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

  const isImminent = timeLeft.hours === 0 && timeLeft.minutes < 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  const formattedTime = `${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`;

  if (isImminent) {
    return (
      <motion.span
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-black text-white bg-red-600 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-md shadow-red-600/10 uppercase tracking-wider"
      >
        <Clock className="h-2.5 w-2.5 sm:h-3 w-3 animate-pulse text-white shrink-0" />
        {formattedTime}
      </motion.span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-black text-accent-500 bg-accent-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg uppercase tracking-wider border border-accent-500/10">
      <Clock className="h-2.5 w-2.5 sm:h-3 w-3 text-accent-500 shrink-0" />
      {formattedTime}
    </span>
  );
}
