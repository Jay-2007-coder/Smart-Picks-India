"use client";

import React, { useState, useEffect } from "react";
import { RoadmapData } from "@/data/roadmaps";
import PhaseNode from "./PhaseNode";

interface RoadmapTimelineProps {
  roadmap: RoadmapData;
  completedTopics: string[];
  onToggleTopic: (topicId: string, totalCount: number) => void;
}

export default function RoadmapTimeline({
  roadmap,
  completedTopics,
  onToggleTopic
}: RoadmapTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Recalculate active phase index based on completed topics
  useEffect(() => {
    const activeIdx = roadmap.phases.findIndex(phase => {
      let topics = phase.topics;
      if (phase.trackChoices) {
        let track = "nlp";
        const saved = localStorage.getItem(`roadmap-track-${phase.id}`);
        if (saved && (saved === "nlp" || saved === "cv" || saved === "mlops")) {
          track = saved;
        }
        topics = phase.trackChoices[track]?.topics || [];
      }
      const completedCount = topics.filter(t => completedTopics.includes(t.id)).length;
      return completedCount < topics.length;
    });

    setActiveIndex(activeIdx === -1 ? roadmap.phases.length - 1 : activeIdx);
  }, [completedTopics, roadmap.phases]);

  return (
    <div className="relative pl-10 sm:pl-12 space-y-8 py-2 select-none">
      {/* Central Timeline Vertical line */}
      <div
        className="absolute left-[19px] sm:left-[23px] top-6 bottom-6 w-0.5 bg-border/60 rounded-full"
        style={{
          background: `linear-gradient(to bottom, ${roadmap.color} 0%, var(--color-border) 100%)`
        }}
      />

      {roadmap.phases.map((phase, idx) => (
        <div key={phase.id} className="relative group">
          {/* Glowing connector point on the vertical line */}
          <div
            className={`absolute -left-[31px] sm:-left-[35px] top-5 w-3.5 h-3.5 rounded-full border-2 bg-card z-10 transition-all duration-300 ${
              activeIndex === idx
                ? "scale-125 border-foreground"
                : completedTopics.some(tId => tId.startsWith(phase.id))
                ? "border-emerald-500 bg-emerald-500 shadow-sm"
                : "border-muted-foreground/30 group-hover:border-muted-foreground/60"
            }`}
            style={{
              borderColor: activeIndex === idx ? roadmap.color : undefined,
              boxShadow: activeIndex === idx ? `0 0 10px ${roadmap.color}` : undefined
            }}
          />

          <PhaseNode
            phase={phase}
            roadmapId={roadmap.id}
            roadmapColor={roadmap.color}
            completedTopics={completedTopics}
            onToggleTopic={onToggleTopic}
            isActive={activeIndex === idx}
          />
        </div>
      ))}
    </div>
  );
}
