import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, topic } = body;
    const sub = subject || "Java";
    const top = topic && topic.trim() ? topic.trim() : "Core Architecture";

    const mindmapData = {
      id: "root",
      label: `${sub} — ${top}`,
      color: "#a855f7",
      expanded: true,
      children: [
        {
          id: `b1-${Date.now()}`,
          label: "1. Core Principles",
          color: "#ea580c",
          expanded: true,
          children: [{ id: "s1", label: `${top} Mechanisms` }, { id: "s2", label: "Runtime Contracts" }]
        },
        {
          id: `b2-${Date.now()}`,
          label: "2. Practical Applications",
          color: "#3b82f6",
          expanded: true,
          children: [{ id: "s3", label: "Syntax & Code Implementation" }, { id: "s4", label: "Memory & State Flow" }]
        },
        {
          id: `b3-${Date.now()}`,
          label: "3. Exam & High-Yield Scenarios",
          color: "#10b981",
          expanded: true,
          children: [{ id: "s5", label: "High-Frequency Questions" }, { id: "s6", label: "Pitfalls & Troubleshooting" }]
        }
      ]
    };

    return NextResponse.json({ success: true, mindmap: mindmapData });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      mindmap: {
        id: "root",
        label: "Study Overview",
        children: [{ id: "b1", label: "Core Principles", children: [{ id: "s1", label: "Concepts" }] }]
      }
    });
  }
}
