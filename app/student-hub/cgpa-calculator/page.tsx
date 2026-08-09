"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Trash2, Calculator, RefreshCw, Save, 
  Sparkles, Trophy, Award, TrendingUp, Calendar, Info, X, Check, 
  Star, CheckCircle, HelpCircle, AlertCircle, BookOpen, Send, MessageSquare, ChevronRight,
  LayoutDashboard, Target, Bot, Sliders, BarChart3, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

/* ─────────────── DATA MODELS ─────────────── */
interface Course {
  name: string;
  credits: number;
  gradePoint: number;
}

interface Semester {
  id: number;
  courses: Course[];
}

const GRADES = ["O", "A+", "A", "B+", "B", "C", "P", "F"] as const;
type Grade = typeof GRADES[number];

const GRADE_POINTS: Record<Grade, number> = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "P": 4,
  "F": 0
};

const GRADE_COLORS: Record<Grade, { border: string; text: string; bg: string; shadow: string }> = {
  "O": { border: "border-emerald-500/30", text: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", shadow: "shadow-emerald-500/10" },
  "A+": { border: "border-teal-500/30", text: "text-teal-500 dark:text-teal-400", bg: "bg-teal-500/10", shadow: "shadow-teal-500/10" },
  "A": { border: "border-cyan-500/30", text: "text-cyan-500 dark:text-cyan-400", bg: "bg-cyan-500/10", shadow: "shadow-cyan-500/10" },
  "B+": { border: "border-indigo-500/30", text: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10", shadow: "shadow-indigo-500/10" },
  "B": { border: "border-purple-500/30", text: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10", shadow: "shadow-purple-500/10" },
  "C": { border: "border-amber-500/30", text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10", shadow: "shadow-amber-500/10" },
  "P": { border: "border-orange-500/30", text: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10", shadow: "shadow-orange-500/10" },
  "F": { border: "border-rose-500/30", text: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10", shadow: "shadow-rose-500/10" },
};

type TabType = "overview" | "semesters" | "predictor" | "ai-mentor";

export default function CGPACalculator() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: 1,
      courses: [
        { name: "Mathematics I", credits: 4, gradePoint: 10 },
        { name: "Programming in C", credits: 3, gradePoint: 9 },
        { name: "Physics Lab", credits: 2, gradePoint: 8 },
        { name: "English Comm.", credits: 2, gradePoint: 10 },
      ],
    },
  ]);

  const [targetCGPA, setTargetCGPA] = useState<number>(8.5);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  // Accordion open/collapse states
  const [expandedSemesters, setExpandedSemesters] = useState<Record<number, boolean>>({ 1: true });
  
  // Course hover detail
  const [activeCourseHover, setActiveCourseHover] = useState<{ semId: number; cIdx: number } | null>(null);

  // AI Study Mentor Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: "user" | "assistant"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load plan from local storage on mount
  useEffect(() => {
    try {
      const savedSemesters = localStorage.getItem("smartpicks_cgpa_plan");
      const savedTarget = localStorage.getItem("smartpicks_cgpa_target");
      if (savedSemesters) {
        const parsed = JSON.parse(savedSemesters);
        setSemesters(parsed);
        const expands: Record<number, boolean> = {};
        parsed.forEach((s: Semester) => { expands[s.id] = true; });
        setExpandedSemesters(expands);
      }
      if (savedTarget) {
        setTargetCGPA(parseFloat(savedTarget));
      }
    } catch (e) {
      console.error("Failed to load local storage data:", e);
    }
  }, []);

  // Auto-save plan when semesters or targetCGPA change
  useEffect(() => {
    try {
      localStorage.setItem("smartpicks_cgpa_plan", JSON.stringify(semesters));
      localStorage.setItem("smartpicks_cgpa_target", targetCGPA.toString());
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  }, [semesters, targetCGPA]);

  // SGPA Calculations
  const calculateSGPA = (courses: Course[]) => {
    let totalCredits = 0;
    let weightedPoints = 0;
    courses.forEach((c) => {
      totalCredits += c.credits;
      weightedPoints += c.credits * c.gradePoint;
    });
    return totalCredits > 0 ? Math.round((weightedPoints / totalCredits) * 100) / 100 : 0;
  };

  // CGPA Calculations
  const calculateCGPA = () => {
    let totalCredits = 0;
    let weightedPoints = 0;
    semesters.forEach((sem) => {
      sem.courses.forEach((c) => {
        totalCredits += c.credits;
        weightedPoints += c.credits * c.gradePoint;
      });
    });
    return totalCredits > 0 ? Math.round((weightedPoints / totalCredits) * 100) / 100 : 0;
  };

  const currentCGPA = calculateCGPA();
  const totalCompletedCredits = semesters.reduce(
    (sum, sem) => sum + sem.courses.reduce((cSum, c) => cSum + c.credits, 0),
    0
  );

  // Confetti trigger ref
  const prevCGPARef = useRef<number>(0);
  useEffect(() => {
    if (
      currentCGPA > 0 &&
      currentCGPA >= targetCGPA &&
      prevCGPARef.current < targetCGPA
    ) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#6366f1", "#10b981", "#ff007f"]
      });
      setNotification({ message: "🎉 Congratulations! You have met or exceeded your target CGPA!", type: "success" });
    }
    prevCGPARef.current = currentCGPA;
  }, [currentCGPA, targetCGPA]);

  /* ─────────────── COMPONENT ACTIONS ─────────────── */
  const handleAddSemester = () => {
    const nextId = semesters.length > 0 ? Math.max(...semesters.map((s) => s.id)) + 1 : 1;
    setSemesters([
      ...semesters,
      {
        id: nextId,
        courses: [{ name: "New Course", credits: 3, gradePoint: 9 }],
      },
    ]);
    setExpandedSemesters(prev => ({ ...prev, [nextId]: true }));
    setActiveTab("semesters");
    setNotification({ message: `Semester ${semesters.length + 1} added.`, type: "info" });
  };

  const handleRemoveSemester = (id: number, index: number) => {
    if (semesters.length <= 1) return;
    setSemesters(semesters.filter((s) => s.id !== id));
    setNotification({ message: `Semester ${index + 1} removed.`, type: "info" });
  };

  const toggleSemester = (id: number) => {
    setExpandedSemesters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCourse = (semId: number) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          courses: [...sem.courses, { name: `Course ${sem.courses.length + 1}`, credits: 3, gradePoint: 8 }]
        };
      }
      return sem;
    }));
  };

  const handleRemoveCourse = (semId: number, courseIdx: number) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        if (sem.courses.length <= 1) return sem;
        return {
          ...sem,
          courses: sem.courses.filter((_, idx) => idx !== courseIdx)
        };
      }
      return sem;
    }));
  };

  const handleCourseChange = (
    semId: number, 
    courseIdx: number, 
    field: keyof Course, 
    value: string | number
  ) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        const newCourses = [...sem.courses];
        newCourses[courseIdx] = {
          ...newCourses[courseIdx],
          [field]: value
        };
        return { ...sem, courses: newCourses };
      }
      return sem;
    }));
  };

  const handleResetCalculator = () => {
    setSemesters([
      {
        id: 1,
        courses: [
          { name: "Mathematics I", credits: 4, gradePoint: 10 },
          { name: "Programming in C", credits: 3, gradePoint: 9 },
        ],
      },
    ]);
    setTargetCGPA(8.5);
    setExpandedSemesters({ 1: true });
    setNotification({ message: "Calculator reset to defaults.", type: "info" });
  };

  /* ─────────────── TARGET PREDICTOR CALCULATIONS ─────────────── */
  const totalSemestersTimeline = 8;
  const completedSemestersCount = semesters.length;
  const remainingSemestersCount = Math.max(0, totalSemestersTimeline - completedSemestersCount);
  const averageCreditsPerSemester = totalCompletedCredits > 0 
    ? Math.round(totalCompletedCredits / completedSemestersCount) 
    : 20;

  const currentWeightedPoints = semesters.reduce(
    (sum, sem) => sum + sem.courses.reduce((cSum, c) => cSum + c.credits * c.gradePoint, 0),
    0
  );
  const estimatedRemainingCredits = remainingSemestersCount * averageCreditsPerSemester;
  const totalEstimatedPlanCredits = totalCompletedCredits + estimatedRemainingCredits;
  const totalTargetPointsNeeded = targetCGPA * totalEstimatedPlanCredits;
  const remainingPointsNeeded = totalTargetPointsNeeded - currentWeightedPoints;
  const requiredAverageSGPA = estimatedRemainingCredits > 0 
    ? Math.max(0, remainingPointsNeeded / estimatedRemainingCredits) 
    : 0;

  const sGPAs = semesters.map((s) => calculateSGPA(s.courses));

  // Chat greeting trigger
  useEffect(() => {
    if (chatMessages.length === 0 && currentCGPA > 0) {
      setChatMessages([
        {
          id: "welcome",
          sender: "assistant",
          text: `👋 Hello! I'm your **AI Academic Study Planner**.\n\nYou have completed **${completedSemestersCount}** semester(s) with a current CGPA of **${currentCGPA.toFixed(2)}**.\n\nTo hit your **${targetCGPA.toFixed(2)}** CGPA goal, you need to average **${requiredAverageSGPA > 10 ? "10.0 (Target Unreachable)" : requiredAverageSGPA.toFixed(2)}** SGPA across remaining semesters. How can I help you plan your studies?`
        }
      ]);
    }
  }, [completedSemestersCount, currentCGPA, targetCGPA, requiredAverageSGPA, chatMessages.length]);

  const handleSendChat = (predefinedMsg?: string) => {
    const query = predefinedMsg || chatInput;
    if (!query.trim()) return;

    setChatMessages(prev => [...prev, { id: `user-${Date.now()}`, sender: "user", text: query }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    setTimeout(() => {
      let reply = "";
      const text = query.toLowerCase();

      if (text.includes("pathway") || text.includes("evaluate") || text.includes("target") || text.includes("sgpa")) {
        if (requiredAverageSGPA > 10.0) {
          reply = `⚠️ **Goal Analysis**: Your target CGPA of **${targetCGPA.toFixed(2)}** is mathematically unreachable with your current completed credits. Even getting a perfect 10.0 SGPA won't reach it.\n\n**Action Plan**:\n1. Adjust your target CGPA to a realistic level (e.g. **${(currentCGPA + 0.5).toFixed(2)}**).\n2. Focus on maximizing grades in high-credit papers to raise your score fast.`;
        } else if (requiredAverageSGPA <= 4.0) {
          reply = `✅ **Goal Analysis**: Excellent news! Your target of **${targetCGPA.toFixed(2)}** is fully secured. Even if you maintain a passing SGPA of 4.0, you'll cross the line.\n\nKeep up the steady pace to aim for higher honors!`;
        } else {
          reply = `📈 **Pathway Evaluation**:\nTo achieve your target CGPA of **${targetCGPA.toFixed(2)}**, you need to average **${requiredAverageSGPA.toFixed(2)}** SGPA across your next **${remainingSemestersCount}** semesters.\n\n**Target Recommendation**:\nAim for **${Math.min(10, Math.round((requiredAverageSGPA + 0.25) * 10) / 10).toFixed(2)}** SGPA next semester to give yourself a safety cushion!`;
        }
      } else if (text.includes("study") || text.includes("habits") || text.includes("credits") || text.includes("plan")) {
        reply = `📚 **Academic Study Planner Strategy**:\nAlways prioritize **high-credit courses** (4+ credits). Because grade calculations are weighted by credits, an 'O' in a 4-credit course has **double** the weight of an 'O' in a 2-credit course!\n\n**Study Plan Rules**:\n1. **Credit Leverage**: Allocate 60% of your self-study time to high-credit papers.\n2. **Consistency Checklist**: Set a weekly review of key formulas/syntax for your core coding courses.`;
      } else {
        reply = `🎓 **AI Study Mentor**:\nFocus on credit weighting and steady SGPA progression. You can adjust your semesters or ask me for study recommendations!`;
      }

      setIsTyping(false);
      setChatMessages(prev => [...prev, { id: `assistant-${Date.now()}`, sender: "assistant", text: reply }]);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }, 800);
  };

  const navItems = [
    { id: "overview" as TabType, label: "Overview", icon: LayoutDashboard },
    { id: "semesters" as TabType, label: "Semesters", icon: BookOpen, badge: `${semesters.length}` },
    { id: "predictor" as TabType, label: "Target Predictor", icon: Target },
    { id: "ai-mentor" as TabType, label: "AI Study Mentor", icon: Bot, badge: "AI" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors duration-200 select-none">

      {/* ── 1. SIDEBAR NAVIGATION ─────────────────────────────────────────── */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-4 sm:p-5 flex flex-col shrink-0">
        
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-200 mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Student Hub
        </Link>

        {/* Brand Tool Header */}
        <div className="mb-6 px-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-2 border border-purple-500/20">
            <Calculator className="h-3.5 w-3.5" />
            CGPA Portal
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-tight">CGPA Tracker</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Academic insights &amp; pathways</p>
        </div>

        {/* Sidebar Nav List */}
        <nav className="space-y-1 flex-1" aria-label="Tool sections">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold",
                    isActive
                      ? "bg-white/20 text-white dark:bg-zinc-950/20 dark:text-zinc-950"
                      : "bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-900 space-y-2 mt-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 text-left">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-zinc-500 uppercase">CGPA Score</p>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Auto-saved
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{currentCGPA.toFixed(2)} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">/ 10.0</span></p>
          </div>

          <button
            onClick={handleResetCalculator}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset calculator
          </button>
        </div>
      </aside>

      {/* ── 2. MAIN WORKSPACE CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 p-5 sm:p-8 max-w-5xl overflow-y-auto">
        
        {/* Notification Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cn(
                "p-3.5 rounded-xl border text-xs font-medium mb-6 flex items-center gap-2",
                notification.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900/40 dark:text-green-300"
                  : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-300"
              )}
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Dashboard Overview
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Real-time CGPA metrics, credit progress, and score distribution.
              </p>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Current CGPA</span>
                  <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{currentCGPA.toFixed(2)}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">Scale: 10.0 Max</p>
                </div>
              </div>

              <div className="card p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Target CGPA</span>
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{targetCGPA.toFixed(2)}</p>
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => setTargetCGPA(p => Math.min(10, Math.round((p + 0.1) * 10) / 10))} className="text-[9px] text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">▲</button>
                      <button onClick={() => setTargetCGPA(p => Math.max(0, Math.round((p - 0.1) * 10) / 10))} className="text-[9px] text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">▼</button>
                    </div>
                  </div>
                  <p className={cn("text-[11px] font-medium mt-0.5", currentCGPA >= targetCGPA ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
                    {currentCGPA >= targetCGPA ? "Target Achieved" : `Behind by ${(targetCGPA - currentCGPA).toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="card p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Completed Credits</span>
                  <BookOpen className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{totalCompletedCredits}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">Across {semesters.length} Semesters</p>
                </div>
              </div>

              <div className="card p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Timeline Progress</span>
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{completedSemestersCount} / {totalSemestersTimeline}</p>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (completedSemestersCount / totalSemestersTimeline) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Radial Scoreboard & Quick Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Radial Circle */}
              <div className="card p-6 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                  Academic Scoreboard
                </span>
                <div className="relative h-44 w-44 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="88" cy="88" r="70" className="stroke-slate-200 dark:stroke-zinc-800" strokeWidth="8" fill="transparent" />
                    <motion.circle
                      cx="88" cy="88" r="70"
                      className="stroke-purple-600 dark:stroke-purple-500"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 70}
                      initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 70 - (Math.min(10, currentCGPA) / 10) * (2 * Math.PI * 70) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">CGPA</span>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-100">{currentCGPA.toFixed(2)}</h2>
                    <span className="text-[10px] text-slate-400">out of 10.0</span>
                  </div>
                </div>
              </div>

              {/* Semesters Summary List */}
              <div className="card p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Semesters Breakup</h3>
                  <button onClick={() => setActiveTab("semesters")} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    Manage semesters →
                  </button>
                </div>
                <div className="space-y-2.5 flex-1">
                  {semesters.map((sem, idx) => {
                    const sgpa = calculateSGPA(sem.courses);
                    return (
                      <div key={sem.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Semester {idx + 1}</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{sem.courses.length} courses</p>
                        </div>
                        <span className="badge-brand font-mono font-bold text-xs">SGPA: {sgpa.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SEMESTERS MANAGEMENT ───────────────────────────────── */}
        {activeTab === "semesters" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Semesters &amp; Courses</h1>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Input course titles, credits, and grade points for live SGPA calculation.</p>
              </div>
              <button onClick={handleAddSemester} className="btn-primary btn-sm">
                <Plus className="h-4 w-4" /> Add Semester
              </button>
            </div>

            <div className="space-y-4">
              {semesters.map((sem, semIdx) => {
                const sgpa = calculateSGPA(sem.courses);
                const isExpanded = expandedSemesters[sem.id] !== false;
                const totalSemCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);

                return (
                  <div key={sem.id} className="card overflow-hidden">
                    <div 
                      onClick={() => toggleSemester(sem.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground">
                          S{semIdx + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">Semester {semIdx + 1}</h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{sem.courses.length} courses · {totalSemCredits} credits</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <span className="badge-brand font-bold text-xs">SGPA: {sgpa.toFixed(2)}</span>
                        {semesters.length > 1 && (
                          <button onClick={() => handleRemoveSemester(sem.id, semIdx)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => toggleSemester(sem.id)} className="p-1 text-slate-400">
                          {isExpanded ? "▲" : "▼"}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-border bg-muted/20 space-y-3">
                        <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-500 px-1">
                          <div className="col-span-5">Course Title</div>
                          <div className="col-span-2">Credits</div>
                          <div className="col-span-5">Grade Point</div>
                        </div>

                        {sem.courses.map((course, cIdx) => (
                          <div key={cIdx} className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg bg-background border border-border">
                            <div className="col-span-12 sm:col-span-5">
                              <input
                                type="text"
                                value={course.name}
                                onChange={(e) => handleCourseChange(sem.id, cIdx, "name", e.target.value)}
                                placeholder="Course name"
                                className="w-full bg-transparent border-none outline-none text-xs font-medium text-foreground placeholder:text-slate-400"
                              />
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={course.credits || ""}
                                onChange={(e) => handleCourseChange(sem.id, cIdx, "credits", parseInt(e.target.value) || 0)}
                                className="w-full text-center bg-transparent border-none outline-none text-xs font-semibold text-foreground"
                              />
                            </div>
                            <div className="col-span-5 flex flex-wrap gap-1 items-center">
                              {GRADES.map((g) => {
                                const isSelected = course.gradePoint === GRADE_POINTS[g];
                                return (
                                  <button
                                    key={g}
                                    onClick={() => handleCourseChange(sem.id, cIdx, "gradePoint", GRADE_POINTS[g])}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer",
                                      isSelected
                                        ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 border-transparent"
                                        : "bg-muted text-slate-600 dark:text-zinc-400 border-border hover:text-foreground"
                                    )}
                                  >
                                    {g}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        <button onClick={() => handleAddCourse(sem.id)} className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 pt-1">
                          <Plus className="h-3.5 w-3.5" /> Add Course
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: TARGET PREDICTOR ────────────────────────────────────── */}
        {activeTab === "predictor" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Target Pathway Predictor</h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Calculates the exact SGPA needed across future semesters to achieve your target CGPA.</p>
            </div>

            <div className="card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Set Target CGPA</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mt-1">{targetCGPA.toFixed(2)}</p>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="10.0"
                  step="0.1"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(parseFloat(e.target.value))}
                  className="w-full sm:w-64 accent-brand-600 cursor-pointer"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="text-xs text-slate-500 font-medium">Semesters Completed</p>
                  <p className="text-xl font-bold text-foreground mt-1">{completedSemestersCount} of {totalSemestersTimeline}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="text-xs text-slate-500 font-medium">Required Future SGPA</p>
                  <p className={cn(
                    "text-xl font-bold mt-1",
                    requiredAverageSGPA > 10 ? "text-red-600" : "text-brand-600"
                  )}>
                    {requiredAverageSGPA > 10 ? "Mathematically Unreachable" : `${requiredAverageSGPA.toFixed(2)} Avg SGPA`}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-slate-50 dark:bg-zinc-900/50">
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-brand-600" />
                  Recommendation Strategy
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {requiredAverageSGPA > 10
                    ? "Your target CGPA requires an SGPA higher than 10.0. Consider lowering your target CGPA slightly to set an achievable milestone."
                    : `To comfortably reach your target CGPA of ${targetCGPA.toFixed(2)}, focus on scoring grade O or A+ in 4-credit courses during the next ${remainingSemestersCount} semesters.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: AI STUDY MENTOR ─────────────────────────────────────── */}
        {activeTab === "ai-mentor" && (
          <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-120px)]">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Bot className="h-6 w-6 text-brand-600" />
                AI Study Mentor
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Interactive AI mentor trained to evaluate grade pathways and study strategies.</p>
            </div>

            {/* Chat Container */}
            <div className="card flex-1 p-4 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 max-w-2xl",
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      msg.sender === "user" ? "bg-brand-600 text-white" : "bg-muted border border-border text-foreground"
                    )}>
                      {msg.sender === "user" ? "You" : "AI"}
                    </div>

                    <div className={cn(
                      "p-3.5 rounded-2xl text-xs leading-relaxed",
                      msg.sender === "user"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950"
                        : "bg-muted/60 border border-border text-foreground"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 items-center text-xs text-muted-foreground p-2">
                    <Bot className="h-4 w-4 animate-spin" /> AI is thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Ask about study strategy, SGPA rescue, credit weightage..."
                  className="flex-1 bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gray-400"
                />
                <button onClick={() => handleSendChat()} className="btn-primary btn-sm px-4">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
