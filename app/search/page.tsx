"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, AlertTriangle, ArrowRight, BookOpen, ShoppingBag, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface SearchResultItem {
  slug: string;
  title: string;
  type: "product" | "blog" | "category";
  image?: string;
  category?: string;
  price?: number;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "product" | "blog">("all");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredResults = results.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <div className="container-custom py-12 min-h-screen">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold font-display tracking-tight mb-4"
        >
          Explore Smart <span className="text-brand-600">Search</span>
        </motion.h1>
        <p className="text-muted-foreground">
          Find your favorite tech, kitchen utilities, fashion accessories, or expert blogs instantly.
        </p>
      </div>

      {/* Input container */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative flex items-center rounded-2xl border border-border bg-card shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
          <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base bg-transparent py-2.5 px-3 outline-none placeholder:text-muted-foreground text-foreground"
          />
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-500 border-t-transparent mr-3" />
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      {results.length > 0 && (
        <div className="flex justify-center gap-2 mb-8">
          {(["all", "product", "blog"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                filter === t
                  ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/10"
                  : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All Results" : t === "product" ? "Products" : "Articles"}
            </button>
          ))}
        </div>
      )}

      {/* Results grid */}
      <div>
        {loading && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent mb-4" />
            <p className="text-muted-foreground font-medium">Searching for results...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredResults.map((item, idx) => (
                <motion.div
                  key={`${item.type}-${item.slug}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-500/30 transition-all flex flex-col group h-full"
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-50 dark:bg-brand-950/20">
                        <Sparkles className="h-10 w-10 text-brand-500" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase bg-black/70 backdrop-blur-md text-white border border-white/10 px-2.5 py-1 rounded-full">
                      {item.type === "product" ? "Product" : item.type === "blog" ? "Blog Article" : "Category"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {item.category && (
                        <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1.5">
                          {item.category}
                        </p>
                      )}
                      <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.type === "product" && item.price && (
                        <p className="text-lg font-bold text-brand-600 mt-2">
                          {formatPrice(item.price)}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        {item.type === "product" ? (
                          <>
                            <ShoppingBag className="h-3 w-3" /> View Product
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-3 w-3" /> Read Article
                          </>
                        )}
                      </span>
                      <Link
                        href={item.type === "product" ? `/product/${item.slug}` : `/blog/${item.slug}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted group-hover:bg-brand-600 group-hover:text-white transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 max-w-sm mx-auto">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground border border-border">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Results Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We couldn&apos;t find anything matching &quot;{query}&quot;. Try adjusting your keywords or checking spelling.
            </p>
            <button
              onClick={() => setQuery("")}
              className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted font-bold text-xs uppercase cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent mb-4" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
