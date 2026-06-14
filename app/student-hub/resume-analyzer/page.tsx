"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, AlertTriangle, Play, RefreshCw, Key, HelpCircle, Lock, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

interface BulletImprovement {
  original: string;
  improved: string;
}

interface AnalyzerResult {
  matchScore: number;
  missingKeywords: string[];
  bulletImprovements: BulletImprovement[];
  overallFeedback: string;
}

export default function ResumeAnalyzer() {
  const { user, loading: authLoading } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzerResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please fill out both the resume content and job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/v1/student-hub/resume-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data.result);
      } else {
        setError(data.message || "Failed to analyze resume. Please try again.");
      }
    } catch (err) {
      setError("An error occurred connecting to the service. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  // If loading user state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Checking access...</p>
        </div>
      </div>
    );
  }

  // Access check
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight">Access Restricted</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please sign in to your SmartPicks account to access the AI Resume Matcher and placement tools.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/resume-analyzer`}
            className="flex h-11 w-full items-center justify-center bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow transition-all active:scale-95 cursor-pointer"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-black text-muted-foreground hover:text-foreground">
            Back to Student Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-5xl">
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
            <h1 className="text-3xl font-extrabold tracking-tight">AI Resume Analyzer</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compare your current resume details with a target Job Description to review matching scores and ATS guidelines.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> resume grader
          </span>
        </div>

        {/* Dashboard grid layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Input column */}
          <form onSubmit={handleAnalyze} className="lg:col-span-6 space-y-6">
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-5">
              {/* Resume Text */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Paste Resume Content (Plain Text)
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your education, skills, work history, and projects text here..."
                  rows={8}
                  className="w-full rounded-2xl border border-input bg-background p-3 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Job Description Text */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Target Job Description (JD)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job post requirements, skills, and qualifications here..."
                  rows={8}
                  className="w-full rounded-2xl border border-input bg-background p-3 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {error && (
                <div className="flex flex-col gap-2.5 p-3.5 bg-rose-500/5 border border-rose-500/10 text-xs text-rose-600 dark:text-rose-500 font-bold rounded-xl">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  {error.includes("limit of 3 AI assistance runs") && (
                    <Link href="/student-hub/upgrade" className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[9px] uppercase tracking-wider font-black transition-colors self-start shadow-sm shadow-rose-500/10">
                      <Zap className="h-3 w-3 fill-current text-white animate-pulse" /> Upgrade to Pro
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-muted text-white disabled:text-muted-foreground rounded-xl text-xs font-black shadow transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Run ATS Grader
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results column */}
          <div className="lg:col-span-6 space-y-6">
            {!result && !loading && (
              <div className="bg-card border border-border/80 border-dashed rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <Sparkles className="h-10 w-10 text-brand-500/30" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Ready for Analysis</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Fill out your resume profile text and target JD coordinates to calculate matching values.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4 animate-pulse">
                <RefreshCw className="h-10 w-10 text-brand-600 animate-spin" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Processing Content</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Sending details to Gemini AI. Testing keywords, sentence metrics, and layout structures...
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Score panel with animated SVG ring */}
                {(() => {
                  const radius = 54;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference - (result.matchScore / 100) * circumference;
                  const scoreColor =
                    result.matchScore >= 80
                      ? "stroke-emerald-500"
                      : result.matchScore >= 55
                      ? "stroke-amber-500"
                      : "stroke-rose-500";
                  const scoreLabel =
                    result.matchScore >= 80 ? "Strong Match" : result.matchScore >= 55 ? "Moderate Match" : "Weak Match";
                  const labelColor =
                    result.matchScore >= 80
                      ? "text-emerald-600"
                      : result.matchScore >= 55
                      ? "text-amber-600"
                      : "text-rose-600";
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-card border border-border/80 rounded-3xl p-6 shadow-md text-center flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="relative flex items-center justify-center h-32 w-32">
                        <svg className="h-full w-full -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            className="stroke-slate-200 dark:stroke-slate-800"
                            strokeWidth="9"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r={radius}
                            className={scoreColor}
                            strokeWidth="9"
                            fill="transparent"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-foreground">{result.matchScore}%</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider ${labelColor}`}>{scoreLabel}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm">ATS Compatibility Score</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs leading-relaxed mx-auto">
                          Based on keyword compliance, experience alignments, and technical requirements.
                        </p>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* Missing Keywords badging */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-brand-600" /> Missing Target Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.missingKeywords.length > 0 ? (
                      result.missingKeywords.map((word, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/10"
                        >
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">
                        Excellent! No major missing keywords identified.
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Sentence Improvements */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-brand-600" /> Bullet Point Improvements
                  </h4>
                  <div className="space-y-4">
                    {result.bulletImprovements.map((bullet, idx) => (
                      <div key={idx} className="text-xs space-y-2 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-border/30">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Original</p>
                          <p className="text-muted-foreground italic font-semibold leading-relaxed">
                            &quot;{bullet.original}&quot;
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-brand-500/5 border border-brand-500/15">
                          <p className="text-[10px] font-black uppercase text-brand-600 mb-1">AI Optimized</p>
                          <p className="text-foreground font-bold leading-relaxed">
                            &quot;{bullet.improved}&quot;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall feedback */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-brand-600" /> ATS Recruiter Feedback
                  </h4>
                  <p className="text-xs leading-relaxed font-semibold text-muted-foreground whitespace-pre-line pt-1">
                    {result.overallFeedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
