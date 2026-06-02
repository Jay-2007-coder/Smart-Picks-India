"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Calculator,
  Calendar,
  FileText,
  ShieldCheck,
  Search,
  MessageSquare,
  FileCode,
  Laptop,
  CheckCircle,
  HelpCircle,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const tools = [
  {
    category: "Academic Utilities",
    items: [
      {
        title: "CGPA Calculator",
        description: "Calculate semester-wise SGPA and total overall CGPA targets dynamically.",
        href: "/student-hub/cgpa-calculator",
        icon: Calculator,
        color: "text-blue-500 bg-blue-500/10",
      },
      {
        title: "Attendance Calculator",
        description: "Calculate bunk thresholds to stay above your college's 75% requirements.",
        href: "/student-hub/attendance-calculator",
        icon: Calendar,
        color: "text-purple-500 bg-purple-500/10",
      },
    ],
  },
  {
    category: "Career & Placements",
    items: [
      {
        title: "Resume Builder",
        description: "Generate structured, print-ready 1-page resumes with automated PDF formatting.",
        href: "/student-hub/resume-builder",
        icon: FileText,
        color: "text-emerald-500 bg-emerald-500/10",
      },
      {
        title: "AI Resume Analyzer",
        description: "ATS keyword matching engine comparing resumes to target Job Descriptions.",
        href: "/student-hub/resume-analyzer",
        icon: ShieldCheck,
        color: "text-rose-500 bg-rose-500/10",
      },
      {
        title: "AI Interview Generator",
        description: "Generate mock technical interview questions and sample answers for companies.",
        href: "/student-hub/interview-generator",
        icon: MessageSquare,
        color: "text-amber-500 bg-amber-500/10",
      },
      {
        title: "Aptitude Quiz Practice",
        description: "Practice quantitative, logical reasoning, and English grammar exams with timers.",
        href: "/student-hub/aptitude-practice",
        icon: HelpCircle,
        color: "text-sky-500 bg-sky-500/10",
      },
    ],
  },
  {
    category: "AI & Productivity Assistants",
    items: [
      {
        title: "AI Study Buddy",
        description: "A private chat assistant built specifically to solve concepts and explain bugs.",
        href: "/student-hub/ai-study-assistant",
        icon: Sparkles,
        color: "text-indigo-500 bg-indigo-500/10",
      },
      {
        title: "Project Report Writer",
        description: "Create abstracts, design schematics, and test checklists for college reports.",
        href: "/student-hub/project-report-generator",
        icon: FileCode,
        color: "text-teal-500 bg-teal-500/10",
      },
      {
        title: "DSA Coding Helper",
        description: "Input code blocks to review space/time complexity and get optimizations.",
        href: "/student-hub/coding-helper",
        icon: Laptop,
        color: "text-violet-500 bg-violet-500/10",
      },
      {
        title: "Portfolio Generator",
        description: "Input projects/skills and instantly download a professional portfolio web file.",
        href: "/student-hub/portfolio-generator",
        icon: CheckCircle,
        color: "text-cyan-500 bg-cyan-500/10",
      },
    ],
  },
];

export default function StudentHub() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-5xl">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-neutral-900 to-rose-950 px-8 py-14 text-white text-center shadow-xl border border-white/5 mb-12 select-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-rose-500 to-red-600 pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-widest mb-6">
              <GraduationCap className="h-4 w-4" /> placement hub
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-4">
              Placement Preparation &amp; Productivity Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Access engineering tools, mock aptitude quizzes, AI resume graders, code analyzers, and secure PDF guides.
            </p>
          </div>
        </div>

        {/* Tools Cards Categories List */}
        <div className="space-y-12">
          {tools.map((section) => (
            <div key={section.category} className="space-y-6">
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-4 border-brand-600 pl-3">
                {section.category}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {section.items.map((tool) => (
                  <Link
                    key={tool.title}
                    href={tool.href}
                    className="group bg-card border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-brand-500/10 transition-all flex items-start gap-4"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tool.color}`}>
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-foreground text-sm leading-snug group-hover:text-brand-600 transition-colors flex items-center gap-1">
                        {tool.title} <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
