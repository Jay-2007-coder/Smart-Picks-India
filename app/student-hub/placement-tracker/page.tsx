"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Award,
  AlertCircle,
  HelpCircle,
  Cloud,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface Application {
  id: string;
  companyName: string;
  role: string;
  packageLPA: number;
  stage: string;
  date: string;
  notes: string;
}

const STAGES = [
  { id: "applied", label: "Applied", color: "border-t-blue-500 bg-blue-500/5 dark:bg-blue-500/[0.02] text-blue-600 dark:text-blue-400" },
  { id: "oa", label: "OA Round", color: "border-t-amber-500 bg-amber-500/5 dark:bg-amber-500/[0.02] text-amber-600 dark:text-amber-400" },
  { id: "tech", label: "Tech Interview", color: "border-t-violet-500 bg-violet-500/5 dark:bg-violet-500/[0.02] text-violet-600 dark:text-violet-400" },
  { id: "hr", label: "HR Interview", color: "border-t-sky-500 bg-sky-500/5 dark:bg-sky-500/[0.02] text-sky-600 dark:text-sky-400" },
  { id: "offered", label: "Offered 🎉", color: "border-t-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/[0.02] text-emerald-600 dark:text-emerald-400" },
  { id: "rejected", label: "Rejected", color: "border-t-rose-500 bg-rose-500/5 dark:bg-rose-500/[0.02] text-rose-600 dark:text-rose-400" },
];

export default function PlacementTracker() {
  const { user, loading: authLoading } = useAuth() as any;
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [packageLPA, setPackageLPA] = useState("");
  const [stage, setStage] = useState("applied");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  // Load from DB (or fall back to LocalStorage if guest)
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setDbLoading(true);
      fetch("/api/v1/student-hub/applications")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.applications)) {
            // Check if there are local storage applications to migrate
            const stored = localStorage.getItem("smartpicks_placement_tracker");
            const localApps = stored ? JSON.parse(stored) : [];
            const hasLocalApps = localApps.length > 0 && !localApps.some((app: any) => app.id === "1" && app.companyName === "Google");

            if (hasLocalApps) {
              // Perform migration
              fetch("/api/v1/student-hub/applications/bulk-migrate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applications: localApps }),
              })
                .then((mRes) => mRes.json())
                .then((mData) => {
                  if (mData.success && Array.isArray(mData.applications)) {
                    const migrated = mData.applications.map((app: any) => ({
                      id: app._id,
                      companyName: app.companyName,
                      role: app.role,
                      packageLPA: app.packageLPA,
                      stage: app.stage,
                      date: app.date ? app.date.split("T")[0] : new Date().toISOString().split("T")[0],
                      notes: app.notes,
                    }));
                    const dbApps = data.applications.map((app: any) => ({
                      id: app._id,
                      companyName: app.companyName,
                      role: app.role,
                      packageLPA: app.packageLPA,
                      stage: app.stage,
                      date: app.date ? app.date.split("T")[0] : new Date().toISOString().split("T")[0],
                      notes: app.notes,
                    }));
                    setApplications([...migrated, ...dbApps]);
                    localStorage.removeItem("smartpicks_placement_tracker");
                  }
                })
                .catch((e) => {
                  console.error("Migration failed, loading database records instead", e);
                  setApplications(data.applications.map((app: any) => ({
                    id: app._id,
                    companyName: app.companyName,
                    role: app.role,
                    packageLPA: app.packageLPA,
                    stage: app.stage,
                    date: app.date ? app.date.split("T")[0] : new Date().toISOString().split("T")[0],
                    notes: app.notes,
                  })));
                })
                .finally(() => {
                  setDbLoading(false);
                });
            } else {
              setApplications(data.applications.map((app: any) => ({
                id: app._id,
                companyName: app.companyName,
                role: app.role,
                packageLPA: app.packageLPA,
                stage: app.stage,
                date: app.date ? app.date.split("T")[0] : new Date().toISOString().split("T")[0],
                notes: app.notes,
              })));
              setDbLoading(false);
              localStorage.removeItem("smartpicks_placement_tracker");
            }
          } else {
            setDbLoading(false);
          }
        })
        .catch((e) => {
          console.error("Failed to load applications from database", e);
          setDbLoading(false);
        });
    } else {
      // Guest local storage fallback
      try {
        const stored = localStorage.getItem("smartpicks_placement_tracker");
        if (stored) {
          setApplications(JSON.parse(stored));
        } else {
          const seed = [
            {
              id: "1",
              companyName: "Google",
              role: "Software Engineer",
              packageLPA: 35,
              stage: "tech",
              date: "2026-06-12",
              notes: "DSA practice: Trees, Graphs, and System Design.",
            },
            {
              id: "2",
              companyName: "Amazon",
              role: "Cloud Associate",
              packageLPA: 22,
              stage: "oa",
              date: "2026-06-15",
              notes: "Got the OA link. Prepare Leadership Principles.",
            },
            {
              id: "3",
              companyName: "TCS",
              role: "Ninja Developer",
              packageLPA: 7,
              stage: "offered",
              date: "2026-05-20",
              notes: "Offer letter received! Join date August 1st.",
            },
          ];
          setApplications(seed);
          localStorage.setItem("smartpicks_placement_tracker", JSON.stringify(seed));
        }
      } catch (e) {
        console.error("Failed to read local placement tracker applications", e);
      }
    }
  }, [user, authLoading]);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter((app) => !["offered", "rejected"].includes(app.stage)).length;
    const offered = applications.filter((app) => app.stage === "offered");
    const offerCount = offered.length;

    const highestLPA = total > 0 ? Math.max(...applications.map((app) => app.packageLPA)) : 0;
    const avgOfferedLPA =
      offerCount > 0
        ? Math.round((offered.reduce((acc, app) => acc + app.packageLPA, 0) / offerCount) * 10) / 10
        : 0;

    return { total, active, offerCount, highestLPA, avgOfferedLPA };
  }, [applications]);

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim()) return;

    const newAppFields = {
      companyName: companyName.trim(),
      role: role.trim(),
      packageLPA: parseFloat(packageLPA) || 0,
      stage,
      date: date || new Date().toISOString().split("T")[0],
      notes: notes.trim(),
    };

    if (user) {
      setDbLoading(true);
      try {
        const res = await fetch("/api/v1/student-hub/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAppFields),
        });
        const data = await res.json();
        if (data.success && data.application) {
          const createdApp: Application = {
            id: data.application._id,
            companyName: data.application.companyName,
            role: data.application.role,
            packageLPA: data.application.packageLPA,
            stage: data.application.stage,
            date: data.application.date ? data.application.date.split("T")[0] : newAppFields.date,
            notes: data.application.notes,
          };
          setApplications((prev) => [...prev, createdApp]);
        }
      } catch (err) {
        console.error("Failed to add placement application", err);
      } finally {
        setDbLoading(false);
      }
    } else {
      const newApp: Application = {
        id: Date.now().toString(),
        ...newAppFields,
      };
      const updated = [...applications, newApp];
      setApplications(updated);
      localStorage.setItem("smartpicks_placement_tracker", JSON.stringify(updated));
    }

    // Reset Form
    setCompanyName("");
    setRole("");
    setPackageLPA("");
    setStage("applied");
    setDate("");
    setNotes("");
    setShowAddForm(false);
  };

  const handleDeleteApplication = async (id: string) => {
    if (user) {
      setDbLoading(true);
      try {
        const res = await fetch(`/api/v1/student-hub/applications/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          setApplications((prev) => prev.filter((app) => app.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete application", err);
      } finally {
        setDbLoading(false);
      }
    } else {
      const updated = applications.filter((app) => app.id !== id);
      setApplications(updated);
      localStorage.setItem("smartpicks_placement_tracker", JSON.stringify(updated));
    }
  };

  const moveApplication = async (id: string, direction: "prev" | "next") => {
    const targetApp = applications.find((app) => app.id === id);
    if (!targetApp) return;

    const currentIdx = STAGES.findIndex((s) => s.id === targetApp.stage);
    let nextIdx = currentIdx;
    if (direction === "next" && currentIdx < STAGES.length - 1) nextIdx += 1;
    if (direction === "prev" && currentIdx > 0) nextIdx -= 1;
    const newStage = STAGES[nextIdx].id;

    if (user) {
      setDbLoading(true);
      try {
        const res = await fetch("/api/v1/student-hub/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            stage: newStage,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setApplications((prev) =>
            prev.map((app) => (app.id === id ? { ...app, stage: newStage } : app))
          );
        }
      } catch (err) {
        console.error("Failed to move application", err);
      } finally {
        setDbLoading(false);
      }
    } else {
      const updated = applications.map((app) => {
        if (app.id === id) {
          return {
            ...app,
            stage: newStage,
          };
        }
        return app;
      });
      setApplications(updated);
      localStorage.setItem("smartpicks_placement_tracker", JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-6xl">
        {/* Back Link */}
        <Link
          href="/student-hub"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>

        {/* Dashboard Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/80 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Placement &amp; Internship Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add your applications, manage hiring rounds, and calculate interview conversion rates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Company
            </motion.button>
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest flex items-center gap-1">
              <Briefcase className="h-4 w-4" /> tracker
            </span>
          </div>
        </motion.div>

        {/* Sync Status Banner */}
        <AnimatePresence mode="wait">
          {authLoading || dbLoading ? (
            <motion.div
              key="loading-banner"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mb-6 flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-border text-xs font-bold text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                <span>Syncing dashboard state with cloud database...</span>
              </div>
            </motion.div>
          ) : user ? (
            <motion.div
              key="cloud-synced-banner"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/[0.02] border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-emerald-500" />
                <span>Cloud Synced: Your placement board is securely saved to your account.</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="offline-banner"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.02] border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>Offline mode (Guest): Placements are saved on this browser session only. <Link href="/login" className="underline hover:text-amber-700">Login</Link> to sync to the cloud.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Tracked</p>
              <h3 className="text-lg font-black text-foreground">{stats.total} Companies</h3>
            </div>
          </div>

          <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Active Rounds</p>
              <h3 className="text-lg font-black text-foreground">{stats.active} Pending</h3>
            </div>
          </div>

          <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Offers Grabbed</p>
              <h3 className="text-lg font-black text-foreground">{stats.offerCount} Offers</h3>
            </div>
          </div>

          <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Avg Offer LPA</p>
              <h3 className="text-lg font-black text-foreground">{stats.avgOfferedLPA ? `${stats.avgOfferedLPA} LPA` : "N/A"}</h3>
            </div>
          </div>
        </div>

        {/* Add Application Form Overlay */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border/80 rounded-3xl p-6 shadow-md mb-8 overflow-hidden"
            >
              <h3 className="font-extrabold text-sm text-foreground mb-4">Add Company Application</h3>
              <form onSubmit={handleAddApplication} className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Microsoft"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Analyst"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={packageLPA}
                    onChange={(e) => setPackageLPA(e.target.value)}
                    placeholder="e.g. 12"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Round Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Placement Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="h-10 w-full bg-background border border-border rounded-xl px-2 text-xs font-bold text-foreground focus-visible:outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes / Tasks</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="OA links, preparation focus, DSA subjects..."
                    className="w-full min-h-[70px] rounded-xl border border-input bg-background p-3 text-xs font-semibold focus-visible:outline-none"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary py-2 px-4 text-xs font-black uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2 px-5 text-xs font-black uppercase tracking-wider"
                  >
                    Add Company
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start select-none">
          {STAGES.map((col) => {
            const list = applications.filter((app) => app.stage === col.id);

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-2xl border-t-4 border border-border/80 p-3 shadow-sm min-h-[350px] ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-border/40">
                  <h4 className="text-[11px] font-black tracking-widest uppercase">{col.label}</h4>
                  <span className="text-[10px] font-extrabold bg-background/50 border border-border/40 px-1.5 py-0.5 rounded-full">
                    {list.length}
                  </span>
                </div>

                {/* Cards Flow */}
                <div className="space-y-3 flex-1">
                  <AnimatePresence initial={false}>
                    {list.map((app) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="bg-card border border-border/60 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow relative group/card overflow-hidden"
                      >
                        {/* Company & Role */}
                        <div className="space-y-0.5">
                          <h5 className="font-extrabold text-foreground text-xs leading-tight truncate">{app.companyName}</h5>
                          <p className="text-[10px] text-muted-foreground font-semibold leading-tight truncate">{app.role}</p>
                        </div>

                        {/* Package Details */}
                        <div className="mt-2.5 flex items-center justify-between text-[10px] font-extrabold border-t border-border/30 pt-2 text-muted-foreground">
                          <span className="text-brand-600 dark:text-brand-400 bg-brand-500/[0.04] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3 shrink-0" />
                            {app.packageLPA} LPA
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {app.date.split("-").slice(1).reverse().join("/")}
                          </span>
                        </div>

                        {/* Card Notes Details */}
                        {app.notes && (
                          <p className="text-[9px] text-muted-foreground/85 leading-normal mt-2 italic line-clamp-2 bg-muted/30 p-1 rounded">
                            {app.notes}
                          </p>
                        )}

                        {/* Hover Overlay Controls */}
                        <div className="mt-3.5 pt-2 border-t border-border/30 flex justify-between items-center">
                          <button
                            disabled={col.id === STAGES[0].id}
                            onClick={() => moveApplication(app.id, "prev")}
                            className="p-1 rounded bg-muted text-muted-foreground hover:bg-border transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteApplication(app.id)}
                            className="text-muted-foreground hover:text-rose-500 p-1 cursor-pointer"
                            title="Remove Application"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>

                          <button
                            disabled={col.id === STAGES[STAGES.length - 1].id}
                            onClick={() => moveApplication(app.id, "next")}
                            className="p-1 rounded bg-muted text-muted-foreground hover:bg-border transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {list.length === 0 && (
                    <div className="h-full flex items-center justify-center py-12 text-center border border-dashed border-border/40 rounded-xl">
                      <p className="text-[9px] text-muted-foreground/60 italic">No companies</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
