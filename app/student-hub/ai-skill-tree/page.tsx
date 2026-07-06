"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  GitFork,
  Trophy,
  Trash2,
  Lock,
  BookOpen,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Check,
  ChevronRight,
  Info,
  Layers,
  Compass,
  Flame,
  Star,
  Zap,
  Brain,
  Target,
  X,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAuth } from "@/hooks/use-auth";

const SUGGESTED_ROLES = [
  { role: "AI & Machine Learning Engineer", icon: "🧠", gradient: "from-violet-600 to-purple-600", bg: "bg-violet-500/10 border-violet-500/20" },
  { role: "Smart Contract Web3 Auditor", icon: "⛓️", gradient: "from-blue-600 to-cyan-600", bg: "bg-blue-500/10 border-blue-500/20" },
  { role: "Fullstack Next.js Developer", icon: "⚡", gradient: "from-amber-500 to-orange-600", bg: "bg-amber-500/10 border-amber-500/20" },
  { role: "Cybersecurity Analyst", icon: "🛡️", gradient: "from-rose-600 to-pink-600", bg: "bg-rose-500/10 border-rose-500/20" },
];

const TIER_CONFIG = {
  Beginner: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", dot: "bg-emerald-400" },
  Intermediate: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/25", dot: "bg-blue-400" },
  Advanced: { color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/25", dot: "bg-violet-400" },
  Expert: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25", dot: "bg-amber-400" },
};

/* ── Custom Node ── */
function SkillNodeCustom({ data }: { data: any }) {
  const isLocked = data.status === "locked";
  const isCompleted = data.status === "completed";
  const tier = data.tier as keyof typeof TIER_CONFIG;
  const tc = TIER_CONFIG[tier] || { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/25", dot: "bg-slate-400" };

  const borderClass = isCompleted
    ? "border-emerald-500/70 shadow-[0_0_18px_rgba(16,185,129,0.20)]"
    : isLocked
    ? "border-white/5 opacity-50"
    : "border-blue-500/60 shadow-[0_0_18px_rgba(59,130,246,0.18)]";

  const bgClass = isCompleted
    ? "bg-emerald-950/25"
    : isLocked
    ? "bg-slate-950/60"
    : "bg-[#080d1f]/80";

  return (
    <div
      className={`min-w-[185px] max-w-[210px] rounded-2xl border-2 backdrop-blur-xl p-3.5 flex flex-col gap-1.5 cursor-pointer select-none transition-all duration-200 hover:scale-[1.04] group relative ${borderClass} ${bgClass}`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0 !w-0 !h-0" id="t-top" />
      <Handle type="target" position={Position.Left} className="opacity-0 !w-0 !h-0" id="t-left" />

      {/* Shimmer overlay on hover */}
      {!isLocked && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Tier Badge */}
      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-[3px] rounded-lg border w-fit font-mono ${tc.color} ${tc.bg}`}>
        {data.tier}
      </span>

      {/* Label + Status */}
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <span className={`text-[11px] font-extrabold leading-tight tracking-wide truncate max-w-[140px] ${isLocked ? "text-slate-600" : "text-white"}`}>
          {data.label}
        </span>
        {isCompleted ? (
          <div className="shrink-0 p-[3px] rounded-full bg-emerald-500/20 border border-emerald-500/40">
            <Check className="h-2.5 w-2.5 text-emerald-400 stroke-[3px]" />
          </div>
        ) : isLocked ? (
          <Lock className="h-3 w-3 text-slate-700 shrink-0" />
        ) : (
          <div className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 !w-0 !h-0" id="s-bottom" />
      <Handle type="source" position={Position.Right} className="opacity-0 !w-0 !h-0" id="s-right" />
    </div>
  );
}

const nodeTypes = { skillNode: SkillNodeCustom };

/* ── Progress Ring ── */
function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="rotate-0 absolute flex flex-col items-center justify-center" style={{ marginLeft: "24px", marginTop: "0" }}>
        {/* inner text via absolute overlay */}
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-black text-white leading-none">{completed}<span className="text-white/30 text-xs font-bold">/{total}</span></span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 font-mono">Skills Mastered</span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AISkillTreeBuilder() {
  const { user, loading: authLoading } = useAuth() as any;

  const [trees, setTrees] = useState<any[]>([]);
  const [selectedTree, setSelectedTree] = useState<any | null>(null);
  const [roleName, setRoleName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [xpBonusMsg, setXpBonusMsg] = useState<string | null>(null);

  const fetchTrees = useCallback(() => {
    if (!user) return;
    setDbLoading(true);
    fetch("/api/v1/student-hub/ai-skill-tree")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.trees)) setTrees(data.trees);
      })
      .catch((e) => console.error("Failed to load skill trees", e))
      .finally(() => setDbLoading(false));
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchTrees();
  }, [user, authLoading, fetchTrees]);

  const handleSelectTree = (id: string) => {
    setDbLoading(true);
    fetch(`/api/v1/student-hub/ai-skill-tree/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tree) {
          setSelectedTree(data.tree);
          setupGraph(data.tree);
        }
      })
      .catch(console.error)
      .finally(() => setDbLoading(false));
  };

  const setupGraph = (tree: any) => {
    const formattedNodes = tree.nodes.map((n: any) => ({
      id: n.id,
      type: "skillNode",
      position: { x: n.x ?? 150, y: n.y ?? 100 },
      data: {
        label: n.label,
        tier: n.tier,
        status: n.status,
        description: n.description,
        resources: n.resources || [],
        quiz: n.quiz,
      },
    }));

    const formattedEdges = tree.edges.map((e: any) => {
      const sourceNode = tree.nodes.find((n: any) => n.id === e.source);
      const done = sourceNode?.status === "completed";
      const col = done ? "#10b981" : "#1e293b";
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: done,
        style: { stroke: col, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: col, width: 14, height: 14 },
      };
    });

    setNodes(formattedNodes);
    setEdges(formattedEdges);
    setSelectedNode(null);
    setQuizSubmitted(false);
    setQuizSuccess(false);
    setSelectedAns(null);
  };

  const triggerGeneration = async (roleQuery: string) => {
    setGenerating(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/student-hub/ai-skill-tree/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: roleQuery.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.tree) {
        setRoleName("");
        setTrees((prev) => [data.tree, ...prev]);
        setSelectedTree(data.tree);
        setupGraph(data.tree);
      } else {
        setErrorMsg(data.message || "Failed to generate skill tree. Try again.");
      }
    } catch {
      setErrorMsg("Failed to connect to server. Check your connection.");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateTree = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    triggerGeneration(roleName);
  };

  const handleDeleteTree = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this skill tree? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/v1/student-hub/ai-skill-tree/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTrees((prev) => prev.filter((t) => t._id !== id));
        if (selectedTree?._id === id) {
          setSelectedTree(null);
          setNodes([]);
          setEdges([]);
          setSelectedNode(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
    setSelectedAns(null);
    setQuizSubmitted(false);
    setQuizSuccess(false);
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAns === null || !selectedNode || !selectedTree) return;
    const quiz = selectedNode.data.quiz;
    const isCorrect = selectedAns === quiz.answerIndex;
    setQuizSubmitted(true);
    setQuizSuccess(isCorrect);

    if (isCorrect) {
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      } catch {}

      try {
        const res = await fetch(`/api/v1/student-hub/ai-skill-tree/${selectedTree._id}/complete-node`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodeId: selectedNode.id }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.nodes)) {
          if (user) user.xp = data.xp;
          const updatedTree = { ...selectedTree, nodes: data.nodes };
          setSelectedTree(updatedTree);
          setupGraph(updatedTree);
          setXpBonusMsg("🚀 Milestone cleared! +15 XP earned!");
          setTimeout(() => setXpBonusMsg(null), 4500);
        }
      } catch {}
    }
  };

  const completedCount = selectedTree?.nodes?.filter((n: any) => n.status === "completed").length ?? 0;
  const totalCount = selectedTree?.nodes?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#060810] text-white select-none relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-violet-600/8 to-blue-600/8 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-emerald-600/8 to-teal-600/8 blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white/80 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Hub
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400"
              >
                <Trophy className="h-4 w-4 animate-bounce" />
                <span className="text-xs font-black uppercase tracking-widest">{user.xp || 0} XP</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Hero Header ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest mb-4 font-mono">
            <Brain className="h-3.5 w-3.5" />
            Gemini AI · Career Path Generator
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent mb-3">
            AI Skill Tree
          </h1>
          <p className="text-sm text-white/40 font-semibold max-w-lg mx-auto leading-relaxed">
            Generate personalized 8-node career roadmaps with quizzes, resources, and XP-locked progression milestones.
          </p>
        </div>

        {/* ── XP Toast ── */}
        <AnimatePresence>
          {xpBonusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8 mx-auto max-w-sm p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm text-center shadow-[0_15px_40px_rgba(16,185,129,0.35)] flex items-center justify-center gap-3 border border-emerald-400/30"
            >
              <Sparkles className="h-5 w-5 animate-pulse text-amber-200" />
              {xpBonusMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Guest Wall ── */}
        {!authLoading && !user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center border border-white/8 bg-white/3 backdrop-blur-xl p-12 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <AlertTriangle className="h-14 w-14 text-amber-500 mx-auto mb-5" />
            <h2 className="text-2xl font-black mb-3 tracking-tight">Sign In Required</h2>
            <p className="text-xs text-white/40 mb-8 leading-relaxed font-semibold">
              Save generated roadmaps, track node progression, and earn XP rewards — requires an account.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-violet-500/20"
            >
              Log In to Start
            </Link>
          </motion.div>
        ) : (
          <div className="grid xl:grid-cols-[280px_1fr] gap-6 items-start">

            {/* ══ LEFT SIDEBAR ══ */}
            <div className="space-y-5">

              {/* Generator Card */}
              <div className="rounded-3xl border border-white/8 bg-white/3 backdrop-blur-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 rounded-xl bg-violet-500/15 border border-violet-500/20">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                  </div>
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-violet-400 font-mono">Generator Engine</h3>
                </div>

                <form onSubmit={handleGenerateTree} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/25 font-mono block mb-1.5">Career Target</label>
                    <input
                      type="text"
                      required
                      disabled={generating}
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Web3 Security, AI Agent Dev"
                      className="w-full h-11 px-3.5 rounded-2xl border border-white/8 bg-black/50 text-xs font-bold placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all disabled:opacity-50 text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generating || !roleName.trim()}
                    className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-blue-600 hover:brightness-110 text-white shadow-lg shadow-violet-500/20 disabled:opacity-35 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {generating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Compiling…</>
                    ) : (
                      <><GitFork className="h-4 w-4 rotate-180" />Compile Path</>
                    )}
                  </button>
                </form>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-500/25 bg-rose-500/8 text-rose-400">
                        <X className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-semibold leading-relaxed">{errorMsg}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Saved Trees */}
              <div className="rounded-3xl border border-white/8 bg-white/3 backdrop-blur-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-blue-500/15 border border-blue-500/20">
                      <Layers className="h-4 w-4 text-blue-400" />
                    </div>
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-blue-400 font-mono">My Paths</h3>
                  </div>
                  <span className="text-[9px] font-black text-white/20 font-mono border border-white/8 bg-white/5 px-2 py-0.5 rounded-full">
                    {trees.length}/5
                  </span>
                </div>

                {dbLoading && trees.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-white/25 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-[10px] font-bold">Loading paths…</span>
                  </div>
                ) : trees.length === 0 ? (
                  <div className="py-8 text-center">
                    <Compass className="h-7 w-7 text-white/10 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-white/20 italic">No custom paths generated yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trees.map((t) => {
                      const isActive = selectedTree?._id === t._id;
                      return (
                        <motion.button
                          key={t._id}
                          layout
                          onClick={() => handleSelectTree(t._id)}
                          className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left cursor-pointer group transition-all hover:scale-[1.02] ${
                            isActive
                              ? "border-violet-500/40 bg-violet-500/8 shadow-[0_0_12px_rgba(139,92,246,0.08)]"
                              : "border-white/5 bg-black/20 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-violet-400" : "bg-white/20"}`} />
                            <span className={`text-xs font-extrabold truncate tracking-wide ${isActive ? "text-violet-300" : "text-white/55 group-hover:text-white/80"}`}>
                              {t.roleName}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteTree(t._id, e)}
                            className="p-1 rounded-lg hover:bg-rose-500/15 transition-colors shrink-0"
                          >
                            <Trash2 className="h-3 w-3 text-white/15 group-hover:text-rose-400 transition-colors" />
                          </button>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tier Legend */}
              {selectedTree && (
                <div className="rounded-3xl border border-white/8 bg-white/3 backdrop-blur-xl p-5 relative overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/25 font-mono mb-3">Tier Legend</p>
                  <div className="space-y-2">
                    {(["Beginner", "Intermediate", "Advanced", "Expert"] as const).map((tier) => {
                      const tc = TIER_CONFIG[tier];
                      const count = selectedTree.nodes.filter((n: any) => n.tier === tier).length;
                      const done = selectedTree.nodes.filter((n: any) => n.tier === tier && n.status === "completed").length;
                      return (
                        <div key={tier} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tc.dot}`} />
                            <span className={`text-[10px] font-bold ${tc.color}`}>{tier}</span>
                          </div>
                          <span className="text-[9px] font-black text-white/30 font-mono">{done}/{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ══ MAIN CONTENT AREA ══ */}
            <div className="space-y-5">

              {/* Tree Header (when selected) */}
              <AnimatePresence mode="wait">
                {selectedTree && (
                  <motion.div
                    key={selectedTree._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-3xl border border-white/8 bg-white/3 backdrop-blur-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-violet-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 font-mono">Active Career Path</span>
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-white leading-none">{selectedTree.roleName}</h2>
                      <p className="text-[10px] text-white/35 font-semibold mt-1 flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-amber-400" />
                        Click active nodes to take quizzes and progress
                      </p>
                    </div>
                    <ProgressRing completed={completedCount} total={totalCount} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ReactFlow + Inspector Grid */}
              <div className="grid lg:grid-cols-[1fr_320px] gap-5">

                {/* ReactFlow Canvas */}
                <div>
                  {selectedTree ? (
                    <div
                      className="rounded-3xl border border-white/8 overflow-hidden relative shadow-2xl"
                      style={{ height: "520px", background: "radial-gradient(ellipse at 30% 20%, #0d1327 0%, #060810 100%)" }}
                    >
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        onNodeClick={handleNodeClick}
                        fitView
                        fitViewOptions={{ padding: 0.18 }}
                        minZoom={0.25}
                        maxZoom={1.6}
                        nodesConnectable={false}
                        nodesDraggable={true}
                        edgesFocusable={false}
                      >
                        <Background color="#1a2035" gap={28} size={1.2} />
                        <Controls
                          className="!bg-black/60 !backdrop-blur-md !border-white/8 [&_button]:!bg-black/40 [&_button]:!border-white/8 [&_button]:!text-white/40 shadow-xl !rounded-2xl overflow-hidden"
                        />
                      </ReactFlow>

                      {/* Hint overlay */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/8 text-[9px] font-black uppercase tracking-widest text-white/35 pointer-events-none">
                        <Star className="h-3 w-3 text-amber-400" />
                        Click nodes to start milestone quizzes
                      </div>

                      {/* Loading overlay */}
                      <AnimatePresence>
                        {dbLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                          >
                            <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Onboarding Screen */
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-3xl border border-dashed border-white/8 overflow-hidden relative flex flex-col items-center justify-center p-10 text-center"
                      style={{ minHeight: "520px", background: "radial-gradient(ellipse at 50% 50%, #0d1327 0%, #060810 100%)" }}
                    >
                      <div className="absolute top-[-20%] left-[20%] w-[350px] h-[350px] rounded-full bg-violet-600/5 blur-[100px]" />
                      <div className="relative z-10 max-w-md space-y-7">
                        <div className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 text-violet-400 mx-auto">
                          <Compass className="h-10 w-10" />
                        </div>

                        <div>
                          <h4 className="text-xl font-black tracking-tight mb-2">Generate Custom Career Maps</h4>
                          <p className="text-xs text-white/35 max-w-sm mx-auto leading-relaxed font-semibold">
                            Enter any technical career path. Gemini will generate a custom 8-node roadmap across 4 tiers with study resources, quizzes, and XP rewards.
                          </p>
                        </div>

                        <div className="space-y-3 pt-1 text-left">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/25 text-center font-mono">⚡ Quick Start</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {SUGGESTED_ROLES.map((r, i) => (
                              <button
                                key={i}
                                onClick={() => triggerGeneration(r.role)}
                                disabled={generating}
                                className={`flex items-center gap-3 p-3.5 rounded-2xl border ${r.bg} hover:brightness-110 text-left transition-all active:scale-[0.98] group cursor-pointer disabled:opacity-40`}
                              >
                                <span className="text-xl">{r.icon}</span>
                                <div>
                                  <h5 className="text-[11px] font-extrabold text-white leading-tight">{r.role}</h5>
                                  <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Generate →</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {generating && (
                          <div className="flex items-center justify-center gap-3 text-violet-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-xs font-bold">Gemini is compiling your path…</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Inspect Panel */}
                <AnimatePresence mode="wait">
                  {selectedNode ? (
                    <motion.div
                      key={selectedNode.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="rounded-3xl border border-white/8 bg-white/3 backdrop-blur-xl flex flex-col overflow-hidden relative"
                      style={{ maxHeight: "520px" }}
                    >
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      {/* Node Header */}
                      <div className="p-5 border-b border-white/8 flex-shrink-0">
                        {(() => {
                          const tier = selectedNode.data.tier as keyof typeof TIER_CONFIG;
                          const tc = TIER_CONFIG[tier] || { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/25" };
                          return (
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-[3px] rounded-lg border font-mono ${tc.color} ${tc.bg}`}>
                                  {selectedNode.data.tier}
                                </span>
                                <h4 className="font-extrabold text-sm text-white mt-2 leading-snug tracking-wide">
                                  {selectedNode.data.label}
                                </h4>
                              </div>
                              <div className="shrink-0">
                                {selectedNode.data.status === "completed" ? (
                                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg font-mono">✓ Done</span>
                                ) : selectedNode.data.status === "locked" ? (
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 border border-slate-700/50 px-2 py-1 rounded-lg font-mono">Locked</span>
                                ) : (
                                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg font-mono animate-pulse">Active</span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Scrollable body */}
                      <div className="overflow-y-auto flex-1 p-5 space-y-5 custom-scrollbar">
                        {/* Description */}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/25 font-mono mb-2">Description</p>
                          <p className="text-[11px] text-white/55 leading-relaxed font-semibold">{selectedNode.data.description}</p>
                        </div>

                        {/* Resources */}
                        {selectedNode.data.resources?.length > 0 && (
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/25 font-mono mb-2 flex items-center gap-1.5">
                              <BookOpen className="h-3 w-3 text-blue-400" /> Syllabus
                            </p>
                            <div className="space-y-2">
                              {selectedNode.data.resources.map((link: string, li: number) => (
                                <div key={li} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/5 text-[10px] text-white/60 font-semibold">
                                  <ChevronRight className="h-3 w-3 text-blue-400 shrink-0" />
                                  <span className="truncate">{link}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quiz Area */}
                        <div className="border-t border-white/8 pt-4">
                          {selectedNode.data.status === "locked" ? (
                            <div className="flex items-start gap-3 text-slate-400 bg-slate-900/40 p-4 border border-slate-800/50 rounded-2xl">
                              <Lock className="h-4 w-4 shrink-0 text-slate-600 mt-0.5" />
                              <p className="text-[10px] leading-relaxed font-semibold">
                                Complete all prerequisite nodes in the flowchart to unlock this exam.
                              </p>
                            </div>
                          ) : selectedNode.data.status === "completed" ? (
                            <div className="flex items-start gap-3 text-emerald-400 bg-emerald-500/5 p-4 border border-emerald-500/20 rounded-2xl">
                              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest font-mono mb-1">Node Mastered ✓</p>
                                <p className="text-[9px] text-white/35 leading-relaxed font-semibold">You passed the verification test and unlocked downstream nodes.</p>
                              </div>
                            </div>
                          ) : (
                            <form onSubmit={handleQuizSubmit} className="space-y-3.5">
                              <p className="text-[9px] font-black uppercase tracking-widest text-white/25 font-mono flex items-center gap-1.5">
                                <HelpCircle className="h-3.5 w-3.5 text-blue-400 animate-pulse" /> Concept Verification
                              </p>
                              <p className="text-xs font-extrabold text-white leading-relaxed">
                                {selectedNode.data.quiz?.question}
                              </p>

                              <div className="space-y-2">
                                {selectedNode.data.quiz?.options?.map((opt: string, idx: number) => (
                                  <label
                                    key={idx}
                                    onClick={() => !quizSubmitted && setSelectedAns(idx)}
                                    className={`flex items-center gap-3 px-3.5 py-3 border rounded-xl cursor-pointer text-[10px] font-bold transition-all hover:scale-[1.01] ${
                                      selectedAns === idx
                                        ? "border-violet-500/60 bg-violet-500/8 text-violet-300"
                                        : "border-white/5 bg-black/30 text-white/60 hover:border-white/10"
                                    }`}
                                  >
                                    <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                      selectedAns === idx ? "border-violet-500" : "border-white/15"
                                    }`}>
                                      {selectedAns === idx && <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />}
                                    </div>
                                    <span className="leading-snug">{opt}</span>
                                  </label>
                                ))}
                              </div>

                              {!quizSubmitted ? (
                                <button
                                  type="submit"
                                  disabled={selectedAns === null}
                                  className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:brightness-110 disabled:opacity-35 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-violet-500/15"
                                >
                                  <Flame className="h-3.5 w-3.5" />
                                  Verify Answer
                                </button>
                              ) : quizSuccess ? (
                                <div className="p-4 border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 rounded-2xl text-[10px] leading-relaxed font-semibold">
                                  <span className="block font-black uppercase tracking-widest text-xs mb-1.5 font-mono">🎉 Correct!</span>
                                  {selectedNode.data.quiz?.explanation}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="p-4 border border-rose-500/25 bg-rose-500/5 text-rose-400 rounded-2xl text-[10px] leading-relaxed font-semibold">
                                    <span className="block font-black uppercase tracking-widest text-xs mb-1 font-mono">❌ Incorrect</span>
                                    Review the notes and try again.
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => { setSelectedAns(null); setQuizSubmitted(false); }}
                                    className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white/70 bg-white/5 hover:bg-white/8 border border-white/8 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" /> Try Again
                                  </button>
                                </div>
                              )}
                            </form>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-3xl border border-white/5 bg-black/20 backdrop-blur-md flex flex-col items-center justify-center text-center p-10 relative overflow-hidden"
                      style={{ minHeight: "520px" }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,#1a1f3a_0%,transparent_70%)]" />
                      <div className="relative z-10">
                        <Info className="h-9 w-9 text-white/15 mx-auto mb-3" />
                        <h5 className="text-[11px] font-black text-white/35 uppercase tracking-widest font-mono">Milestone Detail</h5>
                        <p className="text-[10px] text-white/20 max-w-[200px] mt-2 leading-relaxed font-semibold mx-auto">
                          Click any active node in the flowchart to view study materials and solve quizzes.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
