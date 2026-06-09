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
      <div className="container-custom mt-8 flex justify-between items-center flex-wrap gap-4 bg-muted/20 border border-border/60 p-4 rounded-3xl backdrop-blur-sm shadow-sm select-none">
        <div className="flex items-center gap-2">
          {interests.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-brand-500/5 text-brand-600 dark:text-brand-400 border border-brand-500/10 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse-scale shrink-0" />
              <span>Feed customized for: <strong className="font-black text-foreground">{interests.map(i => i.toUpperCase()).join(", ")}</strong></span>
              <button
                onClick={clearInterests}
                className="ml-2 hover:bg-brand-500/10 hover:text-brand-700 p-1 rounded-lg transition-colors cursor-pointer"
                title="Clear preferences"
              >
                <X className="h-3.5 w-3.5 stroke-[3px]" />
              </button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground pl-1">
              <span className="h-2 w-2 rounded-full bg-border" />
              <span>Standard product listings. Customize to see your interests first.</span>
            </div>
          )}
        </div>

        <motion.button
          onClick={() => setPickerOpen(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border border-border/80 bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-sm"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-brand-600" />
          Customize Feed
        </motion.button>
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
