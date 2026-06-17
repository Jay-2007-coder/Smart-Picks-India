"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Sparkles, Send, RefreshCw, User, Bot, AlertTriangle,
  Lock, Check, Copy, Settings, Laptop, Zap, Brain, Code2, Database,
  Network, ChevronRight, X, Cpu, BookOpen, Lightbulb, GraduationCap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { tokenize, THEME_STYLES, Token } from "@/lib/highlighter";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface CodeBlockProps {
  language: string;
  value: string;
  themeKey: string;
  fontSize: string;
  fontFamily: string;
}

function CodeBlock({ language, value, themeKey, fontSize, fontFamily }: CodeBlockProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToDsa = () => {
    try {
      sessionStorage.setItem("pending_dsa_code", value);
      sessionStorage.setItem("pending_dsa_lang", language);
      router.push("/student-hub/coding-helper");
    } catch {
      // ignore
    }
  };

  const activeTheme = THEME_STYLES[themeKey] || THEME_STYLES.dracula;
  const tokens = tokenize(value, language);

  const lines: Token[][] = [[]];
  let currentLineIdx = 0;

  tokens.forEach((token) => {
    if (token.value.includes("\n")) {
      const parts = token.value.split("\n");
      parts.forEach((part, partIdx) => {
        if (part) {
          lines[currentLineIdx].push({ type: token.type, value: part });
        }
        if (partIdx < parts.length - 1) {
          lines.push([]);
          currentLineIdx++;
        }
      });
    } else {
      lines[currentLineIdx].push(token);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl overflow-hidden border ${activeTheme.border} ${activeTheme.bg} ${activeTheme.text} my-4 shadow-2xl text-left no-print max-w-full`}
    >
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${activeTheme.border} ${activeTheme.headerBg}`}>
        <div className="flex items-center gap-2.5">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {language || "code"}
          </span>
          <span className="text-[9px] text-slate-600 font-mono">
            {lines.length} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendToDsa}
            className="flex items-center gap-1.5 text-[10px] font-black text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-violet-500/20"
            title="Analyze in DSA Coding Helper"
          >
            <Laptop className="h-3 w-3" /> Analyze DSA
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Code Area */}
      <pre
        className="p-4 overflow-x-auto leading-relaxed scrollbar-thin overflow-y-hidden"
        style={{ fontSize, fontFamily }}
      >
        <code className="block select-text">
          {lines.map((lineTokens, lineIdx) => (
            <div key={lineIdx} className="flex hover:bg-white/3 px-1 -mx-1 rounded">
              <span className={`w-8 shrink-0 select-none text-right pr-3 font-mono ${activeTheme.lineNumberColor}`}>
                {lineIdx + 1}
              </span>
              <span className="flex-1">
                {lineTokens.length === 0 ? (
                  <span className="inline-block">&nbsp;</span>
                ) : (
                  lineTokens.map((token, tokenIdx) => {
                    const color = activeTheme.tokenColors[token.type] || activeTheme.tokenColors.plain;
                    return (
                      <span key={tokenIdx} style={{ color }}>
                        {token.value}
                      </span>
                    );
                  })
                )}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </motion.div>
  );
}

const PRESETS = [
  { text: "Explain Quicksort time complexity step-by-step", icon: Cpu, color: "from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-400" },
  { text: "How do Closures work in JavaScript?", icon: Code2, color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400" },
  { text: "What are the ACID properties in databases?", icon: Database, color: "from-cyan-500/10 to-teal-500/10 border-cyan-500/20 text-cyan-400" },
  { text: "Explain the difference between TCP and UDP", icon: Network, color: "from-emerald-500/10 to-green-500/10 border-emerald-500/20 text-emerald-400" },
  { text: "Explain Big O notation with examples", icon: Brain, color: "from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-400" },
  { text: "What is the difference between Stack and Queue?", icon: BookOpen, color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400" },
];

// Typing indicator dots
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-brand-400"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function formatTime(date?: Date) {
  if (!date) return "";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function AIStudyAssistant() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Study Buddy. Ask me anything about programming, database structures, operating systems, or general college subjects, and I'll explain it clearly!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [themeKey, setThemeKey] = useState("dracula");
  const [fontSize, setFontSize] = useState("12px");
  const [fontFamily, setFontFamily] = useState("Fira Code, monospace");
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("study_buddy_theme");
      const savedSize = localStorage.getItem("study_buddy_font_size");
      const savedFont = localStorage.getItem("study_buddy_font_family");
      if (savedTheme) setThemeKey(savedTheme);
      if (savedSize) setFontSize(savedSize);
      if (savedFont) setFontFamily(savedFont);
    } catch { }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSavePref = (key: string, val: string, storageName: string) => {
    if (key === "theme") setThemeKey(val);
    else if (key === "size") setFontSize(val);
    else if (key === "font") setFontFamily(val);
    try { localStorage.setItem(storageName, val); } catch { }
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;
    if (!textToSend) setInput("");

    const newMessage: Message = { role: "user", content: messageText, timestamp: new Date() };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setLoading(true);
    setError("");

    try {
      const history = newMessages.slice(1, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

      const response = await fetch("/api/v1/student-hub/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply, timestamp: new Date() }]);
      } else {
        setError(data.message || "Failed to connect to Study Buddy. Please try again.");
      }
    } catch {
      setError("Network error. Please make sure the server is reachable.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Auth Loading ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080d1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-brand-500/30">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-brand-500/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">Initializing Study Buddy</p>
            <p className="text-xs text-slate-500 mt-1">Checking your access credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Access Gate ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/20 shadow-lg">
            <Lock className="h-7 w-7 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-white">Access Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in to your SmartPicks account to access the AI Academic Tutor and other placement tools.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/ai-study-assistant`}
            className="flex h-12 w-full items-center justify-center bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-brand-500/20 transition-all active:scale-95 cursor-pointer"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to Student Hub
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Main Page ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080d1a] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] bg-brand-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] bg-violet-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-cyan-600/5 rounded-full blur-[80px]" />
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 container-custom max-w-5xl py-6 flex flex-col h-screen">

        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
          >
            <div className="flex items-center justify-center h-7 w-7 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
              <ArrowLeft className="h-3.5 w-3.5" />
            </div>
            Back to Hub
          </Link>

          <div className="flex items-center gap-2">
            {/* Settings popover */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" /> IDE Settings
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
                      className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-5 z-50 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">IDE Settings</h4>
                        <button onClick={() => setShowSettings(false)} className="text-slate-600 hover:text-slate-300 cursor-pointer transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {[
                        {
                          label: "Color Theme", key: "theme", storageName: "study_buddy_theme", value: themeKey,
                          options: [
                            { value: "dracula", label: "🦇 Dracula" },
                            { value: "vscode", label: "💙 VS Code Dark" },
                            { value: "onedark", label: "🌑 One Dark" },
                            { value: "monokai", label: "🔥 Monokai" },
                            { value: "github", label: "🐙 GitHub Theme" },
                          ]
                        },
                        {
                          label: "Font Size", key: "size", storageName: "study_buddy_font_size", value: fontSize,
                          options: [
                            { value: "11px", label: "11px — Compact" },
                            { value: "12px", label: "12px — Default" },
                            { value: "13px", label: "13px — Comfortable" },
                            { value: "14px", label: "14px — Large" },
                          ]
                        },
                        {
                          label: "Font Family", key: "font", storageName: "study_buddy_font_family", value: fontFamily,
                          options: [
                            { value: "Fira Code, monospace", label: "Fira Code" },
                            { value: "JetBrains Mono, monospace", label: "JetBrains Mono" },
                            { value: "Source Code Pro, monospace", label: "Source Code Pro" },
                            { value: "Courier New, monospace", label: "Courier New" },
                          ]
                        }
                      ].map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{field.label}</label>
                          <select
                            value={field.value}
                            onChange={(e) => handleSavePref(field.key, e.target.value, field.storageName)}
                            className="h-9 w-full bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-bold text-slate-200 focus-visible:outline-none focus-visible:border-brand-500/50 cursor-pointer transition-all"
                          >
                            {field.options.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 shrink-0"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-white/10 p-6 backdrop-blur-sm shadow-2xl">
            {/* Inner glow */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-32 w-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* AI Icon */}
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-600 flex items-center justify-center shadow-xl shadow-brand-500/30">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#080d1a] flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-2xl font-black tracking-tight text-white">AI Study Buddy</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your personal AI academic mentor for CS, DSA, databases & more
                  </p>
                </div>
              </div>

              {/* Stats pills */}
              <div className="hidden sm:flex items-center gap-2">
                {[
                  { icon: GraduationCap, label: "CS Expert", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                  { icon: Lightbulb, label: "24/7 Active", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
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

        {/* ── Suggested Queries ── */}
        <AnimatePresence>
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 shrink-0"
            >
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-brand-500" />
                Suggested Questions
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((preset, i) => (
                  <motion.button
                    key={preset.text}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(preset.text)}
                    className={`p-3 text-left text-[11px] font-semibold rounded-2xl bg-gradient-to-br border transition-all cursor-pointer group ${preset.color}`}
                  >
                    <div className="flex items-start gap-2">
                      <preset.icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${preset.color.split(" ").pop()}`} />
                      <span className="text-slate-300 group-hover:text-white transition-colors leading-snug line-clamp-2">
                        {preset.text}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat Container ── */}
        <div className="flex-1 min-h-0 flex flex-col bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Chat header strip */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-brand-600 to-rose-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black text-white">Study Buddy AI</p>
                <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-slate-600">{messages.length - 1} messages</span>
            </div>
          </div>

          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => {
                const isAssistant = m.role === "assistant";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`flex gap-3 ${isAssistant ? "mr-6" : "ml-6 flex-row-reverse"}`}
                  >
                    {/* Avatar */}
                    <div className={`h-8 w-8 shrink-0 rounded-xl flex items-center justify-center shadow-lg ${
                      isAssistant
                        ? "bg-gradient-to-br from-brand-600 to-rose-600 shadow-brand-500/20"
                        : "bg-gradient-to-br from-slate-700 to-slate-600 shadow-black/20"
                    }`}>
                      {isAssistant
                        ? <Bot className="h-4 w-4 text-white" />
                        : <User className="h-4 w-4 text-slate-300" />
                      }
                    </div>

                    {/* Bubble */}
                    <div className={`relative max-w-full rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg ${
                      isAssistant
                        ? "bg-slate-800/80 border border-white/8 text-slate-200 rounded-tl-sm"
                        : "bg-gradient-to-br from-brand-600 to-rose-600 text-white rounded-tr-sm shadow-brand-500/20"
                    }`}>
                      {isAssistant ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => <h1 className="text-sm font-black mt-3 mb-1.5 text-white uppercase tracking-wide">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xs font-black mt-2 mb-1 text-white uppercase tracking-wide">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xs font-bold mt-2 mb-1 text-slate-200">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-300">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-300">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-300">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-brand-500 pl-3 my-2 text-slate-400 italic">{children}</blockquote>
                            ),
                            code(props: any) {
                              const { children, className } = props;
                              const match = /language-(\w+)/.exec(className || "");
                              const isInline = !match;
                              if (isInline) {
                                return (
                                  <code className="bg-slate-700/60 border border-white/10 px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold text-brand-400">
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <CodeBlock
                                  language={match[1]}
                                  value={String(children).replace(/\n$/, "")}
                                  themeKey={themeKey}
                                  fontSize={fontSize}
                                  fontFamily={fontFamily}
                                />
                              );
                            },
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-line font-semibold">{m.content}</div>
                      )}

                      {/* Timestamp */}
                      {m.timestamp && (
                        <p className={`text-[9px] mt-2 font-bold ${isAssistant ? "text-slate-600" : "text-white/50"}`}>
                          {formatTime(m.timestamp)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Loading state */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mr-6"
              >
                <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-brand-600 to-rose-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-white/8 shadow-lg flex items-center gap-3">
                  <TypingDots />
                  <span className="text-[11px] text-slate-500 font-bold">Study Buddy is thinking...</span>
                </div>
              </motion.div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-3 p-4 bg-rose-500/8 border border-rose-500/20 text-xs text-rose-400 font-bold rounded-2xl max-w-md mx-auto backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    </div>
                    <span className="text-rose-300 font-semibold">{error}</span>
                  </div>
                  {error.includes("limit of 3 AI assistance runs") && (
                    <Link
                      href="/student-hub/upgrade"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-brand-500/20 self-start"
                    >
                      <Zap className="h-3 w-3 fill-current animate-pulse" />
                      Upgrade to Pro
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="p-4 border-t border-white/8 bg-slate-900/60 backdrop-blur-sm shrink-0">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a question about CS, algorithms, databases, OS..."
                  rows={1}
                  className="w-full bg-slate-800/80 border border-white/10 text-white placeholder:text-slate-600 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-500/50 focus:shadow-[0_0_0_3px_rgba(212,63,54,0.1)] resize-none leading-relaxed transition-all duration-200 pr-12"
                  style={{ maxHeight: "120px" }}
                />
                {/* Character count / Shift+Enter hint */}
                <div className="absolute right-3 bottom-3 text-[9px] text-slate-700 font-bold pointer-events-none select-none">
                  ↵
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="h-11 w-11 shrink-0 bg-gradient-to-br from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {loading
                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
              </motion.button>
            </div>
            <p className="text-[9px] text-slate-700 mt-2 text-center font-bold">
              Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
