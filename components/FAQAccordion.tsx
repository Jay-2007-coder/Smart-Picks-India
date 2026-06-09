"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3.5 max-w-full">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <motion.div
            key={i}
            layout
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "rounded-2xl border transition-all duration-300 overflow-hidden relative group backdrop-blur-md",
              isOpen
                ? "border-[#d43f36]/40 dark:border-[#d43f36]/30 bg-[#d43f36]/5 dark:bg-[#d43f36]/5 shadow-[0_4px_20px_-4px_rgba(212,63,54,0.08)]"
                : "border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
            )}
          >
            {/* Glowing Left Indicator Strip */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300",
                isOpen
                  ? "bg-gradient-to-b from-[#d43f36] to-amber-500"
                  : "bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-700"
              )}
            />

            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4.5 text-left gap-4 cursor-pointer focus:outline-none select-none pl-6.5"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200 leading-snug",
                  isOpen ? "text-[#d43f36] dark:text-[#f87171]" : "text-slate-800 dark:text-slate-100 group-hover:text-[#d43f36] dark:group-hover:text-[#f87171]"
                )}
              >
                {faq.question}
              </span>
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg border border-transparent transition-all duration-350 shrink-0",
                  isOpen 
                    ? "bg-[#d43f36]/10 text-[#d43f36] dark:text-[#f87171]" 
                    : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                )}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-350 ease-out",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </button>
            
            {/* Smooth Collapsible height transition */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4.5 pt-0.5 border-t border-slate-100/50 dark:border-slate-800/20 pl-6.5">
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
