"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  Lock,
  Loader2,
  LogOut,
  Camera,
  History,
  Info,
  Zap,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionInfo {
  id: string;
  userAgent: string;
  ipAddress: string;
  isCurrent: boolean;
  lastActive: string;
}

interface LoginLog {
  timestamp: string;
  ipAddress: string;
  device: string;
  status: "success" | "failed";
}

export default function DashboardPage() {
  const { user, loading, logout, updateProfile, changePassword, uploadProfileImage } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  
  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Sessions and activity logs
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);

  // Feedback states
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sessionMessage, setSessionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load user data into form
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setTelegramChatId((user as any).telegramChatId || "");
      fetchSessionsAndLogs();
    }
  }, [user]);

  const fetchSessionsAndLogs = async () => {
    try {
      const response = await fetch("/api/v1/user/sessions");
      const data = await response.json();
      if (response.ok && data.success) {
        setSessions(data.sessions);
        setLoginLogs(data.loginHistory);
      }
    } catch (err) {
      console.error("Failed to load sessions data", err);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto" />
          <p className="text-muted-foreground text-sm font-semibold">Loading dashboard credentials...</p>
        </div>
      </div>
    );
  }

  const getDaysRemaining = () => {
    if (!user.hubPlanExpiresAt) return null;
    const expiresAt = new Date(user.hubPlanExpiresAt);
    const diffTime = expiresAt.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // ─── 1. Profile Update ─────────────────────────────────────────────────────
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    startTransition(async () => {
      const res = await updateProfile({ name, phone: phone || "", telegramChatId: telegramChatId || "" });
      if (res.success) {
        setProfileMessage({ type: "success", text: res.message });
      } else {
        setProfileMessage({ type: "error", text: res.message });
      }
    });
  };

  // ─── 2. Password Change ────────────────────────────────────────────────────
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    startTransition(async () => {
      const res = await changePassword({ oldPassword, newPassword, confirmNewPassword });
      if (res.success) {
        setPasswordMessage({ type: "success", text: res.message });
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordMessage({ type: "error", text: res.message });
      }
    });
  };

  // ─── 3. Avatar Upload ──────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage({ type: "error", text: "Image file size should be less than 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      startTransition(async () => {
        const res = await uploadProfileImage(base64String);
        if (res.success) {
          setProfileMessage({ type: "success", text: "Avatar updated successfully." });
        } else {
          setProfileMessage({ type: "error", text: res.message });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  // ─── 4. Revoke Session ─────────────────────────────────────────────────────
  const handleRevokeSession = async (sessionId: string) => {
    setSessionMessage(null);
    try {
      const response = await fetch(`/api/v1/user/sessions/${sessionId}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.isLoggedOut) {
          logout();
        } else {
          setSessionMessage({ type: "success", text: data.message });
          fetchSessionsAndLogs();
        }
      } else {
        setSessionMessage({ type: "error", text: data.message || "Failed to revoke session" });
      }
    } catch (err) {
      setSessionMessage({ type: "error", text: "Connection error. Please try again." });
    }
  };

  // ─── 5. Revoke All Other Sessions ──────────────────────────────────────────
  const handleRevokeAllOtherSessions = async () => {
    setSessionMessage(null);
    try {
      const response = await fetch("/api/v1/user/sessions", { method: "DELETE" });
      const data = await response.json();
      if (response.ok && data.success) {
        setSessionMessage({ type: "success", text: data.message });
        fetchSessionsAndLogs();
      } else {
        setSessionMessage({ type: "error", text: data.message || "Failed to revoke sessions" });
      }
    } catch (err) {
      setSessionMessage({ type: "error", text: "Connection error. Please try again." });
    }
  };

  // Helper to format browser/OS from user agent
  const formatUserAgent = (ua: string) => {
    if (ua.includes("Firefox")) return "Mozilla Firefox";
    if (ua.includes("Chrome")) return "Google Chrome";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Apple Safari";
    if (ua.includes("Edge")) return "Microsoft Edge";
    return ua.split(" ")[0] || "Web Browser";
  };

  const getDeviceIcon = (ua: string) => {
    const lower = ua.toLowerCase();
    if (lower.includes("mobi") || lower.includes("android") || lower.includes("iphone")) {
      return <Smartphone className="h-5 w-5 text-muted-foreground" />;
    }
    return <Laptop className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-neutral-950">
      <div className="container-custom mx-auto px-4 max-w-6xl animate-fade-in">
        {/* Dashboard Title & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-border/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal information, active login sessions, and safety credentials.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 px-5 text-xs font-bold text-white shadow-md hover:scale-102 transition-all duration-150"
              >
                <Shield className="h-4 w-4" /> Admin Console
              </Link>
            )}
            <button
              onClick={logout}
              className="btn-secondary flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border/60 gap-4 mb-8">
          {[
            { href: "/dashboard", label: "Profile & Security" },
            { href: "/dashboard/purchases", label: "My Purchases" },
            { href: "/dashboard/favorites", label: "Favorites" },
            { href: "/dashboard/referrals", label: "Referrals" },
          ].map((tab) => {
            const isActive = tab.href === "/dashboard";
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                  isActive
                    ? "border-brand-600 text-brand-600 dark:text-brand-500"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* LEFT COLUMN: Profile Info Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="card p-6 border border-border/80 bg-card">
              <div className="flex flex-col items-center text-center">
                {/* Avatar Wrapper */}
                <div className="relative group">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 shadow-md dark:border-neutral-900 dark:bg-neutral-900">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-50 text-3xl font-bold text-brand-600 dark:bg-brand-950/40">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* File Upload Overlay Icon */}
                  <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">{user.name}</h2>
                <p className="text-xs text-muted-foreground font-medium">{user.email}</p>

                {/* Badges indicators */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <div className={`badge ${user.isEmailVerified ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
                    {user.isEmailVerified ? (
                      <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Email Verified</span>
                    ) : (
                      <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Email Inactive</span>
                    )}
                  </div>

                  <div className={`badge ${user.isPhoneVerified ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-slate-100 text-slate-700 dark:bg-neutral-900 dark:text-neutral-400"}`}>
                    {user.isPhoneVerified ? (
                      <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> SMS Verified</span>
                    ) : (
                      <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> SMS Unverified</span>
                    )}
                  </div>

                  <div className={`badge ${
                    user.role === "admin"
                      ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/25 dark:text-rose-400"
                      : user.hubPlan === "pro"
                      ? "bg-brand-500/10 text-brand-600 border border-brand-500/20 dark:bg-brand-500/25 dark:text-brand-400"
                      : "bg-slate-100 text-slate-700 dark:bg-neutral-900 dark:text-neutral-400"
                  }`}>
                    <span className="flex items-center gap-1">
                      {user.role === "admin" ? "⚡ Admin Access" : user.hubPlan === "pro" ? "⚡ Pro Member" : "Free Plan Tier"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info Box */}
              <div className="mt-6 rounded-xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground flex gap-3">
                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-0.5">Account Security Tips</p>
                  <p>Keep your phone number verified to enable secure logging with SMS OTP, avoiding passwords entirely.</p>
                </div>
              </div>

              {/* Subscription Plan Card */}
              <div className={cn(
                "mt-4 rounded-xl p-4 border text-xs flex flex-col justify-between gap-3 shadow-sm",
                user.role === "admin" || user.hubPlan === "pro"
                  ? "bg-brand-500/5 border-brand-500/20 text-brand-800 dark:text-brand-300"
                  : "bg-muted/40 border-border/50 text-muted-foreground"
              )}>
                <div className="flex gap-3">
                  <Zap className={cn("h-5 w-5 shrink-0", user.role === "admin" || user.hubPlan === "pro" ? "text-brand-500 fill-brand-500/20" : "text-muted-foreground")} />
                  <div>
                    <p className="font-extrabold text-foreground mb-0.5">
                      {user.role === "admin" ? "⚡ Administrator Access Active" : user.hubPlan === "pro" ? "⚡ Student Hub Pro Active" : "Smart Picks Student Free"}
                    </p>
                    <p className="leading-relaxed">
                      {user.role === "admin"
                        ? "You have full administrator privileges with unlimited access to mock interviews, resume analyzer, and coding helper tools."
                        : user.hubPlan === "pro"
                        ? "You have unlimited daily access to mock interviews, resume analyzer, report builder, and coding helper tools."
                        : "Upgrade to Student Pro to remove the 80 daily limit on AI placement preparation helper tools."}
                    </p>
                    {user.hubPlan === "pro" && user.role !== "admin" && user.hubPlanExpiresAt && (
                      <div className="mt-4 space-y-2.5 border-t border-brand-500/10 pt-3.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-brand-500" />
                            <span>Expires on {new Date(user.hubPlanExpiresAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric"
                            })}</span>
                          </span>
                          <span className="text-brand-600 dark:text-brand-400 font-extrabold uppercase tracking-wide">
                            {(() => {
                              const days = getDaysRemaining();
                              if (days === null) return "Unknown days";
                              return `${days} ${days === 1 ? "day" : "days"} remaining`;
                            })()}
                          </span>
                        </div>
                        {(() => {
                          const days = getDaysRemaining() || 0;
                          const percent = Math.min(100, Math.max(0, (days / 30) * 100));
                          return (
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-neutral-850 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-500 to-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.35)] transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                {user.role !== "admin" && user.hubPlan !== "pro" && (
                  <Link
                    href="/student-hub/upgrade"
                    className="btn-primary w-full text-center py-2.5 text-[10px] uppercase font-extrabold tracking-wider leading-none shrink-0"
                  >
                    Upgrade to Pro Plan
                  </Link>
                )}
              </div>
            </div>

            {/* Profile Update Panel */}
            <div className="card p-6 border border-border/80 bg-card">
              <h3 className="text-lg font-bold mb-4">Edit Profile Info</h3>
              {profileMessage && (
                <div className={`mb-4 rounded-lg p-3 text-xs border ${
                  profileMessage.type === "success" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400"
                    : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
                }`}>
                  {profileMessage.text}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-brand-600 focus:outline-none"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone Number (SMS)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-brand-600 focus:outline-none"
                    disabled={isPending}
                  />
                  {!user.isPhoneVerified && phone && (
                    <div className="mt-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => router.push(`/verify-otp?phone=${encodeURIComponent(phone)}&purpose=verify`)}
                        className="text-xs font-bold text-brand-600 hover:underline"
                      >
                        Verify this phone now &rarr;
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Telegram Chat ID (Optional)</label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="e.g. 123456789"
                    className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-brand-600 focus:outline-none"
                    disabled={isPending}
                  />
                  <span className="block text-[10px] text-muted-foreground mt-1">
                    To get your Chat ID, search for <strong>@SmartPicksDealsBot</strong> on Telegram and send <strong>/start</strong>.
                  </span>
                </div>
                <button type="submit" disabled={isPending} className="btn-primary w-full text-xs py-2.5">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
              </form>
            </div>
          </div>

          {/* MIDDLE COLUMN: Security Actions & Sessions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Sessions Panel */}
            <div className="card p-6 border border-border/80 bg-card">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Active Sessions</h3>
                  <p className="text-xs text-muted-foreground">Devices currently logged into your account.</p>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllOtherSessions}
                    className="text-xs font-bold text-red-600 hover:underline text-left"
                  >
                    Logout from all other devices
                  </button>
                )}
              </div>

              {sessionMessage && (
                <div className={`mb-4 rounded-lg p-3 text-xs border ${
                  sessionMessage.type === "success" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30"
                    : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30"
                }`}>
                  {sessionMessage.text}
                </div>
              )}

              <div className="divide-y divide-border/60">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2 dark:bg-neutral-900">
                        {getDeviceIcon(s.userAgent)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {formatUserAgent(s.userAgent)}
                          </span>
                          {s.isCurrent && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Globe className="h-3 w-3" /> {s.ipAddress}
                          </span>
                          <span>&bull;</span>
                          <span>Last active: {new Date(s.lastActive).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      className="text-muted-foreground hover:text-red-600 p-2 transition-colors"
                      title="Revoke session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Password Card */}
            <div className="card p-6 border border-border/80 bg-card">
              <h3 className="text-lg font-bold mb-1">Change Account Password</h3>
              <p className="text-xs text-muted-foreground mb-6">Choose a unique, complex password to protect your wallet information.</p>
              
              {passwordMessage && (
                <div className={`mb-4 rounded-lg p-3 text-xs border ${
                  passwordMessage.type === "success" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30"
                    : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30"
                }`}>
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-brand-600 focus:outline-none"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-brand-600 focus:outline-none"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-brand-600 focus:outline-none"
                      disabled={isPending}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <button type="submit" disabled={isPending} className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="h-4 w-4" /> Save New Password</>}
                  </button>
                </div>
              </form>
            </div>

            {/* Login History Activity Log */}
            <div className="card p-6 border border-border/80 bg-card">
              <div className="flex items-center gap-2 mb-6">
                <History className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-bold">Recent Login Activity</h3>
                  <p className="text-xs text-muted-foreground">Your last 10 login attempts are listed below.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Device / Agent</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {loginLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 text-foreground font-medium">
                          {new Date(log.timestamp).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{log.ipAddress}</td>
                        <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[200px]" title={log.device}>
                          {formatUserAgent(log.device)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`badge ${
                            log.status === "success" 
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450" 
                              : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-450"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {loginLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          No recent login history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
