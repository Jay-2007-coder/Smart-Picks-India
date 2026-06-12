"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, CheckCircle2, ExternalLink, Zap,
  Terminal, BookOpen, Layers, Clock, Code2, Play, FileText, Trophy, AlertCircle
} from "lucide-react";
import { RoadmapPhase } from "@/data/roadmaps";

interface PhaseNodeProps {
  phase: RoadmapPhase;
  roadmapId: string;
  roadmapColor: string;
  completedTopics: string[];
  onToggleTopic: (topicId: string, totalCount: number) => void;
  isActive: boolean;
  phaseIndex?: number;
  totalPhases?: number;
}

const RESOURCE_ICON: Record<string, React.ElementType> = {
  youtube: Play,
  docs:    FileText,
  roadmap: Layers,
  other:   BookOpen,
};

export default function PhaseNode({
  phase, roadmapId, roadmapColor, completedTopics, onToggleTopic,
  isActive, phaseIndex = 0, totalPhases = 1
}: PhaseNodeProps) {
  const [isOpen, setIsOpen] = useState(isActive);
  const [selectedTrack, setSelectedTrack] = useState<"nlp" | "cv" | "mlops">("nlp");

  useEffect(() => {
    if (phase.trackChoices) {
      const saved = localStorage.getItem(`roadmap-track-${phase.id}`);
      if (saved && (saved === "nlp" || saved === "cv" || saved === "mlops")) {
        setSelectedTrack(saved as any);
      }
    }
  }, [phase.id, phase.trackChoices]);

  const handleTrackChange = (track: "nlp" | "cv" | "mlops") => {
    setSelectedTrack(track);
    localStorage.setItem(`roadmap-track-${phase.id}`, track);
  };

  const isSpecialization = !!phase.trackChoices;
  const currentTrackData = isSpecialization && phase.trackChoices ? phase.trackChoices[selectedTrack] : null;
  const topicsToRender = currentTrackData ? currentTrackData.topics : phase.topics;
  const projectIdea    = currentTrackData ? currentTrackData.projectIdea : phase.projectIdea;
  const resources      = currentTrackData ? currentTrackData.resources : phase.resources;

  const totalTopics       = topicsToRender.length;
  const completedInPhase  = topicsToRender.filter(t => completedTopics.includes(t.id)).length;
  const isPhaseCompleted  = totalTopics > 0 && completedInPhase === totalTopics;
  const pct               = totalTopics > 0 ? (completedInPhase / totalTopics) * 100 : 0;

  return (
    <motion.div
      layout
      className={`relative rounded-3xl border-2 bg-card overflow-hidden transition-all duration-300 ${
        isPhaseCompleted
          ? "border-emerald-500/30 bg-emerald-500/[0.01]"
          : isActive
          ? "shadow-xl"
          : "border-border/60 shadow-sm hover:border-border/90"
      }`}
      style={{
        borderColor: isActive && !isPhaseCompleted ? roadmapColor : undefined,
        boxShadow:   isActive && !isPhaseCompleted ? `0 12px 40px -10px ${roadmapColor}30` : undefined,
      }}
    >
      {/* Active pulsing glow rim */}
      {isActive && !isPhaseCompleted && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-[1px] rounded-3xl pointer-events-none border"
          style={{ borderColor: roadmapColor }}
        />
      )}

      {/* Completed gradient wash */}
      {isPhaseCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      )}

      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-5 sm:p-6 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Phase badge */}
          <div
            className="w-11 h-11 rounded-2xl shrink-0 flex flex-col items-center justify-center text-center transition-all duration-300"
            style={{
              backgroundColor: isPhaseCompleted ? "#22c55e" : `${roadmapColor}18`,
              color: isPhaseCompleted ? "#fff" : roadmapColor,
            }}
          >
            {isPhaseCompleted ? (
              <Trophy className="h-5 w-5" />
            ) : (
              <>
                <span className="text-[8px] font-black uppercase opacity-70 leading-none">Ph</span>
                <span className="text-lg font-black leading-none">{phaseIndex}</span>
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base text-foreground leading-tight">{phase.title}</h3>
              {isActive && !isPhaseCompleted && (
                <motion.span
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: roadmapColor }}
                >
                  Active Phase
                </motion.span>
              )}
              {isPhaseCompleted && (
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                  ✓ Complete
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold flex-wrap">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{phase.duration}</span>
              <div className="flex items-center gap-1 flex-wrap">
                {phase.languages.map(lang => (
                  <span key={lang} className="px-1.5 py-0.5 rounded-md bg-muted font-black text-[9px] uppercase border border-border/40 text-foreground/80">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Inline mini progress */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: isPhaseCompleted ? "#22c55e" : roadmapColor }}
                />
              </div>
              <span className="text-[10px] font-black whitespace-nowrap" style={{ color: isPhaseCompleted ? "#22c55e" : roadmapColor }}>
                {completedInPhase}/{totalTopics}
              </span>
            </div>
          </div>
        </div>

        <button className="ml-3 p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors shrink-0">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 border-t border-border/50 pt-5 space-y-6">

              {/* Specialization track selector */}
              {isSpecialization && (
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Choose Your Specialization:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "nlp",    label: "NLP / Transformers", emoji: "🤖" },
                      { id: "cv",     label: "Computer Vision",    emoji: "👁️" },
                      { id: "mlops",  label: "MLOps / Prod",       emoji: "⚙️" },
                    ].map(track => (
                      <button
                        key={track.id}
                        onClick={() => handleTrackChange(track.id as any)}
                        className={`py-2.5 px-2 text-center rounded-xl text-[10px] font-black transition-all cursor-pointer space-y-0.5 ${
                          selectedTrack === track.id
                            ? "bg-card border-2 shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
                        }`}
                        style={{ borderColor: selectedTrack === track.id ? roadmapColor : undefined }}
                      >
                        <div>{track.emoji}</div>
                        <div>{track.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics Checklist */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Core Concepts Checklist
                  <span className="ml-auto font-black" style={{ color: isPhaseCompleted ? "#22c55e" : roadmapColor }}>
                    {completedInPhase}/{totalTopics} done
                  </span>
                </h4>
                <div className="grid gap-1.5">
                  {topicsToRender.map((topic, ti) => {
                    const done = completedTopics.includes(topic.id);
                    return (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ti * 0.03 }}
                        onClick={() => onToggleTopic(topic.id, totalTopics)}
                        className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                          done
                            ? "bg-emerald-500/[0.04] border-emerald-500/15 hover:border-emerald-500/30"
                            : "bg-muted/20 border-border/50 hover:bg-muted/40 hover:border-muted-foreground/25"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                            done
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-muted-foreground/30 group-hover:border-muted-foreground/70 bg-card"
                          }`}
                        >
                          {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <span className={`text-xs font-bold transition-all leading-snug ${
                          done ? "line-through text-muted-foreground/60" : "text-foreground"
                        }`}>
                          {topic.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Two-column: Resources + Project */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Resources */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Free Resources
                  </h4>
                  <div className="flex flex-col gap-2">
                    {resources.map(res => {
                      const Icon = RESOURCE_ICON[res.type] || BookOpen;
                      return (
                        <a
                          key={res.title}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/70 text-xs font-bold hover:bg-muted hover:border-border transition-all shadow-sm"
                        >
                          <div className="p-1.5 rounded-lg bg-muted group-hover:bg-card transition-colors">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="flex-1 truncate">{res.title}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Mini project idea */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5" /> Solidifying Project
                  </h4>
                  <div className="h-full p-3.5 rounded-xl border border-border/50 bg-muted/30 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 shrink-0" style={{ color: roadmapColor }} />
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: roadmapColor }}>Build This</span>
                    </div>
                    <p className="text-xs font-bold leading-relaxed text-foreground/90">{projectIdea}</p>
                  </div>
                </div>
              </div>

              {/* Interconnection alert */}
              {phase.interconnects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 p-4 rounded-2xl border border-brand-500/15 bg-brand-500/[0.04]"
                >
                  <Zap className="h-4 w-4 shrink-0 mt-0.5 text-brand-500 animate-pulse" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-brand-500">Roadmap Cross-Link</p>
                    <p className="text-[11px] font-semibold text-brand-650 dark:text-brand-450 leading-relaxed">
                      This phase overlaps with{" "}
                      {phase.interconnects.includes("webdev-0") && <strong>Web Dev Phase 0 (Basics) </strong>}
                      {phase.interconnects.includes("devops-0") && <strong>DevOps Phase 0 (Linux) </strong>}
                      {phase.interconnects.includes("webdev-3") && <strong>Web Dev Phase 3 (REST APIs) </strong>}
                      {phase.interconnects.includes("devops-2") && <strong>DevOps Phase 2 (Containers) </strong>}
                      {phase.interconnects.includes("devops-3") && <strong>DevOps Phase 3 (Cloud) </strong>}
                      {phase.interconnects.includes("devops-4") && <strong>DevOps Phase 4 (Observability) </strong>}
                      — skills from here directly transfer!
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
