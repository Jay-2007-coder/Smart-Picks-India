"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, Info, CheckCircle2, AlertCircle, Plus, Minus, 
  RotateCcw, Sparkles, BookOpen, Trash2, Award, Zap, HelpCircle, Trophy,
  TrendingUp, Check, Save, Download, X, AlertTriangle, ShieldAlert
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

  // Exam Survival Mode states
  const [remainingClasses, setRemainingClasses] = useState<number>(12);
  const [showSurvivalMode, setShowSurvivalMode] = useState(false);

  // Selected active subject for quick calendar logger
  const [selectedLogSubjectId, setSelectedLogSubjectId] = useState<string>("1");

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Interactive Calendar configurations
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5)); // June 2026 default
  const [attendanceLogs, setAttendanceLogs] = useState<Record<string, Record<string, "present" | "absent">>>({});
  
  // Client particles
  const [clientParticles, setClientParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);
  
  // Fake loading state
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
      const savedLogs = localStorage.getItem("smartpicks_attendance_logs");
      if (savedSubjects) {
        const parsed = JSON.parse(savedSubjects);
        setSubjects(parsed);
        if (parsed.length > 0) {
          setSelectedLogSubjectId(parsed[0].id);
        }
      }
      if (savedGlobalTarget) {
        setTarget(parseInt(savedGlobalTarget) || 75);
      }
      if (savedLogs) {
        setAttendanceLogs(JSON.parse(savedLogs));
      }
    } catch (e) {
      console.error("Failed to load local storage attendance:", e);
    } finally {
      // Simulate loading state for high premium feel
      const timer = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-save whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem("smartpicks_attendance_subjects", JSON.stringify(subjects));
      localStorage.setItem("smartpicks_attendance_global_target", target.toString());
      localStorage.setItem("smartpicks_attendance_logs", JSON.stringify(attendanceLogs));
    } catch (e) {
      console.error("Auto-save attendance failed:", e);
    }
  }, [subjects, target, attendanceLogs]);

  // Initialize particles on mount to avoid hydration mismatch
  useEffect(() => {
    setClientParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 25 + 25,
        delay: Math.random() * -25,
      }))
    );
  }, []);

  const setDayLog = (dateStr: string, subjectId: string, status: "present" | "absent" | null) => {
    const currentStatus = attendanceLogs[dateStr]?.[subjectId] || null;
    if (currentStatus === status) return;

    const newLogs = { ...attendanceLogs };
    if (!newLogs[dateStr]) newLogs[dateStr] = {};
    
    if (status === null) {
      delete newLogs[dateStr][subjectId];
      if (Object.keys(newLogs[dateStr]).length === 0) {
        delete newLogs[dateStr];
      }
    } else {
      newLogs[dateStr][subjectId] = status;
    }
    setAttendanceLogs(newLogs);

    setSubjects(prevSubjects => prevSubjects.map(sub => {
      if (sub.id !== subjectId) return sub;

      let newAttended = sub.attended;
      let newConducted = sub.conducted;
      let newStreak = sub.streak;

      if (currentStatus === "present") {
        newAttended = Math.max(0, newAttended - 1);
        newConducted = Math.max(0, newConducted - 1);
        newStreak = Math.max(0, newStreak - 1);
      } else if (currentStatus === "absent") {
        newConducted = Math.max(0, newConducted - 1);
      }

      if (status === "present") {
        newAttended += 1;
        newConducted += 1;
        newStreak += 1;
      } else if (status === "absent") {
        newConducted += 1;
        newStreak = 0;
      }

      return {
        ...sub,
        attended: newAttended,
        conducted: newConducted,
        streak: newStreak
      };
    }));
  };

  /* ─────────────── AGGREGATED CALCULATIONS ─────────────── */
  const globalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
  const globalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const globalPercentage = globalConducted > 0 ? (globalAttended / globalConducted) * 100 : 0;
  
  // Safe bunks calculation: how many classes can we bunk globally before dropping below target?
  const maxGlobalBunks = globalConducted > 0 
    ? Math.max(0, Math.floor((globalAttended * 100 - target * globalConducted) / target)) 
    : 0;

  // Streak calculations
  const maxStreak = subjects.length > 0 ? Math.max(...subjects.map(s => s.streak)) : 0;

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
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#10b981"]
      });
      setNotification({ message: "🎉 Goal Reached! Overall attendance is back in the Safe Zone!", type: "success" });
    }
    prevPercentageRef.current = globalPercentage;
  }, [globalPercentage, target]);

  /* ─────────────── SIMULATION & QUICK ACTIONS ─────────────── */
  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const newId = Date.now().toString();
    const newSub: Subject = {
      id: newId,
      name: newSubjectName.trim(),
      attended: 15,
      conducted: 20,
      target: newSubjectTarget,
      streak: 0
    };
    setSubjects([...subjects, newSub]);
    setNewSubjectName("");
    setIsAddingSubject(false);
    setSelectedLogSubjectId(newId);
    setNotification({ message: `"${newSub.name}" added to list.`, type: "success" });
  };

  const handleRemoveSubject = (id: string, name: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    setNotification({ message: `"${name}" removed.`, type: "info" });
  };

  const incrementAttended = (id: string) => {
    setSubjects(subjects.map((sub) => {
      if (sub.id === id) {
        return {
          ...sub,
          attended: sub.attended + 1,
          conducted: sub.conducted + 1,
          streak: sub.streak + 1
        };
      }
      return sub;
    }));
  };

  const decrementAttended = (id: string) => {
    setSubjects(subjects.map((sub) => {
      if (sub.id === id) {
        return {
          ...sub,
          attended: Math.max(0, sub.attended - 1),
          conducted: Math.max(0, sub.conducted - 1),
          streak: Math.max(0, sub.streak - 1)
        };
      }
      return sub;
    }));
  };

  const incrementConductedOnly = (id: string) => {
    // This is equivalent to registering an absence/bunk
    setSubjects(subjects.map((sub) => {
      if (sub.id === id) {
        return {
          ...sub,
          conducted: sub.conducted + 1,
          streak: 0 // streak resets to zero on absence
        };
      }
      return sub;
    }));
  };

  const decrementConductedOnly = (id: string) => {
    setSubjects(subjects.map((sub) => {
      if (sub.id === id) {
        const canDecrement = sub.conducted > sub.attended;
        return {
          ...sub,
          conducted: canDecrement ? sub.conducted - 1 : sub.conducted
        };
      }
      return sub;
    }));
  };

  const handleQuickLog = (present: boolean) => {
    if (!selectedLogSubjectId) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setDayLog(dateStr, selectedLogSubjectId, present ? "present" : "absent");
  };

  const handleReset = () => {
    if (confirm("Reset attendance dashboard values to defaults?")) {
      setSubjects(DEFAULT_SUBJECTS);
      setTarget(75);
      setAttendanceLogs({});
      setNotification({ message: "Reset complete and logs cleared.", type: "info" });
    }
  };

  /* ─────────────── EXAM SURVIVAL CALCULATOR MATHS ─────────────── */
  const calculateSurvivalRoute = () => {
    // Minimum classes to attend to stay eligible:
    // (attended + A) / (conducted + R) >= target / 100
    // attended + A >= target * (conducted + R) / 100
    // A >= target * (conducted + R) / 100 - attended
    const minClassesNeeded = Math.max(
      0,
      Math.ceil((target * (globalConducted + remainingClasses)) / 100 - globalAttended)
    );
    const maxBunksAllowed = Math.max(0, remainingClasses - minClassesNeeded);
    const isUnreachable = minClassesNeeded > remainingClasses;

    return { minClassesNeeded, maxBunksAllowed, isUnreachable };
  };

  const survivalMetrics = calculateSurvivalRoute();

  /* ─────────────── DYNAMIC ZONE COLORING ─────────────── */
  const getRiskColor = (pct: number, tgt: number) => {
    if (pct >= tgt + 5) return { text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10", stroke: "stroke-emerald-500", glow: "shadow-emerald-500/20" };
    if (pct >= tgt) return { text: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10", stroke: "stroke-amber-500", glow: "shadow-amber-500/20" };
    return { text: "text-rose-400", border: "border-rose-500/20", bg: "bg-rose-500/10", stroke: "stroke-rose-500", glow: "shadow-rose-500/20" };
  };

  const globalRisk = getRiskColor(globalPercentage, target);

  /* ─────────────── GRAPH CONVERSION MATHS ─────────────── */
  const graphWidth = 500;
  const graphHeight = 160;
  const paddingX = 45;
  const paddingY = 25;

  const getGraphDataPoints = () => {
    if (subjects.length === 0) return "";
    if (subjects.length === 1) {
      const pct = (subjects[0].attended / subjects[0].conducted) * 100;
      const y = graphHeight - paddingY - (pct / 100) * (graphHeight - 2 * paddingY);
      return `${paddingX},${y} ${graphWidth - paddingX},${y}`;
    }
    return subjects.map((sub, idx) => {
      const pct = sub.conducted > 0 ? (sub.attended / sub.conducted) * 100 : 0;
      const x = paddingX + (idx / (subjects.length - 1)) * (graphWidth - 2 * paddingX);
      const y = graphHeight - paddingY - (pct / 100) * (graphHeight - 2 * paddingY);
      return `${x},${y}`;
    }).join(" ");
  };

  const getGraphAreaPath = (pointsStr: string) => {
    if (!pointsStr) return "";
    const firstPoint = pointsStr.split(" ")[0];
    const lastPoint = pointsStr.split(" ")[pointsStr.split(" ").length - 1];
    const firstX = parseFloat(firstPoint.split(",")[0]);
    const lastX = parseFloat(lastPoint.split(",")[0]);
    const bottomY = graphHeight - paddingY;
    return `M ${firstX},${bottomY} L ${pointsStr} L ${lastX},${bottomY} Z`;
  };

  /* ─────────────── BADGES ─────────────── */
  const getBadges = () => {
    const list = [];
    if (globalPercentage >= 95) {
      list.push({ name: "Attendance Scholar", icon: Trophy, desc: "Maintained outstanding attendance (>=95%)", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" });
    }
    if (maxStreak >= 10) {
      list.push({ name: "Unstoppable Force", icon: Zap, desc: "Achieved a streak of 10+ attended classes", color: "text-purple-400 border-purple-500/20 bg-purple-500/10" });
    }
    // Check if any subject has 100% attendance
    const hasPerfect = subjects.some(s => s.conducted > 0 && s.attended === s.conducted);
    if (hasPerfect) {
      list.push({ name: "Perfect Century", icon: Award, desc: "Logged 100% attendance in a subject", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" });
    }
    if (maxGlobalBunks >= 5) {
      list.push({ name: "Bunk Voyager", icon: Sparkles, desc: "Accumulated safe buffer of 5+ classes", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" });
    }
    return list;
  };

  const activeBadges = getBadges();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden select-none pb-16">
      
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-950/15 blur-[120px]" />
        
        {/* Floating Particles */}
        {clientParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-emerald-500/10 rounded-full blur-[1.5px]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -120, 0],
              x: [0, 60, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container-custom max-w-6xl relative z-10 py-10 px-4 sm:px-6 lg:px-8"
      >
        
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-550 hover:text-zinc-255 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Hub
        </Link>

        {/* Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-zinc-900 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4"
        >
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Attendance Prediction Desk</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-50 tracking-tight pt-2">Attendance Planner &amp; Buffer</h1>
            <p className="text-xs text-zinc-400 font-semibold">
              Simulate upcoming classes, forecast eligibility scores, and configure custom buffers before exams.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.setItem("smartpicks_attendance_subjects", JSON.stringify(subjects));
                localStorage.setItem("smartpicks_attendance_global_target", target.toString());
                setNotification({ message: "💾 Attendance plan successfully cached in localStorage!", type: "success" });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-emerald-500 text-white hover:bg-emerald-650 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
              title="Save Plan"
            >
              <Save className="h-3.5 w-3.5" /> Save Plan
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer"
              title="Reset Data"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Default
            </button>
          </div>
        </motion.div>

        {/* Notifications banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 border rounded-2xl mb-6 shadow-xl flex items-center gap-3 text-xs font-bold leading-normal text-left ${
                notification.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : notification.type === "error"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
              }`}
            >
              <Info className="h-5 w-5 shrink-0" />
              <span className="flex-1">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. HERO STATISTIC CARDS */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 text-left mb-8"
            >
              {/* Hero Stats Skeletons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-36 rounded-3xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-xl p-5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-2.5 w-20 bg-zinc-800/60 rounded animate-pulse" />
                      <div className="h-8 w-24 bg-zinc-850 rounded animate-pulse" />
                    </div>
                    <div className="h-2 w-16 bg-zinc-800/60 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Current Attendance percentage */}
                <div className="rounded-3xl border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/30 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 relative group overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-550">Current Attendance</h4>
                      <p className="text-3xl font-black text-zinc-100 mt-1">
                        <AnimatedCounter value={globalPercentage} isPercent={true} />
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-[9px] font-semibold text-zinc-400 flex items-center gap-1">
                    <span className="text-emerald-400">Status:</span> {globalPercentage >= target ? "Eligible" : "Shortage Warning"}
                  </div>
                </div>

                {/* Target Attendance */}
                <div className="rounded-3xl border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/30 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 relative group overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-550">Required Target</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-3xl font-black text-zinc-100">
                          <AnimatedCounter value={target} />%
                        </p>
                        <div className="flex flex-col gap-0.5 z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setTarget(p => Math.min(100, p + 5)); }}
                            className="p-0.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[8px] hover:text-indigo-400 cursor-pointer"
                          >
                            ▲
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setTarget(p => Math.max(0, p - 5)); }}
                            className="p-0.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[8px] hover:text-indigo-400 cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                    </div>
                  </div>
                  <div className="text-[9px] font-semibold text-zinc-400">
                    Adjustable criteria settings
                  </div>
                </div>

                {/* Safe Bunks remaining */}
                <div className="rounded-3xl border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/30 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 relative group overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-550">Safe Bunks Left</h4>
                      <p className="text-3xl font-black text-zinc-100 mt-1">
                        <AnimatedCounter value={maxGlobalBunks} /> Classes
                      </p>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                    </div>
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-wider ${
                    maxGlobalBunks > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {maxGlobalBunks > 0 ? "✓ Buffer available" : "No safety buffer left"}
                  </div>
                </div>

                {/* Attendance Streak */}
                <div className="rounded-3xl border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/30 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 relative group overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-550">Best Streak</h4>
                      <p className="text-3xl font-black text-zinc-100 mt-1">
                        <AnimatedCounter value={maxStreak} /> Classes
                      </p>
                    </div>
                    <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                      <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-[9px] font-semibold text-zinc-400">
                    Consecutive classes present
                  </div>
                </div>
              </section>


        {/* MAIN BODY GRID */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: SUBJECT WISE TRACKING CARDS (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Subject-Wise Analytics ({subjects.length})
              </span>
              <button
                onClick={() => setIsAddingSubject(!isAddingSubject)}
                className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 hover:text-emerald-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                {isAddingSubject ? "Cancel" : "+ Add Subject"}
              </button>
            </div>

            {/* Inline add subject form */}
            <AnimatePresence>
              {isAddingSubject && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl text-left space-y-3"
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-450 block">Configure New Subject</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-zinc-550 uppercase">Subject Label</label>
                      <input 
                        type="text" 
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="e.g. Database Management"
                        className="h-9 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 text-xs font-bold text-zinc-150 outline-none focus:border-emerald-500/40 placeholder:text-zinc-650"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-zinc-550 uppercase">Target Minimum %</label>
                      <select 
                        value={newSubjectTarget}
                        onChange={(e) => setNewSubjectTarget(parseInt(e.target.value))}
                        className="h-9 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 text-xs font-black text-zinc-200 outline-none"
                      >
                        <option value={75}>75% (Standard University)</option>
                        <option value={80}>80% (High Standard)</option>
                        <option value={85}>85% (Scholar Requirement)</option>
                        <option value={90}>90% (Strict Policy)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAddSubject}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Add Subject
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subject cards stack */}
            <div className="space-y-4">
              {subjects.map((sub) => {
                const subPercentage = sub.conducted > 0 ? (sub.attended / sub.conducted) * 100 : 0;
                const colors = getRiskColor(subPercentage, sub.target);
                
                // local safe bunks remaining for this specific subject
                const localBunks = sub.conducted > 0 
                  ? Math.max(0, Math.floor((sub.attended * 100 - sub.target * sub.conducted) / sub.target))
                  : 0;

                // local classes needed if below target
                const localClassesNeeded = subPercentage < sub.target
                  ? Math.ceil((sub.target * sub.conducted - 100 * sub.attended) / (100 - sub.target))
                  : 0;

                return (
                  <div 
                    key={sub.id} 
                    className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group text-left"
                  >
                    {/* Glowing status strip */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${colors.stroke}`} />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Metadata */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${colors.bg} ${colors.border} ${colors.text}`}>
                            {subPercentage.toFixed(1)}%
                          </span>
                          <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest">
                            Target: {sub.target}%
                          </span>
                          {sub.streak > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                              ⚡ {sub.streak} streak
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-zinc-200">{sub.name}</h3>
                        
                        {/* Summary description details */}
                        <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                          {subPercentage >= sub.target 
                            ? `✓ Safe zone. You can bunk ${localBunks} class${localBunks === 1 ? "" : "es"} in a row.`
                            : `⚠️ Warning: Shortage. Attend the next ${localClassesNeeded} class${localClassesNeeded === 1 ? "" : "es"} in a row to recover.`}
                        </p>
                      </div>

                      {/* Right: Counter Actions */}
                      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[8px] font-black uppercase text-zinc-550 block">Conducted</span>
                          <span className="text-xs font-black text-zinc-350">{sub.attended} / {sub.conducted}</span>
                        </div>

                        {/* Interactive Present/Absent Click Counters */}
                        <div className="flex gap-2.5 items-center">
                          {/* Present clicker */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[7px] font-black uppercase text-emerald-500">Present</span>
                            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-850 p-1.5 rounded-xl">
                              <button 
                                onClick={() => decrementAttended(sub.id)}
                                className="h-6 w-6 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center hover:text-rose-500 cursor-pointer text-xs"
                                title="-1 Present Class"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => incrementAttended(sub.id)}
                                className="h-6 w-6 rounded bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 cursor-pointer text-xs font-black"
                                title="+1 Present Class"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Bunk/Absent clicker */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[7px] font-black uppercase text-rose-400">Bunked</span>
                            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-850 p-1.5 rounded-xl">
                              <button 
                                onClick={() => decrementConductedOnly(sub.id)}
                                className="h-6 w-6 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center hover:text-rose-500 cursor-pointer text-xs"
                                title="-1 Bunked Class"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => incrementConductedOnly(sub.id)}
                                className="h-6 w-6 rounded bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer text-xs font-black"
                                title="+1 Bunked Class"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove subject button */}
                        <button
                          onClick={() => handleRemoveSubject(sub.id, sub.name)}
                          className="p-2 border border-zinc-850 bg-zinc-950 text-zinc-600 hover:text-rose-500 hover:border-rose-500/20 rounded-xl transition-all cursor-pointer hidden group-hover:block"
                          title="Delete Subject"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>

          {/* COLUMN 2: ANALYTICS & AI PREDICTIONS (Right 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* RADIAL PROGRESS SCORE GAUGE */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-lg space-y-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
              <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 rounded-lg border border-emerald-500/20 inline-block">
                Overall Rollup Attendance
              </span>

              {/* SVG Radial Gauge */}
              <div className="flex flex-col items-center justify-center pt-2 relative">
                
                {/* Status-colored parallax blur ring */}
                <div className={`absolute h-36 w-36 rounded-full bg-opacity-5 filter blur-xl animate-pulse ${
                  globalPercentage >= target + 5 ? "bg-emerald-500" : globalPercentage >= target ? "bg-amber-500" : "bg-rose-500"
                }`} />

                <div className="relative h-44 w-44 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="70"
                      className="stroke-zinc-900"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="88"
                      cy="88"
                      r="70"
                      className={globalRisk.stroke}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 70}
                      initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 70 - (Math.min(100, globalPercentage) / 100) * (2 * Math.PI * 70) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 6px ${globalRisk.stroke === "stroke-emerald-500" ? "rgba(16,185,129,0.3)" : globalRisk.stroke === "stroke-amber-500" ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"})` }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                      AGGREGATED SCORE
                    </span>
                    <h2 className="text-4xl font-black text-zinc-100 mt-0.5 tracking-tight">
                      {globalConducted > 0 ? `${globalPercentage.toFixed(1)}%` : "0.0%"}
                    </h2>
                    <span className="text-[8px] font-bold text-zinc-550 mt-0.5">
                      conducted: {globalConducted} classes
                    </span>
                  </div>
                </div>

                {/* Status zone badge */}
                <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${globalRisk.bg} ${globalRisk.border} ${globalRisk.text}`}>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{globalPercentage >= target + 5 ? "Safe Zone" : globalPercentage >= target ? "Warning Zone" : "Danger Zone"}</span>
                </div>
              </div>

              {/* Adjust global target */}
              <div className="flex items-center justify-between border-t border-zinc-900 pt-4 text-left">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Global Policy Target
                </span>
                <div className="flex items-center gap-1">
                  {[75, 80, 85].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTarget(t)}
                      className={`px-2 py-1 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                        target === t 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* INTERACTIVE MONTHLY CALENDAR LOGGER */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
              
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-500" /> Interactive Monthly Logger
                </h4>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-zinc-400 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    ◀
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 min-w-24 text-center">
                    {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-zinc-400 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    ▶
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-4">
                
                {/* Select active logger subject */}
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-zinc-550 uppercase">Active Logging Subject</label>
                  <select
                    value={selectedLogSubjectId}
                    onChange={(e) => setSelectedLogSubjectId(e.target.value)}
                    className="h-8.5 w-full bg-zinc-900 border border-zinc-855 rounded-xl px-2.5 text-xs font-bold text-zinc-200 outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-black uppercase text-zinc-500 tracking-wider">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {(() => {
                      const year = currentDate.getFullYear();
                      const month = currentDate.getMonth();
                      const firstDay = new Date(year, month, 1);
                      const startDay = firstDay.getDay(); // 0: Sunday, 1: Monday...
                      const totalDays = new Date(year, month + 1, 0).getDate();
                      
                      const days = [];
                      for (let i = 0; i < startDay; i++) {
                        days.push(null);
                      }
                      for (let d = 1; d <= totalDays; d++) {
                        days.push(d);
                      }

                      return days.map((d, index) => {
                        if (d === null) {
                          return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                        const status = attendanceLogs[dateStr]?.[selectedLogSubjectId] || null;

                        let borderClass = "border-zinc-900 hover:border-zinc-700 bg-zinc-900/10";
                        let glowClass = "";
                        let dotColor = "bg-transparent";

                        if (status === "present") {
                          borderClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-405";
                          glowClass = "shadow-[inset_0_1px_10px_rgba(16,185,129,0.1)]";
                          dotColor = "bg-emerald-500";
                        } else if (status === "absent") {
                          borderClass = "border-rose-500/30 bg-rose-500/10 text-rose-405";
                          glowClass = "shadow-[inset_0_1px_10px_rgba(239,68,68,0.1)]";
                          dotColor = "bg-rose-500";
                        }

                        return (
                          <button
                            key={dateStr}
                            onClick={() => {
                              const nextStatus = status === null ? "present" : status === "present" ? "absent" : null;
                              setDayLog(dateStr, selectedLogSubjectId, nextStatus);
                            }}
                            className={`aspect-square flex flex-col items-center justify-between p-1 rounded-xl border text-[10px] font-black transition-all cursor-pointer hover:scale-105 active:scale-95 ${borderClass} ${glowClass}`}
                            title={`Click to toggle attendance for ${dateStr}`}
                          >
                            <span className="self-start text-[8px] opacity-60 leading-none">{d}</span>
                            <div className={`h-1.5 w-1.5 rounded-full ${dotColor} mb-0.5`} />
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Quick logging buttons */}
                <div className="border-t border-zinc-900/60 pt-3 space-y-2">
                  <span className="text-[8px] font-black text-zinc-550 uppercase">Today's Quick Shortcuts</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickLog(true)}
                      className="py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer animate-none"
                    >
                      ✓ Log Present Today
                    </button>
                    <button
                      onClick={() => handleQuickLog(false)}
                      className="py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer animate-none"
                    >
                      ✗ Log Absent Today
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* PREDICTIVE AI INSIGHTS & RISK METER */}
            {globalConducted > 0 && (
              <div className="space-y-6">
                
                {/* BUNK RISK METER */}
                {(() => {
                  const bunkRiskVal = (() => {
                    if (globalPercentage < target) return 100;
                    if (globalPercentage === 100) return 0;
                    const diff = globalPercentage - target;
                    if (diff >= 12) return 10;
                    return Math.max(10, Math.min(95, 90 - (diff / 12) * 80));
                  })();

                  const getRiskLabel = (val: number) => {
                    if (val >= 80) return { label: "CRITICAL DANGER", color: "text-rose-450" };
                    if (val >= 50) return { label: "MODERATE WARNING", color: "text-amber-455" };
                    return { label: "SAFE OPERATION", color: "text-emerald-450" };
                  };

                  const riskMeta = getRiskLabel(bunkRiskVal);

                  return (
                    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4 text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
                      <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-rose-500" /> Bunk Risk Meter
                      </h4>
                      
                      <div className="space-y-3 pt-1">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                          <span className="text-zinc-500">Risk Assessment Status</span>
                          <span className={riskMeta.color}>{riskMeta.label}</span>
                        </div>

                        {/* Gradient progress bar track */}
                        <div className="h-2.5 w-full rounded-full bg-zinc-950 border border-zinc-900 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-80" />
                          {/* Needle indicator */}
                          <motion.div
                            className="absolute top-0 bottom-0 w-1.5 bg-white border border-zinc-950 rounded shadow-md"
                            style={{ left: `${bunkRiskVal}%` }}
                            animate={{ left: `${bunkRiskVal}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                          />
                        </div>

                        <div className="flex justify-between text-[8px] font-black uppercase text-zinc-550 tracking-wider">
                          <span>Low Risk</span>
                          <span>Moderate</span>
                          <span>Critical Danger</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* FUTURE SCENARIO MATRIX */}
                <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4 text-left">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
                  <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-emerald-500" /> Future Scenario Projections
                  </h4>
                  
                  <div className="space-y-2 text-xs font-semibold text-zinc-400">
                    <div className="flex justify-between items-center p-3 bg-zinc-950/60 border border-zinc-900 rounded-2xl">
                      <span>Bunk next class</span>
                      <span className={`font-black ${getRiskColor(((globalAttended) / (globalConducted + 1)) * 100, target).text}`}>
                        {(((globalAttended) / (globalConducted + 1)) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-zinc-950/60 border border-zinc-900 rounded-2xl">
                      <span>Bunk next 3 classes</span>
                      <span className={`font-black ${getRiskColor(((globalAttended) / (globalConducted + 3)) * 100, target).text}`}>
                        {(((globalAttended) / (globalConducted + 3)) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-zinc-950/60 border border-zinc-900 rounded-2xl">
                      <span>Attend next 5 classes (Streak)</span>
                      <span className={`font-black ${getRiskColor(((globalAttended + 5) / (globalConducted + 5)) * 100, target).text}`}>
                        {(((globalAttended + 5) / (globalConducted + 5)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI RECOMMENDATIONS DESK */}
                <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4 text-left">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
                  <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-400" /> AI Insights &amp; Recommendations
                  </h4>

                  <div className="space-y-3">
                    {(() => {
                      const list = [];
                      const below = subjects.filter(s => s.conducted > 0 && (s.attended / s.conducted) * 100 < s.target);
                      const close = subjects.filter(s => {
                        const pct = s.conducted > 0 ? (s.attended / s.conducted) * 100 : 0;
                        return pct >= s.target && pct < s.target + 3;
                      });

                      if (below.length > 0) {
                        below.forEach(s => {
                          const needed = Math.ceil((s.target * s.conducted - 100 * s.attended) / (100 - s.target));
                          list.push(
                            <div key={`below-${s.id}`} className="p-3.5 border border-rose-500/20 bg-rose-500/5 rounded-2xl flex gap-3 text-xs leading-relaxed text-zinc-300">
                              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black text-[9px] uppercase tracking-wider text-rose-450 block mb-0.5">Critical Attendance Shortage</span>
                                <strong>{s.name}</strong> is at <strong>{((s.attended / s.conducted) * 100).toFixed(1)}%</strong>. You must attend the next <strong>{needed}</strong> lecture{needed === 1 ? "" : "s"} consecutively to hit your {s.target}% target.
                              </div>
                            </div>
                          );
                        });
                      }

                      if (close.length > 0) {
                        close.forEach(s => {
                          list.push(
                            <div key={`close-${s.id}`} className="p-3.5 border border-amber-500/20 bg-amber-500/5 rounded-2xl flex gap-3 text-xs leading-relaxed text-zinc-300">
                              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black text-[9px] uppercase tracking-wider text-amber-450 block mb-0.5">Warning Buffer Risk</span>
                                <strong>{s.name}</strong> is at <strong>{((s.attended / s.conducted) * 100).toFixed(1)}%</strong>. You are less than 3% away from falling below target. Avoid missing any upcoming lectures.
                              </div>
                            </div>
                          );
                        });
                      }

                      if (list.length === 0) {
                        list.push(
                          <div key="all-good" className="p-3.5 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex gap-3 text-xs leading-relaxed text-zinc-300">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-black text-[9px] uppercase tracking-wider text-emerald-400 block mb-0.5">Overall Profile Healthy</span>
                              All courses meet or exceed target limits. You have accumulated a total of <strong>{maxGlobalBunks}</strong> classes globally in safety margins. Keep it up!
                            </div>
                          </div>
                        );
                      }
                      return list;
                    })()}
                  </div>
                </div>

              </div>
            )}

            {/* EXAM SURVIVAL MODE */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4 text-left">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-emerald-500" /> Exam Survival Mode
                </h4>
                <button
                  onClick={() => setShowSurvivalMode(!showSurvivalMode)}
                  className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-[8px] font-black text-zinc-400 cursor-pointer uppercase transition-colors"
                >
                  {showSurvivalMode ? "Hide Details" : "Activate"}
                </button>
              </div>

              {showSurvivalMode && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-zinc-550 uppercase">Classes Left Before Exams</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={remainingClasses}
                        onChange={(e) => setRemainingClasses(parseInt(e.target.value) || 1)}
                        className="h-8.5 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 text-xs font-bold text-zinc-200 outline-none focus:border-emerald-500/40"
                      />
                    </div>

                    <div className="border-t border-zinc-900/60 pt-3 space-y-2.5">
                      {survivalMetrics.isUnreachable ? (
                        <div className="flex gap-2.5 items-start text-rose-400 leading-normal">
                          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider">Shortage Inevitable</span>
                            <p className="text-[11px] text-zinc-400 font-semibold">
                              Even if you attend all remaining {remainingClasses} classes, you will not meet your {target}% target. Request a medical waiver or contact your professor.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2.5 items-start text-emerald-400 leading-normal">
                          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider">Survival Path Computed</span>
                            <p className="text-[11px] text-zinc-400 font-semibold">
                              You must attend at least <strong className="text-emerald-400">{survivalMetrics.minClassesNeeded}</strong> of the remaining {remainingClasses} classes. You can only afford to bunk <strong className="text-amber-500">{survivalMetrics.maxBunksAllowed}</strong> class{survivalMetrics.maxBunksAllowed === 1 ? "" : "es"}.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* VIRTUAL ACHIEVEMENTS LIST */}
            {activeBadges.length > 0 && (
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-500 animate-bounce" style={{ animationDuration: "3s" }} /> Gamification Achievements
                </h4>
                
                <div className="grid gap-2.5">
                  {activeBadges.map((badge) => {
                    const Icon = badge.icon;
                    
                    let glowBorderColor = "hover:border-amber-500/40 hover:shadow-amber-500/5";
                    if (badge.color.includes("purple")) glowBorderColor = "hover:border-purple-500/40 hover:shadow-purple-500/5";
                    if (badge.color.includes("cyan")) glowBorderColor = "hover:border-cyan-500/40 hover:shadow-cyan-500/5";
                    if (badge.color.includes("emerald")) glowBorderColor = "hover:border-emerald-500/40 hover:shadow-emerald-500/5";

                    return (
                      <motion.div 
                        key={badge.name}
                        whileHover={{ y: -2, scale: 1.01 }}
                        className={`p-3.5 border rounded-2xl flex items-start gap-3.5 bg-zinc-950/40 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${badge.color} ${glowBorderColor}`}
                      >
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-[11px] font-black uppercase tracking-wider text-zinc-100">{badge.name}</h5>
                          <p className="text-[10px] font-semibold text-zinc-400 leading-relaxed">{badge.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ATTENDANCE TREND LINE GRAPH */}
            {subjects.length > 0 && (
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" /> Subject Attendance Chart
                </h4>
                
                <div className="w-full bg-zinc-950/60 rounded-2xl p-3 border border-zinc-900">
                  <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto">
                    {/* Gridlines */}
                    <line x1={paddingX} y1={paddingY} x2={graphWidth - paddingX} y2={paddingY} className="stroke-zinc-900" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={graphHeight / 2} x2={graphWidth - paddingX} y2={graphHeight / 2} className="stroke-zinc-900/60" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={graphHeight - paddingY} x2={graphWidth - paddingX} y2={graphHeight - paddingY} className="stroke-zinc-900" strokeWidth="1" />

                    {/* Gradient Area Fill */}
                    <defs>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Target line */}
                    {target > 0 && (
                      <g>
                        <line 
                          x1={paddingX} 
                          y1={graphHeight - paddingY - (target / 100) * (graphHeight - 2 * paddingY)} 
                          x2={graphWidth - paddingX} 
                          y2={graphHeight - paddingY - (target / 100) * (graphHeight - 2 * paddingY)} 
                          className="stroke-emerald-500/20" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={graphWidth - paddingX - 5} 
                          y={graphHeight - paddingY - (target / 100) * (graphHeight - 2 * paddingY) - 5} 
                          fontSize="7" 
                          fontWeight="bold" 
                          textAnchor="end" 
                          className="fill-emerald-500/40 font-black uppercase tracking-wider"
                        >
                          Target ({target}%)
                        </text>
                      </g>
                    )}

                    {/* Area under curve */}
                    <path
                      d={getGraphAreaPath(getGraphDataPoints())}
                      fill="url(#attGrad)"
                    />

                    {/* Connection line */}
                    <path
                      d={subjects.length === 1 ? "" : `M ${getGraphDataPoints()}`}
                      fill="none"
                      className="stroke-emerald-500"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: "drop-shadow(0 2px 4px rgba(16,185,129,0.2))" }}
                    />

                    {/* Data Points */}
                    {subjects.map((sub, idx) => {
                      const spacingFactor = subjects.length > 1 ? (subjects.length - 1) : 1;
                      const pct = sub.conducted > 0 ? (sub.attended / sub.conducted) * 100 : 0;
                      const x = paddingX + (idx / spacingFactor) * (graphWidth - 2 * paddingX);
                      const y = graphHeight - paddingY - (pct / 100) * (graphHeight - 2 * paddingY);
                      return (
                        <g key={idx} className="group/dot cursor-pointer">
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            className="fill-emerald-500 stroke-zinc-950 hover:r-6 hover:fill-emerald-400 transition-all"
                            strokeWidth="2"
                          />
                          <text
                            x={x}
                            y={y - 8}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            className="fill-zinc-300 font-sans"
                          >
                            {pct.toFixed(0)}%
                          </text>
                          <text
                            x={x}
                            y={graphHeight - paddingY + 12}
                            textAnchor="middle"
                            fontSize="7"
                            fontWeight="black"
                            className="fill-zinc-550 uppercase tracking-widest text-center"
                          >
                            {sub.name.length > 10 ? `${sub.name.substring(0, 8)}...` : sub.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

          </div>
        </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
