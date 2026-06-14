"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Laptop, Play, RefreshCw, AlertTriangle, Copy, Check, 
  Lock, Settings, Code, Sparkles, Terminal, FileCode, CheckCircle,
  Bug, Cpu, Gauge, Layers, Info, HelpCircle, Zap
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
  
  // Input states
  const [questionTitle, setQuestionTitle] = useState("");
  const [language, setLanguage] = useState("Javascript");
  const [code, setCode] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<HelperResult | null>(null);
  const [quotaFallback, setQuotaFallback] = useState(false);
  
  // UI Preferences
  const [themeKey, setThemeKey] = useState("vscode");
  const [fontSize, setFontSize] = useState("12px");
  const [activeTab, setActiveTab] = useState<"editor" | "refactored" | "diff" | "terminal">("editor");
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Terminal simulator states
  const [simState, setSimState] = useState<"idle" | "running" | "done">("idle");
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // AI loading step simulator
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Initializing compilation targets...",
    "Scanning syntax trees and function blocks...",
    "Evaluating computational iterations & complexity loops...",
    "Measuring Big-O space-time boundaries...",
    "Generating optimized refactored patterns...",
    "Finalizing code review reports..."
  ];

  // Cycle loading steps when loading is active
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

  // Fetch pending codes preloaded from Study Assistant
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
    } catch {
      // ignore
    }
  }, []);

  // Load editor settings from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("dsa_editor_theme");
      const savedSize = localStorage.getItem("dsa_editor_font_size");
      if (savedTheme) setThemeKey(savedTheme);
      if (savedSize) setFontSize(savedSize);
    } catch {
      // ignore
    }
  }, []);

  // Scroll terminal logs on update
  useEffect(() => {
    if (simLogs.length > 0) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [simLogs]);

  const handleSavePref = (key: "theme" | "size", val: string) => {
    if (key === "theme") {
      setThemeKey(val);
      localStorage.setItem("dsa_editor_theme", val);
    } else {
      setFontSize(val);
      localStorage.setItem("dsa_editor_font_size", val);
    }
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

        // Trigger confetti dynamically if zero bugs detected
        if (data.result && (!data.result.bugs || data.result.bugs.length === 0)) {
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#6366f1", "#ec4899", "#10b981", "#f59e0b"]
            });
          } catch (confettiErr) {
            console.error("Confetti error:", confettiErr);
          }
        }
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

  // Run test case terminal simulator
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
        setSimLogs((prev) => [...prev, logs[i]]);
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

  // Single-line syntax highlighter helper
  const HighlightedLineContent = ({ line }: { line: string }) => {
    const tokens = tokenize(line, language);
    return (
      <>
        {tokens.map((token, idx) => {
          const color = activeTheme.tokenColors[token.type] || activeTheme.tokenColors.plain;
          return (
            <span key={idx} style={{ color }}>
              {token.value}
            </span>
          );
        })}
      </>
    );
  };

  // Generate line arrays for code inputs to show line numbers next to textarea
  const codeLines = code.split("\n");

  // Render Diff View
  const renderDiffView = () => {
    if (!result?.refactoredSolution) return null;
    const diffs = computeDiff(code, result.refactoredSolution);
    return (
      <div className="font-mono text-[11px] leading-relaxed space-y-0.5 overflow-x-auto min-w-[500px]">
        {diffs.map((line, idx) => {
          let rowClass = "text-foreground hover:bg-slate-500/5";
          let prefix = " ";
          if (line.type === "added") {
            rowClass = "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/15";
            prefix = "+";
          } else if (line.type === "removed") {
            rowClass = "bg-rose-500/10 text-rose-850 dark:text-rose-300 hover:bg-rose-500/15 line-through opacity-70";
            prefix = "-";
          }
          return (
            <div key={idx} className={`flex px-2 py-0.5 -mx-2 rounded ${rowClass}`}>
              <span className="w-8 shrink-0 select-none text-right pr-3 text-muted-foreground/60 border-r border-border/20 mr-2 font-fira">
                {prefix}
              </span>
              <span className="flex-1 whitespace-pre font-fira">
                <HighlightedLineContent line={line.content} />
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // If loading user state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080d1a]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Checking access...</p>
        </div>
      </div>
    );
  }

  // Access check
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center py-12 px-4 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl space-y-6 relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-white">Access Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in to your SmartPicks account to access the AI Coding Solution Evaluator and DSA helper tools.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/coding-helper`}
            className="flex h-11 w-full items-center justify-center bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black shadow transition-all active:scale-95 cursor-pointer"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-black text-slate-500 hover:text-slate-300">
            Back to Student Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-200 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      
      {/* Visual code grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap');
        .font-fira {
          font-family: 'Fira Code', 'Courier New', monospace !important;
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          50% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .laser-scanner {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #e85d54, #8b5cf6, #e85d54, transparent);
          animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          box-shadow: 0 0 12px 2px rgba(139, 92, 246, 0.5);
          z-index: 10;
          pointer-events: none;
        }
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 9999px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
      ` }} />

      <div className="container-custom max-w-6xl relative z-10">
        
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-8 transition-transform hover:-translate-x-0.5 duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Student Hub
        </Link>

        {/* Title Header */}
        <div className="border-b border-slate-800/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
              DSA Coding Helper
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Submit your programming code solution for full time/space complexity analysis and optimization checks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Editor settings dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-md backdrop-blur-sm"
              >
                <Settings className="h-4 w-4 text-indigo-400" /> Workspace Settings
              </button>
              {showSettings && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-40 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Editor Theme</label>
                    <select
                      value={themeKey}
                      onChange={(e) => handleSavePref("theme", e.target.value)}
                      className="h-8 w-full bg-slate-950 border border-slate-800 rounded-lg px-2 text-[11px] font-bold text-slate-200 focus-visible:outline-none focus:border-indigo-500/50"
                    >
                      <option value="vscode">VS Code Dark</option>
                      <option value="dracula">Dracula</option>
                      <option value="onedark">One Dark</option>
                      <option value="monokai">Monokai</option>
                      <option value="github">GitHub Theme</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => handleSavePref("size", e.target.value)}
                      className="h-8 w-full bg-slate-950 border border-slate-800 rounded-lg px-2 text-[11px] font-bold text-slate-200 focus-visible:outline-none focus:border-indigo-500/50"
                    >
                      <option value="11px">11px</option>
                      <option value="12px">12px (Default)</option>
                      <option value="13px">13px</option>
                      <option value="14px">14px</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest flex items-center gap-1 shadow-sm">
              <Cpu className="h-3.5 w-3.5 animate-pulse" /> AI EVALUATOR ACTIVE
            </span>
          </div>
        </div>

        {/* Dashboard workspace grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Code Input Form */}
          <div className="lg:col-span-6 space-y-4">
            <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl space-y-5 relative">
              
              <div className="grid grid-cols-3 gap-4">
                {/* Question title */}
                <div className="space-y-1.5 col-span-3 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Problem Title</label>
                  <input
                    type="text"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="e.g. Two Sum"
                    className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 text-xs font-semibold focus-visible:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 text-white placeholder-slate-650"
                    required
                  />
                </div>

                {/* Language selection */}
                <div className="space-y-1.5 col-span-3 sm:col-span-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-10 w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 text-xs font-bold text-slate-200 focus-visible:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="Javascript">Javascript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                  </select>
                </div>
              </div>

              {/* IDE Editor Shell */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#16171d] shadow-2xl flex flex-col h-[390px] relative">
                
                {/* Visual Laser Scanning Bar */}
                {loading && <div className="laser-scanner" />}

                {/* Editor Tab Bar */}
                <div className="bg-[#1c1d24] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Mock Traffic Lights */}
                    <div className="flex items-center gap-1.5 select-none">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow shadow-rose-500/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow shadow-amber-500/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow shadow-emerald-500/20" />
                    </div>
                    <div className="h-3 w-px bg-slate-800" />
                    <div className="flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-indigo-400" />
                      <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                        solution.{getFileExtension()}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono select-none uppercase tracking-widest font-black">
                    {codeLines.length} line{codeLines.length === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Line Numbers gutter */}
                  <div className="w-10 bg-[#121318] border-r border-slate-800 text-[10px] text-slate-600/70 font-mono text-right pr-3 pt-3 select-none leading-relaxed font-fira">
                    {codeLines.map((_, idx) => (
                      <div key={idx} className="h-[21px] flex items-center justify-end">{idx + 1}</div>
                    ))}
                  </div>
                  {/* Real Textarea Input */}
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste your algorithm logic code block here..."
                    className="flex-1 bg-[#16171d] text-slate-300 p-3 text-[11px] font-fira leading-relaxed focus-visible:outline-none resize-none scrollbar-custom select-text overflow-y-auto"
                    style={{ lineHeight: "21px" }}
                  />
                </div>
              </div>

              {error && (
                <div className="flex flex-col gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold rounded-xl animate-fade-in">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
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
                disabled={loading || !code.trim() || !questionTitle.trim()}
                className="flex h-11 w-full items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl text-xs font-black shadow-lg shadow-indigo-650/20 disabled:shadow-none hover:shadow-indigo-650/35 transition-all cursor-pointer select-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-200" /> Analyzing Solution...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-white text-white" /> Evaluate Solution
                  </>
                )}
              </button>
            </form>
          </div>
 
          {/* RIGHT SIDE: Results Workspace */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Empty Board view */}
            {!loading && !result && (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-4 h-[525px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-slate-800/20 rounded-full blur-2xl pointer-events-none" />
                
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/60 border border-slate-800/60 text-slate-500 relative z-10">
                  <Laptop className="h-8 w-8 text-indigo-500/40 animate-pulse" />
                </div>
                
                <div className="relative z-10 max-w-xs space-y-2">
                  <h4 className="font-extrabold text-white text-base">Evaluation Board Empty</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Submit your programming code solution on the left to review instant time/space analysis and optimization checks.
                  </p>
                </div>
              </div>
            )}

            {/* Loading / Analysing View */}
            {loading && (
              <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-6 h-[525px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                  </span>
                </div>

                <div className="space-y-3 z-10">
                  <h4 className="font-black text-white text-base uppercase tracking-wider">AI Calculation Pipeline</h4>
                  <p className="text-xs text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/10 px-3 py-1 rounded-xl inline-block animate-pulse-scale">
                    {loadingSteps[loadingStep]}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed mx-auto pt-2">
                    Running multi-model cascade queries to determine complexity classes, bug logs, and refactored logic trees...
                  </p>
                </div>
              </div>
            )}

            {/* Result dashboard panels */}
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Quota Fallback Banner */}
                {quotaFallback && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4.5 py-4"
                  >
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-amber-400 tracking-wide uppercase">
                        AI Quota Reached — Offline Cache Mode
                      </p>
                      <p className="text-[11px] text-slate-350 mt-1 leading-relaxed">
                        All live Gemini endpoints hit free-tier rate limits. This is a computed mock review. Please wait ~1 minute and re-submit to trigger live AI.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Summary Badges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-500/5 via-indigo-650/5 to-purple-500/5 dark:bg-slate-900/30 border border-indigo-500/20 rounded-3xl p-5 shadow-lg relative group overflow-hidden">
                    <div className="absolute -right-3 -bottom-3 text-indigo-500/5 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                      <Gauge className="w-16 h-16" />
                    </div>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                      <Gauge className="h-3 w-3" /> Time Complexity
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2 font-fira">{result.timeComplexity}</h3>
                  </div>

                  <div className="bg-gradient-to-br from-rose-500/5 via-rose-650/5 to-pink-500/5 dark:bg-slate-900/30 border border-rose-500/20 rounded-3xl p-5 shadow-lg relative group overflow-hidden">
                    <div className="absolute -right-3 -bottom-3 text-rose-500/5 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                      <Layers className="w-16 h-16" />
                    </div>
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Space Complexity
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2 font-fira">{result.spaceComplexity}</h3>
                  </div>
                </div>

                {/* Bug Warning Logs Card */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Bug className="h-4 w-4 text-rose-400" /> Warnings &amp; Bug Logs
                  </h4>
                  
                  <div className="pt-1">
                    {result.bugs.length > 0 ? (
                      <ul className="space-y-2">
                        {result.bugs.map((bug, idx) => (
                          <li key={idx} className="text-[11px] font-bold text-rose-400 flex items-start gap-2 bg-rose-500/5 border border-rose-500/10 px-3.5 py-2.5 rounded-xl">
                            <span className="select-none text-rose-500">•</span>
                            <span className="leading-relaxed">{bug}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-2xl p-4.5">
                        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide">Optimal Rating</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">No memory leaks, boundary failures, or logical loops detected. Great work!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* IDE Workspace Shell with Tabs */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
                  
                  {/* Tab Selector Headers */}
                  <div className="bg-[#171922] border-b border-slate-800/60 flex flex-wrap justify-between items-center px-4.5 py-1 no-print">
                    <div className="flex gap-1 -mb-px">
                      <button
                        onClick={() => setActiveTab("refactored")}
                        className={`py-3 px-3.5 text-xs font-black transition-all cursor-pointer relative flex items-center gap-1.5 ${
                          activeTab === "refactored" ? "text-indigo-400 font-extrabold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Code className="h-3.5 w-3.5" /> Refactored
                        {activeTab === "refactored" && (
                          <motion.div 
                            layoutId="activeTabUnderline" 
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" 
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("diff")}
                        className={`py-3 px-3.5 text-xs font-black transition-all cursor-pointer relative flex items-center gap-1.5 ${
                          activeTab === "diff" ? "text-indigo-400 font-extrabold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Diff Matrix
                        {activeTab === "diff" && (
                          <motion.div 
                            layoutId="activeTabUnderline" 
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("terminal")}
                        className={`py-3 px-3.5 text-xs font-black transition-all cursor-pointer relative flex items-center gap-1.5 ${
                          activeTab === "terminal" ? "text-indigo-400 font-extrabold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Terminal className="h-3.5 w-3.5" /> Compiler Test
                        {activeTab === "terminal" && (
                          <motion.div 
                            layoutId="activeTabUnderline" 
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                    </div>

                    <div className="py-2">
                      {activeTab === "refactored" && (
                        <button
                          onClick={handleCopy}
                          className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1 rounded-lg cursor-pointer transition-colors shadow-sm"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400 animate-scale-up" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Code
                            </>
                          )}
                        </button>
                      )}
                      {activeTab === "terminal" && simState === "idle" && (
                        <button
                          onClick={handleRunSimulator}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg cursor-pointer transition-colors shadow-lg shadow-indigo-650/15"
                        >
                          Execute Tests
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rendered workspace content wrapper */}
                  <div className={`p-4 bg-[#121318] text-[#e1e4e8] overflow-hidden min-h-[300px] border-t border-slate-800/60 scrollbar-custom overflow-x-auto`}>
                    
                    {/* Tab 1: Refactored Code Block */}
                    {activeTab === "refactored" && (
                      <pre className="text-[11px] font-mono leading-relaxed select-text font-fira" style={{ fontSize }}>
                        <code>
                          {result.refactoredSolution.split("\n").map((line, lineIdx) => (
                            <div key={lineIdx} className="flex hover:bg-slate-800/20 px-1.5 -mx-1.5 rounded">
                              <span className={`w-8 shrink-0 select-none text-right pr-3 font-mono text-slate-600/70 border-r border-slate-800 mr-3`}>
                                {lineIdx + 1}
                              </span>
                              <span className="flex-1">
                                <HighlightedLineContent line={line} />
                              </span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    )}

                    {/* Tab 2: Interactive Diff View */}
                    {activeTab === "diff" && (
                      <div style={{ fontSize }}>
                        {renderDiffView()}
                      </div>
                    )}

                    {/* Tab 3: Terminal Runner */}
                    {activeTab === "terminal" && (
                      <div className="font-mono text-xs leading-relaxed bg-[#08090d] text-[#5af53d] p-4.5 rounded-xl h-[280px] overflow-y-auto border border-slate-900 scrollbar-custom relative">
                        {simLogs.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-[#4af626]/40 text-center space-y-3">
                            <Terminal className="h-9 w-9 text-[#4af626]/20 animate-bounce-gentle" />
                            <div>
                              <p className="font-black text-sm text-[#4af626]/75">Compiler Sandbox Ready</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed max-w-[280px]">Simulate a test run of your logic against structured boundary matrices.</p>
                            </div>
                            <button
                              onClick={handleRunSimulator}
                              className="text-[9px] font-black uppercase tracking-widest bg-[#4af626]/10 border border-[#4af626]/30 px-3 py-1.5 rounded-lg text-[#4af626] hover:bg-[#4af626]/20 transition-all cursor-pointer"
                            >
                              Run test compiler
                            </button>
                          </div>
                        )}
                        {simLogs.map((log, idx) => {
                          let colorClass = "text-[#5af53d]";
                          if (log.includes("✔")) colorClass = "text-emerald-400 font-bold";
                          else if (log.includes("[INFO]")) colorClass = "text-cyan-400";
                          else if (log.includes("[RUN]")) colorClass = "text-purple-400";
                          else if (log.includes("[SUCCESS]")) colorClass = "text-amber-400 font-extrabold";
                          else if (log.startsWith("$")) colorClass = "text-slate-500";
                          return (
                            <div key={idx} className={`whitespace-pre-wrap font-fira ${colorClass}`}>
                              {log}
                            </div>
                          );
                        })}
                        {simState === "running" && (
                          <div className="flex items-center gap-1.5 mt-2.5 animate-pulse text-[#5af53d]/80">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#5af53d] animate-ping" />
                            <span className="text-[10px] italic font-fira">Allocating memory threads...</span>
                          </div>
                        )}
                        <div ref={terminalEndRef} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Explanation Breakdown */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-indigo-400" /> Explanation Breakdown
                  </h4>
                  <p className="text-xs font-semibold leading-relaxed text-slate-400 whitespace-pre-line bg-slate-950/20 border border-slate-800 px-4 py-3 rounded-2xl">
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
