"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Bookmark, Star, ArrowRight, Loader2, BookOpen } from "lucide-react";

interface FavoriteItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  category: string;
  imageUrl: string;
  price: number;
  type: "free" | "paid" | "freemium";
  averageRating: number;
}

const dashboardTabs = [
  { href: "/dashboard", label: "Profile & Security" },
  { href: "/dashboard/purchases", label: "My Purchases" },
  { href: "/dashboard/favorites", label: "Favorites" },
  { href: "/dashboard/referrals", label: "Referrals" },
];

export default function UserFavorites() {
  const { user, loading: authLoading } = useAuth();
  
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login?redirect=/dashboard/favorites";
      return;
    }

    async function fetchFavorites() {
      try {
        const response = await fetch("/api/v1/digital-store/my-favorites");
        const data = await response.json();
        if (response.ok && data.success) {
          setFavorites(data.favorites);
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [user, authLoading]);

  const handleRemoveFavorite = async (id: string, productId: string) => {
    try {
      const response = await fetch(`/api/v1/digital-store/favorite/${productId}`, {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Loading favorites...</p>
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
            const isActive = tab.href === "/dashboard/favorites";
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
        {favorites.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-3xl py-16 text-center shadow-sm max-w-lg mx-auto">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/35 mb-4" />
            <h3 className="font-extrabold text-foreground text-sm mb-1">No Bookmarked Resources</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-5">
              You haven&apos;t favorited any digital resources yet. Head over to our store to explore guides.
            </p>
            <Link
              href="/digital-store"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-6 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-all"
            >
              Browse Digital Store
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border/85 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm relative group"
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                  <button
                    onClick={() => handleRemoveFavorite(item.id, item.productId)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-neutral-900/90 text-rose-500 flex items-center justify-center hover:scale-105 transition-all"
                    title="Remove Bookmark"
                  >
                    <Bookmark className="h-4 w-4 fill-rose-500" />
                  </button>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-black bg-neutral-900/90 text-white tracking-wider uppercase backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      {item.averageRating > 0 ? item.averageRating.toFixed(1) : "NEW"}
                    </div>
                    <Link href={`/digital-store/${item.slug}`}>
                      <h4 className="font-extrabold text-foreground text-xs leading-snug line-clamp-2 hover:text-brand-600 transition-colors">
                        {item.title}
                      </h4>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 mt-5 pt-4">
                    <span className="text-xs font-black text-foreground">
                      {item.type === "free" ? "FREE" : `₹${item.price}`}
                    </span>
                    <Link
                      href={`/digital-store/${item.slug}`}
                      className="inline-flex h-8 items-center justify-center gap-1 text-[10px] font-black border border-border rounded-xl px-3 hover:bg-muted transition-all"
                    >
                      View Details <ArrowRight className="h-3 w-3" />
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
