"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Sparkles, Send, RefreshCw, User, Bot, AlertTriangle,
  Lock, Check, Copy, Settings, Laptop, Zap, Brain, Code2, Database,
  Network, ChevronRight, X, Cpu, BookOpen, Lightbulb, GraduationCap,
  Plus, Search, MoreVertical, Edit3, Trash2, MessageSquare, PanelLeftClose,
  PanelLeft, ChevronDown, CheckCircle2, Terminal, Layers
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { tokenize, THEME_STYLES, Token } from "@/lib/highlighter";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────── DATA MODELS ─────────────── */
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date | string;
}

interface ChatSession {
  id: string;
  title: string;
  subject: string;
  messages: Message[];
  createdAt: string; // ISO date string
  updatedAt: string;
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
      className={`relative rounded-2xl overflow-hidden border ${activeTheme.border} ${activeTheme.bg} ${activeTheme.text} my-4 shadow-xl text-left no-print max-w-full`}
    >
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${activeTheme.border} ${activeTheme.headerBg}`}>
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {language || "code"}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {lines.length} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendToDsa}
            className="flex items-center gap-1.5 text-[10px] font-black text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-rose-500/20"
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
  { text: "Explain Quicksort time complexity step-by-step", icon: Cpu, color: "from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" },
  { text: "How do Closures work in JavaScript?", icon: Code2, color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" },
  { text: "What are the ACID properties in databases?", icon: Database, color: "from-cyan-500/10 to-teal-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400" },
  { text: "Explain the difference between TCP and UDP", icon: Network, color: "from-emerald-500/10 to-green-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
  { text: "Explain Big O notation with examples", icon: Brain, color: "from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400" },
  { text: "What is the difference between Stack and Queue?", icon: BookOpen, color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400" },
];

const SUBJECT_OPTIONS = [
  "Java",
  "Operating Systems",
  "DBMS",
  "DSA",
  "Computer Networks",
  "AI / ML",
  "General CS"
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-rose-500"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function formatTime(dateVal?: Date | string) {
  if (!dateVal) return "";
  const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function generateTitleFromMessage(userMsg: string): string {
  const clean = userMsg.trim().replace(/^[^\w]+/, "");
  if (!clean) return "New Conversation";
  const words = clean.split(" ");
  if (words.length <= 4) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  const shortTitle = words.slice(0, 4).join(" ");
  return shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1);
}

export default function AIStudyAssistant() {
  const { user, loading: authLoading } = useAuth() as any;
  const router = useRouter();

  /* ─────────────── CHAT SESSIONS & SIDEBAR STATE ─────────────── */
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleInput, setEditingTitleInput] = useState("");
  const [openMenuSessionId, setOpenMenuSessionId] = useState<string | null>(null);

  /* ─────────────── CURRENT ACTIVE SESSION STATE ─────────────── */
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Study Buddy. Ask me anything about programming, database structures, operating systems, or general college subjects, and I'll explain it clearly!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [selectedSubject, setSelectedSubject] = useState("Java");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ─────────────── IDE SETTINGS STATE ─────────────── */
  const [themeKey, setThemeKey] = useState("dracula");
  const [fontSize, setFontSize] = useState("12px");
  const [fontFamily, setFontFamily] = useState("Fira Code, monospace");
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const storageKey = useMemo(() => {
    return `aistudybuddy_chat_sessions_${user?._id || user?.email || "guest"}`;
  }, [user]);

  // Load Sessions from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
          if (parsed[0].subject) setSelectedSubject(parsed[0].subject);
          return;
        }
      }
    } catch {
      // ignore
    }

    const initialSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: "New Conversation",
      subject: "Java",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          role: "assistant",
          content: "Hello! I am your AI Study Buddy. Ask me anything about programming, database structures, operating systems, or general college subjects, and I'll explain it clearly!",
          timestamp: new Date().toISOString(),
        },
      ]
    };
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
    setMessages(initialSession.messages);
  }, [storageKey]);

  // Save Sessions to LocalStorage
  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
    } catch {
      // ignore
    }
  };

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

  /* ─────────────── NEW CHAT HANDLER ─────────────── */
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: "New Conversation",
      subject: selectedSubject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          role: "assistant",
          content: `Hello! I am your AI Study Buddy for **${selectedSubject}**. Ask me anything about your studies!`,
          timestamp: new Date().toISOString(),
        },
      ]
    };

    const updated = [newSession, ...sessions];
    saveSessionsToStorage(updated);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    setInput("");
    setError("");
  };

  /* ─────────────── SWITCH SESSION HANDLER ─────────────── */
  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    if (session.subject) setSelectedSubject(session.subject);
    setError("");
    setOpenMenuSessionId(null);
  };

  /* ─────────────── RENAME SESSION HANDLER ─────────────── */
  const handleSaveRename = (sessionId: string) => {
    if (!editingTitleInput.trim()) return;
    const updated = sessions.map((s) => s.id === sessionId ? { ...s, title: editingTitleInput.trim() } : s);
    saveSessionsToStorage(updated);
    setEditingSessionId(null);
    setEditingTitleInput("");
  };

  /* ─────────────── DELETE SESSION HANDLER ─────────────── */
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    saveSessionsToStorage(updated);
    setOpenMenuSessionId(null);

    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        handleNewChat();
      }
    }
  };

  /* ─────────────── SEND MESSAGE & AI RESPONSE HANDLER ─────────────── */
  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;
    if (!textToSend) setInput("");

    const nowIso = new Date().toISOString();
    const newMessage: Message = { role: "user", content: messageText, timestamp: nowIso };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setLoading(true);
    setError("");

    let currentSession = sessions.find((s) => s.id === activeSessionId);
    let sessionTitle = currentSession?.title || "New Conversation";

    if (sessionTitle === "New Conversation" || messages.length <= 1) {
      sessionTitle = generateTitleFromMessage(messageText);
    }

    const updatedSessions = sessions.map((s) => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: sessionTitle,
          messages: newMessages,
          updatedAt: nowIso,
        };
      }
      return s;
    });
    saveSessionsToStorage(updatedSessions);

    try {
      const history = newMessages.slice(1, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

      const response = await fetch("/api/v1/student-hub/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history, subject: selectedSubject }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const assistantMsg: Message = { role: "assistant", content: data.reply, timestamp: new Date().toISOString() };
        const finalMessages = [...newMessages, assistantMsg];
        setMessages(finalMessages);

        const finalSessions = updatedSessions.map((s) => {
          if (s.id === activeSessionId) {
            return { ...s, messages: finalMessages, updatedAt: new Date().toISOString() };
          }
          return s;
        });
        saveSessionsToStorage(finalSessions);
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

  const handleSavePref = (key: string, val: string, storageName: string) => {
    if (key === "theme") setThemeKey(val);
    else if (key === "size") setFontSize(val);
    else if (key === "font") setFontFamily(val);
    try { localStorage.setItem(storageName, val); } catch { }
  };

  /* ─────────────── GROUPED HISTORY COMPUTATION ─────────────── */
  const groupedSessions = useMemo(() => {
    const searchLower = sidebarSearch.toLowerCase().trim();
    const filtered = sessions.filter(s => s.title.toLowerCase().includes(searchLower));

    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const prev7Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysAgo = todayStart - 7 * 86400000;

    filtered.forEach((s) => {
      const time = new Date(s.updatedAt || s.createdAt).getTime();
      if (time >= todayStart) {
        today.push(s);
      } else if (time >= yesterdayStart) {
        yesterday.push(s);
      } else if (time >= sevenDaysAgo) {
        prev7Days.push(s);
      } else {
        older.push(s);
      }
    });

    return { today, yesterday, prev7Days, older };
  }, [sessions, sidebarSearch]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-200 transition-colors flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-600 to-rose-600 flex items-center justify-center shadow-2xl shadow-brand-500/30">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-brand-500/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Initializing Study Buddy</p>
            <p className="text-xs text-slate-500 mt-1">Checking your access credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="max-w-md w-full bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-lg">
            <Lock className="h-7 w-7 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Access Restricted</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Please sign in to your SmartPicks account to access the AI Academic Tutor.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/ai-study-assistant`}
            className="flex h-12 w-full items-center justify-center bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-brand-500/20 transition-all cursor-pointer"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
            ← Back to Student Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 relative transition-colors duration-200">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TOP NAVIGATION BAR & WORKSPACE WRAPPER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative z-10 container-custom max-w-6xl py-6 flex flex-col min-h-screen">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/student-hub"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-all shadow-sm">
                <ArrowLeft className="h-3.5 w-3.5" />
              </div>
              Back to Hub
            </Link>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <PanelLeft className="h-4 w-4 text-brand-500" />
              <span>History</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-xs font-black shadow-md shadow-brand-500/20 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </button>

            {/* IDE Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Settings className="h-3.5 w-3.5" /> IDE Settings
              </button>

              <AnimatePresence>
                {showSettings && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 z-50 space-y-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">IDE Settings</h4>
                        <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
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
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{field.label}</label>
                          <select
                            value={field.value}
                            onChange={(e) => handleSavePref(field.key, e.target.value, field.storageName)}
                            className="h-9 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:border-brand-500 cursor-pointer transition-all"
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

        {/* Hero Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 shrink-0"
        >
          <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/40 border border-slate-200/80 dark:border-white/10 p-6 shadow-md dark:shadow-2xl">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-600 to-rose-600 flex items-center justify-center shadow-xl shadow-brand-500/30">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#080d1a] flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">AI Study Buddy</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your personal AI academic mentor for CS, DSA, databases &amp; more
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                {[
                  { icon: GraduationCap, label: "CS Expert", color: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                  { icon: Lightbulb, label: "24/7 Active", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" },
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

        {/* Suggested Queries Pill Strip */}
        <AnimatePresence>
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 shrink-0"
            >
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
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
                    className={`p-3 text-left text-[11px] font-semibold rounded-2xl bg-white dark:bg-gradient-to-br border transition-all cursor-pointer group shadow-sm ${preset.color}`}
                  >
                    <div className="flex items-start gap-2">
                      <preset.icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-snug line-clamp-2">
                        {preset.text}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Chat Area & Slide-Out History Drawer ── */}
        <div className="relative flex-1 min-h-0 flex bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl">
          
          {/* History Sidebar Drawer */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 flex flex-col h-full z-30 shrink-0 absolute md:relative shadow-2xl"
              >
                <div className="p-4 border-b border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Conversation History</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleNewChat}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                  </button>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={sidebarSearch}
                      onChange={(e) => setSidebarSearch(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[11px] font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4 text-left">
                  {[
                    { label: "Today", list: groupedSessions.today },
                    { label: "Yesterday", list: groupedSessions.yesterday },
                    { label: "Previous 7 Days", list: groupedSessions.prev7Days },
                    { label: "Older", list: groupedSessions.older },
                  ].map((group) => {
                    if (group.list.length === 0) return null;
                    return (
                      <div key={group.label} className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 px-2 block">{group.label}</span>
                        {group.list.map((sess) => {
                          const isActive = sess.id === activeSessionId;
                          const isEditing = editingSessionId === sess.id;
                          return (
                            <div
                              key={sess.id}
                              onClick={() => handleSelectSession(sess)}
                              className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? "bg-rose-500/10 text-brand-600 dark:text-rose-400 border border-rose-500/20"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingTitleInput}
                                    onChange={(e) => setEditingTitleInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSaveRename(sess.id)}
                                    onBlur={() => handleSaveRename(sess.id)}
                                    autoFocus
                                    className="w-full bg-white dark:bg-slate-800 border border-brand-500 rounded px-1.5 py-0.5 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="truncate">{sess.title}</span>
                                )}
                              </div>

                              {!isEditing && (
                                <div className="relative shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuSessionId(openMenuSessionId === sess.id ? null : sess.id);
                                    }}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </button>

                                  {openMenuSessionId === sess.id && (
                                    <div className="absolute right-0 top-6 z-50 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-1 space-y-0.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingSessionId(sess.id);
                                          setEditingTitleInput(sess.title);
                                          setOpenMenuSessionId(null);
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5"
                                      >
                                        <Edit3 className="h-3 w-3" /> Rename
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteSession(sess.id, e)}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-1.5"
                                      >
                                        <Trash2 className="h-3 w-3" /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Chat Workspace Pane */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            
            {/* Header Strip */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-brand-600 to-rose-600 flex items-center justify-center shadow-md">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900 dark:text-white">Study Buddy AI</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="h-8 px-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-bold text-brand-600 dark:text-rose-400 outline-none cursor-pointer"
                >
                  {SUBJECT_OPTIONS.map(sub => (
                    <option key={sub} value={sub} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{sub}</option>
                  ))}
                </select>

                <span className="text-[9px] font-bold text-slate-400">{messages.length - 1} messages</span>
              </div>
            </div>

            {/* Scrollable Message List */}
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
                      <div className={`h-8 w-8 shrink-0 rounded-xl flex items-center justify-center shadow-md ${
                        isAssistant
                          ? "bg-gradient-to-br from-brand-600 to-rose-600 shadow-brand-500/20"
                          : "bg-slate-700 text-white"
                      }`}>
                        {isAssistant ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4" />}
                      </div>

                      <div className={`relative max-w-full rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                        isAssistant
                          ? "bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/8 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                          : "bg-gradient-to-br from-brand-600 to-rose-600 text-white rounded-tr-sm shadow-brand-500/20"
                      }`}>
                        {isAssistant ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="text-sm font-black mt-3 mb-1.5 text-slate-900 dark:text-white uppercase tracking-wide">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-xs font-black mt-2 mb-1 text-slate-900 dark:text-white uppercase tracking-wide">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-xs font-bold mt-2 mb-1 text-slate-800 dark:text-slate-200">{children}</h3>,
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-700 dark:text-slate-300">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-700 dark:text-slate-300">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-black text-slate-900 dark:text-white">{children}</strong>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-brand-500 pl-3 my-2 text-slate-500 dark:text-slate-400 italic">{children}</blockquote>
                              ),
                              code(props: any) {
                                const { children, className } = props;
                                const match = /language-(\w+)/.exec(className || "");
                                const isInline = !match;
                                if (isInline) {
                                  return (
                                    <code className="bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400">
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

                        {m.timestamp && (
                          <p className={`text-[9px] mt-2 font-bold ${isAssistant ? "text-slate-400" : "text-white/70"}`}>
                            {formatTime(m.timestamp)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mr-6"
                >
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-brand-600 to-rose-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/8 shadow-sm flex items-center gap-3">
                    <TypingDots />
                    <span className="text-[11px] text-slate-500 font-bold">Study Buddy is thinking...</span>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-bold rounded-2xl max-w-md mx-auto"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="p-4 border-t border-slate-200/80 dark:border-white/8 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Ask a question about ${selectedSubject}, algorithms, databases...`}
                    rows={1}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-500 resize-none leading-relaxed transition-all pr-12 shadow-inner"
                    style={{ maxHeight: "120px" }}
                  />
                  <div className="absolute right-3 bottom-3 text-[9px] text-slate-400 font-bold pointer-events-none select-none">
                    ↵
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="h-11 w-11 shrink-0 bg-gradient-to-br from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </motion.button>
              </div>
              <p className="text-[9px] text-slate-400 mt-2 text-center font-bold">
                Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px]">Shift+Enter</kbd> for new line
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
