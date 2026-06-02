"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Calculator, RefreshCw, Save, Download, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  name: string;
  credits: number;
  gradePoint: number;
}

interface Semester {
  id: number;
  courses: Course[];
}

const gradeMap: { [key: string]: number } = {
  "O (10)": 10,
  "A+ (9)": 9,
  "A (8)": 8,
  "B+ (7)": 7,
  "B (6)": 6,
  "C (5)": 5,
  "P (4)": 4,
  "F (0)": 0,
};

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: 1,
      courses: [
        { name: "Course 1", credits: 4, gradePoint: 10 },
        { name: "Course 2", credits: 3, gradePoint: 9 },
        { name: "Course 3", credits: 3, gradePoint: 8 },
        { name: "Course 4", credits: 2, gradePoint: 10 },
      ],
    },
  ]);

  const [targetCGPA, setTargetCGPA] = useState<number>(8.5);
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddSemester = () => {
    const nextId = semesters.length > 0 ? Math.max(...semesters.map((s) => s.id)) + 1 : 1;
    setSemesters([
      ...semesters,
      {
        id: nextId,
        courses: [{ name: "Course 1", credits: 3, gradePoint: 10 }],
      },
    ]);
  };

  const handleRemoveSemester = (semId: number) => {
    setSemesters(semesters.filter((s) => s.id !== semId));
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

  // Calculates Semester SGPA
  const calculateSGPA = (courses: Course[]) => {
    let totalCredits = 0;
    let weightedPoints = 0;
    courses.forEach((c) => {
      totalCredits += c.credits;
      weightedPoints += c.credits * c.gradePoint;
    });
    return totalCredits > 0 ? Math.round((weightedPoints / totalCredits) * 100) / 100 : 0;
  };

  // Calculates Aggregate CGPA
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

  // Save layout to LocalStorage
  const savePlan = () => {
    try {
      localStorage.setItem("smartpicks_cgpa_plan", JSON.stringify(semesters));
      localStorage.setItem("smartpicks_cgpa_target", targetCGPA.toString());
      setNotification("Target plan saved successfully!");
    } catch {
      setNotification("Error saving plan locally.");
    }
  };

  // Load layout from LocalStorage
  const loadPlan = () => {
    try {
      const savedSemesters = localStorage.getItem("smartpicks_cgpa_plan");
      const savedTarget = localStorage.getItem("smartpicks_cgpa_target");
      if (savedSemesters) {
        setSemesters(JSON.parse(savedSemesters));
        if (savedTarget) setTargetCGPA(parseFloat(savedTarget));
        setNotification("Target plan loaded successfully!");
      } else {
        setNotification("No saved plan found on this browser.");
      }
    } catch {
      setNotification("Error loading plan.");
    }
  };

  const handleReset = () => {
    setSemesters([
      {
        id: 1,
        courses: [
          { name: "Course 1", credits: 4, gradePoint: 10 },
          { name: "Course 2", credits: 3, gradePoint: 9 },
          { name: "Course 3", credits: 3, gradePoint: 8 },
        ],
      },
    ]);
    setTargetCGPA(8.5);
    setNotification("Calculator reset.");
  };

  // SVG parameters for radial gauge
  const currentCGPA = calculateCGPA();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(10, currentCGPA) / 10;
  const strokeDashoffset = circumference - fraction * circumference;

  // SGPA Graph Calculations
  const sGPAs = semesters.map((s) => calculateSGPA(s.courses));
  const graphWidth = 260;
  const graphHeight = 85;
  const paddingX = 25;
  const paddingY = 15;

  const getGraphDataPoints = () => {
    if (sGPAs.length <= 1) return "";
    return sGPAs.map((val, idx) => {
      const x = paddingX + (idx / (sGPAs.length - 1)) * (graphWidth - 2 * paddingX);
      // invert y (10 is top, 0 is bottom)
      const y = graphHeight - paddingY - (val / 10) * (graphHeight - 2 * paddingY);
      return `${x},${y}`;
    }).join(" ");
  };

  const getGraphAreaPath = (pointsStr: string) => {
    if (!pointsStr) return "";
    const firstX = paddingX;
    const lastX = graphWidth - paddingX;
    const bottomY = graphHeight - paddingY;
    return `M ${firstX},${bottomY} L ${pointsStr} L ${lastX},${bottomY} Z`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-4xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Dashboard Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">CGPA Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add multiple semesters, allocate credits, and monitor your university targets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={savePlan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 border border-brand-500/10 hover:bg-brand-100 transition-all cursor-pointer"
              title="Save Plan"
            >
              <Save className="h-3.5 w-3.5" /> Save Plan
            </button>
            <button
              onClick={loadPlan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 hover:bg-slate-200 transition-all cursor-pointer"
              title="Load Plan"
            >
              <Download className="h-3.5 w-3.5" /> Load Plan
            </button>
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
              <Calculator className="h-4 w-4" /> calculator
            </span>
          </div>
        </motion.div>

        {/* Notification Alert */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-brand-500/10 border border-brand-500/20 text-xs font-black text-brand-600 dark:text-brand-400 text-center rounded-2xl mb-6 shadow-sm"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Semesters list inputs */}
          <div className="md:col-span-8 space-y-6">
            <AnimatePresence initial={false}>
              {semesters.map((sem, semIdx) => {
                const sgpa = calculateSGPA(sem.courses);

                return (
                  <motion.div
                    key={sem.id}
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h3 className="font-black text-foreground text-sm">Semester {semIdx + 1}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-brand-650 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-xl">
                          SGPA: {sgpa.toFixed(2)}
                        </span>
                        {semesters.length > 1 && (
                          <button
                            onClick={() => handleRemoveSemester(sem.id)}
                            className="text-muted-foreground hover:text-rose-500 transition-colors p-1 cursor-pointer"
                            title="Remove Semester"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Course rows */}
                    <div className="space-y-3">
                      {sem.courses.map((course, cIdx) => (
                        <div key={cIdx} className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={course.name}
                              onChange={(e) => handleCourseChange(sem.id, cIdx, "name", e.target.value)}
                              placeholder="Course Name"
                              className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              value={course.credits || ""}
                              onChange={(e) => handleCourseChange(sem.id, cIdx, "credits", parseInt(e.target.value) || 0)}
                              placeholder="Credits"
                              className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                              min="1"
                            />
                          </div>
                          <div className="col-span-3">
                            <select
                              value={course.gradePoint}
                              onChange={(e) => handleCourseChange(sem.id, cIdx, "gradePoint", parseInt(e.target.value))}
                              className="h-9 w-full bg-background border border-border rounded-xl px-2 text-xs font-bold text-foreground focus-visible:outline-none"
                            >
                              {Object.entries(gradeMap).map(([label, val]) => (
                                <option key={label} value={val}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-1 text-center">
                            {sem.courses.length > 1 && (
                              <button
                                onClick={() => handleRemoveCourse(sem.id, cIdx)}
                                className="text-muted-foreground hover:text-rose-500 p-1 cursor-pointer"
                                title="Remove Course"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddCourse(sem.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-black text-brand-600 hover:text-brand-700 mt-2 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Course
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <button
              onClick={handleAddSemester}
              className="flex h-10 w-full items-center justify-center gap-1.5 border border-dashed border-border rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Semester
            </button>
          </div>

          {/* Right panel: Final Score summary */}
          <div className="md:col-span-4 space-y-6 sticky top-24">
            <div className="bg-card border border-border/85 rounded-3xl p-6 shadow-md text-center space-y-6">
              {/* Radial Target Ring */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative h-36 w-36 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className="stroke-brand-500"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                      OVERALL CGPA
                    </span>
                    <h2 className="text-3xl font-black text-foreground mt-0.5">
                      {currentCGPA.toFixed(2)}
                    </h2>
                  </div>
                </div>

                {/* Target Match Badge */}
                <div className={`mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  currentCGPA >= targetCGPA
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}>
                  <Sparkles className="h-3 w-3" /> Target: {targetCGPA.toFixed(1)} ({currentCGPA >= targetCGPA ? "Target Hit" : `${(targetCGPA - currentCGPA).toFixed(2)} Behind`})
                </div>
              </div>

              {/* Set target input */}
              <div className="flex items-center justify-between border-t border-border/30 pt-4 text-left">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Set Target CGPA</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-14 h-7 text-center text-xs font-black bg-background border border-input rounded-lg focus-visible:outline-none"
                />
              </div>

              {/* SGPA Sparkline Area Chart */}
              {sGPAs.length > 1 && (
                <div className="border-t border-border/30 pt-4 text-left space-y-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SGPA Trend Line</span>
                  <div className="w-full bg-slate-500/5 dark:bg-slate-900/40 rounded-2xl p-2 border border-border/30">
                    <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto">
                      {/* Gradient fill */}
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e85d54" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#e85d54" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area under curve */}
                      <path
                        d={getGraphAreaPath(getGraphDataPoints())}
                        fill="url(#areaGrad)"
                      />

                      {/* Connection line */}
                      <path
                        d={`M ${getGraphDataPoints()}`}
                        fill="none"
                        className="stroke-brand-500"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Dots & Text Labels */}
                      {sGPAs.map((val, idx) => {
                        const x = paddingX + (idx / (sGPAs.length - 1)) * (graphWidth - 2 * paddingX);
                        const y = graphHeight - paddingY - (val / 10) * (graphHeight - 2 * paddingY);
                        return (
                          <g key={idx}>
                            <circle
                              cx={x}
                              cy={y}
                              r="3.5"
                              className="fill-brand-600 stroke-card"
                              strokeWidth="1.5"
                            />
                            <text
                              x={x}
                              y={y - 7}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                              className="fill-foreground font-sans"
                            >
                              S{idx + 1}: {val.toFixed(1)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* Statistics list summary */}
              <div className="border-t border-border/30 pt-4 space-y-2 text-xs font-bold text-muted-foreground text-left">
                <div className="flex justify-between">
                  <span>Total Semesters:</span>
                  <span className="text-foreground">{semesters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Semester SGPA Average:</span>
                  <span className="text-foreground">
                    {(semesters.reduce((acc, s) => acc + calculateSGPA(s.courses), 0) / (semesters.length || 1)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="flex h-9 w-full items-center justify-center gap-1 border border-border rounded-xl text-[10px] font-black text-muted-foreground hover:bg-muted/55 transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
