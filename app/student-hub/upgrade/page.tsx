"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Zap, Sparkles, Award, Heart, HelpCircle, Loader2, QrCode, CreditCard, Smartphone, Lock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentHubUpgrade() {
  const { user, checkSession } = useAuth() as any;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi_qr" | "upi_id" | "card">("upi_qr");
  
  // Checkout mock states
  const [upiId, setUpiId] = useState("student@paytm");
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");

  const getDaysRemaining = () => {
    if (!user || !user.hubPlanExpiresAt) return null;
    const expiresAt = new Date(user.hubPlanExpiresAt);
    const diffTime = expiresAt.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // If already pro or admin, we show success state
  useEffect(() => {
    if (user && (user.hubPlan === "pro" || user.role === "admin")) {
      setSuccess(true);
    }
  }, [user]);

  const handleUpgrade = () => {
    if (!user) {
      router.push("/login?redirect=/student-hub/upgrade");
      return;
    }
    setShowPaymentModal(true);
  };

  const executeUpgrade = async () => {
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
        setShowPaymentModal(false);
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
            <h2 className="text-2xl font-black text-foreground mb-2">
              {user && user.role === "admin" ? "Admin Access Active!" : "You are a Pro Member!"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {user && user.role === "admin"
                ? "You have full administrator privileges. You have unlimited daily access to all placement helper utilities."
                : "Thank you for supporting Smart Picks India. You have unlimited daily access to all placement helper utilities."}
            </p>
            {user && user.hubPlan === "pro" && user.role !== "admin" && user.hubPlanExpiresAt && (
              <div className="mb-8 p-3 rounded-2xl bg-brand-500/5 border border-brand-500/20 text-xs font-semibold text-brand-700 dark:text-brand-300">
                Plan Expiration: <span className="text-foreground dark:text-white font-extrabold">{new Date(user.hubPlanExpiresAt).toLocaleDateString("en-IN")}</span>
                <span className="mx-1.5">•</span>
                <span className="bg-brand-500/10 px-2 py-0.5 rounded text-[10px] text-brand-600 dark:text-brand-350 font-extrabold">
                  {(() => {
                    const days = getDaysRemaining();
                    if (days === null) return "Unknown";
                    return `${days} ${days === 1 ? "day" : "days"} remaining`;
                  })()}
                </span>
              </div>
            )}
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

      {/* Payment Checkout Modal Overlay */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 overflow-hidden"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-1 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 border border-brand-500/20">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground leading-snug">Secure Pro Checkout</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    smart picks payment portal
                  </p>
                </div>
              </div>

              {/* Amount Display */}
              <div className="bg-muted/40 border border-border/50 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">Premium Subscription:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-foreground">₹99</span>
                  <span className="text-[10px] text-muted-foreground block font-bold">GST Included</span>
                </div>
              </div>

              {/* Tabs for Payment Method */}
              <div className="space-y-3">
                <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Choose Payment Method
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi_qr")}
                    className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer ${
                      paymentMethod === "upi_qr"
                        ? "border-brand-500 bg-brand-500/5 text-brand-600"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>UPI QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi_id")}
                    className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer ${
                      paymentMethod === "upi_id"
                        ? "border-brand-500 bg-brand-500/5 text-brand-600"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>UPI VPA ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-brand-500 bg-brand-500/5 text-brand-600"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Credit Card</span>
                  </button>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="min-h-[160px] flex flex-col justify-center">
                {paymentMethod === "upi_qr" && (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="relative p-2 bg-white rounded-xl border border-slate-200 shadow-md">
                      <div className="animate-qr-scan pointer-events-none" />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                        className="h-28 w-28 text-slate-900 fill-current"
                      >
                        <path d="M5 5h30v30H5zm6 6v18h18V11zm4 4h10v10H15zm50-15h30v30H65zm6 6v18h18V11zm4 4h10v10H75zM5 65h30v30H5zm6 6v18h18V71zm4 4h10v10H15zm35-25h10v10H50zm10 10h10v10H60zm-10 10h10v10H50zm20-10h10v10H70zm10 10h10v10H80zm-10 10h10v10H70zm20 0h10v10H90zm-10 10h10v10H80zm10-30h10v10H90zm-40-10h10v10H50zm10-10h10v10H60zm10 0h10v10H70zm10-10h10v10H80z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-foreground">Scan QR to Complete Payment</p>
                      <p className="text-[10px] text-muted-foreground leading-snug max-w-[280px]">
                        Scan this QR with BHIM, GPay, PhonePe, or Paytm on your phone to initiate secure UPI payment.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi_id" && (
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        Enter UPI VPA ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. smartpicks@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold focus-visible:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      A payment request will be sent to your UPI app. Open the app to authorize the ₹99 debit.
                    </p>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="4111 1111 1111 1111"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold focus-visible:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold focus-visible:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs font-semibold focus-visible:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={executeUpgrade}
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-2xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-brand-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Upgrading...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    {paymentMethod === "upi_qr" ? "Simulate QR Payment Success" : "Simulate Payment Checkout"}
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="text-center text-[9px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
                <span>🔒 Secured with 256-bit SSL encryption</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 0.9; }
        }
        .animate-qr-scan {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--brand-500, #e11d48);
          animation: scan 2s linear infinite;
          box-shadow: 0 0 8px var(--brand-500, #e11d48);
        }
      `}</style>
    </div>
  );
}
