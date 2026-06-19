"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User, HelpCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function AIChatbot() {
  const pathname = usePathname();
  const isAuthPage = pathname && ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/verify-otp"].some(p => pathname.startsWith(p));

  if (isAuthPage) return null;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I am your Gemini AI Smart Shopping Assistant. I scan active deals on our platform to find you the best savings. Ask me anything about current tech discounts, home appliances, or budget picks!",
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/v1/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: "I'm sorry, I'm having trouble connecting right now. Please try again." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Oops! An error occurred. Let's try again in a bit." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Markdown link & bold text renderer
  const renderMessageContent = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const linkText = match[1];
      const linkUrl = match[2];
      const isInternal = linkUrl.startsWith("/");

      if (isInternal) {
        parts.push(
          <Link
            key={match.index}
            href={linkUrl}
            className="font-bold text-red-500 hover:text-red-600 underline inline-flex items-center gap-0.5 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {linkText}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-red-500 hover:text-red-600 underline transition-colors"
          >
            {linkText}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-line text-[13px] leading-relaxed font-medium">
        {parts.map((part, index) => {
          if (typeof part === "string") {
            const boldParts = [];
            let bLast = 0;
            const bRegex = /\*\*([^*]+)\*\*/g;
            let bMatch;
            
            while ((bMatch = bRegex.exec(part)) !== null) {
              if (bMatch.index > bLast) {
                boldParts.push(part.substring(bLast, bMatch.index));
              }
              boldParts.push(<strong key={bMatch.index} className="font-extrabold text-foreground">{bMatch[1]}</strong>);
              bLast = bRegex.lastIndex;
            }
            
            if (bLast < part.length) {
              boldParts.push(part.substring(bLast));
            }
            
            return <React.Fragment key={index}>{boldParts}</React.Fragment>;
          }
          return part;
        })}
      </div>
    );
  };

  const suggestions = [
    "Recommend a budget phone",
    "Show me BoAt earbuds",
    "What are the best deals?",
  ];

  return (
    <>
      {/* Floating Capsule Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.06, boxShadow: "0 10px 25px rgba(212,63,54,0.2)" }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border shadow-lg hover:border-brand-500/35 transition-colors duration-200 cursor-pointer"
        title="Open AI Assistant"
      >
        <div className="relative">
          {isOpen ? (
            <X className="h-5 w-5 transform rotate-90 transition-transform duration-200" />
          ) : (
            <MessageSquare className="h-5 w-5 transform scale-100 transition-transform duration-200 text-brand-600 dark:text-brand-400" />
          )}
          {!isOpen && (
            <span className="absolute -top-2.5 -right-2.5 flex items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black px-1 py-0.5 leading-none shadow-sm animate-pulse-scale">
              AI
            </span>
          )}
        </div>
      </motion.button>

      {/* Modern Glassmorphic Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[390px] max-w-[calc(100vw-32px)] flex-col rounded-3xl border border-border/80 bg-background/85 backdrop-blur-xl shadow-2xl overflow-hidden select-none animate-none"
          >
            {/* Top Banner Header */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-neutral-955 via-neutral-900 to-rose-955 px-5 py-4 text-white border-b border-border/10">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-rose-450 to-red-655 pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40">
                  <Bot className="h-4.5 w-4.5 text-red-500" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-neutral-950" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight leading-none flex items-center gap-1">
                    SmartPicks AI <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  </h4>
                  <span className="text-[10px] font-semibold text-white/70">Assistant &bull; Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors relative z-10 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Flow Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-500/[0.02]">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, delay: index === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-tr from-brand-600 to-rose-600 text-white"
                        : "bg-background border border-border/80 text-foreground"
                    }`}
                  >
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-brand-650 dark:text-brand-400" />}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[76%] shadow-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-brand-600 to-rose-600 text-white rounded-tr-none"
                        : "bg-background/80 dark:bg-slate-900/80 border border-border/60 backdrop-blur-md text-foreground rounded-tl-none"
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border/80 text-foreground">
                    <Bot className="h-4 w-4 text-brand-650 dark:text-brand-400" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-background border border-border/80 px-4.5 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500/70 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500/70 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500/70" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions pill line */}
            {messages.length === 1 && (
              <div className="px-5 py-3 bg-muted/20 border-t border-border/50">
                <p className="text-[9px] font-black text-muted-foreground mb-2 uppercase tracking-widest flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" /> Quick Questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-xl border border-border/80 bg-background/90 px-3.5 py-1.5 text-xs text-muted-foreground font-extrabold hover:border-brand-500 hover:text-brand-650 transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Input Control Bar */}
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2 border-t border-border/60 bg-background/90 px-5 py-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about reviews, deals, store products..."
                className="flex-1 bg-muted/30 h-10 rounded-2xl border border-input px-4 text-xs font-bold placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500/20 focus-visible:border-brand-500/40"
              />
              <motion.button
                type="submit"
                disabled={!inputValue.trim() || loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-600 text-white hover:shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4.5 w-4.5" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
