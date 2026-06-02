"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileCode, Play, RefreshCw, AlertTriangle, Copy, Check, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ProjectReportGenerator() {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !techStack.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setReport("");
    setCopied(false);

    try {
      const response = await fetch("/api/v1/student-hub/project-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, techStack }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setReport(data.report);
      } else {
        setError(data.message || "Failed to generate project report. Please try again.");
      }
    } catch (err) {
      setError("An error occurred connecting to the service. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If loading user state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Checking access...</p>
        </div>
      </div>
    );
  }

  // Access check
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight">Access Restricted</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please sign in to your SmartPicks account to access the AI Project Report Generator and other student tools.
            </p>
          </div>
          <Link
            href={`/login?redirect=/student-hub/project-report-generator`}
            className="flex h-11 w-full items-center justify-center bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow transition-all active:scale-95 cursor-pointer"
          >
            Sign In to Continue
          </Link>
          <Link href="/student-hub" className="block text-[11px] font-black text-muted-foreground hover:text-foreground">
            Back to Student Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-5xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Title Header */}
        <div className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Project Report Writer</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Input project concepts and tech coordinates to generate structured college lab/final-year thesis documentation drafts.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
            <FileCode className="h-4 w-4" /> documentation
          </span>
        </div>

        {/* Grid layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form parameters */}
          <div className="lg:col-span-5">
            <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
              {/* Project title */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Ledger Chat App"
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  required
                />
              </div>

              {/* Technologies */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Tech Stack / Frameworks</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. NextJS, Go, Redis, WebSockets"
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Short Project Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does the project do? Describe the core functionality and problems it solves..."
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs font-semibold focus-visible:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-rose-500/5 border border-rose-500/10 text-[11px] text-rose-600 dark:text-rose-500 font-bold rounded-xl">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 w-full items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-muted text-white disabled:text-muted-foreground rounded-xl text-xs font-black shadow transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Structuring Outline...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Generate Outline
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result view */}
          <div className="lg:col-span-7 space-y-4">
            {!loading && !report && (
              <div className="bg-card border border-border/80 border-dashed rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <FileCode className="h-10 w-10 text-brand-500/30" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Documentation Empty</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Fill out the parameters and click Generate Outline to query Gemini AI.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4 animate-pulse">
                <RefreshCw className="h-10 w-10 text-brand-600 animate-spin" />
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Composing Academic Report</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed mx-auto">
                    Drafting colleges-grade abstracts, entity diagrams, architecture specifications, and testing checklists...
                  </p>
                </div>
              </div>
            )}

            {report && (
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4 relative">
                {/* Header bar controls */}
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <h3 className="font-extrabold text-foreground text-sm">Report Outline Draft</h3>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-brand-600 hover:text-brand-700 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-500/10 px-2.5 py-1 rounded-lg"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Markdown
                      </>
                    )}
                  </button>
                </div>

                {/* Report Content */}
                <div className="text-xs font-semibold leading-relaxed text-muted-foreground whitespace-pre-wrap overflow-y-auto max-h-[30rem] border border-border/40 rounded-2xl p-4 bg-muted/20 font-mono">
                  {report}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
