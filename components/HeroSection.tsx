"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, Zap, TrendingUp, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import { Product } from "@/data/products";

const STATS = [
  { label: "Products Reviewed", value: "500+", icon: ShieldCheck },
  { label: "Happy Shoppers", value: "50K+", icon: TrendingUp },
  { label: "Daily Deals", value: "30+", icon: Zap },
];

export default function HeroSection({ heroProducts }: { heroProducts: Product[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#1a0a0a] to-slate-900 text-white min-h-[88vh] flex flex-col justify-center">
      {/* Animated background blobs */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-500/25 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-brand-500/15 blur-2xl"
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      <motion.div style={{ opacity }} className="container-custom relative z-10 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-4 py-1.5 text-sm text-brand-300 mb-7 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-brand-400" />
              </motion.div>
              India&apos;s #1 Budget Product Guide
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.1] tracking-tight"
            >
              Discover India&apos;s{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-300 to-brand-300 animate-[shimmer_3s_linear_infinite] bg-[length:200%_auto]">
                Smartest Budget
              </span>{" "}
              Picks
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg text-slate-300/90 leading-relaxed max-w-lg"
            >
              Expert reviews, Amazon deals, and curated product lists for smart Indian shoppers. Save money, buy smarter.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/deals" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all">
                  <Zap className="h-4 w-4" />
                  Today&apos;s Best Deals
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/blog" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all">
                  Browse Reviews
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 grid grid-cols-3 gap-3"
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.75 + i * 0.1 }}
                  className="flex flex-col items-center text-center p-3 rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm"
                >
                  <stat.icon className="h-4 w-4 text-brand-400 mb-1" />
                  <span className="text-lg font-black text-white">{stat.value}</span>
                  <span className="text-[10px] text-slate-400 leading-tight mt-0.5">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Product Showcase Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Decorative floating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-3xl border border-brand-500/10"
            />
            <div className="grid grid-cols-2 gap-4">
              {heroProducts.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`rounded-2xl overflow-hidden bg-white/8 backdrop-blur-sm border border-white/10 p-3 shadow-xl cursor-pointer transition-shadow hover:shadow-brand-600/10 hover:shadow-2xl ${i % 2 === 1 ? "mt-6" : ""}`}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-white/5">
                    {item.image && (
                      <Image src={item.image} alt={item.title} fill sizes="150px" className="object-cover" />
                    )}
                    {/* Shimmer overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <p className="text-xs font-semibold text-white/90 line-clamp-1">{item.title}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-black text-accent-400">₹{item.price.toLocaleString("en-IN")}</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-slate-300">{item.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
          <path d="M0 60L1440 60L1440 20C1200 55 960 0 720 30C480 55 240 5 0 20L0 60Z" className="fill-background" />
        </svg>
      </div>
    </section>
  );
}
