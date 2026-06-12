"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, BookOpen, Layers, ArrowRight, UserCheck, Flame, X, RefreshCw,
  Brain, Globe, Server, Target, Clock, Star, TrendingUp, Zap, GitBranch,
  CheckCircle, BarChart3, Rocket
} from "lucide-react";
import ProgressRing from "./ProgressRing";
import LanguageGraph from "./LanguageGraph";
import InterconnectionMap from "./InterconnectionMap";
import { ROADMAPS_DATA } from "@/data/roadmaps";
import { LANGUAGES_DATA } from "@/data/languages";
import { useAuth } from "@/hooks/use-auth";

const ROADMAP_META: Record<string, {
  icon: React.ElementType;
  gradient: string;
  lightGlow: string;
  outcome: string;
  salary: string;
  companies: string[];
  totalWeeks: string;
  border: string;
  bgCard: string;
}> = {
  aiml: {
    icon: Brain,
    gradient: "from-[#7F77DD]/20 via-[#7F77DD]/5 to-transparent",
    lightGlow: "#7F77DD",
    outcome: "ML / AI Engineer",
    salary: "₹12L – ₹40L+",
    companies: ["Google", "OpenAI", "Zoho", "Flipkart"],
    totalWeeks: "40+ Weeks",
    border: "border-[#7F77DD]/25 hover:border-[#7F77DD]/60",
    bgCard: "hover:shadow-[0_8px_40px_-8px_#7F77DD30]",
  },
  webdev: {
    icon: Globe,
    gradient: "from-[#378ADD]/20 via-[#378ADD]/5 to-transparent",
    lightGlow: "#378ADD",
    outcome: "Full-Stack Engineer",
    salary: "₹8L – ₹28L+",
    companies: ["Razorpay", "Zepto", "Swiggy", "Startups"],
    totalWeeks: "42 Weeks",
    border: "border-[#378ADD]/25 hover:border-[#378ADD]/60",
    bgCard: "hover:shadow-[0_8px_40px_-8px_#378ADD30]",
  },
  devops: {
    icon: Server,
    gradient: "from-[#1D9E75]/20 via-[#1D9E75]/5 to-transparent",
    lightGlow: "#1D9E75",
    outcome: "DevOps / Cloud SRE",
    salary: "₹10L – ₹35L+",
    companies: ["Amazon", "Microsoft", "Infosys", "TCS"],
    totalWeeks: "46 Weeks",
    border: "border-[#1D9E75]/25 hover:border-[#1D9E75]/60",
    bgCard: "hover:shadow-[0_8px_40px_-8px_#1D9E7530]",
  },
};

const STATS_HIGHLIGHTS = [
  { icon: Target, label: "Structured Phases", value: "17", suffix: " total", color: "text-purple-500" },
  { icon: BookOpen, label: "Free Resources", value: "60+", suffix: "", color: "text-blue-500" },
  { icon: Clock, label: "Weeks of Content", value: "128+", suffix: " hrs", color: "text-emerald-500" },
  { icon: Star, label: "XP Milestones", value: "50", suffix: " pts", color: "text-amber-500" },
];

export default function RoadmapOverview() {
  const { user } = useAuth();
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"roadmaps" | "languages" | "connections">("roadmaps");

  const fetchProgress = async () => {
    try {
      setLoading(true);
      if (user) {
        const res = await fetch("/api/v1/roadmaps/progress");
        const data = await res.json();
        if (res.ok && data.success) {
          const flatTopics = data.progress.flatMap((p: any) => p.completedTopics);
          setCompletedTopics(flatTopics);
          localStorage.setItem(`roadmap-progress-synced`, JSON.stringify(flatTopics));
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("roadmap-progress-flat");
      if (local) setCompletedTopics(JSON.parse(local));
    }
    setLoading(false);
  };

  useEffect(() => { fetchProgress(); }, [user]);

  const getRoadmapStats = (slug: string) => {
    const rData = ROADMAPS_DATA[slug];
    if (!rData) return { percentage: 0, weeksRemaining: 0, completed: 0, total: 0 };
    const phaseWeeks: Record<string, number> = {
      "aiml-0": 7, "aiml-1": 9, "aiml-2": 11, "aiml-3": 9, "aiml-4": 7,
      "webdev-0": 4, "webdev-1": 6, "webdev-2": 8, "webdev-3": 8, "webdev-4": 4, "webdev-5": 12,
      "devops-0": 5, "devops-1": 4, "devops-2": 9, "devops-3": 10, "devops-4": 6, "devops-5": 12,
    };
    let total = 0, completed = 0, weeksRemainingSum = 0;
    rData.phases.forEach(phase => {
      let topics = phase.topics;
      if (phase.trackChoices && typeof window !== "undefined") {
        let track = "nlp";
        const saved = localStorage.getItem(`roadmap-track-${phase.id}`);
        if (saved && (saved === "nlp" || saved === "cv" || saved === "mlops")) track = saved;
        topics = phase.trackChoices[track]?.topics || [];
      }
      const phaseTotal = topics.length;
      const phaseCompleted = topics.filter(t => completedTopics.includes(t.id)).length;
      total += phaseTotal;
      completed += phaseCompleted;
      const durationWeeks = phaseWeeks[phase.id] || 6;
      const ratio = phaseTotal > 0 ? (phaseTotal - phaseCompleted) / phaseTotal : 1;
      weeksRemainingSum += ratio * durationWeeks;
    });
    return { percentage: total > 0 ? (completed / total) * 100 : 0, weeksRemaining: Math.ceil(weeksRemainingSum), completed, total };
  };

  const roadmapStats = {
    aiml: getRoadmapStats("aiml"),
    webdev: getRoadmapStats("webdev"),
    devops: getRoadmapStats("devops"),
  };

  const totalCompleted = Object.values(roadmapStats).reduce((s, r) => s + r.completed, 0);
  const totalTopics = Object.values(roadmapStats).reduce((s, r) => s + r.total, 0);
  const overallPct = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  const NAV_TABS = [
    { id: "roadmaps", label: "Career Paths", icon: Rocket },
    { id: "languages", label: "Language Map", icon: GitBranch },
    { id: "connections", label: "Interconnections", icon: Zap },
  ] as const;

  return (
    <div className="space-y-10 select-none relative pb-16">
      {/* Floating Progress FAB */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2.5 font-black text-xs uppercase tracking-wider cursor-pointer border border-white/10"
      >
        <Flame className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
        <span>My Progress</span>
        {overallPct > 0 && (
          <span className="bg-white/20 rounded-lg px-1.5 py-0.5 text-[10px]">{overallPct}%</span>
        )}
      </motion.button>

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-8 sm:p-10">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-500/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-blue-500/6 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/8 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-widest">
              <Compass className="h-3.5 w-3.5" /> Tech Roadmap Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              Your Complete<br />
              <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 bg-clip-text text-transparent">Engineering Journey</span>
            </h1>
            <p className="text-sm text-muted-foreground font-semibold leading-relaxed max-w-lg">
              Structured, interactive career roadmaps for AI/ML, Web Development, and DevOps. Check off topics, earn XP, and track progress across every phase.
            </p>
          </div>

          {/* Global stats ring */}
          <div className="shrink-0 flex flex-col items-center gap-2 p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <ProgressRing percentage={overallPct} color="#7F77DD" size={80} strokeWidth={7} />
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Overall</p>
              <p className="text-xs font-black text-foreground">{totalCompleted}/{totalTopics} topics</p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS_HIGHLIGHTS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/50 border border-border/40"
              >
                <div className={`p-2 rounded-xl bg-muted ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-black text-foreground leading-none">{s.value}<span className="text-[10px] text-muted-foreground font-bold">{s.suffix}</span></p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Section Nav Tabs ── */}
      <div className="flex items-center gap-2 p-1.5 bg-card border border-border/60 rounded-2xl w-fit">
        {NAV_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-colors duration-200 cursor-pointer ${
                activeSection === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeSection === tab.id && (
                <motion.div
                  layoutId="roadmapNavPill"
                  className="absolute inset-0 bg-muted rounded-xl border border-border/60"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">

        {/* CAREER PATHS TAB */}
        {activeSection === "roadmaps" && (
          <motion.div
            key="roadmaps"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-8"
          >
            <div className="grid lg:grid-cols-3 gap-6">
              {Object.values(ROADMAPS_DATA).map((rData, idx) => {
                const meta = ROADMAP_META[rData.id];
                const stats = roadmapStats[rData.id as keyof typeof roadmapStats];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={rData.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link href={`/student-hub/roadmaps/${rData.id}`}>
                      <div className={`group relative overflow-hidden h-full p-6 rounded-3xl border-2 bg-card/60 backdrop-blur-sm transition-all duration-300 cursor-pointer ${meta.border} ${meta.bgCard}`}>
                        {/* Gradient orb */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: meta.lightGlow }} />

                        <div className="relative z-10 space-y-5">
                          {/* Icon + Phase badge */}
                          <div className="flex items-start justify-between">
                            <div className="p-3 rounded-2xl border" style={{ backgroundColor: `${meta.lightGlow}15`, borderColor: `${meta.lightGlow}30` }}>
                              <Icon className="h-6 w-6" style={{ color: meta.lightGlow }} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: meta.lightGlow, borderColor: `${meta.lightGlow}35`, backgroundColor: `${meta.lightGlow}08` }}>
                              {rData.phases.length} Phases
                            </span>
                          </div>

                          {/* Title & path */}
                          <div>
                            <h3 className="font-black text-xl text-foreground leading-tight group-hover:text-brand-500 transition-colors">
                              {rData.title}
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-semibold mt-1 leading-relaxed">
                              {rData.path.join(" → ")}
                            </p>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black text-muted-foreground">
                              <span>Your Progress</span>
                              <span style={{ color: meta.lightGlow }}>{Math.round(stats.percentage)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 + 0.3 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: meta.lightGlow }}
                              />
                            </div>
                          </div>

                          {/* Career outcome */}
                          <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 space-y-1.5">
                            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Career Outcome</p>
                            <p className="text-sm font-black text-foreground">{meta.outcome}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] font-bold" style={{ color: meta.lightGlow }}>{meta.salary}</p>
                              <div className="flex gap-1 flex-wrap justify-end">
                                {meta.companies.slice(0, 2).map(c => (
                                  <span key={c} className="text-[8px] font-black bg-muted text-muted-foreground border border-border/40 px-1.5 py-0.5 rounded-md">{c}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Footer row */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                              <Clock className="h-3 w-3" /> {meta.totalWeeks}
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-black transition-transform group-hover:translate-x-1" style={{ color: meta.lightGlow }}>
                              Start Learning <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* How it works strip */}
            <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-card via-muted/20 to-card p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center mb-5">How It Works</p>
              <div className="grid sm:grid-cols-4 gap-4 text-center">
                {[
                  { step: "01", icon: Target, label: "Pick a Path", desc: "Choose AI/ML, Web Dev, or DevOps based on your goal" },
                  { step: "02", icon: CheckCircle, label: "Complete Topics", desc: "Check off skills as you learn each phase" },
                  { step: "03", icon: TrendingUp, label: "Earn XP", desc: "Finish a phase milestone and unlock +10 XP" },
                  { step: "04", icon: Rocket, label: "Land the Job", desc: "Build real projects and apply with confidence" },
                ].map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-brand-500" />
                        </div>
                      </div>
                      <p className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Step {step.step}</p>
                      <p className="text-xs font-black text-foreground">{step.label}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* LANGUAGE MAP TAB */}
        {activeSection === "languages" && (
          <motion.div
            key="languages"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-xl font-extrabold text-foreground mb-1">Language Ecosystem Map</h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Interactive canvas showing how major languages connect, compile, and deploy across the tech stack.
              </p>
            </div>
            <LanguageGraph />

            {/* Quick Reference Cards */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">Language Quick-Reference Cards</h2>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  Key concepts, taglines, and use cases for the most in-demand developer tools.
                </p>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {LANGUAGES_DATA.map(lang => (
                  <div
                    key={lang.id}
                    className="w-[220px] shrink-0 border border-border/80 bg-card p-4 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-border transition-all duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center" dangerouslySetInnerHTML={{ __html: lang.logoSvg }} />
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${difficultyColors[lang.difficulty]}`}>
                          {lang.difficulty}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-foreground">{lang.name}</h4>
                        <p className="text-[10px] text-muted-foreground italic font-semibold leading-tight mt-0.5">&ldquo;{lang.tagline}&rdquo;</p>
                      </div>
                      <ul className="space-y-1 list-disc pl-3 text-[10px] text-muted-foreground font-semibold leading-relaxed">
                        {lang.useCases.slice(0, 3).map((use, i) => (
                          <li key={i}>{use.split(" (")[0]}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex flex-wrap gap-1">
                        {lang.usedInRoadmaps.map((r, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-muted font-black text-[8px] text-foreground/80 uppercase tracking-wide border border-border/40">
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
          </motion.div>
        )}

        {/* INTERCONNECTIONS TAB */}
        {activeSection === "connections" && (
          <motion.div
            key="connections"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <InterconnectionMap />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="relative w-full max-w-sm h-full bg-card border-l border-border p-6 shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                    <BarChart3 className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-black text-base text-foreground">My Progress</h3>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Overall ring */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 to-transparent border border-brand-500/20 mb-6">
                <ProgressRing percentage={overallPct} color="#7F77DD" size={60} strokeWidth={5} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-black text-foreground">{overallPct}%</p>
                  <p className="text-[11px] text-muted-foreground font-bold">{totalCompleted} / {totalTopics} topics</p>
                </div>
              </div>

              {/* Per-path stats */}
              <div className="space-y-4 flex-1">
                {([
                  { id: "aiml",   title: "AI / ML Engineer",     color: "#7F77DD", icon: Brain  },
                  { id: "webdev", title: "Web Developer",         color: "#378ADD", icon: Globe  },
                  { id: "devops", title: "DevOps / Cloud",        color: "#1D9E75", icon: Server },
                ] as const).map(track => {
                  const s = roadmapStats[track.id];
                  const Icon = track.icon;
                  return (
                    <Link key={track.id} href={`/student-hub/roadmaps/${track.id}`}>
                      <div className="group p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3 hover:border-border cursor-pointer transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${track.color}15` }}>
                              <Icon className="h-3.5 w-3.5" style={{ color: track.color }} />
                            </div>
                            <span className="font-black text-xs text-foreground">{track.title}</span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black">
                            <span className="text-muted-foreground">{s.completed}/{s.total} topics</span>
                            <span style={{ color: track.color }}>{Math.round(s.percentage)}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${s.percentage}%` }}
                              transition={{ duration: 0.9, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: track.color }}
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold">Est. {s.weeksRemaining} weeks remaining</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Sync row */}
              <div className="border-t border-border/60 pt-4 mt-4 flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>{user ? `✅ ${user.name ?? "Logged In"}` : "⚠️ Offline / Guest"}</span>
                <button
                  onClick={fetchProgress}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted font-black text-[10px] uppercase cursor-pointer"
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
