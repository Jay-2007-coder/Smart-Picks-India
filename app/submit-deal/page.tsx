"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Share2, PlusCircle, AlertCircle, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function SubmitDealPage() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("tech");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [image, setImage] = useState("");
  
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/submit-deal");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setMessage(null);
    setFormLoading(true);

    const priceNum = parseFloat(price);
    const oldPriceNum = oldPrice ? parseFloat(oldPrice) : null;

    if (isNaN(priceNum) || priceNum <= 0) {
      setMessage({ type: "error", text: "Please enter a valid price." });
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
          url,
          price: priceNum,
          oldPrice: oldPriceNum,
          image: image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80", // fallback image
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        try {
          const confetti = (await import("canvas-confetti")).default;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (confettiErr) {
          console.error("Confetti error:", confettiErr);
        }
        setMessage({ type: "success", text: "Deal shared successfully! Redirecting..." });
        setTimeout(() => {
          router.push("/deals?tab=community");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to submit deal." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-2xl">
      <Breadcrumbs items={[{ label: "Deals", href: "/deals" }, { label: "Share Deal" }]} />

      <div className="mt-8 mb-6">
        <Link href="/deals" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Deals
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-display font-bold text-foreground">Share a Deal</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Found a great discount or price drop? Share it with the SmartPicks India community!
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {message && (
          <div
            className={`flex items-start gap-2 rounded-xl p-4 text-sm border mb-5 ${
              message.type === "success"
                ? "border-emerald-100 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400"
                : "border-destructive/10 bg-destructive/5 text-destructive"
            }`}
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
              Product Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sony WH-1000XM4 Wireless Headphones (Midnight Blue)"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="tech">Tech & Gadgets</option>
                <option value="kitchen">Kitchen Appliances</option>
                <option value="home">Home Decor</option>
                <option value="lifestyle">Lifestyle & Fashion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
                Product Image URL (Optional)
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
                Deal Price (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 19999"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
                Original Price (₹ - Optional)
              </label>
              <input
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="e.g. 29990"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
              Product Link (URL)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.in/dp/..."
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
            <span className="block text-[10px] text-muted-foreground mt-1">
              Provide the direct store link (Amazon, Flipkart, etc.) where users can buy the product.
            </span>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors disabled:opacity-50"
          >
            <PlusCircle className="h-5 w-5" />
            {formLoading ? "Submitting Deal..." : "Post Deal to Community"}
          </button>
        </form>
      </div>
    </div>
  );
}
