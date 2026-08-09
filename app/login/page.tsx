"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield,
  Zap, ArrowRight, Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Zod Schema ---
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  remember: z.boolean(),
});

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

function AnimatedTabs({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: "email" | "phone") => void }) {
  return (
    <div className="flex p-1 bg-muted border border-border rounded-lg mb-6">
      {["email", "phone"].map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab as "email" | "phone")}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 capitalize cursor-pointer",
            activeTab === tab
              ? "bg-background text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab === "email" ? "Email Address" : "Mobile Phone"}
        </button>
      ))}
    </div>
  );
}

function EmailLogin({ isPending, onSubmit }: { isPending: boolean, onSubmit: (data: LoginFormValues) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Input */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            {...register("email")}
            type="email"
            placeholder="name@example.com"
            className="w-full h-10 bg-background border border-border rounded-lg pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
            disabled={isPending}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full h-10 bg-background border border-border rounded-lg pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Checkbox */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register("remember")}
            type="checkbox"
            className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-600 bg-background cursor-pointer"
          />
          <span className="text-xs text-muted-foreground font-medium">Remember me for 30 days</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full h-10 text-xs font-semibold justify-center cursor-pointer mt-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
        {!isPending && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
      </button>
    </form>
  );
}

function PhoneLogin({ isPending, onSendOtp, onVerifyOtp }: { isPending: boolean, onSendOtp: (p: string) => void, onVerifyOtp: (o: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pasted.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char; });
      setOtp(newOtp);
      const nextEmpty = newOtp.findIndex(v => v === "");
      if (nextEmpty !== -1) inputRefs.current[nextEmpty]?.focus();
      else inputRefs.current[5]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-4">
      {!otpSent ? (
        <>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-10 bg-background border border-border rounded-lg pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                disabled={isPending}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => { if(phone.length >= 10) setOtpSent(true); onSendOtp(phone); }}
            disabled={isPending || phone.length < 10}
            className="btn-primary w-full h-10 text-xs font-semibold justify-center cursor-pointer disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send verification code"}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-3">Enter the 6-digit code sent to <span className="font-semibold text-foreground">{phone}</span></p>
            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 rounded-lg border border-border bg-background text-center text-base font-bold text-foreground focus:ring-2 focus:ring-ring outline-none"
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onVerifyOtp(otp.join(""))}
            disabled={isPending || otp.join("").length < 6}
            className="btn-primary w-full h-10 text-xs font-semibold justify-center cursor-pointer disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
          </button>
          
          <div className="text-center">
             <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-muted-foreground hover:text-foreground">Change Number</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginFormContent() {
  const { login, sendOtp, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [isPending, setIsPending] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleEmailSubmit = async (data: LoginFormValues) => {
    setIsPending(true);
    setGeneralError(null);
    const res = await login({ email: data.email, password: data.password });
    setIsPending(false);
    if (res.success) {
      triggerConfetti();
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      setGeneralError(res.message);
    }
  };

  const handleSendOtp = async (phone: string) => {
    setIsPending(true);
    await sendOtp(phone, "login");
    setIsPending(false);
  };

  const handleVerifyOtp = async (otp: string) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "unknown", otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerConfetti();
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setGeneralError(data.message || "Invalid OTP");
      }
    } catch (e) {
      setGeneralError("An error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="w-full card p-6 sm:p-8 border border-border bg-card shadow-sm rounded-xl select-none">
      {/* Header */}
      <div className="mb-6">
        <div className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center mb-3">
          <Zap className="w-4 h-4 text-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Sign in to SmartPicks</h2>
        <p className="text-xs text-muted-foreground mt-1">Access your budget intelligence suite &amp; deals dashboard.</p>
      </div>

      {/* Error Banner */}
      {generalError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Tabs */}
      <AnimatedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content Form */}
      <div>
        {activeTab === "email" ? (
          <EmailLogin isPending={isPending} onSubmit={handleEmailSubmit} />
        ) : (
          <PhoneLogin isPending={isPending} onSendOtp={handleSendOtp} onVerifyOtp={handleVerifyOtp} />
        )}
      </div>

      {/* Separator */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
          <span className="bg-card px-3 text-muted-foreground">or continue with</span>
        </div>
      </div>

      {/* Social Providers */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { id: "google", name: "Google", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.08-1.3-.176-1.86H12.24z"/></svg> },
          { id: "github", name: "GitHub", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg> },
          { id: "microsoft", name: "Microsoft", icon: <svg className="w-4 h-4" viewBox="0 0 23 23" fill="currentColor"><path d="M0 0h11v11H0z" fill="#f25022"/><path d="M12 0h11v11H12z" fill="#7fba00"/><path d="M0 12h11v11H0z" fill="#00a4ef"/><path d="M12 12h11v11H12z" fill="#ffb900"/></svg> }
        ].map((social) => (
          <button
            key={social.id}
            type="button"
            onClick={() => {
              window.location.href = `/api/v1/auth/${social.id}`;
            }}
            disabled={isPending}
            className="btn-secondary h-9 text-xs font-medium justify-center cursor-pointer"
          >
            {social.icon}
            <span className="hidden sm:inline">{social.name}</span>
          </button>
        ))}
      </div>

      {/* Footer link */}
      <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-foreground hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-foreground" />
      </div>
    }>
      <AuthLayout>
        <LoginFormContent />
      </AuthLayout>
    </Suspense>
  );
}
