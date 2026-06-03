"use client";

import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import AnimatedSectionHeader from "@/components/AnimatedSectionHeader";
import InterestPicker from "@/components/InterestPicker";
import type { Product } from "@/data/products";
import { SlidersHorizontal, Sparkles, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HomePersonalizerProps {
  initialFeatured: Product[];
  initialTrending: Product[];
}

export default function HomePersonalizer({ initialFeatured, initialTrending }: HomePersonalizerProps) {
  const [interests, setInterests] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const stored = localStorage.getItem("smart_picks_interests");
      if (stored) {
        setInterests(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveInterests = (newInterests: string[]) => {
    setInterests(newInterests);
  };

  const clearInterests = () => {
    try {
      localStorage.removeItem("smart_picks_interests");
      setInterests([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Sort helper to prioritize interest categories
  const sortProducts = (items: Product[]) => {
    if (interests.length === 0) return items;
    return [...items].sort((a, b) => {
      const aMatch = interests.includes(a.category.toLowerCase()) ? 1 : 0;
      const bMatch = interests.includes(b.category.toLowerCase()) ? 1 : 0;
      return bMatch - aMatch; // Matches come first
    });
  };

  const sortedFeatured = useMemo(() => sortProducts(initialFeatured), [interests, initialFeatured]);
  const sortedTrending = useMemo(() => sortProducts(initialTrending), [interests, initialTrending]);

  return (
    <>
      {/* Settings bar if personalized */}
      <div className="container-custom mt-8 flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {interests.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 border border-brand-500/20">
              <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse-scale" />
              Feed customized for: {interests.map(i => i.toUpperCase()).join(", ")}
              <button
                onClick={clearInterests}
                className="ml-1 hover:text-foreground text-brand-500 transition-colors"
                title="Clear preferences"
              >
                <X className="h-3.5 w-3.5 stroke-[3px]" />
              </button>
            </span>
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">
              Standard product listings. Customize to see your interests first.
            </span>
          )}
        </div>

        <button
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-brand-600" />
          Customize Feed
        </button>
      </div>

      {/* Featured Products Section */}
      {sortedFeatured.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container-custom">
            <AnimatedSectionHeader
              title="Top Rated Products"
              subtitle="Editor's best picks this month"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              {sortedFeatured.map((product, i) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  priority={i < 4}
                  index={i}
                  aiBadge={interests.includes(product.category.toLowerCase())}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products Section */}
      {sortedTrending.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <AnimatedSectionHeader
              eyebrow={<><TrendingUp className="h-4 w-4" /> Trending</>}
              eyebrowClass="text-purple-500"
              title="Trending Right Now"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {sortedTrending.map((product, i) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  index={i}
                  aiBadge={interests.includes(product.category.toLowerCase())}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interest Picker Modal */}
      <InterestPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={handleSaveInterests}
      />
    </>
  );
}
