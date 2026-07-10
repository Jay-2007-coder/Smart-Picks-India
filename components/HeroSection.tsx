"use client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, Zap, TrendingUp, ShieldCheck, Bell, Brain, BookOpen, Target } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Product, products } from "@/data/products";
import { categories } from "@/data/categories";

const TICKER_ITEMS = [
  "🔥 500+ Products Reviewed",
  "📊 90-Day Price History Charts",
  "🤖 AI-Powered Recommendations",
  "🎓 Free Student Hub — Career Roadmaps",
  "🔔 Real-Time Price Drop Alerts",
  "🛒 Amazon & Flipkart Deals Daily",
  "✅ No Sponsored Reviews — Ever",
  "💡 Best Budget Picks for India",
];

function TickerStrip() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="w-full overflow-hidden border-b border-white/8 bg-white/[0.03] backdrop-blur-sm py-2.5">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="flex gap-10 whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-xs font-semibold text-slate-400 tracking-wide shrink-0">
            {item}
            <span className="ml-10 text-brand-500/50">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function FloatingBadge({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className={`absolute z-20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function HeroSection({ heroProducts }: { heroProducts: Product[] }) {
  const productsCount = products.length;
  const categoriesCount = categories.length;
  const activeDealsCount = products.filter((p) => p.oldPrice > p.price).length;

  const STATS = [
    { label: "Products Reviewed", value: `${productsCount}+`, icon: ShieldCheck, color: "text-emerald-400" },
    { label: "Categories", value: `${categoriesCount}`, icon: TrendingUp, color: "text-blue-400" },
    { label: "Active Deals", value: `${activeDealsCount}+`, icon: Zap, color: "text-amber-400" },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-gradient-to-br from-[#06080f] via-[#0b1224] to-[#06080f] text-white min-h-[92vh] flex flex-col justify-center">
      {/* Animated background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-60 -right-60 h-[600px] w-[600px] rounded-full bg-brand-600/20 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-60 -left-60 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/3 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-[80px]"
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(212,63,54,0.08),transparent)]" />
      </motion.div>

      {/* Ticker strip at top */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <TickerStrip />
      </div>

      <motion.div style={{ opacity }} className="container-custom relative z-10 pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT: Text Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/25 bg-gradient-to-r from-brand-600/15 to-violet-600/10 px-4 py-2 text-xs font-bold text-brand-300 mb-7 backdrop-blur-sm shadow-lg shadow-brand-900/20"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              </motion.div>
              India&apos;s Smartest Budget Shopping Guide
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-display font-black leading-[1.08] tracking-tight"
            >
              Stop Overpaying.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-rose-300 to-orange-300 animate-[shimmer_3s_linear_infinite] bg-[length:200%_auto]">
                Shop Smarter
              </span>{" "}
              in India.
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="mt-6 text-base sm:text-lg text-slate-300/80 leading-relaxed max-w-lg"
            >
              Expert-reviewed products, real 90-day price history charts, AI-powered recommendations, and instant price drop alerts — all free, built for Indian shoppers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d43f36] to-[#e8534a] hover:from-[#c23730] hover:to-[#d43f36] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#d43f36]/30 transition-all duration-200"
                >
                  <Zap className="h-4 w-4" />
                  Today&apos;s Best Deals
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/student-hub"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 hover:border-violet-400/50 px-6 py-3.5 text-sm font-bold text-violet-200 transition-all duration-200 backdrop-blur-sm"
                >
                  <Brain className="h-4 w-4" />
                  Student Hub
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 px-6 py-3.5 text-sm font-bold text-white/80 transition-all duration-200 backdrop-blur-sm"
                >
                  Browse Reviews
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-10 flex items-center gap-6 flex-wrap"
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10`}>
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 leading-none">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-1.5"
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-semibold">Trusted by Indian shoppers</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Product Cards ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-6 rounded-3xl border border-brand-500/8"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-12 rounded-3xl border border-violet-500/5"
            />

            {/* Floating badges */}
            <FloatingBadge delay={1.0} className="-top-4 -left-4">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-sm shadow-lg">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-black text-emerald-300">Expert Verified</span>
              </div>
            </FloatingBadge>

            <FloatingBadge delay={1.2} className="-bottom-4 -right-4">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-sm shadow-lg">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-black text-amber-300">Price Alert Active</span>
              </div>
            </FloatingBadge>

            <FloatingBadge delay={1.4} className="top-1/2 -right-6 -translate-y-1/2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 backdrop-blur-sm shadow-lg">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-black text-violet-300">AI Picks</span>
              </div>
            </FloatingBadge>

            {/* Product cards grid */}
            <div className="grid grid-cols-2 gap-4">
              {heroProducts.slice(0, 4).map((item, i) => (
                <motion.a
                  key={item.slug}
                  href={item.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 150 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`rounded-2xl overflow-hidden bg-white/[0.04] backdrop-blur-sm border border-white/10 p-3 shadow-2xl cursor-pointer transition-all duration-300 group ${i % 2 === 1 ? "mt-7" : ""}`}
                  style={{
                    boxShadow: "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
                  }}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-white/5">
                    {item.image && (
                      <Image src={item.image} alt={item.title} fill sizes="150px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    )}
                    {/* Discount badge */}
                    {item.oldPrice > item.price && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-brand-600 text-[10px] font-black text-white shadow-md">
                        -{Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%
                      </span>
                    )}
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" />
                  </div>
                  <p className="text-[11px] font-semibold text-white/85 line-clamp-2 leading-snug">{item.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-brand-400">₹{item.price.toLocaleString("en-IN")}</span>
                    <div className="flex items-center gap-0.5 bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-300">{item.rating}</span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
          <path d="M0 70L1440 70L1440 30C1200 65 960 5 720 35C480 60 240 10 0 25L0 70Z" className="fill-background" />
        </svg>
      </div>
    </section>
  );
}
