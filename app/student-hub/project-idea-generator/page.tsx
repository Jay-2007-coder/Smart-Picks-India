"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Lightbulb, RefreshCw, AlertTriangle, Plus, X,
  Lock, ChevronRight, ChevronLeft, Copy, Check, Sparkles, Zap,
  CheckSquare, Printer, Brain, Target, Layers3, Rocket, ShieldAlert,
  Globe, Smartphone, Server, Cpu, Leaf, Landmark, HeartPulse,
  ArrowUpRight, Compass, ShieldCheck, Terminal, Code2, Eye,
  FastForward, BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ─────────────── TYPES ─────────────── */
interface Feature { name: string; description: string; }
interface ProjectIdea {
  title: string;
  clicheComparison: string;
  description: string;
  realWorldProblem: string;
  techStackUsed: string[];
  difficulty: string;
  features: Feature[];
  architecturalRoadmap: string[];
}

type Stage = "input" | "generating" | "demo" | "detail";

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
  "React", "Next.js", "Node.js", "Python", "FastAPI",
  "MongoDB", "PostgreSQL", "TypeScript", "Docker", "PyTorch", "Redis"
];

const GENERATION_STEPS = [
  "Scanning selected technologies & skill profiles...",
  "Vetoing generic To-Do apps, Clone projects & basic CRUD...",
  "Synthesizing enterprise problem statements...",
  "Constructing scalable microservice & API architecture...",
  "Polishing final 3 anti-cliché concepts...",
];

const DOMAIN_MOCKUPS: Record<string, string[]> = {
  web: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80"
  ],
  aiml: [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80"
  ],
  mobile: [
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80",
    "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=1200&q=80",
    "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=1200&q=80"
  ],
  cloud: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80"
  ],
  security: [
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80"
  ],
  blockchain: [
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
    "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=1200&q=80",
    "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&q=80"
  ],
  fintech: [
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80",
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1200&q=80",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"
  ],
  healthcare: [
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80",
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&q=80"
  ],
  green: [
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80",
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
  ],
  any: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
  ]
};

function getDifficultyBadge(d: string) {
  if (d === "Beginner") return { bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  if (d === "Advanced") return { bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
  return { bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
}

export default function ProjectIdeaGenerator() {
  const { user, loading: authLoading } = useAuth() as any;

  /* State */
  const [stage, setStage] = useState<Stage>("input");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>(["React", "Node.js", "TypeScript"]);
  const [level, setLevel] = useState("Intermediate");
  const [domain, setDomain] = useState("any");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);
  const [selectedConceptIdx, setSelectedConceptIdx] = useState(0);
  const [genStepIdx, setGenStepIdx] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Swipe handlers for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Generation step timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage === "generating") {
      setGenStepIdx(0);
      interval = setInterval(() => {
        setGenStepIdx((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 900);
    }
    return () => clearInterval(interval);
  }, [stage]);

  // Keyboard navigation for demo carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== "demo") return;
      if (e.key === "ArrowLeft") {
        setActiveCarouselIdx((prev) => (prev > 0 ? prev - 1 : ideas.length - 1));
      } else if (e.key === "ArrowRight") {
        setActiveCarouselIdx((prev) => (prev < ideas.length - 1 ? prev + 1 : 0));
      } else if (e.key === "Escape") {
        // Skip directly to detail
        setSelectedConceptIdx(activeCarouselIdx);
        setStage("detail");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage, ideas.length, activeCarouselIdx]);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || techStack.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setTechInput("");
      return;
    }
    setTechStack((prev) => [...prev, t]);
    setTechInput("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(techInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techStack.length) {
      setError("Please add at least one technology to your stack.");
      return;
    }

    setError("");
    setStage("generating");

    try {
      const res = await fetch("/api/v1/student-hub/project-idea-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techStack, level, domain }),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.ideas) && data.ideas.length > 0) {
        setIdeas(data.ideas);
        setTimeout(() => {
          setStage("demo");
          setActiveCarouselIdx(0);
        }, 1200);
      } else {
        setError(data.message || "Generation failed. Please try again.");
        setStage("input");
      }
    } catch {
      setError("Network connection issue. Please check your internet and retry.");
      setStage("input");
    }
  };

  // Touch Swipe Logic for Carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped Left -> Next slide
      setActiveCarouselIdx((prev) => (prev < ideas.length - 1 ? prev + 1 : 0));
    } else if (diff < -50) {
      // Swiped Right -> Prev slide
      setActiveCarouselIdx((prev) => (prev > 0 ? prev - 1 : ideas.length - 1));
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const copyIdea = (idea: ProjectIdea, idx: number) => {
    const text = [
      `PROJECT: ${idea.title}`,
      `Difficulty: ${idea.difficulty}`,
      `Stack: ${idea.techStackUsed.join(", ")}`,
      "",
      `PROBLEM:\n${idea.realWorldProblem}`,
      `\nDESCRIPTION:\n${idea.description}`,
      `\nANTI-CLICHÉ ADVANTAGE:\n${idea.clicheComparison}`,
      `\nFEATURES:\n${idea.features.map((f) => `• ${f.name}: ${f.description}`).join("\n")}`,
      `\nROADMAP:\n${idea.architecturalRoadmap.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const exportPDF = (idea: ProjectIdea) => {
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const domainLabel = DOMAIN_OPTIONS.find((d) => d.id === domain)?.label ?? "General";

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/><title>${idea.title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
@page{size:A4;margin:0;}
html,body{width:210mm;font-family:'Inter',sans-serif;font-size:11pt;color:#1e293b;line-height:1.65;background:#fff;}
.cover{display:flex;flex-direction:column;align-items:center;justify-content:center;width:210mm;min-height:297mm;padding:60px;text-align:center;background:linear-gradient(145deg,#f8fafc,#f1f5f9);}
.cover h1{font-size:24pt;font-weight:900;color:#0f172a;line-height:1.2;margin-bottom:12px;}
.sub{font-size:10pt;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:32px;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:480px;margin-bottom:40px;}
.mc{background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:12px 16px;text-align:left;}
.mc .l{font-size:7pt;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:800;display:block;margin-bottom:3px;}
.mc .v{font-size:9.5pt;font-weight:700;color:#0f172a;}
.content{padding:20mm;width:210mm;}
h2{font-size:14pt;font-weight:900;color:#0f172a;margin:28px 0 10px;padding-bottom:8px;border-bottom:2px solid #8b5cf6;}
.highlight{background:#f8fafc;border-left:4px solid #8b5cf6;padding:14px 18px;border-radius:0 12px 12px 0;margin:12px 0 20px;}
p{margin-bottom:12px;color:#334155;}
ul{list-style:none;margin-bottom:20px;}
ul li{position:relative;padding-left:20px;margin-bottom:8px;color:#334155;}
ul li::before{content:"•";color:#8b5cf6;font-size:16px;position:absolute;left:4px;top:-1px;}
</style></head><body>
<div class="cover">
  <h1>${idea.title}</h1>
  <p class="sub">AI Anti-Cliché Project Concept</p>
  <div class="grid">
    <div class="mc"><span class="l">Difficulty</span><span class="v">${idea.difficulty}</span></div>
    <div class="mc"><span class="l">Domain</span><span class="v">${domainLabel}</span></div>
    <div class="mc"><span class="l">Created</span><span class="v">${date}</span></div>
    <div class="mc"><span class="l">Stack</span><span class="v">${idea.techStackUsed.join(", ")}</span></div>
  </div>
</div>
<div class="content">
  <h2>1. Overview</h2>
  <p>${idea.description}</p>
  <div class="highlight"><strong>Anti-Cliché Advantage:</strong> ${idea.clicheComparison}</div>
  <h2>2. Problem Statement</h2>
  <p>${idea.realWorldProblem}</p>
  <h2>3. Core Features</h2>
  <ul>${idea.features.map((f) => `<li><strong>${f.name}:</strong> ${f.description}</li>`).join("")}</ul>
  <h2>4. Implementation Roadmap</h2>
  <ul>${idea.architecturalRoadmap.map((s, i) => `<li><strong>Step ${i + 1}:</strong> ${s}</li>`).join("")}</ul>
</div></body></html>`;

    const win = window.open("", "_blank", "width=900,height=800");
    if (!win) {
      alert("Please allow pop-ups to export the PDF.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 600);
  };

  /* Auth Protection Guard */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
            Initializing AI Discovery Engine...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-xl space-y-6"
        >
          <div className="mx-auto h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
              Please sign in to access the Anti-Cliché Project Discovery Engine.
            </p>
          </div>
          <Link
            href="/login?redirect=/student-hub/project-idea-generator"
            className="flex h-12 w-full items-center justify-center bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-600/20 transition-all active:scale-95"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400">
            Back to Student Hub
          </Link>
        </motion.div>
      </div>
    );
  }

  /* Mockup visual selector helper */
  const getMockupImage = (idx: number) => {
    const pool = DOMAIN_MOCKUPS[domain] || DOMAIN_MOCKUPS.any;
    return pool[idx % pool.length];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative overflow-hidden select-none transition-colors duration-300">
      
      {/* Premium Ambient Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/5 dark:bg-purple-950/20 blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-500/5 dark:bg-cyan-950/15 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/5 dark:bg-pink-950/15 blur-[130px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Student Hub</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              <span>Anti-Cliché Project Engine</span>
            </div>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STAGE 1: INPUT STAGE (MINIMAL HERO & CONFIGURATION)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence mode="wait">
        {stage === "input" && (
          <motion.main
            key="stage-input"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 text-center"
          >
            {/* Title & Headline */}
            <div className="space-y-4 max-w-2xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold shadow-sm"
              >
                <Brain className="h-3.5 w-3.5" />
                <span>Zero Clones • Enterprise Architecture</span>
              </motion.div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-[1.08]">
                Discover Your Next{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                  Breakthrough Project
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                Select your tech stack and instantly discover 3 non-generic, high-impact engineering concepts with ready architectural roadmaps.
              </p>
            </div>

            {/* Config Form Card */}
            <form onSubmit={handleSubmit} className="space-y-8 text-left max-w-2xl mx-auto">
              
              {/* Tech Stack Input */}
              <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Your Target Tech Stack</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                    Press Enter or comma to add
                  </span>
                </div>

                {/* Input box + Tag pills */}
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3 min-h-[64px] flex flex-wrap gap-2 items-center focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all duration-300">
                  <AnimatePresence>
                    {techStack.map((tag, idx) => (
                      <motion.span
                        key={tag + idx}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTechStack((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-purple-400 hover:text-purple-600 dark:hover:text-white transition-colors ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>

                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={techStack.length === 0 ? "e.g. React, Node.js, Python..." : "Add tech..."}
                    className="flex-1 bg-transparent outline-none border-none text-xs font-semibold text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 min-w-[120px] px-1"
                  />
                  {techInput.trim() && (
                    <button
                      type="button"
                      onClick={() => addTag(techInput)}
                      className="p-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggested Chips */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Quick Suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TECHS.map((tech) => {
                      const isAdded = techStack.some((x) => x.toLowerCase() === tech.toLowerCase());
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => addTag(tech)}
                          disabled={isAdded}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                            isAdded
                              ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 border-transparent cursor-default"
                              : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-purple-500/40 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer shadow-sm"
                          }`}
                        >
                          + {tech}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Level & Domain Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Level Selection */}
                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-5 space-y-3 shadow-sm">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                    <Target className="h-4 w-4 text-pink-500" />
                    <span>Project Level</span>
                  </label>

                  <div className="space-y-2">
                    {LEVEL_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLevel(opt.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          level === opt.id
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold shadow-sm"
                            : "bg-slate-50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-black">{opt.label}</div>
                          <div className="text-[10px] opacity-75 font-medium">{opt.desc}</div>
                        </div>
                        {level === opt.id && <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Domain Selection */}
                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-5 space-y-3 shadow-sm">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-cyan-500" />
                    <span>Target Domain</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {DOMAIN_OPTIONS.map((d) => {
                      const Icon = d.icon;
                      const isSelected = domain === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDomain(d.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold transition-all text-left cursor-pointer ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-400 shadow-sm"
                              : "bg-slate-50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: d.color }} />
                          <span className="truncate">{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Anti-Cliché Concepts</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          </motion.main>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            STAGE 2: GENERATION STAGE (AI CONVERGENCE TRANSITION)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {stage === "generating" && (
          <motion.main
            key="stage-generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center min-h-[70vh]"
          >
            {/* Converging AI Orb Animation */}
            <div className="relative h-32 w-32 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-500 opacity-20 blur-2xl animate-pulse" />
              <div className="absolute h-24 w-24 rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: "8s" }} />
              <div className="absolute h-16 w-16 rounded-full border border-cyan-500/40 animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} />
              
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Brain className="h-6 w-6 text-white animate-bounce" style={{ animationDuration: "2s" }} />
              </div>
            </div>

            {/* Convergence Tech Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-md">
              {techStack.map((tech, idx) => (
                <motion.span
                  key={tech + idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold"
                >
                  {tech}
                </motion.span>
              ))}
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mb-2">
              Synthesizing 3 Anti-Cliché Concepts
            </h3>
            
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 min-h-6 transition-all">
              {GENERATION_STEPS[genStepIdx]}
            </p>

            <div className="w-48 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden mt-6">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500"
                initial={{ width: "10%" }}
                animate={{ width: `${((genStepIdx + 1) / GENERATION_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.main>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            STAGE 3: INTERACTIVE DEMO STAGE (FULL-SCREEN CAROUSEL)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {stage === "demo" && ideas.length > 0 && (
          <motion.main
            key="stage-demo"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-5rem)] flex flex-col justify-between"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Carousel Navigation Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
                  Concept 0{activeCarouselIdx + 1} / 0{ideas.length}
                </span>
                <div className="flex items-center gap-1">
                  {ideas.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveCarouselIdx(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeCarouselIdx === idx
                          ? "w-8 bg-purple-600 dark:bg-purple-400"
                          : "w-2 bg-slate-300 dark:bg-zinc-800 hover:bg-slate-400 dark:hover:bg-zinc-700"
                      }`}
                      title={`Go to Concept ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Skip -> Direct to Detail */}
              <button
                onClick={() => {
                  setSelectedConceptIdx(activeCarouselIdx);
                  setStage("detail");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-zinc-900 border border-slate-300/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-black tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>Skip to Specs</span>
                <FastForward className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Central Carousel Visual Slide */}
            <div className="flex-1 relative flex items-center justify-center my-2">
              <AnimatePresence mode="wait">
                {ideas.map((idea, idx) => {
                  if (idx !== activeCarouselIdx) return null;
                  const diffBadge = getDifficultyBadge(idea.difficulty);
                  const mockupImg = getMockupImage(idx);

                  return (
                    <motion.div
                      key={`slide-${idx}`}
                      initial={{ opacity: 0, scale: 0.94, x: 40 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.94, x: -40 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full grid lg:grid-cols-12 gap-8 items-center bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden relative"
                    >
                      {/* Left: Large Visual Mockup Image Focus */}
                      <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 aspect-video bg-slate-950">
                        <img
                          src={mockupImg}
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        
                        {/* Overlaid Pill Badge */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-slate-900/80 border border-white/20 backdrop-blur-md">
                            {domain.toUpperCase()} ARCHITECTURE
                          </span>
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-purple-600/80 backdrop-blur-md">
                            {idea.techStackUsed.slice(0, 3).join(" • ")}
                          </span>
                        </div>
                      </div>

                      {/* Right: Concept Brief Info */}
                      <div className="lg:col-span-5 space-y-5 text-left flex flex-col justify-between h-full">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${diffBadge.bg}`}>
                              {idea.difficulty}
                            </span>
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                              Anti-Cliché Verified
                            </span>
                          </div>

                          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-tight">
                            {idea.title}
                          </h2>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                            {idea.description}
                          </p>

                          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                            <strong className="font-black uppercase tracking-wider block text-[9px] mb-0.5">
                              ⚡ Anti-Cliché Edge:
                            </strong>
                            {idea.clicheComparison}
                          </div>
                        </div>

                        {/* Slide CTA Button */}
                        <button
                          onClick={() => {
                            setSelectedConceptIdx(idx);
                            setStage("detail");
                          }}
                          className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <span>Inspect Full Architecture & Specs</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  setActiveCarouselIdx((prev) => (prev > 0 ? prev - 1 : ideas.length - 1))
                }
                className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
                title="Previous Concept (Left Arrow)"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-500">
                Use Arrow Keys or Swipe to Navigate
              </div>

              <button
                onClick={() =>
                  setActiveCarouselIdx((prev) => (prev < ideas.length - 1 ? prev + 1 : 0))
                }
                className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
                title="Next Concept (Right Arrow)"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.main>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            STAGE 4: PROJECT DETAIL STAGE (DEEP-DIVE SPECIFICATION)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {stage === "detail" && ideas[selectedConceptIdx] && (
          <motion.main
            key="stage-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
          >
            {/* Header & Nav Back to Carousel */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-6 flex-wrap gap-4">
              <button
                onClick={() => setStage("demo")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Carousel Preview</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyIdea(ideas[selectedConceptIdx], selectedConceptIdx)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
                >
                  {copiedIdx === selectedConceptIdx ? "✓ Copied Brief" : "Copy Brief"}
                </button>
                <button
                  onClick={() => exportPDF(ideas[selectedConceptIdx])}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Concept Overview Hero */}
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-black">
                  Concept 0{selectedConceptIdx + 1}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold">
                  {ideas[selectedConceptIdx].difficulty}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-tight">
                {ideas[selectedConceptIdx].title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                {ideas[selectedConceptIdx].description}
              </p>

              {/* Tech Stack Badges */}
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
                  Engineered Tech Stack:
                </span>
                <div className="flex flex-wrap gap-2">
                  {ideas[selectedConceptIdx].techStackUsed.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 2-Column Problem & Anti-Cliche Grid */}
            <div className="grid sm:grid-cols-2 gap-6 text-left">
              
              {/* Real World Problem */}
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-wider">Real-World Problem</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {ideas[selectedConceptIdx].realWorldProblem}
                </p>
              </div>

              {/* Anti-Cliche Advantage */}
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-wider">Anti-Cliché Advantage</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {ideas[selectedConceptIdx].clicheComparison}
                </p>
              </div>

            </div>

            {/* Core Features Grid */}
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-sm space-y-6 text-left">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>Core MVP Features &amp; Modules</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {ideas[selectedConceptIdx].features.map((feat, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-850 space-y-1.5"
                  >
                    <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <span className="h-5 w-5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      {feat.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Architectural Implementation Roadmap */}
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-sm space-y-6 text-left">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span>Architectural Implementation Roadmap</span>
              </h3>

              <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-zinc-800">
                {ideas[selectedConceptIdx].architecturalRoadmap.map((step, idx) => (
                  <div key={idx} className="relative pl-6 space-y-1 group">
                    <div className="absolute -left-[31px] top-1 h-5 w-5 rounded-full bg-cyan-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                      {idx + 1}
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                      Phase 0{idx + 1}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-zinc-800 flex-wrap gap-4">
              <button
                onClick={() => setStage("input")}
                className="px-5 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                ← Configure New Tech Stack
              </button>

              <button
                onClick={() => setStage("demo")}
                className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                Browse Other 2 Concepts →
              </button>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

    </div>
  );
}
