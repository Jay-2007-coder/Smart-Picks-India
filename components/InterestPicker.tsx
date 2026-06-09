"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Laptop, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InterestPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: string[]) => void;
}

const availableCategories = [
  { id: "tech", label: "Tech Gear", icon: "💻" },
  { id: "kitchen", label: "Kitchen Tools", icon: "🍳" },
  { id: "home", label: "Home Decor", icon: "🏡" },
  { id: "gadgets", label: "Smart Gadgets", icon: "🔌" },
  { id: "fashion", label: "Fashion & Style", icon: "🎒" },
  { id: "study", label: "Study Utilities", icon: "📚" },
];

export default function InterestPicker({ isOpen, onClose, onSave }: InterestPickerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const stored = localStorage.getItem("smart_picks_interests");
      if (stored) {
        setSelected(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    try {
      localStorage.setItem("smart_picks_interests", JSON.stringify(selected));
      onSave(selected);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-card border border-border/80 shadow-2xl rounded-3xl p-6 sm:p-8 z-10 select-none overflow-hidden"
          >
            {/* Header decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-brand-500/10 text-brand-600 border border-brand-500/20 uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3 fill-current" /> feed settings
              </span>
              <h3 className="text-xl font-black text-foreground">Customize Your Feed</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Select your favorite categories to prioritize them on the homepage.
              </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {availableCategories.map((cat) => {
                const isSelected = selected.includes(cat.id);
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? "border-brand-500 bg-brand-500/[0.04] dark:bg-brand-500/[0.02] shadow-sm shadow-brand-500/5"
                        : "border-border hover:border-brand-550/30 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                    <span className="text-xs font-black text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{cat.label}</span>
                    
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 h-4.5 w-4.5 rounded-full bg-brand-600 flex items-center justify-center text-white shadow"
                      >
                        <Check className="h-2.5 w-2.5 stroke-[3px]" />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/80">
              <button
                onClick={onClose}
                className="btn-secondary flex-1 py-3 text-xs uppercase font-extrabold tracking-wider text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex-1 py-3 text-xs uppercase font-extrabold tracking-wider text-center cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
