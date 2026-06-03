"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, User, Mail, Globe, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AffiliatePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.website || !formData.message) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/v1/affiliate/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", website: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Failed to submit application. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again later.");
    }
  };

  const steps = [
    {
      num: "01",
      title: "Sign up",
      desc: "Fill in the simple application form below with your channel or website details.",
    },
    {
      num: "02",
      title: "Get your link",
      desc: "Receive customized tracking URLs for top-rated budget products and flash sales.",
    },
    {
      num: "03",
      title: "Earn commission",
      desc: "Collect 3% to 8% referral payouts on every successful Amazon India checkout.",
    },
  ];

  const commissions = [
    { category: "Tech & Electronics", rate: "4% - 6%" },
    { category: "Kitchen & Dining", rate: "6% - 8%" },
    { category: "Home & Living", rate: "5% - 7%" },
    { category: "Gadgets & Accessories", rate: "5% - 8%" },
    { category: "Fashion & Lifestyle", rate: "7% - 8%" },
    { category: "Study & Office Supplies", rate: "3% - 5%" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12 select-none">
      <div className="container-custom max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-neutral-900 to-rose-950 px-8 py-16 text-white text-center shadow-xl border border-white/5 mb-12"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-rose-500 to-red-600 pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-widest mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> earn commissions
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Earn with Smart Picks India
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Partner with India&apos;s fastest-growing shopping recommendation platform. Refer users to high-converting handpicked deals and earn premium commission rates.
            </p>
          </div>
        </motion.div>

        {/* How It Works Flow */}
        <div className="mb-14">
          <h2 className="text-xl font-black text-foreground mb-6 border-l-4 border-[#1D9E75] pl-3">
            How the program works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                key={step.num}
                className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-[#1D9E75]/25 block mb-2">{step.num}</span>
                  <h3 className="font-extrabold text-foreground text-base mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start mb-14">
          {/* Commission Table */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-xl font-black text-foreground border-l-4 border-[#1D9E75] pl-3">
              Commission rates
            </h2>
            <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60">
                    <th className="px-5 py-3.5 text-xs font-black text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3.5 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">Commission Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {commissions.map((comm) => (
                    <tr key={comm.category} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-bold text-foreground">{comm.category}</td>
                      <td className="px-5 py-3.5 text-xs font-black text-[#1D9E75] text-right">{comm.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed px-1">
              * Commission payouts are calculated monthly on verified, non-returned user checkouts.
            </p>
          </div>

          {/* Signup Form */}
          <div className="md:col-span-7 space-y-6">
            <h2 className="text-xl font-black text-foreground border-l-4 border-[#1D9E75] pl-3">
              Apply for partnership
            </h2>
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-10 flex flex-col items-center justify-center gap-3"
                  >
                    <CheckCircle className="h-12 w-12 text-[#1D9E75] mb-2" />
                    <h3 className="text-lg font-black text-foreground">Application Submitted!</h3>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                      Thank you for applying. Our marketing team will review your channel/website details and email you shortly!
                    </p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full h-11 bg-muted/30 border border-input rounded-2xl pl-10 pr-4 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1D9E75]"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. rahul@domain.com"
                          className="w-full h-11 bg-muted/30 border border-input rounded-2xl pl-10 pr-4 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1D9E75]"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">Website / Youtube / Social Link</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                        <input
                          type="url"
                          name="website"
                          required
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="e.g. https://youtube.com/mychannel"
                          className="w-full h-11 bg-muted/30 border border-input rounded-2xl pl-10 pr-4 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1D9E75]"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">Briefly Describe Your Audience</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                        <textarea
                          name="message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your audience reach, traffic details, or partnership expectations..."
                          className="w-full bg-muted/30 border border-input rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1D9E75]"
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="text-red-500 text-xs font-bold px-1 py-1">
                        ⚠️ {errorMessage}
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary w-full h-11 text-xs font-bold rounded-2xl justify-center cursor-pointer shadow-md hover:shadow-lg transition-all"
                    >
                      {status === "loading" ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      ) : (
                        <>Submit Application <ArrowRight className="h-4 w-4 ml-1.5" /></>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
