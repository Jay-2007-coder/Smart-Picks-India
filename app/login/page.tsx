"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function LoginForm() {
  const { login, socialLogin, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/dashboard";

  // Navigation redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  // Tabs: "credentials" or "otp"
  const [activeTab, setActiveTab] = useState<"credentials" | "otp">("credentials");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // OTP Login states
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // General states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle countdown timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpCooldown > 0) {
      interval = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpCooldown]);

  // Handle OAuth redirects and mock fallbacks
  const mockProvider = searchParams.get("mock_provider") as "google" | "github" | "microsoft" | null;
  const authError = searchParams.get("error");

  useEffect(() => {
    if (authError) {
      if (authError === "google_token_failed" || authError === "google_user_failed") {
        setError("Failed to authenticate with Google. Please check backend environment configurations.");
      } else if (authError === "github_token_failed" || authError === "github_user_failed") {
        setError("Failed to authenticate with GitHub. Please check backend environment configurations.");
      } else if (authError === "microsoft_token_failed" || authError === "microsoft_user_failed") {
        setError("Failed to authenticate with Microsoft. Please check backend environment configurations.");
      } else {
        setError("Social authentication failed.");
      }
    }
  }, [authError]);

  useEffect(() => {
    if (mockProvider && !user && !isPending) {
      // Clean query params from the URL address bar immediately
      const newUrl = window.location.pathname + (redirectPath !== "/dashboard" ? `?from=${encodeURIComponent(redirectPath)}` : "");
      window.history.replaceState({}, document.title, newUrl);
      
      triggerMockSocialSignIn(mockProvider);
    }
  }, [mockProvider, user, isPending, redirectPath]);

  // ─── 1. Credentials Submit ─────────────────────────────────────────────────
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    startTransition(async () => {
      const res = await login({ email, password, rememberMe });
      if (res.success) {
        setSuccess(res.message);
        router.push(redirectPath);
      } else {
        setError(res.message);
      }
    });
  };

  // ─── 2. Send OTP ───────────────────────────────────────────────────────────
  const handleSendOtp = () => {
    setError(null);
    setSuccess(null);

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phone || !phoneRegex.test(phone)) {
      setError("Please enter a valid phone number in international E.164 format (e.g. +919876543210)");
      return;
    }

    startTransition(async () => {
      // Send OTP API call
      const res = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "login" }),
      });
      const data = await res.json();

      if (responseOk(res) && data.success) {
        setOtpOtpSent(true);
        setOtpTimer(300); // 5 minutes validity
        setOtpCooldown(60); // 60 seconds cooldown for resending
        setSuccess("OTP sent successfully. Check your SMS logs.");
      } else {
        setError(data.message || "Failed to send OTP.");
      }
    });
  };

  // Helper because TypeScript checks response state
  const responseOk = (r: Response) => r.ok;

  // ─── 3. Verify OTP Submit ──────────────────────────────────────────────────
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!phone || !otpCode) {
      setError("Phone number and OTP code are required.");
      return;
    }

    if (otpCode.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    startTransition(async () => {
      const res = await login({ phone, code: otpCode, rememberMe });
      if (res.success) {
        setSuccess(res.message);
        router.push(redirectPath);
      } else {
        setError(res.message);
      }
    });
  };

  // ─── 4. Social Authentication ─────────────────────────────────────────
  const handleSocialSignIn = (provider: "google" | "github" | "microsoft") => {
    setError(null);
    setSuccess(null);
    // Redirect to backend OAuth route
    window.location.href = `/api/v1/auth/${provider}`;
  };

  const triggerMockSocialSignIn = (provider: "google" | "github" | "microsoft") => {
    startTransition(async () => {
      // Simulating realistic user profiles
      const mockProfiles = {
        google: {
          accountId: "g-" + Math.floor(Math.random() * 1000000),
          email: "jay.google@example.com",
          name: "Jay (Google Auth)",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        },
        github: {
          accountId: "gh-" + Math.floor(Math.random() * 1000000),
          email: "jay.github@example.com",
          name: "Jay (GitHub Auth)",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        },
        microsoft: {
          accountId: "ms-" + Math.floor(Math.random() * 1000000),
          email: "jay.ms@example.com",
          name: "Jay (Microsoft Auth)",
          avatarUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&q=80",
        },
      };

      const payload = { provider, ...mockProfiles[provider] };
      const res = await socialLogin(payload);
      if (res.success) {
        setSuccess(res.message);
        router.push(redirectPath);
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-50 to-slate-150 px-4 py-16 dark:from-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo Banner */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-600 dark:text-brand-500">
            SmartPicks India
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your smart budget shopping portal
          </p>
        </div>

        {/* Card Body */}
        <div className="card overflow-hidden border border-border/80 bg-card/70 backdrop-blur-xl">
          {/* Tab Selector */}
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setActiveTab("credentials");
                setError(null);
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${
                activeTab === "credentials"
                  ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-500"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => {
                setActiveTab("otp");
                setError(null);
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${
                activeTab === "otp"
                  ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-500"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              Phone & OTP
            </button>
          </div>

          <div className="p-8">
            {/* Feedback Messages */}
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

            {/* TAB 1: CREDENTIALS FORM */}
            {activeTab === "credentials" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-600 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                    Remember me for 7 days
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
                      Sign In <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: OTP FORM */}
            {activeTab === "otp" && (
              <div className="space-y-5">
                {!otpSent ? (
                  <div className="space-y-4">
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
                        Include country code. Twilio will be bypassed, logging OTP code to terminal output.
                      </p>
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={isPending}
                      className="btn-primary w-full"
                    >
                      {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Request OTP Verification"
                      )}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-5">
                    <div className="rounded-xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground">
                      OTP Sent to <strong className="text-foreground">{phone}</strong>. 
                      {otpTimer > 0 ? (
                        <span> Valid for {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}</span>
                      ) : (
                        <span className="text-destructive"> Code Expired</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="000000"
                        className="w-full rounded-xl border border-border bg-background/50 py-3 px-4 text-center text-xl font-bold tracking-widest focus:border-brand-600 focus:outline-none dark:focus:border-brand-500"
                        disabled={isPending}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setOtpOtpSent(false)}
                        className="font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Change Phone
                      </button>

                      {otpCooldown > 0 ? (
                        <span className="text-muted-foreground font-semibold">
                          Resend OTP in {otpCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
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
                        "Verify & Log In"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Social Logins Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-bold tracking-wide">
                  Or Continue With
                </span>
              </div>
            </div>

            {/* Social OAuth Grid */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialSignIn("google")}
                className="btn-secondary flex flex-col items-center gap-1.5 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-border"
              >
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.08-1.3-.176-1.86H12.24z" />
                </svg>
                <span className="text-xs">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn("github")}
                className="btn-secondary flex flex-col items-center gap-1.5 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-border"
              >
                <svg className="h-5 w-5 text-neutral-850 dark:text-neutral-200" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span className="text-xs">GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn("microsoft")}
                className="btn-secondary flex flex-col items-center gap-1.5 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-border"
              >
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M0 0h11v11H0z" fill="#f25022" />
                  <path d="M12 0h11v11H12z" fill="#7fba00" />
                  <path d="M0 12h11v11H0z" fill="#00a4ef" />
                  <path d="M12 12h11v11H12z" fill="#ffb900" />
                </svg>
                <span className="text-xs">Microsoft</span>
              </button>
            </div>

            {/* Signup Link */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-brand-600 hover:underline dark:text-brand-500"
              >
                Create Free Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-radial from-slate-50 to-slate-150 dark:from-neutral-900 dark:to-neutral-950">
        <Loader2 className="h-12 w-12 animate-spin text-brand-600 animate-pulse" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
