"use client";

import React, { useState, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    startTransition(async () => {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccess(res.message);
        setEmail("");
      } else {
        setError(res.message);
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
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>

        {/* Card */}
        <div className="card border border-border/80 bg-card/70 backdrop-blur-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Forgot Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email address to receive a secure recovery link
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-border bg-background/50 py-3 pr-4 pl-12 text-sm placeholder:text-muted-foreground/60 focus:border-brand-600 focus:outline-none dark:focus:border-brand-500"
                  disabled={isPending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full mt-2"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Send Recovery Link <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
