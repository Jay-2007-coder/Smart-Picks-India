"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft, FileCode, Play, RefreshCw, AlertTriangle, Copy,
  Check, Lock, ChevronDown, ChevronUp, Sparkles, Download,
  BookOpen, Code2, Layers, Cpu, Users, FlaskConical, BarChart3,
  FileText, Lightbulb, Target, Zap, Clock, Building2, Star, ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ─────────────── TYPES ─────────────── */
type ReportType = "mini-project" | "final-year" | "lab-manual" | "research-paper";
type Domain = "web" | "aiml" | "mobile" | "iot" | "security" | "blockchain" | "cloud" | "general";

const REPORT_TYPES: { id: ReportType; label: string; desc: string; icon: React.ElementType; badge: string }[] = [
  { id: "mini-project",  label: "Mini Project",      desc: "3rd/4th sem college project report",    icon: Code2,       badge: "~6 sections"  },
  { id: "final-year",    label: "Final Year Thesis",  desc: "Comprehensive thesis / capstone report", icon: BookOpen,    badge: "~12 sections" },
  { id: "lab-manual",    label: "Lab Manual",         desc: "Experiment-based documentation",         icon: FlaskConical,badge: "Per experiment"},
  { id: "research-paper",label: "Research Abstract",  desc: "IEEE/ACM style abstract + outline",      icon: FileText,    badge: "~5 sections"  },
];

const DOMAIN_OPTIONS: { id: Domain; label: string; color: string }[] = [
  { id: "web",        label: "Web Development",  color: "#378ADD" },
  { id: "aiml",       label: "AI / ML",          color: "#7F77DD" },
  { id: "mobile",     label: "Mobile App",       color: "#f59e0b" },
  { id: "iot",        label: "IoT / Embedded",   color: "#22c55e" },
  { id: "security",   label: "Cybersecurity",    color: "#ef4444" },
  { id: "blockchain", label: "Blockchain / Web3",color: "#ea580c" },
  { id: "cloud",      label: "Cloud / DevOps",   color: "#1D9E75" },
  { id: "general",    label: "General / Other",  color: "#6b7280" },
];

const TEMPLATE_EXAMPLES = [
  { title: "Smart Attendance System",  stack: "Python, OpenCV, Flask, SQLite",        desc: "Face-recognition based automated attendance using CNN.",                         type: "mini-project"  as ReportType, domain: "aiml"   as Domain },
  { title: "E-Commerce Platform",      stack: "React, Node.js, MongoDB, Stripe",      desc: "Full-stack marketplace with cart, payments, and seller dashboard.",              type: "final-year"    as ReportType, domain: "web"    as Domain },
  { title: "IoT Smart Home System",    stack: "Arduino, MQTT, React, Node.js",        desc: "Home automation using IoT sensors with a real-time dashboard.",                  type: "mini-project"  as ReportType, domain: "iot"    as Domain },
  { title: "Blockchain Voting DApp",   stack: "Solidity, Hardhat, ethers.js, Next.js",desc: "Decentralised voting application on Ethereum with verifiable audit trail.",       type: "final-year"    as ReportType, domain: "blockchain" as Domain },
  { title: "ML Fraud Detection",       stack: "Python, Scikit-learn, FastAPI, React", desc: "Real-time credit-card fraud classifier with explainable AI dashboard.",           type: "research-paper"as ReportType, domain: "aiml"   as Domain },
  { title: "Network Intrusion System", stack: "Python, Snort, Suricata, Grafana",     desc: "ML-powered IDS/IPS for detecting anomalous network traffic.",                    type: "mini-project"  as ReportType, domain: "security"as Domain },
];

const LOADING_MESSAGES = [
  "Drafting Abstract & Problem Statement...",
  "Generating System Architecture diagram description...",
  "Writing Literature Review references...",
  "Composing Methodology & Design sections...",
  "Structuring Test Cases & Expected Results...",
  "Finalising Conclusion & Future Scope...",
];

/* ─────────────── MARKDOWN RENDERER ─────────────── */
function ReportRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none text-[13px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-black text-foreground mt-6 mb-2 pb-2 border-b border-border/50 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-black text-foreground mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-black text-foreground/90 mt-4 mb-1.5">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-muted-foreground font-semibold leading-relaxed mb-3 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-muted-foreground font-semibold leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-black text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-brand-400">{children}</em>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre className="bg-[#0d0f14] border border-border/40 rounded-xl p-4 overflow-x-auto my-3">
                  <code className="text-[11px] font-mono text-emerald-400">{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-muted/60 px-1.5 py-0.5 rounded text-[11px] font-mono text-brand-400">{children}</code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-500/50 pl-4 italic text-muted-foreground my-3">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-xs border-collapse border border-border/50 rounded-xl overflow-hidden">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-muted/40 border border-border/40 px-3 py-2 text-left font-black text-foreground text-[10px] uppercase tracking-wider">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-border/30 px-3 py-2 text-muted-foreground">{children}</td>
          ),
          hr: () => <hr className="border-border/40 my-5" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ─────────────── SECTION PANEL ─────────────── */
function SectionPanel({ title, icon: Icon, color, children }: {
  title: string; icon: React.ElementType; color: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/40"
        style={{ backgroundColor: `${color}10` }}>
        <Icon className="h-4 w-4 shrink-0" style={{ color }} />
        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color }}>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function ProjectReportGenerator() {
  const { user, loading: authLoading } = useAuth();

  /* form state */
  const [reportType, setReportType]     = useState<ReportType>("mini-project");
  const [domain, setDomain]             = useState<Domain>("web");
  const [title, setTitle]               = useState("");
  const [techStack, setTechStack]       = useState("");
  const [description, setDescription]  = useState("");
  const [teamSize, setTeamSize]         = useState("1");
  const [duration, setDuration]         = useState("3 months");
  const [objectives, setObjectives]     = useState("");
  const [collegeName, setCollegeName]   = useState("");

  /* UI state */
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [report, setReport]       = useState("");
  const [copied, setCopied]       = useState(false);
  const [loadMsg, setLoadMsg]     = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoaded, setIsLoaded]   = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);
  const loadInterval = useRef<NodeJS.Timeout | null>(null);

  /* Auto-restore saved inputs from localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("smartpicks_project_report_data_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.reportType) setReportType(parsed.reportType);
        if (parsed.domain) setDomain(parsed.domain);
        if (parsed.title !== undefined) setTitle(parsed.title);
        if (parsed.techStack !== undefined) setTechStack(parsed.techStack);
        if (parsed.description !== undefined) setDescription(parsed.description);
        if (parsed.teamSize !== undefined) setTeamSize(parsed.teamSize);
        if (parsed.duration !== undefined) setDuration(parsed.duration);
        if (parsed.objectives !== undefined) setObjectives(parsed.objectives);
        if (parsed.collegeName !== undefined) setCollegeName(parsed.collegeName);
        if (parsed.report !== undefined) setReport(parsed.report);
      }
    } catch (e) {
      console.error("Failed to load saved project report data:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /* Auto-save inputs to localStorage */
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        reportType,
        domain,
        title,
        techStack,
        description,
        teamSize,
        duration,
        objectives,
        collegeName,
        report,
      };
      localStorage.setItem("smartpicks_project_report_data_v1", JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to auto-save project report data:", e);
    }
  }, [reportType, domain, title, techStack, description, teamSize, duration, objectives, collegeName, report, isLoaded]);

  const handleResetDefaults = () => {
    setTitle("");
    setTechStack("");
    setDescription("");
    setTeamSize("1");
    setDuration("3 months");
    setObjectives("");
    setCollegeName("");
    setReport("");
    localStorage.removeItem("smartpicks_project_report_data_v1");
  };

  /* Cycle through loading messages */
  useEffect(() => {
    if (loading) {
      setLoadMsg(0);
      loadInterval.current = setInterval(() => {
        setLoadMsg(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2200);
    } else {
      if (loadInterval.current) clearInterval(loadInterval.current);
    }
    return () => { if (loadInterval.current) clearInterval(loadInterval.current); };
  }, [loading]);

  /* Scroll to report on generate */
  useEffect(() => {
    if (report && reportRef.current) {
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [report]);

  const fillTemplate = (tpl: typeof TEMPLATE_EXAMPLES[0]) => {
    setTitle(tpl.title);
    setTechStack(tpl.stack);
    setDescription(tpl.desc);
    setReportType(tpl.type);
    setDomain(tpl.domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !techStack.trim()) {
      setError("Please fill out Title, Tech Stack, and Description.");
      return;
    }
    setLoading(true);
    setError("");
    setReport("");
    setCopied(false);

    try {
      const res = await fetch("/api/v1/student-hub/project-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, techStack,
          reportType, domain, teamSize, duration, objectives, collegeName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReport(data.report);
      } else {
        setError(data.message || "Failed to generate report. Please try again.");
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    if (!report) return;

    // Light markdown → HTML converter
    const lines = report.split("\n");
    const htmlLines: string[] = [];
    let inCode = false;

    lines.forEach(line => {
      if (/^```/.test(line)) {
        inCode = !inCode;
        htmlLines.push(inCode ? `<pre><code>` : `</code></pre>`);
        return;
      }
      if (inCode) { htmlLines.push(line); return; }

      if (/^# (.+)/.test(line))        { htmlLines.push(`<h1>${line.replace(/^# /, "")}</h1>`); return; }
      if (/^## (.+)/.test(line))       { htmlLines.push(`<h2>${line.replace(/^## /, "")}</h2>`); return; }
      if (/^### (.+)/.test(line))      { htmlLines.push(`<h3>${line.replace(/^### /, "")}</h3>`); return; }
      if (/^#### (.+)/.test(line))     { htmlLines.push(`<h4>${line.replace(/^#### /, "")}</h4>`); return; }
      if (/^- (.+)/.test(line))        { htmlLines.push(`<li>${line.replace(/^- /, "")}</li>`); return; }
      if (/^\d+\. (.+)/.test(line))    { htmlLines.push(`<li>${line.replace(/^\d+\. /, "")}</li>`); return; }
      if (/^---/.test(line))           { htmlLines.push(`<hr/>`); return; }
      if (line.trim() === "")          { htmlLines.push(`<br/>`); return; }

      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`(.+?)`/g, "<code>$1</code>");
      htmlLines.push(`<p>${formatted}</p>`);
    });

    const cleanTitle = title || "Project Report";
    const dateStr    = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <!-- Empty title removes browser's "title" header from print -->
  <title></title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Fira+Code:wght@400;500&display=swap');

    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── KEY FIX: zero @page margins removes browser date/title/page-number headers ── */
    @page {
      size: A4;
      margin: 0;
    }

    html, body {
      width: 210mm;
      font-family: 'Inter', Arial, sans-serif;
      font-size: 11.5pt;
      color: #1a1a2e;
      line-height: 1.75;
      background: #fff;
    }

    /* ── Screen-only tip banner ── */
    .print-tip {
      display: block;
      background: #1a1a2e;
      color: #fff;
      text-align: center;
      padding: 14px 20px;
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .print-tip span { color: #7F77DD; font-weight: 900; }
    @media print { .print-tip { display: none !important; } }

    /* ── Cover Page ── */
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 210mm;
      min-height: 297mm;
      padding: 60px 50px;
      text-align: center;
      background: linear-gradient(160deg, #f8f7ff 0%, #eef4ff 60%, #f0fff8 100%);
      page-break-after: always;
    }
    .cover-icon {
      width: 80px; height: 80px;
      background: linear-gradient(135deg, #7F77DD, #378ADD);
      border-radius: 22px;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px;
      margin: 0 auto 28px;
      box-shadow: 0 8px 32px rgba(127,119,221,0.3);
    }
    .cover h1 {
      font-size: 26pt;
      font-weight: 900;
      color: #1a1a2e;
      line-height: 1.2;
      margin-bottom: 10px;
      border: none;
      padding: 0;
    }
    .cover-subtitle {
      font-size: 11pt;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 42px;
    }
    .cover-divider {
      width: 60px; height: 4px;
      background: linear-gradient(90deg, #7F77DD, #378ADD);
      border-radius: 2px;
      margin: 0 auto 42px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      width: 100%;
      max-width: 460px;
      margin: 0 auto 48px;
    }
    .meta-card {
      background: #fff;
      border: 1.5px solid #e5e7eb;
      border-radius: 14px;
      padding: 14px 18px;
      text-align: left;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .meta-card .label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #9ca3af;
      font-weight: 800;
      display: block;
      margin-bottom: 4px;
    }
    .meta-card .value {
      font-size: 10pt;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.3;
    }
    .cover-footer {
      font-size: 9pt;
      color: #b0b8cc;
      border-top: 1px solid #e5e7eb;
      padding-top: 18px;
      width: 100%;
      max-width: 460px;
      margin: 0 auto;
    }

    /* ── Content Pages ── */
    .content {
      padding: 18mm 20mm;
      width: 210mm;
      min-height: 297mm;
    }

    h1 {
      font-size: 16pt;
      font-weight: 900;
      color: #1a1a2e;
      margin: 30px 0 10px;
      padding-bottom: 8px;
      border-bottom: 3px solid #7F77DD;
    }
    h1:first-child { margin-top: 0; }

    h2 {
      font-size: 13pt;
      font-weight: 800;
      color: #2d2b55;
      margin: 22px 0 8px;
    }
    h3 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #374151;
      margin: 16px 0 6px;
    }
    h4 {
      font-size: 11pt;
      font-weight: 700;
      color: #4b5563;
      margin: 12px 0 4px;
    }

    p { margin-bottom: 10px; color: #374151; }

    ul, ol { padding-left: 22px; margin-bottom: 12px; }
    li { margin-bottom: 5px; color: #374151; line-height: 1.7; }

    strong { font-weight: 900; color: #1a1a2e; }
    em     { color: #7F77DD; font-style: italic; }

    code {
      background: #f1f0ff;
      color: #7F77DD;
      padding: 1px 5px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 10pt;
    }

    pre {
      background: #1a1a2e;
      color: #a9b2c3;
      padding: 16px 20px;
      border-radius: 10px;
      margin: 14px 0;
      font-family: 'Fira Code', monospace;
      font-size: 9pt;
      line-height: 1.65;
      white-space: pre-wrap;
      word-break: break-word;
    }
    pre code { background: none; color: inherit; padding: 0; }

    hr { border: none; border-top: 1.5px solid #e5e7eb; margin: 22px 0; }

    blockquote {
      border-left: 4px solid #7F77DD;
      padding-left: 16px;
      color: #6b7280;
      font-style: italic;
      margin: 14px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 10pt;
    }
    th {
      background: #f1f0ff;
      color: #1a1a2e;
      font-weight: 800;
      padding: 10px 12px;
      text-align: left;
      border: 1px solid #d1d5db;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    td { padding: 9px 12px; border: 1px solid #e5e7eb; color: #374151; }
    tr:nth-child(even) td { background: #f9f9ff; }

    @media print {
      .cover { page-break-after: always; }
      h1, h2, h3 { page-break-after: avoid; }
      pre, table { page-break-inside: avoid; }
      li { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- Screen-only tip: hidden during print -->
  <div class="print-tip">
    ⚠️ In the print dialog, <span>uncheck "Headers and footers"</span> then choose <span>Save as PDF</span> for a clean document.
  </div>

  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-icon">📄</div>
    <h1>${cleanTitle}</h1>
    <p class="cover-subtitle">Project Documentation Report</p>
    <div class="cover-divider"></div>
    <div class="meta-grid">
      ${collegeName ? `<div class="meta-card"><span class="label">Institution</span><span class="value">${collegeName}</span></div>` : ""}
      <div class="meta-card"><span class="label">Report Type</span><span class="value">${selectedRType.label}</span></div>
      <div class="meta-card"><span class="label">Tech Stack</span><span class="value">${techStack}</span></div>
      <div class="meta-card"><span class="label">Domain</span><span class="value">${selectedDomain.label}</span></div>
      ${teamSize ? `<div class="meta-card"><span class="label">Team Size</span><span class="value">${teamSize} Member(s)</span></div>` : ""}
      ${duration ? `<div class="meta-card"><span class="label">Duration</span><span class="value">${duration}</span></div>` : ""}
      <div class="meta-card"><span class="label">Date</span><span class="value">${dateStr}</span></div>
    </div>
    <div class="cover-footer">Smart Picks India — AI Project Report Writer</div>
  </div>

  <!-- Report Content -->
  <div class="content">
    ${htmlLines.join("\n")}
  </div>

</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=960,height=800");
    if (!printWindow) {
      alert("Please allow pop-ups for this site to download the PDF.");
      return;
    }
    // Write HTML — empty title prevents browser from adding "Title" header in print
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    // Trigger print after fonts settle
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 900);
    };
  };

  /* ── Loading state ── */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-7 w-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  /* ── Auth gate ── */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight">Access Restricted</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in to access the AI Project Report Generator and other student tools.
            </p>
          </div>
          <Link href="/login?redirect=/student-hub/project-report-generator"
            className="flex h-11 w-full items-center justify-center bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow transition-all active:scale-95">
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-black text-muted-foreground hover:text-foreground">
            Back to Student Hub
          </Link>
        </div>
      </div>
    );
  }

  const selectedRType = REPORT_TYPES.find(r => r.id === reportType)!;
  const selectedDomain = DOMAIN_OPTIONS.find(d => d.id === domain)!;

  return (
    <div className="min-h-screen py-10">
      <div className="container-custom max-w-6xl space-y-8">

        {/* Back */}
        <Link href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* ── Page Header ── */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 p-7 sm:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500/6 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/8 text-brand-500 text-[10px] font-black uppercase tracking-widest">
                  <FileCode className="h-3.5 w-3.5" /> AI-Powered Report Generator
                </div>
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" /> Auto-saved
                </span>
                <button
                  onClick={handleResetDefaults}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-full border border-border transition-colors cursor-pointer"
                  title="Clear saved form inputs"
                >
                  Clear Inputs
                </button>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
                Project Report<br />
                <span className="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">Writer Pro</span>
              </h1>
              <p className="text-sm text-muted-foreground font-semibold max-w-lg leading-relaxed">
                Generate structured, college-ready project documentation — Mini Projects, Final Year Thesis, Lab Manuals, and Research Abstracts — powered by Gemini AI.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { icon: Layers,   label: "4 Report Types",  color: "#7F77DD" },
                { icon: Cpu,      label: "8 Tech Domains",  color: "#378ADD" },
                { icon: BookOpen, label: "IEEE Format",      color: "#1D9E75" },
                { icon: Zap,      label: "Instant Draft",    color: "#f59e0b" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-2xl border border-border/40 bg-card/60">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: s.color }} />
                    <span className="text-[10px] font-black text-foreground">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Quick Template Examples ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Templates — Click to Auto-Fill</p>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin">
            {TEMPLATE_EXAMPLES.map((tpl, i) => {
              const domainMeta = DOMAIN_OPTIONS.find(d => d.id === tpl.domain)!;
              return (
                <button key={i}
                  onClick={() => fillTemplate(tpl)}
                  className="shrink-0 w-[220px] text-left p-4 rounded-2xl border-2 border-border/40 bg-card hover:border-brand-500/40 hover:bg-brand-500/4 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ color: domainMeta.color, backgroundColor: `${domainMeta.color}15` }}>
                      {domainMeta.label}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs font-black text-foreground leading-tight">{tpl.title}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed line-clamp-2">{tpl.desc}</p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 truncate">{tpl.stack}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-2 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Report Type Selector */}
              <SectionPanel title="Report Type" icon={FileText} color="#7F77DD">
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_TYPES.map(rt => {
                    const Icon = rt.icon;
                    const active = reportType === rt.id;
                    return (
                      <button key={rt.id} type="button" onClick={() => setReportType(rt.id)}
                        className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all space-y-1 ${
                          active ? "border-brand-500 bg-brand-500/10" : "border-border/40 bg-card hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: active ? "#7F77DD" : undefined }} />
                          <span className="text-[10px] font-black text-foreground leading-tight">{rt.label}</span>
                        </div>
                        <p className="text-[8px] text-muted-foreground font-semibold leading-tight">{rt.badge}</p>
                      </button>
                    );
                  })}
                </div>
              </SectionPanel>

              {/* Domain */}
              <SectionPanel title="Technology Domain" icon={Cpu} color="#378ADD">
                <div className="grid grid-cols-2 gap-1.5">
                  {DOMAIN_OPTIONS.map(d => {
                    const active = domain === d.id;
                    return (
                      <button key={d.id} type="button" onClick={() => setDomain(d.id)}
                        className="px-2.5 py-2 rounded-xl text-[10px] font-black border-2 transition-all cursor-pointer text-left"
                        style={{
                          borderColor: active ? d.color : undefined,
                          backgroundColor: active ? `${d.color}15` : undefined,
                          color: active ? d.color : undefined,
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </SectionPanel>

              {/* Core Fields */}
              <SectionPanel title="Project Details" icon={Target} color="#1D9E75">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Project Title *</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                      placeholder="e.g. Smart Face-Recognition Attendance System"
                      className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tech Stack / Frameworks *</label>
                    <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)} required
                      placeholder="e.g. Python, OpenCV, Flask, SQLite"
                      className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Project Description *</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4}
                      placeholder="What does the project do? What problem does it solve? Who are the users?"
                      className="w-full rounded-xl border border-input bg-background p-3 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed" />
                  </div>
                </div>
              </SectionPanel>

              {/* Advanced toggle */}
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-border/60 text-xs font-black text-muted-foreground hover:text-foreground hover:border-border cursor-pointer transition-all">
                <span className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5" />
                  Advanced Options (College, Team Size, Duration)
                </span>
                {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <SectionPanel title="Advanced Details" icon={Building2} color="#f59e0b">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">College / University Name</label>
                          <input type="text" value={collegeName} onChange={e => setCollegeName(e.target.value)}
                            placeholder="e.g. VIT University, Chennai"
                            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Team Size</label>
                            <select value={teamSize} onChange={e => setTeamSize(e.target.value)}
                              className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none">
                              {["1","2","3","4","5","6+"].map(n => <option key={n} value={n}>{n} member{n !== "1" ? "s" : ""}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Duration</label>
                            <select value={duration} onChange={e => setDuration(e.target.value)}
                              className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none">
                              {["2 weeks","1 month","3 months","6 months","1 year"].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Key Objectives (optional)</label>
                          <textarea value={objectives} onChange={e => setObjectives(e.target.value)} rows={3}
                            placeholder="List 2–3 specific goals or outcomes of this project..."
                            className="w-full rounded-xl border border-input bg-background p-3 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed" />
                        </div>
                      </div>
                    </SectionPanel>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-2.5 p-3 bg-rose-500/5 border border-rose-500/15 text-[11px] text-rose-500 font-bold rounded-xl">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                    {error.includes("limit of 3 AI assistance runs") && (
                      <Link href="/student-hub/upgrade" className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[9px] uppercase tracking-wider font-black transition-colors self-start shadow-sm shadow-rose-500/10">
                        <Zap className="h-3 w-3 fill-current text-white animate-pulse" /> Upgrade to Pro
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="relative w-full h-12 rounded-2xl text-sm font-black text-white shadow-lg overflow-hidden cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: loading ? undefined : "linear-gradient(135deg, #7F77DD 0%, #378ADD 100%)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate {selectedRType.label} Report
                  </span>
                )}
              </motion.button>
            </form>
          </div>

          {/* ── RIGHT: Output ── */}
          <div className="lg:col-span-3 space-y-4" ref={reportRef}>

            {/* Empty state */}
            {!loading && !report && (
              <div className="rounded-3xl border-2 border-dashed border-border/50 p-14 flex flex-col items-center justify-center text-center space-y-5">
                <div className="p-5 rounded-3xl bg-brand-500/8 border border-brand-500/15">
                  <FileCode className="h-12 w-12 text-brand-500/50" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-foreground">Report will appear here</h3>
                  <p className="text-xs text-muted-foreground font-semibold max-w-xs leading-relaxed mx-auto">
                    Fill in the form on the left and click <strong className="text-foreground">Generate Report</strong>. The AI will draft a complete, structured document.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-2">
                  {[
                    { icon: BookOpen,   label: "Abstract",         color: "#7F77DD" },
                    { icon: Layers,     label: "Architecture",     color: "#378ADD" },
                    { icon: BarChart3,  label: "Test Cases",       color: "#1D9E75" },
                    { icon: FlaskConical,label:"Methodology",      color: "#f59e0b" },
                    { icon: Users,      label: "Team & Scope",     color: "#ea580c" },
                    { icon: Target,     label: "Objectives",       color: "#22c55e" },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/40 bg-card/50">
                        <Icon className="h-4 w-4" style={{ color: s.color }} />
                        <span className="text-[9px] font-black text-muted-foreground text-center">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="rounded-3xl border border-border/60 bg-card p-10 flex flex-col items-center justify-center text-center space-y-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #7F77DD20, #378ADD20)" }}>
                    <RefreshCw className="h-8 w-8 animate-spin" style={{ color: "#7F77DD" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-foreground">Composing your {selectedRType.label}</h3>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadMsg}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="text-xs text-muted-foreground font-semibold"
                    >
                      {LOADING_MESSAGES[loadMsg]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                {/* Progress dots */}
                <div className="flex gap-2">
                  {LOADING_MESSAGES.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{ backgroundColor: i === loadMsg ? "#7F77DD" : "#7F77DD30" }} />
                  ))}
                </div>
              </div>
            )}

            {/* Report Output */}
            <AnimatePresence>
              {report && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden"
                >
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Report Draft</p>
                        <p className="text-xs font-black text-foreground leading-none mt-0.5">{title}</p>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ color: selectedDomain.color, backgroundColor: `${selectedDomain.color}15` }}>
                        {selectedDomain.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border border-border/60 hover:bg-muted transition-all cursor-pointer">
                        {copied ? <><Check className="h-3 w-3 text-emerald-500" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                      </button>
                      <button onClick={handleDownload}
                        title="Opens a print window — choose 'Save as PDF' in the print dialog"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-brand-500 text-white border border-brand-500 hover:bg-brand-600 transition-all cursor-pointer shadow-sm">
                        <Download className="h-3 w-3" /> Download PDF
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto max-h-[72vh]">
                    <ReportRenderer content={report} />
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-bold">
                      Generated by Gemini AI · Always review before submission
                    </p>
                    <button onClick={() => { setReport(""); setTitle(""); setDescription(""); setTechStack(""); }}
                      className="text-[10px] font-black text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> New Report
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Bottom Info Strip ── */}
        <div className="rounded-3xl border border-border/50 bg-gradient-to-r from-card via-muted/10 to-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center mb-5">What Gets Generated</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen,    color: "#7F77DD", title: "Abstract",              desc: "Problem statement, objectives, and brief methodology overview" },
              { icon: Layers,      color: "#378ADD", title: "System Architecture",   desc: "Component diagrams, data flow, and module breakdown" },
              { icon: FlaskConical,color: "#1D9E75", title: "Methodology",            desc: "Development model, tools, testing strategy, and workflow" },
              { icon: BarChart3,   color: "#f59e0b", title: "Results & Conclusion",  desc: "Expected outcomes, test cases, future scope, and references" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <Icon className="h-4 w-4" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
