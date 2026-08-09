"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Shield,
  ArrowRight, ArrowLeft, Terminal, LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const INTERESTS_LIST = [
  "📱 Gadgets", "💻 Laptops", "🎓 Student Deals",
  "📚 Study Resources", "🛍️ Shopping", "🎮 Gaming"
];

function RegisterFormContent() {
  const { register: registerAuth, user } = useAuth();
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

  const refCode = searchParams.get("ref");

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
      role: data.role,
      interests: data.interests
    } as any);

    setIsPending(false);
    if (res.success) {
      triggerConfetti();
      setTimeout(() => router.push("/dashboard"), 1200);
    } else {
      setGeneralError(res.message);
      if (res.errors) {
        setServerErrors(res.errors);
      }
    }
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="w-full card p-6 sm:p-8 border border-border bg-card shadow-sm rounded-xl select-none">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center">
            <Terminal className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
            Step {step} of 3
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Create your account</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Initialize your SmartPicks identity &amp; preferences.</p>
        
        {/* Progress Line */}
        <div className="w-full bg-muted rounded-full h-1 mt-4 overflow-hidden">
          <div
            className="bg-foreground h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Notification */}
      {(generalError || Object.keys(serverErrors).length > 0) && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 space-y-1">
          {generalError && <p className="font-semibold flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />{generalError}</p>}
          {Object.entries(serverErrors).map(([field, messages]) => (
            <p key={field} className="text-[11px]">
              <span className="capitalize font-semibold">{field}:</span> {Array.isArray(messages) ? messages.join(", ") : messages}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...register("name")} placeholder="John Doe" className="w-full h-10 bg-background border border-border rounded-lg pl-9 pr-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Username</label>
                <input {...register("username")} placeholder="johndoe" className="w-full h-10 bg-background border border-border rounded-lg px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register("email")} type="email" placeholder="name@example.com" className="w-full h-10 bg-background border border-border rounded-lg pl-9 pr-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register("phone")} type="tel" placeholder="+919876543210" className="w-full h-10 bg-background border border-border rounded-lg pl-9 pr-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone.message}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full h-10 bg-background border border-border rounded-lg pl-9 pr-10 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register("confirmPassword")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full h-10 bg-background border border-border rounded-lg pl-9 pr-10 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-red-600 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start pt-2">
              <input {...register("acceptTerms")} id="terms" type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-600 bg-background cursor-pointer" />
              <label htmlFor="terms" className="ml-2 text-xs text-muted-foreground">
                I agree to the <Link href="/terms" className="text-foreground font-semibold hover:underline">Terms of Service</Link> &amp; <Link href="/privacy" className="text-foreground font-semibold hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.acceptTerms && <p className="text-[11px] text-red-600">{errors.acceptTerms.message}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Primary Role</label>
              <div className="grid grid-cols-3 gap-2">
                {["student", "professional", "shopper"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setValue("role", r as any)}
                    className={cn(
                      "py-2 px-2 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer",
                      watchAll.role === r
                        ? "bg-foreground text-background border-foreground font-bold"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Select Interests</label>
              <div className="flex flex-wrap gap-1.5">
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
                      className={cn(
                        "py-1 px-2.5 rounded-md text-xs font-medium border transition-all cursor-pointer",
                        isSelected
                          ? "bg-foreground text-background border-foreground font-semibold"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-border mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="btn-secondary h-10 px-4 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex-1 h-10 text-xs font-semibold justify-center cursor-pointer"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex-1 h-10 text-xs font-semibold justify-center cursor-pointer disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
            </button>
          )}
        </div>
      </form>

      {/* Footer link */}
      <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-foreground" />
      </div>
    }>
      <AuthLayout>
        <RegisterFormContent />
      </AuthLayout>
    </Suspense>
  );
}
