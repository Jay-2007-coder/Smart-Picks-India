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
      className={`relative rounded-2xl overflow-hidden border ${activeTheme.border} ${activeTheme.bg} ${activeTheme.text} my-4 shadow-2xl text-left no-print max-w-full`}
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

const SUGGESTIONS = [
  {
    title: "Explain a Concept",
    prompt: "Explain Quicksort time complexity step-by-step with average and worst-case scenarios",
    icon: Cpu,
    color: "border-purple-500/20 bg-purple-500/5 text-purple-400"
  },
  {
    title: "Solve a DSA Problem",
    prompt: "How to detect a cycle in a linked list using Floyd's Tortoise and Hare algorithm?",
    icon: Code2,
    color: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
  },
  {
    title: "Give an Example",
    prompt: "Show a practical code example of polymorphism and method overriding in Java",
    icon: Lightbulb,
    color: "border-amber-500/20 bg-amber-500/5 text-amber-400"
  },
  {
    title: "Quiz Me",
    prompt: "Quiz me on Operating Systems Deadlocks with 3 multiple-choice questions",
    icon: Brain,
    color: "border-rose-500/20 bg-rose-500/5 text-rose-400"
  }
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
          className="h-2 w-2 rounded-full bg-purple-400"
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

// Auto Title Generator Helper
function generateTitleFromMessage(userMsg: string): string {
  const clean = userMsg.trim().replace(/^[^\w]+/, "");
  if (!clean) return "New Conversation";
  
  // Truncate to first 35 chars nicely
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

    // Default Initial Session
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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
          content: `Hello! I am your AI Study Buddy for **${selectedSubject}**. What are you learning today?`,
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

    // Auto-update Session Title if it's the first user message
    let currentSession = sessions.find((s) => s.id === activeSessionId);
    let sessionTitle = currentSession?.title || "New Conversation";

    if (sessionTitle === "New Conversation" || messages.length <= 1) {
      sessionTitle = generateTitleFromMessage(messageText);
    }

    // Immediately update active session in storage
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

      // Preserving exact existing API integration
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

        // Update stored session with AI reply
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

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080d1a] text-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">Initializing AI Study Buddy</p>
            <p className="text-xs text-slate-500 mt-1">Loading conversation workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Access Restricted Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-lg">
            <Lock className="h-7 w-7 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Access Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in to your SmartPicks account to access the AI Academic Tutor.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/ai-study-assistant`}
            className="flex h-12 w-full items-center justify-center bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-bold text-slate-500 hover:text-slate-300">
            ← Back to Student Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col h-screen overflow-hidden select-none">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CHATGPT-STYLE WORKSPACE (SIDEBAR + CONVERSATION AREA)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative z-10 flex flex-1 h-full overflow-hidden">
        
        {/* ── 1. COLLAPSIBLE CHAT HISTORY SIDEBAR ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-72 bg-slate-900/90 border-r border-white/10 flex flex-col h-full z-30 shrink-0 backdrop-blur-xl absolute md:relative"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-xs">
                      🤖
                    </div>
                    <span className="text-sm font-black tracking-tight text-white">AI Study Buddy</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white md:hidden cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* + New Chat Button */}
                <button
                  onClick={handleNewChat}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Chat</span>
                </button>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full h-8 pl-8 pr-3 bg-white/5 border border-white/10 rounded-lg text-[11px] font-medium outline-none focus:border-purple-500 text-slate-200"
                  />
                </div>
              </div>

              {/* Grouped History List */}
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
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2 block">
                        {group.label}
                      </span>

                      {group.list.map((sess) => {
                        const isActive = sess.id === activeSessionId;
                        const isEditing = editingSessionId === sess.id;

                        return (
                          <div
                            key={sess.id}
                            onClick={() => handleSelectSession(sess)}
                            className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? "bg-purple-600/20 text-white border border-purple-500/30"
                                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                              
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingTitleInput}
                                  onChange={(e) => setEditingTitleInput(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleSaveRename(sess.id)}
                                  onBlur={() => handleSaveRename(sess.id)}
                                  autoFocus
                                  className="w-full bg-slate-800 border border-purple-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                                />
                              ) : (
                                <span className="truncate">{sess.title}</span>
                              )}
                            </div>

                            {/* Session ⋯ Action Menu */}
                            {!isEditing && (
                              <div className="relative shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuSessionId(openMenuSessionId === sess.id ? null : sess.id);
                                  }}
                                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-slate-400 hover:text-white"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>

                                {openMenuSessionId === sess.id && (
                                  <div className="absolute right-0 top-6 z-50 w-28 bg-slate-900 border border-white/10 rounded-xl shadow-xl p-1 space-y-0.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSessionId(sess.id);
                                        setEditingTitleInput(sess.title);
                                        setOpenMenuSessionId(null);
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-white/10 flex items-center gap-1.5"
                                    >
                                      <Edit3 className="h-3 w-3" /> Rename
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteSession(sess.id, e)}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5"
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

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-white/5 flex items-center justify-between">
                <Link href="/student-hub" className="text-[10px] font-bold text-slate-500 hover:text-slate-300 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back to Student Hub
                </Link>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── 2. MAIN CONVERSATION WORKSPACE ── */}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-[#080d1a] relative">
          
          {/* Top Header Bar */}
          <header className="h-14 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Toggle Conversation History"
              >
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </button>

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-[160px] sm:max-w-xs">
                  {sessions.find(s => s.id === activeSessionId)?.title || "AI Study Buddy"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Subject Selector */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="h-8 px-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold text-purple-300 outline-none cursor-pointer"
              >
                {SUBJECT_OPTIONS.map(sub => (
                  <option key={sub} value={sub} className="bg-slate-900 text-white">{sub}</option>
                ))}
              </select>

              {/* IDE Settings button */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  title="IDE Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-60 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-3 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">Code Syntax Theme</span>
                          <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                        </div>
                        <select
                          value={themeKey}
                          onChange={(e) => handleSavePref("theme", e.target.value, "study_buddy_theme")}
                          className="w-full h-8 bg-white/5 border border-white/10 rounded-lg px-2 text-xs font-bold text-slate-200 outline-none"
                        >
                          <option value="dracula" className="bg-slate-900">Dracula</option>
                          <option value="vscode" className="bg-slate-900">VS Code Dark</option>
                          <option value="onedark" className="bg-slate-900">One Dark</option>
                          <option value="monokai" className="bg-slate-900">Monokai</option>
                        </select>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Header + New Chat */}
              <button
                onClick={handleNewChat}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </header>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scroll-smooth">
            
            {/* HERO EMPTY STATE (When 1 message initial state) */}
            {messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto py-8 text-center space-y-6"
              >
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/20">
                  <Brain className="h-8 w-8 text-white" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What are you learning today?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    Ask anything about programming, academics, or your current subjects.
                  </p>
                </div>

                {/* Suggestion Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-4">
                  {SUGGESTIONS.map((chip, idx) => (
                    <motion.div
                      key={chip.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSend(chip.prompt)}
                      className={`p-4 rounded-2xl border ${chip.color} hover:border-purple-500/40 transition-all cursor-pointer group space-y-1.5`}
                    >
                      <div className="flex items-center gap-2">
                        <chip.icon className="h-4 w-4" />
                        <span className="text-xs font-black text-white">{chip.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors line-clamp-2">
                        "{chip.prompt}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Conversation Messages */}
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => {
                const isAssistant = m.role === "assistant";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 max-w-4xl mx-auto ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                  >
                    {/* Avatar */}
                    <div className={`h-8 w-8 shrink-0 rounded-xl flex items-center justify-center shadow-md ${
                      isAssistant
                        ? "bg-purple-600 text-white shadow-purple-600/20"
                        : "bg-slate-700 text-slate-300"
                    }`}>
                      {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>

                    {/* Bubble */}
                    <div className={`relative max-w-[85%] rounded-2xl px-5 py-4 text-xs leading-relaxed shadow-lg ${
                      isAssistant
                        ? "bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-sm"
                        : "bg-purple-600 text-white rounded-tr-sm shadow-purple-600/20 font-medium"
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
                              <blockquote className="border-l-2 border-purple-500 pl-3 my-2 text-slate-400 italic">{children}</blockquote>
                            ),
                            code(props: any) {
                              const { children, className } = props;
                              const match = /language-(\w+)/.exec(className || "");
                              const isInline = !match;
                              if (isInline) {
                                return (
                                  <code className="bg-slate-800 border border-white/10 px-1.5 py-0.5 rounded-md text-[11px] font-mono text-purple-300 font-bold">
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
                        <div className="whitespace-pre-line leading-relaxed">{m.content}</div>
                      )}

                      {/* Timestamp */}
                      {m.timestamp && (
                        <p className={`text-[9px] mt-2 font-bold ${isAssistant ? "text-slate-500" : "text-white/60"}`}>
                          {formatTime(m.timestamp)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Loading Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-4xl mx-auto"
              >
                <div className="h-8 w-8 shrink-0 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-900 border border-white/10 shadow-lg flex items-center gap-3">
                  <TypingDots />
                  <span className="text-[11px] text-slate-400 font-bold">Study Buddy is formulating a response...</span>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold rounded-2xl max-w-md mx-auto backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer Area */}
          <div className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex gap-3 items-end relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Ask anything about ${selectedSubject}, programming, or exams...`}
                  rows={1}
                  className="w-full bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none focus:border-purple-500 transition-all resize-none leading-relaxed pr-12"
                  style={{ maxHeight: "140px" }}
                />
                
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="h-11 w-11 shrink-0 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>

              <p className="text-[9px] text-slate-500 font-bold text-center">
                Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">Shift+Enter</kbd> for line break
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
