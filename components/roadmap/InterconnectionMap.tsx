"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Terminal, Brain, Globe, Server, ArrowRight, ArrowDown,
  Zap, ChevronDown, ChevronUp, CheckCircle2, Lightbulb,
  Info, CornerDownRight, Code2, BookOpen, Rocket, Star, Link2
} from "lucide-react";

/* ─────────────── TYPES ─────────────── */
type PathKey = "aiml" | "webdev" | "devops";

const PATHS: Record<PathKey, { label: string; color: string; icon: React.ElementType; bg: string }> = {
  aiml:   { label: "AI / ML",       color: "#7F77DD", icon: Brain,  bg: "bg-[#7F77DD]/10" },
  webdev: { label: "Web Dev",        color: "#378ADD", icon: Globe,  bg: "bg-[#378ADD]/10" },
  devops: { label: "DevOps & Cloud", color: "#1D9E75", icon: Server, bg: "bg-[#1D9E75]/10" },
};

/* ─────────────── BRIDGE CONNECTIONS ─────────────── */
// Each connection is rendered as its own ROW: [Phase A] ——⚡——→ [Phase B]
const CONNECTIONS = [
  {
    id: "c1",
    num: "01",
    label: "FastAPI meets REST",
    tagline: "ML models talk to web apps via REST APIs",
    color: "#7F77DD",
    from: { path: "aiml"   as PathKey, phase: "Phase 2", title: "FastAPI Deployment",     desc: "Expose your trained ML model as a JSON API endpoint using Python FastAPI." },
    to:   { path: "webdev" as PathKey, phase: "Phase 3", title: "REST APIs (Node/Express)", desc: "Consume any JSON API using fetch() or axios from your frontend or backend." },
    why: "When you train an ML model in Python, you don't show it directly to users — you wrap it in a FastAPI server. Your React/Next.js frontend (Web Dev skill) then calls that API. The same fetch() pattern you learn in Web Dev Phase 3 is used to talk to your AI model.",
    example: `// ── STEP 1: AI/ML Engineer writes (FastAPI - Python) ──
from fastapi import FastAPI
app = FastAPI()

@app.post("/predict")
def predict(data: dict):
    result = model.predict([data["input"]])
    return { "prediction": float(result[0]) }

# ── STEP 2: Web Dev Engineer calls it (JavaScript) ──
const response = await fetch("http://localhost:8000/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ input: [1.2, 3.4, 0.8] })
});
const { prediction } = await response.json();
console.log("Model says:", prediction); // 0.94`,
    learnFirst: "aiml" as PathKey,
    thenApply:  "webdev" as PathKey,
  },
  {
    id: "c2",
    num: "02",
    label: "Docker Handoff",
    tagline: "One Dockerfile, two career paths",
    color: "#378ADD",
    from: { path: "webdev" as PathKey, phase: "Phase 4", title: "Docker Basics",             desc: "Write Dockerfiles to containerize your Node.js app for consistent environments." },
    to:   { path: "devops" as PathKey, phase: "Phase 2", title: "Container Orchestration",   desc: "Take containers and scale them to thousands of users using Kubernetes clusters." },
    why: "Web Developers write Dockerfiles to package their apps. DevOps engineers take those exact same Docker images and orchestrate them — load balancing, auto-scaling, health checks. Learning Docker in Web Dev Phase 4 directly prepares you for DevOps Phase 2 Kubernetes work. Same technology, bigger scale.",
    example: `# ── Web Dev writes this (Phase 4) ──
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]

# ── DevOps takes it further (Phase 2) ──
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 5          # Scale to 5 containers automatically
  selector:
    matchLabels:
      app: web-app
  template:
    spec:
      containers:
      - name: web-app
        image: myapp:latest   # The SAME Docker image from Web Dev
        ports:
        - containerPort: 3000`,
    learnFirst: "webdev" as PathKey,
    thenApply:  "devops" as PathKey,
  },
  {
    id: "c3",
    num: "03",
    label: "MLOps = DevOps",
    tagline: "Same tools, different workloads",
    color: "#1D9E75",
    from: { path: "aiml"   as PathKey, phase: "Phase 3", title: "MLOps & Monitoring",      desc: "Monitor ML models in production: track drift, versions, and cloud GPU usage." },
    to:   { path: "devops" as PathKey, phase: "Phase 3–4", title: "Cloud Infrastructure",  desc: "Deploy and monitor cloud infra using Terraform, Prometheus, and Grafana." },
    why: "MLOps (ML in production) and DevOps share ~70% of the same toolchain. Terraform deploys GPU clusters OR web servers. Prometheus tracks model accuracy drift OR API response time. Grafana visualizes ML training curves OR SRE dashboards. If you learn one path, you get a massive head start in the other.",
    example: `# ── Both MLOps AND DevOps use Terraform ──
# AI/ML: Deploy a GPU training cluster
resource "aws_instance" "gpu_trainer" {
  instance_type = "p3.2xlarge"
  ami           = "ami-deeplearning"
}

# DevOps: Deploy a web server cluster
resource "aws_instance" "web_server" {
  instance_type = "t3.medium"
  ami           = "ami-ubuntu-22"
}

# ── Both use Prometheus + Grafana ──
# AI/ML monitors: model accuracy, prediction latency, data drift
# DevOps monitors: CPU usage, API response time, error rate
# Same dashboard, different metrics!`,
    learnFirst: "aiml"   as PathKey,
    thenApply:  "devops" as PathKey,
  },
];

/* ─────────────── WORKED EXAMPLE ─────────────── */
const EXAMPLE_STEPS = [
  {
    num: "01", path: "aiml" as PathKey,   phase: "AI/ML Phase 1–2",
    what: "Train & Serve the Model",
    how: "Train a CNN image classifier in Python (TensorFlow/PyTorch). Wrap it in a FastAPI server at POST /classify — accepts an image URL, returns { label, confidence }.",
    tools: ["Python", "TensorFlow", "FastAPI"],
  },
  {
    num: "02", path: "webdev" as PathKey, phase: "Web Dev Phase 3",
    what: "Build the API Consumer",
    how: "Your React dashboard uses fetch() (Web Dev skill) to POST image URLs to your FastAPI model. Add Express middleware for rate limiting so free users can't spam the endpoint.",
    tools: ["React", "fetch()", "Express.js"],
  },
  {
    num: "03", path: "webdev" as PathKey, phase: "Web Dev Phase 4",
    what: "Containerize Everything",
    how: "Write a Dockerfile for the FastAPI model server + another for the Node.js API. Use docker-compose.yml to run both locally with one command: docker compose up.",
    tools: ["Docker", "docker-compose"],
  },
  {
    num: "04", path: "devops" as PathKey, phase: "DevOps Phase 2",
    what: "Scale with Kubernetes",
    how: "Push Docker images to ECR (AWS). Deploy to Kubernetes — HorizontalPodAutoscaler scales the model server from 2 → 20 replicas when image uploads spike during a sale.",
    tools: ["Kubernetes", "AWS ECR", "HPA"],
  },
  {
    num: "05", path: "aiml" as PathKey,   phase: "AI/ML Phase 3 (MLOps)",
    what: "Monitor in Production",
    how: "MLflow tracks model versions (v1.0, v1.1, v1.2). Prometheus (DevOps tool) tracks prediction latency AND model accuracy. Grafana shows one dashboard for everything.",
    tools: ["MLflow", "Prometheus", "Grafana"],
  },
];

const SKILL_TABLE = [
  { skill: "Git & GitHub",        aiml: true,  webdev: true,  devops: true  },
  { skill: "Docker",              aiml: true,  webdev: true,  devops: true  },
  { skill: "Linux / Bash",        aiml: true,  webdev: false, devops: true  },
  { skill: "REST APIs",           aiml: true,  webdev: true,  devops: false },
  { skill: "SQL / Databases",     aiml: true,  webdev: true,  devops: false },
  { skill: "Python scripting",    aiml: true,  webdev: false, devops: true  },
  { skill: "CI/CD Pipelines",     aiml: false, webdev: true,  devops: true  },
  { skill: "Kubernetes",          aiml: true,  webdev: false, devops: true  },
  { skill: "Terraform / IaC",     aiml: true,  webdev: false, devops: true  },
  { skill: "Prometheus + Grafana",aiml: true,  webdev: false, devops: true  },
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function InterconnectionMap() {
  const [openConnection, setOpenConnection] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="space-y-10 select-none">

      {/* ── Header ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-2xl">
          <Link2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Cross-Roadmap Skill Bridges</h2>
        <p className="text-sm text-muted-foreground font-semibold max-w-xl mx-auto leading-relaxed">
          AI/ML, Web Dev, and DevOps are <strong className="text-foreground">not separate silos</strong> — they share real tools. Each bridge below shows exactly <em>which phase</em> from one path feeds into <em>which phase</em> of another.
        </p>
      </div>

      {/* ── Universal Foundation ── */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="w-full max-w-md mx-auto p-4 rounded-2xl border-2 border-dashed border-slate-400/60 bg-slate-500/5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="font-black text-sm text-foreground">🌐 Git / GitHub — Universal Starting Point</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold">Every path starts here. Learn Git <em>before</em> any of the three paths.</p>
          <div className="flex justify-center gap-2 pt-1">
            {(["aiml","webdev","devops"] as PathKey[]).map(k => {
              const m = PATHS[k]; const Icon = m.icon;
              return (
                <span key={k} className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full border"
                  style={{ color: m.color, borderColor: `${m.color}35`, backgroundColor: `${m.color}10` }}>
                  <Icon className="h-2.5 w-2.5" />{m.label}
                </span>
              );
            })}
          </div>
        </div>
        {/* Down arrows to three paths */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
          {(["aiml","webdev","devops"] as PathKey[]).map(k => {
            const m = PATHS[k];
            return (
              <div key={k} className="flex flex-col items-center gap-1">
                <ArrowDown className="h-4 w-4" style={{ color: m.color }} />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: m.color }}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Connection Flows — ONE ROW PER BRIDGE ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">3 Skill Bridge Points</h3>
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-[10px] text-muted-foreground font-bold">Click any bridge to expand</span>
        </div>

        {CONNECTIONS.map((conn) => {
          const isOpen    = openConnection === conn.id;
          const FromIcon  = PATHS[conn.from.path].icon;
          const ToIcon    = PATHS[conn.to.path].icon;
          const fromColor = PATHS[conn.from.path].color;
          const toColor   = PATHS[conn.to.path].color;

          return (
            <div key={conn.id} className="rounded-3xl border-2 overflow-hidden transition-all duration-200"
              style={{ borderColor: isOpen ? conn.color : `${conn.color}25` }}>

              {/* ── Connection Row (always visible) ── */}
              <button
                onClick={() => setOpenConnection(isOpen ? null : conn.id)}
                className="w-full p-4 sm:p-5 cursor-pointer"
                style={{ backgroundColor: isOpen ? `${conn.color}08` : undefined }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                    style={{ color: conn.color, backgroundColor: `${conn.color}15` }}>
                    Bridge {conn.num}
                  </span>
                  <span className="font-black text-sm text-foreground">{conn.label}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold hidden sm:block">— {conn.tagline}</span>
                  <span className="ml-auto text-[10px] font-black text-muted-foreground">{isOpen ? "▲ Hide" : "▼ Details"}</span>
                </div>

                {/* Visual flow: FROM card → arrow → TO card */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* FROM Phase Card */}
                  <div className="flex-1 p-3 sm:p-4 rounded-2xl border-2 text-left space-y-1.5"
                    style={{ borderColor: `${fromColor}40`, backgroundColor: `${fromColor}08` }}>
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-lg" style={{ backgroundColor: `${fromColor}20` }}>
                        <FromIcon className="h-3 w-3" style={{ color: fromColor }} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: fromColor }}>
                        {PATHS[conn.from.path].label}
                      </span>
                    </div>
                    <div className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ color: fromColor, backgroundColor: `${fromColor}15` }}>
                      {conn.from.phase}
                    </div>
                    <h4 className="text-xs font-black text-foreground leading-tight">{conn.from.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed hidden sm:block">{conn.from.desc}</p>
                  </div>

                  {/* Arrow + bridge label */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="text-[8px] font-black text-center px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{ color: conn.color, backgroundColor: `${conn.color}15` }}>
                      ⚡ uses
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="h-0.5 w-8 sm:w-14 rounded-full" style={{ backgroundColor: conn.color }} />
                      <ArrowRight className="h-4 w-4 shrink-0" style={{ color: conn.color }} />
                    </div>
                    <div className="text-[8px] font-black text-center px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{ color: conn.color, backgroundColor: `${conn.color}15` }}>
                      same skill
                    </div>
                  </div>

                  {/* TO Phase Card */}
                  <div className="flex-1 p-3 sm:p-4 rounded-2xl border-2 text-left space-y-1.5"
                    style={{ borderColor: `${toColor}40`, backgroundColor: `${toColor}08` }}>
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-lg" style={{ backgroundColor: `${toColor}20` }}>
                        <ToIcon className="h-3 w-3" style={{ color: toColor }} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: toColor }}>
                        {PATHS[conn.to.path].label}
                      </span>
                    </div>
                    <div className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ color: toColor, backgroundColor: `${toColor}15` }}>
                      {conn.to.phase}
                    </div>
                    <h4 className="text-xs font-black text-foreground leading-tight">{conn.to.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed hidden sm:block">{conn.to.desc}</p>
                  </div>
                </div>
              </button>

              {/* ── Expanded Detail ── */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/40 p-5 sm:p-6 grid sm:grid-cols-2 gap-6"
                      style={{ backgroundColor: `${conn.color}05` }}>

                      {/* Why it matters */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 shrink-0" style={{ color: conn.color }} />
                          <h4 className="text-[10px] font-black uppercase tracking-wider" style={{ color: conn.color }}>
                            Why This Matters
                          </h4>
                        </div>
                        <p className="text-sm font-semibold text-foreground leading-relaxed">{conn.why}</p>

                        <div className="p-3 rounded-xl border border-border/40 bg-muted/30 space-y-1.5">
                          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Learning Flow</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {[conn.learnFirst, conn.thenApply].map((pk, i) => {
                              const m = PATHS[pk]; const Icon = m.icon;
                              return (
                                <React.Fragment key={pk}>
                                  {i === 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
                                    style={{ color: m.color, backgroundColor: `${m.color}15` }}>
                                    <Icon className="h-3 w-3" />
                                    {i === 0 ? "Learn first:" : "Then apply in:"} {m.label}
                                  </span>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Code example */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                            Real Code — Both Skills Together
                          </h4>
                        </div>
                        <pre className="p-4 bg-[#0d0f14] text-[#c8cdd8] rounded-2xl overflow-x-auto text-[10px] font-mono leading-relaxed border border-border/30 whitespace-pre">
                          <code>{conn.example}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Skill Overlap Quick Table ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Shared Skill Reference</h3>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <p className="text-[11px] text-muted-foreground font-semibold">
          Skills marked ✓ appear in that career path — overlap means you only learn it once but use it everywhere.
        </p>
        <div className="rounded-2xl border border-border/60 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left p-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground w-[40%]">Tool / Skill</th>
                {(["aiml","webdev","devops"] as PathKey[]).map(k => {
                  const m = PATHS[k]; const Icon = m.icon;
                  return (
                    <th key={k} className="p-3 text-center text-[10px] font-black uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1">
                        <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                        <span style={{ color: m.color }}>{m.label}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {SKILL_TABLE.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-bold text-foreground text-xs">{row.skill}</td>
                  {([row.aiml, row.webdev, row.devops]).map((has, ci) => {
                    const colors = ["#7F77DD","#378ADD","#1D9E75"];
                    return (
                      <td key={ci} className="p-3 text-center">
                        {has
                          ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-black"
                              style={{ backgroundColor: colors[ci] }}>✓</span>
                          : <span className="text-muted-foreground/30 text-base">—</span>
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Complete Worked Example ── */}
      <div className="rounded-3xl border-2 border-brand-500/25 overflow-hidden">
        {/* Toggle header */}
        <button
          onClick={() => setShowExample(!showExample)}
          className="w-full p-5 sm:p-6 flex items-center gap-4 cursor-pointer group text-left"
          style={{ background: showExample ? "linear-gradient(to right, #7F77DD10, #378ADD10, #1D9E7510)" : undefined }}
        >
          <div className="p-3 rounded-2xl bg-brand-500/10 shrink-0">
            <Lightbulb className="h-6 w-6 text-brand-500" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-500 mb-0.5">Complete Worked Example</div>
            <h3 className="text-base sm:text-lg font-black text-foreground">
              Building a Real AI Product Using All 3 Roadmaps
            </h3>
            <p className="text-[11px] text-muted-foreground font-semibold mt-1">
              Fake product image detector for an e-commerce startup — step by step.
            </p>
          </div>
          <div className="shrink-0 p-2 rounded-xl bg-muted group-hover:bg-muted/70 transition-colors">
            {showExample
              ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
              : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {showExample && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/40 p-5 sm:p-8 space-y-8 bg-gradient-to-br from-card via-card to-muted/10">

                {/* Scenario */}
                <div className="p-4 rounded-2xl border border-border/40 bg-muted/30 flex gap-3">
                  <Rocket className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-brand-500 mb-1">The Scenario</p>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      You&apos;re building <strong>FakeShield</strong> — a startup that scans product images on e-commerce sites and uses AI to detect counterfeits. You need an ML model, a REST API, a web dashboard, Docker containers, Kubernetes scaling, and production monitoring. Here&apos;s how each roadmap contributes:
                    </p>
                  </div>
                </div>

                {/* Steps timeline */}
                <div className="space-y-0">
                  {EXAMPLE_STEPS.map((step, i) => {
                    const meta   = PATHS[step.path];
                    const Icon   = meta.icon;
                    const isLast = i === EXAMPLE_STEPS.length - 1;
                    return (
                      <div key={i} className="relative flex gap-5">
                        {/* Left: step number + vertical line */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white z-10 shrink-0"
                            style={{ backgroundColor: meta.color }}>
                            {step.num}
                          </div>
                          {!isLast && <div className="flex-1 w-0.5 my-1 rounded-full bg-border/60" style={{ minHeight: "32px" }} />}
                        </div>

                        {/* Right: content */}
                        <div className={`flex-1 pb-8 ${isLast ? "pb-2" : ""}`}>
                          <div className="p-4 rounded-2xl border-2 space-y-3"
                            style={{ borderColor: `${meta.color}25`, backgroundColor: `${meta.color}06` }}>

                            {/* Header */}
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${meta.color}20` }}>
                                  <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                                </div>
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: meta.color }}>
                                    {meta.label} · {step.phase}
                                  </span>
                                  <h4 className="text-sm font-black text-foreground">{step.what}</h4>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {step.tools.map(t => (
                                  <span key={t} className="text-[9px] font-black px-2 py-0.5 rounded-md border"
                                    style={{ color: meta.color, borderColor: `${meta.color}30`, backgroundColor: `${meta.color}10` }}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Detail */}
                            <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                              <CornerDownRight className="h-3 w-3 inline mr-1 opacity-40" />
                              {step.how}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Key insight */}
                <div className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">The Big Insight</p>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      You didn&apos;t need 3 separate engineers. One engineer who learns all 3 roadmaps (even partially) can ship this entire product. The skill overlaps aren&apos;t redundant — they <strong>multiply your value</strong>. Docker learned in Web Dev → saves 80% of learning time in DevOps. Prometheus learned in DevOps → is already in your MLOps toolkit.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { label: "40% faster DevOps if you know Docker from Web Dev", color: "#378ADD" },
                        { label: "70% MLOps tools overlap with DevOps", color: "#1D9E75" },
                        { label: "REST APIs link AI models to any frontend", color: "#7F77DD" },
                      ].map((tip, i) => (
                        <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                          style={{ color: tip.color, borderColor: `${tip.color}30`, backgroundColor: `${tip.color}08` }}>
                          <Star className="h-2.5 w-2.5 inline mr-1" />
                          {tip.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Start CTA */}
                <div className="grid sm:grid-cols-3 gap-3">
                  {(["aiml","webdev","devops"] as PathKey[]).map(k => {
                    const m = PATHS[k]; const Icon = m.icon;
                    return (
                      <a key={k} href={`/student-hub/roadmaps/${k}`}
                        className="flex items-center gap-3 p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] group cursor-pointer"
                        style={{ borderColor: `${m.color}25`, backgroundColor: `${m.color}06` }}>
                        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${m.color}20` }}>
                          <Icon className="h-5 w-5" style={{ color: m.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: m.color }}>Start Learning</p>
                          <p className="text-xs font-black text-foreground">{m.label}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
                          style={{ color: m.color }} />
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
