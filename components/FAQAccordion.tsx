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
          <div
            key={i}
            className={cn(
              "rounded-2xl border transition-all duration-350 overflow-hidden",
              isOpen
                ? "border-brand-500/30 bg-brand-500/5 dark:bg-brand-950/20 shadow-sm"
                : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850/40"
            )}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-5.5 py-4.5 text-left gap-4 cursor-pointer focus:outline-none select-none"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200 leading-snug",
                  isOpen ? "text-brand-650 dark:text-brand-400" : "text-slate-800 dark:text-slate-100"
                )}
              >
                {faq.question}
              </span>
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg border border-transparent transition-all duration-300 shrink-0",
                  isOpen 
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/10" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                  <div className="px-5.5 pb-4.5 pt-0.5 border-t border-slate-100 dark:border-slate-800/30">
                    <p className="text-[11px] sm:text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
