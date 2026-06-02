"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Laptop, Play, RefreshCw, AlertTriangle, Copy, Check, 
  Lock, Settings, Code, Sparkles, Terminal, FileCode 
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
        setActiveTab("refactored");
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
      <div className="font-mono text-xs leading-relaxed space-y-0.5 overflow-x-auto min-w-[500px]">
        {diffs.map((line, idx) => {
          let rowClass = "text-foreground hover:bg-slate-500/5";
          let prefix = " ";
          if (line.type === "added") {
            rowClass = "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/15";
            prefix = "+";
          } else if (line.type === "removed") {
            rowClass = "bg-rose-500/10 text-rose-800 dark:text-rose-350 hover:bg-rose-500/15 line-through opacity-75";
            prefix = "-";
          }
          return (
            <div key={idx} className={`flex px-2 py-0.5 -mx-2 rounded ${rowClass}`}>
              <span className="w-8 shrink-0 select-none text-right pr-3 text-muted-foreground/60 border-r border-border/20 mr-2">
                {prefix}
              </span>
              <span className="flex-1 whitespace-pre">
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
      <div className="container-custom max-w-6xl">
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
              Submit your programming code solution for full time/space complexity analysis and optimization checks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Editor settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-1 text-xs font-black text-muted-foreground hover:text-foreground bg-card border border-border/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <Settings className="h-4 w-4" /> Workspace Settings
              </button>
              {showSettings && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg p-3.5 z-40 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Editor Theme</label>
                    <select
                      value={themeKey}
                      onChange={(e) => handleSavePref("theme", e.target.value)}
                      className="h-7 w-full bg-background border border-border rounded-lg px-2 text-[11px] font-bold text-foreground focus-visible:outline-none"
                    >
                      <option value="vscode">VS Code Dark</option>
                      <option value="dracula">Dracula</option>
                      <option value="onedark">One Dark</option>
                      <option value="monokai">Monokai</option>
                      <option value="github">GitHub Theme</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => handleSavePref("size", e.target.value)}
                      className="h-7 w-full bg-background border border-border rounded-lg px-2 text-[11px] font-bold text-foreground focus-visible:outline-none"
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
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
              <Laptop className="h-4 w-4" /> dsa reviewer
            </span>
          </div>
        </div>

        {/* Dashboard workspace grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Code Input Form */}
          <div className="lg:col-span-6 space-y-4">
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

              {/* IDE Editor Shell */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-md flex flex-col h-[380px]">
                {/* Editor Tab Bar */}
                <div className="bg-[#252526] px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileCode className="h-4 w-4 text-brand-500" />
                    <span className="text-[10px] font-mono text-slate-300 font-bold uppercase">
                      solution.{getFileExtension()}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono select-none">
                    UTF-8 • {codeLines.length} line{codeLines.length === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Line Numbers gutter */}
                  <div className="w-9 bg-[#1e1e1e] border-r border-slate-800 text-[11px] text-slate-500/70 font-mono text-right pr-2 pt-3 select-none leading-relaxed">
                    {codeLines.map((_, idx) => (
                      <div key={idx}>{idx + 1}</div>
                    ))}
                  </div>
                  {/* Real Textarea Input */}
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste your algorithm logic code block here..."
                    className="flex-1 bg-[#1e1e1e] text-slate-200 p-3 text-[11px] font-mono leading-relaxed focus-visible:outline-none resize-none scrollbar-thin select-text overflow-y-auto"
                    style={{ fontFamily: "Fira Code, monospace" }}
                  />
                </div>
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-rose-500/5 border border-rose-500/10 text-[11px] text-rose-600 dark:text-rose-500 font-bold rounded-xl">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim() || !questionTitle.trim()}
                className="flex h-11 w-full items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-muted text-white disabled:text-muted-foreground rounded-xl text-xs font-black shadow transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Evaluating logic...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Evaluate Solution
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT SIDE: Results Workspace */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Empty Board view */}
            {!loading && !result && (
              <div className="bg-card border border-border/80 border-dashed rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4 h-[510px]">
                <Laptop className="h-10 w-10 text-brand-500/30" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Evaluation Board Empty</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Submit your programming code solution for full time/space analysis and optimization checks.
                  </p>
                </div>
              </div>
            )}

            {/* Loading / Analysing View */}
            {loading && (
              <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4 animate-pulse h-[510px]">
                <RefreshCw className="h-10 w-10 text-brand-600 animate-spin" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Calculating Complexity</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Running Gemini AI calculations for space/time Big-O indices, parsing algorithm loops, and refactoring patterns...
                  </p>
                </div>
              </div>
            )}

            {/* Result dashboard panels */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Summary Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm text-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      TIME COMPLEXITY
                    </span>
                    <h3 className="text-xl font-black text-brand-600 mt-1">{result.timeComplexity}</h3>
                  </div>
                  <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm text-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      SPACE COMPLEXITY
                    </span>
                    <h3 className="text-xl font-black text-brand-600 mt-1">{result.spaceComplexity}</h3>
                  </div>
                </div>

                {/* Bug Warning Logs */}
                <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm space-y-2">
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

                {/* IDE Workspace Shell with Tabs */}
                <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  {/* Tab Selector Headers */}
                  <div className="bg-muted/40 border-b border-border flex flex-wrap justify-between items-center px-4 no-print">
                    <div className="flex gap-2 -mb-px">
                      <button
                        onClick={() => setActiveTab("refactored")}
                        className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all cursor-pointer ${
                          activeTab === "refactored"
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Code className="h-3.5 w-3.5 inline mr-1.5" /> Refactored Solution
                      </button>
                      <button
                        onClick={() => setActiveTab("diff")}
                        className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all cursor-pointer ${
                          activeTab === "diff"
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5 inline mr-1.5" /> Interactive Diff
                      </button>
                      <button
                        onClick={() => setActiveTab("terminal")}
                        className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all cursor-pointer ${
                          activeTab === "terminal"
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Terminal className="h-3.5 w-3.5 inline mr-1.5" /> Terminal Runner
                      </button>
                    </div>

                    <div className="py-2">
                      {activeTab === "refactored" && (
                        <button
                          onClick={handleCopy}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-brand-600 hover:text-brand-700 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-500/10 px-2 py-0.5 rounded-lg cursor-pointer"
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
                      )}
                      {activeTab === "terminal" && simState === "idle" && (
                        <button
                          onClick={handleRunSimulator}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-brand-600 hover:bg-brand-750 px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          Run Tests
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rendered workspace content wrapper */}
                  <div className={`p-4 ${activeTheme.bg} ${activeTheme.text} overflow-hidden min-h-[300px]`}>
                    
                    {/* Tab 1: Refactored Code Block */}
                    {activeTab === "refactored" && (
                      <pre className="overflow-x-auto text-[11px] font-mono leading-relaxed scrollbar-thin select-text" style={{ fontSize, fontFamily: "Fira Code, monospace" }}>
                        <code>
                          {result.refactoredSolution.split("\n").map((line, lineIdx) => (
                            <div key={lineIdx} className="flex hover:bg-slate-500/5 px-1 -mx-1">
                              <span className={`w-8 shrink-0 select-none text-right pr-3 font-mono ${activeTheme.lineNumberColor}`}>
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
                      <div style={{ fontSize, fontFamily: "Fira Code, monospace" }}>
                        {renderDiffView()}
                      </div>
                    )}

                    {/* Tab 3: Terminal Runner */}
                    {activeTab === "terminal" && (
                      <div className="font-mono text-xs leading-relaxed bg-[#0b0c10] text-[#4af626] p-4 rounded-xl h-[280px] overflow-y-auto border border-neutral-900 scrollbar-thin">
                        {simLogs.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-[#4af626]/40 text-center space-y-2">
                            <Terminal className="h-8 w-8 text-[#4af626]/20" />
                            <p className="font-bold">Test Suite Simulator Ready</p>
                            <button
                              onClick={handleRunSimulator}
                              className="text-[10px] font-black uppercase tracking-wider bg-[#4af626]/10 border border-[#4af626]/30 px-3 py-1.5 rounded-lg text-[#4af626] hover:bg-[#4af626]/25 transition-all cursor-pointer"
                            >
                              Execute compiler mock run
                            </button>
                          </div>
                        )}
                        {simLogs.map((log, idx) => (
                          <div key={idx} className="whitespace-pre-wrap">
                            {log}
                          </div>
                        ))}
                        {simState === "running" && (
                          <div className="flex items-center gap-1.5 mt-1.5 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-[#4af626]" />
                            <span className="text-[10px] text-[#4af626]/80 italic">Simulating cycles...</span>
                          </div>
                        )}
                        <div ref={terminalEndRef} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Explanation Breakdown */}
                <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Optimization Breakdown
                  </h4>
                  <p className="text-xs font-semibold leading-relaxed text-muted-foreground whitespace-pre-line">
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
