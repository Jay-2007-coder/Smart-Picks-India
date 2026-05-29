"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface PriceAlertTrackerProps {
  slug: string;
  currentPrice: number;
}

export default function PriceAlertTracker({ slug, currentPrice }: PriceAlertTrackerProps) {
  const { user } = useAuth() as any;
  const [targetPrice, setTargetPrice] = useState<string>(
    Math.round(currentPrice * 0.9).toString() // Default to 10% drop
  );
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "telegram">("email");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setStatus(null);
    setLoading(true);

    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setStatus({ type: "error", message: "Please enter a valid price." });
      setLoading(false);
      return;
    }

    if (priceNum >= currentPrice) {
      setStatus({ type: "error", message: "Target price must be lower than the current price." });
      setLoading(false);
      return;
    }

    if (deliveryMethod === "telegram" && !user.telegramChatId) {
      setStatus({
        type: "error",
        message: "You must connect your Telegram account in your Profile page first.",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          targetPrice: priceNum,
          deliveryMethod,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          type: "success",
          message: `Watchlist updated! We will instantly alert you when the price drops below ₹${priceNum.toLocaleString("en-IN")}.`,
        });
      } else {
        setStatus({ type: "error", message: data.message || "Failed to subscribe alert." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center shadow-sm select-none">
        <div className="absolute -left-12 -bottom-12 h-28 w-28 rounded-full bg-red-500/5 blur-2xl" />
        <Bell className="mx-auto h-9 w-9 text-muted-foreground/50 mb-3" />
        <h4 className="font-bold text-foreground text-base mb-1">Price Drop Tracker</h4>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4 leading-relaxed">
          Be the first to know! Join the watchlist to get instant email or Telegram pings when this item goes on sale.
        </p>
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 px-6 text-xs font-bold text-white hover:shadow-md transition-all duration-200"
        >
          Sign in to Set Alert
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/85 bg-card p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-5 border-b border-border/50 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-foreground leading-snug">Track Price Drop</h4>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">watchlist automation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Target threshold price
          </label>
          <div className="relative group">
            <span className="absolute left-3.5 top-2.5 text-sm font-black text-muted-foreground group-focus-within:text-red-500 transition-colors">₹</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background pl-8 pr-4 text-sm font-black text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/30 focus-visible:border-red-500/40"
              required
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
            Currently priced at <strong>₹{currentPrice.toLocaleString("en-IN")}</strong>
          </p>
        </div>

        <div>
          <span className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Notification Channel</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryMethod("email")}
              className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-bold transition-all duration-200 ${
                deliveryMethod === "email"
                  ? "border-red-500 bg-red-500/5 text-red-600 shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Mail className="h-4 w-4" /> Email Alert
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod("telegram")}
              className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-bold transition-all duration-200 ${
                deliveryMethod === "telegram"
                  ? "border-sky-500 bg-sky-500/5 text-sky-600 shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Send className="h-4 w-4" /> Telegram Ping
            </button>
          </div>
        </div>

        {deliveryMethod === "telegram" && !user.telegramChatId && (
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 text-xs text-sky-800 dark:border-sky-950/20 dark:bg-sky-950/10 dark:text-sky-400 animate-fade-in">
            <p className="font-extrabold mb-1.5 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 shrink-0 text-sky-500" /> Telegram Link Missing
            </p>
            <p className="leading-relaxed mb-2 text-[11px]">You must save your Telegram Chat ID in your Profile settings before configuring Telegram watchlist alerts.</p>
            <Link href="/dashboard" className="font-black underline hover:text-sky-700 dark:hover:text-sky-300">
              Go to Dashboard Settings &rarr;
            </Link>
          </div>
        )}

        {status && (
          <div
            className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs border animate-fade-in ${
              status.type === "success"
                ? "border-emerald-100 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400"
                : "border-destructive/10 bg-destructive/5 text-destructive"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            )}
            <span className="font-semibold leading-relaxed">{status.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (deliveryMethod === "telegram" && !user.telegramChatId)}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-xs font-bold text-white hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Activating Watchlist..." : "Monitor Price Drop"}
        </button>
      </form>
    </div>
  );
}
