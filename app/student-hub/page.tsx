"use client";

import React, { useState, useMemo } from "react";
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
  Trophy,
  Briefcase,
  Compass,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const tools = [
  {
    category: "Academic Utilities",
    items: [
      {
        title: "CGPA Calculator",
        description: "Calculate semester-wise SGPA and total overall CGPA targets dynamically.",
        href: "/student-hub/cgpa-calculator",
        icon: Calculator,
        color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/5",
        hoverColor: "group-hover:text-blue-400 group-hover:bg-blue-500/20",
      },
      {
        title: "Attendance Calculator",
        description: "Calculate bunk thresholds to stay above your college's 75% requirements.",
        href: "/student-hub/attendance-calculator",
        icon: Calendar,
        color: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/5",
        hoverColor: "group-hover:text-purple-400 group-hover:bg-purple-500/20",
      },
      {
        title: "Developer Roadmaps",
        description: "Interactive timelines for Web Dev, AI/ML, and DevOps, mapping language relationships and technology stacks.",
        href: "/student-hub/roadmaps",
        icon: Compass,
        color: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/5",
        hoverColor: "group-hover:text-rose-400 group-hover:bg-rose-500/20",
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
        color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5",
        hoverColor: "group-hover:text-emerald-400 group-hover:bg-emerald-500/20",
      },
      {
        title: "AI Resume Analyzer",
        description: "ATS keyword matching engine comparing resumes to target Job Descriptions.",
        href: "/student-hub/resume-analyzer",
        icon: ShieldCheck,
        color: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/5",
        hoverColor: "group-hover:text-rose-400 group-hover:bg-rose-500/20",
      },
      {
        title: "AI Interview Generator",
        description: "Generate mock technical interview questions and sample answers for companies.",
        href: "/student-hub/interview-generator",
        icon: MessageSquare,
        color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/5",
        hoverColor: "group-hover:text-amber-400 group-hover:bg-amber-500/20",
      },
      {
        title: "Aptitude Quiz Practice",
        description: "Practice quantitative, logical reasoning, and English grammar exams with timers.",
        href: "/student-hub/aptitude-practice",
        icon: HelpCircle,
        color: "text-sky-500 bg-sky-500/10 dark:bg-sky-500/5",
        hoverColor: "group-hover:text-sky-400 group-hover:bg-sky-500/20",
      },
      {
        title: "Placement Tracker",
        description: "An interactive Kanban board to track your company applications, OA rounds, and interview progress.",
        href: "/student-hub/placement-tracker",
        icon: Briefcase,
        color: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/5",
        hoverColor: "group-hover:text-indigo-400 group-hover:bg-indigo-500/20",
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
        color: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/5",
        hoverColor: "group-hover:text-indigo-400 group-hover:bg-indigo-500/20",
      },
      {
        title: "Project Report Writer",
        description: "Create abstracts, design schematics, and test checklists for college reports.",
        href: "/student-hub/project-report-generator",
        icon: FileCode,
        color: "text-teal-500 bg-teal-500/10 dark:bg-teal-500/5",
        hoverColor: "group-hover:text-teal-400 group-hover:bg-teal-500/20",
      },
      {
        title: "DSA Coding Helper",
        description: "Input code blocks to review space/time complexity and get optimizations.",
        href: "/student-hub/coding-helper",
        icon: Laptop,
        color: "text-violet-500 bg-violet-500/10 dark:bg-violet-500/5",
        hoverColor: "group-hover:text-violet-400 group-hover:bg-violet-500/20",
      },
      {
        title: "Portfolio Generator",
        description: "Input projects/skills and instantly download a professional portfolio web file.",
        href: "/student-hub/portfolio-generator",
        icon: CheckCircle,
        color: "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/5",
        hoverColor: "group-hover:text-cyan-400 group-hover:bg-cyan-500/20",
      },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const toSentenceCase = (text: string) => {
  if (text === "Academic Utilities") return "Academic utilities";
  if (text === "Career & Placements") return "Career & placements";
  if (text === "AI & Productivity Assistants") return "AI tools";
  return text;
};

const getCardBorder = (title: string, category: string) => {
  if (category === "Academic Utilities") return "border-l-4 border-l-[#1D9E75]";
  if (title === "Aptitude Quiz Practice" || title === "Placement Tracker") return "border-l-4 border-l-amber-500";
  if (category === "Career & Placements") return "border-l-4 border-l-blue-500";
  if (category === "AI & Productivity Assistants") return "border-l-4 border-l-purple-500";
  return "";
};

export default function StudentHub() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    const query = searchQuery.toLowerCase().trim();
    return tools.map(section => {
      const items = section.items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
      return {
        ...section,
        items
      };
    }).filter(section => section.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-5xl">
        {/* Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F6E56] via-neutral-900 to-[#042C53] px-8 py-14 text-white text-center shadow-xl border border-white/5 mb-8 select-none"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-rose-500 to-red-600 pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-widest mb-6"
            >
              <GraduationCap className="h-4 w-4" /> placement hub
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-4"
            >
              Placement Preparation &amp; Productivity Hub
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto"
            >
              Access engineering tools, mock aptitude quizzes, AI resume graders, code analyzers, and secure PDF guides.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex justify-center gap-3"
            >
              <Link 
                href="/student-hub/leaderboard" 
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-black shadow-lg shadow-teal-500/20 transition-all uppercase tracking-wider"
              >
                <Trophy className="h-4 w-4" /> View Leaderboard
              </Link>
              <Link 
                href="/student-hub/upgrade" 
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black shadow-lg shadow-orange-500/20 transition-all uppercase tracking-wider"
              >
                <Zap className="h-4 w-4 fill-current text-white animate-pulse" /> Upgrade to Pro
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Live Search Input Bar */}
        <div className="max-w-md mx-auto mb-10 select-none">
          <div className="relative flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-md focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/10 transition-all duration-300">
            <div className="flex items-center gap-2.5 pl-3 w-full">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools... e.g. Resume, CGPA, DSA"
                className="w-full bg-transparent border-none outline-none py-2 text-xs text-foreground placeholder:text-muted-foreground/60 font-semibold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tools Cards Categories List */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground rounded-3xl border border-dashed border-border/80 bg-card p-6 shadow-sm select-none">
            <p className="text-sm font-bold text-foreground">No matching hub tools found</p>
            <p className="text-xs text-muted-foreground mt-1">Try relaxing your search terms.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-12"
          >
            {filteredTools.map((section, secIdx) => (
              <motion.div
                variants={itemVariants}
                key={section.category}
                className="space-y-6"
              >
                <h2 className="text-sm font-black text-foreground border-l-4 border-[#1D9E75] pl-3">
                  {toSentenceCase(section.category)}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {section.items.map((tool) => (
                    <motion.div
                      key={tool.title}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="relative"
                    >
                      <Link
                        href={tool.href}
                        className={`group bg-card border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all duration-300 flex items-start gap-4 h-full ${getCardBorder(tool.title, section.category)}`}
                      >
                        <motion.div
                          whileHover={{ rotate: [0, -8, 8, -4, 4, 0] }}
                          transition={{ duration: 0.4 }}
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${tool.color} ${tool.hoverColor}`}
                        >
                          <tool.icon className="h-5 w-5" />
                        </motion.div>
                        <div className="space-y-1 flex-1">
                          <h4 className="font-extrabold text-foreground text-sm leading-snug group-hover:text-brand-600 transition-colors flex flex-wrap items-center gap-1.5">
                            {tool.title}
                            {["Resume Builder", "AI Study Buddy"].includes(tool.title) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-teal-500/10 text-teal-600 border border-teal-500/20 uppercase tracking-wider">
                                Most Used
                              </span>
                            )}
                            {["DSA Coding Helper", "Portfolio Generator", "Placement Tracker"].includes(tool.title) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-wider">
                                New
                              </span>
                            )}
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-brand-600" />
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
