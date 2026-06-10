"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Info, CheckCircle2, AlertCircle, Plus, Minus, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendanceCalculator() {
  const [target, setTarget] = useState<number>(75);
  const [totalClasses, setTotalClasses] = useState<string>("40");
  const [attendedClasses, setAttendedClasses] = useState<string>("32");

  // Simulation offsets
  const [simAttendedOffset, setSimAttendedOffset] = useState<number>(0);
  const [simAbsentOffset, setSimAbsentOffset] = useState<number>(0);

  const baseTotal = parseInt(totalClasses) || 0;
  const baseAttended = parseInt(attendedClasses) || 0;

  const total = baseTotal + simAttendedOffset + simAbsentOffset;
  const attended = baseAttended + simAttendedOffset;

  // Calculate current attendance
  const currentPercentage = total > 0 ? (attended / total) * 100 : 0;

  let statusMessage = "";
  let statusType: "safe" | "danger" | "neutral" = "neutral";
  let detailMessage = "";

  if (total > 0) {
    if (currentPercentage >= target) {
      // Safe zone: Calculate how many classes can be bunked
      // bunk <= (attended * 100 - target * total) / target
      const maxBunks = Math.floor((attended * 100 - target * total) / target);
      statusType = "safe";
      if (maxBunks > 0) {
        statusMessage = `Safe Zone!`;
        detailMessage = `You can bunk the next ${maxBunks} class${maxBunks === 1 ? "" : "es"} consecutively and still stay above ${target}%.`;
      } else {
        statusMessage = `On the Limit!`;
        detailMessage = `Do not bunk any upcoming classes. Even a single bunk will drop your attendance below ${target}%.`;
      }
    } else {
      // Danger zone: Calculate how many classes must be attended
      // required >= (target * total - 100 * attended) / (100 - target)
      statusType = "danger";
      if (target >= 100) {
        statusMessage = `Impossible Target`;
        detailMessage = `To reach 100% attendance, you must have attended all classes. Current percentage is ${currentPercentage.toFixed(1)}%.`;
      } else {
        const requiredClasses = Math.ceil((target * total - 100 * attended) / (100 - target));
        statusMessage = `Below Target!`;
        detailMessage = `You need to attend the next ${requiredClasses} class${requiredClasses === 1 ? "" : "es"} consecutively to reach your ${target}% target.`;
      }
    }
  }

  const handleResetSimulation = () => {
    setSimAttendedOffset(0);
    setSimAbsentOffset(0);
  };

  // SVG parameters for radial gauge
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentPercentage / 100) * circumference;

  // Color helper based on percentage
  const getGaugeColor = () => {
    if (total === 0) return "stroke-slate-350 dark:stroke-slate-700";
    if (currentPercentage >= target + 5) return "stroke-emerald-500";
    if (currentPercentage >= target) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  const getGaugeGlow = () => {
    if (total === 0) return "shadow-slate-500/10";
    if (currentPercentage >= target + 5) return "shadow-emerald-500/20";
    if (currentPercentage >= target) return "shadow-amber-500/20";
    return "shadow-rose-500/20";
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

        {/* Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Attendance Planner</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Check if you can bunk classes or find out how many you must attend to maintain your college limits.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <Calendar className="h-4 w-4" /> attendance
          </span>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Target Attendance */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Target Attendance Percentage (%)
                </label>
                <div className="flex flex-wrap gap-3">
                  {[75, 80, 85, 90].map((val) => (
                    <button
                      key={val}
                      onClick={() => setTarget(val)}
                      className={`flex-1 min-w-[50px] py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                        target === val
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-background border-border hover:bg-muted text-foreground"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                  <div className="relative w-24">
                    <input
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-bold text-center focus-visible:outline-none"
                      placeholder="Custom"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Grid for values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Classes Conducted
                  </label>
                  <input
                    type="number"
                    value={totalClasses}
                    onChange={(e) => {
                      setTotalClasses(e.target.value);
                      handleResetSimulation();
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                    placeholder="e.g. 50"
                    min="1"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Classes Attended
                  </label>
                  <input
                    type="number"
                    value={attendedClasses}
                    onChange={(e) => {
                      setAttendedClasses(e.target.value);
                      handleResetSimulation();
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                    placeholder="e.g. 40"
                    min="0"
                  />
                </div>
              </div>

              {/* Informational tips */}
              <div className="flex gap-2.5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-700 dark:text-amber-500 font-semibold leading-relaxed">
                <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <p>
                  Most universities enforce a strict 75% attendance policy. Use this planner to simulate bunking buffers, track recovery timelines before exams, and view calculations instantly.
                </p>
              </div>
            </div>

            {/* Bunk Simulator Panel */}
            {baseTotal > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">Interactive Simulator</h3>
                    <p className="text-[11px] text-muted-foreground">Simulate upcoming classes to project how bunking impacts your percentage.</p>
                  </div>
                  {(simAttendedOffset !== 0 || simAbsentOffset !== 0) && (
                    <button
                      onClick={handleResetSimulation}
                      className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-600 bg-rose-500/10 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset Sim
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Attend classes clickers */}
                  <div className="p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Attend Future Classes</span>
                    <h4 className="text-xl font-black text-emerald-600">+{simAttendedOffset}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSimAttendedOffset(Math.max(0, simAttendedOffset - 1))}
                        disabled={simAttendedOffset === 0}
                        className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-600 disabled:opacity-50 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setSimAttendedOffset(simAttendedOffset + 1)}
                        className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-650 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bunk classes clickers */}
                  <div className="p-4 rounded-2xl border border-rose-500/10 bg-rose-500/5 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Bunk Future Classes</span>
                    <h4 className="text-xl font-black text-rose-600">+{simAbsentOffset}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSimAbsentOffset(Math.max(0, simAbsentOffset - 1))}
                        disabled={simAbsentOffset === 0}
                        className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/10 flex items-center justify-center text-rose-600 disabled:opacity-50 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setSimAbsentOffset(simAbsentOffset + 1)}
                        className="h-8 w-8 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:bg-rose-650 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {(simAttendedOffset !== 0 || simAbsentOffset !== 0) && (
                  <p className="text-[10px] text-center text-brand-600 font-bold bg-brand-50/50 dark:bg-brand-950/20 py-2 rounded-xl border border-brand-550/10">
                    Showing projected values (Conducted: +{simAttendedOffset + simAbsentOffset}, Attended: +{simAttendedOffset})
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Result Panel */}
          <div className="md:col-span-5">
            <div className="bg-card border border-border/85 rounded-3xl p-6 shadow-md space-y-6 sticky top-24 text-center">
              {/* Radial Percentage Gauge */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="stroke-slate-200 dark:stroke-slate-800"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className={getGaugeColor()}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                      PERCENTAGE
                    </span>
                    <h2 className="text-3xl font-black text-foreground mt-0.5">
                      {total > 0 ? `${currentPercentage.toFixed(1)}%` : "—"}
                    </h2>
                  </div>
                </div>
                <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  total === 0 
                    ? "bg-slate-100 text-slate-500" 
                    : currentPercentage >= target
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-rose-500/10 text-rose-600"
                }`}>
                  {total === 0 ? "No Data" : currentPercentage >= target ? "On Track" : "Danger Zone"}
                </div>
              </div>

              {total > 0 && (
                <div className="border-t border-border/50 pt-5 space-y-4 text-left">
                  <div className="flex gap-2.5 items-start">
                    {statusType === "safe" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                        {statusMessage}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        {detailMessage}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-bold text-muted-foreground pt-3 border-t border-border/30">
                    <div className="flex justify-between">
                      <span>Total Classes Conducted:</span>
                      <span className="text-foreground">{total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Classes Attended:</span>
                      <span className="text-foreground">{attended}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Absences:</span>
                      <span className="text-foreground">{total - attended}</span>
                    </div>
                  </div>
                </div>
              )}

              {total === 0 && (
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  Enter conducted classes and attended classes to calculate your evaluation dial.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
