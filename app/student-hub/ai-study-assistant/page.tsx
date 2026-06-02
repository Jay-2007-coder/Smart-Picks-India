"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Send, RefreshCw, User, Bot, AlertTriangle, Lock, Check, Copy, Settings, Laptop } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { tokenize, THEME_STYLES, Token } from "@/lib/highlighter";

interface Message {
  role: "user" | "assistant";
  content: string;
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

  // Group tokens into lines to render line numbers
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
    <div className={`relative rounded-2xl overflow-hidden border ${activeTheme.border} ${activeTheme.bg} ${activeTheme.text} my-5 shadow-lg text-left no-print max-w-full`}>
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${activeTheme.border} ${activeTheme.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
            {language}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-500" />
          <span className="text-[9px] text-muted-foreground font-mono">
            {lines.length} line{lines.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendToDsa}
            className="flex items-center gap-1 text-[9px] font-black text-brand-600 hover:text-brand-700 bg-brand-500/10 px-2 py-0.5 rounded transition-all cursor-pointer"
            title="Analyze in DSA Coding Helper"
          >
            <Laptop className="h-3 w-3" /> Analyze DSA
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[9px] font-black text-muted-foreground hover:text-foreground bg-slate-200 dark:bg-slate-800 border border-border/10 px-2 py-0.5 rounded transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <pre
        className="p-4 overflow-x-auto leading-relaxed scrollbar-thin overflow-y-hidden"
        style={{ fontSize, fontFamily }}
      >
        <code className="block select-text">
          {lines.map((lineTokens, lineIdx) => (
            <div key={lineIdx} className="flex hover:bg-slate-500/5 px-1 -mx-1">
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
    </div>
  );
}

const PRESETS = [
  "Explain Quicksort time complexity step-by-step",
  "How do Closures work in JavaScript?",
  "What are the ACID properties in databases?",
  "Explain the difference between TCP and UDP",
];

export default function AIStudyAssistant() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Study Buddy. Ask me anything about programming, database structures, operating systems, or general college subjects, and I'll explain it clearly!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Theme settings states
  const [themeKey, setThemeKey] = useState("dracula");
  const [fontSize, setFontSize] = useState("12px");
  const [fontFamily, setFontFamily] = useState("Fira Code, monospace");
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("study_buddy_theme");
      const savedSize = localStorage.getItem("study_buddy_font_size");
      const savedFont = localStorage.getItem("study_buddy_font_family");
      if (savedTheme) setThemeKey(savedTheme);
      if (savedSize) setFontSize(savedSize);
      if (savedFont) setFontFamily(savedFont);
    } catch {
      // ignore
    }
  }, []);

  const handleSavePref = (key: string, val: string, storageName: string) => {
    if (key === "theme") setThemeKey(val);
    else if (key === "size") setFontSize(val);
    else if (key === "font") setFontFamily(val);

    try {
      localStorage.setItem(storageName, val);
    } catch {
      // ignore
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) {
      setInput("");
    }

    const newMessages = [...messages, { role: "user" as const, content: messageText }];
    setMessages(newMessages);
    setLoading(true);
    setError("");

    try {
      const history = newMessages
        .slice(1, -1) // skip welcome message and last user query
        .map((m) => ({
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
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setError(data.message || "Failed to connect to Study Buddy. Please try again.");
      }
    } catch (err) {
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
              Please sign in to your SmartPicks account to access the AI Academic Tutor and other placement tools.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/ai-study-assistant`}
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
      <div className="container-custom max-w-4xl flex flex-col h-[calc(100vh-8rem)]">
        {/* Back Link */}
        <div className="flex items-center justify-between mb-4 shrink-0 no-print">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-1 text-[11px] font-black text-muted-foreground hover:text-foreground bg-card border border-border/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" /> Editor Settings
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg p-4 z-50 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider pb-1.5 border-b border-border/40">IDE Settings</h4>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground">Theme</label>
                  <select
                    value={themeKey}
                    onChange={(e) => handleSavePref("theme", e.target.value, "study_buddy_theme")}
                    className="h-8 w-full bg-background border border-border rounded-xl px-2 text-xs font-bold text-foreground focus-visible:outline-none"
                  >
                    <option value="dracula">Dracula</option>
                    <option value="vscode">VS Code Dark</option>
                    <option value="onedark">One Dark</option>
                    <option value="monokai">Monokai</option>
                    <option value="github">GitHub Theme</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => handleSavePref("size", e.target.value, "study_buddy_font_size")}
                    className="h-8 w-full bg-background border border-border rounded-xl px-2 text-xs font-bold text-foreground focus-visible:outline-none"
                  >
                    <option value="11px">11px</option>
                    <option value="12px">12px (Default)</option>
                    <option value="13px">13px</option>
                    <option value="14px">14px</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-muted-foreground">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => handleSavePref("font", e.target.value, "study_buddy_font_family")}
                    className="h-8 w-full bg-background border border-border rounded-xl px-2 text-xs font-bold text-foreground focus-visible:outline-none"
                  >
                    <option value="Fira Code, monospace">Fira Code</option>
                    <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                    <option value="Source Code Pro, monospace">Source Code Pro</option>
                    <option value="Courier New, monospace">Courier New</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title Header */}
        <div className="border-b border-border/80 pb-4 mb-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">AI Study Buddy</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interact with a custom AI academic mentor for engineering logic and computer science topics.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="h-4 w-4" /> study buddy
          </span>
        </div>

        {/* Preset queries bar */}
        {messages.length === 1 && (
          <div className="mb-4 shrink-0 space-y-2">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Suggested Queries</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSend(preset)}
                  className="p-3 text-left text-xs font-semibold rounded-2xl bg-card border border-border/80 hover:border-brand-500/20 hover:bg-brand-500/5 transition-all text-foreground cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat box container */}
        <div className="flex-1 bg-card border border-border/80 rounded-3xl overflow-hidden flex flex-col min-h-0 shadow-sm">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, idx) => {
              const isAssistant = m.role === "assistant";
              return (
                <div key={idx} className={`flex gap-3 max-w-[90%] ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  <div
                    className={`h-8.5 w-8.5 shrink-0 rounded-xl flex items-center justify-center text-xs ${
                      isAssistant
                        ? "bg-brand-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isAssistant ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                      isAssistant
                        ? "bg-muted/40 text-foreground"
                        : "bg-brand-600 text-white"
                    }`}
                  >
                    {isAssistant ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-sm font-black mt-3 mb-1.5 text-foreground uppercase tracking-wider">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xs font-black mt-2 mb-1 text-foreground uppercase tracking-wider">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-bold mt-2 mb-1 text-foreground">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          code(props: any) {
                            const { children, className, node, ...rest } = props;
                            const match = /language-(\w+)/.exec(className || "");
                            const isInline = !match;
                            
                            if (isInline) {
                              return (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400" {...rest}>
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
                      <div className="whitespace-pre-line">{m.content}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="h-8.5 w-8.5 shrink-0 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/40 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-brand-600" /> Study Buddy is thinking...
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-2.5 p-3.5 bg-rose-500/5 border border-rose-500/10 text-xs text-rose-600 dark:text-rose-500 font-bold rounded-2xl max-w-md mx-auto">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Typing area */}
          <div className="p-4 border-t border-border/50 bg-background/50 flex gap-3 shrink-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about computer science, code debugging..."
              rows={1}
              className="flex-1 bg-background border border-input rounded-2xl px-4 py-3 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="h-10 w-10 shrink-0 bg-brand-600 hover:bg-brand-700 disabled:bg-muted text-white disabled:text-muted-foreground rounded-2xl flex items-center justify-center shadow transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
