"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function AttendanceCalculator() {
  const [target, setTarget] = useState<number>(75);
  const [totalClasses, setTotalClasses] = useState<string>("40");
  const [attendedClasses, setAttendedClasses] = useState<string>("32");

  const total = parseInt(totalClasses) || 0;
  const attended = parseInt(attendedClasses) || 0;

  // Calculate current attendance
  const currentPercentage = total > 0 ? (attended / total) * 100 : 0;

  let message = "";
  let type: "safe" | "danger" | "neutral" = "neutral";
  let detailMessage = "";

  if (total > 0) {
    if (currentPercentage >= target) {
      // Safe zone: Calculate how many classes can be bunked
      // (attended) / (total + bunk) >= target / 100
      // attended * 100 >= target * total + target * bunk
      // target * bunk <= attended * 100 - target * total
      // bunk <= (attended * 100 - target * total) / target
      const maxBunks = Math.floor((attended * 100 - target * total) / target);
      type = "safe";
      if (maxBunks > 0) {
        message = `You are in the Safe Zone!`;
        detailMessage = `You can bunk the next ${maxBunks} class${maxBunks === 1 ? "" : "es"} consecutively and still stay above ${target}%.`;
      } else {
        message = `You are exactly on the line!`;
        detailMessage = `Do not bunk any upcoming classes. Even a single bunk will drop your attendance below ${target}%.`;
      }
    } else {
      // Danger zone: Calculate how many classes must be attended
      // (attended + required) / (total + required) >= target / 100
      // 100 * attended + 100 * required >= target * total + target * required
      // (100 - target) * required >= target * total - 100 * attended
      // required >= (target * total - 100 * attended) / (100 - target)
      type = "danger";
      if (target >= 100) {
        message = `Impossible Target`;
        detailMessage = `To reach 100% attendance, you must have attended all classes. Current percentage is ${currentPercentage.toFixed(1)}%.`;
      } else {
        const requiredClasses = Math.ceil((target * total - 100 * attended) / (100 - target));
        message = `Attendance is below target!`;
        detailMessage = `You need to attend the next ${requiredClasses} class${requiredClasses === 1 ? "" : "es"} consecutively to reach your ${target}% target.`;
      }
    }
  }

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
        <div className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Attendance Calculator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Check if you can bunk classes or find out how many you must attend to maintain your college limits.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <Calendar className="h-4 w-4" /> attendance
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Target Attendance */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Target Attendance Percentage (%)
                </label>
                <div className="flex gap-4">
                  {[75, 80, 85, 90].map((val) => (
                    <button
                      key={val}
                      onClick={() => setTarget(val)}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl border transition-all ${
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Total Classes Conducted
                  </label>
                  <input
                    type="number"
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold focus-visible:outline-none"
                    placeholder="e.g. 50"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Total Classes Attended
                  </label>
                  <input
                    type="number"
                    value={attendedClasses}
                    onChange={(e) => setAttendedClasses(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold focus-visible:outline-none"
                    placeholder="e.g. 40"
                    min="0"
                  />
                </div>
              </div>

              {/* Informational tips */}
              <div className="flex gap-2.5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-700 dark:text-amber-500 font-semibold leading-relaxed">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Most universities enforce a strict 75% attendance policy. Use this calculator to plan vacations, check bunk buffer, or track recovery timelines before examinations.
                </p>
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="md:col-span-1">
            <div className="bg-card border border-border/85 rounded-3xl p-6 shadow-md space-y-6 sticky top-24 text-center">
              <div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  CURRENT ATTENDANCE
                </span>
                <h2
                  className={`text-5xl font-black mt-2 transition-colors ${
                    total === 0
                      ? "text-muted-foreground"
                      : currentPercentage >= target
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {total > 0 ? `${currentPercentage.toFixed(1)}%` : "—"}
                </h2>
              </div>

              {total > 0 && (
                <div className="border-t border-border/50 pt-5 space-y-4 text-left">
                  <div className="flex gap-2 items-start">
                    {type === "safe" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground">
                        {message}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        {detailMessage}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-bold text-muted-foreground pt-2 border-t border-border/30">
                    <div className="flex justify-between">
                      <span>Total Classes:</span>
                      <span className="text-foreground">{total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Classes Attended:</span>
                      <span className="text-foreground">{attended}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Classes Absent:</span>
                      <span className="text-foreground">{total - attended}</span>
                    </div>
                  </div>
                </div>
              )}

              {total === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Enter conducted classes and attended classes to see your evaluation.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
