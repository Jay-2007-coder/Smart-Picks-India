"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, RefreshCw, Play, AlertTriangle,
  ChevronDown, Lock, Check, Copy, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  answer: string;
  topic: string;
}

// Maps topic keywords to colour schemes for badges
function getTopicStyle(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes("dsa") || t.includes("algo") || t.includes("data structure")) return "bg-violet-500/10 text-violet-600 border-violet-500/20";
  if (t.includes("system") || t.includes("design")) return "bg-sky-500/10 text-sky-600 border-sky-500/20";
  if (t.includes("oop") || t.includes("object")) return "bg-teal-500/10 text-teal-600 border-teal-500/20";
  if (t.includes("javascript") || t.includes("js") || t.includes("typescript")) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
  if (t.includes("python")) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (t.includes("java")) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
  if (t.includes("database") || t.includes("sql")) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (t.includes("os") || t.includes("operating")) return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  if (t.includes("network") || t.includes("http")) return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
  if (t.includes("behavioral") || t.includes("hr")) return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  return "bg-brand-500/10 text-brand-600 border-brand-500/20";
}

function QuestionCard({ q, idx, openIndex, setOpenIndex }: {
  q: Question; idx: number; openIndex: number | null; setOpenIndex: (i: number | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isOpen = openIndex === idx;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(q.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.35, ease: "easeOut" }}
      className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm"
    >
      {/* Accordion Trigger */}
      <button
        onClick={() => setOpenIndex(isOpen ? null : idx)}
        className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors focus:outline-none"
      >
        <div className="space-y-2 flex-1 min-w-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border ${getTopicStyle(q.topic)}`}>
            {q.topic}
          </span>
          <h4 className="text-sm font-extrabold leading-snug text-foreground">
            <span className="text-muted-foreground font-black mr-1.5">Q{idx + 1}.</span>
            {q.question}
          </h4>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-1 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Animated Content Panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/40 bg-muted/20"
          >
            <div className="px-5 pb-5 pt-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-brand-600" /> Model Answer
                </strong>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[9px] font-black text-muted-foreground hover:text-foreground bg-card border border-border/80 px-2 py-0.5 rounded-lg cursor-pointer transition-all"
                >
                  {copied ? (
                    <><Check className="h-3 w-3 text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy className="h-3 w-3" /> Copy</>
                  )}
                </button>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-muted-foreground whitespace-pre-line">
                {q.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">AI Interview Generator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select your placement targets and generate personalized tech/OOP/DSA query cards with ideal answers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <span className="px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 flex items-center gap-1">
                {questions.length} Questions
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> interview prep
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Form Parameters */}
          <div className="md:col-span-1">
            <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4 sticky top-24">
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
                  <option value="Machine Learning Engineer">ML Engineer</option>
                  <option value="Cloud Engineer">Cloud Engineer</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
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
                  <option value="Mid Level">Mid Level (1–3 yrs)</option>
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
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Play className="h-4 w-4" /> Generate Cards</>
                )}
              </button>

              {questions.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={() => { setQuestions([]); setOpenIndex(null); }}
                  className="flex h-9 w-full items-center justify-center gap-1 border border-border rounded-xl text-[10px] font-black text-muted-foreground hover:bg-muted/55 transition-all cursor-pointer"
                >
                  Clear & Restart
                </button>
              )}
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
                    Select your parameters and click Generate Cards to query Gemini AI for custom interview questions.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="bg-card border border-border/80 rounded-3xl p-5 animate-pulse space-y-3">
                    <div className="h-4 bg-muted w-1/4 rounded-full" />
                    <div className="h-6 bg-muted w-3/4 rounded-lg" />
                    <div className="h-4 bg-muted w-1/2 rounded-lg opacity-50" />
                  </div>
                ))}
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    q={q}
                    idx={idx}
                    openIndex={openIndex}
                    setOpenIndex={setOpenIndex}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
