"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Form states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Strength states
  const [strength, setStrength] = useState<"Weak" | "Medium" | "Strong" | "">("");
  const [strengthScore, setStrengthScore] = useState(0);

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Password strength meter
  useEffect(() => {
    if (!password) {
      setStrength("");
      setStrengthScore(0);
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    setStrengthScore(score);

    if (score <= 2) {
      setStrength("Weak");
    } else if (score <= 4) {
      setStrength("Medium");
    } else {
      setStrength("Strong");
    }
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset token is missing from the URL. Please verify your recovery link.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await resetPassword({ token, password, confirmPassword });
      if (res.success) {
        setSuccess(res.message);
        setPassword("");
        setConfirmPassword("");
        // Redirect after a brief moment
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-50 to-slate-150 px-4 py-16 dark:from-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="card border border-border/80 bg-card/70 backdrop-blur-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Reset Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter and confirm your new secure password
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
              {success} Redirecting to login page...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background/50 py-3 pr-12 pl-12 text-sm placeholder:text-muted-foreground/60 focus:border-brand-600 focus:outline-none dark:focus:border-brand-500"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground font-semibold">Password Strength:</span>
                    <span
                      className={`font-bold ${
                        strength === "Weak"
                          ? "text-red-500"
                          : strength === "Medium"
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {strength}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strengthScore >= 1
                          ? strength === "Weak"
                            ? "bg-red-500"
                            : strength === "Medium"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-transparent"
                      }`}
                    ></div>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strengthScore >= 3
                          ? strength === "Medium"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-transparent"
                      }`}
                    ></div>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strengthScore >= 4 ? "bg-emerald-500" : "bg-transparent"
                      }`}
                    ></div>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strengthScore >= 5 ? "bg-emerald-500" : "bg-transparent"
                      }`}
                    ></div>
                  </div>
                  <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                    <li className={password.length >= 8 ? "text-emerald-600 dark:text-emerald-450 font-semibold" : ""}>
                      ✓ Minimum 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-emerald-600 dark:text-emerald-450 font-semibold" : ""}>
                      ✓ At least one uppercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-450 font-semibold" : ""}>
                      ✓ At least one number
                    </li>
                    <li className={/[^a-zA-Z0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-450 font-semibold" : ""}>
                      ✓ At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background/50 py-3 pr-12 pl-12 text-sm placeholder:text-muted-foreground/60 focus:border-brand-600 focus:outline-none dark:focus:border-brand-500"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
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
                  Save New Password <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
