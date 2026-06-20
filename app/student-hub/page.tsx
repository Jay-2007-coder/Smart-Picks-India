"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calculator,
  Calendar,
  FileText,
  ShieldCheck,
  Search,
  MessageSquare,
  FileCode,
  Laptop,
  CheckCircle,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  Trophy,
  Briefcase,
  Compass,
  Zap,
  Lightbulb,
  X,
  Users,
  Star,
  TrendingUp,
  Brain,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

/* ─── Tool Data ─────────────────────────────────────────────────────────────── */
const tools = [
  {
    category: "Academic",
    label: "Academic Utilities",
    gradient: "from-teal-500 to-emerald-600",
    glow: "rgba(20,184,166,0.15)",
    accent: "#14b8a6",
    items: [
      {
        title: "CGPA Calculator",
        description: "Calculate semester-wise SGPA and total overall CGPA targets dynamically.",
        href: "/student-hub/cgpa-calculator",
        icon: Calculator,
        color: "#3b82f6",
        badge: null,
      },
      {
        title: "Attendance Calculator",
        description: "Calculate bunk thresholds to stay above your college's 75% requirements.",
        href: "/student-hub/attendance-calculator",
        icon: Calendar,
        color: "#a855f7",
        badge: null,
      },
      {
        title: "Developer Roadmaps",
        description: "Interactive timelines for Web Dev, AI/ML, and DevOps mapping technology stacks.",
        href: "/student-hub/roadmaps",
        icon: Compass,
        color: "#f43f5e",
        badge: null,
      },
    ],
  },
  {
    category: "Career",
    label: "Career & Placements",
    gradient: "from-blue-500 to-indigo-600",
    glow: "rgba(99,102,241,0.15)",
    accent: "#6366f1",
    items: [
      {
        title: "Resume Builder",
        description: "Generate structured, print-ready 1-page resumes with automated PDF formatting.",
        href: "/student-hub/resume-builder",
        icon: FileText,
        color: "#10b981",
        badge: "Most Used",
      },
      {
        title: "AI Resume Analyzer",
        description: "ATS keyword matching engine comparing resumes to target Job Descriptions.",
        href: "/student-hub/resume-analyzer",
        icon: ShieldCheck,
        color: "#f43f5e",
        badge: null,
      },
      {
        title: "AI Interview Generator",
        description: "Generate mock technical interview questions and sample answers for companies.",
        href: "/student-hub/interview-generator",
        icon: MessageSquare,
        color: "#f59e0b",
        badge: null,
      },
      {
        title: "Career Blueprint Hub",
        description: "Explore interactive industry roadmaps, skill trees, and salary trends for 40+ roles.",
        href: "/student-hub/career-blueprint",
        icon: TrendingUp,
        color: "#06b6d4",
        badge: "New",
      },
      {
        title: "Aptitude Quiz Practice",
        description: "Practice quantitative, logical reasoning, and English grammar exams with timers.",
        href: "/student-hub/aptitude-practice",
        icon: HelpCircle,
        color: "#0ea5e9",
        badge: null,
      },
      {
        title: "Placement Tracker",
        description: "An interactive Kanban board to track company applications, OA rounds, and interviews.",
        href: "/student-hub/placement-tracker",
        icon: Briefcase,
        color: "#818cf8",
        badge: "New",
      },
    ],
  },
  {
    category: "AI",
    label: "AI & Productivity",
    gradient: "from-purple-500 to-violet-600",
    glow: "rgba(139,92,246,0.15)",
    accent: "#8b5cf6",
    items: [
      {
        title: "AI Study Buddy",
        description: "A private chat assistant built specifically to solve concepts and explain bugs.",
        href: "/student-hub/ai-study-assistant",
        icon: Brain,
        color: "#818cf8",
        badge: "Most Used",
      },
      {
        title: "Smart Notes Generator",
        description: "Transform files, scans, and lecture recordings into notes, mind maps, and quizzes.",
        href: "/student-hub/smart-notes",
        icon: FileText,
        color: "#a855f7",
        badge: "New",
      },
      {
        title: "Project Report Writer",
        description: "Create abstracts, design schematics, and test checklists for college reports.",
        href: "/student-hub/project-report-generator",
        icon: FileCode,
        color: "#2dd4bf",
        badge: null,
      },
      {
        title: "DSA Coding Helper",
        description: "Input code blocks to review space/time complexity and get optimizations.",
        href: "/student-hub/coding-helper",
        icon: Laptop,
        color: "#7c3aed",
        badge: "New",
      },
      {
        title: "Portfolio Generator",
        description: "Input projects and skills then instantly download a professional portfolio web file.",
        href: "/student-hub/portfolio-generator",
        icon: CheckCircle,
        color: "#06b6d4",
        badge: "New",
      },
      {
        title: "AI Project Generator",
        description: "Generate unique, anti-cliché project ideas with detailed architectural roadmaps.",
        href: "/student-hub/project-idea-generator",
        icon: Lightbulb,
        color: "#f59e0b",
        badge: "New",
      },
    ],
  },
];

const ALL_CATEGORIES = ["All", "Academic", "Career", "AI"];

const STATS = [
  { icon: Users, label: "Students Active", value: "12K+", color: "#14b8a6" },
  { icon: LayoutGrid, label: "Tools Available", value: "15+", color: "#6366f1" },
  { icon: Star, label: "AI Powered", value: "8", color: "#f59e0b" },
  { icon: TrendingUp, label: "Placements Aided", value: "500+", color: "#f43f5e" },
];

/* ─── Floating Orb ───────────────────────────────────────────────────────────── */
function FloatingOrb({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, filter: "blur(80px)" }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex-1 min-w-[120px]"
    >
      <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-black text-white leading-none">{value}</p>
        <p className="text-[10px] text-white/50 font-semibold mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

/* ─── Tool Card ──────────────────────────────────────────────────────────────── */
function ToolCard({ tool, index }: { tool: (typeof tools)[0]["items"][0]; index: number }) {
  const Icon = tool.icon;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }
  function onMouseLeave() { mouseX.set(0); mouseY.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative"
    >
      {/* Glow on hover */}
      <motion.div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${tool.color}30, transparent 70%)` }}
      />

      <Link href={tool.href} className="block h-full">
        <div className="relative h-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 overflow-hidden
          hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer">

          {/* Animated shine */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease forwards",
              }}
            />
          </div>

          {/* Top section */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${tool.color}20`, border: `1px solid ${tool.color}30` }}
            >
              <Icon className="h-5 w-5" style={{ color: tool.color }} />
            </motion.div>

            {tool.badge && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                style={
                  tool.badge === "Most Used"
                    ? { background: "rgba(20,184,166,0.15)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.3)" }
                    : { background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }
                }
              >
                {tool.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-white text-[14px] leading-snug mb-1.5 group-hover:text-white transition-colors flex items-center gap-1.5">
            {tool.title}
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
            >
              <ArrowRight className="h-3.5 w-3.5" style={{ color: tool.color }} />
            </motion.span>
          </h3>

          {/* Description */}
          <p className="text-[11px] text-white/40 leading-relaxed font-medium">
            {tool.description}
          </p>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
            style={{ background: `linear-gradient(to right, ${tool.color}, transparent)` }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function StudentHub() {
  const { user } = useAuth() as any;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools = useMemo(() => {
    let filtered = tools;

    if (activeCategory !== "All") {
      filtered = filtered.filter(s => s.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.map(section => ({
        ...section,
        items: section.items.filter(
          item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
        ),
      })).filter(s => s.items.length > 0);
    }

    return filtered;
  }, [searchQuery, activeCategory]);

  const totalVisible = filteredTools.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="min-h-screen bg-[#080b14] select-none">
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Ambient background blobs */}
        <FloatingOrb x="5%" y="-20%" size={500} color="rgba(20,184,166,0.4)" delay={0} />
        <FloatingOrb x="70%" y="-10%" size={400} color="rgba(99,102,241,0.3)" delay={1.5} />
        <FloatingOrb x="45%" y="30%" size={300} color="rgba(245,158,11,0.2)" delay={3} />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
        />

        <div className="container-custom max-w-6xl relative z-10 pt-16 pb-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
              style={{ background: "rgba(20,184,166,0.1)", color: "#2dd4bf", borderColor: "rgba(20,184,166,0.3)" }}>
              <GraduationCap className="h-3.5 w-3.5" />
              Student Hub — AI Powered
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-center text-white tracking-tight leading-[1.05] mb-6"
          >
            Your Complete
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #14b8a6 0%, #6366f1 50%, #f59e0b 100%)" }}
            >
              Placement Arsenal
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/50 text-sm sm:text-base font-semibold text-center max-w-xl mx-auto leading-relaxed mb-8"
          >
            15+ AI-powered tools for CGPA, resumes, mock interviews, DSA, aptitude, and more — all in one place.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <Link
              href="/student-hub/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)", boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
            >
              <Trophy className="h-4 w-4" /> View Leaderboard
            </Link>

            {user && (user.role === "admin" || user.hubPlan === "pro") ? (
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white border"
                style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.4)" }}
              >
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                {user.role === "admin" ? "⚡ Admin Active" : "⚡ Pro Active"}
              </div>
            ) : (
              <Link
                href="/student-hub/upgrade"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", boxShadow: "0 0 20px rgba(245,158,11,0.3)" }}
              >
                <Zap className="h-4 w-4 fill-current animate-pulse" /> Upgrade to Pro
              </Link>
            )}
          </motion.div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14"
          >
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}>
                <StatCard {...s} />
              </motion.div>
            ))}
          </motion.div>

          {/* ── SEARCH BAR ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative flex items-center rounded-2xl border transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: searchQuery ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.08)" }}
            >
              <Search className="h-4 w-4 text-white/30 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools… Resume, CGPA, DSA, Interview…"
                className="w-full bg-transparent border-none outline-none py-3.5 px-3 text-xs text-white/80 placeholder:text-white/25 font-semibold"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="mr-3 p-1 rounded-lg text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── CATEGORY FILTER PILLS ──────────────────────────────────────────────── */}
      <div className="container-custom max-w-6xl pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 flex-wrap mb-2"
        >
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer"
              style={
                activeCategory === cat
                  ? { background: "linear-gradient(135deg, #14b8a6, #6366f1)", color: "white", boxShadow: "0 0 14px rgba(99,102,241,0.35)" }
                  : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {cat === "All" ? `All Tools (${tools.reduce((a, s) => a + s.items.length, 0)})` :
               cat === "Academic" ? "🎓 Academic" :
               cat === "Career" ? "💼 Career" : "🤖 AI Tools"}
            </button>
          ))}

          {searchQuery && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-auto text-[10px] font-bold text-white/30"
            >
              {totalVisible} result{totalVisible !== 1 ? "s" : ""}
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* ── TOOLS GRID ─────────────────────────────────────────────────────────── */}
      <div className="container-custom max-w-6xl pb-20 pt-8">
        <AnimatePresence mode="wait">
          {filteredTools.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl"
            >
              <Search className="h-10 w-10 text-white/15 mb-4" />
              <p className="text-sm font-bold text-white/50">No tools found for "{searchQuery}"</p>
              <p className="text-xs text-white/25 mt-1">Try a different keyword like "Resume" or "CGPA"</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-4 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                style={{ background: "rgba(20,184,166,0.1)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.25)" }}
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-14">
              {filteredTools.map((section, secIdx) => (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: secIdx * 0.1 }}
                  className="space-y-6"
                >
                  {/* Section header */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-7 w-1.5 rounded-full"
                        style={{ background: `linear-gradient(to bottom, ${section.accent}, transparent)` }}
                      />
                      <div>
                        <h2 className="text-base font-black text-white tracking-tight">{section.label}</h2>
                        <p className="text-[10px] text-white/30 font-semibold">{section.items.length} tools</p>
                      </div>
                    </div>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${section.accent}30, transparent)` }} />
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: `${section.accent}15`, color: section.accent, border: `1px solid ${section.accent}30` }}
                    >
                      {section.category}
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.items.map((tool, i) => (
                      <ToolCard key={tool.title} tool={tool} index={i} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
