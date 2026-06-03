"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Shield,
  LogOut,
  Loader2,
  Copy,
  Check,
  Gift,
  Wallet,
  Users,
  Info
} from "lucide-react";

interface ReferredUser {
  name: string;
  email: string;
  joinedAt: string;
  verified: boolean;
}

export default function ReferralsPage() {
  const { user, loading, logout } = useAuth() as any;
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const [referralCode, setReferralCode] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralDetails();
    }
  }, [user]);

  const fetchReferralDetails = async () => {
    try {
      const response = await fetch("/api/v1/user/referrals");
      const data = await response.json();
      if (response.ok && data.success) {
        setReferralCode(data.referralCode || "");
        setWalletBalance(data.walletBalance || 0);
        setReferredUsers(data.referredUsers || []);
      }
    } catch (err) {
      console.error("Failed to load referrals details:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto" />
          <p className="text-muted-foreground text-sm font-semibold">Loading referrals board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-neutral-950 select-none">
      <div className="container-custom mx-auto px-4 max-w-6xl animate-fade-in">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-border/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal information, referrals, and wallet balance.
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
            const isActive = tab.href === "/dashboard/referrals";
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

        {dataLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1: Wallet Balance */}
              <div className="card p-6 bg-card border border-border flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Wallet Balance</p>
                  <p className="text-2xl font-black text-foreground mt-1">₹{walletBalance}</p>
                </div>
              </div>

              {/* Card 2: Total Referrals */}
              <div className="card p-6 bg-card border border-border flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Referrals</p>
                  <p className="text-2xl font-black text-foreground mt-1">{referredUsers.length}</p>
                </div>
              </div>

              {/* Card 3: Total Earned */}
              <div className="card p-6 bg-card border border-border flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Earned</p>
                  <p className="text-2xl font-black text-foreground mt-1">₹{referredUsers.length * 50}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Referral Code Card */}
              <div className="lg:col-span-1 card p-6 bg-card border border-border space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Invite Friends</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share your referral link with friends. When they register an account, we will credit ₹50 to your wallet!
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Your Referral Code</label>
                  <div className="flex h-11 items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2 font-mono text-sm font-extrabold text-foreground">
                    <span>{referralCode || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Your Referral Link</label>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex h-11 items-center justify-between rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 text-xs font-bold transition-all shadow-md active:scale-97 cursor-pointer"
                  >
                    <span>{copied ? "Link Copied!" : "Copy Referral Link"}</span>
                    {copied ? <Check className="h-4 w-4 stroke-[3px]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="rounded-xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground flex gap-3">
                  <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-0.5">Program Rules</p>
                    <ul className="list-disc pl-4 space-y-1 mt-1">
                      <li>Referrals must register using your unique link.</li>
                      <li>Referees must verify their email to count as a success.</li>
                      <li>Wallet credits can be used during checkout for paid store resources.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Referrals List Card */}
              <div className="lg:col-span-2 card p-6 bg-card border border-border">
                <h3 className="text-lg font-bold text-foreground mb-6">Referred Friends</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-3">Friend</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Joined On</th>
                        <th className="py-2.5 px-3 text-right">Reward Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {referredUsers.map((friend, index) => (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="py-3 px-3 text-foreground font-bold flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-brand-600 text-[10px] font-black text-white flex items-center justify-center">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            {friend.name}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{friend.email}</td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {new Date(friend.joinedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`badge ${
                              friend.verified
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/20"
                            }`}>
                              {friend.verified ? "₹50 Credited" : "Pending Email Verification"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {referredUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground font-semibold">
                            You haven&apos;t referred anyone yet. Share your link to start earning!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
