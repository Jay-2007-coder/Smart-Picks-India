"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, Award, BookOpen, Zap, Trophy, FileText, Sparkles, 
  ChevronLeft, ChevronRight, Menu, X, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: SidebarItem[] = [
  {
    id: "attendance",
    label: "Attendance Planner",
    href: "/student-hub/attendance-calculator",
    icon: Calendar,
    badge: "Popular",
  },
  {
    id: "cgpa",
    label: "CGPA & Placement",
    href: "/student-hub/cgpa-calculator",
    icon: Award,
  },
  {
    id: "smart-notes",
    label: "Smart Notes AI",
    href: "/student-hub/smart-notes",
    icon: BookOpen,
  },
  {
    id: "aptitude",
    label: "Aptitude Practice",
    href: "/student-hub/aptitude-practice",
    icon: Zap,
  },
  {
    id: "leaderboard",
    label: "Leaderboard & Ranks",
    href: "/student-hub/leaderboard",
    icon: Trophy,
  },
  {
    id: "project-report",
    label: "Project Report AI",
    href: "/student-hub/project-report-generator",
    icon: FileText,
  },
  {
    id: "upgrade",
    label: "Pro Student Hub",
    href: "/student-hub/upgrade",
    icon: Sparkles,
    badge: "PRO",
  },
];

export default function StudentHubSidebar({
  currentActiveId,
}: {
  currentActiveId?: string;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer Toggle Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 font-bold text-xs transition-all active:scale-95"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span>Student Desk Navigation</span>
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
          transition-all duration-300 ease-in-out shrink-0 select-none
          ${isCollapsed ? "w-20" : "w-64"}
          ${
            isMobileOpen
              ? "translate-x-0 w-72"
              : "-translate-x-full lg:translate-x-0"
          }
          bg-white dark:bg-zinc-950
          border-r border-slate-200/80 dark:border-zinc-800/80
          shadow-lg lg:shadow-none
        `}
      >
        <div className="flex flex-col h-full p-4 justify-between overflow-y-auto">
          {/* Top Section */}
          <div className="space-y-6">
            {/* Header & Back Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <Link
                href="/student-hub"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                {!isCollapsed && <span>Back to Student Hub</span>}
              </Link>

              {/* Desktop Toggle Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Sidebar Title */}
            {!isCollapsed && (
              <div className="px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                  Student Workspace Tools
                </p>
              </div>
            )}

            {/* Navigation List */}
            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || currentActiveId === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 relative group
                      ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-sm"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 border border-transparent"
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 dark:text-zinc-500"
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          item.badge === "PRO"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card (When Expanded) */}
          {!isCollapsed && (
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 dark:from-emerald-950/30 dark:to-indigo-950/30 border border-emerald-500/20 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black text-slate-900 dark:text-zinc-100">
                    Pro Exam Desk
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mb-3">
                  Calculate target cutoffs & safe bunks instantly with real-time AI accuracy.
                </p>
                <Link
                  href="/student-hub/upgrade"
                  className="block text-center py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                >
                  Explore Pro
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
