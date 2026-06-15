"use client";

import { useState } from "react";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { products as allProducts } from "@/data/products";

export default function AIProductFinder() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await fetch("/api/v1/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          products: allProducts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations from AI.");
      }

      const data = await response.json();
      if (data.success) {
        setReasoning(data.reasoning);
        // Map returned recommendations (which only contain slug and reason) to full product details
        const mapped = (data.recommendations || [])
          .map((rec: { slug: string; reason: string }) => {
            const foundProduct = allProducts.find((p) => p.slug === rec.slug);
            if (foundProduct) {
              return {
                ...foundProduct,
                aiReason: rec.reason,
              };
            }
            return null;
          })
          .filter(Boolean);

        setRecommendations(mapped);
      } else {
        throw new Error(data.message || "An error occurred while finding products.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // 3 skeleton cards for loading state
  const skeletonCards = [1, 2, 3];

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-b from-muted/20 to-background border-y border-border/40">
      <div className="container-custom max-w-5xl relative z-10">
        <div className="glass-premium rounded-3xl p-6 md:p-10 border border-white/20 dark:border-white/5 shadow-2xl relative overflow-hidden">
          {/* Inner neon decor */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-brand-500/10 dark:bg-brand-500/10 blur-3xl pointer-events-none" />
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold mb-3"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI shopping assistant
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Find Your Perfect Smart Pick
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Describe what you need in plain English, and our AI will search the catalog and handpick options for you.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="relative flex items-center p-1.5 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-border shadow-xl shadow-teal-500/2 dark:shadow-teal-500/5 focus-within:border-teal-500 focus-within:shadow-teal-500/10 focus-within:ring-4 focus-within:ring-teal-500/5 transition-all duration-300">
            <div className="flex items-center gap-2 pl-3 flex-1">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you're looking for... e.g. best phone under ₹15000 for gaming"
                className="w-full bg-transparent border-none outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary bg-teal-600 hover:bg-teal-750 hover:shadow-lg hover:shadow-teal-500/20 text-white rounded-xl py-2 px-5 text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:hover:bg-teal-600 transition-all btn-shiny cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Find Deals
            </button>
          </div>
        </form>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
            >
              {skeletonCards.map((index) => (
                <div
                  key={index}
                  className="card flex flex-col overflow-hidden h-[420px] animate-pulse border border-border/50"
                >
                  <div className="aspect-square bg-muted/60" />
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className="h-3 w-16 bg-muted/70 rounded-full" />
                    <div className="h-5 w-3/4 bg-muted/70 rounded" />
                    <div className="h-4 w-1/2 bg-muted/70 rounded" />
                    <div className="h-8 w-full bg-muted/70 rounded mt-auto" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-6 border border-rose-500/20 bg-rose-500/5 text-rose-500 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {hasSearched && !loading && !error && recommendations.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-8 bg-muted/30 rounded-xl border border-dashed border-border"
            >
              <p className="text-muted-foreground text-sm">
                No matching products found. Try describing your search with different words.
              </p>
            </motion.div>
          )}

          {hasSearched && !loading && !error && recommendations.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Reasoning Card */}
              {reasoning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-500/10 text-teal-800 dark:text-teal-200 text-sm leading-relaxed shadow-lg shadow-teal-500/5 backdrop-blur-sm relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
                  <strong className="font-extrabold flex items-center gap-1.5 mb-2 text-teal-900 dark:text-teal-100 uppercase tracking-wider text-[11px]">
                    <Sparkles className="h-4 w-4 text-teal-500" /> AI Pick Analysis
                  </strong>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{reasoning}</p>
                </motion.div>
              )}

              {/* Recommendations list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((product, idx) => (
                  <div key={product.slug} className="flex flex-col gap-2">
                    <ProductCard product={product} aiBadge={true} index={idx} />
                    {product.aiReason && (
                      <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/30 italic">
                        <strong>Why:</strong> {product.aiReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
