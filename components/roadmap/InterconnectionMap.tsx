"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { GitBranch, Terminal, Zap, ArrowRight, Brain, Globe, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConnectionCoords {
  x1: number; y1: number;
  x2: number; y2: number;
  label: string;
  color: string;
  fromId: string;
  toId: string;
}

interface NodeDef {
  id: string;
  phase: string;
  title: string;
  desc: string;
  path: "aiml" | "webdev" | "devops";
}

const NODES: NodeDef[] = [
  // AI / ML
  { id: "inter-aiml-0",   phase: "Phase 0", title: "Python & Datasets",   desc: "Python scripting, NumPy arrays, SQL for dataset loading.", path: "aiml" },
  { id: "inter-aiml-2",   phase: "Phase 2", title: "FastAPI Deployment",   desc: "Serialize ML weights, expose prediction endpoints via FastAPI.", path: "aiml" },
  { id: "inter-aiml-3",   phase: "Phase 3", title: "MLOps & Monitoring",   desc: "Docker packaging, MLflow versioning, cloud drift monitoring.", path: "aiml" },
  // Web Dev
  { id: "inter-webdev-0", phase: "Phase 0", title: "HTML & CSS Layouts",   desc: "DOM rendering, forms, responsive grids, CSS Flexbox.", path: "webdev" },
  { id: "inter-webdev-3", phase: "Phase 3", title: "REST APIs (Node)",     desc: "Express controllers, routing, JWT auth, database setups.", path: "webdev" },
  { id: "inter-webdev-4", phase: "Phase 4", title: "Docker Basics",        desc: "Multi-stage Dockerfiles, container networking, compose.", path: "webdev" },
  // DevOps
  { id: "inter-devops-1", phase: "Phase 1", title: "CI/CD Pipelines",      desc: "GitHub Actions workflows: lint, test, build, deploy stages.", path: "devops" },
  { id: "inter-devops-2", phase: "Phase 2", title: "Container Orchestration", desc: "Docker image builds, Kubernetes clusters, Minikube.", path: "devops" },
  { id: "inter-devops-34", phase: "Phase 3–4", title: "Cloud Infrastructure", desc: "AWS VPC, Terraform IaC, Prometheus + Grafana SRE metrics.", path: "devops" },
];

const PATH_META = {
  aiml:   { label: "AI / ML Career Path",     color: "#7F77DD", icon: Brain,  bg: "bg-[#7F77DD]/10", border: "border-[#7F77DD]/25", text: "text-[#7F77DD]" },
  webdev: { label: "Web Developer Path",       color: "#378ADD", icon: Globe,  bg: "bg-[#378ADD]/10", border: "border-[#378ADD]/25", text: "text-[#378ADD]" },
  devops: { label: "DevOps & Cloud Path",      color: "#1D9E75", icon: Server, bg: "bg-[#1D9E75]/10", border: "border-[#1D9E75]/25", text: "text-[#1D9E75]" },
};

const CONNECTIONS = [
  { fromId: "inter-aiml-2",  toId: "inter-webdev-3", label: "FastAPI meets REST", color: "#7F77DD", desc: "AI models are consumed via REST API endpoints built in Node/Express" },
  { fromId: "inter-webdev-4", toId: "inter-devops-2", label: "Docker handoff",    color: "#378ADD", desc: "Dockerfiles written by web devs are deployed & orchestrated by DevOps" },
  { fromId: "inter-aiml-3",  toId: "inter-devops-34", label: "MLOps = DevOps",   color: "#1D9E75", desc: "ML monitoring on cloud uses same Terraform + Prometheus stack as SRE" },
];

function useNodePositions(
  containerRef: React.RefObject<HTMLDivElement | null>,
  mounted: boolean,
  deps: any[]
) {
  const [coords, setCoords] = useState<ConnectionCoords[]>([]);

  const recalculate = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const getCenter = (id: string, side: "left" | "right" | "top") => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (side === "right") return { x: r.right - rect.left, y: r.top - rect.top + r.height / 2 };
      if (side === "left")  return { x: r.left - rect.left,  y: r.top - rect.top + r.height / 2 };
      return { x: r.left - rect.left + r.width / 2, y: r.top - rect.top };
    };

    const result: ConnectionCoords[] = [];

    CONNECTIONS.forEach(({ fromId, toId, label, color }) => {
      const from = getCenter(fromId, "right");
      const to   = getCenter(toId,   "left");
      if (from && to) result.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, label, color, fromId, toId });
    });

    // Git universal connectors
    const git  = getCenter("inter-git", "top");
    const ai0  = getCenter("inter-aiml-0",   "top");
    const web0 = getCenter("inter-webdev-0", "top");
    const do1  = getCenter("inter-devops-1", "top");

    if (git) {
      if (ai0)  result.push({ x1: ai0.x,  y1: ai0.y,  x2: git.x - 30, y2: git.y + 12, label: "Git Base", color: "#64748B", fromId: "inter-aiml-0",   toId: "inter-git" });
      if (web0) result.push({ x1: web0.x, y1: web0.y, x2: git.x,       y2: git.y + 12, label: "Git Base", color: "#64748B", fromId: "inter-webdev-0", toId: "inter-git" });
      if (do1)  result.push({ x1: do1.x,  y1: do1.y,  x2: git.x + 30, y2: git.y + 12, label: "Git Base", color: "#64748B", fromId: "inter-devops-1", toId: "inter-git" });
    }

    setCoords(result);
  }, deps);

  useEffect(() => {
    if (!mounted) return;
    recalculate();
    const timer = setTimeout(recalculate, 250);
    window.addEventListener("resize", recalculate);
    return () => { clearTimeout(timer); window.removeEventListener("resize", recalculate); };
  }, [mounted, recalculate]);

  return coords;
}

export default function InterconnectionMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeConnection, setActiveConnection] = useState<(typeof CONNECTIONS)[0] | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const connections = useNodePositions(containerRef, mounted, [mounted]);

  const isHighlighted = (nodeId: string) => {
    if (!hoveredNode) return true;
    if (nodeId === hoveredNode) return true;
    // Check if connected
    return CONNECTIONS.some(c => (c.fromId === hoveredNode && c.toId === nodeId) || (c.toId === hoveredNode && c.fromId === nodeId));
  };

  const isConnLineHighlighted = (conn: ConnectionCoords) => {
    if (!hoveredNode) return true;
    return conn.fromId === hoveredNode || conn.toId === hoveredNode;
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl">
          <GitBranch className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Cross-Roadmap Interconnections</h2>
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          Hover over any card to see how topics across AI/ML, Web Dev, and DevOps are directly linked.
          <br />The arrows show real industry skill overlaps.
        </p>
      </div>

      {/* Path Legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {(Object.entries(PATH_META) as [keyof typeof PATH_META, typeof PATH_META["aiml"]][]).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={key} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.bg} ${meta.border} ${meta.text}`}>
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </div>
          );
        })}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-slate-500/5 border-slate-500/20 text-slate-400">
          <Terminal className="h-3.5 w-3.5" />
          Universal Foundation
        </div>
      </div>

      {/* Connection Tooltip */}
      <AnimatePresence>
        {activeConnection && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mx-auto max-w-sm text-center px-4 py-3 rounded-2xl border text-xs font-bold"
            style={{ background: `${activeConnection.color}10`, borderColor: `${activeConnection.color}30`, color: activeConnection.color }}
          >
            <span className="font-black text-sm">⚡ {activeConnection.label}</span>
            <p className="text-[11px] font-semibold mt-1 opacity-80" style={{ color: "inherit" }}>{activeConnection.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main map container */}
      <div
        ref={containerRef}
        className="relative border border-border/60 rounded-3xl p-6 sm:p-8 bg-card/30 backdrop-blur-sm overflow-visible shadow-sm"
      >
        {/* SVG Lines */}
        {mounted && (
          <svg className="absolute inset-0 pointer-events-none z-0 overflow-visible w-full h-full">
            <defs>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Animated gradient for each connection */}
              {CONNECTIONS.map((c, i) => (
                <linearGradient key={i} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={c.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={c.color} stopOpacity="0.5" />
                </linearGradient>
              ))}
            </defs>

            {connections.map((conn, idx) => {
              const isGit = conn.label === "Git Base";
              const dx = Math.abs(conn.x2 - conn.x1);
              const cx1 = conn.x1 + dx * 0.45;
              const cx2 = conn.x2 - dx * 0.45;
              const pathD = `M ${conn.x1} ${conn.y1} C ${cx1} ${conn.y1}, ${cx2} ${conn.y2}, ${conn.x2} ${conn.y2}`;
              const hl = isConnLineHighlighted(conn);
              const connIdx = CONNECTIONS.findIndex(c => c.fromId === conn.fromId && c.toId === conn.toId);

              return (
                <g key={idx} style={{ opacity: hl ? 1 : 0.15, transition: "opacity 0.3s" }}>
                  {/* Glow layer */}
                  {!isGit && (
                    <path
                      d={pathD} fill="none"
                      stroke={conn.color} strokeWidth={8} strokeOpacity={0.1}
                      filter="url(#glow)"
                    />
                  )}
                  {/* Main line */}
                  <path
                    d={pathD} fill="none"
                    stroke={isGit ? "#64748B" : `url(#grad-${connIdx})`}
                    strokeWidth={isGit ? 1.5 : 2.5}
                    strokeDasharray={isGit ? "5 4" : undefined}
                    strokeOpacity={isGit ? 0.4 : 0.85}
                    strokeLinecap="round"
                  />
                  {/* Animated travel dot on non-git lines */}
                  {!isGit && hl && (
                    <circle r={4} fill={conn.color} filter="url(#glow)">
                      <animateMotion path={pathD} dur={`${3 + idx * 0.5}s`} repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Arrowhead at end */}
                  {!isGit && (
                    <circle
                      cx={conn.x2} cy={conn.y2} r={3.5}
                      fill={conn.color} fillOpacity={0.9}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* 3-Column Grid */}
        <div className="relative z-10 grid md:grid-cols-3 gap-8 text-left items-stretch">

          {/* ── Column 1: AI / ML ── */}
          <div className="space-y-4 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#7F77DD] text-center pb-2 border-b border-[#7F77DD]/20 flex items-center justify-center gap-1.5">
              <Brain className="h-3.5 w-3.5" /> AI / ML Career Path
            </h3>
            {NODES.filter(n => n.path === "aiml").map(node => (
              <NodeCard
                key={node.id}
                node={node}
                highlighted={isHighlighted(node.id)}
                active={hoveredNode === node.id}
                onEnter={() => setHoveredNode(node.id)}
                onLeave={() => setHoveredNode(null)}
                connections={CONNECTIONS.filter(c => c.fromId === node.id || c.toId === node.id)}
                onConnectionClick={setActiveConnection}
              />
            ))}
          </div>

          {/* ── Column 2: Web Dev + Git ── */}
          <div className="space-y-4 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#378ADD] text-center pb-2 border-b border-[#378ADD]/20 flex items-center justify-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Web Developer Path
            </h3>

            {/* Universal Git node (top center) */}
            <div
              id="inter-git"
              className="p-3.5 rounded-2xl border-2 border-dashed border-slate-400/60 bg-slate-500/5 hover:border-slate-400 text-center transition-all shadow-xs space-y-1 cursor-default"
            >
              <h4 className="text-xs font-black text-foreground flex items-center justify-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-slate-400" />
                Universal: Git / GitHub
              </h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Version control used across all three career paths.
              </p>
              <div className="flex justify-center gap-1 mt-1.5 flex-wrap">
                {["AI/ML", "Web Dev", "DevOps"].map(t => (
                  <span key={t} className="text-[9px] font-black bg-slate-500/10 text-slate-400 border border-slate-500/15 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>

            {NODES.filter(n => n.path === "webdev").map(node => (
              <NodeCard
                key={node.id}
                node={node}
                highlighted={isHighlighted(node.id)}
                active={hoveredNode === node.id}
                onEnter={() => setHoveredNode(node.id)}
                onLeave={() => setHoveredNode(null)}
                connections={CONNECTIONS.filter(c => c.fromId === node.id || c.toId === node.id)}
                onConnectionClick={setActiveConnection}
              />
            ))}
          </div>

          {/* ── Column 3: DevOps ── */}
          <div className="space-y-4 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1D9E75] text-center pb-2 border-b border-[#1D9E75]/20 flex items-center justify-center gap-1.5">
              <Server className="h-3.5 w-3.5" /> DevOps &amp; Cloud Path
            </h3>
            {NODES.filter(n => n.path === "devops").map(node => (
              <NodeCard
                key={node.id}
                node={node}
                highlighted={isHighlighted(node.id)}
                active={hoveredNode === node.id}
                onEnter={() => setHoveredNode(node.id)}
                onLeave={() => setHoveredNode(null)}
                connections={CONNECTIONS.filter(c => c.fromId === node.id || c.toId === node.id)}
                onConnectionClick={setActiveConnection}
              />
            ))}
          </div>
        </div>

        {/* Connection Badges Legend Row */}
        <div className="relative z-10 mt-8 pt-6 border-t border-border/40">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center mb-3">Skill Bridge Points</p>
          <div className="flex flex-wrap justify-center gap-3">
            {CONNECTIONS.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveConnection(activeConnection?.label === c.label ? null : c)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black border transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: `${c.color}12`,
                  borderColor: `${c.color}35`,
                  color: c.color,
                  boxShadow: activeConnection?.label === c.label ? `0 0 12px ${c.color}40` : undefined,
                }}
              >
                <Zap className="h-3 w-3" />
                {c.label}
                <ArrowRight className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Single Phase Card Component ── */
function NodeCard({
  node, highlighted, active, onEnter, onLeave, connections, onConnectionClick
}: {
  node: NodeDef;
  highlighted: boolean;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  connections: typeof CONNECTIONS;
  onConnectionClick: (c: typeof CONNECTIONS[0]) => void;
}) {
  const meta = PATH_META[node.path];
  const Icon = meta.icon;

  return (
    <motion.div
      id={node.id}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      animate={{
        opacity: highlighted ? 1 : 0.35,
        scale: active ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-2xl border-2 bg-card shadow-sm space-y-2 cursor-default transition-colors duration-200 ${
        active
          ? `${meta.border} shadow-md`
          : "border-border/60 hover:border-border"
      }`}
      style={active ? { boxShadow: `0 4px 24px ${meta.color}20` } : {}}
    >
      {/* Phase badge + Title */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg ${meta.bg} ${meta.text} shrink-0`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <span className={`text-[9px] font-black uppercase tracking-wider ${meta.text}`}>{node.phase}</span>
            <h4 className="text-xs font-black text-foreground leading-tight truncate">{node.title}</h4>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">{node.desc}</p>

      {/* Connected-to pills (shown only on hover) */}
      <AnimatePresence>
        {active && connections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 pt-1 overflow-hidden"
          >
            {connections.map((conn, i) => (
              <button
                key={i}
                onClick={() => onConnectionClick(conn)}
                className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border cursor-pointer hover:scale-105 transition-transform"
                style={{ background: `${conn.color}12`, borderColor: `${conn.color}30`, color: conn.color }}
              >
                <Zap className="h-2.5 w-2.5" />
                {conn.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
