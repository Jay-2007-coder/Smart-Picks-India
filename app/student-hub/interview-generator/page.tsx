"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, RefreshCw, Play, AlertTriangle, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Question {
  question: string;
  answer: string;
  topic: string;
}

export default function InterviewGenerator() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState("Frontend Engineer");
  const [level, setLevel] = useState("Entry Level");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please specify a target job role.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setOpenIndex(null);

    try {
      const response = await fetch("/api/v1/student-hub/interview-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level, company }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setQuestions(data.questions);
      } else {
        setError(data.message || "Failed to generate interview questions. Please try again.");
      }
    } catch (err) {
      setError("An error occurred connecting to the service. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
              Please sign in to your SmartPicks account to access the AI Interview prep boards and resources.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/interview-generator`}
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
            <h1 className="text-3xl font-extrabold tracking-tight">AI Interview Generator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select your placement targets and generate personalized tech/OOP/DSA query cards with ideal answers.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> interview prep
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Form Parameters */}
          <div className="md:col-span-1">
            <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
              {/* Role Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Target Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-9 w-full bg-background border border-border rounded-xl px-2.5 text-xs font-bold text-foreground focus-visible:outline-none"
                >
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Mobile App Developer">Mobile App Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>

              {/* Experience level */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Experience Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="h-9 w-full bg-background border border-border rounded-xl px-2.5 text-xs font-bold text-foreground focus-visible:outline-none"
                >
                  <option value="Entry Level">Entry Level / College Graduate</option>
                  <option value="Mid Level">Mid Level (1-3 yrs)</option>
                  <option value="Senior Level">Senior Level (3+ yrs)</option>
                </select>
              </div>

              {/* Company target */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Company Name (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Amazon, Google, TCS"
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
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
                className="flex h-10 w-full items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-muted text-white disabled:text-muted-foreground rounded-xl text-xs font-black shadow transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Generate Cards
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results grid */}
          <div className="md:col-span-2 space-y-4">
            {!loading && questions.length === 0 && (
              <div className="bg-card border border-border/80 border-dashed rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <MessageSquare className="h-10 w-10 text-brand-500/30" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Question Board Empty</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Select your parameters and click Generate Cards to query Gemini AI.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="bg-card border border-border/80 rounded-3xl p-5 animate-pulse space-y-3">
                    <div className="h-4 bg-muted w-1/3 rounded-lg" />
                    <div className="h-6 bg-muted w-3/4 rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-card border border-border/80 rounded-3xl overflow-hidden transition-all shadow-sm"
                    >
                      {/* Trigger bar */}
                      <button
                        onClick={() => toggleAccordion(idx)}
                        className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-foreground focus:outline-none"
                      >
                        <div className="space-y-1.5">
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-600 bg-brand-50/50 dark:bg-brand-950/20 rounded-md border border-brand-500/10">
                            {q.topic}
                          </span>
                          <h4 className="text-sm font-extrabold leading-snug">{q.question}</h4>
                        </div>
                        {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                      </button>

                      {/* Content panel */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-border/40 bg-muted/20 text-xs font-semibold leading-relaxed text-muted-foreground whitespace-pre-line">
                          <strong className="text-foreground font-black block mb-1">Model Answer:</strong>
                          {q.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
