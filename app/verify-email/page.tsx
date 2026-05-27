"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  
  // Resend verification states
  const [resendEmail, setResendEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your verification link.");
      return;
    }

    const performVerification = async () => {
      const res = await verifyEmail(token);
      if (res.success) {
        setStatus("success");
        setMessage(res.message);
      } else {
        setStatus("error");
        setMessage(res.message || "Email verification failed or token expired.");
      }
    };

    performVerification();
  }, [token, verifyEmail]);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    setResendSuccess(null);
    setResendError(null);

    if (!resendEmail) {
      setResendError("Please enter your email address.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/v1/auth/resend-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resendEmail }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setResendSuccess(data.message);
          setResendEmail("");
        } else {
          setResendError(data.message || "Failed to resend email.");
        }
      } catch (err) {
        setResendError("An error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-50 to-slate-150 px-4 py-16 dark:from-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card border border-border/80 bg-card/70 backdrop-blur-xl p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 animate-spin text-brand-600 dark:text-brand-500" />
            )}
            {status === "success" && (
              <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce-gentle" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-destructive animate-pulse" />
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Verified!"}
            {status === "error" && "Verification Failed"}
          </h1>
          
          <p className="text-sm text-muted-foreground mb-8">{message}</p>

          {/* Success Redirect Link */}
          {status === "success" && (
            <Link href="/login" className="btn-primary w-full inline-flex items-center justify-center">
              Continue to Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          )}

          {/* Error: Form to Resend Link */}
          {status === "error" && (
            <div className="border-t border-border pt-6 mt-6 text-left space-y-4">
              <h3 className="text-sm font-bold text-foreground">Need a new verification link?</h3>
              <p className="text-xs text-muted-foreground">
                Enter your email address below, and we'll send you a new link to activate your account.
              </p>

              {resendError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive dark:bg-destructive/10">
                  {resendError}
                </div>
              )}
              {resendSuccess && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10">
                  {resendSuccess}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-border bg-background/50 py-2.5 pr-4 pl-10 text-xs placeholder:text-muted-foreground/60 focus:border-brand-600 focus:outline-none dark:focus:border-brand-500"
                    disabled={isPending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-secondary w-full text-xs py-2 px-4 inline-flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send New Verification Email"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
