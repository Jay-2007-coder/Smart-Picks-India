"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, ExternalLink, Zap, Terminal, BookOpen, Layers } from "lucide-react";
import { RoadmapPhase, Topic } from "@/data/roadmaps";

interface PhaseNodeProps {
  phase: RoadmapPhase;
  roadmapId: string;
  roadmapColor: string;
  completedTopics: string[];
  onToggleTopic: (topicId: string, totalCount: number) => void;
  isActive: boolean;
}

export default function PhaseNode({
  phase,
  roadmapId,
  roadmapColor,
  completedTopics,
  onToggleTopic,
  isActive
}: PhaseNodeProps) {
  const [isOpen, setIsOpen] = useState(isActive);
  const [selectedTrack, setSelectedTrack] = useState<"nlp" | "cv" | "mlops">("nlp");

  // Load selected track from localStorage if applicable
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

  // Determine topics to render
  const isSpecialization = !!phase.trackChoices;
  const currentTrackData = isSpecialization && phase.trackChoices ? phase.trackChoices[selectedTrack] : null;

  const topicsToRender = currentTrackData ? currentTrackData.topics : phase.topics;
  const projectIdea = currentTrackData ? currentTrackData.projectIdea : phase.projectIdea;
  const resources = currentTrackData ? currentTrackData.resources : phase.resources;

  // Calculate completed count
  const totalTopics = topicsToRender.length;
  const completedInPhase = topicsToRender.filter(t => completedTopics.includes(t.id)).length;
  const isPhaseCompleted = totalTopics > 0 && completedInPhase === totalTopics;

  return (
    <div
      className={`relative border rounded-3xl bg-card transition-all duration-300 ${
        isPhaseCompleted
          ? "border-emerald-500/30 shadow-sm shadow-emerald-500/5 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.005]"
          : isActive
          ? "shadow-lg"
          : "border-border/80 shadow-sm hover:border-border"
      }`}
      style={{
        boxShadow: isActive && !isPhaseCompleted ? `0 10px 30px -10px ${roadmapColor}30` : undefined,
        borderColor: isActive && !isPhaseCompleted ? roadmapColor : undefined
      }}
    >
      {/* Active Phase Pulsing Border overlay */}
      {isActive && !isPhaseCompleted && (
        <span
          className="absolute -inset-[1px] rounded-3xl pointer-events-none border animate-pulse"
          style={{ borderColor: roadmapColor, opacity: 0.7 }}
        />
      )}

      {/* Header Panel */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-start gap-4 flex-1">
          {/* Step Icon Badge */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm transition-all duration-300 ${
              isPhaseCompleted
                ? "bg-emerald-500 text-white"
                : "bg-muted text-muted-foreground"
            }`}
            style={{
              backgroundColor: !isPhaseCompleted && isActive ? `${roadmapColor}15` : undefined,
              color: !isPhaseCompleted && isActive ? roadmapColor : undefined
            }}
          >
            {isPhaseCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span>{phase.id.split("-").pop()}</span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base text-foreground leading-snug">
                {phase.title}
              </h3>
              {isActive && !isPhaseCompleted && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white select-none animate-pulse"
                  style={{ backgroundColor: roadmapColor }}
                >
                  Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold flex-wrap">
              <span>{phase.duration}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5 flex-wrap">
                {phase.languages.map(lang => (
                  <span
                    key={lang}
                    className="px-1.5 py-0.5 rounded-md bg-muted text-foreground/80 font-black text-[9px] uppercase border border-border/40"
                  >
                    {lang}
                  </span>
                ))}
              </span>
              <span>•</span>
              <span className="text-muted-foreground/90">
                {completedInPhase}/{totalTopics} Modules
              </span>
            </div>
          </div>
        </div>

        <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expandable Details */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-border/50 pt-5 space-y-6">
              {/* Specialization Track Selector */}
              {isSpecialization && (
                <div className="bg-muted/30 p-1.5 rounded-2xl border border-border/60">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2.5 pb-1">
                    Choose Specialization Track:
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "nlp", label: "NLP / Transformers" },
                      { id: "cv", label: "Computer Vision" },
                      { id: "mlops", label: "MLOps / Production" }
                    ].map(track => (
                      <button
                        key={track.id}
                        onClick={() => handleTrackChange(track.id as any)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                          selectedTrack === track.id
                            ? "bg-card border border-border shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {track.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics Checkbox List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
                  <Layers className="h-3.5 w-3.5" /> Core Concepts Checklist
                </h4>
                <div className="grid gap-2">
                  {topicsToRender.map(topic => {
                    const isTopicCompleted = completedTopics.includes(topic.id);
                    return (
                      <div
                        key={topic.id}
                        onClick={() => onToggleTopic(topic.id, totalTopics)}
                        className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                          isTopicCompleted
                            ? "bg-emerald-500/[0.02] border-emerald-500/15 text-muted-foreground hover:border-emerald-500/30"
                            : "bg-muted/20 border-border/60 hover:bg-muted/40 hover:border-muted-foreground/20 text-foreground"
                        }`}
                      >
                        {/* Custom checkbox */}
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            isTopicCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-muted-foreground/30 group-hover:border-muted-foreground/60 bg-card"
                          }`}
                        >
                          {isTopicCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>

                        <span
                          className={`text-xs font-bold transition-all ${
                            isTopicCompleted
                              ? "line-through text-muted-foreground/75"
                              : "text-foreground"
                          }`}
                        >
                          {topic.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resource Links */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
                  <BookOpen className="h-3.5 w-3.5" /> Curated Free Resources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resources.map(res => (
                    <a
                      key={res.title}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/80 text-xs font-black hover:bg-muted text-foreground transition-all shadow-sm"
                    >
                      <span>{res.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Mini Project */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" /> Solidifying Mini Project
                </h4>
                <p className="text-xs font-bold leading-relaxed text-foreground/90">
                  {projectIdea}
                </p>
              </div>

              {/* Interconnection alert */}
              {phase.interconnects.length > 0 && (
                <div className="flex gap-2 p-3.5 rounded-2xl bg-brand-500/[0.03] border border-brand-500/10 text-[11px] text-brand-650 dark:text-brand-450 font-semibold leading-relaxed">
                  <Zap className="h-4 w-4 shrink-0 mt-0.5 animate-pulse text-brand-500" />
                  <span>
                    <strong>Roadmap Overlap:</strong> This phase connects directly with key topics from{" "}
                    {phase.interconnects.includes("webdev-0") && "Web Dev Phase 0 (Absolute Basics) "}
                    {phase.interconnects.includes("devops-0") && "DevOps Phase 0 (Linux/Networking) "}
                    {phase.interconnects.includes("webdev-3") && "Web Dev Phase 3 (REST APIs) "}
                    {phase.interconnects.includes("devops-2") && "DevOps Phase 2 (Containers & Orchestration) "}
                    {phase.interconnects.includes("devops-3") && "DevOps Phase 3 (Cloud Environments) "}
                    {phase.interconnects.includes("devops-4") && "DevOps Phase 4 (Observability Stack) "}
                    . Skills here transfer immediately!
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
