"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Lightbulb, Play, RefreshCw, AlertTriangle, Plus, X,
  Lock, ChevronDown, ChevronUp, Copy, Check, Sparkles, Zap, Laptop,
  Cpu, Layers, FileText, CheckSquare, ListOrdered, Printer, ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Feature {
  name: string;
  description: string;
}

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

const DOMAIN_OPTIONS = [
  { id: "any", label: "Any / Multi-disciplinary" },
  { id: "web", label: "Web Development" },
  { id: "aiml", label: "AI / ML" },
  { id: "mobile", label: "Mobile App" },
  { id: "security", label: "Cybersecurity" },
  { id: "blockchain", label: "Blockchain / Web3" },
  { id: "cloud", label: "Cloud / DevOps" },
  { id: "fintech", label: "Fintech" },
  { id: "healthcare", label: "Healthcare" },
  { id: "green", label: "Green Tech / Sustainability" }
];

const SUGGESTED_TECHS = [
  "React", "Next.js", "Node.js", "Express", "Python", "FastAPI",
  "MongoDB", "PostgreSQL", "SQLite", "Tailwind CSS", "TypeScript",
  "Docker", "PyTorch", "TensorFlow", "Solidity"
];

const LOADING_MESSAGES = [
  "Analyzing provided tech stack...",
  "Filtering out typical To-Do lists and weather apps...",
  "Brainstorming anti-cliché project concepts...",
  "Formulating real-world problem statements...",
  "Drafting core feature sets...",
  "Constructing step-by-step architectural roadmaps...",
  "Polishing final ideas for delivery..."
];

export default function ProjectIdeaGenerator() {
  const { user, loading: authLoading } = useAuth() as any;

  // Form states
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>(["React", "Node.js"]);
  const [level, setLevel] = useState("Intermediate");
  const [domain, setDomain] = useState("any");

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [loadMsgIdx, setLoadMsgIdx] = useState(0);
  const [openRoadmapIdx, setOpenRoadmapIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const loadInterval = useRef<NodeJS.Timeout | null>(null);

  // Cycle through loading messages
  useEffect(() => {
    if (loading) {
      setLoadMsgIdx(0);
      loadInterval.current = setInterval(() => {
        setLoadMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      if (loadInterval.current) {
        clearInterval(loadInterval.current);
      }
    }
    return () => {
      if (loadInterval.current) {
        clearInterval(loadInterval.current);
      }
    };
  }, [loading]);

  // Scroll to results when generated
  useEffect(() => {
    if (ideas.length > 0 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [ideas]);

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    if (techStack.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
      setTechInput("");
      return;
    }
    setTechStack([...techStack, cleanTag]);
    setTechInput("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTechStack(techStack.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(techInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (techStack.length === 0) {
      setError("Please add at least one technology to your tech stack.");
      return;
    }

    setLoading(true);
    setError("");
    setIdeas([]);
    setOpenRoadmapIdx(null);

    try {
      const res = await fetch("/api/v1/student-hub/project-idea-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techStack, level, domain }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIdeas(data.ideas);
      } else {
        setError(data.message || "Failed to generate project ideas. Please try again.");
      }
    } catch {
      setError("An error occurred connecting to the server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (idea: ProjectIdea, index: number) => {
    const text = `PROJECT: ${idea.title}\n` +
      `Difficulty: ${idea.difficulty}\n` +
      `Tech Stack: ${idea.techStackUsed.join(", ")}\n\n` +
      `PROBLEM:\n${idea.realWorldProblem}\n\n` +
      `DESCRIPTION:\n${idea.description}\n\n` +
      `ANTI-CLICHÉ ADVANTAGE:\n${idea.clicheComparison}\n\n` +
      `CORE FEATURES:\n${idea.features.map((f) => `- ${f.name}: ${f.description}`).join("\n")}\n\n` +
      `ARCHITECTURAL ROADMAP:\n${idea.architecturalRoadmap.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleExportPDF = (idea: ProjectIdea) => {
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title></title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Fira+Code:wght@400;500&display=swap');
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    html, body {
      width: 210mm;
      font-family: 'Inter', Arial, sans-serif;
      font-size: 11pt;
      color: #1e293b;
      line-height: 1.65;
      background: #fff;
    }
    
    .print-tip {
      background: #0f172a;
      color: #fff;
      text-align: center;
      padding: 12px 20px;
      font-size: 10pt;
      font-weight: 700;
    }
    .print-tip span { color: #f59e0b; font-weight: 900; }
    @media print { .print-tip { display: none !important; } }
    
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 210mm;
      min-height: 297mm;
      padding: 60px;
      text-align: center;
      background: linear-gradient(145deg, #fafafc 0%, #f1f5f9 100%);
      page-break-after: always;
    }
    
    .cover-icon {
      width: 70px; height: 70px;
      background: linear-gradient(135deg, #ea580c, #f59e0b);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 30px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px rgba(234,88,12,0.25);
    }
    
    .cover h1 {
      font-size: 24pt;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.25;
      margin-bottom: 12px;
    }
    
    .cover-subtitle {
      font-size: 12pt;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 36px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .cover-divider {
      width: 50px; height: 4px;
      background: #ea580c;
      border-radius: 2px;
      margin-bottom: 40px;
    }
    
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      width: 100%;
      max-width: 500px;
      margin-bottom: 40px;
    }
    
    .meta-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      text-align: left;
    }
    
    .meta-card .label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      font-weight: 800;
      display: block;
      margin-bottom: 3px;
    }
    
    .meta-card .value {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    
    .cover-footer {
      font-size: 8.5pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      width: 100%;
      max-width: 500px;
    }
    
    .content {
      padding: 20mm;
      width: 210mm;
      min-height: 297mm;
    }
    
    h2 {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 24px;
      margin-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
    }
    
    .card-block {
      background: #f8fafc;
      border-left: 4px solid #ea580c;
      padding: 14px 18px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 20px;
    }
    
    .card-block h3 {
      font-size: 11pt;
      font-weight: 800;
      color: #c2410c;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    p { margin-bottom: 12px; color: #334155; }
    
    .bullet-list {
      margin-bottom: 20px;
      list-style-type: none;
    }
    
    .bullet-list li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 8px;
      color: #334155;
    }
    
    .bullet-list li::before {
      content: "•";
      color: #ea580c;
      font-size: 16px;
      position: absolute;
      left: 4px;
      top: -1px;
    }
    
    .roadmap-list {
      margin-bottom: 20px;
      list-style-type: none;
    }
    
    .roadmap-list li {
      position: relative;
      padding-left: 24px;
      margin-bottom: 12px;
      color: #334155;
    }
    
    .roadmap-list li::before {
      content: "";
      position: absolute;
      left: 6px;
      top: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ea580c;
    }
    
    .roadmap-list li::after {
      content: "";
      position: absolute;
      left: 9px;
      top: 18px;
      width: 2px;
      height: calc(100% - 10px);
      background: #cbd5e1;
    }
    
    .roadmap-list li:last-child::after {
      display: none;
    }
    
    @media print {
      h2 { page-break-after: avoid; }
      .card-block, .bullet-list, .roadmap-list { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="print-tip">
    ⚠️ In the print dialog, <span>uncheck "Headers and footers"</span> then choose <span>Save as PDF</span>.
  </div>
  
  <div class="cover">
    <div class="cover-icon">💡</div>
    <h1>${idea.title}</h1>
    <p class="cover-subtitle">AI Anti-Cliche Project Brief</p>
    <div class="cover-divider"></div>
    <div class="meta-grid">
      <div class="meta-card"><span class="label">Difficulty</span><span class="value">${idea.difficulty}</span></div>
      <div class="meta-card"><span class="label">Domain</span><span class="value">${domain === "any" ? "General" : DOMAIN_OPTIONS.find((d) => d.id === domain)?.label}</span></div>
      <div class="meta-card"><span class="label">Date Created</span><span class="value">${dateStr}</span></div>
      <div class="meta-card"><span class="label">Tech Stack</span><span class="value">${idea.techStackUsed.join(", ")}</span></div>
    </div>
    <div class="cover-footer">Smart Picks India — Student Hub</div>
  </div>
  
  <div class="content">
    <h2>1. Executive Summary</h2>
    <p>${idea.description}</p>
    
    <div class="card-block">
      <h3>Anti-Cliché Advantage</h3>
      <p>${idea.clicheComparison}</p>
    </div>
    
    <h2>2. Real-World Problem Solved</h2>
    <p>${idea.realWorldProblem}</p>
    
    <h2>3. Core MVP Features</h2>
    <ul class="bullet-list">
      ${idea.features.map((f) => `<li><strong>${f.name}:</strong> ${f.description}</li>`).join("")}
    </ul>
    
    <h2>4. Architectural Implementation Roadmap</h2>
    <ul class="roadmap-list">
      ${idea.architecturalRoadmap.map((step) => `<li>${step}</li>`).join("")}
    </ul>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=900,height=800");
    if (!printWindow) {
      alert("Please allow pop-ups for this site to export the PDF.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 700);
    };
  };

  // Checking session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in gate
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
              Please sign in to access the AI Project Idea Generator and build anti-cliché applications.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/project-idea-generator`}
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12 select-none">
      <div className="container-custom max-w-5xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">AI Anti-Cliche Project Generator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Input your tech stack to generate 3 highly unique project concepts that solve real-world problems.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
              <Lightbulb className="h-4 w-4" /> Anti-Cliche Generator
            </span>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Left / Top Form */}
          <div className="md:col-span-2 space-y-6">
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-5 sticky top-24"
            >
              {/* Tag Stack Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Tech Stack Tags</label>
                <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-xl bg-background min-h-[46px] items-center focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all duration-300">
                  {techStack.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-lg text-xs font-bold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-brand-600 hover:text-brand-800 dark:hover:text-brand-300 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={techStack.length === 0 ? "e.g. React, Node.js" : "Add tech..."}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-foreground font-semibold min-w-[80px]"
                  />
                  {techInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddTag(techInput)}
                      className="p-1 text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Tech Presets */}
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-muted-foreground">Quick Presets</p>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_TECHS.map((tech) => {
                      const exists = techStack.some((t) => t.toLowerCase() === tech.toLowerCase());
                      return (
                        <button
                          key={tech}
                          type="button"
                          disabled={exists}
                          onClick={() => handleAddTag(tech)}
                          className="px-2 py-0.5 rounded-md border border-border/60 bg-muted/20 hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-muted/20 text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                        >
                          +{tech}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Target Difficulty</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="h-9 w-full bg-background border border-border rounded-xl px-2.5 text-xs font-bold text-foreground focus-visible:outline-none"
                >
                  <option value="Beginner">Beginner (Sophomore / Easy)</option>
                  <option value="Intermediate">Intermediate (Junior / Standard)</option>
                  <option value="Advanced">Advanced (Senior / Capstone)</option>
                </select>
              </div>

              {/* Theme Domain Focus */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Domain / Focus Area</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-9 w-full bg-background border border-border rounded-xl px-2.5 text-xs font-bold text-foreground focus-visible:outline-none"
                >
                  {DOMAIN_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex flex-col gap-2 p-3 bg-rose-500/5 border border-rose-500/10 text-[11px] text-rose-600 dark:text-rose-500 font-bold rounded-xl animate-fade-in">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                  {error.includes("limit of 3 AI assistance runs") && (
                    <Link
                      href="/student-hub/upgrade"
                      className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[9px] uppercase tracking-wider font-black transition-colors self-start shadow-sm shadow-rose-500/10"
                    >
                      <Zap className="h-3.5 w-3.5 fill-current text-white animate-pulse" /> Upgrade to Pro
                    </Link>
                  )}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-10 w-full items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-muted text-white disabled:text-muted-foreground rounded-xl text-xs font-black shadow transition-all cursor-pointer select-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Brainstorming...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Generate Anti-Cliche Ideas
                  </>
                )}
              </button>

              {ideas.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={() => {
                    setIdeas([]);
                    setOpenRoadmapIdx(null);
                  }}
                  className="flex h-9 w-full items-center justify-center gap-1 border border-border rounded-xl text-[10px] font-black text-muted-foreground hover:bg-muted/55 transition-all cursor-pointer"
                >
                  Clear Results
                </button>
              )}
            </form>
          </div>

          {/* Right / Bottom Results Area */}
          <div ref={resultsRef} className="md:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                >
                  <RefreshCw className="h-10 w-10 text-brand-600 animate-spin" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-foreground text-sm">Consulting AI Architect</h4>
                    <p className="text-xs text-muted-foreground font-semibold animate-pulse">
                      {LOADING_MESSAGES[loadMsgIdx]}
                    </p>
                  </div>
                </motion.div>
              )}

              {!loading && ideas.length === 0 && (
                <motion.div
                  key="empty-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border border-border/80 border-dashed rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4"
                >
                  <Lightbulb className="h-12 w-12 text-brand-500/20" />
                  <div>
                    <h4 className="font-extrabold text-foreground text-sm">Idea Desk Empty</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed mx-auto">
                      Add your coding technologies, choose your parameters, and generate unique, engineering-grade project concepts.
                    </p>
                  </div>
                </motion.div>
              )}

              {!loading && ideas.length > 0 && (
                <motion.div
                  key="results-container"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.15 }
                    }
                  }}
                  className="space-y-6"
                >
                  {ideas.map((idea, idx) => {
                    const isRoadmapOpen = openRoadmapIdx === idx;
                    return (
                      <motion.div
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0 }
                        }}
                        className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-5"
                      >
                        {/* Title and metadata */}
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div className="space-y-1.5 flex-1 min-w-[200px]">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg border border-brand-500/20 bg-brand-500/5 text-brand-600 dark:text-brand-400 text-[9px] font-black uppercase tracking-wider">
                              Idea #{idx + 1}
                            </span>
                            <h3 className="text-lg font-black text-foreground leading-snug">{idea.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                              {idea.difficulty}
                            </span>
                            <button
                              onClick={() => handleCopy(idea, idx)}
                              className="p-2 bg-card border border-border rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                              title="Copy details"
                            >
                              {copiedIdx === idx ? (
                                <Check className="h-4 w-4 text-emerald-500 animate-pulse-scale" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleExportPDF(idea)}
                              className="p-2 bg-card border border-border rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                              title="Export PDF Brief"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Project Concept</h5>
                          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                            {idea.description}
                          </p>
                        </div>

                        {/* Real World Problem */}
                        <div className="space-y-1 border-l-2 border-brand-500/30 pl-3">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">Problem Addressed</h5>
                          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                            {idea.realWorldProblem}
                          </p>
                        </div>

                        {/* Anti-Cliche Power Box */}
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 items-start">
                          <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h6 className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-wider">
                              Why this isn't Cliche
                            </h6>
                            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                              {idea.clicheComparison}
                            </p>
                          </div>
                        </div>

                        {/* Features checklist */}
                        <div className="space-y-2.5">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <CheckSquare className="h-3.5 w-3.5" /> Core MVP Features
                          </h5>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {idea.features.map((feature, fIdx) => (
                              <div key={fIdx} className="bg-muted/20 border border-border/40 rounded-xl p-3 space-y-0.5">
                                <span className="text-xs font-extrabold text-foreground leading-snug">
                                  {feature.name}
                                </span>
                                <p className="text-[10px] text-muted-foreground font-semibold leading-normal">
                                  {feature.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tech Used */}
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] font-black uppercase text-muted-foreground mr-1">Aligned Stack:</span>
                          {idea.techStackUsed.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/60 text-[10px] font-bold text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Collapsible Roadmap */}
                        <div className="border-t border-border/50 pt-4">
                          <button
                            onClick={() => setOpenRoadmapIdx(isRoadmapOpen ? null : idx)}
                            className="flex items-center justify-between w-full text-left text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <ListOrdered className="h-4 w-4" /> Architectural Roadmap
                            </span>
                            {isRoadmapOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>

                          <AnimatePresence initial={false}>
                            {isRoadmapOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden mt-4 pl-4 border-l border-border"
                              >
                                <div className="space-y-4 py-2">
                                  {idea.architecturalRoadmap.map((step, sIdx) => (
                                    <div key={sIdx} className="relative space-y-1">
                                      <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-500" />
                                      <span className="text-[9px] font-black uppercase text-brand-600 dark:text-brand-400">
                                        Step {sIdx + 1}
                                      </span>
                                      <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                                        {step}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
