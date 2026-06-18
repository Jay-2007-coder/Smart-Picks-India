"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Lightbulb, RefreshCw, AlertTriangle, Plus, X,
  Lock, ChevronDown, ChevronUp, Copy, Check, Sparkles, Zap,
  CheckSquare, ListOrdered, Printer, Brain, Target, Layers3,
  Rocket, ShieldAlert, Globe, Smartphone, Server, Cpu,
  Leaf, Landmark, HeartPulse
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ─────────────── TYPES ─────────────── */
interface Feature { name: string; description: string; }
interface ProjectIdea {
  title: string; clicheComparison: string; description: string;
  realWorldProblem: string; techStackUsed: string[];
  difficulty: string; features: Feature[]; architecturalRoadmap: string[];
}

/* ─────────────── CONSTANTS ─────────────── */
const DOMAIN_OPTIONS = [
  { id: "any",        label: "Any Domain",     icon: Sparkles,    color: "#a855f7" },
  { id: "web",        label: "Web Dev",         icon: Globe,       color: "#3b82f6" },
  { id: "aiml",       label: "AI / ML",         icon: Brain,       color: "#8b5cf6" },
  { id: "mobile",     label: "Mobile",          icon: Smartphone,  color: "#f59e0b" },
  { id: "cloud",      label: "Cloud/DevOps",    icon: Server,      color: "#06b6d4" },
  { id: "security",   label: "Cybersecurity",   icon: ShieldAlert, color: "#ef4444" },
  { id: "blockchain", label: "Web3",            icon: Layers3,     color: "#f97316" },
  { id: "fintech",    label: "Fintech",         icon: Landmark,    color: "#10b981" },
  { id: "healthcare", label: "Healthcare",      icon: HeartPulse,  color: "#ec4899" },
  { id: "green",      label: "Green Tech",      icon: Leaf,        color: "#22c55e" },
];

const LEVEL_OPTIONS = [
  { id: "Beginner",     label: "Beginner",     desc: "Hackathon / 2nd year", color: "#22c55e" },
  { id: "Intermediate", label: "Intermediate", desc: "Internship / 3rd year", color: "#f59e0b" },
  { id: "Advanced",     label: "Advanced",     desc: "Capstone / Placement",  color: "#ef4444" },
];

const SUGGESTED_TECHS = [
  "React", "Next.js", "Node.js", "Express", "Python", "FastAPI",
  "MongoDB", "PostgreSQL", "TypeScript", "Docker", "PyTorch", "TensorFlow", "Solidity", "Redis"
];

const LOADING_MESSAGES = [
  { text: "Scanning your tech stack...",                    icon: Cpu },
  { text: "Vetoing boring To-Do lists & clones...",        icon: X },
  { text: "Brainstorming anti-cliché concepts...",         icon: Brain },
  { text: "Framing real-world problem statements...",      icon: Target },
  { text: "Engineering feature specifications...",         icon: CheckSquare },
  { text: "Constructing architectural roadmaps...",        icon: Layers3 },
  { text: "Final polish — delivery imminent...",           icon: Rocket },
];

const IDEA_COLORS = [
  { from: "#7c3aed", to: "#a855f7", glow: "rgba(124,58,237,0.2)", label: "violet" },
  { from: "#0891b2", to: "#06b6d4", glow: "rgba(8,145,178,0.2)",  label: "cyan"   },
  { from: "#059669", to: "#10b981", glow: "rgba(5,150,105,0.2)",  label: "emerald"},
];

/* ─────────────── HELPER ─────────────── */
function getDifficultyColor(d: string) {
  if (d === "Beginner")     return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" };
  if (d === "Advanced")     return { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/30"    };
  return                           { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/30"   };
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ProjectIdeaGenerator() {
  const { user, loading: authLoading } = useAuth() as any;

  /* form */
  const [techInput,  setTechInput]  = useState("");
  const [techStack,  setTechStack]  = useState<string[]>(["React", "Node.js"]);
  const [level,      setLevel]      = useState("Intermediate");
  const [domain,     setDomain]     = useState("any");

  /* UI */
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [ideas,          setIdeas]          = useState<ProjectIdea[]>([]);
  const [loadMsgIdx,     setLoadMsgIdx]     = useState(0);
  const [openRoadmap,    setOpenRoadmap]    = useState<number | null>(null);
  const [copiedIdx,      setCopiedIdx]      = useState<number | null>(null);
  const [generated,      setGenerated]      = useState(false);

  const resultsRef  = useRef<HTMLDivElement>(null);
  const loadTimer   = useRef<NodeJS.Timeout | null>(null);

  /* loading message cycle */
  useEffect(() => {
    if (loading) {
      setLoadMsgIdx(0);
      loadTimer.current = setInterval(() => setLoadMsgIdx(p => (p + 1) % LOADING_MESSAGES.length), 2200);
    } else {
      if (loadTimer.current) clearInterval(loadTimer.current);
    }
    return () => { if (loadTimer.current) clearInterval(loadTimer.current); };
  }, [loading]);

  useEffect(() => {
    if (ideas.length > 0) {
      setGenerated(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }, [ideas]);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || techStack.some(x => x.toLowerCase() === t.toLowerCase())) { setTechInput(""); return; }
    setTechStack(prev => [...prev, t]);
    setTechInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(techInput); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techStack.length) { setError("Add at least one technology."); return; }
    setLoading(true); setError(""); setIdeas([]); setOpenRoadmap(null); setGenerated(false);
    try {
      const res  = await fetch("/api/v1/student-hub/project-idea-generator", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techStack, level, domain }),
      });
      const data = await res.json();
      if (res.ok && data.success) setIdeas(data.ideas);
      else setError(data.message || "Generation failed. Please try again.");
    } catch { setError("Network error — check your connection."); }
    finally  { setLoading(false); }
  };

  const copyIdea = (idea: ProjectIdea, idx: number) => {
    const text = [`PROJECT: ${idea.title}`, `Difficulty: ${idea.difficulty}`, `Stack: ${idea.techStackUsed.join(", ")}`,
      "", `PROBLEM:\n${idea.realWorldProblem}`, `\nDESCRIPTION:\n${idea.description}`,
      `\nANTI-CLICHÉ:\n${idea.clicheComparison}`,
      `\nFEATURES:\n${idea.features.map(f => `• ${f.name}: ${f.description}`).join("\n")}`,
      `\nROADMAP:\n${idea.architecturalRoadmap.map((s, i) => `${i+1}. ${s}`).join("\n")}`].join("\n");
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const exportPDF = (idea: ProjectIdea) => {
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const domainLabel = DOMAIN_OPTIONS.find(d => d.id === domain)?.label ?? "General";
    const colorIdx    = ideas.indexOf(idea) % 3;
    const { from, to } = IDEA_COLORS[colorIdx];

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/><title></title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Fira+Code:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
@page{size:A4;margin:0;}
html,body{width:210mm;font-family:'Inter',Arial,sans-serif;font-size:11pt;color:#1e293b;line-height:1.65;background:#fff;}
.tip{background:#0f172a;color:#fff;text-align:center;padding:12px 20px;font-size:10pt;font-weight:700;}
.tip span{color:#f59e0b;}
@media print{.tip{display:none!important;}}
.cover{display:flex;flex-direction:column;align-items:center;justify-content:center;width:210mm;min-height:297mm;padding:60px;text-align:center;background:linear-gradient(145deg,#f8fafc,#f1f5f9);page-break-after:always;}
.icon{width:72px;height:72px;background:linear-gradient(135deg,${from},${to});border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 24px;box-shadow:0 12px 30px rgba(0,0,0,0.15);}
.cover h1{font-size:22pt;font-weight:900;color:#0f172a;line-height:1.2;margin-bottom:10px;}
.sub{font-size:10pt;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:32px;}
.divider{width:50px;height:4px;background:linear-gradient(90deg,${from},${to});border-radius:2px;margin:0 auto 36px;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:480px;margin-bottom:40px;}
.mc{background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:12px 16px;text-align:left;}
.mc .l{font-size:7pt;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:800;display:block;margin-bottom:3px;}
.mc .v{font-size:9.5pt;font-weight:700;color:#0f172a;}
.footer{font-size:8.5pt;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;width:100%;max-width:480px;}
.content{padding:20mm;width:210mm;}
h2{font-size:14pt;font-weight:900;color:#0f172a;margin:28px 0 10px;padding-bottom:8px;border-bottom:2.5px solid ${from}30;}
h2:first-child{margin-top:0;}
.highlight{background:#f8fafc;border-left:4px solid ${from};padding:14px 18px;border-radius:0 12px 12px 0;margin:12px 0 20px;}
.highlight h3{font-size:10pt;font-weight:800;color:${from};margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em;}
p{margin-bottom:12px;color:#334155;}
ul{list-style:none;margin-bottom:20px;}
ul li{position:relative;padding-left:20px;margin-bottom:8px;color:#334155;}
ul li::before{content:"•";color:${from};font-size:16px;position:absolute;left:4px;top:-1px;}
.steps{list-style:none;margin-bottom:20px;}
.steps li{position:relative;padding-left:28px;margin-bottom:14px;color:#334155;}
.steps li::before{content:"";position:absolute;left:6px;top:6px;width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,${from},${to});box-shadow:0 0 6px ${from}60;}
.steps li::after{content:"";position:absolute;left:10px;top:20px;width:2px;height:calc(100% - 12px);background:#e2e8f0;}
.steps li:last-child::after{display:none;}
@media print{h2{page-break-after:avoid;}.highlight,.steps{page-break-inside:avoid;}}
</style></head><body>
<div class="tip">⚠️ In print dialog: <span>uncheck "Headers and footers"</span> → <span>Save as PDF</span></div>
<div class="cover">
  <div class="icon">💡</div>
  <h1>${idea.title}</h1>
  <p class="sub">AI Anti-Cliché Project Brief</p>
  <div class="divider"></div>
  <div class="grid">
    <div class="mc"><span class="l">Difficulty</span><span class="v">${idea.difficulty}</span></div>
    <div class="mc"><span class="l">Domain</span><span class="v">${domainLabel}</span></div>
    <div class="mc"><span class="l">Created</span><span class="v">${date}</span></div>
    <div class="mc"><span class="l">Stack</span><span class="v">${idea.techStackUsed.join(", ")}</span></div>
  </div>
  <div class="footer">SmartPicks India — Student Hub</div>
</div>
<div class="content">
  <h2>1. Executive Summary</h2>
  <p>${idea.description}</p>
  <div class="highlight"><h3>Anti-Cliché Advantage</h3><p>${idea.clicheComparison}</p></div>
  <h2>2. Real-World Problem</h2>
  <p>${idea.realWorldProblem}</p>
  <h2>3. Core MVP Features</h2>
  <ul>${idea.features.map(f => `<li><strong>${f.name}:</strong> ${f.description}</li>`).join("")}</ul>
  <h2>4. Architectural Roadmap</h2>
  <ul class="steps">${idea.architecturalRoadmap.map(s => `<li>${s}</li>`).join("")}</ul>
</div></body></html>`;

    const win = window.open("", "_blank", "width=900,height=800");
    if (!win) { alert("Allow pop-ups to export PDF."); return; }
    win.document.open(); win.document.write(html); win.document.close();
    win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 700);
  };

  /* ─── AUTH GUARDS ─── */
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verifying access...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full bg-card border border-border/80 rounded-3xl p-8 text-center shadow-lg space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <Lock className="h-7 w-7 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight">Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">Sign in to access the AI Project Idea Generator.</p>
        </div>
        <Link href="/login?redirect=/student-hub/project-idea-generator"
          className="flex h-11 w-full items-center justify-center bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow transition-all active:scale-95">
          Sign In to Continue
        </Link>
        <Link href="/student-hub" className="block text-[11px] font-black text-muted-foreground hover:text-foreground">Back to Hub</Link>
      </motion.div>
    </div>
  );

  /* ─── MAIN PAGE ─── */
  return (
    <div className="min-h-screen select-none">
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden border-b border-border/50">
        {/* Ambient BG blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute -top-12 right-1/3 h-72 w-72 rounded-full bg-brand-500/8 blur-3xl" />
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-3xl" />
        </div>

        <div className="container-custom max-w-5xl relative z-10 py-10">
          <Link href="/student-hub"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Hub
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start gap-6 sm:items-center justify-between">
            <div className="space-y-3">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10">
                <Lightbulb className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Anti-Cliché Generator</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                Break the{" "}
                <span className="bg-gradient-to-r from-purple-400 via-brand-400 to-cyan-400 bg-clip-text text-transparent">
                  Pattern
                </span>
              </h1>
              <p className="text-sm text-muted-foreground font-semibold max-w-md leading-relaxed">
                Input your tech stack and instantly get 3 engineering-grade project concepts that no recruiter has seen before — each with a full architectural roadmap.
              </p>
            </div>

            {/* Stats pills */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              {[
                { label: "No To-Do apps", icon: "🚫" },
                { label: "Real problems", icon: "🎯" },
                { label: "3 unique ideas", icon: "💡" },
              ].map(s => (
                <div key={s.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-[10px] font-black text-muted-foreground whitespace-nowrap">
                  <span>{s.icon}</span> {s.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container-custom max-w-5xl py-10">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ━━━━━━━━━━━━━━━━━━━━ LEFT PANEL ━━━━━━━━━━━━━━━━━━━━ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 sticky top-24">

              {/* ── TECH STACK ── */}
              <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">Tech Stack</span>
                  <span className="ml-auto text-[9px] text-muted-foreground font-bold">Press Enter to add</span>
                </div>

                {/* Tag input area */}
                <div className="rounded-xl border border-border bg-background/60 p-3 min-h-[56px] flex flex-wrap gap-1.5 items-center
                    focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all duration-300">
                  <AnimatePresence>
                    {techStack.map((tag, idx) => (
                      <motion.span key={tag + idx}
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[11px] font-bold">
                        {tag}
                        <button type="button" onClick={() => setTechStack(prev => prev.filter((_, i) => i !== idx))}
                          className="text-purple-400 hover:text-white transition-colors cursor-pointer ml-0.5">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder={techStack.length === 0 ? "e.g. React, Node.js, MongoDB" : "Add more..."}
                    className="flex-1 bg-transparent outline-none border-none text-xs font-semibold text-foreground placeholder:text-muted-foreground/50 min-w-[100px]" />
                  {techInput.trim() && (
                    <button type="button" onClick={() => addTag(techInput)}
                      className="p-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors cursor-pointer">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Presets */}
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Quick add</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TECHS.map(tech => {
                      const active = techStack.some(t => t.toLowerCase() === tech.toLowerCase());
                      return (
                        <button key={tech} type="button" disabled={active} onClick={() => addTag(tech)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer
                            ${active
                              ? "bg-purple-500/15 border border-purple-500/30 text-purple-400 opacity-50 cursor-not-allowed"
                              : "bg-muted/30 border border-border/50 text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-border"
                            }`}>
                          {active ? "✓" : "+"}{tech}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── LEVEL PICKER ── */}
              <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Target className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">Difficulty</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {LEVEL_OPTIONS.map(opt => {
                    const active = level === opt.id;
                    return (
                      <button key={opt.id} type="button" onClick={() => setLevel(opt.id)}
                        style={active ? { borderColor: opt.color, boxShadow: `0 0 0 1px ${opt.color}40` } : {}}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center space-y-0.5
                          ${active ? "bg-background" : "border-border/40 bg-background/40 hover:border-border"}`}>
                        <div className="text-xs font-black text-foreground">{opt.label}</div>
                        <div className="text-[8px] font-semibold text-muted-foreground leading-tight">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── DOMAIN PICKER ── */}
              <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                    <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">Domain Focus</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DOMAIN_OPTIONS.map(opt => {
                    const active = domain === opt.id;
                    const Icon   = opt.icon;
                    return (
                      <button key={opt.id} type="button" onClick={() => setDomain(opt.id)}
                        style={active ? { borderColor: opt.color, backgroundColor: `${opt.color}12`, color: opt.color } : {}}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all text-left
                          ${active ? "" : "border-border/40 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"}`}>
                        <Icon className="h-3.5 w-3.5 shrink-0" style={active ? { color: opt.color } : {}} />
                        <span className="text-[10px] font-black">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── ERROR ── */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-2 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-xs text-rose-500 font-bold">
                    <div className="flex gap-2 items-start">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{error}
                    </div>
                    {error.includes("limit") && (
                      <Link href="/student-hub/upgrade"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[9px] uppercase tracking-wider font-black self-start">
                        <Zap className="h-3 w-3 fill-current animate-pulse" /> Upgrade to Pro
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── GENERATE BUTTON ── */}
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="relative w-full h-14 rounded-2xl font-black text-sm text-white overflow-hidden cursor-pointer
                  disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 transition-shadow">
                {/* Gradient BG */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-brand-600 to-purple-700" />
                {/* Animated shimmer */}
                {!loading && (
                  <div className="absolute inset-0 opacity-30"
                    style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)", backgroundSize: "200% 100%", animation: "shimmer 2.5s linear infinite" }} />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Generating ideas...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate Anti-Cliché Ideas</>
                  )}
                </span>
              </motion.button>

              {generated && !loading && (
                <button type="button" onClick={() => { setIdeas([]); setGenerated(false); setOpenRoadmap(null); }}
                  className="w-full h-10 rounded-xl border border-border/60 text-[10px] font-black text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer">
                  ↺ Start Over
                </button>
              )}
            </form>
          </motion.div>

          {/* ━━━━━━━━━━━━━━━━━━━━ RIGHT PANEL ━━━━━━━━━━━━━━━━━━━━ */}
          <div ref={resultsRef} className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">

              {/* LOADING */}
              {loading && (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
                  {/* Spinning rings */}
                  <div className="relative h-24 w-24">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-spin"
                      style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-2 rounded-full border-2 border-brand-500/30 animate-spin"
                      style={{ animationDuration: "2s", animationDirection: "reverse" }} />
                    <div className="absolute inset-4 rounded-full border-2 border-cyan-500/40 animate-spin"
                      style={{ animationDuration: "1.5s" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {React.createElement(LOADING_MESSAGES[loadMsgIdx].icon, { className: "h-8 w-8 text-purple-400" })}
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="font-black text-foreground text-base">AI Architect at work</h4>
                    <AnimatePresence mode="wait">
                      <motion.p key={loadMsgIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}
                        className="text-xs text-muted-foreground font-semibold">
                        {LOADING_MESSAGES[loadMsgIdx].text}
                      </motion.p>
                    </AnimatePresence>
                    <div className="flex gap-1.5 justify-center mt-4">
                      {LOADING_MESSAGES.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === loadMsgIdx ? "w-6 bg-purple-500" : "w-1.5 bg-border"}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* EMPTY STATE */}
              {!loading && ideas.length === 0 && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 border-2 border-dashed border-border/50 rounded-3xl">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto">
                      <Lightbulb className="h-10 w-10 text-purple-400/40" />
                    </div>
                    <motion.div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <span className="text-[8px]">✨</span>
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-foreground text-base">Idea Desk Empty</h4>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mx-auto font-semibold">
                      Configure your stack on the left and hit <span className="text-purple-400 font-black">Generate</span> to receive 3 engineering-grade, non-cliché project briefs.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {["No To-Do apps", "No Weather clones", "Real problems only"].map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-full bg-rose-500/8 border border-rose-500/15 text-[10px] font-bold text-rose-400">
                        🚫 {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* RESULTS */}
              {!loading && ideas.length > 0 && (
                <motion.div key="results" initial="hidden" animate="show"
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.18 } } }}
                  className="space-y-6">
                  {ideas.map((idea, idx) => {
                    const c         = IDEA_COLORS[idx % 3];
                    const diff      = getDifficultyColor(idea.difficulty);
                    const roadmapOn = openRoadmap === idx;

                    return (
                      <motion.div key={idx} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                        className="group relative bg-card border border-border/70 rounded-3xl overflow-hidden shadow-sm
                          hover:shadow-lg hover:border-border transition-all duration-500">
                        {/* Color accent top bar */}
                        <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${c.from}, ${c.to})` }} />

                        <div className="p-6 space-y-5">
                          {/* ── Header ── */}
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border"
                                  style={{ color: c.from, borderColor: `${c.from}40`, backgroundColor: `${c.from}10` }}>
                                  Idea #{idx + 1}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${diff.bg} ${diff.text} ${diff.border}`}>
                                  {idea.difficulty}
                                </span>
                              </div>
                              <h3 className="text-xl font-black text-foreground leading-snug">{idea.title}</h3>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => copyIdea(idea, idx)}
                                className="h-9 w-9 rounded-xl border border-border bg-background hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="Copy brief">
                                {copiedIdx === idx
                                  ? <Check className="h-4 w-4 text-emerald-400" />
                                  : <Copy className="h-4 w-4" />}
                              </button>
                              <button onClick={() => exportPDF(idea)}
                                className="h-9 w-9 rounded-xl border border-border bg-background hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="Export PDF">
                                <Printer className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* ── Description ── */}
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Concept</p>
                            <p className="text-sm text-muted-foreground font-semibold leading-relaxed">{idea.description}</p>
                          </div>

                          {/* ── Problem ── */}
                          <div className="flex gap-3 p-4 rounded-2xl bg-background/60 border border-border/50">
                            <div className="h-8 w-8 rounded-xl shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: `${c.from}15` }}>
                              <Target className="h-4 w-4" style={{ color: c.from }} />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: c.from }}>Problem Solved</p>
                              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">{idea.realWorldProblem}</p>
                            </div>
                          </div>

                          {/* ── Anti-Cliché callout ── */}
                          <div className="flex gap-3 p-4 rounded-2xl"
                            style={{ background: `${c.from}08`, border: `1px solid ${c.from}20` }}>
                            <Sparkles className="h-5 w-5 shrink-0 mt-0.5" style={{ color: c.to }} />
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: c.to }}>Why it's not Cliché</p>
                              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">{idea.clicheComparison}</p>
                            </div>
                          </div>

                          {/* ── Features grid ── */}
                          <div className="space-y-2.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                              <CheckSquare className="h-3.5 w-3.5" /> Core Features
                            </p>
                            <div className="grid sm:grid-cols-2 gap-2.5">
                              {idea.features.map((f, fi) => (
                                <div key={fi} className="p-3.5 rounded-xl bg-background/60 border border-border/40 space-y-0.5 hover:border-border transition-colors">
                                  <p className="text-[11px] font-extrabold text-foreground">{f.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">{f.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ── Tech tags ── */}
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[8px] font-black uppercase text-muted-foreground mr-1">Stack:</span>
                            {idea.techStackUsed.map((t, ti) => (
                              <span key={ti} className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/50 text-[10px] font-bold text-muted-foreground">{t}</span>
                            ))}
                          </div>

                          {/* ── Roadmap toggle ── */}
                          <div className="border-t border-border/40 pt-4">
                            <button onClick={() => setOpenRoadmap(roadmapOn ? null : idx)}
                              className="w-full flex items-center justify-between text-left cursor-pointer group/rm">
                              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground group-hover/rm:text-foreground transition-colors">
                                <ListOrdered className="h-4 w-4" /> Architectural Roadmap
                              </span>
                              <motion.div animate={{ rotate: roadmapOn ? 180 : 0 }} transition={{ duration: 0.25 }}
                                className="text-muted-foreground">
                                <ChevronDown className="h-4 w-4" />
                              </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                              {roadmapOn && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                                  className="overflow-hidden">
                                  <div className="mt-5 pl-5 border-l-2 space-y-5" style={{ borderColor: `${c.from}40` }}>
                                    {idea.architecturalRoadmap.map((step, si) => (
                                      <motion.div key={si}
                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: si * 0.06 }}
                                        className="relative">
                                        {/* Dot */}
                                        <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-background"
                                          style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }} />
                                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: c.to }}>Step {si + 1}</span>
                                        <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-0.5">{step}</p>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
