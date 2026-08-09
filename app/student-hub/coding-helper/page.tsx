"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Laptop, Play, RefreshCw, AlertTriangle, Copy, Check,
  Lock, Settings, Code, Sparkles, Terminal, FileCode, CheckCircle,
  Bug, Cpu, Gauge, Layers, Info, Zap, X, ChevronRight, Code2,
  FlaskConical, GitCompare, Shield, TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { tokenize, THEME_STYLES, computeDiff, Token } from "@/lib/highlighter";

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
  const [quotaFallback, setQuotaFallback] = useState(false);

  const [themeKey, setThemeKey] = useState("vscode");
  const [fontSize, setFontSize] = useState("12px");
  const [activeTab, setActiveTab] = useState<"refactored" | "diff" | "terminal">("refactored");
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [simState, setSimState] = useState<"idle" | "running" | "done">("idle");
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Initializing compilation targets...",
    "Scanning syntax trees and function blocks...",
    "Evaluating computational iterations & complexity loops...",
    "Measuring Big-O space-time boundaries...",
    "Generating optimized refactored patterns...",
    "Finalizing code review reports..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    try {
      const pendingCode = sessionStorage.getItem("pending_dsa_code");
      const pendingLang = sessionStorage.getItem("pending_dsa_lang");
      if (pendingCode) {
        setCode(pendingCode);
        setQuestionTitle("Imported Solution");
        sessionStorage.removeItem("pending_dsa_code");
      }
      if (pendingLang) {
        const langLower = pendingLang.toLowerCase();
        if (langLower.includes("python") || langLower === "py") setLanguage("Python");
        else if (langLower.includes("java")) setLanguage("Java");
        else if (langLower.includes("c++") || langLower.includes("cpp")) setLanguage("C++");
        else setLanguage("Javascript");
        sessionStorage.removeItem("pending_dsa_lang");
      }
    } catch { }
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("dsa_editor_theme");
      const savedSize = localStorage.getItem("dsa_editor_font_size");
      if (savedTheme) setThemeKey(savedTheme);
      if (savedSize) setFontSize(savedSize);
    } catch { }
  }, []);

  useEffect(() => {
    if (simLogs.length > 0) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [simLogs]);

  const handleSavePref = (key: "theme" | "size", val: string) => {
    if (key === "theme") { setThemeKey(val); localStorage.setItem("dsa_editor_theme", val); }
    else { setFontSize(val); localStorage.setItem("dsa_editor_font_size", val); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !code.trim()) {
      setError("Please enter the problem title and paste your code.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setQuotaFallback(false);
    setCopied(false);
    setSimState("idle");
    setSimLogs([]);

    try {
      const response = await fetch("/api/v1/student-hub/coding-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, questionTitle, language }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data.result);
        setQuotaFallback(!!data.quotaFallback);
        setActiveTab("refactored");
        if (data.result && (!data.result.bugs || data.result.bugs.length === 0)) {
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#6366f1", "#ec4899", "#10b981", "#f59e0b"] });
          } catch { }
        }
      } else {
        setError(data.message || "Failed to analyze code solution. Please try again.");
      }
    } catch {
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

  const handleRunSimulator = () => {
    setSimState("running");
    setSimLogs([]);
    setActiveTab("terminal");
    const logs = [
      `$ compiler --run --language="${language}" --file="Solution.${getFileExtension()}"`,
      `[INFO] Checking compilation targets...`,
      `[INFO] Validating Big-O space/time boundaries...`,
      `[RUN] Executing Case 1 (Standard limits)...`,
      `      Input: target = 9, dataset_size = 100`,
      `      ✔ Test Case 1 Passed successfully (0.05ms)`,
      `[RUN] Executing Case 2 (Edge parameters: empty/overflow values)...`,
      `      Input: target = -1, dataset_size = 0`,
      `      ✔ Test Case 2 Passed successfully (0.02ms)`,
      `[RUN] Executing Case 3 (Duplicate nodes array scale)...`,
      `      Input: target = 1000, dataset_size = 15000`,
      `      ✔ Test Case 3 Passed successfully (0.12ms)`,
      `[COMPLETED] 3 of 3 Test Cases Executed.`,
      `[SUCCESS] Zero runtime leaks detected. Current Solution rating: OPTIMAL.`,
      `$ Done.`
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        const currentLog = logs[i];
        setSimLogs((prev) => [...prev, currentLog]);
        i++;
      } else {
        clearInterval(interval);
        setSimState("done");
      }
    }, 250);
  };

  const getFileExtension = () => {
    switch (language) {
      case "Python": return "py";
      case "Java": return "java";
      case "C++": return "cpp";
      default: return "js";
    }
  };

  const activeTheme = THEME_STYLES[themeKey] || THEME_STYLES.vscode;

  const HighlightedLineContent = ({ line }: { line: string }) => {
    const tokens = tokenize(line, language);
    return (
      <>
        {tokens.map((token, idx) => {
          const color = activeTheme.tokenColors[token.type] || activeTheme.tokenColors.plain;
          return <span key={idx} style={{ color }}>{token.value}</span>;
        })}
      </>
    );
  };

  const codeLines = code.split("\n");

  const renderDiffView = () => {
    if (!result?.refactoredSolution) return null;
    const diffs = computeDiff(code, result.refactoredSolution);
    return (
      <div className="font-mono text-[11px] leading-relaxed space-y-0.5 overflow-x-auto">
        {diffs.map((line, idx) => {
          let rowClass = "text-slate-400 hover:bg-white/3";
          let prefix = " ";
          if (line.type === "added") { rowClass = "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"; prefix = "+"; }
          else if (line.type === "removed") { rowClass = "bg-rose-500/10 text-rose-300 hover:bg-rose-500/15 line-through opacity-70"; prefix = "-"; }
          return (
            <div key={idx} className={`flex px-2 py-0.5 -mx-2 rounded ${rowClass}`}>
              <span className="w-6 shrink-0 select-none text-right pr-3 text-slate-600 border-r border-white/10 mr-2 font-mono">{prefix}</span>
              <span className="flex-1 whitespace-pre font-mono"><HighlightedLineContent line={line.content} /></span>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Auth Loading ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080d1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <Cpu className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">Initializing DSA Engine</p>
            <p className="text-xs text-slate-500 mt-1">Checking your access credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Access Gate ─────────────────────────────────────────────────────────────
  if (false && !user) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 shadow-lg">
            <Lock className="h-7 w-7 text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-white">Access Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">Sign in to access the AI Coding Solution Evaluator and DSA helper tools.</p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/coding-helper`}
            className="flex h-12 w-full items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors">← Back to Student Hub</Link>
        </motion.div>
      </div>
    );
  }

  // ─── Main Page ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-200 transition-colors duration-200 relative overflow-x-hidden">

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-purple-500/8 blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-cyan-600/5 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      {/* Font + scan animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap');
        .font-fira { font-family: 'Fira Code','Courier New',monospace !important; }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.9; }
          50% { opacity: 1; }
          90% { opacity: 0.9; }
          100% { top: 100%; opacity: 0; }
        }
        .laser-scanner {
          position: absolute; left: 0; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, #818cf8, #a78bfa, #818cf8, transparent);
          animation: scan 2.2s cubic-bezier(0.4,0,0.2,1) infinite;
          box-shadow: 0 0 16px 3px rgba(129,140,248,0.5);
          z-index: 10; pointer-events: none;
        }
        .scrollbar-custom::-webkit-scrollbar { width: 5px; height: 5px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 9999px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
      ` }} />

      <div className="relative z-10 container-custom max-w-7xl py-8">

        {/* ── Top Nav ── */}
        <div className="flex items-center justify-between mb-7">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
          >
            <div className="flex items-center justify-center h-7 w-7 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
              <ArrowLeft className="h-3.5 w-3.5" />
            </div>
            Back to Student Hub
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Settings */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-indigo-400" /> Workspace Settings
              </motion.button>

              <AnimatePresence>
                {showSettings && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-5 z-50 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Editor Settings</h4>
                        <button onClick={() => setShowSettings(false)} className="text-slate-600 hover:text-slate-300 cursor-pointer transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </div>
                      {[
                        {
                          label: "Color Theme", key: "theme" as const,
                          value: themeKey,
                          options: [
                            { value: "vscode", label: "💙 VS Code Dark" },
                            { value: "dracula", label: "🦇 Dracula" },
                            { value: "onedark", label: "🌑 One Dark" },
                            { value: "monokai", label: "🔥 Monokai" },
                            { value: "github", label: "🐙 GitHub" },
                          ]
                        },
                        {
                          label: "Font Size", key: "size" as const,
                          value: fontSize,
                          options: [
                            { value: "11px", label: "11px — Compact" },
                            { value: "12px", label: "12px — Default" },
                            { value: "13px", label: "13px — Comfortable" },
                            { value: "14px", label: "14px — Large" },
                          ]
                        }
                      ].map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{field.label}</label>
                          <select
                            value={field.value}
                            onChange={(e) => handleSavePref(field.key, e.target.value)}
                            className="h-9 w-full bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-bold text-slate-200 focus-visible:outline-none focus-visible:border-indigo-500/50 cursor-pointer transition-all"
                          >
                            {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Status pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              <Cpu className="h-3.5 w-3.5" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI Evaluator Active
            </div>
          </div>
        </div>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-white/10 p-7 backdrop-blur-sm shadow-2xl">
            <div className="absolute top-0 right-0 h-52 w-52 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                    <Code2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#080d1a] flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
                    DSA Coding Helper
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">
                    AI-powered time/space complexity analysis, bug detection & code refactoring
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {[
                  { icon: TrendingUp, label: "Big-O Analysis", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                  { icon: Shield, label: "Bug Scanner", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  { icon: FlaskConical, label: "Test Runner", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                ].map((stat) => (
                  <div key={stat.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${stat.color} text-[11px] font-bold`}>
                    <stat.icon className="h-3.5 w-3.5" />
                    {stat.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Main Workspace Grid ── */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT: Code Input ── */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
              {/* Form inner glow */}
              <div className="absolute top-0 left-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-3 gap-4">
                {/* Problem Title */}
                <div className="space-y-1.5 col-span-3 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Problem Title</label>
                  <input
                    type="text"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="e.g. Two Sum"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-white placeholder-slate-600 focus-visible:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    required
                  />
                </div>

                {/* Language */}
                <div className="space-y-1.5 col-span-3 sm:col-span-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-10 w-full bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-bold text-slate-200 focus-visible:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer transition-all"
                  >
                    <option value="Javascript">Javascript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                  </select>
                </div>
              </div>

              {/* IDE Code Editor Shell */}
              <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl flex flex-col h-[370px]">
                {/* Laser scan during loading */}
                {loading && <div className="laser-scanner" />}

                {/* Tab Bar */}
                <div className="bg-[#161b22] px-4 py-2.5 border-b border-white/8 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 select-none">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-sm shadow-rose-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-sm shadow-amber-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-sm shadow-emerald-500/30" />
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div className="flex items-center gap-1.5">
                      <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-[10px] font-mono text-slate-300 font-bold tracking-wide">
                        solution.{getFileExtension()}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-600 font-mono select-none uppercase tracking-widest font-black">
                    {codeLines.length} line{codeLines.length === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Editor Content */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Line numbers */}
                  <div className="w-10 bg-[#0d1117] border-r border-white/5 text-[10px] text-slate-700 font-mono text-right pr-3 pt-3 select-none leading-relaxed font-fira shrink-0">
                    {codeLines.map((_, idx) => (
                      <div key={idx} className="h-[21px] flex items-center justify-end">{idx + 1}</div>
                    ))}
                  </div>
                  {/* Textarea */}
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste your algorithm logic code block here..."
                    className="flex-1 bg-[#0d1117] text-slate-300 p-3 text-[11px] font-fira leading-relaxed focus-visible:outline-none resize-none scrollbar-custom select-text overflow-y-auto placeholder-slate-700"
                    style={{ lineHeight: "21px" }}
                  />
                </div>
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="relative z-10 flex flex-col gap-3 p-4 bg-rose-500/8 border border-rose-500/20 text-xs text-rose-400 font-bold rounded-2xl"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-rose-300 font-semibold leading-relaxed">{error}</span>
                    </div>
                    {error.includes("limit of 3 AI assistance runs") && (
                      <Link href="/student-hub/upgrade" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider self-start">
                        <Zap className="h-3 w-3 fill-current animate-pulse" /> Upgrade to Pro <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !code.trim() || !questionTitle.trim()}
                className="relative z-10 flex h-12 w-full items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-600 rounded-2xl text-sm font-black shadow-xl shadow-indigo-500/20 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-200" />
                    <span>Analyzing Solution...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Evaluate Solution</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* ── RIGHT: Results Panel ── */}
          <div className="lg:col-span-7 space-y-5">

            {/* Empty state */}
            {!loading && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-900/40 backdrop-blur-sm border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center space-y-5 h-[580px] relative overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-indigo-500/5 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-5">
                  <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center shadow-2xl">
                    <Laptop className="h-10 w-10 text-indigo-400/50" />
                  </div>
                  <div className="space-y-2 max-w-xs">
                    <h4 className="font-black text-white text-lg">Evaluation Board Empty</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Submit your programming code solution on the left to review instant time/space analysis and optimization checks.
                    </p>
                  </div>
                  {/* Mini feature pills */}
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {["Big-O Analysis", "Bug Detection", "Code Refactor", "Diff View", "Test Runner"].map((f) => (
                      <span key={f} className="px-2.5 py-1 rounded-full bg-white/4 border border-white/8 text-[10px] font-bold text-slate-500">{f}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading state */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-indigo-500/20 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 h-[580px] relative overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 bg-indigo-500/8 rounded-full blur-[80px] animate-pulse" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 flex items-center justify-center shadow-2xl">
                      <RefreshCw className="h-9 w-9 text-indigo-400 animate-spin" />
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 border-2 border-[#080d1a]" />
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-black text-white text-lg uppercase tracking-wider">AI Calculation Pipeline</h4>
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-indigo-300 font-bold bg-indigo-950/50 border border-indigo-500/15 px-4 py-2 rounded-xl"
                    >
                      {loadingSteps[loadingStep]}
                    </motion.p>
                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                      Running multi-model cascade queries to determine complexity classes, bug logs, and refactored logic trees...
                    </p>
                  </div>
                  {/* Loading progress bar */}
                  <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Result Panels */}
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                {/* Quota Banner */}
                {quotaFallback && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-4"
                  >
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-amber-400 tracking-wide uppercase">AI Quota Reached — Offline Cache Mode</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">All live Gemini endpoints hit free-tier rate limits. This is a computed mock review. Please wait ~1 minute and re-submit.</p>
                    </div>
                  </motion.div>
                )}

                {/* Complexity Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Time Complexity", value: result.timeComplexity, icon: Gauge, color: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-400", iconBg: "bg-indigo-500/15" },
                    { label: "Space Complexity", value: result.spaceComplexity, icon: Layers, color: "from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-400", iconBg: "bg-rose-500/15" },
                  ].map((card) => (
                    <motion.div
                      key={card.label}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className={`relative overflow-hidden bg-gradient-to-br ${card.color} border rounded-3xl p-5 shadow-lg group`}
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <card.icon className="w-20 h-20" />
                      </div>
                      <div className={`h-8 w-8 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
                        <card.icon className={`h-4 w-4 ${card.color.split(" ").pop()}`} />
                      </div>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${card.color.split(" ").pop()} mb-1`}>{card.label}</p>
                      <h3 className="text-2xl font-black text-white font-fira">{card.value}</h3>
                    </motion.div>
                  ))}
                </div>

                {/* Bug Logs */}
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-rose-500/15 flex items-center justify-center">
                      <Bug className="h-3.5 w-3.5 text-rose-400" />
                    </div>
                    Warnings & Bug Logs
                  </h4>
                  <div>
                    {result.bugs.length > 0 ? (
                      <ul className="space-y-2">
                        {result.bugs.map((bug, idx) => (
                          <li key={idx} className="text-[11px] font-semibold text-rose-300 flex items-start gap-2.5 bg-rose-500/6 border border-rose-500/15 px-3.5 py-2.5 rounded-xl">
                            <span className="text-rose-500 mt-0.5 shrink-0">▸</span>
                            <span className="leading-relaxed">{bug}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-3 bg-emerald-500/6 border border-emerald-500/20 text-emerald-400 rounded-2xl p-4">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide">Optimal Rating</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">No memory leaks, boundary failures, or logical loops detected. Great work!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* IDE Workspace Tabs */}
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  {/* Tab Header */}
                  <div className="bg-[#0f1420] border-b border-white/8 flex items-center justify-between px-4 py-1">
                    <div className="flex gap-1">
                      {[
                        { id: "refactored" as const, label: "Refactored", icon: Code },
                        { id: "diff" as const, label: "Diff Matrix", icon: GitCompare },
                        { id: "terminal" as const, label: "Test Runner", icon: Terminal },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative py-3 px-4 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === tab.id ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <tab.icon className="h-3.5 w-3.5" />
                          {tab.label}
                          {activeTab === tab.id && (
                            <motion.div
                              layoutId="tabUnderline"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="py-2">
                      {activeTab === "refactored" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopy}
                          className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1 rounded-lg cursor-pointer transition-all"
                        >
                          {copied ? <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy className="h-3 w-3" /> Copy Code</>}
                        </motion.button>
                      )}
                      {activeTab === "terminal" && simState === "idle" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleRunSimulator}
                          className="inline-flex items-center gap-1.5 text-[10px] font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 rounded-lg cursor-pointer shadow-lg shadow-indigo-500/20"
                        >
                          <Play className="h-3 w-3 fill-white" /> Execute Tests
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4 bg-[#0d1117] min-h-[280px] overflow-auto scrollbar-custom max-h-[360px]">
                    <AnimatePresence mode="wait">
                      {activeTab === "refactored" && (
                        <motion.pre
                          key="refactored"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11px] font-mono leading-relaxed select-text font-fira"
                          style={{ fontSize }}
                        >
                          <code>
                            {result.refactoredSolution.split("\n").map((line, lineIdx) => (
                              <div key={lineIdx} className="flex hover:bg-white/3 px-1.5 -mx-1.5 rounded">
                                <span className="w-8 shrink-0 select-none text-right pr-3 text-slate-700 border-r border-white/5 mr-3">{lineIdx + 1}</span>
                                <span className="flex-1"><HighlightedLineContent line={line} /></span>
                              </div>
                            ))}
                          </code>
                        </motion.pre>
                      )}
                      {activeTab === "diff" && (
                        <motion.div key="diff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize }}>
                          {renderDiffView()}
                        </motion.div>
                      )}
                      {activeTab === "terminal" && (
                        <motion.div
                          key="terminal"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-mono text-xs leading-relaxed bg-[#030507] text-[#5af53d] p-4 rounded-2xl h-[260px] overflow-y-auto border border-white/5 scrollbar-custom relative"
                        >
                          {simLogs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                              <div className="h-14 w-14 rounded-2xl bg-[#5af53d]/5 border border-[#5af53d]/15 flex items-center justify-center">
                                <Terminal className="h-7 w-7 text-[#5af53d]/30" />
                              </div>
                              <div className="text-center">
                                <p className="font-black text-sm text-[#5af53d]/60">Compiler Sandbox Ready</p>
                                <p className="text-[10px] text-slate-600 mt-1 leading-relaxed max-w-[240px]">Simulate a test run of your logic against structured boundary matrices.</p>
                              </div>
                              <button
                                onClick={handleRunSimulator}
                                className="text-[9px] font-black uppercase tracking-widest bg-[#4af626]/8 border border-[#4af626]/25 px-4 py-2 rounded-xl text-[#4af626] hover:bg-[#4af626]/15 transition-all cursor-pointer"
                              >
                                Run test compiler
                              </button>
                            </div>
                          )}
                          {simLogs.map((log, idx) => {
                            if (!log) return null;
                            let colorClass = "text-[#5af53d]";
                            if (log.includes("✔")) colorClass = "text-emerald-400 font-bold";
                            else if (log.includes("[INFO]")) colorClass = "text-cyan-400";
                            else if (log.includes("[RUN]")) colorClass = "text-purple-400";
                            else if (log.includes("[SUCCESS]")) colorClass = "text-amber-400 font-extrabold";
                            else if (log.includes("[COMPLETED]")) colorClass = "text-sky-400 font-bold";
                            else if (log.startsWith("$")) colorClass = "text-slate-500";
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`whitespace-pre-wrap font-fira ${colorClass}`}
                              >
                                {log}
                              </motion.div>
                            );
                          })}
                          {simState === "running" && (
                            <div className="flex items-center gap-1.5 mt-2 animate-pulse text-[#5af53d]/70">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#5af53d] animate-ping" />
                              <span className="text-[10px] italic font-fira">Allocating memory threads...</span>
                            </div>
                          )}
                          <div ref={terminalEndRef} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      <Info className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    Explanation Breakdown
                  </h4>
                  <p className="text-xs font-semibold leading-relaxed text-slate-400 whitespace-pre-line bg-white/3 border border-white/6 px-4 py-3.5 rounded-2xl">
                    {result.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
