"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Compass, Calendar, Award, RefreshCw, Sparkles, CheckSquare } from "lucide-react";
import { ROADMAPS_DATA } from "@/data/roadmaps";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import ProgressRing from "@/components/roadmap/ProgressRing";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function RoadmapDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { user } = useAuth();
  const roadmap = ROADMAPS_DATA[slug];

  if (!roadmap) {
    notFound();
  }

  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [xpAwardedMsg, setXpAwardedMsg] = useState<string | null>(null);

  // Load progress from API or localStorage
  const loadProgress = async () => {
    try {
      if (user) {
        const res = await fetch("/api/v1/roadmaps/progress");
        const data = await res.json();
        if (res.ok && data.success) {
          const flatTopics = data.progress.flatMap((p: any) => p.completedTopics);
          setCompletedTopics(flatTopics);
          localStorage.setItem(`roadmap-progress-flat`, JSON.stringify(flatTopics));
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
    }

    // Fallback to local storage
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("roadmap-progress-flat");
      if (local) {
        setCompletedTopics(JSON.parse(local));
      }
    }
  };

  useEffect(() => {
    loadProgress();
  }, [user]);

  // Toggle checklist topics
  const handleToggleTopic = async (topicId: string, totalCount: number) => {
    // 1. Instantly update state (optimistic update)
    let updated: string[];
    if (completedTopics.includes(topicId)) {
      updated = completedTopics.filter(id => id !== topicId);
    } else {
      updated = [...completedTopics, topicId];
    }
    setCompletedTopics(updated);
    localStorage.setItem(`roadmap-progress-flat`, JSON.stringify(updated));

    // 2. Determine which phase this topic belongs to
    const phase = roadmap.phases.find(p => {
      // Check normal topics
      if (p.topics.some(t => t.id === topicId)) return true;
      // Check track choice topics
      if (p.trackChoices) {
        return Object.values(p.trackChoices).some(track =>
          track.topics.some(t => t.id === topicId)
        );
      }
      return false;
    });

    if (!phase) return;

    // Determine the phase number index
    const phaseIndex = roadmap.phases.indexOf(phase);

    // Get all topic IDs for this phase (handling specialization track selection)
    let phaseTopics = phase.topics;
    if (phase.trackChoices) {
      let track = "nlp";
      const saved = localStorage.getItem(`roadmap-track-${phase.id}`);
      if (saved && (saved === "nlp" || saved === "cv" || saved === "mlops")) {
        track = saved;
      }
      phaseTopics = phase.trackChoices[track]?.topics || [];
    }

    const phaseTopicIds = phaseTopics.map(t => t.id);
    const completedInPhase = updated.filter(id => phaseTopicIds.includes(id));

    // 3. Send progress save request to backend API
    if (user) {
      try {
        setSyncing(true);
        const res = await fetch("/api/v1/roadmaps/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roadmap: slug,
            phase: phaseIndex,
            completedTopics: completedInPhase,
            totalTopicsCount: totalCount
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.triggerConfetti) {
            // Trigger confetti dynamically
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 130,
              spread: 80,
              origin: { y: 0.6 }
            });
            // Show temporary reward notification toast
            setXpAwardedMsg("🎉 Milestone Reached! +10 XP Awarded!");
            setTimeout(() => setXpAwardedMsg(null), 4000);
          }
        }
      } catch (err) {
        console.error("Failed to sync progress to server:", err);
      } finally {
        setSyncing(false);
      }
    }
  };

  // Calculate statistics
  let totalTopics = 0;
  let completedCount = 0;

  roadmap.phases.forEach(phase => {
    let topics = phase.topics;
    if (phase.trackChoices) {
      let track = "nlp";
      const saved = localStorage.getItem(`roadmap-track-${phase.id}`);
      if (saved && (saved === "nlp" || saved === "cv" || saved === "mlops")) {
        track = saved;
      }
      topics = phase.trackChoices[track]?.topics || [];
    }
    totalTopics += topics.length;
    completedCount += topics.filter(t => completedTopics.includes(t.id)).length;
  });

  const percentage = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12 px-4 select-none">
      <div className="container mx-auto max-w-3xl space-y-8">
        {/* Navigation link row */}
        <div className="flex justify-between items-center">
          <Link
            href="/student-hub/roadmaps"
            className="inline-flex items-center gap-1.5 text-xs font-black text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Roadmap Hub
          </Link>
          <div className="flex items-center gap-2">
            {syncing && <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest animate-pulse">Syncing...</span>}
            <button
              onClick={loadProgress}
              className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
              title="Refresh / Sync progress data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Milestone Toast banner */}
        <AnimatePresence>
          {xpAwardedMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-sm text-center shadow-lg flex items-center justify-center gap-2 select-none"
            >
              <Sparkles className="h-5 w-5 animate-pulse text-amber-200" />
              <span>{xpAwardedMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Header panel */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 bg-card shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ borderColor: `${roadmap.color}30`, boxShadow: `0 8px 40px -12px ${roadmap.color}20` }}
        >
          {/* Ambient glow */}
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: roadmap.color }} />

          <div className="relative z-10 space-y-4 text-left flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border"
                style={{ color: roadmap.color, borderColor: `${roadmap.color}40`, backgroundColor: `${roadmap.color}10` }}
              >
                {roadmap.phases.length} Phases
              </span>
              {percentage >= 100 ? (
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-500">🏆 Completed!</span>
              ) : percentage > 0 ? (
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-500">⚡ In Progress</span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
              {roadmap.title}<br />
              <span className="text-lg font-bold text-muted-foreground">Career Roadmap</span>
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {[
                { icon: Calendar, label: "Duration", value: slug === "aiml" ? "40+ Weeks" : slug === "webdev" ? "42 Weeks" : "46 Weeks" },
                { icon: Award, label: "Reward", value: "10 XP / Phase" },
                { icon: CheckSquare, label: "Progress", value: `${completedCount}/${totalTopics} Topics` },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                      <p className="text-[11px] font-black text-foreground">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm shrink-0">
            <ProgressRing percentage={percentage} color={roadmap.color} size={80} strokeWidth={7} />
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Your Progress</p>
          </div>
        </div>

        {/* Roadmap Stepper */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground">Phase Timeline</h2>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-0.5">
                Click any phase to expand checklists, resources, and project ideas.
              </p>
            </div>
            <span className="text-[10px] font-black text-muted-foreground hidden sm:block">
              {Math.round(percentage)}% Complete
            </span>
          </div>
          <RoadmapTimeline
            roadmap={roadmap}
            completedTopics={completedTopics}
            onToggleTopic={handleToggleTopic}
          />
        </div>

        {/* Interconnection note */}
        <div className="flex gap-3 p-5 rounded-2xl border border-brand-500/15 bg-brand-500/[0.03] text-left">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 shrink-0 h-fit">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-500">Pipeline Cross-Link</h4>
            <p className="text-xs font-bold leading-relaxed text-foreground/80">{roadmap.interconnectionNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
