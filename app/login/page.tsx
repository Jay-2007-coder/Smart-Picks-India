"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield,
  Zap, Users, Phone, ArrowRight, Smartphone
} from "lucide-react";

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
    <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-8 relative z-20">
      {["email", "phone"].map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab as "email" | "phone")}
          className={`flex-1 relative py-2.5 text-sm font-semibold rounded-xl transition-colors z-10 ${
            activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-20 capitalize">{tab}</span>
        </button>
      ))}
    </div>
  );
}

function EmailLogin({ isPending, onSubmit }: { isPending: boolean, onSubmit: (data: LoginFormValues) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false }
  });

  const passwordValue = watch("password");
  
  // Password Strength Logic
  const strengthScore = React.useMemo(() => {
    let score = 0;
    if (!passwordValue) return 0;
    if (passwordValue.length >= 8) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[a-z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++;
    return score;
  }, [passwordValue]);

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email Input */}
      <div>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors z-10" />
          <input
            {...register("email")}
            type="email"
            placeholder="name@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:bg-white/10 transition-all peer z-0"
            disabled={isPending}
          />
          <label className="absolute left-12 -top-2.5 text-xs font-semibold text-slate-400 bg-[#050816] px-1 peer-focus:text-violet-400 transition-colors peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-[#050816] pointer-events-none">
            Email Address
          </label>
        </div>
        {errors.email && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-rose-400 mt-1.5 ml-2 font-medium">
            {errors.email.message}
          </motion.p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors z-10" />
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:bg-white/10 transition-all peer z-0"
            disabled={isPending}
          />
          <label className="absolute left-12 -top-2.5 text-xs font-semibold text-slate-400 bg-[#050816] px-1 peer-focus:text-violet-400 transition-colors peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-[#050816] pointer-events-none">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Animated Password Strength */}
        <AnimatePresence>
          {passwordValue.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 ml-1">
              <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                {[1, 2, 3, 4].map((step) => (
                  <motion.div
                    key={step}
                    className="h-full flex-1"
                    initial={{ backgroundColor: "transparent" }}
                    animate={{
                      backgroundColor: strengthScore >= step 
                        ? step <= 2 ? "#ef4444" : step === 3 ? "#eab308" : "#10b981"
                        : "transparent"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {errors.password && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-rose-400 mt-1.5 ml-2 font-medium">
            {errors.password.message}
          </motion.p>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-600 bg-white/5 group-hover:border-violet-400 transition-colors">
            <input {...register("remember")} type="checkbox" className="sr-only peer" />
            <motion.div
              initial={false}
              animate={{ scale: watch("remember") ? 1 : 0, opacity: watch("remember") ? 1 : 0 }}
              className="absolute inset-0 bg-violet-500 rounded flex items-center justify-center"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </motion.div>
          </div>
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">Remember Me</span>
        </label>
        
        <Link href="/forgot-password" className="text-xs font-bold text-violet-400 hover:text-violet-300 relative group">
          Forgot Password?
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 group-hover:w-full transition-all duration-300" />
        </Link>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isPending}
        className="relative w-full py-4 rounded-2xl font-black text-white text-sm overflow-hidden group shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] disabled:opacity-70"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #EC4899, #EF4444)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative flex items-center justify-center gap-2">
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          {!isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </span>
      </motion.button>
    </motion.form>
  );
}

function PhoneLogin({ isPending, onSendOtp, onVerifyOtp }: { isPending: boolean, onSendOtp: (p: string) => void, onVerifyOtp: (o: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {!otpSent ? (
        <>
          <div className="relative group">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors z-10" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter mobile number"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:bg-white/10 transition-all z-0"
              disabled={isPending}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { if(phone.length >= 10) setOtpSent(true); onSendOtp(phone); }}
            disabled={isPending || phone.length < 10}
            className="w-full py-4 rounded-2xl font-black text-white text-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all shadow-lg disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send verification code"}
          </motion.button>
        </>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-xs text-slate-400 font-semibold mb-3">Enter the 6-digit code sent to {phone}</p>
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
                  className="w-12 h-14 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none"
                />
              ))}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVerifyOtp(otp.join(""))}
            disabled={isPending || otp.join("").length < 6}
            className="w-full py-4 rounded-2xl font-black text-white text-sm"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Continue"}
          </motion.button>
          
          <div className="text-center">
             <button onClick={() => setOtpSent(false)} className="text-xs font-bold text-slate-400 hover:text-white">Change Number</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function LoginFormContent() {
  const { login, sendOtp, socialLogin, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [isPending, setIsPending] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Tilt Effect using Framer Motion
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

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
      setTimeout(() => router.push("/dashboard"), 1000);
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
        body: JSON.stringify({ phone: "unknown", otp }) // Note: Needs actual phone state if possible
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerConfetti();
        setTimeout(() => router.push("/dashboard"), 1000);
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
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#EC4899', '#EF4444']
    });
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full relative"
    >
      <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 to-white/0 rounded-3xl z-0 pointer-events-none" />
      <div className="bg-[#0b0f19]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden">
        
        {/* Animated ambient glow inside card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-20">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/10 mb-4">
            <Zap className="w-6 h-6 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to SmartPicks</h2>
          <p className="text-sm text-slate-400 font-medium">Access your AI-powered ecosystem.</p>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {generalError && (
            <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                {generalError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="relative z-20 min-h-[280px]">
          <AnimatePresence mode="wait">
            {activeTab === "email" ? (
              <EmailLogin key="email" isPending={isPending} onSubmit={handleEmailSubmit} />
            ) : (
              <PhoneLogin key="phone" isPending={isPending} onSendOtp={handleSendOtp} onVerifyOtp={handleVerifyOtp} />
            )}
          </AnimatePresence>
        </div>

        {/* Social Login Separator */}
        <div className="relative my-8 z-20">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
            <span className="bg-[#0b0f19] px-4 text-slate-500">or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3 relative z-20">
          {[
            { id: "google", icon: <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.08-1.3-.176-1.86H12.24z"/></svg> },
            { id: "github", icon: <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg> },
            { id: "microsoft", icon: <svg className="w-5 h-5" viewBox="0 0 23 23" fill="currentColor"><path d="M0 0h11v11H0z" fill="#f25022"/><path d="M12 0h11v11H12z" fill="#7fba00"/><path d="M0 12h11v11H0z" fill="#00a4ef"/><path d="M12 12h11v11H12z" fill="#ffb900"/></svg> }
          ].map((social) => (
            <motion.button
              key={social.id}
              type="button"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.location.href = `/api/v1/auth/${social.id}`;
              }}
              disabled={isPending}
              className="flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer relative z-50"
            >
              <div className="group-hover:scale-110 transition-transform">{social.icon}</div>
            </motion.button>
          ))}
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center relative z-20">
          <p className="text-xs text-slate-500 font-medium">
            New to the ecosystem?{" "}
            <Link href="/register" className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
              Initialize Account
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#050816]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full" />
      </div>
    }>
      <AuthLayout>
        <LoginFormContent />
      </AuthLayout>
    </Suspense>
  );
}
