"use client";

import React, { useRef, useState, useEffect } from "react";
import { Zap, GitBranch, Terminal, ShieldAlert } from "lucide-react";

interface ConnectionCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  color: string;
}

export default function InterconnectionMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<ConnectionCoords[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateConnections = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const getCenterCoord = (id: string, side: "left" | "right" | "top" | "bottom") => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();

      let x = rect.left - containerRect.left;
      let y = rect.top - containerRect.top;

      if (side === "left") {
        y += rect.height / 2;
      } else if (side === "right") {
        x += rect.width;
        y += rect.height / 2;
      } else if (side === "top") {
        x += rect.width / 2;
      } else if (side === "bottom") {
        x += rect.width / 2;
        y += rect.height;
      }

      return { x, y };
    };

    const newConnections: ConnectionCoords[] = [];

    // Connection 1: AI/ML Phase 2 (FastAPI) <-> Web Dev Phase 3 (REST APIs)
    const pA2 = getCenterCoord("inter-aiml-2", "right");
    const pW3 = getCenterCoord("inter-webdev-3", "left");
    if (pA2 && pW3) {
      newConnections.push({
        x1: pA2.x,
        y1: pA2.y,
        x2: pW3.x,
        y2: pW3.y,
        label: "FastAPI Deployments",
        color: "#7F77DD" // Purple
      });
    }

    // Connection 2: Web Dev Phase 4 (Docker) <-> DevOps Phase 2 (Containers)
    const pW4 = getCenterCoord("inter-webdev-4", "right");
    const pD2 = getCenterCoord("inter-devops-2", "left");
    if (pW4 && pD2) {
      newConnections.push({
        x1: pW4.x,
        y1: pW4.y,
        x2: pD2.x,
        y2: pD2.y,
        label: "Docker Foundations",
        color: "#378ADD" // Blue
      });
    }

    // Connection 3: AI/ML Phase 3 (MLOps) <-> DevOps Phase 3-4 (Cloud + Observability)
    const pA3 = getCenterCoord("inter-aiml-3", "right");
    const pD34 = getCenterCoord("inter-devops-34", "left");
    if (pA3 && pD34) {
      newConnections.push({
        x1: pA3.x,
        y1: pA3.y,
        x2: pD34.x,
        y2: pD34.y,
        label: "MLOps & Cloud Infrastructure",
        color: "#1D9E75" // Teal
      });
    }

    // Connection 4: All Roadmaps <-> Git / GitHub
    const pGit = getCenterCoord("inter-git", "top");
    const pA1 = getCenterCoord("inter-aiml-0", "top");
    const pW1 = getCenterCoord("inter-webdev-0", "top");
    const pD1 = getCenterCoord("inter-devops-1", "top");

    if (pGit) {
      if (pA1) {
        newConnections.push({ x1: pA1.x, y1: pA1.y, x2: pGit.x - 40, y2: pGit.y + 20, label: "Git Base", color: "#64748B" });
      }
      if (pW1) {
        newConnections.push({ x1: pW1.x, y1: pW1.y, x2: pGit.x, y2: pGit.y + 20, label: "Git Base", color: "#64748B" });
      }
      if (pD1) {
        newConnections.push({ x1: pD1.x, y1: pD1.y, x2: pGit.x + 40, y2: pGit.y + 20, label: "Git Base", color: "#64748B" });
      }
    }

    setConnections(newConnections);
  };

  useEffect(() => {
    if (!mounted) return;

    // Run first calculation
    calculateConnections();

    // Recalculate on resize
    window.addEventListener("resize", calculateConnections);

    // Minor delay to let layout elements render first
    const timer = setTimeout(calculateConnections, 300);

    return () => {
      window.removeEventListener("resize", calculateConnections);
      clearTimeout(timer);
    };
  }, [mounted]);

  return (
    <div className="space-y-6 select-none">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 rounded-full">
          <GitBranch className="h-6 w-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">Cross-Roadmap Interconnections</h2>
        <p className="text-xs text-muted-foreground font-bold leading-relaxed">
          Modern engineering fields overlap continuously. See how topics in one path link directly to milestones in another.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative border border-border/80 rounded-3xl p-6 sm:p-8 bg-card/40 backdrop-blur-md overflow-visible shadow-inner"
      >
        {/* SVG connection lines in the background */}
        {mounted && (
          <svg className="absolute inset-0 pointer-events-none z-0 overflow-visible w-full h-full">
            <defs>
              <linearGradient id="gradient-aiml-web" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7F77DD" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#378ADD" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="gradient-web-devops" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#378ADD" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {connections.map((conn, idx) => {
              // Draw bezier curves instead of straight lines to look premium
              const dx = Math.abs(conn.x2 - conn.x1);
              const cx1 = conn.x1 + dx * 0.4;
              const cx2 = conn.x2 - dx * 0.4;

              return (
                <g key={idx}>
                  {/* Glowing background path */}
                  <path
                    d={`M ${conn.x1} ${conn.y1} C ${cx1} ${conn.y1}, ${cx2} ${conn.y2}, ${conn.x2} ${conn.y2}`}
                    fill="none"
                    stroke={conn.color}
                    strokeWidth={4}
                    strokeOpacity={0.12}
                  />
                  {/* Main solid path */}
                  <path
                    d={`M ${conn.x1} ${conn.y1} C ${cx1} ${conn.y1}, ${cx2} ${conn.y2}, ${conn.x2} ${conn.y2}`}
                    fill="none"
                    stroke={conn.color}
                    strokeWidth={1.5}
                    strokeDasharray={conn.label === "Git Base" ? "4" : undefined}
                    strokeOpacity={0.7}
                  />
                  {/* Tiny moving dot overlay to show pipeline flow */}
                  {conn.label !== "Git Base" && (
                    <circle r={2.5} fill={conn.color}>
                      <animateMotion
                        path={`M ${conn.x1} ${conn.y1} C ${cx1} ${conn.y1}, ${cx2} ${conn.y2}, ${conn.x2} ${conn.y2}`}
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* 3-Column Layout Grid */}
        <div className="relative z-10 grid md:grid-cols-3 gap-6 sm:gap-8 text-left items-stretch">
          {/* Column 1: AI / ML */}
          <div className="space-y-6 flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#7F77DD] text-center border-b border-[#7F77DD]/20 pb-2">
              AI / ML Career Path
            </h3>

            <div
              id="inter-aiml-0"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#7F77DD]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">AI Phase 0 — Foundation</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Python scripting, simple array structures, and loading datasets with SQL.
              </p>
            </div>

            <div
              id="inter-aiml-2"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#7F77DD]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">AI Phase 2 — FastAPI Deploy</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Serializing ML mathematical weights and deploying models via FastAPI endpoints.
              </p>
            </div>

            <div
              id="inter-aiml-3"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#7F77DD]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">AI Phase 3 — MLOps Track</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Docker packaging, MLflow version checks, monitoring concept drifts in cloud.
              </p>
            </div>
          </div>

          {/* Column 2: Web Dev / Git Hub */}
          <div className="space-y-6 flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#378ADD] text-center border-b border-[#378ADD]/20 pb-2">
              Web Developer Path
            </h3>

            {/* Universal Foundation (Center Top) */}
            <div
              id="inter-git"
              className="p-4 rounded-2xl border border-dashed border-slate-400 bg-slate-500/[0.03] hover:border-slate-500/40 text-center transition-all shadow-xs space-y-1"
            >
              <h4 className="text-xs font-black text-foreground flex items-center justify-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" /> Universal: Git / GitHub
              </h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Version control foundation powering developers in all three disciplines.
              </p>
            </div>

            <div
              id="inter-webdev-0"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#378ADD]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">Web Phase 0 — HTML &amp; CSS</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                The visual layout structure: elements rendering, forms validation, responsive grids.
              </p>
            </div>

            <div
              id="inter-webdev-3"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#378ADD]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">Web Phase 3 — REST APIs</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Developing backend express controllers, routing client loads, database setups.
              </p>
            </div>

            <div
              id="inter-webdev-4"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#378ADD]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">Web Phase 4 — Docker Basics</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Writing basic multi-stage Dockerfiles to containerize local servers.
              </p>
            </div>
          </div>

          {/* Column 3: DevOps */}
          <div className="space-y-6 flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#1D9E75] text-center border-b border-[#1D9E75]/20 pb-2">
              DevOps &amp; Cloud Path
            </h3>

            <div
              id="inter-devops-1"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#1D9E75]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">DevOps Phase 1 — CI/CD runs</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Building automated workflows to lint, test, compile code.
              </p>
            </div>

            <div
              id="inter-devops-2"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#1D9E75]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">DevOps Phase 2 — Containers</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Docker image compiles, Kubernetes orchestration, Minikube deployments.
              </p>
            </div>

            <div
              id="inter-devops-34"
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-[#1D9E75]/35 transition-all shadow-sm space-y-1.5"
            >
              <h4 className="text-xs font-black text-foreground">DevOps Phase 3-4 — Infrastructure</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                AWS VPC setups, Terraform IaC, Prometheus &amp; Grafana SRE metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
