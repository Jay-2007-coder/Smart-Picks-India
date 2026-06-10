"use client";

import React, { useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Handle
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LANGUAGES_DATA, LanguageNode } from "@/data/languages";
import LanguageDrawer from "./LanguageDrawer";

// Custom Node component
function LanguageNodeCustom({ data }: any) {
  return (
    <div
      className="px-4 py-3 rounded-2xl border bg-card/90 backdrop-blur-md flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-all duration-200 select-none cursor-pointer"
      style={{
        borderColor: data.color,
        borderWidth: "1.5px",
        boxShadow: `0 4px 15px -4px ${data.color}25`
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0 w-0 h-0" id="t-top" />
      <Handle type="target" position={Position.Left} className="opacity-0 w-0 h-0" id="t-left" />
      <Handle type="target" position={Position.Right} className="opacity-0 w-0 h-0" id="t-right" />
      <Handle type="target" position={Position.Bottom} className="opacity-0 w-0 h-0" id="t-bottom" />

      <div
        className="w-6 h-6 shrink-0 flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: data.logoSvg }}
      />
      <div className="flex flex-col text-left">
        <span className="text-[11px] font-black text-foreground">{data.name}</span>
        <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider leading-none mt-0.5">{data.domain}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 w-0 h-0" id="s-bottom" />
      <Handle type="source" position={Position.Right} className="opacity-0 w-0 h-0" id="s-right" />
      <Handle type="source" position={Position.Left} className="opacity-0 w-0 h-0" id="s-left" />
      <Handle type="source" position={Position.Top} className="opacity-0 w-0 h-0" id="s-top" />
    </div>
  );
}

const nodeTypes = {
  languageNode: LanguageNodeCustom
};

export default function LanguageGraph() {
  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageNode | null>(null);

  // Set colors for domains
  const domainColors = {
    web: "#378ADD",       // Blue
    data: "#1D9E75",      // Green/Teal
    systems: "#EA580C",   // Orange
    enterprise: "#7F77DD" // Purple
  };

  // Formulate nodes
  const initialNodes = [
    {
      id: "python",
      type: "languageNode",
      position: { x: 120, y: 150 },
      data: { name: "Python", domain: "Data / AI", color: domainColors.data, logoSvg: LANGUAGES_DATA.find(l => l.id === "python")?.logoSvg }
    },
    {
      id: "javascript",
      type: "languageNode",
      position: { x: 340, y: 60 },
      data: { name: "JavaScript", domain: "Web", color: domainColors.web, logoSvg: LANGUAGES_DATA.find(l => l.id === "javascript")?.logoSvg }
    },
    {
      id: "typescript",
      type: "languageNode",
      position: { x: 560, y: 60 },
      data: { name: "TypeScript", domain: "Web", color: domainColors.web, logoSvg: LANGUAGES_DATA.find(l => l.id === "typescript")?.logoSvg }
    },
    {
      id: "java",
      type: "languageNode",
      position: { x: 700, y: 180 },
      data: { name: "Java", domain: "Enterprise", color: domainColors.enterprise, logoSvg: LANGUAGES_DATA.find(l => l.id === "java")?.logoSvg }
    },
    {
      id: "go",
      type: "languageNode",
      position: { x: 700, y: 340 },
      data: { name: "Go", domain: "Systems", color: domainColors.systems, logoSvg: LANGUAGES_DATA.find(l => l.id === "go")?.logoSvg }
    },
    {
      id: "cpp",
      type: "languageNode",
      position: { x: 560, y: 440 },
      data: { name: "C++", domain: "Systems", color: domainColors.systems, logoSvg: LANGUAGES_DATA.find(l => l.id === "cpp")?.logoSvg }
    },
    {
      id: "c",
      type: "languageNode",
      position: { x: 340, y: 440 },
      data: { name: "C", domain: "Systems", color: domainColors.systems, logoSvg: LANGUAGES_DATA.find(l => l.id === "c")?.logoSvg }
    },
    {
      id: "bash",
      type: "languageNode",
      position: { x: 120, y: 340 },
      data: { name: "Bash", domain: "Systems", color: domainColors.systems, logoSvg: LANGUAGES_DATA.find(l => l.id === "bash")?.logoSvg }
    },
    {
      id: "sql",
      type: "languageNode",
      position: { x: 60, y: 245 },
      data: { name: "SQL", domain: "Data / AI", color: domainColors.data, logoSvg: LANGUAGES_DATA.find(l => l.id === "sql")?.logoSvg }
    },
    {
      id: "r",
      type: "languageNode",
      position: { x: 250, y: 250 },
      data: { name: "R", domain: "Data / AI", color: domainColors.data, logoSvg: LANGUAGES_DATA.find(l => l.id === "r")?.logoSvg }
    }
  ];

  // Formulate edges
  const initialEdges = [
    {
      id: "e-py-js",
      source: "python",
      target: "javascript",
      label: "Full-Stack APIs",
      style: { stroke: domainColors.data, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.data },
      sourceHandle: "s-right",
      targetHandle: "t-left"
    },
    {
      id: "e-c-cpp",
      source: "c",
      target: "cpp",
      label: "C++ extends C",
      style: { stroke: domainColors.systems, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.systems },
      sourceHandle: "s-right",
      targetHandle: "t-left"
    },
    {
      id: "e-c-py",
      source: "c",
      target: "python",
      label: "Interpreter Core",
      style: { stroke: domainColors.systems, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.systems },
      sourceHandle: "s-left",
      targetHandle: "t-bottom"
    },
    {
      id: "e-js-ts",
      source: "javascript",
      target: "typescript",
      label: "Typed JS",
      style: { stroke: domainColors.web, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.web },
      sourceHandle: "s-right",
      targetHandle: "t-left"
    },
    {
      id: "e-sql-py",
      source: "sql",
      target: "python",
      label: "Data Analysis",
      style: { stroke: domainColors.data, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.data },
      sourceHandle: "s-top",
      targetHandle: "t-left"
    },
    {
      id: "e-java-js",
      source: "java",
      target: "javascript",
      label: "Sync Frontend/Back",
      style: { stroke: domainColors.enterprise, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.enterprise },
      sourceHandle: "s-top",
      targetHandle: "t-right"
    },
    {
      id: "e-py-r",
      source: "python",
      target: "r",
      label: "Data Science rivals",
      style: { stroke: domainColors.data, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.data },
      sourceHandle: "s-right",
      targetHandle: "t-left"
    },
    {
      id: "e-cpp-java",
      source: "cpp",
      target: "java",
      label: "Java inspired by C++",
      style: { stroke: domainColors.systems, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.systems },
      sourceHandle: "s-top",
      targetHandle: "t-bottom"
    },
    {
      id: "e-bash-all",
      source: "bash",
      target: "c",
      label: "Shell script glue",
      style: { stroke: domainColors.systems, strokeWidth: 1.5, strokeDasharray: "4" },
      markerEnd: { type: MarkerType.ArrowClosed, color: domainColors.systems },
      sourceHandle: "s-right",
      targetHandle: "t-left"
    }
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodeClick = (_: any, node: any) => {
    const langObj = LANGUAGES_DATA.find(l => l.id === node.id);
    if (langObj) {
      setSelectedLanguage(langObj);
    }
  };

  const handleCardClick = (langId: string) => {
    const langObj = LANGUAGES_DATA.find(l => l.id === langId);
    if (langObj) {
      setSelectedLanguage(langObj);
    }
  };

  if (!mounted) {
    return (
      <div className="h-[480px] w-full bg-card border border-border/80 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-black uppercase tracking-widest animate-pulse">Loading Graph...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      {/* Desktop Map Canvas */}
      <div className="hidden md:block h-[500px] w-full bg-card border border-border/80 rounded-3xl overflow-hidden relative shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesConnectable={false}
          nodesDraggable={true}
        >
          <Background color="currentColor" className="text-muted/10" gap={16} size={1} />
          <Controls className="!bg-card !border-border !shadow-sm !rounded-xl !overflow-hidden [&_button]:!bg-card [&_button]:!border-border [&_button]:!text-foreground hover:[&_button]:!bg-muted" />
        </ReactFlow>
        <div className="absolute top-4 left-4 p-3 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
          💡 Drag nodes to tidy layout • Click to inspect
        </div>
      </div>

      {/* Mobile Simplified 2D List */}
      <div className="block md:hidden border border-border/80 rounded-3xl p-5 bg-card/60 backdrop-blur-md space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Ecosystem Languages List
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {LANGUAGES_DATA.slice(0, 10).map(lang => (
            <button
              key={lang.id}
              onClick={() => handleCardClick(lang.id)}
              className="p-3 rounded-2xl border border-border bg-card flex items-center gap-2 shadow-sm text-left hover:border-brand-500/40 cursor-pointer"
            >
              <div
                className="w-5 h-5 flex items-center justify-center shrink-0"
                dangerouslySetInnerHTML={{ __html: lang.logoSvg }}
              />
              <div className="flex flex-col">
                <span className="text-xs font-black text-foreground leading-none">{lang.name}</span>
                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{lang.domain}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail inspect Side Drawer */}
      <LanguageDrawer
        language={selectedLanguage}
        onClose={() => setSelectedLanguage(null)}
      />
    </div>
  );
}
