"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Compass, ShieldAlert, CheckCircle2 } from "lucide-react";
import { LanguageNode } from "@/data/languages";
import Link from "next/link";

interface LanguageDrawerProps {
  language: LanguageNode | null;
  onClose: () => void;
}

export default function LanguageDrawer({ language, onClose }: LanguageDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!language) return null;

  // Domain badge colors
  const domainColors = {
    web: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    data: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    systems: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    enterprise: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
  };

  // Difficulty pill colors
  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
  };

  // Roadmap colors mapping
  const roadmapColors: Record<string, string> = {
    aiml: "bg-[#7F77DD]/10 text-[#7F77DD] hover:bg-[#7F77DD]/20 border-[#7F77DD]/20",
    webdev: "bg-[#378ADD]/10 text-[#378ADD] hover:bg-[#378ADD]/20 border-[#378ADD]/20",
    devops: "bg-[#1D9E75]/10 text-[#1D9E75] hover:bg-[#1D9E75]/20 border-[#1D9E75]/20"
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/55 backdrop-blur-xs transition-all"
      />

      {/* Drawer Container */}
      <motion.div
        ref={drawerRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
        className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center bg-muted"
                dangerouslySetInnerHTML={{ __html: language.logoSvg }}
              />
              <div>
                <h2 className="text-xl font-extrabold text-foreground">{language.name}</h2>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${domainColors[language.domain]}`}>
                  {language.domain} Domain
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Tagline */}
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tagline</p>
            <p className="text-sm font-extrabold text-foreground italic leading-relaxed">
              &ldquo;{language.tagline}&rdquo;
            </p>
          </div>

          {/* Difficulty and Resource Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">Difficulty</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border inline-block ${difficultyColors[language.difficulty]}`}>
                {language.difficulty}
              </span>
            </div>
            <div className="p-3 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">Learning Resource</span>
              <a
                href={language.bestResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-600 dark:text-brand-400 hover:underline"
              >
                {language.bestResource.title} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Key Use Cases */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Core Use Cases</h4>
            <ul className="space-y-1.5">
              {language.useCases.map((useCase, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-bold text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interrelation Explanation */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" /> Language Interrelations
            </h4>
            <p className="text-xs font-bold leading-relaxed text-foreground/90">
              {language.interrelationNote}
            </p>
          </div>
        </div>

        {/* Footer: Used in Roadmaps */}
        <div className="border-t border-border/60 pt-4 mt-6 space-y-2.5">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-muted-foreground" /> Included in Roadmaps
          </h4>
          <div className="flex flex-wrap gap-2">
            {language.usedInRoadmaps.map((rMap, idx) => (
              <Link
                key={idx}
                href={`/student-hub/roadmaps/${rMap.roadmap}`}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all ${
                  roadmapColors[rMap.roadmap] || "bg-muted text-foreground border-border"
                }`}
              >
                <span>{rMap.label}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
