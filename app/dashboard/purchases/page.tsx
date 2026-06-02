"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Download, ShoppingBag, FolderOpen, Loader2, Star, Calendar, Sparkles } from "lucide-react";

interface PurchaseItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  category: string;
  imageUrl: string;
  price: number;
  secureToken: string;
  downloadCount: number;
  purchasedAt: string;
}

const dashboardTabs = [
  { href: "/dashboard", label: "Profile & Security" },
  { href: "/dashboard/purchases", label: "My Purchases" },
  { href: "/dashboard/favorites", label: "Favorites" },
];

export default function UserPurchases() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/dashboard/purchases");
      return;
    }

    async function fetchPurchases() {
      try {
        const response = await fetch("/api/v1/digital-store/my-purchases");
        const data = await response.json();
        if (response.ok && data.success) {
          setPurchases(data.purchases);
        }
      } catch (err) {
        console.error("Failed to fetch purchases:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPurchases();
  }, [user, authLoading, router]);

  const handleDownload = (token: string) => {
    if (token) {
      window.location.href = `/api/v1/digital-store/download/${token}`;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-6xl mx-auto px-4">
        {/* Dashboard Title Header */}
        <div className="border-b border-border/80 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your academic resources, project guides, and purchase history.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border/60 gap-4 mb-8">
          {dashboardTabs.map((tab) => {
            const isActive = tab.href === "/dashboard/purchases";
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                  isActive
                    ? "border-brand-600 text-brand-600 dark:text-brand-500"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Content Section */}
        {purchases.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-3xl py-16 text-center shadow-sm max-w-lg mx-auto">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/35 mb-4" />
            <h3 className="font-extrabold text-foreground text-sm mb-1">No Purchases Found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-5">
              You haven&apos;t purchased any digital resources yet. Head over to our store to explore guides.
            </p>
            <Link
              href="/digital-store"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-6 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-all"
            >
              Browse Digital Store
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {purchases.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border/85 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex gap-4"
              >
                {/* Product Cover image */}
                <div className="relative h-20 w-28 shrink-0 rounded-2xl overflow-hidden bg-muted border border-border/50 select-none">
                  <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-brand-600 uppercase bg-brand-50 dark:bg-brand-950/40 rounded px-1.5 py-0.5">
                      {item.category}
                    </span>
                    <Link href={`/digital-store/${item.slug}`}>
                      <h3 className="font-extrabold text-foreground text-xs leading-snug line-clamp-1 hover:text-brand-600 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3.5 text-[10px] text-muted-foreground font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.purchasedAt).toLocaleDateString("en-IN")}
                      </span>
                      <span>•</span>
                      <span>{item.downloadCount} downloads</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-3">
                    <button
                      onClick={() => handleDownload(item.secureToken)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all"
                    >
                      <Download className="h-4 w-4" /> Download File
                    </button>
                    <Link
                      href={`/digital-store/${item.slug}`}
                      className="text-xs font-extrabold text-brand-600 hover:underline"
                    >
                      Leave Review
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
