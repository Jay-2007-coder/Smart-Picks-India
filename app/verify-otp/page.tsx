"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Phone, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";

export default function VerifyOtpPage() {
  const { sendOtp, login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Prefill phone and purpose from query parameters
  const queryPhone = searchParams.get("phone") || "";
  const queryPurpose = searchParams.get("purpose") || "verify";

  const [phone, setPhone] = useState(queryPhone);
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(!!queryPhone);
  const [timer, setTimer] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handles timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phone || !phoneRegex.test(phone)) {
      setError("Please enter a valid phone number with country code (e.g. +919876543210).");
      return;
    }

    startTransition(async () => {
      const res = await sendOtp(phone, queryPurpose);
      if (res.success) {
        setOtpSent(true);
        setTimer(300); // 5 minutes
        setCooldown(60); // 60 seconds
        setSuccess("OTP sent successfully. Check your SMS logs.");
      } else {
        setError(res.message);
      }
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!phone || !code) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    if (code.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    startTransition(async () => {
      if (queryPurpose === "login") {
        const res = await login({ phone, code });
        if (res.success) {
          setSuccess(res.message);
          router.push("/dashboard");
        } else {
          setError(res.message);
        }
      } else {
        // Handle verifying phone status for already registered or logged-in users
        const response = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code }),
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess("Phone number verified successfully!");
          router.push("/dashboard");
        } else {
          setError(data.message || "Verification failed");
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-50 to-slate-150 px-4 py-16 dark:from-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-md animate-slide-up">
        {/* Back Link */}
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        {/* Card */}
        <div className="card border border-border/85 bg-card/70 backdrop-blur-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Verify Phone OTP</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm your identity via international SMS code
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive dark:bg-destructive/10">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10">
              {success}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full rounded-xl border border-border bg-background/50 py-3 pr-4 pl-12 text-sm placeholder:text-muted-foreground/60 focus:border-brand-600 focus:outline-none dark:focus:border-brand-500"
                    disabled={isPending}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Format: E.164 (include country code). Test OTP will print to server logs.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Send Verification OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="rounded-xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground">
                Verification OTP code sent to <strong className="text-foreground">{phone}</strong>.
                {timer > 0 ? (
                  <span> Expires in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</span>
                ) : (
                  <span className="text-destructive font-bold"> Expired</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  className="w-full rounded-xl border border-border bg-background/50 py-3 px-4 text-center text-xl font-bold tracking-widest focus:border-brand-600 focus:outline-none dark:focus:border-brand-500"
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="font-semibold text-muted-foreground hover:text-foreground"
                >
                  Edit phone number
                </button>

                {cooldown > 0 ? (
                  <span className="text-muted-foreground font-semibold">
                    Resend in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="font-semibold text-brand-600 hover:underline dark:text-brand-500"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Confirm & Verify"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
