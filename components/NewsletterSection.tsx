"use client";
import { useState } from "react";
import { Mail, CheckCircle, Loader2, Gift, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 rounded-3xl p-8 sm:p-12 text-white text-center overflow-hidden border border-brand-500/20 shadow-2xl shadow-brand-500/10"
    >
      {/* Animated background blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl pointer-events-none"
      />

      <div className="max-w-xl mx-auto relative z-10">
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/10 mb-6 backdrop-blur-sm"
        >
          <Mail className="h-7 w-7 text-white" />
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">
          Get the Best Deals in Your Inbox
        </h2>
        <p className="text-brand-100/90 mb-6 text-sm leading-relaxed">
          Join 50,000+ smart Indian shoppers who get our weekly curated deals and honest reviews.
        </p>

        {/* Perks row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {["Weekly deals", "Honest reviews", "Free forever"].map((perk) => (
            <span key={perk} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-100 bg-white/10 rounded-full px-3 py-1 border border-white/10">
              <Gift className="h-3 w-3 text-brand-200" /> {perk}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 text-lg font-black py-3"
            >
              <CheckCircle className="h-7 w-7 text-green-400" />
              You&apos;re subscribed! Welcome 🎉
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 w-full"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-brand-200/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all animate-none"
                  id="newsletter-email"
                />
                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 25px -4px rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-700 hover:bg-brand-50 font-bold px-5 py-3 shrink-0 transition-all shadow-lg cursor-pointer btn-shiny"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Subscribe Free <ArrowRight className="h-4 w-4" /></>
                  )}
                </motion.button>
              </motion.form>
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-200 text-xs font-bold text-left px-1 mt-1"
                >
                  ⚠️ {errorMessage}
                </motion.p>
              )}
            </div>
          )}
        </AnimatePresence>
        <p className="mt-4 text-xs text-brand-200/70">No spam. Unsubscribe anytime. 100% free.</p>
      </div>
    </motion.section>
  );
}
