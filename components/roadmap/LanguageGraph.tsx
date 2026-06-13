"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Handle,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGES_DATA, LanguageNode } from "@/data/languages";
import LanguageDrawer from "./LanguageDrawer";
import { Filter, ZoomIn, Info, Layers, Globe, Database, Cpu, Building2, ChevronRight } from "lucide-react";

/* ── Domain meta ── */
const DOMAIN_META = {
  web:        { label: "Web",        color: "#378ADD", icon: Globe,     bg: "bg-[#378ADD]/15" },
  data:       { label: "Data / AI",  color: "#1D9E75", icon: Database,  bg: "bg-[#1D9E75]/15" },
  systems:    { label: "Systems",    color: "#EA580C", icon: Cpu,       bg: "bg-[#EA580C]/15" },
  enterprise: { label: "Enterprise", color: "#7F77DD", icon: Building2, bg: "bg-[#7F77DD]/15" },
} as const;

type DomainKey = keyof typeof DOMAIN_META;

const DIFFICULTY_COLOR = {
  beginner:     "bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
  intermediate: "bg-amber-500/15   text-amber-500   border-amber-500/25",
  advanced:     "bg-rose-500/15    text-rose-500    border-rose-500/25",
};

/* ── Custom Node ── */
function LanguageNodeCustom({ data }: { data: any }) {
  const meta = DOMAIN_META[data.domain as DomainKey] ?? DOMAIN_META.web;
  return (
    <div
      className="group px-3.5 py-2.5 rounded-2xl border-2 bg-[#0d0f14]/90 backdrop-blur-md flex items-center gap-2.5 shadow-lg hover:shadow-2xl transition-all duration-200 select-none cursor-pointer min-w-[130px]"
      style={{
        borderColor: meta.color,
        boxShadow: `0 4px 18px -4px ${meta.color}35`,
      }}
    >
      <Handle type="target" position={Position.Top}    className="opacity-0 !w-0 !h-0" id="t-top" />
      <Handle type="target" position={Position.Left}   className="opacity-0 !w-0 !h-0" id="t-left" />
      <Handle type="target" position={Position.Right}  className="opacity-0 !w-0 !h-0" id="t-right" />
      <Handle type="target" position={Position.Bottom} className="opacity-0 !w-0 !h-0" id="t-bottom" />

      {/* Logo */}
      <div className="w-7 h-7 shrink-0 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${meta.color}20` }}
        dangerouslySetInnerHTML={{ __html: data.logoSvg }}
      />

      {/* Labels */}
      <div className="flex flex-col text-left">
        <span className="text-[12px] font-black text-white leading-tight">{data.name}</span>
        <span className="text-[8px] font-bold uppercase tracking-widest leading-none mt-0.5"
          style={{ color: meta.color }}>{meta.label}</span>
      </div>

      {/* Difficulty dot */}
      <div className="ml-auto shrink-0">
        <div className="w-2 h-2 rounded-full"
          style={{ backgroundColor: data.difficulty === "beginner" ? "#22c55e" : data.difficulty === "intermediate" ? "#f59e0b" : "#ef4444" }} />
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 !w-0 !h-0" id="s-bottom" />
      <Handle type="source" position={Position.Right}  className="opacity-0 !w-0 !h-0" id="s-right" />
      <Handle type="source" position={Position.Left}   className="opacity-0 !w-0 !h-0" id="s-left" />
      <Handle type="source" position={Position.Top}    className="opacity-0 !w-0 !h-0" id="s-top" />
    </div>
  );
}

const nodeTypes = { languageNode: LanguageNodeCustom };

/* ── Edge helper ── */
const mkEdge = (
  id: string, source: string, target: string, label: string,
  color: string, srcH: string, tgtH: string, dashed = false
) => ({
  id,
  source, target, label,
  sourceHandle: srcH,
  targetHandle: tgtH,
  style: { stroke: color, strokeWidth: 2, strokeDasharray: dashed ? "6 3" : undefined },
  markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
  labelStyle: { fill: "#9ca3af", fontSize: 9, fontWeight: 700 },
  labelBgStyle: { fill: "#0d0f14", fillOpacity: 0.85, rx: 4 },
  animated: true,
});

/* ── Node positions ── */
const INITIAL_NODES = [
  { id: "python",     pos: { x: 120, y: 160 }, domain: "data"       },
  { id: "javascript", pos: { x: 360, y: 60  }, domain: "web"        },
  { id: "typescript", pos: { x: 590, y: 60  }, domain: "web"        },
  { id: "java",       pos: { x: 730, y: 195 }, domain: "enterprise" },
  { id: "go",         pos: { x: 730, y: 360 }, domain: "systems"    },
  { id: "cpp",        pos: { x: 590, y: 450 }, domain: "systems"    },
  { id: "c",          pos: { x: 370, y: 450 }, domain: "systems"    },
  { id: "bash",       pos: { x: 130, y: 360 }, domain: "systems"    },
  { id: "sql",        pos: { x: 60,  y: 255 }, domain: "data"       },
  { id: "r",          pos: { x: 265, y: 270 }, domain: "data"       },
];

const INITIAL_EDGES_DEF = [
  { id:"e1", src:"python",     tgt:"javascript", lbl:"Full-Stack APIs",     sh:"s-right",  th:"t-left",   dom:"data"   },
  { id:"e2", src:"c",          tgt:"cpp",         lbl:"C++ extends C",       sh:"s-right",  th:"t-left",   dom:"systems"},
  { id:"e3", src:"c",          tgt:"python",      lbl:"CPython core",        sh:"s-left",   th:"t-bottom", dom:"systems"},
  { id:"e4", src:"javascript", tgt:"typescript",  lbl:"Typed superset",      sh:"s-right",  th:"t-left",   dom:"web"   },
  { id:"e5", src:"sql",        tgt:"python",      lbl:"Data analysis",       sh:"s-top",    th:"t-left",   dom:"data"  },
  { id:"e6", src:"java",       tgt:"javascript",  lbl:"Sync Frontend/Back",  sh:"s-top",    th:"t-right",  dom:"enterprise"},
  { id:"e7", src:"python",     tgt:"r",           lbl:"Data Science rivals", sh:"s-right",  th:"t-left",   dom:"data"  },
  { id:"e8", src:"cpp",        tgt:"java",        lbl:"Java inspired by C++",sh:"s-top",    th:"t-bottom", dom:"systems"},
  { id:"e9", src:"bash",       tgt:"c",           lbl:"Shell glue code",     sh:"s-right",  th:"t-left",   dom:"systems", dashed:true},
  { id:"e10",src:"go",         tgt:"java",        lbl:"Go vs Java backends", sh:"s-right",  th:"t-bottom", dom:"systems", dashed:true},
  { id:"e11",src:"typescript", tgt:"java",        lbl:"Enterprise patterns", sh:"s-right",  th:"t-top",    dom:"web",    dashed:true},
  { id:"e12",src:"sql",        tgt:"bash",        lbl:"DB scripting",        sh:"s-bottom", th:"t-top",    dom:"data",   dashed:true},
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function LanguageGraph() {
  const [mounted, setMounted]               = useState(false);
  const [selectedLanguage, setSelectedLang] = useState<LanguageNode | null>(null);
  const [activeDomain, setActiveDomain]     = useState<DomainKey | "all">("all");
  const [hoveredLang, setHoveredLang]       = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  /* Build nodes */
  const buildNodes = useCallback(() =>
    INITIAL_NODES.map(n => {
      const lang = LANGUAGES_DATA.find(l => l.id === n.id);
      return {
        id: n.id,
        type: "languageNode",
        position: n.pos,
        data: {
          name:       lang?.name       ?? n.id,
          domain:     n.domain,
          logoSvg:    lang?.logoSvg    ?? "",
          difficulty: lang?.difficulty ?? "beginner",
          color:      DOMAIN_META[n.domain as DomainKey]?.color ?? "#fff",
        },
      };
    }), []);

  const buildEdges = useCallback(() =>
    INITIAL_EDGES_DEF.map(e =>
      mkEdge(e.id, e.src, e.tgt, e.lbl,
        DOMAIN_META[e.dom as DomainKey]?.color ?? "#888",
        e.sh, e.th, e.dashed ?? false)
    ), []);

  const [nodes, , onNodesChange] = useNodesState(buildNodes());
  const [edges, , onEdgesChange] = useEdgesState(buildEdges());

  const handleNodeClick = (_: any, node: any) => {
    const lang = LANGUAGES_DATA.find(l => l.id === node.id);
    if (lang) setSelectedLang(lang);
  };

  if (!mounted) {
    return (
      <div className="h-[520px] w-full bg-[#0d0f14] border border-border/60 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">Loading Graph...</span>
      </div>
    );
  }

  const DOMAIN_KEYS = Object.keys(DOMAIN_META) as DomainKey[];

  return (
    <div className="space-y-5 select-none">

      {/* ── Controls bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter by Domain:
          </span>
          {/* All */}
          <button
            onClick={() => setActiveDomain("all")}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
              activeDomain === "all" ? "bg-foreground text-background border-foreground" : "bg-muted/30 text-muted-foreground border-border/40 hover:border-border"
            }`}
          >All</button>
          {DOMAIN_KEYS.map(dk => {
            const meta = DOMAIN_META[dk];
            const Icon = meta.icon;
            const isActive = activeDomain === dk;
            return (
              <button
                key={dk}
                onClick={() => setActiveDomain(dk)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer"
                style={{
                  color: isActive ? "#fff" : meta.color,
                  borderColor: isActive ? meta.color : `${meta.color}35`,
                  backgroundColor: isActive ? meta.color : `${meta.color}12`,
                }}
              >
                <Icon className="h-3 w-3" />{meta.label}
              </button>
            );
          })}
        </div>
        {/* Difficulty legend */}
        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          {[["beginner","#22c55e"],["intermediate","#f59e0b"],["advanced","#ef4444"]].map(([d,c]) => (
            <span key={d} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c as string }} />
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* ── ReactFlow Canvas ── */}
      <div className="hidden md:block h-[520px] w-full rounded-3xl overflow-hidden relative border border-border/40"
        style={{ background: "linear-gradient(135deg, #0a0c10 0%, #0d0f14 60%, #0f1118 100%)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.14 }}
          minZoom={0.4}
          maxZoom={2}
          nodesConnectable={false}
          nodesDraggable={true}
          edgesFocusable={false}
        >
          <Background color="#1e2433" gap={20} size={1} />
          <Controls
            className="!bg-[#0d0f14] !border-border !rounded-2xl !overflow-hidden [&_button]:!bg-[#0d0f14] [&_button]:!border-border [&_button]:!text-muted-foreground"
          />
          <MiniMap
            nodeColor={(n) => (DOMAIN_META[n.data?.domain as DomainKey]?.color ?? "#888")}
            maskColor="rgba(0,0,0,0.7)"
            className="!bg-[#0d0f14] !border-border !rounded-xl"
          />
        </ReactFlow>

        {/* Hint overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground pointer-events-none">
          <ZoomIn className="h-3 w-3" />
          Drag to rearrange · Click any node to inspect
        </div>
      </div>

      {/* ── Mobile Grid ── */}
      <div className="block md:hidden border border-border/60 rounded-3xl p-5 bg-card/60 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Language Explorer</p>
        <div className="grid grid-cols-2 gap-2.5">
          {LANGUAGES_DATA.map(lang => {
            const meta = DOMAIN_META[lang.domain as DomainKey];
            return (
              <button key={lang.id}
                onClick={() => setSelectedLang(lang)}
                className="p-3 rounded-2xl border-2 flex items-center gap-2 text-left transition-all cursor-pointer"
                style={{ borderColor: `${meta.color}30`, backgroundColor: `${meta.color}08` }}
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{ __html: lang.logoSvg }} />
                <div>
                  <p className="text-xs font-black text-foreground leading-none">{lang.name}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5" style={{ color: meta.color }}>{meta.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stat chips strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DOMAIN_KEYS.map(dk => {
          const meta  = DOMAIN_META[dk];
          const Icon  = meta.icon;
          const count = LANGUAGES_DATA.filter(l => l.domain === dk).length;
          return (
            <button
              key={dk}
              onClick={() => setActiveDomain(activeDomain === dk ? "all" : dk)}
              className="flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02]"
              style={{
                borderColor: activeDomain === dk ? meta.color : `${meta.color}25`,
                backgroundColor: `${meta.color}08`,
              }}
            >
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${meta.color}20` }}>
                <Icon className="h-4 w-4" style={{ color: meta.color }} />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-foreground leading-none">{count}</p>
                <p className="text-[9px] font-black uppercase tracking-wider mt-0.5" style={{ color: meta.color }}>{meta.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Language cards list (filtered) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            {activeDomain === "all" ? "All Languages" : `${DOMAIN_META[activeDomain].label} Languages`}
          </h3>
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-[10px] text-muted-foreground font-bold">Click to deep-dive</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {LANGUAGES_DATA
              .filter(l => activeDomain === "all" || l.domain === activeDomain)
              .map((lang, i) => {
                const meta = DOMAIN_META[lang.domain as DomainKey];
                const Icon = meta.icon;
                return (
                  <motion.button
                    key={lang.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18, delay: i * 0.04 }}
                    onClick={() => setSelectedLang(lang)}
                    onMouseEnter={() => setHoveredLang(lang.id)}
                    onMouseLeave={() => setHoveredLang(null)}
                    className="text-left p-4 rounded-2xl border-2 space-y-3 cursor-pointer transition-all duration-200 group w-full"
                    style={{
                      borderColor: hoveredLang === lang.id ? meta.color : `${meta.color}25`,
                      backgroundColor: `${meta.color}06`,
                      boxShadow: hoveredLang === lang.id ? `0 4px 20px ${meta.color}25` : undefined,
                    }}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${meta.color}20` }}
                          dangerouslySetInnerHTML={{ __html: lang.logoSvg }}
                        />
                        <div>
                          <p className="text-sm font-black text-foreground">{lang.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Icon className="h-2.5 w-2.5" style={{ color: meta.color }} />
                            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: meta.color }}>{meta.label}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase shrink-0 ${DIFFICULTY_COLOR[lang.difficulty]}`}>
                        {lang.difficulty}
                      </span>
                    </div>

                    {/* Tagline */}
                    <p className="text-[11px] text-muted-foreground font-semibold italic leading-relaxed">
                      &ldquo;{lang.tagline}&rdquo;
                    </p>

                    {/* Use cases */}
                    <div className="space-y-1">
                      {lang.useCases.slice(0, 2).map((u, ui) => (
                        <div key={ui} className="flex items-start gap-1.5">
                          <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" style={{ color: meta.color }} />
                          <span className="text-[10px] font-semibold text-muted-foreground">{u.split("(")[0].trim()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Roadmap tags + inspect hint */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {lang.usedInRoadmaps.map((r, ri) => {
                          const rColors: Record<string, string> = { aiml: "#7F77DD", webdev: "#378ADD", devops: "#1D9E75" };
                          return (
                            <span key={ri} className="text-[8px] font-black px-1.5 py-0.5 rounded-md border"
                              style={{ color: rColors[r.roadmap] ?? "#888", borderColor: `${rColors[r.roadmap] ?? "#888"}30`, backgroundColor: `${rColors[r.roadmap] ?? "#888"}12` }}>
                              {r.roadmap === "aiml" ? "AI/ML" : r.roadmap === "webdev" ? "Web Dev" : "DevOps"}
                            </span>
                          );
                        })}
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                        Details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </motion.button>
                );
              })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {selectedLanguage && (
          <LanguageDrawer language={selectedLanguage} onClose={() => setSelectedLang(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
