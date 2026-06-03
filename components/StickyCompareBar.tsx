"use client";

import { useCompare } from "@/hooks/useCompare";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, GitCompare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyCompareBar() {
  const { comparedProducts, toggleCompare, clearCompare } = useCompare();

  if (comparedProducts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-50"
      >
        {/* Left: Product Thumbnails */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <GitCompare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-black text-foreground">
              Compare ({comparedProducts.length}/3)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.map((product) => (
              <div
                key={product.slug}
                className="relative h-10 w-10 rounded-lg overflow-hidden border border-border bg-muted group"
              >
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCompare(product);
                  }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className="btn-primary bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-1.5 px-4 text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/10"
          >
            Compare Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
