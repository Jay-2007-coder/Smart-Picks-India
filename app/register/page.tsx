"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Gift
} from "lucide-react";

function RegisterForm() {
  const { register, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Read refCode from query parameter
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setRefCode(ref);
    }
  }, [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Strength states
  const [strength, setStrength] = useState<"Weak" | "Medium" | "Strong" | "">("");
  const [strengthScore, setStrengthScore] = useState(0); // 0 to 4

  // Error/Success
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Real-time password strength evaluation
  useEffect(() => {
    if (!password) {
      setStrength("");
      setStrengthScore(0);
      return;
    }

    let score = 0;

    // Rules
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
    setErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    // Simple validations
    if (!name || !email || !password || !confirmPassword) {
      setGeneralError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: ["Passwords do not match"] });
      return;
    }

    if (!acceptTerms) {
      setGeneralError("You must accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name,
        email,
        phone: phone || undefined,
        password,
        confirmPassword,
        acceptTerms,
        refCode,
      };

      const res = await register(payload);
      if (res.success) {
        setSuccessMessage(res.message);
        // Clear fields
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setRefCode("");
        setAcceptTerms(false);
      } else {
        // Handle field-specific Zod validation errors
        if (res.message === "Validation failed" && (res as any).errors) {
          setErrors((res as any).errors);
        } else {
          setGeneralError(res.message);
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-50 to-slate-150 px-4 py-16 dark:from-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-md animate-slide-up">
        {/* Banner */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-600 dark:text-brand-500">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start saving with our smart product alerts
          </p>
        </div>

        {/* Card */}
        <div className="card overflow-hidden border border-border/80 bg-card/70 backdrop-blur-xl p-8">
          {/* General Messages */}
          {generalError && (
            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive dark:bg-destructive/10">
              {generalError}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10">
              {successMessage}
              <div className="mt-2">
                <Link
                  href="/login"
                  className="font-bold text-emerald-700 hover:underline dark:text-emerald-350"
                >
                  Go to Login &rarr;
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Full Name <span className="text-brand-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-border bg-background/50 py-3 pr-4 pl-12 text-sm placeholder:text-muted-foreground/60 focus:border-brand-600 focus:outline-none dark:focus:border-brand-500"
                  disabled={isPending}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name[0]}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Email Address <span className="text-brand-600">*</span>
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
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email[0]}</p>
              )}
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Phone Number (Optional)
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
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone[0]}</p>
              )}
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder="e.g. johnABCD"
                  className="w-full rounded-xl border border-border bg-background/50 py-3 pr-4 pl-12 text-sm placeholder:text-muted-foreground/60 focus:border-brand-600 focus:outline-none dark:focus:border-brand-500 font-semibold"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Password <span className="text-brand-600">*</span>
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

              {/* Password Strength Meter */}
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
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Confirm Password <span className="text-brand-600">*</span>
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
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword[0]}</p>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-border text-brand-600 focus:ring-brand-600 dark:border-neutral-800 dark:bg-neutral-900"
              />
              <label htmlFor="accept-terms" className="ml-2 text-xs text-muted-foreground cursor-pointer select-none">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="font-bold text-brand-600 hover:underline dark:text-brand-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" target="_blank" className="font-bold text-brand-600 hover:underline dark:text-brand-500">
                  Privacy Policy
                </Link>
                .
              </label>
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
                  Register Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-brand-600 hover:underline dark:text-brand-500"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-radial from-slate-50 to-slate-150 px-4 py-16 dark:from-neutral-900 dark:to-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
