"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ExternalLink, Compass, CheckCircle2, Zap, Code2,
  TrendingUp, BookOpen, BarChart2, Star, ArrowRight, Globe, Database, Cpu, Building2
} from "lucide-react";
import { LanguageNode } from "@/data/languages";
import Link from "next/link";

interface Props { language: LanguageNode | null; onClose: () => void; }

const DOMAIN_META = {
  web:        { label: "Web",        color: "#378ADD", Icon: Globe,     gradient: "from-[#378ADD]/20 to-transparent" },
  data:       { label: "Data / AI",  color: "#1D9E75", Icon: Database,  gradient: "from-[#1D9E75]/20 to-transparent" },
  systems:    { label: "Systems",    color: "#EA580C", Icon: Cpu,       gradient: "from-[#EA580C]/20 to-transparent" },
  enterprise: { label: "Enterprise", color: "#7F77DD", Icon: Building2, gradient: "from-[#7F77DD]/20 to-transparent" },
} as const;

const DIFFICULTY_INFO = {
  beginner:     { color: "#22c55e", label: "Beginner",     bar: "w-1/3", tip: "Great first language — syntax is forgiving and resources are plentiful." },
  intermediate: { color: "#f59e0b", label: "Intermediate",  bar: "w-2/3", tip: "Requires prior programming knowledge. Expect 2–4 months to get productive." },
  advanced:     { color: "#ef4444", label: "Advanced",      bar: "w-full", tip: "Demands deep systems thinking. Best learned after one simpler language." },
};

const ROADMAP_COLORS: Record<string, string> = {
  aiml:   "#7F77DD",
  webdev: "#378ADD",
  devops: "#1D9E75",
};
const ROADMAP_LABELS: Record<string, string> = { aiml: "AI / ML", webdev: "Web Dev", devops: "DevOps" };

export default function LanguageDrawer({ language, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!language) return null;

  const domain  = DOMAIN_META[language.domain as keyof typeof DOMAIN_META] ?? DOMAIN_META.web;
  const diff    = DIFFICULTY_INFO[language.difficulty];
  const DomIcon = domain.Icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 24, stiffness: 220 }}
        className="relative w-full max-w-md h-full bg-[#0d0f14] border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto"
      >
        {/* Gradient header bg */}
        <div className={`absolute inset-x-0 top-0 h-48 bg-gradient-to-b ${domain.gradient} pointer-events-none`} />

        {/* ── Header ── */}
        <div className="relative z-10 p-6 pb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2"
              style={{ backgroundColor: `${domain.color}20`, borderColor: `${domain.color}40` }}
              dangerouslySetInnerHTML={{ __html: language.logoSvg }}
            />
            <div>
              <h2 className="text-2xl font-black text-white">{language.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <DomIcon className="h-3 w-3" style={{ color: domain.color }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: domain.color }}>
                  {domain.label} Domain
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer shrink-0 mt-1">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content area */}
        <div className="relative z-10 flex-1 p-6 pt-2 space-y-6">

          {/* Tagline */}
          <div className="p-4 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: domain.color }}>Tagline</p>
            <p className="text-sm font-bold text-white/90 italic leading-relaxed">&ldquo;{language.tagline}&rdquo;</p>
          </div>

          {/* Difficulty meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Learning Difficulty</p>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                style={{ color: diff.color, backgroundColor: `${diff.color}20` }}>
                {diff.label}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: diff.bar.replace("w-", "").replace("1/3", "33%").replace("2/3", "66%").replace("full", "100%") }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: diff.color, width: language.difficulty === "beginner" ? "33%" : language.difficulty === "intermediate" ? "66%" : "100%" }}
              />
            </div>
            <p className="text-[10px] text-white/50 font-semibold leading-relaxed">{diff.tip}</p>
          </div>

          {/* Use cases */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" style={{ color: domain.color }} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Core Use Cases</p>
            </div>
            <div className="space-y-2">
              {language.useCases.map((uc, i) => (
                <div key={i}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/6 bg-white/3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: domain.color }} />
                  <span className="text-xs font-semibold text-white/80 leading-relaxed">{uc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interrelation note */}
          <div className="p-4 rounded-2xl border border-white/8 bg-white/3 space-y-2">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-white/40" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">How It Connects</p>
            </div>
            <p className="text-xs font-semibold text-white/75 leading-relaxed">{language.interrelationNote}</p>
          </div>

          {/* Best Resource */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" style={{ color: domain.color }} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Best Free Resource</p>
            </div>
            <a
              href={language.bestResource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/8 transition-all group"
            >
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${domain.color}20` }}>
                <Star className="h-4 w-4" style={{ color: domain.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white">{language.bestResource.title}</p>
                <p className="text-[10px] text-white/50 font-semibold truncate">{language.bestResource.url}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
            </a>
          </div>

          {/* Used in roadmaps */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Compass className="h-3.5 w-3.5" style={{ color: domain.color }} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Appears in Roadmaps</p>
            </div>
            <div className="space-y-2">
              {language.usedInRoadmaps.map((r, i) => {
                const rColor = ROADMAP_COLORS[r.roadmap] ?? "#888";
                return (
                  <Link key={i} href={`/student-hub/roadmaps/${r.roadmap}`}>
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer group transition-all hover:scale-[1.01]"
                      style={{ borderColor: `${rColor}30`, backgroundColor: `${rColor}08` }}>
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: rColor }} />
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: rColor }}>
                          {ROADMAP_LABELS[r.roadmap] ?? r.roadmap}
                        </p>
                        <p className="text-xs font-bold text-white/80">{r.label}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick fact strip */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Domain",     value: domain.label },
              { label: "Difficulty", value: diff.label },
              { label: "Roadmaps",   value: `${language.usedInRoadmaps.length} paths` },
              { label: "Use Cases",  value: `${language.useCases.length} listed` },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-xl border border-white/8 bg-white/3 text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{f.label}</p>
                <p className="text-sm font-black text-white mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="relative z-10 border-t border-white/8 p-5">
          {language.usedInRoadmaps[0] && (
            <Link href={`/student-hub/roadmaps/${language.usedInRoadmaps[0].roadmap}`}>
              <div className="flex items-center justify-between p-4 rounded-2xl cursor-pointer group transition-all hover:scale-[1.01]"
                style={{ background: `linear-gradient(to right, ${domain.color}25, ${domain.color}10)`, border: `1px solid ${domain.color}35` }}>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: domain.color }}>Start Learning {language.name}</p>
                  <p className="text-sm font-black text-white mt-0.5">
                    Go to {ROADMAP_LABELS[language.usedInRoadmaps[0].roadmap]} Roadmap
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" style={{ color: domain.color }} />
              </div>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
