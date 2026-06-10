"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, BookOpen, Layers, ArrowRight, UserCheck, Flame, X, RefreshCw } from "lucide-react";
import ProgressRing from "./ProgressRing";
import LanguageGraph from "./LanguageGraph";
import InterconnectionMap from "./InterconnectionMap";
import { ROADMAPS_DATA } from "@/data/roadmaps";
import { LANGUAGES_DATA } from "@/data/languages";
import { useAuth } from "@/hooks/use-auth";

export default function RoadmapOverview() {
  const { user } = useAuth();
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch progress from API or fall back to localStorage
  const fetchProgress = async () => {
    try {
      setLoading(true);
      if (user) {
        const res = await fetch("/api/v1/roadmaps/progress");
        const data = await res.json();
        if (res.ok && data.success) {
          const flatTopics = data.progress.flatMap((p: any) => p.completedTopics);
          setCompletedTopics(flatTopics);
          // Sync to localStorage
          localStorage.setItem(`roadmap-progress-synced`, JSON.stringify(flatTopics));
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch progress from server:", err);
    }

    // Fallback: Read local storage
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("roadmap-progress-flat");
      if (local) {
        setCompletedTopics(JSON.parse(local));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  // Calculate stats for roadmaps
  const getRoadmapStats = (slug: string) => {
    const rData = ROADMAPS_DATA[slug];
    if (!rData) return { percentage: 0, weeksRemaining: 0 };

    let total = 0;
    let completed = 0;
    let weeksRemainingSum = 0;

    const phaseWeeks: Record<string, number> = {
      "aiml-0": 7, "aiml-1": 9, "aiml-2": 11, "aiml-3": 9, "aiml-4": 7,
      "webdev-0": 4, "webdev-1": 6, "webdev-2": 8, "webdev-3": 8, "webdev-4": 4, "webdev-5": 12,
      "devops-0": 5, "devops-1": 4, "devops-2": 9, "devops-3": 10, "devops-4": 6, "devops-5": 12
    };

    rData.phases.forEach(phase => {
      let topics = phase.topics;
      if (phase.trackChoices) {
        let track = "nlp";
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(`roadmap-track-${phase.id}`);
          if (saved && (saved === "nlp" || saved === "cv" || saved === "mlops")) {
            track = saved;
          }
        }
        topics = phase.trackChoices[track]?.topics || [];
      }

      const phaseTotal = topics.length;
      const phaseCompleted = topics.filter(t => completedTopics.includes(t.id)).length;

      total += phaseTotal;
      completed += phaseCompleted;

      const durationWeeks = phaseWeeks[phase.id] || 6;
      const uncompletedRatio = phaseTotal > 0 ? (phaseTotal - phaseCompleted) / phaseTotal : 1;
      weeksRemainingSum += uncompletedRatio * durationWeeks;
    });

    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return {
      percentage,
      weeksRemaining: Math.ceil(weeksRemainingSum)
    };
  };

  const aimlStats = getRoadmapStats("aiml");
  const webdevStats = getRoadmapStats("webdev");
  const devopsStats = getRoadmapStats("devops");

  // Difficulties formatting
  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
  };

  return (
    <div className="space-y-12 select-none relative pb-12">
      {/* Floating My Progress Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-brand-600 hover:bg-brand-700 text-white rounded-full p-4.5 shadow-2xl flex items-center gap-2 font-black text-xs uppercase cursor-pointer hover:scale-105 transition-all"
      >
        <Flame className="h-5 w-5 animate-pulse text-amber-300" />
        <span>My Progress</span>
      </button>

      {/* Header Banner */}
      <div className="relative border-b border-border/80 pb-6 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tech Roadmap Hub</h1>
          <p className="text-sm text-muted-foreground mt-1 font-bold">
            Interactive language ecosystems and structured learning timelines for modern developers.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black uppercase bg-brand-500/10 text-brand-600 dark:text-brand-400 px-3.5 py-2 rounded-2xl border border-brand-500/20">
          <Compass className="h-4.5 w-4.5" /> Roadmaps
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.values(ROADMAPS_DATA).map(rData => {
          const stats = getRoadmapStats(rData.id);
          const isAiml = rData.id === "aiml";
          const isWeb = rData.id === "webdev";
          const colorClass = isAiml
            ? "border-purple-500/25 hover:border-purple-500/55"
            : isWeb
            ? "border-blue-500/25 hover:border-blue-500/55"
            : "border-teal-500/25 hover:border-teal-500/55";

          return (
            <Link key={rData.id} href={`/student-hub/roadmaps/${rData.id}`}>
              <div
                className={`group p-6 rounded-3xl border bg-card/60 backdrop-blur-md transition-all duration-300 flex items-center justify-between cursor-pointer ${colorClass}`}
              >
                <div className="space-y-3 flex-1 pr-4 text-left">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
                    style={{ color: rData.color, borderColor: `${rData.color}35`, backgroundColor: `${rData.color}08` }}
                  >
                    {rData.phases.length} Phases
                  </span>
                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-brand-500 transition-colors leading-tight">
                    {rData.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                    {rData.path.join(" → ")}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                    Begin Journey <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <ProgressRing
                  percentage={stats.percentage}
                  color={rData.color}
                  size={60}
                  strokeWidth={5}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Language ecosystem map section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Language Ecosystem Map</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Interactive canvas outlining how major computer languages connect, compile under the hood, and deploy.
          </p>
        </div>
        <LanguageGraph />
      </div>

      {/* Quick reference horizontal scroll section */}
      <div className="space-y-4 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Language Quick-Reference Cards</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Key concepts, tags, taglines, and use cases for the world&apos;s most popular developer tools.
          </p>
        </div>
        {/* Horizontal scroll grid */}
        <div className="flex overflow-x-auto gap-4.5 pb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {LANGUAGES_DATA.map(lang => (
            <div
              key={lang.id}
              className="w-[230px] shrink-0 border border-border/80 bg-card p-4 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Top Logo row */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: lang.logoSvg }}
                  />
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${difficultyColors[lang.difficulty]}`}>
                    {lang.difficulty}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-foreground">{lang.name}</h4>
                  <p className="text-[10px] text-muted-foreground italic font-semibold leading-tight">
                    &ldquo;{lang.tagline}&rdquo;
                  </p>
                </div>

                {/* Bullets */}
                <ul className="space-y-1 list-disc pl-3 text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  {lang.useCases.slice(0, 3).map((use, i) => (
                    <li key={i}>{use.split(" (")[0]}</li>
                  ))}
                </ul>
              </div>

              {/* Bottom tag info */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                  {lang.usedInRoadmaps.map((r, i) => (
                    <span
                      key={i}
                      className="px-1 py-0.5 rounded bg-muted font-black text-[8px] text-foreground/80 uppercase tracking-wide border border-border/40"
                    >
                      {r.roadmap === "aiml" ? "AI" : r.roadmap === "webdev" ? "Web" : "Ops"}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground leading-snug font-bold border-l border-brand-500/30 pl-1.5 italic">
                  {lang.interrelationNote.split(". ")[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interconnection map section */}
      <InterconnectionMap />

      {/* Side drawer panel for my progress */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-background/55 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="relative w-full max-w-sm h-full bg-card border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-brand-600" />
                    <h3 className="font-extrabold text-lg text-foreground">My Roadmap Progress</h3>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Track stats */}
                  {[
                    { id: "aiml", title: "AI / ML Engineer", stats: aimlStats, color: "#7F77DD" },
                    { id: "webdev", title: "Web Developer", stats: webdevStats, color: "#378ADD" },
                    { id: "devops", title: "DevOps / Cloud Engineer", stats: devopsStats, color: "#1D9E75" }
                  ].map(track => (
                    <div key={track.id} className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5">
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-xs text-foreground">{track.title}</span>
                        <span className="text-[10px] font-black text-muted-foreground">{Math.round(track.stats.percentage)}%</span>
                      </div>

                      {/* Bar */}
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${track.stats.percentage}%`,
                            backgroundColor: track.color
                          }}
                        />
                      </div>

                      {/* Weeks remaining */}
                      <div className="flex justify-between text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                        <span>Est. Weeks left:</span>
                        <span className="text-foreground">{track.stats.weeksRemaining} Weeks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync controls */}
              <div className="border-t border-border/60 pt-4 mt-6 flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>Account Status: {user ? "Logged In" : "Offline / Guest"}</span>
                <button
                  onClick={fetchProgress}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-[10px] font-black uppercase text-foreground cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Sync
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
