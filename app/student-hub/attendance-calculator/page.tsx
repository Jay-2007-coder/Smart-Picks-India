"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, Info, CheckCircle2, AlertCircle, Plus, Minus, 
  RotateCcw, Sparkles, BookOpen, Trash2, Award, Zap, HelpCircle, Trophy,
  TrendingUp, Check, Save, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert,
  Sliders, ArrowUpRight, CheckSquare, Layers3, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

/* ─────────────── DATA MODELS ─────────────── */
interface Subject {
  id: string;
  name: string;
  attended: number;
  conducted: number;
  target: number;
  streak: number; // consecutive attended classes
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "1", name: "Mathematics IV", attended: 32, conducted: 40, target: 75, streak: 5 },
  { id: "2", name: "Operating Systems", attended: 28, conducted: 35, target: 75, streak: 8 },
  { id: "3", name: "Computer Networks", attended: 29, conducted: 38, target: 80, streak: 3 },
];

function AnimatedCounter({ value, duration = 0.5, isPercent = false }: { value: number; duration?: number; isPercent?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    const startTime = performance.now();
    let animFrame: number;
    
    const animate = (now: number) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setDisplayValue(end);
      } else {
        const progress = 1 - Math.pow(1 - elapsed, 3); // easeOutCubic
        setDisplayValue(start + (end - start) * progress);
        animFrame = requestAnimationFrame(animate);
      }
    };
    
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [value]);

  if (isPercent) {
    return <>{displayValue.toFixed(1)}%</>;
  }
  return <>{Math.round(displayValue)}</>;
}

export default function AttendanceCalculator() {
  const [target, setTarget] = useState<number>(75);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectTarget, setNewSubjectTarget] = useState(75);
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // What-If Simulator state (Simulated Bunks)
  const [simulatedBunks, setSimulatedBunks] = useState<number>(1);

  // Exam Survival Mode states
  const [remainingClasses, setRemainingClasses] = useState<number>(12);
  const [showSurvivalMode, setShowSurvivalMode] = useState(false);

  // Expanded Subject IDs
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<string[]>(["1"]);

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load configuration from local storage
  useEffect(() => {
    try {
      const savedSubjects = localStorage.getItem("smartpicks_attendance_subjects");
      const savedGlobalTarget = localStorage.getItem("smartpicks_attendance_global_target");

      if (savedSubjects) {
        const parsed = JSON.parse(savedSubjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSubjects(parsed);
          setExpandedSubjectIds([parsed[0].id]);
        }
      }
      if (savedGlobalTarget) {
        const parsedTarget = parseInt(savedGlobalTarget, 10);
        if (!isNaN(parsedTarget)) setTarget(parsedTarget);
      }
    } catch (e) {
      console.error("Failed to parse saved attendance configuration:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem("smartpicks_attendance_subjects", JSON.stringify(subjects));
      localStorage.setItem("smartpicks_attendance_global_target", target.toString());
    } catch (e) {
      console.error("Auto-save attendance failed:", e);
    }
  }, [subjects, target, isLoading]);

  /* ─────────────── AGGREGATED CALCULATIONS ─────────────── */
  const globalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
  const globalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const globalPercentage = globalConducted > 0 ? (globalAttended / globalConducted) * 100 : 0;
  
  const maxGlobalBunks = globalConducted > 0 
    ? Math.max(0, Math.floor((globalAttended * 100 - target * globalConducted) / target)) 
    : 0;

  const maxStreak = subjects.length > 0 ? Math.max(...subjects.map(s => s.streak)) : 0;

  // What-If Simulation Calculations
  const simulatedConducted = globalConducted + simulatedBunks;
  const simulatedPercentage = simulatedConducted > 0 ? (globalAttended / simulatedConducted) * 100 : 0;
  const simulatedSafeBunks = simulatedConducted > 0
    ? Math.max(0, Math.floor((globalAttended * 100 - target * simulatedConducted) / target))
    : 0;

  // Confetti trigger loop
  const prevPercentageRef = useRef<number>(0);
  useEffect(() => {
    if (
      globalPercentage > 0 &&
      globalPercentage >= target &&
      prevPercentageRef.current < target
    ) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setNotification({ message: "🎉 Congratulations! Your attendance reached your target goal!", type: "success" });
    }
    prevPercentageRef.current = globalPercentage;
  }, [globalPercentage, target]);

  /* ─────────────── HANDLERS ─────────────── */
  const incrementAttended = (id: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, attended: s.attended + 1, conducted: s.conducted + 1, streak: s.streak + 1 } : s));
  };

  const decrementAttended = (id: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, attended: Math.max(0, s.attended - 1), conducted: Math.max(0, s.conducted - 1), streak: Math.max(0, s.streak - 1) } : s));
  };

  const incrementConductedOnly = (id: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, conducted: s.conducted + 1, streak: 0 } : s));
  };

  const decrementConductedOnly = (id: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, conducted: Math.max(s.attended, s.conducted - 1) } : s));
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      setNotification({ message: "Please enter a valid subject name", type: "error" });
      return;
    }
    const newId = Date.now().toString();
    const newSub: Subject = {
      id: newId,
      name: newSubjectName.trim(),
      attended: 0,
      conducted: 0,
      target: newSubjectTarget,
      streak: 0
    };
    setSubjects(prev => [...prev, newSub]);
    setExpandedSubjectIds(prev => [...prev, newId]);
    setNewSubjectName("");
    setIsAddingSubject(false);
    setNotification({ message: `✓ Added new subject "${newSub.name}"`, type: "success" });
  };

  const handleRemoveSubject = (id: string, name: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setExpandedSubjectIds(prev => prev.filter(x => x !== id));
    setNotification({ message: `Removed subject "${name}"`, type: "info" });
  };

  const toggleSubjectExpand = (id: string) => {
    setExpandedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setSubjects(DEFAULT_SUBJECTS);
    setTarget(75);
    setSimulatedBunks(1);
    setExpandedSubjectIds(["1"]);
    localStorage.removeItem("smartpicks_attendance_subjects");
    localStorage.removeItem("smartpicks_attendance_global_target");
    setNotification({ message: "Reset to default subject data", type: "info" });
  };

  /* ─────────────── RISK COMPUTATION ─────────────── */
  const getRiskColor = (pct: number, targetPct: number) => {
    if (pct >= targetPct + 5) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", stroke: "stroke-emerald-500", badgeBg: "bg-emerald-500", label: "Safe Zone" };
    if (pct >= targetPct) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", stroke: "stroke-amber-500", badgeBg: "bg-amber-500", label: "Warning Zone" };
    return { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", stroke: "stroke-rose-500", badgeBg: "bg-rose-500", label: "Shortage Warning" };
  };

  const globalRisk = getRiskColor(globalPercentage, target);
  const simulatedRisk = getRiskColor(simulatedPercentage, target);

  /* ─────────────── EXAM SURVIVAL CALCULATOR ─────────────── */
  const computeSurvivalMetrics = () => {
    if (globalConducted === 0) return { minClassesNeeded: 0, maxBunksAllowed: 0, isUnreachable: false };

    const totalConductedFuture = globalConducted + remainingClasses;
    const totalAttendedTarget = Math.ceil((target / 100) * totalConductedFuture);
    const minClassesNeeded = Math.max(0, totalAttendedTarget - globalAttended);

    if (minClassesNeeded > remainingClasses) {
      return { minClassesNeeded, maxBunksAllowed: 0, isUnreachable: true };
    }
    const maxBunksAllowed = Math.max(0, remainingClasses - minClassesNeeded);
    return { minClassesNeeded, maxBunksAllowed, isUnreachable: false };
  };

  const survivalMetrics = computeSurvivalMetrics();

  /* ─────────────── GAMIFICATION BADGES ─────────────── */
  const getBadges = () => {
    const list = [];
    if (globalPercentage >= 90 && globalConducted >= 20) {
      list.push({ name: "Academic Elite", desc: "Maintained 90%+ total attendance across all courses", icon: Trophy, color: "border-amber-500/30 text-amber-600 dark:text-amber-400" });
    }
    if (maxStreak >= 7) {
      list.push({ name: "Iron Will Streak", desc: "Attended 7+ classes in a row without bunking", icon: Zap, color: "border-cyan-500/30 text-cyan-600 dark:text-cyan-400" });
    }
    if (maxGlobalBunks >= 5) {
      list.push({ name: "Safe Buffer King", desc: "Accumulated 5+ safe bunks in global margin", icon: ShieldAlert, color: "border-purple-500/30 text-purple-600 dark:text-purple-400" });
    }
    if (subjects.length >= 4) {
      list.push({ name: "Multi-Tasker", desc: "Tracking 4+ course schedules simultaneously", icon: BookOpen, color: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" });
    }
    return list;
  };

  const activeBadges = getBadges();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative overflow-hidden select-none pb-24 transition-colors duration-300">
      
      {/* Ambient Mint / Emerald Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-950/20 blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 dark:bg-teal-950/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-500/5 dark:bg-cyan-950/15 blur-[140px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Student Hub</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.setItem("smartpicks_attendance_subjects", JSON.stringify(subjects));
                localStorage.setItem("smartpicks_attendance_global_target", target.toString());
                setNotification({ message: "💾 Attendance plan successfully saved!", type: "success" });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
              title="Save Plan"
            >
              <Save className="h-3.5 w-3.5" /> Save Plan
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-all cursor-pointer shadow-sm"
              title="Reset Data"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Default
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            1. HERO SECTION
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="text-center space-y-4 max-w-2xl mx-auto pt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Attendance Prediction Desk</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-[1.08]">
            Attendance{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Planner &amp; Buffer
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
            Simulate class absences in real time, forecast cutoff risks, and know exactly how many bunks you can afford before exams.
          </p>
        </section>

        {/* Notifications Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 border rounded-2xl shadow-sm flex items-center gap-3 text-xs font-bold leading-normal text-left ${
                notification.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : notification.type === "error"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
                  : "bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-400"
              }`}
            >
              <Info className="h-5 w-5 shrink-0" />
              <span className="flex-1">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. UNIFIED ATTENDANCE SNAPSHOT (HERO CARD)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6 text-left relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                CURRENT ATTENDANCE OVERVIEW
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                  <AnimatedCounter value={globalPercentage} isPercent={true} />
                </h2>
                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${globalRisk.bg} ${globalRisk.border} ${globalRisk.text}`}>
                  {globalRisk.label}
                </div>
              </div>
            </div>

            {/* Target Selector */}
            <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-1.5 shrink-0 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Required Cutoff Target
              </span>
              <div className="flex items-center gap-1.5">
                {[75, 80, 85].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTarget(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      target === t
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left pt-2">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block">Total Conducted</span>
              <span className="text-lg font-black text-slate-900 dark:text-zinc-100">{globalAttended} / {globalConducted}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block">Safe Bunks Left</span>
              <span className={`text-lg font-black ${maxGlobalBunks > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {maxGlobalBunks} {maxGlobalBunks === 1 ? "Class" : "Classes"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block">Best Streak</span>
              <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">⚡ {maxStreak} Classes</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block">Tracked Courses</span>
              <span className="text-lg font-black text-slate-900 dark:text-zinc-100">{subjects.length} Subjects</span>
            </div>
          </div>
        </motion.section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. CORE INTERACTION: WHAT-IF SIMULATOR ("What happens if I miss classes?")
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6 text-left"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider">
                <Sliders className="h-3.5 w-3.5" />
                <span>Interactive What-If Simulator</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                What happens if I miss classes?
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                Simulate missing upcoming lectures and instantly see your updated score and cutoff risk.
              </p>
            </div>

            {/* Stepper Counter (− 3 +) */}
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-950 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shrink-0">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 pl-2">
                Simulate Bunks:
              </span>
              <button
                onClick={() => setSimulatedBunks((prev) => Math.max(0, prev - 1))}
                className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 font-black text-base flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-all"
                title="Decrease simulated bunks"
              >
                −
              </button>
              <span className="text-xl font-black text-slate-900 dark:text-zinc-100 min-w-8 text-center">
                {simulatedBunks}
              </span>
              <button
                onClick={() => setSimulatedBunks((prev) => Math.min(50, prev + 1))}
                className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base flex items-center justify-center cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                title="Increase simulated bunks"
              >
                +
              </button>
            </div>
          </div>

          {/* Simulation Impact Forecast Grid */}
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            
            {/* Projected Attendance */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-850 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Projected Attendance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                  {simulatedPercentage.toFixed(1)}%
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 line-through">
                  {globalPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Projected Safe Bunks */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-850 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Projected Safe Bunks</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${simulatedSafeBunks > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {simulatedSafeBunks} Left
                </span>
              </div>
            </div>

            {/* Projected Eligibility Status */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-850 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Projected Status</span>
              <div className="pt-0.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border inline-block ${simulatedRisk.bg} ${simulatedRisk.border} ${simulatedRisk.text}`}>
                  {simulatedRisk.label}
                </span>
              </div>
            </div>

          </div>

          {/* Dynamic What-If Advice Banner */}
          <div className={`p-4 rounded-2xl border text-xs font-semibold leading-relaxed flex items-start gap-3 ${simulatedRisk.bg} ${simulatedRisk.border} ${simulatedRisk.text}`}>
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              {simulatedPercentage >= target ? (
                <p>
                  <strong>Safe Scenario:</strong> Bunking <strong>{simulatedBunks}</strong> upcoming {simulatedBunks === 1 ? "class" : "classes"} keeps your attendance at <strong>{simulatedPercentage.toFixed(1)}%</strong>, which safely exceeds your {target}% target.
                </p>
              ) : (
                <p>
                  <strong>Shortage Warning:</strong> Bunking <strong>{simulatedBunks}</strong> upcoming {simulatedBunks === 1 ? "class" : "classes"} will drop your attendance to <strong>{simulatedPercentage.toFixed(1)}%</strong> (below target). Avoid bunking!
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            4. CLEAN EXPANDABLE SUBJECT LIST
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                Subject Attendance Breakdowns
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                Click any course to expand attendance counters and custom targets.
              </p>
            </div>

            <button
              onClick={() => setIsAddingSubject(!isAddingSubject)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              {isAddingSubject ? "Cancel" : "+ Add Subject"}
            </button>
          </div>

          {/* Inline Add Subject Form */}
          <AnimatePresence>
            {isAddingSubject && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="p-5 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl text-left space-y-4 shadow-xl"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 block">
                  Configure New Course
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase">Subject Label</label>
                    <input 
                      type="text" 
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="e.g. Artificial Intelligence"
                      className="h-10 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase">Target Minimum %</label>
                    <select 
                      value={newSubjectTarget}
                      onChange={(e) => setNewSubjectTarget(parseInt(e.target.value))}
                      className="h-10 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 text-xs font-black text-slate-900 dark:text-zinc-100 outline-none"
                    >
                      <option value={75}>75% (Standard University)</option>
                      <option value={80}>80% (High Standard)</option>
                      <option value={85}>85% (Scholar Requirement)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAddSubject}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Confirm &amp; Add Course
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expandable Accordion List */}
          <div className="space-y-3">
            {subjects.map((sub) => {
              const subPercentage = sub.conducted > 0 ? (sub.attended / sub.conducted) * 100 : 0;
              const colors = getRiskColor(subPercentage, sub.target);
              const isExpanded = expandedSubjectIds.includes(sub.id);
              
              const localBunks = sub.conducted > 0 
                ? Math.max(0, Math.floor((sub.attended * 100 - sub.target * sub.conducted) / sub.target))
                : 0;

              const localClassesNeeded = subPercentage < sub.target
                ? Math.ceil((sub.target * sub.conducted - 100 * sub.attended) / (100 - sub.target))
                : 0;

              return (
                <div 
                  key={sub.id} 
                  className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-2xl backdrop-blur-xl transition-all shadow-sm overflow-hidden"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleSubjectExpand(sub.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-850/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`h-3 w-3 rounded-full ${colors.badgeBg} shrink-0`} />
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100 truncate">
                          {sub.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                          <span>{sub.attended} / {sub.conducted} Conducted</span>
                          <span>•</span>
                          <span>Target: {sub.target}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase border ${colors.bg} ${colors.border} ${colors.text}`}>
                        {subPercentage.toFixed(1)}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Actions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-200 dark:border-zinc-850 space-y-4"
                      >
                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                          {subPercentage >= sub.target 
                            ? `✓ Safe status. You can bunk ${localBunks} upcoming class${localBunks === 1 ? "" : "es"} in a row.`
                            : `⚠️ Shortage warning: Attend the next ${localClassesNeeded} class${localClassesNeeded === 1 ? "" : "es"} in a row to hit target.`}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-slate-100 dark:border-zinc-900">
                          {/* Present/Absent Click Counters */}
                          <div className="flex items-center gap-4">
                            {/* Present Counter */}
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 px-1">
                                Present
                              </span>
                              <button 
                                onClick={() => decrementAttended(sub.id)}
                                className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold hover:text-rose-600 text-xs"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => incrementAttended(sub.id)}
                                className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm"
                              >
                                +
                              </button>
                            </div>

                            {/* Bunked Counter */}
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                              <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 px-1">
                                Bunked
                              </span>
                              <button 
                                onClick={() => decrementConductedOnly(sub.id)}
                                className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold hover:text-rose-600 text-xs"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => incrementConductedOnly(sub.id)}
                                className="h-7 w-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Delete Subject Button */}
                          <button
                            onClick={() => handleRemoveSubject(sub.id, sub.name)}
                            className="p-2 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            5. ATTENDANCE INSIGHTS & EXAM SURVIVAL MODE
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6 text-left">
          <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            AI Attendance Insights &amp; Exam Survival
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            
            {/* Future Scenario Projections */}
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-600 dark:text-zinc-400 tracking-wider flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Future Scenario Matrix</span>
              </h3>

              <div className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-900 rounded-2xl">
                  <span>Bunk next class</span>
                  <span className={`font-black ${getRiskColor(((globalAttended) / (globalConducted + 1)) * 100, target).text}`}>
                    {(((globalAttended) / (globalConducted + 1)) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-900 rounded-2xl">
                  <span>Bunk next 3 classes</span>
                  <span className={`font-black ${getRiskColor(((globalAttended) / (globalConducted + 3)) * 100, target).text}`}>
                    {(((globalAttended) / (globalConducted + 3)) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-900 rounded-2xl">
                  <span>Attend next 5 classes (Streak)</span>
                  <span className={`font-black ${getRiskColor(((globalAttended + 5) / (globalConducted + 5)) * 100, target).text}`}>
                    {(((globalAttended + 5) / (globalConducted + 5)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Exam Survival Mode */}
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-600 dark:text-zinc-400 tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Exam Survival Mode</span>
                </h3>
                <button
                  onClick={() => setShowSurvivalMode(!showSurvivalMode)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[10px] font-black text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 uppercase transition-colors cursor-pointer"
                >
                  {showSurvivalMode ? "Hide" : "Activate"}
                </button>
              </div>

              {showSurvivalMode ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase">Remaining Classes Before Exam</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={remainingClasses}
                      onChange={(e) => setRemainingClasses(parseInt(e.target.value) || 1)}
                      className="h-9 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-900 rounded-2xl text-xs font-medium leading-relaxed">
                    {survivalMetrics.isUnreachable ? (
                      <p className="text-rose-600 dark:text-rose-400 font-bold">
                        ⚠️ Shortage Inevitable: Even attending all remaining {remainingClasses} classes will not reach your {target}% target. Contact your faculty.
                      </p>
                    ) : (
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        ✓ Survival Path: Attend at least <strong className="font-black text-emerald-600 dark:text-emerald-300">{survivalMetrics.minClassesNeeded}</strong> of the remaining {remainingClasses} classes. Max bunks allowed: <strong className="font-black text-amber-600 dark:text-amber-400">{survivalMetrics.maxBunksAllowed}</strong>.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                  Activate Exam Survival Mode to compute mandatory attendance cutoffs for your end-semester final exams.
                </p>
              )}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
