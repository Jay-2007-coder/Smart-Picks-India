"use client";

import React, {
  useState, useEffect, useTransition, Suspense,
  useRef, useCallback, useMemo,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Phone, Eye, EyeOff, Loader2, ArrowRight,
  ShieldCheck, Sparkles, Zap, Star, Check, X,
  TrendingUp, BookOpen, ShoppingBag, Brain,
  ChevronLeft, ChevronRight, User, Clock, Heart,
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CONSTANTS                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

const TYPEWRITER_PHRASES = [
  "Save Smarter.",
  "Study Better.",
  "Shop Faster.",
  "Discover Deals.",
  "Save Big Daily.",
];

const STATS = [
  { icon: "🔥", label: "Users", value: 50000, suffix: "K+", display: "50K+" },
  { icon: "💰", label: "Saved", value: 1, suffix: "Cr+", display: "₹1Cr+" },
  { icon: "📚", label: "Resources", value: 10000, suffix: "K+", display: "10K+" },
  { icon: "🛍️", label: "Deals Daily", value: 1000, suffix: "+", display: "1000+" },
];

const FEATURES = [
  { icon: Zap, title: "Instant Compare", desc: "Compare prices across 50+ stores instantly", color: "#7C3AED" },
  { icon: Brain, title: "AI Picks", desc: "Personalised deal recommendations powered by AI", color: "#EC4899" },
  { icon: BookOpen, title: "Student Hub", desc: "Resources, tools & discounts for college students", color: "#EF4444" },
  { icon: ShoppingBag, title: "Daily Deals", desc: "1000+ fresh deals refreshed every morning", color: "#F59E0B" },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "Engineering Student", text: "Saved ₹3000 on my laptop purchase. Absolute game changer!", rating: 5 },
  { name: "Rahul M.", role: "MBA Student", text: "Best student deals website in India. Use it every day!", rating: 5 },
  { name: "Anjali K.", role: "Content Creator", text: "The AI recommendations are scary accurate. Totally in love!", rating: 5 },
  { name: "Vivek T.", role: "Software Dev", text: "Found deals I couldn't find anywhere else. Highly recommended.", rating: 5 },
];

const ACTIVITIES = [
  { user: "Rahul", city: "Mumbai", action: "saved ₹1,200 on Sony Headphones", color: "#10B981" },
  { user: "Priya", city: "Delhi", action: "unlocked Student Discount (30% OFF)", color: "#6366F1" },
  { user: "Aman", city: "Bangalore", action: "bought Laptop Stand at ₹399", color: "#F59E0B" },
  { user: "Sneha", city: "Pune", action: "saved ₹800 on iPhone accessories", color: "#EC4899" },
  { user: "Ravi", city: "Chennai", action: "claimed Free Shipping on ₹2k order", color: "#14B8A6" },
  { user: "Komal", city: "Hyderabad", action: "discovered ₹4,500 scholarship deal", color: "#8B5CF6" },
];

const TICKER_ITEMS = [
  "🔥 iPhone 15 – 15% Off",
  "💻 Dell Laptop Sale",
  "🎓 Student Coupon Active",
  "🛒 Amazon Deal Alert",
  "⚡ Flash Sale: 60 mins left",
  "🖥️ Monitor Deals from ₹6,999",
  "📱 Oneplus 12 – Lowest Price",
  "🎧 Sony WH-1000XM5 – ₹3k Off",
];

const SOCIAL_PROVIDERS = [
  {
    key: "google" as const, label: "Google", color: "#EA4335", hoverBg: "rgba(234,67,53,0.08)",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3L16.04 18.013Z"/>
        <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
        <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
      </svg>
    ),
  },
  {
    key: "github" as const, label: "GitHub", color: "#fff", hoverBg: "rgba(255,255,255,0.06)",
    icon: (
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
      </svg>
    ),
  },
  {
    key: "microsoft" as const, label: "Microsoft", color: "#0078D4", hoverBg: "rgba(0,120,212,0.08)",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 23 23">
        <path d="M0 0h11v11H0z" fill="#f25022"/><path d="M12 0h11v11H12z" fill="#7fba00"/>
        <path d="M0 12h11v11H0z" fill="#00a4ef"/><path d="M12 12h11v11H12z" fill="#ffb900"/>
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PARTICLE CANVAS                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let animId: number;

    interface P { x: number; y: number; vx: number; vy: number; r: number; alpha: number; }
    const COUNT = 90;
    const particles: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // Shooting stars
    interface Star { x: number; y: number; len: number; speed: number; alpha: number; active: boolean; }
    const stars: Star[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.5,
      len: Math.random() * 120 + 60, speed: Math.random() * 6 + 4,
      alpha: 0, active: false,
    }));

    const spawnStar = () => {
      const s = stars.find((s) => !s.active);
      if (s) { s.x = Math.random() * W; s.y = Math.random() * H * 0.4; s.alpha = 1; s.active = true; }
    };
    const starInterval = setInterval(spawnStar, 2200);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Connections
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124,58,237,${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach((p) => {
        // Mouse attraction
        const mdx = mouse.current.x - p.x;
        const mdy = mouse.current.y - p.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 140) { p.vx += (mdx / md) * 0.015; p.vy += (mdy / md) * 0.015; }

        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.99; p.vy *= 0.99;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
        grad.addColorStop(0, `rgba(167,139,250,${p.alpha})`);
        grad.addColorStop(1, "rgba(124,58,237,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Shooting stars
      stars.forEach((s) => {
        if (!s.active) return;
        s.x += s.speed; s.y += s.speed * 0.4; s.alpha -= 0.018;
        if (s.alpha <= 0) { s.active = false; return; }
        ctx.beginPath();
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.len, s.y - s.len * 0.4);
        g.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
        g.addColorStop(0.4, `rgba(167,139,250,${s.alpha * 0.6})`);
        g.addColorStop(1, "rgba(167,139,250,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.len, s.y - s.len * 0.4);
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const onMouse = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(starInterval);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CURSOR GLOW                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX - 120); y.set(e.clientY - 120); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      style={{ left: sx, top: sy }}
      className="fixed w-60 h-60 rounded-full pointer-events-none z-0"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="w-full h-full rounded-full" style={{
        background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(236,72,153,0.08) 60%, transparent 100%)",
        filter: "blur(40px)",
        mixBlendMode: "screen",
      }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TYPEWRITER                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function TypewriterText() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx];
    let timeout: NodeJS.Timeout;

    if (!deleting) {
      if (displayed.length < phrase.length) {
        timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
      } else {
        timeout = setTimeout(() => setDeleting(true), 2200);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      } else {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % TYPEWRITER_PHRASES.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIdx]);

  return (
    <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block ml-0.5 w-0.5 h-[1em] bg-violet-400 align-middle"
      />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COUNT-UP STAT CARD                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function StatCard({ stat, delay }: { stat: typeof STATS[0]; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      className="relative group cursor-default select-none"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.06) 100%)",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 16,
        padding: "14px 18px",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: "0 0 24px rgba(124,58,237,0.3)" }} />
      <div className="text-2xl mb-1">{stat.icon}</div>
      <div className="text-xl font-black text-white">{stat.display}</div>
      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TESTIMONIALS CAROUSEL                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ height: 130 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 p-4 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(124,58,237,0.06) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: TESTIMONIALS[idx].rating }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-slate-300 font-medium leading-relaxed italic mb-2">
            "{TESTIMONIALS[idx].text}"
          </p>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[9px] font-black text-white">
              {TESTIMONIALS[idx].name[0]}
            </div>
            <div>
              <p className="text-[11px] font-black text-white">{TESTIMONIALS[idx].name}</p>
              <p className="text-[10px] text-slate-500">{TESTIMONIALS[idx].role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Dots */}
      <div className="absolute bottom-2 right-3 flex gap-1">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === idx ? "bg-violet-400 w-3" : "bg-white/20"}`} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  LIVE ACTIVITY FEED                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function ActivityFeed() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % ACTIVITIES.length);
        setVisible(true);
      }, 400);
    };
    const t = setInterval(cycle, 3000);
    return () => clearInterval(t);
  }, []);

  const act = ACTIVITIES[current];

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={current}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ background: act.color, boxShadow: `0 0 8px ${act.color}` }} />
          <p className="text-xs text-slate-400 font-medium">
            <span className="text-white font-bold">{act.user}</span> from {act.city} {act.action}
          </p>
          <span className="ml-auto text-[9px] text-slate-600 font-bold shrink-0">just now</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PRICE TICKER                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function PriceTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex gap-12"
        animate={{ x: [0, -1200] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-xs font-bold text-slate-400 inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-violet-500 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PASSWORD STRENGTH METER                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const levels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#10B981", "#6366F1"];

  if (!password) return null;

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2.5">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${(score / 4) * 100}%`, backgroundColor: colors[score] }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[10px] font-black" style={{ color: colors[score] }}>{levels[score]}</span>
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5">
        {checks.map((c) => (
          <motion.div key={c.label} className="flex items-center gap-1.5"
            animate={{ opacity: 1 }} initial={{ opacity: 0.6 }}>
            <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all duration-300 ${c.pass ? "bg-emerald-500/20" : "bg-white/5"}`}>
              {c.pass
                ? <Check className="h-2.5 w-2.5 text-emerald-400" />
                : <X className="h-2.5 w-2.5 text-slate-700" />}
            </div>
            <span className={`text-[10px] font-bold ${c.pass ? "text-emerald-400" : "text-slate-600"}`}>{c.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  OTP INPUT (6 BOXES)                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function OTPBoxes({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const handleDigit = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...value]; next[i] = val.slice(-1); onChange(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };
  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i]} onChange={(e) => handleDigit(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)}
          whileFocus={{ scale: 1.08 }}
          className="flex-1 h-14 rounded-2xl text-center text-xl font-black text-white focus:outline-none transition-all duration-200"
          style={{
            background: value[i] ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)",
            border: value[i] ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  3D CARD TILT WRAPPER                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 25 });
  const sry = useSpring(ry, { stiffness: 200, damping: 25 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rx.set(((e.clientY - cy) / rect.height) * -10);
    ry.set(((e.clientX - cx) / rect.width) * 10);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  LEFT MARKETING SECTION                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function LeftSection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-col justify-center py-12 pr-10 space-y-8 overflow-y-auto"
    >
      {/* Headline */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-violet-400">India's #1 AI Shopping Platform</span>
        </motion.div>

        <h1 className="text-4xl xl:text-5xl font-black leading-tight text-white">
          <TypewriterText />
          <br />
          <span className="text-white/90">Every Day.</span>
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
          India's AI-powered platform for budget shopping, student resources, and smart deals. Join 50K+ users saving big every day.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} delay={0.3 + i * 0.08} />
        ))}
      </div>

      {/* Feature Cards */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Packed with features</p>
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              whileHover={{ scale: 1.04, y: -3 }}
              className="p-3 rounded-2xl cursor-default group transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-2 transition-all group-hover:scale-110"
                style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                <f.icon className="h-4 w-4" style={{ color: f.color }} />
              </div>
              <p className="text-xs font-black text-white">{f.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">What users say</p>
        <TestimonialsCarousel />
      </div>

      {/* Activity Feed */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live activity
        </p>
        <ActivityFeed />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN LOGIN FORM                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
function LoginForm() {
  const { login, socialLogin, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/dashboard";

  useEffect(() => { if (user) router.push(redirectPath); }, [user, router, redirectPath]);

  const [activeTab, setActiveTab] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    let i: NodeJS.Timeout;
    if (otpTimer > 0) i = setInterval(() => setOtpTimer((p) => p - 1), 1000);
    return () => clearInterval(i);
  }, [otpTimer]);

  useEffect(() => {
    let i: NodeJS.Timeout;
    if (otpCooldown > 0) i = setInterval(() => setOtpCooldown((p) => p - 1), 1000);
    return () => clearInterval(i);
  }, [otpCooldown]);

  const mockProvider = searchParams.get("mock_provider") as "google" | "github" | "microsoft" | null;
  const authError = searchParams.get("error");

  useEffect(() => {
    if (authError) {
      setError("Authentication failed. Please try again.");
    }
  }, [authError]);

  useEffect(() => {
    if (mockProvider && !user && !isPending) {
      const newUrl = window.location.pathname + (redirectPath !== "/dashboard" ? `?from=${encodeURIComponent(redirectPath)}` : "");
      window.history.replaceState({}, document.title, newUrl);
      triggerMockSocialSignIn(mockProvider);
    }
  }, [mockProvider, user, isPending, redirectPath]);

  const doError = (msg: string) => {
    setError(msg);
    setSubmitState("error");
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!email || !password) { doError("Please fill in all fields."); return; }
    setSubmitState("loading");
    startTransition(async () => {
      const res = await login({ email, password, rememberMe });
      if (res.success) {
        setSubmitState("success");
        setSuccess(res.message);
        try {
          const confetti = (await import("canvas-confetti")).default;
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#7C3AED", "#EC4899", "#EF4444", "#F59E0B"] });
        } catch { }
        setTimeout(() => router.push(redirectPath), 800);
      } else {
        doError(res.message);
      }
    });
  };

  const handleSendOtp = () => {
    setError(null); setSuccess(null);
    if (!/^\+[1-9]\d{1,14}$/.test(phone)) { doError("Enter a valid phone number (+919876543210)"); return; }
    startTransition(async () => {
      const res = await fetch("/api/v1/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, purpose: "login" }) });
      const data = await res.json();
      if (res.ok && data.success) { setOtpSent(true); setOtpTimer(300); setOtpCooldown(60); setSuccess("OTP sent! Check your messages."); }
      else doError(data.message || "Failed to send OTP.");
    });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    setError(null); setSuccess(null);
    if (code.length !== 6) { doError("Enter your complete 6-digit OTP."); return; }
    setSubmitState("loading");
    startTransition(async () => {
      const res = await login({ phone, code, rememberMe });
      if (res.success) { setSubmitState("success"); setSuccess(res.message); setTimeout(() => router.push(redirectPath), 800); }
      else doError(res.message);
    });
  };

  const handleSocialSignIn = (provider: "google" | "github" | "microsoft") => {
    setError(null); setSocialLoading(provider);
    window.location.href = `/api/v1/auth/${provider}`;
  };

  const triggerMockSocialSignIn = (provider: "google" | "github" | "microsoft") => {
    startTransition(async () => {
      const profiles: Record<string, any> = {
        google: { accountId: "g-" + Math.random(), email: "jay.google@example.com", name: "Jay (Google)", avatarUrl: "" },
        github: { accountId: "gh-" + Math.random(), email: "jay.github@example.com", name: "Jay (GitHub)", avatarUrl: "" },
        microsoft: { accountId: "ms-" + Math.random(), email: "jay.ms@example.com", name: "Jay (Microsoft)", avatarUrl: "" },
      };
      const res = await socialLogin({ provider, ...profiles[provider] });
      if (res.success) { setSuccess(res.message); router.push(redirectPath); }
      else doError(res.message);
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#050816" }}>
      {/* Animated background layers */}
      <ParticleCanvas />
      <CursorGlow />

      {/* Fixed ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[
          { x: "-10%", y: "-10%", size: 600, from: "#7C3AED", to: "#4F46E5", dur: 12 },
          { x: "70%", y: "60%", size: 500, from: "#EC4899", to: "#EF4444", dur: 15 },
          { x: "40%", y: "-5%", size: 400, from: "#4F46E5", to: "#7C3AED", dur: 10 },
          { x: "-5%", y: "70%", size: 380, from: "#A855F7", to: "#EC4899", dur: 18 },
        ].map((b, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: b.size, height: b.size, left: b.x, top: b.y, filter: "blur(100px)", opacity: 0.12,
              background: `radial-gradient(circle, ${b.from}, ${b.to})` }}
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.8) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Price Ticker Bar */}
      <div className="fixed top-0 left-0 right-0 z-20 py-2 overflow-hidden"
        style={{ background: "rgba(5,8,22,0.85)", borderBottom: "1px solid rgba(124,58,237,0.2)", backdropFilter: "blur(12px)" }}>
        <PriceTicker />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen pt-10 px-4 lg:px-0">
        <div className="max-w-7xl mx-auto min-h-screen grid lg:grid-cols-[45%_55%] gap-0 items-center">

          {/* LEFT */}
          <div className="lg:pl-12 xl:pl-20">
            <LeftSection />
          </div>

          {/* RIGHT */}
          <div className="py-8 lg:py-12 lg:pl-8 xl:pl-16 flex items-center justify-center lg:justify-start">
            <TiltCard className="w-full max-w-[500px]">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                animate-shake={shake ? "shake" : ""}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  animate={shake ? { x: [-6, 6, -5, 5, -3, 3, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="relative rounded-[30px] overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(124,58,237,0.04) 100%)",
                    backdropFilter: "blur(25px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: error
                      ? "0 0 0 1px rgba(239,68,68,0.3), 0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(239,68,68,0.1)"
                      : "0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Card top glow line */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(236,72,153,0.4), transparent)" }} />

                  {/* Scrollable inner */}
                  <div className="p-7 max-h-[88vh] overflow-y-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>

                    {/* Brand */}
                    <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <div className="inline-flex items-center justify-center mb-3 relative">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl relative"
                          style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899, #EF4444)" }}>
                          <Sparkles className="h-7 w-7 text-white" />
                          <div className="absolute inset-0 rounded-2xl animate-pulse"
                            style={{ boxShadow: "0 0 30px rgba(124,58,237,0.5)" }} />
                        </div>
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight">SmartPicks India</h2>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Sign in to your budget shopping portal</p>

                      {/* Trust badges */}
                      <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                        {[
                          { icon: ShieldCheck, label: "256-Bit SSL", color: "#10B981" },
                          { icon: Zap, label: "Instant Access", color: "#F59E0B" },
                          { icon: User, label: "50K+ Users", color: "#6366F1" },
                        ].map(({ icon: Icon, label, color }) => (
                          <div key={label} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                            <Icon className="h-3 w-3" style={{ color }} />
                            {label}
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Tab Switcher */}
                    <div className="relative flex p-1.5 mb-6 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <motion.div className="absolute inset-y-1.5 rounded-xl"
                        animate={{ left: activeTab === "credentials" ? 6 : "50%", width: "calc(50% - 6px)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899 80%)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}
                      />
                      {[
                        { key: "credentials", label: "Email & Password" },
                        { key: "otp", label: "Phone & OTP" },
                      ].map((tab) => (
                        <button key={tab.key}
                          onClick={() => { setActiveTab(tab.key as any); setError(null); }}
                          className={`relative z-10 flex-1 py-2.5 text-xs font-black tracking-wide transition-colors cursor-pointer rounded-xl ${activeTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Feedback */}
                    <AnimatePresence mode="wait">
                      {(error || success) && (
                        <motion.div key={error ? "e" : "s"}
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          className={`mb-4 flex items-start gap-3 rounded-2xl p-3.5 text-xs font-semibold ${error ? "text-rose-400" : "text-emerald-400"}`}
                          style={{ background: error ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", border: error ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(16,185,129,0.2)" }}
                        >
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${error ? "bg-rose-500/20" : "bg-emerald-500/20"}`}>
                            {error ? "!" : <Check className="h-3 w-3" />}
                          </div>
                          <span className="leading-relaxed">{error || success}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">

                      {/* EMAIL / PASSWORD */}
                      {activeTab === "credentials" && (
                        <motion.form key="creds"
                          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}
                          onSubmit={handleCredentialsSubmit} className="space-y-4"
                        >
                          {/* Email */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</label>
                            <div className="relative group">
                              <Mail className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-violet-400 z-10" />
                              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com" disabled={isPending} required
                                className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-slate-700 focus:outline-none transition-all duration-300"
                                style={{ background: "rgba(255,255,255,0.05)", border: email ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)" }}
                              />
                            </div>
                          </div>

                          {/* Password */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
                              <Link href="/forgot-password" className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors">
                                Forgot password?
                              </Link>
                            </div>
                            <div className="relative group">
                              <Lock className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-violet-400 z-10" />
                              <input type={showPassword ? "text" : "password"} value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" disabled={isPending}
                                className="w-full rounded-2xl py-3.5 pl-11 pr-12 text-sm font-medium text-white placeholder:text-slate-700 focus:outline-none transition-all duration-300"
                                style={{ background: "rgba(255,255,255,0.05)", border: password ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)" }}
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors cursor-pointer z-10">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <PasswordStrength password={password} />
                          </div>

                          {/* Remember Me */}
                          <label className="flex items-center gap-2.5 cursor-pointer group">
                            <motion.div onClick={() => setRememberMe(!rememberMe)} whileTap={{ scale: 0.9 }}
                              className="h-4 w-4 rounded border transition-all flex items-center justify-center cursor-pointer"
                              style={{ background: rememberMe ? "linear-gradient(135deg, #7C3AED, #EC4899)" : "rgba(255,255,255,0.05)", border: rememberMe ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                              {rememberMe && <Check className="h-2.5 w-2.5 text-white" />}
                            </motion.div>
                            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-400 transition-colors select-none">
                              Remember me for 7 days
                            </span>
                          </label>

                          {/* Submit Button */}
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            type="submit" disabled={isPending}
                            className="relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-black text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                            style={{ background: submitState === "success" ? "#10B981" : "linear-gradient(135deg, #7C3AED 0%, #EC4899 60%, #EF4444 100%)", transition: "background 0.4s" }}
                          >
                            {/* Shimmer sweep */}
                            <motion.div className="absolute inset-0 pointer-events-none"
                              style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }}
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="relative flex items-center justify-center gap-2">
                              {submitState === "loading" ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                              ) : submitState === "success" ? (
                                <><Check className="h-4 w-4" /> Welcome back!</>
                              ) : (
                                <>Sign In <ArrowRight className="h-4 w-4" /></>
                              )}
                            </span>
                          </motion.button>
                        </motion.form>
                      )}

                      {/* PHONE / OTP */}
                      {activeTab === "otp" && (
                        <motion.div key="otp"
                          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.22 }}
                          className="space-y-5"
                        >
                          <AnimatePresence mode="wait">
                            {!otpSent ? (
                              <motion.div key="ph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</label>
                                  <div className="relative">
                                    <Phone className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-600 z-10" />
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                      placeholder="+919876543210" disabled={isPending}
                                      className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-slate-700 focus:outline-none transition-all"
                                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                                    />
                                  </div>
                                  <p className="text-[10px] text-slate-600 pl-1">Include country code in E.164 format</p>
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                  onClick={handleSendOtp} disabled={isPending}
                                  className="w-full rounded-2xl py-3.5 text-sm font-black text-white cursor-pointer disabled:opacity-60"
                                  style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899, #EF4444)" }}>
                                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Request OTP Verification →"}
                                </motion.button>
                              </motion.div>
                            ) : (
                              <motion.form key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onSubmit={handleOtpSubmit} className="space-y-5">
                                {/* OTP sent banner with countdown */}
                                <div className="rounded-2xl p-3.5 flex items-center gap-3"
                                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                                  {/* Circular countdown */}
                                  <div className="relative h-10 w-10 shrink-0">
                                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="2" />
                                      <motion.circle cx="18" cy="18" r="15" fill="none" stroke="#7C3AED" strokeWidth="2"
                                        strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 15}`}
                                        strokeDashoffset={2 * Math.PI * 15 * (1 - otpTimer / 300)} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-[8px] font-black text-violet-400">{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-white">OTP sent to {phone}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Enter the 6-digit code from your SMS</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">6-Digit Code</label>
                                  <OTPBoxes value={otpCode} onChange={setOtpCode} />
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                  <button type="button" onClick={() => setOtpSent(false)}
                                    className="font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">← Change Phone</button>
                                  {otpCooldown > 0
                                    ? <span className="text-slate-600 font-bold">Resend in {otpCooldown}s</span>
                                    : <button type="button" onClick={handleSendOtp}
                                        className="font-bold text-violet-400 hover:text-violet-300 cursor-pointer transition-colors">Resend OTP</button>}
                                </div>

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                  type="submit" disabled={isPending || otpCode.join("").length < 6}
                                  className="w-full rounded-2xl py-3.5 text-sm font-black text-white cursor-pointer disabled:opacity-50"
                                  style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899, #EF4444)" }}>
                                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Verify & Sign In →"}
                                </motion.button>
                              </motion.form>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-3 text-[10px] uppercase font-black tracking-widest text-slate-700" style={{ background: "transparent" }}>
                          or continue with
                        </span>
                      </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-3 gap-2.5 mb-6">
                      {SOCIAL_PROVIDERS.map((p) => (
                        <motion.button key={p.key}
                          whileHover={{ scale: 1.05, y: -2, boxShadow: `0 8px 24px ${p.color}20` }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSocialSignIn(p.key)} disabled={!!socialLoading}
                          className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 disabled:opacity-50"
                          style={{ background: socialLoading === p.key ? p.hoverBg : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          {/* Ripple effect */}
                          {socialLoading === p.key ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : p.icon}
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{p.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Trending Deals Section */}
                    <div className="space-y-2 mb-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-rose-400" />
                        Today's Trending
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { icon: "🖥️", label: "Laptop Deals", color: "#7C3AED" },
                          { icon: "📱", label: "Phone Deals", color: "#EC4899" },
                          { icon: "🎓", label: "Student Offers", color: "#F59E0B" },
                        ].map((deal) => (
                          <motion.div key={deal.label} whileHover={{ scale: 1.06, y: -2 }}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer text-center transition-all"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <span className="text-base">{deal.icon}</span>
                            <span className="text-[9px] font-bold text-slate-500">{deal.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Sign up link */}
                    <p className="text-center text-xs text-slate-600">
                      Don't have an account?{" "}
                      <Link href="/register" className="font-black text-violet-400 hover:text-violet-300 transition-colors">
                        Create Free Account
                      </Link>
                    </p>

                    <p className="text-center text-[10px] text-slate-800 mt-3">
                      By signing in you agree to our{" "}
                      <Link href="/legal/terms" className="text-slate-600 hover:text-slate-400 underline underline-offset-2">Terms</Link>
                      {" & "}
                      <Link href="/legal/privacy" className="text-slate-600 hover:text-slate-400 underline underline-offset-2">Privacy Policy</Link>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </TiltCard>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PAGE WRAPPER                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#050816" }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-14 w-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899, #EF4444)" }}>
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Launching SmartPicks...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
