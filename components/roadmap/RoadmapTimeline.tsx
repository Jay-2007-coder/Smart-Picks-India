"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RoadmapData } from "@/data/roadmaps";
import PhaseNode from "./PhaseNode";
import { CheckCircle2, Lock, Loader } from "lucide-react";

interface RoadmapTimelineProps {
  roadmap: RoadmapData;
  completedTopics: string[];
  onToggleTopic: (topicId: string, totalCount: number) => void;
}

export default function RoadmapTimeline({ roadmap, completedTopics, onToggleTopic }: RoadmapTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const idx = roadmap.phases.findIndex(phase => {
      let topics = phase.topics;
      if (phase.trackChoices) {
        let track = "nlp";
        const saved = localStorage.getItem(`roadmap-track-${phase.id}`);
        if (saved && (saved === "nlp" || saved === "cv" || saved === "mlops")) track = saved;
        topics = phase.trackChoices[track]?.topics || [];
      }
      return topics.filter(t => completedTopics.includes(t.id)).length < topics.length;
    });
    setActiveIndex(idx === -1 ? roadmap.phases.length - 1 : idx);
  }, [completedTopics, roadmap.phases]);

  // Compute per-phase completion for the progress strip
  const phaseCompletions = roadmap.phases.map(phase => {
    let topics = phase.topics;
    if (phase.trackChoices && typeof window !== "undefined") {
      let track = "nlp";
      const saved = localStorage.getItem(`roadmap-track-${phase.id}`);
      if (saved && (saved === "nlp" || saved === "cv" || saved === "mlops")) track = saved;
      topics = phase.trackChoices[track]?.topics || [];
    }
    const done = topics.filter(t => completedTopics.includes(t.id)).length;
    return { done, total: topics.length, pct: topics.length > 0 ? (done / topics.length) * 100 : 0 };
  });

  return (
    <div className="space-y-6">
      {/* Phase Progress Strip */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${roadmap.phases.length}, 1fr)` }}>
        {roadmap.phases.map((phase, idx) => {
          const { done, total, pct } = phaseCompletions[idx];
          const isDone = pct === 100;
          const isActive = activeIndex === idx;
          return (
            <div key={phase.id} className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.07 }}
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: isDone ? "#22c55e" : isActive ? roadmap.color : `${roadmap.color}60` }}
                />
              </div>
              <p className="text-[8px] font-black text-center truncate" style={{ color: isDone ? "#22c55e" : isActive ? roadmap.color : undefined }}>
                {isDone ? "✓" : `${done}/${total}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative pl-10 sm:pl-14 space-y-5 py-2">
        {/* Vertical gradient line */}
        <div
          className="absolute left-[19px] sm:left-[23px] top-4 bottom-4 w-0.5 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${roadmap.color}, ${roadmap.color}20)` }}
        />

        {roadmap.phases.map((phase, idx) => {
          const { done, total, pct } = phaseCompletions[idx];
          const isDone = pct === 100;
          const isActive = activeIndex === idx;
          const isLocked = idx > activeIndex + 1;

          return (
            <div key={phase.id} className="relative">
              {/* Timeline node */}
              <motion.div
                className="absolute z-10"
                style={{ left: "-31px", top: "20px" }}
                whileHover={{ scale: 1.2 }}
              >
                <div
                  className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isDone
                      ? "bg-emerald-500 border-emerald-500"
                      : isActive
                      ? "bg-card border-foreground scale-110"
                      : isLocked
                      ? "bg-muted border-muted-foreground/20"
                      : "bg-card border-muted-foreground/40"
                  }`}
                  style={{
                    borderColor: isActive && !isDone ? roadmap.color : undefined,
                    boxShadow: isActive && !isDone ? `0 0 0 4px ${roadmap.color}20, 0 0 12px ${roadmap.color}40` : undefined,
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  ) : isLocked ? (
                    <Lock className="h-2.5 w-2.5 text-muted-foreground/40" />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: roadmap.color }} />
                  ) : (
                    <span className="text-[8px] font-black text-muted-foreground">{idx}</span>
                  )}
                </div>
              </motion.div>

              <PhaseNode
                phase={phase}
                roadmapId={roadmap.id}
                roadmapColor={roadmap.color}
                completedTopics={completedTopics}
                onToggleTopic={onToggleTopic}
                isActive={isActive}
                phaseIndex={idx}
                totalPhases={roadmap.phases.length}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
