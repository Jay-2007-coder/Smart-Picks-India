"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  GitFork,
  Cpu,
  Trophy,
  Trash2,
  Lock,
  BookOpen,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Loader2,
  ZoomIn,
  Check,
  ChevronRight,
  Info,
  Layers,
  Map,
  Compass,
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

// Quick start role recommendations
const SUGGESTED_ROLES = [
  { role: "AI & Machine Learning Engineer", icon: "🧠", color: "from-teal-500 to-emerald-500" },
  { role: "Smart Contract Web3 Auditor", icon: "⛓️", color: "from-indigo-500 to-purple-500" },
  { role: "Fullstack Next.js Developer", icon: "⚡", color: "from-blue-500 to-cyan-500" },
  { role: "Cybersecurity Analyst", icon: "🛡️", color: "from-rose-500 to-amber-500" },
];

/* ── Custom Node component ── */
function SkillNodeCustom({ data }: { data: any }) {
  const isLocked = data.status === "locked";
  const isCompleted = data.status === "completed";

  // Border & Glow theme based on status
  const themeStyles = isCompleted
    ? "border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.25)] text-emerald-400"
    : isLocked
    ? "border-slate-800 bg-slate-950/40 opacity-55 text-slate-500"
    : "border-blue-500/80 bg-blue-950/10 shadow-[0_0_20px_rgba(59,130,246,0.25)] text-blue-400";

  // Tier Badge Color
  const tierColors = {
    Beginner: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    Intermediate: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    Advanced: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    Expert: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  }[data.tier as "Beginner" | "Intermediate" | "Advanced" | "Expert"] || "text-slate-400 bg-slate-500/10";

  return (
    <div
      className={`px-4.5 py-3.5 rounded-2xl border-2 backdrop-blur-xl flex flex-col justify-center min-w-[190px] select-none cursor-pointer transition-all duration-300 relative group hover:scale-[1.03] ${themeStyles}`}
    >
      {/* Hidden React Flow ports */}
      <Handle type="target" position={Position.Top} className="opacity-0 !w-0 !h-0" id="t-top" />
      <Handle type="target" position={Position.Left} className="opacity-0 !w-0 !h-0" id="t-left" />

      {/* Floating accent background glow on hover */}
      {!isLocked && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}

      {/* Tier Tag */}
      <span className={`text-[8px] font-black uppercase tracking-widest mb-1.5 px-2 py-0.5 rounded-md border w-fit font-mono ${tierColors}`}>
        {data.tier}
      </span>

      {/* Label and Status Icon */}
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-extrabold truncate max-w-[140px] tracking-wide ${isLocked ? "text-slate-500" : "text-white"}`}>
          {data.label}
        </span>
        <div className="shrink-0">
          {isCompleted ? (
            <div className="p-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50">
              <Check className="h-3 w-3 text-emerald-400 stroke-[3px]" />
            </div>
          ) : isLocked ? (
            <Lock className="h-3 w-3 text-slate-600" />
          ) : (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 !w-0 !h-0" id="s-bottom" />
      <Handle type="source" position={Position.Right} className="opacity-0 !w-0 !h-0" id="s-right" />
    </div>
  );
}

const nodeTypes = { skillNode: SkillNodeCustom };

/* ── Main Component ── */
export default function AISkillTreeBuilder() {
  const { user, loading: authLoading } = useAuth() as any;

  // Active custom trees list
  const [trees, setTrees] = useState<any[]>([]);
  const [selectedTree, setSelectedTree] = useState<any | null>(null);

  // Form State
  const [roleName, setRoleName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Inspection drawer state
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [xpBonusMsg, setXpBonusMsg] = useState<string | null>(null);

  // Load user trees
  const fetchTrees = useCallback(() => {
    if (!user) return;
    setDbLoading(true);
    fetch("/api/v1/student-hub/ai-skill-tree")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.trees)) {
          setTrees(data.trees);
        }
      })
      .catch((e) => console.error("Failed to load custom skill trees", e))
      .finally(() => setDbLoading(false));
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchTrees();
    }
  }, [user, authLoading, fetchTrees]);

  // Handle single tree fetch
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
      .catch((e) => console.error("Failed to fetch custom skill tree details", e))
      .finally(() => setDbLoading(false));
  };

  // React Flow mapper
  const setupGraph = (tree: any) => {
    const formattedNodes = tree.nodes.map((n: any) => ({
      id: n.id,
      type: "skillNode",
      position: { x: n.x, y: n.y },
      data: {
        label: n.label,
        tier: n.tier,
        status: n.status,
        description: n.description,
        resources: n.resources,
        quiz: n.quiz,
      },
    }));

    const formattedEdges = tree.edges.map((e: any) => {
      const sourceNode = tree.nodes.find((n: any) => n.id === e.source);
      const isCompleted = sourceNode && sourceNode.status === "completed";
      const strokeColor = isCompleted ? "#10b981" : "#334155";
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: isCompleted,
        style: { stroke: strokeColor, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 14,
          height: 14,
        },
      };
    });

    setNodes(formattedNodes);
    setEdges(formattedEdges);
    setSelectedNode(null);
  };

  // Run generator helper
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
    } catch (err) {
      setErrorMsg("Failed to connect to server. Check your connection.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateTree = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    triggerGeneration(roleName);
  };

  // Delete an existing skill tree
  const handleDeleteTree = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this custom skill tree?")) return;

    try {
      const res = await fetch(`/api/v1/student-hub/ai-skill-tree/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setTrees((prev) => prev.filter((t) => t._id !== id));
        if (selectedTree?._id === id) {
          setSelectedTree(null);
          setNodes([]);
          setEdges([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete custom skill tree", err);
    }
  };

  // Click on React Flow node
  const handleNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
    setSelectedAns(null);
    setQuizSubmitted(false);
    setQuizSuccess(false);
  };

  // Validate quiz answers
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
        confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
      } catch (err) {
        console.error("Confetti script failed to load", err);
      }

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
          setXpBonusMsg("🚀 Milestone Quiz Cleared! +15 XP earned!");
          setTimeout(() => setXpBonusMsg(null), 4000);
        }
      } catch (err) {
        console.error("Failed to complete node on server", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080b16] text-white py-12 select-none relative overflow-hidden font-sans">
      {/* Dynamic Background Mesh */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[35%] left-[45%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      {/* Decorative Cybernetic Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container-custom max-w-6xl relative z-10">
        {/* Navigation row */}
        <div className="flex justify-between items-center mb-10">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-2 text-xs font-black text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" /> Back to Hub
          </Link>

          {user && (
            <div className="flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-teal-500/30 bg-teal-500/5 text-teal-400 text-xs font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              <Trophy className="h-4.5 w-4.5 text-amber-400 animate-bounce" />
              <span>{user.xp || 0} XP Ranked</span>
            </div>
          )}
        </div>

        {/* Milestone Toast banner */}
        <AnimatePresence>
          {xpBonusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8 p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm text-center shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 border border-emerald-400/30 select-none"
            >
              <Sparkles className="h-5.5 w-5.5 animate-pulse text-amber-200" />
              <span>{xpBonusMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest check */}
        {!authLoading && !user ? (
          <div className="max-w-md mx-auto text-center border border-white/10 bg-slate-950/60 p-10 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-5" />
            <h2 className="text-2xl font-black mb-3">Sign In Required</h2>
            <p className="text-xs text-white/50 mb-8 leading-relaxed font-semibold">
              The Interactive AI Skill Tree Builder requires a logged-in account to save generated roadmaps, lock progression nodes, and claim your leaderboard XP rewards.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-tr from-teal-500 via-indigo-500 to-purple-600 text-white hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
              Log In to Start
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8 items-start">
            {/* Sidebar Controls */}
            <div className="space-y-6 lg:col-span-1">
              {/* Generator Card */}
              <div className="border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
                <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-teal-400 mb-5 flex items-center gap-1.5 font-mono">
                  <Sparkles className="h-4 w-4 animate-pulse text-teal-400" /> Generator Engine
                </h3>

                <form onSubmit={handleGenerateTree} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30 font-mono">Career Target</label>
                    <input
                      type="text"
                      required
                      disabled={generating}
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Web3 Security, AI Agent Dev"
                      className="w-full h-11 px-3.5 rounded-2xl border border-white/10 bg-black/60 text-xs font-bold placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generating || !roleName.trim()}
                    className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-teal-500 to-indigo-600 hover:brightness-110 text-white shadow-xl disabled:opacity-40 disabled:hover:bg-teal-50 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <GitFork className="h-4.5 w-4.5 rotate-180" />
                        Compile Path
                      </>
                    )}
                  </button>
                </form>

                {errorMsg && (
                  <p className="text-[10px] text-rose-400 font-extrabold mt-4 border border-rose-500/25 bg-rose-500/5 p-3 rounded-xl text-center leading-relaxed">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Saved Trees List */}
              <div className="border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-indigo-400 mb-4.5 font-mono">
                  My Custom Paths ({trees.length}/5)
                </h3>

                {dbLoading && trees.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-white/30 gap-2">
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span className="text-[10px] font-bold">Querying DB...</span>
                  </div>
                ) : trees.length === 0 ? (
                  <div className="py-6 text-center text-white/20">
                    <Map className="h-6 w-6 mx-auto mb-2 text-white/10" />
                    <p className="text-[10px] font-bold italic">No custom paths generated.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {trees.map((t) => {
                      const isActive = selectedTree?._id === t._id;
                      return (
                        <button
                          key={t._id}
                          onClick={() => handleSelectTree(t._id)}
                          className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all text-left cursor-pointer group hover:scale-[1.02] ${
                            isActive
                              ? "border-teal-500/50 bg-teal-500/5 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.05)]"
                              : "border-white/5 bg-black/30 text-white/60 hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <span className="text-xs font-extrabold truncate max-w-[140px] tracking-wide">{t.roleName}</span>
                          <Trash2
                            onClick={(e) => handleDeleteTree(t._id, e)}
                            className="h-3.5 w-3.5 text-white/20 hover:text-rose-500 transition-colors shrink-0 opacity-80 group-hover:opacity-100"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* React Flow Canvas and Inspection Panel */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header Title */}
              {selectedTree && (
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/15 pb-5 gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
                      {selectedTree.roleName}
                    </h2>
                    <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mt-1 font-mono flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-indigo-400" /> Interactive Skill Flowchart · Pass exams to progress
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/30 px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.05)]">
                      <CheckCircle className="h-4 w-4" />
                      {selectedTree.nodes.filter((n: any) => n.status === "completed").length} /{" "}
                      {selectedTree.nodes.length} Skills Mastered
                    </span>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                {/* ReactFlow Area */}
                <div className="md:col-span-2">
                  {selectedTree ? (
                    <div
                      className="h-[520px] w-full border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl"
                      style={{ background: "linear-gradient(135deg, #07090e 0%, #0a0d15 80%)" }}
                    >
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        onNodeClick={handleNodeClick}
                        fitView
                        fitViewOptions={{ padding: 0.15 }}
                        minZoom={0.3}
                        maxZoom={1.5}
                        nodesConnectable={false}
                        nodesDraggable={true}
                        edgesFocusable={false}
                      >
                        <Background color="#161d2d" gap={20} size={1} />
                        <Controls className="!bg-[#0c0f16]/90 !backdrop-blur-md !border-white/10 [&_button]:!bg-[#0c0f16] [&_button]:!border-white/10 [&_button]:!text-white/40 hover:[&_button]:!text-white shadow-xl" />
                      </ReactFlow>

                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 pointer-events-none">
                        <ZoomIn className="h-3.5 w-3.5 text-teal-400" />
                        Click node milestones to start quiz
                      </div>
                    </div>
                  ) : (
                    /* Onboarding quick-start screen */
                    <div
                      className="min-h-[520px] w-full border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-xl"
                      style={{ background: "linear-gradient(135deg, #07090e 0%, #0a0d15 80%)" }}
                    >
                      <div className="absolute top-[-30%] left-[20%] w-[300px] h-[300px] rounded-full bg-teal-500/5 blur-[80px]" />
                      
                      <div className="relative z-10 max-w-lg space-y-6">
                        <div className="inline-flex p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-lg text-teal-400 animate-pulse">
                          <Compass className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black tracking-wide">Generate Custom Career Maps</h4>
                          <p className="text-[11px] text-white/40 max-w-sm mx-auto mt-2 leading-relaxed font-semibold">
                            Enter any advanced technical path. Gemini will dynamically generate a custom 8-node roadmap distributed across 4 tiers with study resources and conceptual exams.
                          </p>
                        </div>

                        {/* Quick Start Suggested Buttons */}
                        <div className="space-y-2 pt-2 text-left">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 text-center font-mono">
                            ⚡ Quick Start Suggestions
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {SUGGESTED_ROLES.map((r, ri) => (
                              <button
                                key={ri}
                                onClick={() => triggerGeneration(r.role)}
                                disabled={generating}
                                className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-slate-950/40 hover:border-white/15 hover:bg-slate-900/60 text-left transition-all active:scale-[0.98] group cursor-pointer"
                              >
                                <span className="text-lg bg-slate-900 p-1.5 rounded-xl border border-white/5">{r.icon}</span>
                                <div>
                                  <h5 className="text-[11px] font-extrabold text-white group-hover:text-teal-400 transition-colors">
                                    {r.role}
                                  </h5>
                                  <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Generate</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inspect Side Drawer */}
                <div className="md:col-span-1">
                  <AnimatePresence mode="wait">
                    {selectedNode ? (
                      <motion.div
                        key={selectedNode.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="border border-white/10 bg-slate-900/20 backdrop-blur-xl p-6 rounded-3xl h-full flex flex-col justify-between shadow-xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        
                        <div className="space-y-5">
                          {/* Node Header */}
                          <div className="flex items-start justify-between border-b border-white/10 pb-4">
                            <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20 font-mono">
                                {selectedNode.data.tier}
                              </span>
                              <h4 className="font-extrabold text-sm text-white mt-2 leading-snug tracking-wide">
                                {selectedNode.data.label}
                              </h4>
                            </div>
                            <div className="shrink-0 text-right">
                              {selectedNode.data.status === "completed" ? (
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">Mastered</span>
                              ) : selectedNode.data.status === "locked" ? (
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-950/40 border border-slate-800 px-2 py-0.5 rounded-md font-mono">Locked</span>
                              ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md animate-pulse font-mono">Active</span>
                              )}
                            </div>
                          </div>

                          {/* Node Overview */}
                          <div className="space-y-2 text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 font-mono">Description</p>
                            <p className="text-[11px] text-white/60 leading-relaxed font-semibold">
                              {selectedNode.data.description}
                            </p>
                          </div>

                          {/* Resources list */}
                          <div className="space-y-2.5 text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 font-mono">
                              <BookOpen className="h-3.5 w-3.5 text-teal-400" /> Syllabus & Links
                            </p>
                            <div className="flex flex-col gap-2">
                              {selectedNode.data.resources.map((link: string, li: number) => (
                                <div
                                  key={li}
                                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/5 text-[10px] text-white/70 font-semibold shadow-inner"
                                >
                                  <ChevronRight className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                                  <span className="truncate">{link}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Quiz area */}
                        <div className="pt-5 border-t border-white/10 mt-5 text-left">
                          {selectedNode.data.status === "locked" ? (
                            <div className="flex items-start gap-3 text-slate-400 bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl">
                              <Lock className="h-5 w-5 shrink-0 text-slate-500 mt-0.5" />
                              <p className="text-[10px] leading-relaxed font-semibold">
                                This syllabus module is locked. Complete all previous parent nodes in the workflow flowchart to activate this exam.
                              </p>
                            </div>
                          ) : selectedNode.data.status === "completed" ? (
                            <div className="flex items-start gap-3 text-emerald-400 bg-emerald-500/5 p-4.5 border border-emerald-500/25 rounded-2xl shadow-[inset_0_0_12px_rgba(16,185,129,0.02)]">
                              <CheckCircle className="h-5.5 w-5.5 shrink-0 text-emerald-400 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest font-mono">Node Unlocked</p>
                                <p className="text-[9px] leading-relaxed mt-1 font-semibold text-white/40">
                                  You have successfully passed the conceptual verification test and unlocked downstream lessons.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <form onSubmit={handleQuizSubmit} className="space-y-4">
                              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 font-mono">
                                <HelpCircle className="h-3.5 w-3.5 text-blue-400 animate-pulse" /> Concept Verification
                              </p>
                              <p className="text-[11px] font-extrabold text-white leading-relaxed">
                                {selectedNode.data.quiz.question}
                              </p>

                              <div className="space-y-2">
                                {selectedNode.data.quiz.options.map((opt: string, idx: number) => (
                                  <label
                                    key={idx}
                                    onClick={() => !quizSubmitted && setSelectedAns(idx)}
                                    className={`flex items-center gap-3 px-3.5 py-3 border rounded-2xl cursor-pointer text-[10px] font-extrabold transition-all hover:scale-[1.01] ${
                                      selectedAns === idx
                                        ? "border-teal-500 bg-teal-500/5 text-teal-400"
                                        : "border-white/5 bg-black/40 text-white/70 hover:border-white/10"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="quiz-opt"
                                      checked={selectedAns === idx}
                                      onChange={() => {}}
                                      disabled={quizSubmitted}
                                      className="sr-only"
                                    />
                                    <div
                                      className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                        selectedAns === idx ? "border-teal-500" : "border-white/20"
                                      }`}
                                    >
                                      {selectedAns === idx && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                                      )}
                                    </div>
                                    <span className="leading-snug">{opt}</span>
                                  </label>
                                ))}
                              </div>

                              {!quizSubmitted ? (
                                <button
                                  type="submit"
                                  disabled={selectedAns === null || dbLoading}
                                  className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/10"
                                >
                                  {dbLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                  Verify Answers
                                </button>
                              ) : quizSuccess ? (
                                <div className="p-4 border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 rounded-2xl text-[10px] leading-relaxed font-semibold">
                                  <span className="block font-black uppercase tracking-widest text-xs mb-1 font-mono">🎉 Success</span>
                                  {selectedNode.data.quiz.explanation}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="p-4 border border-rose-500/25 bg-rose-500/5 text-rose-400 rounded-2xl text-[10px] leading-relaxed font-semibold">
                                    <span className="block font-black uppercase tracking-widest text-xs mb-1 font-mono">❌ Incorrect</span>
                                    Review the notes and syllabus link details, then try again.
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAns(null);
                                      setQuizSubmitted(false);
                                    }}
                                    className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all active:scale-95"
                                  >
                                    Try Again
                                  </button>
                                </div>
                              )}
                            </form>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="border border-white/10 bg-slate-900/10 backdrop-blur-md p-6 rounded-3xl h-full flex flex-col items-center justify-center text-center py-24 relative overflow-hidden shadow-inner">
                        <Info className="h-8 w-8 text-white/20 mb-3" />
                        <h5 className="text-[11px] font-black text-white/50 uppercase tracking-widest font-mono">Milestone Detail</h5>
                        <p className="text-[10px] text-white/30 max-w-xs mt-1.5 leading-relaxed font-semibold">
                          Click any active node in the graph flowchart to view study materials and solve verification quizzes to earn XP.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
