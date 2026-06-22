"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Trash2, Calculator, RefreshCw, Save, Download, 
  Sparkles, Trophy, Award, TrendingUp, Calendar, Info, X, Check, 
  Star, CheckCircle, HelpCircle, AlertCircle, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

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
  "O": { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10", shadow: "shadow-emerald-500/10" },
  "A+": { border: "border-teal-500/30", text: "text-teal-400", bg: "bg-teal-500/10", shadow: "shadow-teal-500/10" },
  "A": { border: "border-cyan-500/30", text: "text-cyan-400", bg: "bg-cyan-500/10", shadow: "shadow-cyan-500/10" },
  "B+": { border: "border-indigo-500/30", text: "text-indigo-400", bg: "bg-indigo-500/10", shadow: "shadow-indigo-500/10" },
  "B": { border: "border-purple-500/30", text: "text-purple-400", bg: "bg-purple-500/10", shadow: "shadow-purple-500/10" },
  "C": { border: "border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10", shadow: "shadow-amber-500/10" },
  "P": { border: "border-orange-500/30", text: "text-orange-400", bg: "bg-orange-500/10", shadow: "shadow-orange-500/10" },
  "F": { border: "border-rose-500/30", text: "text-rose-400", bg: "bg-rose-500/10", shadow: "shadow-rose-500/10" },
};

export default function CGPACalculator() {
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
  
  // Selected course tooltip/detail view
  const [activeCourseHover, setActiveCourseHover] = useState<{ semId: number; cIdx: number } | null>(null);

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
        
        // Auto expand all loaded semesters
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
    setNotification({ message: `Semester ${semesters.length + 1} added.`, type: "info" });
  };

  const handleRemoveSemester = (semId: number, idx: number) => {
    setSemesters(semesters.filter((s) => s.id !== semId));
    setNotification({ message: `Semester ${idx + 1} removed.`, type: "info" });
  };

  const handleAddCourse = (semId: number) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          const nextIndex = sem.courses.length + 1;
          return {
            ...sem,
            courses: [...sem.courses, { name: `Course ${nextIndex}`, credits: 3, gradePoint: 10 }],
          };
        }
        return sem;
      })
    );
  };

  const handleRemoveCourse = (semId: number, courseIndex: number) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          return {
            ...sem,
            courses: sem.courses.filter((_, idx) => idx !== courseIndex),
          };
        }
        return sem;
      })
    );
  };

  const handleCourseChange = (
    semId: number,
    courseIndex: number,
    field: keyof Course,
    value: any
  ) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          const updatedCourses = [...sem.courses];
          updatedCourses[courseIndex] = {
            ...updatedCourses[courseIndex],
            [field]: value,
          };
          return { ...sem, courses: updatedCourses };
        }
        return sem;
      })
    );
  };

  const toggleSemester = (semId: number) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [semId]: !prev[semId]
    }));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all tracking semesters?")) {
      setSemesters([
        {
          id: 1,
          courses: [
            { name: "Mathematics I", credits: 4, gradePoint: 10 },
            { name: "Programming in C", credits: 3, gradePoint: 9 },
            { name: "Physics Lab", credits: 2, gradePoint: 8 },
          ],
        },
      ]);
      setTargetCGPA(8.5);
      setExpandedSemesters({ 1: true });
      setNotification({ message: "Calculator reset completed.", type: "info" });
    }
  };

  const savePlanManually = () => {
    try {
      localStorage.setItem("smartpicks_cgpa_plan", JSON.stringify(semesters));
      localStorage.setItem("smartpicks_cgpa_target", targetCGPA.toString());
      setNotification({ message: "💾 Academic plan stored successfully in browser cookie cache!", type: "success" });
    } catch {
      setNotification({ message: "Failed to sync local data store.", type: "error" });
    }
  };

  /* ─────────────── ADVANCED PREDICTIONS & MATHS ─────────────── */
  const totalSemestersTimeline = 8;
  const completedSemestersCount = semesters.length;
  const remainingSemestersCount = Math.max(1, totalSemestersTimeline - completedSemestersCount);
  
  // Calculate average completed credits per semester
  const averageCreditsPerSemester = completedSemestersCount > 0 
    ? (totalCompletedCredits / completedSemestersCount) 
    : 18; // default standard semester weight

  // Compute required average SGPA for remaining semesters to hit target
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

  // SGPA Trend Values for Graph
  const sGPAs = semesters.map((s) => calculateSGPA(s.courses));
  
  // SVG Parameters
  const graphWidth = 500;
  const graphHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const getGraphDataPoints = () => {
    if (sGPAs.length === 0) return "";
    if (sGPAs.length === 1) {
      const y = graphHeight - paddingY - (sGPAs[0] / 10) * (graphHeight - 2 * paddingY);
      return `${paddingX},${y} ${graphWidth - paddingX},${y}`;
    }
    return sGPAs.map((val, idx) => {
      const x = paddingX + (idx / (sGPAs.length - 1)) * (graphWidth - 2 * paddingX);
      const y = graphHeight - paddingY - (val / 10) * (graphHeight - 2 * paddingY);
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

  // Badges array calculation
  const getBadges = () => {
    const list = [];
    if (currentCGPA >= 9.5) {
      list.push({ name: "Gold Medalist", icon: Trophy, desc: "Ranked top of class (>=9.5 CGPA)", color: "text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-amber-500/5" });
    } else if (currentCGPA >= 9.0) {
      list.push({ name: "Dean's List", icon: Award, desc: "Distinction list (>=9.0 CGPA)", color: "text-purple-400 border-purple-500/20 bg-purple-500/10 shadow-purple-500/5" });
    } else if (currentCGPA >= 8.0) {
      list.push({ name: "First Class", icon: Star, desc: "High honor roll (>=8.0 CGPA)", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10 shadow-indigo-500/5" });
    }

    if (sGPAs.length >= 2 && sGPAs[sGPAs.length - 1] > sGPAs[sGPAs.length - 2] + 0.4) {
      list.push({ name: "Bounceback Champ", icon: TrendingUp, desc: "Semester SGPA jumped by +0.4", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/5" });
    }

    if (sGPAs.length >= 3) {
      const variance = Math.max(...sGPAs) - Math.min(...sGPAs);
      if (variance < 0.6) {
        list.push({ name: "Consistency Hero", icon: CheckCircle, desc: "Extremely steady SGPA variance", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10 shadow-cyan-500/5" });
      }
    }
    return list;
  };

  const activeBadges = getBadges();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden select-none pb-16">
      
      {/* 1. Dynamic background radial glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-cyan-900/5 blur-[120px]" />
      </div>

      <div className="container-custom max-w-6xl relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Back link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-200 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Hub
        </Link>

        {/* Dashboard Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-zinc-900 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-500/20 bg-purple-500/10">
              <Calculator className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Academic Analytics Portal</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-50 tracking-tight pt-2">CGPA Tracker &amp; Insights</h1>
            <p className="text-xs text-zinc-400 font-semibold">
              Predict future semesters, map required grade pathways, and analyze academic score milestones.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={savePlanManually}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-purple-500 text-white hover:bg-purple-650 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
              title="Save Plan"
            >
              <Save className="h-3.5 w-3.5" /> Save Plan
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer"
              title="Reset Data"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset Calculator
            </button>
          </div>
        </motion.div>

        {/* Notification Alert banner */}
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
                  : "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}
            >
              {notification.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <Info className="h-5 w-5 shrink-0" />}
              <span className="flex-1">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. HERO STATISTIC CARDS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Current CGPA */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-550">Current CGPA</h4>
                <p className="text-3xl font-black text-zinc-100 mt-1">{currentCGPA.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Trophy className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div className="text-[9px] font-semibold text-zinc-400 flex items-center gap-1">
              <span className="text-purple-400">Scale:</span> Out of 10.0 max academic GPA
            </div>
          </div>

          {/* Target CGPA */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-indigo-500/30 transition-all duration-300 relative group overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div className="w-full">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-550">Target CGPA</h4>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-black text-zinc-100">{targetCGPA.toFixed(2)}</p>
                  <div className="flex flex-col gap-0.5">
                    <button 
                      onClick={() => setTargetCGPA(p => Math.min(10, Math.round((p + 0.1) * 10) / 10))}
                      className="p-0.5 bg-zinc-900 border border-zinc-800 rounded text-[8px] hover:text-indigo-400 cursor-pointer"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => setTargetCGPA(p => Math.max(0, Math.round((p - 0.1) * 10) / 10))}
                      className="p-0.5 bg-zinc-900 border border-zinc-800 rounded text-[8px] hover:text-indigo-400 cursor-pointer"
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
            <div className={`text-[9px] font-black uppercase tracking-wider ${
              currentCGPA >= targetCGPA ? "text-emerald-400" : "text-amber-500"
            }`}>
              {currentCGPA >= targetCGPA 
                ? "✓ Target currently achieved!" 
                : `Behind target by ${(targetCGPA - currentCGPA).toFixed(2)} pts`}
            </div>
          </div>

          {/* Total Credits */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-cyan-500/30 transition-all duration-300 relative group overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-550">Completed Credits</h4>
                <p className="text-3xl font-black text-zinc-100 mt-1">{totalCompletedCredits} Credits</p>
              </div>
              <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <BookOpen className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div className="text-[9px] font-semibold text-zinc-400">
              Aggregated weight of university coursework
            </div>
          </div>

          {/* Semester Progress */}
          {/* Progress bar out of 8 semesters */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between h-36 hover:border-emerald-500/30 transition-all duration-300 relative group overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-550">Course Progress</h4>
                <p className="text-3xl font-black text-zinc-100 mt-1">
                  {completedSemestersCount} / {totalSemestersTimeline}
                </p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[8px] font-bold text-zinc-500">
                <span>SEMESTERS TIMELINE</span>
                <span>{Math.round((completedSemestersCount / totalSemestersTimeline) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden border border-zinc-900">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (completedSemestersCount / totalSemestersTimeline) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* MAIN SPLIT LAYOUT */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: SEMESTER LIST & MANAGEMENT (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Academic Semesters ({semesters.length})
              </span>
              <button
                onClick={handleAddSemester}
                className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 hover:text-purple-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                + Add Semester
              </button>
            </div>

            <AnimatePresence initial={false}>
              {semesters.map((sem, semIdx) => {
                const sgpa = calculateSGPA(sem.courses);
                const isExpanded = expandedSemesters[sem.id] !== false; // defaults to true
                const totalSemCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);

                return (
                  <motion.div
                    key={sem.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl overflow-hidden backdrop-blur-xl shadow-lg relative group"
                  >
                    {/* Top glass reflection gradient */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />

                    {/* Semester Header Box */}
                    <div 
                      onClick={() => toggleSemester(sem.id)}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/10 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center font-black text-xs text-purple-400">
                          S{semIdx + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-zinc-200 text-sm">Semester {semIdx + 1}</h3>
                          <p className="text-[9px] text-zinc-500 font-semibold">{sem.courses.length} courses • {totalSemCredits} credits</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-[10px]">
                          SGPA: {sgpa.toFixed(2)}
                        </div>

                        {semesters.length > 1 && (
                          <button
                            onClick={() => handleRemoveSemester(sem.id, semIdx)}
                            className="p-1.5 rounded-lg border border-zinc-850 bg-zinc-950 text-zinc-550 hover:text-rose-500 hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Remove Semester"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => toggleSemester(sem.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {isExpanded ? "▲" : "▼"}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Semester Course Panel */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-zinc-900/60 bg-zinc-950/20"
                        >
                          <div className="p-5 space-y-4">
                            {/* Course headers */}
                            <div className="grid grid-cols-12 gap-3 text-[8px] font-black uppercase tracking-wider text-zinc-550 text-left px-1">
                              <div className="col-span-5">Course Label</div>
                              <div className="col-span-2">Credits</div>
                              <div className="col-span-5">Grade Point</div>
                            </div>

                            {/* Course rows */}
                            <div className="space-y-3">
                              {sem.courses.map((course, cIdx) => (
                                <div 
                                  key={cIdx} 
                                  className="grid grid-cols-12 gap-3 items-center p-2 rounded-2xl bg-zinc-950/40 border border-zinc-900/80 hover:border-zinc-800 transition-all relative"
                                  onMouseEnter={() => setActiveCourseHover({ semId: sem.id, cIdx })}
                                  onMouseLeave={() => setActiveCourseHover(null)}
                                >
                                  {/* Course label input */}
                                  <div className="col-span-12 sm:col-span-5">
                                    <input
                                      type="text"
                                      value={course.name}
                                      onChange={(e) => handleCourseChange(sem.id, cIdx, "name", e.target.value)}
                                      placeholder="e.g. Data Structures"
                                      className="h-8 w-full bg-zinc-950/60 border border-zinc-850/80 rounded-xl px-2.5 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500/40 placeholder:text-zinc-650 transition-colors"
                                    />
                                  </div>

                                  {/* Credits Selector (Interactive slider or input) */}
                                  <div className="col-span-6 sm:col-span-2">
                                    <input
                                      type="number"
                                      min={1}
                                      max={20}
                                      value={course.credits || ""}
                                      onChange={(e) => handleCourseChange(sem.id, cIdx, "credits", parseInt(e.target.value) || 0)}
                                      className="h-8 w-full text-center bg-zinc-950/60 border border-zinc-850/80 rounded-xl px-1 text-xs font-black text-zinc-200 outline-none focus:border-purple-500/40"
                                      placeholder="Credits"
                                    />
                                  </div>

                                  {/* Color coded Grade Chips selection */}
                                  <div className="col-span-5 flex flex-wrap gap-1 items-center">
                                    {GRADES.map((g) => {
                                      const isSelected = course.gradePoint === GRADE_POINTS[g];
                                      const styles = GRADE_COLORS[g];
                                      return (
                                        <button
                                          key={g}
                                          onClick={() => handleCourseChange(sem.id, cIdx, "gradePoint", GRADE_POINTS[g])}
                                          className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                                            isSelected 
                                              ? `${styles.bg} ${styles.border} ${styles.text} ${styles.shadow} shadow-sm scale-110` 
                                              : "bg-zinc-950/40 border-zinc-900 text-zinc-550 hover:text-zinc-350 hover:border-zinc-850"
                                          }`}
                                          title={`${g} (${GRADE_POINTS[g]} Points)`}
                                        >
                                          {g}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Delete course button (appears on hover) */}
                                  <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {sem.courses.length > 1 && (
                                      <button
                                        onClick={() => handleRemoveCourse(sem.id, cIdx)}
                                        className="p-1 rounded-full border border-zinc-850 bg-zinc-950 text-zinc-600 hover:text-rose-500 hover:border-rose-500/20 transition-all cursor-pointer"
                                        title="Delete Course"
                                      >
                                        <X className="h-2.5 w-2.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Add course button inside panel */}
                            <div className="flex justify-start">
                              <button
                                onClick={() => handleAddCourse(sem.id)}
                                className="inline-flex items-center gap-1.5 text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest cursor-pointer pt-1"
                              >
                                <Plus className="h-3 w-3" /> Add Course
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Bottom dash semantic spacer */}
            <button
              onClick={handleAddSemester}
              className="flex h-12 w-full items-center justify-center gap-1.5 border border-dashed border-zinc-800 hover:border-purple-500/40 bg-zinc-900/5 hover:bg-zinc-900/10 rounded-3xl text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-purple-500" /> Add Semester Target
            </button>
          </div>

          {/* COLUMN 2: ANALYTICS & PREDICTIONS SIDEBAR (Right 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* RADIAL PROGRESS OVERVIEW */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-lg space-y-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
              <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-400/10 rounded-lg border border-purple-500/20 inline-block">
                Academic Scoreboard
              </span>

              {/* Radial target circle */}
              <div className="flex flex-col items-center justify-center pt-2 relative">
                
                {/* Parallax blur layer */}
                <div className="absolute h-36 w-36 rounded-full bg-purple-500/5 filter blur-xl animate-pulse" />

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
                      className="stroke-purple-500"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 70}
                      initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 70 - (Math.min(10, currentCGPA) / 10) * (2 * Math.PI * 70) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.4))" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                      OVERALL CGPA
                    </span>
                    <h2 className="text-4xl font-black text-zinc-100 mt-0.5 tracking-tight">
                      {currentCGPA.toFixed(2)}
                    </h2>
                    <span className="text-[8px] font-bold text-zinc-550 mt-0.5">
                      out of 10.0
                    </span>
                  </div>
                </div>

                {/* Target badge status */}
                <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  currentCGPA >= targetCGPA
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  <Star className={`h-3 w-3 ${currentCGPA >= targetCGPA ? "fill-emerald-400" : ""}`} />
                  <span>Target: {targetCGPA.toFixed(2)}</span>
                  <span>•</span>
                  <span>{currentCGPA >= targetCGPA ? "Target Hit" : `${(targetCGPA - currentCGPA).toFixed(2)} behind`}</span>
                </div>
              </div>

              {/* Set target gpa selector */}
              <div className="flex items-center justify-between border-t border-zinc-900 pt-4 text-left">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-400" /> Target CGPA Goal
                </span>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-16 h-8 text-center text-xs font-black bg-zinc-950 border border-zinc-800/80 rounded-xl text-zinc-200 outline-none focus:border-purple-500/40"
                />
              </div>
            </div>

            {/* HIGH-FIDELITY SGPA TREND GRAPH */}
            {sGPAs.length > 0 && (
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-purple-500" /> SGPA Progression Curve
                </h4>
                
                <div className="w-full bg-zinc-950/60 rounded-2xl p-3 border border-zinc-900">
                  <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto">
                    {/* Gridlines */}
                    <line x1={paddingX} y1={paddingY} x2={graphWidth - paddingX} y2={paddingY} className="stroke-zinc-900" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={graphHeight / 2} x2={graphWidth - paddingX} y2={graphHeight / 2} className="stroke-zinc-900/60" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={graphHeight - paddingY} x2={graphWidth - paddingX} y2={graphHeight - paddingY} className="stroke-zinc-900" strokeWidth="1" />

                    {/* Gradient Area Fill */}
                    <defs>
                      <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Target dashed line */}
                    {targetCGPA > 0 && (
                      <g>
                        <line 
                          x1={paddingX} 
                          y1={graphHeight - paddingY - (targetCGPA / 10) * (graphHeight - 2 * paddingY)} 
                          x2={graphWidth - paddingX} 
                          y2={graphHeight - paddingY - (targetCGPA / 10) * (graphHeight - 2 * paddingY)} 
                          className="stroke-purple-500/20" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={graphWidth - paddingX - 5} 
                          y={graphHeight - paddingY - (targetCGPA / 10) * (graphHeight - 2 * paddingY) - 5} 
                          fontSize="7" 
                          fontWeight="bold" 
                          textAnchor="end" 
                          className="fill-purple-500/40 font-black uppercase tracking-wider"
                        >
                          Target ({targetCGPA})
                        </text>
                      </g>
                    )}

                    {/* Area under curve */}
                    <path
                      d={getGraphAreaPath(getGraphDataPoints())}
                      fill="url(#gpaGrad)"
                    />

                    {/* Core Line Connection */}
                    <path
                      d={sGPAs.length === 1 ? "" : `M ${getGraphDataPoints()}`}
                      fill="none"
                      className="stroke-purple-500"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: "drop-shadow(0 2px 4px rgba(168,85,247,0.2))" }}
                    />

                    {/* Data Points */}
                    {sGPAs.map((val, idx) => {
                      const spacingFactor = sGPAs.length > 1 ? (sGPAs.length - 1) : 1;
                      const x = paddingX + (idx / spacingFactor) * (graphWidth - 2 * paddingX);
                      const y = graphHeight - paddingY - (val / 10) * (graphHeight - 2 * paddingY);
                      return (
                        <g key={idx} className="group/dot cursor-pointer">
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            className="fill-purple-500 stroke-zinc-950 hover:r-6 hover:fill-purple-400 transition-all"
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
                            {val.toFixed(2)}
                          </text>
                          <text
                            x={x}
                            y={graphHeight - paddingY + 12}
                            textAnchor="middle"
                            fontSize="7"
                            fontWeight="black"
                            className="fill-zinc-550 uppercase tracking-widest"
                          >
                            Sem {idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* AI-POWERED REQUIRED SGPA & TARGET PATHWAY */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4 text-left">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-purple-500" /> AI Target Assessment
              </h4>
              
              <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-3">
                
                {requiredAverageSGPA > 10.0 ? (
                  <div className="flex gap-3 items-start text-rose-400">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">Target Unreachable</span>
                      <p className="text-xs font-semibold leading-relaxed text-zinc-400">
                        Based on your completed credits, you would need an average SGPA of <strong className="text-rose-400">{requiredAverageSGPA.toFixed(2)}</strong> in your remaining semesters to hit {targetCGPA.toFixed(2)}. Consider lowering your target CGPA.
                      </p>
                    </div>
                  </div>
                ) : requiredAverageSGPA <= 4.0 ? (
                  <div className="flex gap-3 items-start text-emerald-400">
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">Goal Secured</span>
                      <p className="text-xs font-semibold leading-relaxed text-zinc-400">
                        Outstanding! Your target of {targetCGPA.toFixed(2)} is already secured. Even with minimal passing grades (4.0 SGPA), you will cross your target.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start text-purple-400">
                    <TrendingUp className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">Target Pathway Active</span>
                      <p className="text-xs font-semibold leading-relaxed text-zinc-400">
                        To hit your target of <strong className="text-zinc-200">{targetCGPA.toFixed(2)}</strong>, you must maintain an average SGPA of <strong className="text-purple-400">{requiredAverageSGPA.toFixed(2)}</strong> across your remaining <strong className="text-zinc-200">{remainingSemestersCount}</strong> semesters (estimating ~{averageCreditsPerSemester.toFixed(0)} credits/sem).
                      </p>
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            {/* VIRTUAL ACHIEVEMENT BADGES CONTAINER */}
            {activeBadges.length > 0 && (
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4 text-left">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-800/60 to-zinc-800/0" />
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-500" /> Academic Achievements
                </h4>
                
                <div className="space-y-2.5">
                  {activeBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div 
                        key={badge.name} 
                        className={`p-3 border rounded-2xl flex items-start gap-3 transition-colors ${badge.color}`}
                      >
                        <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-[11px] font-black uppercase tracking-wider">{badge.name}</h5>
                          <p className="text-[10px] font-semibold text-zinc-450 leading-relaxed">{badge.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
