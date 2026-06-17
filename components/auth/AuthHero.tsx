"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Brain, GraduationCap, Tag } from "lucide-react";
import Typewriter from "typewriter-effect";

const features = [
  { icon: Zap, text: "Instant Price Comparison", color: "text-amber-400", bg: "bg-amber-400/10" },
  { icon: Brain, text: "AI Recommendations", color: "text-violet-400", bg: "bg-violet-400/10" },
  { icon: GraduationCap, text: "Student Hub", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: Tag, text: "Daily Deals", color: "text-pink-400", bg: "bg-pink-400/10" },
];

const stats = [
  { label: "Users", value: "50K+", suffix: "" },
  { label: "Saved", value: "₹1 Cr+", suffix: "" },
  { label: "Resources", value: "10K+", suffix: "" },
  { label: "Daily Deals", value: "1000+", suffix: "" },
];

export function AuthHero() {

  return (
    <div className="relative z-10 hidden lg:flex flex-col justify-center h-full max-w-lg mx-auto pr-10 text-white">
      
      {/* 1. Animated Headline (Typewriter-esque but smoother) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-6 h-[60px] flex items-center"
      >
        <h1 className="text-5xl font-black tracking-tight leading-[1.1]">
          <Typewriter
            options={{
              strings: [
                '<span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Save Smarter.</span>',
                '<span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Study Better.</span>',
                '<span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Shop Faster.</span>'
              ],
              autoStart: true,
              loop: true,
              delay: 50,
              deleteSpeed: 30,
            }}
          />
        </h1>
      </motion.div>

      {/* 2. Subheading */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-lg text-slate-400 font-medium leading-relaxed mb-10"
      >
        India's AI-powered platform for budget shopping, student resources, and smart deals. Join the ecosystem.
      </motion.p>

      {/* 3. Floating Feature Cards Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="grid grid-cols-2 gap-4 mb-10"
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden group cursor-pointer"
            >
              {/* Subtle hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${feature.bg}`}>
                <Icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">{feature.text}</h3>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 4. Stats Row */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="flex items-center justify-between py-6 border-y border-white/10 mb-8"
      >
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>



    </div>
  );
}
