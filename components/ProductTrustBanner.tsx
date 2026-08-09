"use client";

import { ShieldCheck, Award, Zap, TrendingUp, CheckCircle2, Lock } from "lucide-react";

interface ProductTrustBannerProps {
  rating: number;
  reviewCount: number;
}

export default function ProductTrustBanner({ rating, reviewCount }: ProductTrustBannerProps) {
  return (
    <div className="space-y-4">
      {/* Top High-Trust Verification Bar */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-brand-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-foreground shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>Amazon India Verified Partner Deal</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-[11px]">
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Live Price Checked
          </span>
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-brand-500" /> Secure Checkout via Amazon
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" /> 1.2k+ Views Today
          </span>
        </div>
      </div>

      {/* Smart Picks Scorecard & Verification Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-600" />
            <h3 className="font-extrabold text-foreground text-sm">Smart Picks Quality Scorecard</h3>
          </div>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            High Value Choice
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
            <div className="text-lg font-black text-foreground">9.5/10</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Value Score</div>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
            <div className="text-lg font-black text-foreground">{rating.toFixed(1)}/5</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">User Rating</div>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
            <div className="text-lg font-black text-foreground">{reviewCount.toLocaleString()}+</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Buyer Reviews</div>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> 100%
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Authentic</div>
          </div>
        </div>
      </div>
    </div>
  );
}
