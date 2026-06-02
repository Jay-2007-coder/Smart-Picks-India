"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, RefreshCw, User, Bot, AlertTriangle, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Map history for API
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
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-4 transition-colors no-print shrink-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

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
                <div key={idx} className={`flex gap-3 max-w-[85%] ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
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
                    className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed whitespace-pre-line ${
                      isAssistant
                        ? "bg-muted/40 text-foreground"
                        : "bg-brand-600 text-white"
                    }`}
                  >
                    {m.content}
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
