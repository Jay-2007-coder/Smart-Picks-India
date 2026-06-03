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

  const formattedTime = `${pad(timeLeft.hours)}h : ${pad(timeLeft.minutes)}m : ${pad(timeLeft.seconds)}s`;

  if (isImminent) {
    return (
      <motion.span
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-red-600 px-3 py-1 rounded-full shadow-md shadow-red-600/20 uppercase tracking-wider"
      >
        <Clock className="h-3.5 w-3.5 animate-pulse" />
        Hurry! {formattedTime} left
      </motion.span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-accent-500 bg-accent-500/10 px-3 py-1 rounded-full uppercase tracking-wider border border-accent-500/10">
      <Clock className="h-3.5 w-3.5" />
      Ends in: {formattedTime}
    </span>
  );
}
