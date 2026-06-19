"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield,
  ArrowRight, ArrowLeft, Terminal, LayoutGrid, Heart
} from "lucide-react";

// --- Zod Schema for all steps ---
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z.string().min(3, "Username must be at least 3 characters.").optional(),
  email: z.string().email("Please enter a valid email address."),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +919876543210)")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character."),
  confirmPassword: z.string().min(8, "Confirm your password."),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms."),
  role: z.enum(["student", "professional", "shopper"]),
  interests: z.array(z.string())
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = {
  name: string;
  username?: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  role: "student" | "professional" | "shopper";
  interests: string[];
};

const STEPS = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "Security setup", icon: Lock },
  { id: 3, title: "Ecosystem Prefs", icon: LayoutGrid }
];

const INTERESTS_LIST = [
  "📱 Gadgets", "💻 Laptops", "🎓 Student Deals",
  "📚 Study Resources", "🛍️ Shopping", "🎮 Gaming"
];

function RegisterFormContent() {
  const { register: registerAuth, socialLogin, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", username: "", email: "", phone: "",
      password: "", confirmPassword: "", acceptTerms: false,
      role: "student", interests: []
    },
    mode: "onChange"
  });

  const watchAll = watch();
  const passwordValue = watchAll.password;

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  // Set refCode if it exists
  const refCode = searchParams.get("ref");

  // Tilt Effect using Framer Motion
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["name", "username", "email", "phone"];
    if (step === 2) fieldsToValidate = ["password", "confirmPassword", "acceptTerms"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => setStep(prev => prev - 1);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsPending(true);
    setGeneralError(null);
    setServerErrors({});
    const res = await registerAuth({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
      confirmPassword: data.confirmPassword,
      acceptTerms: data.acceptTerms,
      refCode: refCode || "",
      // Pass extras if API accepts them
      role: data.role,
      interests: data.interests
    } as any);

    setIsPending(false);
    if (res.success) {
      triggerConfetti();
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      setGeneralError(res.message);
      if (res.errors) {
        setServerErrors(res.errors);
      }
    }
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#7C3AED', '#EC4899', '#EF4444'] });
  };

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

  const initials = watchAll.name ? watchAll.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2) : "AI";

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full relative"
    >
      <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 to-white/0 rounded-3xl z-0 pointer-events-none" />
      <div className="bg-[#0b0f19]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10 overflow-hidden min-h-[460px] flex flex-col">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Progress Bar Header */}
        <div className="mb-5 relative z-20">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-violet-400" />
              Initialize Identity
            </h2>
            <div className="text-xs font-black text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {Math.round((step / 3) * 100)}%
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step >= s ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Avatar Generator (only show when name is typed) */}
        <AnimatePresence>
          {watchAll.name.length > 2 && step === 1 && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-violet-500 rounded-full blur-[20px] opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-rose-600 flex items-center justify-center relative border-2 border-white/20 z-10 shadow-xl">
                  <span className="text-xl font-black text-white tracking-wider">{initials}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col relative z-20">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input {...register("name")} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
                    </div>
                    {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">@</span>
                      <input {...register("username")} placeholder="Username" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-3 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register("email")} type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
                  </div>
                  {errors.email && <p className="text-[10px] text-rose-400 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register("phone")} type="tel" placeholder="Phone Number (e.g. +919876543210) (Optional)" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
                  </div>
                  {errors.phone && <p className="text-[10px] text-rose-400 mt-1">{errors.phone.message}</p>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Master Password" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordValue && (
                    <div className="mt-2 flex gap-1 h-1 rounded-full overflow-hidden bg-white/5">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`h-full flex-1 transition-colors duration-300 ${strengthScore >= s ? s <= 2 ? "bg-rose-500" : s === 3 ? "bg-amber-500" : "bg-emerald-500" : "bg-transparent"}`} />
                      ))}
                    </div>
                  )}
                  {errors.password && <p className="text-[10px] text-rose-400 mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register("confirmPassword")} type={showPassword ? "text" : "password"} placeholder="Confirm Password" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-rose-400 mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <div className="flex items-start mt-4">
                  <input {...register("acceptTerms")} id="terms" type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-600 text-violet-500 focus:ring-violet-500 bg-white/5" />
                  <label htmlFor="terms" className="ml-2 text-xs text-slate-400">
                    I agree to the <Link href="/terms" className="text-violet-400 hover:underline">Terms</Link> & <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-[10px] text-rose-400">{errors.acceptTerms.message}</p>}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Primary Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["student", "professional", "shopper"].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setValue("role", r as any)}
                        className={`py-2 px-1 text-xs font-bold capitalize rounded-xl border transition-all ${watchAll.role === r ? "bg-violet-500/20 border-violet-500 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Select Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS_LIST.map(interest => {
                      const isSelected = watchAll.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            if (isSelected) setValue("interests", watchAll.interests.filter(i => i !== interest));
                            else setValue("interests", [...watchAll.interests, interest]);
                          }}
                          className={`py-1.5 px-3 rounded-full text-xs font-semibold border transition-all ${isSelected ? "bg-rose-500/20 border-rose-500 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(generalError || Object.keys(serverErrors).length > 0) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 space-y-1.5"
              >
                {generalError && <p className="font-bold">{generalError}</p>}
                {Object.entries(serverErrors).map(([field, messages]) => (
                  <p key={field} className="text-[11px] font-normal leading-relaxed">
                    <span className="capitalize font-semibold text-rose-300">{field}:</span> {Array.isArray(messages) ? messages.join(", ") : messages}
                  </p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-5 flex gap-3">
            {step > 1 && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={handlePrev} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
            
            {step < 3 ? (
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="button" onClick={handleNext} className="flex-1 py-3 rounded-2xl font-black text-white text-sm relative overflow-hidden group shadow-[0_0_30px_-10px_rgba(124,58,237,0.4)]" style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}>
                <span className="relative flex items-center justify-center gap-2">Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isPending} className="flex-1 py-3 rounded-2xl font-black text-white text-sm relative overflow-hidden group shadow-[0_0_40px_-10px_rgba(124,58,237,0.6)] disabled:opacity-70" style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899, #EF4444)", backgroundSize: "200% 200%" }} animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
                <span className="relative flex items-center justify-center gap-2">
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Account"}
                </span>
              </motion.button>
            )}
          </div>
        </form>

        <div className="mt-4 text-center relative z-20">
          <p className="text-xs text-slate-500 font-medium">
            Already registered? <Link href="/login" className="font-bold text-violet-400 hover:text-violet-300">Sign In</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#050816]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <AuthLayout>
        <RegisterFormContent />
      </AuthLayout>
    </Suspense>
  );
}
