"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-brand-500/10 blur-2xl" />
      </div>

      <div className="container-custom relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-4 py-1.5 text-sm text-brand-300 mb-6"
            >
              <Sparkles className="h-4 w-4" />
              India&apos;s #1 Budget Product Guide
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
              Discover India&apos;s{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
                Smartest Budget
              </span>{" "}
              Picks
            </h1>

            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-lg">
              Expert reviews, Amazon deals, and curated product lists for smart Indian shoppers. Save money, buy smarter.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/deals" className="btn-primary bg-brand-600 hover:bg-brand-500">
                <Zap className="h-4 w-4" />
                Today&apos;s Best Deals
              </Link>
              <Link href="/blog" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">
                Browse Reviews
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 flex gap-8">
              {[
                { value: "200+", label: "Products Reviewed" },
                { value: "50K+", label: "Happy Readers" },
                { value: "₹10Cr+", label: "Savings Helped" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product showcase cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80",
                  title: "boAt Airdopes 141",
                  price: "₹1,299",
                  rating: 4.3,
                  badge: "57% OFF",
                },
                {
                  image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&q=80",
                  title: "Mi Smart Band 7",
                  price: "₹2,999",
                  rating: 4.5,
                  badge: "33% OFF",
                },
                {
                  image: "https://images.unsplash.com/photo-1648821736827-b71c5eb57ef0?w=300&q=80",
                  title: "Pigeon Air Fryer",
                  price: "₹3,499",
                  rating: 4.3,
                  badge: "42% OFF",
                },
                {
                  image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&q=80",
                  title: "Anker PowerCore",
                  price: "₹1,799",
                  rating: 4.5,
                  badge: "28% OFF",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 p-3 ${i === 1 ? "mt-6" : ""}`}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <Image src={item.image} alt={item.title} fill sizes="150px" className="object-cover" />
                    <span className="absolute top-2 left-2 badge bg-brand-600 text-white text-xs">{item.badge}</span>
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-accent-400">{item.price}</span>
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
      </div>
    </section>
  );
}
