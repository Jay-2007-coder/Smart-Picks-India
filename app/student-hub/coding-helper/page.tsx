"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Laptop, Play, RefreshCw, AlertTriangle, Copy, Check, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface HelperResult {
  timeComplexity: string;
  spaceComplexity: string;
  bugs: string[];
  refactoredSolution: string;
  explanation: string;
}

export default function CodingHelper() {
  const { user, loading: authLoading } = useAuth();
  const [questionTitle, setQuestionTitle] = useState("");
  const [language, setLanguage] = useState("Javascript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<HelperResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !code.trim()) {
      setError("Please enter the problem title and paste your code.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/v1/student-hub/coding-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, questionTitle, language }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data.result);
      } else {
        setError(data.message || "Failed to analyze code solution. Please try again.");
      }
    } catch (err) {
      setError("An error occurred connecting to the service. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.refactoredSolution) return;
    navigator.clipboard.writeText(result.refactoredSolution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              Please sign in to your SmartPicks account to access the AI Coding Solution Evaluator and DSA helper tools.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/coding-helper`}
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
            <h1 className="text-3xl font-extrabold tracking-tight">DSA Coding Helper</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submit your candidate algorithm solutions to verify time/space complexities and review refactored code blocks.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <Laptop className="h-4 w-4" /> dsa reviewer
          </span>
        </div>

        {/* Grid layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form input details */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Question title */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Problem Title</label>
                  <input
                    type="text"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="e.g. Two Sum"
                    className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                    required
                  />
                </div>

                {/* Language selection */}
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-9 w-full bg-background border border-border rounded-xl px-2.5 text-xs font-bold text-foreground focus-visible:outline-none"
                  >
                    <option value="Javascript">Javascript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                  </select>
                </div>
              </div>

              {/* Code editor block */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Solution Code Block</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your logic algorithm code block here..."
                  rows={12}
                  className="w-full rounded-xl border border-input bg-background p-3.5 text-xs font-mono focus-visible:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-rose-500/5 border border-rose-500/10 text-[11px] text-rose-600 dark:text-rose-500 font-bold rounded-xl">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-muted text-white disabled:text-muted-foreground rounded-xl text-xs font-black shadow transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Reviewing code...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Evaluate Solution
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results feedback */}
          <div className="lg:col-span-6 space-y-6">
            {!loading && !result && (
              <div className="bg-card border border-border/80 border-dashed rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <Laptop className="h-10 w-10 text-brand-500/30" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Evaluation Board Empty</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Submit your programming code solution for full time/space analysis and optimization checks.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4 animate-pulse">
                <RefreshCw className="h-10 w-10 text-brand-600 animate-spin" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Evaluating Complexity</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Running calculations for big O space/time relations, reviewing loops boundary, and refactoring patterns...
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Time & space grids */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm text-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      TIME COMPLEXITY
                    </span>
                    <h3 className="text-2xl font-black text-brand-600 mt-1">{result.timeComplexity}</h3>
                  </div>
                  <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm text-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      SPACE COMPLEXITY
                    </span>
                    <h3 className="text-2xl font-black text-brand-600 mt-1">{result.spaceComplexity}</h3>
                  </div>
                </div>

                {/* Bug logs */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-brand-600" /> Key Warnings &amp; Bug Logs
                  </h4>
                  <ul className="space-y-1.5 pt-1 pl-1">
                    {result.bugs.length > 0 ? (
                      result.bugs.map((bug, idx) => (
                        <li key={idx} className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                          <span>•</span>
                          <span className="leading-relaxed">{bug}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs font-bold text-emerald-600 dark:text-emerald-500">
                        Excellent! No major bugs or logic flaws detected.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Refactored Code Solution */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Refactored Optimization
                    </h4>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[10px] font-black text-brand-600 hover:text-brand-700 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-500/10 px-2 py-0.5 rounded-lg"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs text-foreground font-mono bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                    {result.refactoredSolution}
                  </pre>
                </div>

                {/* Explanation */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Optimization Breakdown
                  </h4>
                  <p className="text-xs font-semibold leading-relaxed text-muted-foreground whitespace-pre-line">
                    {result.explanation}
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
