"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Terminal, Brain, Globe, Server, ArrowRight,
  Zap, ChevronDown, ChevronUp, CheckCircle2, BookOpen,
  Lightbulb, Info, AlertCircle, CornerDownRight
} from "lucide-react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const PATHS = {
  aiml:   { label: "AI / ML",      color: "#7F77DD", icon: Brain,  short: "AI" },
  webdev: { label: "Web Dev",      color: "#378ADD", icon: Globe,  short: "Web" },
  devops: { label: "DevOps & Cloud", color: "#1D9E75", icon: Server, short: "Ops" },
} as const;

type PathKey = keyof typeof PATHS;

interface Phase {
  id: string;
  phase: string;
  title: string;
  desc: string;
  path: PathKey;
  col: number; // 1=left, 2=center, 3=right
}

interface Bridge {
  id: string;
  from: string;   // phase id
  to: string;     // phase id
  label: string;
  color: string;
  why: string;    // plain-English explanation
  example: string; // concrete code/tool example
}

const PHASES: Phase[] = [
  // AI/ML (col 1)
  { id: "aiml-0", phase: "Phase 0", title: "Python & Datasets",    desc: "Python scripting, NumPy, Pandas, SQL for loading datasets.",           path: "aiml",   col: 1 },
  { id: "aiml-2", phase: "Phase 2", title: "FastAPI Deployment",   desc: "Serialize ML weights and expose prediction endpoints via FastAPI.",      path: "aiml",   col: 1 },
  { id: "aiml-3", phase: "Phase 3", title: "MLOps & Monitoring",   desc: "Docker packaging, MLflow versioning, cloud drift monitoring.",           path: "aiml",   col: 1 },
  // Web Dev (col 2)
  { id: "web-0",  phase: "Phase 0", title: "HTML & CSS Layouts",   desc: "DOM rendering, forms, responsive grids, CSS Flexbox/Grid.",             path: "webdev", col: 2 },
  { id: "web-3",  phase: "Phase 3", title: "REST APIs (Node)",     desc: "Express controllers, routing, JWT auth, MongoDB setups.",                path: "webdev", col: 2 },
  { id: "web-4",  phase: "Phase 4", title: "Docker Basics",        desc: "Multi-stage Dockerfiles, container networking, docker-compose.",          path: "webdev", col: 2 },
  // DevOps (col 3)
  { id: "do-1",   phase: "Phase 1", title: "CI/CD Pipelines",      desc: "GitHub Actions workflows — lint, test, build, deploy stages.",           path: "devops", col: 3 },
  { id: "do-2",   phase: "Phase 2", title: "Container Orchestration", desc: "Docker image builds, Kubernetes clusters, Minikube.",               path: "devops", col: 3 },
  { id: "do-34",  phase: "Phase 3–4", title: "Cloud Infrastructure", desc: "AWS VPC, Terraform IaC, Prometheus + Grafana SRE metrics.",           path: "devops", col: 3 },
];

const BRIDGES: Bridge[] = [
  {
    id: "b1",
    from: "aiml-2",
    to:   "web-3",
    label: "FastAPI meets REST",
    color: "#7F77DD",
    why:  "When you deploy an ML model via FastAPI, your frontend (React/Next.js) calls it using the same REST patterns learned in Web Dev Phase 3 — fetch(), axios, and JSON responses.",
    example: "// Web Dev skill used in AI project:\nconst res = await fetch('http://localhost:8000/predict', {\n  method: 'POST',\n  body: JSON.stringify({ input: [1.2, 3.4] })\n});\nconst { prediction } = await res.json();",
  },
  {
    id: "b2",
    from: "web-4",
    to:   "do-2",
    label: "Docker handoff",
    color: "#378ADD",
    why:  "The Dockerfile you write for your Node.js app (Web Dev Phase 4) is exactly what DevOps engineers extend to build multi-container systems with Kubernetes. Same file, bigger scale.",
    example: "# Web Dev writes this Dockerfile:\nFROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]\n\n# DevOps takes it further with Kubernetes Deployment YAML",
  },
  {
    id: "b3",
    from: "aiml-3",
    to:   "do-34",
    label: "MLOps = DevOps",
    color: "#1D9E75",
    why:  "MLOps uses the EXACT same tools as DevOps — Terraform for cloud infra, Prometheus for metrics, Grafana for dashboards. Learning one gives you ~70% of the other for free.",
    example: "# Both MLOps & DevOps use:\nterraform apply          # Deploy GPU cluster or web servers\nprometheus scrape_config # Monitor model drift OR API latency\ngrafana dashboards       # Visualize both ML metrics & SRE metrics",
  },
];

const GIT_UNIVERSAL = {
  label: "Universal: Git / GitHub",
  desc:  "Version control used by ALL three career paths from Day 1.",
  tags:  ["AI/ML", "Web Dev", "DevOps"],
};

/* ─────────────────────────────────────────────
   COMPLETE WORKED EXAMPLE
───────────────────────────────────────────── */
const WORKED_EXAMPLE = {
  title: "Real-World Example: Building a Full AI Product",
  scenario: "Imagine you're building a startup that detects fake product images using AI. Here's how all three roadmaps contribute:",
  steps: [
    {
      num: "01",
      path: "aiml",
      icon: Brain,
      color: "#7F77DD",
      phase: "AI/ML Phase 2",
      action: "Train & Deploy Model",
      detail: "You train a CNN image classifier in Python (PyTorch), then serve it via FastAPI. Your /predict endpoint accepts an image URL and returns { isFake: true, confidence: 0.94 }.",
      skill: "FastAPI + Python",
    },
    {
      num: "02",
      path: "webdev",
      icon: Globe,
      color: "#378ADD",
      phase: "Web Dev Phase 3",
      action: "Build the REST Consumer",
      detail: "Your React dashboard uses fetch() to POST image URLs to your FastAPI model — skills from Web Dev Phase 3. You add JWT auth so only verified sellers can upload images.",
      skill: "Express + React fetch()",
    },
    {
      num: "03",
      path: "webdev",
      icon: Globe,
      color: "#378ADD",
      phase: "Web Dev Phase 4",
      action: "Containerize the App",
      detail: "You write a Dockerfile for both the FastAPI model server and the Node.js API. docker-compose lets you run both locally with one command.",
      skill: "Docker Compose",
    },
    {
      num: "04",
      path: "devops",
      icon: Server,
      color: "#1D9E75",
      phase: "DevOps Phase 2",
      action: "Orchestrate with Kubernetes",
      detail: "Your DevOps skills scale the app — Kubernetes handles 10,000 concurrent image checks. A K8s HorizontalPodAutoscaler spins up more model replicas under load.",
      skill: "Kubernetes + HPA",
    },
    {
      num: "05",
      path: "aiml",
      icon: Brain,
      color: "#7F77DD",
      phase: "AI/ML Phase 3 (MLOps)",
      action: "Monitor in Production",
      detail: "MLflow tracks model versions. Prometheus + Grafana (from DevOps) monitors both model accuracy drift AND API response times in the same dashboard.",
      skill: "MLflow + Prometheus",
    },
  ],
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function InterconnectionMap() {
  const [activeBridge, setActiveBridge] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(false);

  const currentBridge = BRIDGES.find(b => b.id === activeBridge);

  const getPhase = (id: string) => PHASES.find(p => p.id === id)!;

  return (
    <div className="space-y-8 select-none">

      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-2xl">
          <GitBranch className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Cross-Roadmap Interconnections</h2>
        <p className="text-sm text-muted-foreground font-semibold max-w-xl mx-auto leading-relaxed">
          The 3 career paths are not separate — they share real tools and skills. Click any <span className="text-foreground font-black">Skill Bridge</span> below to see exactly where they overlap and <em>why it matters</em>.
        </p>
      </div>

      {/* ── Path Legend ── */}
      <div className="flex flex-wrap justify-center gap-3">
        {(Object.entries(PATHS) as [PathKey, typeof PATHS["aiml"]][]).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <div
              key={key}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-black border"
              style={{ color: meta.color, borderColor: `${meta.color}35`, backgroundColor: `${meta.color}10` }}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label} Path
            </div>
          );
        })}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-black border bg-slate-500/8 border-slate-500/25 text-slate-400">
          <Terminal className="h-3.5 w-3.5" />
          Universal (All Paths)
        </div>
      </div>

      {/* ── Skill Bridges — CLICK TO ACTIVATE ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            3 Skill Bridge Points — Click one to see the connection
          </p>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {BRIDGES.map((bridge, i) => {
            const fromPhase = getPhase(bridge.from);
            const toPhase   = getPhase(bridge.to);
            const fromMeta  = PATHS[fromPhase.path];
            const toMeta    = PATHS[toPhase.path];
            const isActive  = activeBridge === bridge.id;

            return (
              <motion.button
                key={bridge.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveBridge(isActive ? null : bridge.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 space-y-3`}
                style={{
                  borderColor: isActive ? bridge.color : `${bridge.color}25`,
                  backgroundColor: isActive ? `${bridge.color}10` : `${bridge.color}05`,
                  boxShadow: isActive ? `0 4px 24px ${bridge.color}30` : undefined,
                }}
              >
                {/* Number + label */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: bridge.color }}>
                    Bridge {String(i + 1).padStart(2, "0")}
                  </span>
                  <Zap className="h-3.5 w-3.5" style={{ color: bridge.color }} />
                </div>

                {/* FROM → TO */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black" style={{ color: fromMeta.color }}>
                    <fromMeta.icon className="h-3 w-3 shrink-0" />
                    <span>{fromPhase.phase}: {fromPhase.title}</span>
                  </div>
                  <div className="flex items-center gap-1 pl-1">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground font-bold">connects to</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black" style={{ color: toMeta.color }}>
                    <toMeta.icon className="h-3 w-3 shrink-0" />
                    <span>{toPhase.phase}: {toPhase.title}</span>
                  </div>
                </div>

                {/* Label pill */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black border"
                  style={{ borderColor: `${bridge.color}35`, color: bridge.color, backgroundColor: `${bridge.color}08` }}>
                  ⚡ {bridge.label}
                  <span className="ml-1 opacity-60">{isActive ? "▲" : "▼"}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Active Bridge Detail Panel ── */}
      <AnimatePresence>
        {currentBridge && (
          <motion.div
            key={currentBridge.id}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-3xl border-2 overflow-hidden" style={{ borderColor: `${currentBridge.color}30` }}>
              {/* Header bar */}
              <div className="px-5 py-3 flex items-center gap-2" style={{ backgroundColor: `${currentBridge.color}15` }}>
                <Zap className="h-4 w-4" style={{ color: currentBridge.color }} />
                <span className="font-black text-sm" style={{ color: currentBridge.color }}>
                  {currentBridge.label} — Why This Matters
                </span>
              </div>

              <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-5 bg-card/60">
                {/* Explanation */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg mt-0.5 shrink-0" style={{ backgroundColor: `${currentBridge.color}15` }}>
                      <Info className="h-4 w-4" style={{ color: currentBridge.color }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Plain-English Explanation</p>
                      <p className="text-sm font-semibold text-foreground leading-relaxed">{currentBridge.why}</p>
                    </div>
                  </div>

                  {/* FROM → TO visual */}
                  <div className="space-y-2 pt-1">
                    {[getPhase(currentBridge.from), getPhase(currentBridge.to)].map((phase, pi) => {
                      const meta = PATHS[phase.path];
                      const Icon = meta.icon;
                      return (
                        <React.Fragment key={phase.id}>
                          {pi === 1 && (
                            <div className="flex items-center gap-2 pl-4">
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">unlocks / connects to</span>
                            </div>
                          )}
                          <div
                            className="flex items-start gap-3 p-3 rounded-xl border"
                            style={{ borderColor: `${meta.color}25`, backgroundColor: `${meta.color}08` }}
                          >
                            <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${meta.color}20` }}>
                              <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: meta.color }}>
                                {meta.label} · {phase.phase}
                              </p>
                              <p className="text-xs font-black text-foreground">{phase.title}</p>
                              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{phase.desc}</p>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Code example */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Real Code Example</p>
                  </div>
                  <pre className="p-4 bg-[#0d0f14] text-[#a9b2c3] rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-border/40 whitespace-pre-wrap">
                    <code>{currentBridge.example}</code>
                  </pre>
                  <p className="text-[10px] text-muted-foreground font-semibold px-1">
                    💡 This code snippet shows a real scenario where <strong>{PATHS[getPhase(currentBridge.from).path].label}</strong> and <strong>{PATHS[getPhase(currentBridge.to).path].label}</strong> skills are used together.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase Cards Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">All Phases Overview</p>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Universal Git node */}
        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-400/50 bg-slate-500/5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-black text-foreground">🌐 Universal Foundation: Git / GitHub</h4>
          </div>
          <p className="text-xs text-muted-foreground font-semibold">Required by ALL three paths — start here before anything else.</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {GIT_UNIVERSAL.tags.map(t => (
              <span key={t} className="text-[9px] font-black bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* 3-column grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {(["aiml", "webdev", "devops"] as PathKey[]).map(pathKey => {
            const meta = PATHS[pathKey];
            const Icon = meta.icon;
            const phases = PHASES.filter(p => p.path === pathKey);
            return (
              <div key={pathKey} className="space-y-3">
                {/* Column header */}
                <div className="flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: `${meta.color}25` }}>
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${meta.color}15` }}>
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: meta.color }}>{meta.label} Path</span>
                </div>

                {/* Phase cards */}
                {phases.map((phase, pi) => {
                  const connectedBridge = BRIDGES.find(b => b.from === phase.id || b.to === phase.id);
                  const isHighlighted = connectedBridge && activeBridge === connectedBridge.id;

                  return (
                    <motion.div
                      key={phase.id}
                      animate={{ opacity: activeBridge && !isHighlighted ? 0.5 : 1, scale: isHighlighted ? 1.02 : 1 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3.5 rounded-2xl border-2 space-y-1.5 transition-all duration-200`}
                      style={{
                        borderColor: isHighlighted ? meta.color : `${meta.color}20`,
                        backgroundColor: isHighlighted ? `${meta.color}10` : `${meta.color}05`,
                        boxShadow: isHighlighted ? `0 4px 16px ${meta.color}25` : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: meta.color }}>{phase.phase}</span>
                        {connectedBridge && (
                          <span
                            className="text-[8px] font-black px-1.5 py-0.5 rounded-full border"
                            style={{ color: connectedBridge.color, borderColor: `${connectedBridge.color}30`, backgroundColor: `${connectedBridge.color}10` }}
                          >
                            ⚡ Bridge {BRIDGES.indexOf(connectedBridge) + 1}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-foreground">{phase.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">{phase.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Worked Example Section ── */}
      <div className="rounded-3xl border-2 border-brand-500/20 bg-gradient-to-br from-brand-500/5 via-card to-card overflow-hidden">
        <button
          onClick={() => setShowExample(!showExample)}
          className="w-full p-5 sm:p-6 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 shrink-0">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-500">Complete Worked Example</p>
              <h3 className="text-base font-black text-foreground mt-0.5">{WORKED_EXAMPLE.title}</h3>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5 hidden sm:block">{WORKED_EXAMPLE.scenario}</p>
            </div>
          </div>
          <div className="shrink-0 p-2 rounded-xl bg-muted group-hover:bg-muted/80 transition-colors">
            {showExample ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </button>

        <AnimatePresence>
          {showExample && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 sm:px-6 pb-6 border-t border-border/50 pt-6 space-y-6">
                <p className="text-sm text-muted-foreground font-semibold leading-relaxed bg-muted/40 border border-border/40 p-4 rounded-2xl">
                  <span className="text-foreground font-black">📌 Scenario: </span>{WORKED_EXAMPLE.scenario}
                </p>

                {/* Steps */}
                <div className="space-y-4">
                  {WORKED_EXAMPLE.steps.map((step, i) => {
                    const meta = PATHS[step.path as PathKey];
                    const Icon = step.icon;
                    const isLast = i === WORKED_EXAMPLE.steps.length - 1;

                    return (
                      <div key={i} className="relative">
                        {/* Connector line */}
                        {!isLast && (
                          <div className="absolute left-[22px] top-[52px] bottom-[-16px] w-0.5 rounded-full bg-border/60" />
                        )}

                        <div className="flex gap-4">
                          {/* Step number circle */}
                          <div
                            className="w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center font-black text-sm text-white z-10"
                            style={{ backgroundColor: step.color }}
                          >
                            {step.num}
                          </div>

                          <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: step.color }}>
                                    {meta.label} · {step.phase}
                                  </span>
                                </div>
                                <h4 className="text-sm font-black text-foreground mt-0.5">{step.action}</h4>
                              </div>
                              <span
                                className="text-[9px] font-black px-2 py-1 rounded-lg border shrink-0"
                                style={{ color: step.color, borderColor: `${step.color}30`, backgroundColor: `${step.color}10` }}
                              >
                                🛠️ {step.skill}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-2 pr-2">
                              <CornerDownRight className="h-3 w-3 inline mr-1 text-muted-foreground/50" />
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Key Takeaway */}
                <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Key Takeaway</p>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      You didn&apos;t need 3 separate engineers — one person who learns all three roadmaps (even partially) can ship a production AI product end-to-end. The overlapping skills aren&apos;t wasted — they <em>multiply</em> your value.
                    </p>
                  </div>
                </div>

                {/* Quick reference table */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skill Overlap Quick Reference</p>
                  <div className="rounded-2xl border border-border/60 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                          <th className="text-left p-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tool / Skill</th>
                          <th className="text-center p-3 text-[10px] font-black uppercase tracking-wider" style={{ color: "#7F77DD" }}>AI/ML</th>
                          <th className="text-center p-3 text-[10px] font-black uppercase tracking-wider" style={{ color: "#378ADD" }}>Web Dev</th>
                          <th className="text-center p-3 text-[10px] font-black uppercase tracking-wider" style={{ color: "#1D9E75" }}>DevOps</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {[
                          ["Git & GitHub",       true,  true,  true  ],
                          ["Docker",             true,  true,  true  ],
                          ["REST APIs",          true,  true,  false ],
                          ["Python scripting",   true,  false, true  ],
                          ["Terraform / IaC",    true,  false, true  ],
                          ["Kubernetes",         true,  false, true  ],
                          ["Prometheus/Grafana", true,  false, true  ],
                          ["SQL / Databases",    true,  true,  false ],
                          ["CI/CD Pipelines",    false, true,  true  ],
                          ["Linux / Bash",       true,  false, true  ],
                        ].map(([skill, ai, web, ops], ri) => (
                          <tr key={ri} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3 font-bold text-foreground">{skill as string}</td>
                            {[ai, web, ops].map((has, ci) => (
                              <td key={ci} className="p-3 text-center">
                                {has
                                  ? <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-500" />
                                  : <span className="text-muted-foreground/30 text-base leading-none">—</span>
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CTA row */}
                <div className="grid sm:grid-cols-3 gap-3">
                  {(Object.entries(PATHS) as [PathKey, typeof PATHS["aiml"]][]).map(([key, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <a key={key} href={`/student-hub/roadmaps/${key}`}
                        className="flex items-center gap-3 p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] group"
                        style={{ borderColor: `${meta.color}25`, backgroundColor: `${meta.color}08` }}
                      >
                        <div className="p-2 rounded-xl" style={{ backgroundColor: `${meta.color}20` }}>
                          <Icon className="h-5 w-5" style={{ color: meta.color }} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: meta.color }}>Start Learning</p>
                          <p className="text-xs font-black text-foreground">{meta.label}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: meta.color }} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
