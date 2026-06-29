"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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

/* ── Custom Node component ── */
function SkillNodeCustom({ data }: { data: any }) {
  const isLocked = data.status === "locked";
  const isCompleted = data.status === "completed";

  // Colors & styles based on tier and status
  const tierColors = {
    Beginner: "border-teal-500/40 text-teal-400 bg-teal-500/[0.03]",
    Intermediate: "border-indigo-500/40 text-indigo-400 bg-indigo-500/[0.03]",
    Advanced: "border-purple-500/40 text-purple-400 bg-purple-500/[0.03]",
    Expert: "border-amber-500/40 text-amber-400 bg-amber-500/[0.03]",
  }[data.tier as "Beginner" | "Intermediate" | "Advanced" | "Expert"] || "border-border text-foreground";

  return (
    <div
      className={`px-4 py-3 rounded-2xl border-2 bg-slate-950/90 backdrop-blur-md flex flex-col justify-center min-w-[170px] select-none cursor-pointer transition-all duration-200 text-left ${
        isCompleted
          ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          : isLocked
          ? "border-slate-800 opacity-60 text-slate-500"
          : "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0 !w-0 !h-0" id="t-top" />
      <Handle type="target" position={Position.Left} className="opacity-0 !w-0 !h-0" id="t-left" />

      {/* Tier Badge */}
      <span className={`text-[8px] font-black uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded w-fit ${tierColors}`}>
        {data.tier}
      </span>

      {/* Label and Status */}
      <div className="flex items-center justify-between gap-2.5">
        <span className={`text-xs font-black truncate max-w-[130px] ${isLocked ? "text-slate-500" : "text-white"}`}>
          {data.label}
        </span>
        {isCompleted ? (
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
        ) : isLocked ? (
          <Lock className="h-3.5 w-3.5 text-slate-600 shrink-0" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        )}
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

  // Generate a new skill tree
  const handleGenerateTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setGenerating(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/student-hub/ai-skill-tree/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: roleName.trim() }),
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
      // Confetti splash
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
      } catch (err) {
        console.error("Confetti script failed to load", err);
      }

      // Sync node completion with backend
      try {
        const res = await fetch(`/api/v1/student-hub/ai-skill-tree/${selectedTree._id}/complete-node`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodeId: selectedNode.id }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.nodes)) {
          // Re-sync user XP
          if (user) user.xp = data.xp;
          // Refresh active local graph states
          const updatedTree = { ...selectedTree, nodes: data.nodes };
          setSelectedTree(updatedTree);
          setupGraph(updatedTree);
          setXpBonusMsg("🚀 Quiz Passed! +15 XP earned!");
          setTimeout(() => setXpBonusMsg(null), 4000);
        }
      } catch (err) {
        console.error("Failed to complete node on server", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-white py-12 select-none relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[5%] w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="container-custom max-w-6xl relative z-10">
        {/* Navigation row */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/student-hub"
            className="inline-flex items-center gap-1.5 text-xs font-black text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Link>

          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/5 text-teal-400 text-xs font-black uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>{user.xp || 0} XP</span>
            </div>
          )}
        </div>

        {/* Milestone Toast banner */}
        <AnimatePresence>
          {xpBonusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-sm text-center shadow-lg flex items-center justify-center gap-2 select-none"
            >
              <Sparkles className="h-5 w-5 animate-pulse text-amber-200" />
              <span>{xpBonusMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest fallback block */}
        {!authLoading && !user ? (
          <div className="max-w-md mx-auto text-center border border-white/10 bg-white/[0.02] p-8 rounded-3xl backdrop-blur-md">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">Login Required</h2>
            <p className="text-sm text-white/50 mb-6 leading-relaxed font-semibold">
              The AI Custom Skill Tree Builder requires a student account to store generated roadmaps, save unlock progress, and award leaderboard XP.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-tr from-teal-500 to-indigo-600 text-white hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Sign In to Build Paths
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6 items-start">
            {/* Sidebar Controls */}
            <div className="space-y-6 lg:col-span-1">
              {/* Generator Form */}
              <div className="border border-white/10 bg-white/[0.02] p-5 rounded-3xl">
                <h3 className="font-extrabold text-xs uppercase tracking-widest text-white/40 mb-4 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-teal-400" /> New Skill Path
                </h3>

                <form onSubmit={handleGenerateTree} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Target Role</label>
                    <input
                      type="text"
                      required
                      disabled={generating}
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Web3 Auditor, AI Agent Developer"
                      className="w-full h-10 px-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generating || !roleName.trim()}
                    className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-teal-500 hover:bg-teal-600 text-white shadow-lg disabled:opacity-40 disabled:hover:bg-teal-50 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <GitFork className="h-4 w-4 rotate-180" />
                        Generate Tree
                      </>
                    )}
                  </button>
                </form>

                {errorMsg && (
                  <p className="text-[10px] text-rose-400 font-extrabold mt-3 border border-rose-500/25 bg-rose-500/5 p-2 rounded-lg text-center leading-relaxed">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* My Trees selector */}
              <div className="border border-white/10 bg-white/[0.02] p-5 rounded-3xl">
                <h3 className="font-extrabold text-xs uppercase tracking-widest text-white/40 mb-3.5">
                  My Career Trees ({trees.length}/5)
                </h3>

                {dbLoading && trees.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-white/30 gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-[10px] font-bold">Loading...</span>
                  </div>
                ) : trees.length === 0 ? (
                  <p className="text-[10px] text-white/30 font-bold italic py-4 text-center">No generated trees yet.</p>
                ) : (
                  <div className="space-y-2">
                    {trees.map((t) => {
                      const isActive = selectedTree?._id === t._id;
                      return (
                        <button
                          key={t._id}
                          onClick={() => handleSelectTree(t._id)}
                          className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left cursor-pointer group ${
                            isActive
                              ? "border-teal-500/50 bg-teal-500/5 text-teal-400"
                              : "border-white/5 bg-black/20 text-white/70 hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <span className="text-xs font-black truncate max-w-[150px]">{t.roleName}</span>
                          <Trash2
                            onClick={(e) => handleDeleteTree(t._id, e)}
                            className="h-3.5 w-3.5 text-white/20 hover:text-rose-500 transition-colors shrink-0 group-hover:opacity-100"
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
              {/* Title Header */}
              {selectedTree && (
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black">{selectedTree.roleName}</h2>
                    <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mt-0.5">
                      Gamified Skill Path · Pass quizzes to earn XP
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {selectedTree.nodes.filter((n: any) => n.status === "completed").length} /{" "}
                      {selectedTree.nodes.length} Completed
                    </span>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                {/* ReactFlow Area */}
                <div className="md:col-span-2">
                  {selectedTree ? (
                    <div
                      className="h-[480px] w-full border border-white/10 rounded-3xl overflow-hidden relative"
                      style={{ background: "linear-gradient(135deg, #090c12 0%, #0c0f16 70%)" }}
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
                        minZoom={0.4}
                        maxZoom={1.5}
                        nodesConnectable={false}
                        nodesDraggable={true}
                        edgesFocusable={false}
                      >
                        <Background color="#1f293d" gap={18} size={1} />
                        <Controls className="!bg-[#0c0f16] !border-white/10 [&_button]:!bg-[#0c0f16] [&_button]:!border-white/10 [&_button]:!text-white/40 hover:[&_button]:!text-white" />
                      </ReactFlow>

                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 pointer-events-none">
                        <ZoomIn className="h-3.5 w-3.5" />
                        Click nodes to unlock milestones
                      </div>
                    </div>
                  ) : (
                    <div
                      className="h-[480px] w-full border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-6"
                      style={{ background: "linear-gradient(135deg, #090c12 0%, #0c0f16 70%)" }}
                    >
                      <Cpu className="h-10 w-10 text-white/15 mb-4 animate-pulse" />
                      <h4 className="text-sm font-black text-white/60">No Career Path Selected</h4>
                      <p className="text-xs text-white/35 max-w-xs mt-1 leading-relaxed font-semibold">
                        Select an existing path from the sidebar list, or type a custom engineering role above to generate a new AI tree.
                      </p>
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
                        className="border border-white/10 bg-white/[0.02] p-5 rounded-3xl h-full flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* Node Header */}
                          <div className="flex items-start justify-between border-b border-white/10 pb-3">
                            <div>
                              <span className="text-[8px] font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/25">
                                {selectedNode.data.tier}
                              </span>
                              <h4 className="font-extrabold text-sm text-white mt-1.5 leading-snug">
                                {selectedNode.data.label}
                              </h4>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider">
                              {selectedNode.data.status === "completed" ? (
                                <span className="text-emerald-400">Completed</span>
                              ) : selectedNode.data.status === "locked" ? (
                                <span className="text-slate-500">Locked</span>
                              ) : (
                                <span className="text-blue-400 animate-pulse">Unlocked</span>
                              )}
                            </span>
                          </div>

                          {/* Node Overview */}
                          <div className="space-y-1.5 text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Skill Overview</p>
                            <p className="text-[11px] text-white/60 leading-relaxed font-semibold">
                              {selectedNode.data.description}
                            </p>
                          </div>

                          {/* Resources list */}
                          <div className="space-y-2 text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> Recommended Links
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {selectedNode.data.resources.map((link: string, li: number) => (
                                <div
                                  key={li}
                                  className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5 text-[10px] text-white/60 font-bold"
                                >
                                  <ChevronRight className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                                  <span className="truncate">{link}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Quiz area */}
                        <div className="pt-4 border-t border-white/10 mt-4 text-left">
                          {selectedNode.data.status === "locked" ? (
                            <div className="flex items-center gap-2 text-white/35 bg-slate-900/50 p-4 border border-dashed border-white/5 rounded-2xl">
                              <Lock className="h-4.5 w-4.5 shrink-0" />
                              <p className="text-[10px] leading-relaxed font-bold">
                                This node is locked. Complete all preceding parent skills in the tree flowchart to unlock this module.
                              </p>
                            </div>
                          ) : selectedNode.data.status === "completed" ? (
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 p-4 border border-emerald-500/25 rounded-2xl">
                              <CheckCircle className="h-5 w-5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-wider">Milestone Unlocked</p>
                                <p className="text-[9px] leading-snug mt-0.5 font-bold text-white/50">
                                  You have passed the quiz and unlocked subsequent nodes in this career branch.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <form onSubmit={handleQuizSubmit} className="space-y-3.5">
                              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
                                <HelpCircle className="h-3.5 w-3.5" /> Conceptual Quiz
                              </p>
                              <p className="text-[11px] font-black text-white leading-normal">
                                {selectedNode.data.quiz.question}
                              </p>

                              <div className="space-y-1.5">
                                {selectedNode.data.quiz.options.map((opt: string, idx: number) => (
                                  <label
                                    key={idx}
                                    onClick={() => !quizSubmitted && setSelectedAns(idx)}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer text-[10px] font-bold transition-all ${
                                      selectedAns === idx
                                        ? "border-teal-500/50 bg-teal-500/5 text-teal-400"
                                        : "border-white/5 bg-black/20 text-white/70 hover:border-white/10"
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
                                      className={`h-3 w-3 rounded-full border flex items-center justify-center shrink-0 ${
                                        selectedAns === idx ? "border-teal-500" : "border-white/30"
                                      }`}
                                    >
                                      {selectedAns === idx && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                                      )}
                                    </div>
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>

                              {!quizSubmitted ? (
                                <button
                                  type="submit"
                                  disabled={selectedAns === null || dbLoading}
                                  className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                                >
                                  {dbLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                  Submit Quiz
                                </button>
                              ) : quizSuccess ? (
                                <div className="p-3 border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 rounded-xl text-[10px] leading-relaxed font-bold">
                                  <span className="block font-black uppercase tracking-wider text-xs mb-1">🎉 Correct!</span>
                                  {selectedNode.data.quiz.explanation}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="p-3 border border-rose-500/25 bg-rose-500/5 text-rose-400 rounded-xl text-[10px] leading-relaxed font-bold">
                                    <span className="block font-black uppercase tracking-wider text-xs mb-1">❌ Incorrect</span>
                                    Try again! Re-read the guide details.
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAns(null);
                                      setQuizSubmitted(false);
                                    }}
                                    className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all"
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
                      <div className="border border-white/10 bg-white/[0.02] p-5 rounded-3xl h-full flex flex-col items-center justify-center text-center py-20">
                        <Info className="h-7 w-7 text-white/20 mb-3" />
                        <h5 className="text-xs font-black text-white/50 uppercase tracking-wider">Inspect Skill</h5>
                        <p className="text-[10px] text-white/30 max-w-xs mt-1 leading-relaxed font-bold">
                          Click on any unlocked node in the graph flowchart to view study resources and attempt the milestone unlocking quiz.
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
