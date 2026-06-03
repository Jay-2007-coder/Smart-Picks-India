"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Zap, Sparkles, Award, Heart, HelpCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentHubUpgrade() {
  const { user, checkSession } = useAuth() as any;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If already pro, we show success state
  useEffect(() => {
    if (user && user.hubPlan === "pro") {
      setSuccess(true);
    }
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?redirect=/student-hub/upgrade");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/user/upgrade-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razorpay_payment_id: "pay_mock_student_hub_pro" }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Trigger confetti dynamically
        try {
          const confetti = (await import("canvas-confetti")).default;
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.error("Confetti error:", e);
        }

        setSuccess(true);
        // Refresh session to update user.hubPlan in state
        await checkSession();
      }
    } catch (err) {
      console.error("Upgrade failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-slate-50 dark:bg-slate-950/20 select-none">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-brand-500/10 text-brand-600 border border-brand-500/20 uppercase tracking-widest mb-4"
          >
            <Zap className="h-3.5 w-3.5 fill-current" /> unlock smart picks pro
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black font-display tracking-tight leading-tight mb-4 text-foreground"
          >
            Supercharge Your Placement Prep
          </motion.h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Get unlimited access to advanced AI interview preparation, quantitative mock quizzes, ATS resume scoring, and premium templates.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto card p-8 text-center bg-card border border-brand-500/30 shadow-xl"
          >
            <div className="h-16 w-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600 border border-brand-500/20">
              <Award className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">You are a Pro Member!</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Thank you for supporting Smart Picks India. You have unlimited daily access to all placement helper utilities.
            </p>
            <button
              onClick={() => router.push("/student-hub")}
              className="btn-primary w-full py-3.5 rounded-2xl text-xs uppercase font-extrabold tracking-wider"
            >
              Go to Student Hub
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
            {/* Free Plan */}
            <motion.div
              whileHover={{ y: -4 }}
              className="card p-8 bg-card border border-border flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-muted-foreground mb-1">Free Tier</h3>
                <p className="text-xs text-muted-foreground">For casual academic utility use.</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-foreground">₹0</span>
                  <span className="text-muted-foreground text-xs font-semibold ml-1">/ lifetime</span>
                </div>
                <ul className="space-y-4 border-t border-border pt-6">
                  <li className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>3 daily AI assistant runs</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>CGPA &amp; Attendance calculators</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Standard public placement guides</span>
                  </li>
                </ul>
              </div>
              <button
                disabled
                className="mt-8 w-full py-3 rounded-2xl bg-muted text-muted-foreground text-xs uppercase font-extrabold tracking-wider cursor-not-allowed"
              >
                Current Plan
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              whileHover={{ y: -4 }}
              className="card p-8 bg-card border-2 border-brand-500 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-brand-500 text-white uppercase tracking-wider">
                  popular
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-brand-600 mb-1">Student Pro</h3>
                <p className="text-xs text-muted-foreground">Full suite for placement preparation.</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-foreground">₹99</span>
                  <span className="text-muted-foreground text-xs font-semibold ml-1">/ month</span>
                </div>
                <ul className="space-y-4 border-t border-border pt-6">
                  <li className="flex items-center gap-3 text-xs font-extrabold text-foreground">
                    <Check className="h-4 w-4 text-brand-500 shrink-0 animate-pulse-scale" />
                    <span>Unlimited AI runs (No daily caps)</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs font-extrabold text-foreground">
                    <Check className="h-4 w-4 text-brand-500 shrink-0" />
                    <span>Unlimited ATS resume scans</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs font-extrabold text-foreground">
                    <Check className="h-4 w-4 text-brand-500 shrink-0" />
                    <span>Mock Technical interview queries</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs font-extrabold text-foreground">
                    <Check className="h-4 w-4 text-brand-500 shrink-0" />
                    <span>Priority servers (Zero latency)</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn-primary mt-8 w-full py-3.5 rounded-2xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-brand-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Upgrading...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Upgrade to Pro
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
