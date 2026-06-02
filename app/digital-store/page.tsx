"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, BookOpen, Download, Star, Sparkles, Tag, ArrowRight, Grid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  type: "free" | "paid" | "freemium";
  imageUrl: string;
  downloadCount: number;
  averageRating: number;
}

const categories = [
  { id: "all", label: "All Resources", count: 0 },
  { id: "notes", label: "Engineering Notes", count: 0 },
  { id: "guides", label: "DSA & Interview Guides", count: 0 },
  { id: "cheatsheets", label: "Coding Cheat Sheets", count: 0 },
  { id: "ebooks", label: "E-books", count: 0 },
  { id: "templates", label: "Resume & Web Templates", count: 0 },
  { id: "tools", label: "Mini Tools", count: 0 },
  { id: "prompts", label: "AI Prompt Bundles", count: 0 },
];

export default function DigitalStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/v1/digital-store");
        const data = await response.json();
        if (response.ok && data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to fetch digital products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== "all") {
      result = result.filter((p) => p.type === selectedType);
    }

    // Sorting
    if (selectedSort === "newest") {
      // Products are naturally returned newest first from backend
    } else if (selectedSort === "popular") {
      result.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (selectedSort === "rating") {
      result.sort((a, b) => b.averageRating - a.averageRating);
    } else if (selectedSort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, selectedType, selectedSort, products]);

  // Compute counts for UI representation
  const getCategoryCount = (catId: string) => {
    if (catId === "all") return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom">
        {/* Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-neutral-900 to-rose-950 px-8 py-16 text-white text-center shadow-xl border border-white/5 mb-12 select-none"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-rose-500 to-red-600 pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-widest mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" /> Digital Library
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4"
            >
              Premium Coding Templates &amp; Study Notes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium"
            >
              Equip yourself with semester guide notes, resume packages, programming cheat sheets, and verified tools. Build faster, study smarter, ace placements.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-3"
            >
              <Link
                href="/student-hub"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white text-neutral-950 px-6 py-3 text-xs font-bold hover:bg-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Go to Student Hub <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Filter Controls Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Card */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-foreground mb-4">Search Library</h3>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. DSA Guide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-muted/40 border border-input rounded-2xl pl-10 pr-4 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500/30 focus-visible:border-brand-500/40"
                />
              </div>
            </div>

            {/* Category Card */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-brand-600" /> Categories
              </h3>
              <div className="space-y-1.5 relative">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors duration-200 group z-10"
                  >
                    {selectedCategory === cat.id && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 bg-brand-600 rounded-xl -z-10 shadow-md shadow-brand-500/15"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className={
                        selectedCategory === cat.id
                          ? "text-white"
                          : "text-muted-foreground group-hover:text-foreground"
                      }
                    >
                      {cat.label}
                    </span>
                    <span
                      className={`text-[10px] font-black rounded-full px-2 py-0.5 transition-colors duration-200 ${
                        selectedCategory === cat.id
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      }`}
                    >
                      {getCategoryCount(cat.id)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Type Filter */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-foreground mb-4">Price Filters</h3>
              <div className="grid grid-cols-3 gap-2 relative">
                {["all", "free", "paid"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`relative h-9 rounded-xl text-[10px] font-black capitalize transition-all border z-10 ${
                      selectedType === t
                        ? "border-brand-600 bg-brand-50/50 text-brand-600 dark:bg-brand-950/20 shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog Lists Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header controls bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/80 rounded-3xl px-6 py-4 shadow-sm">
              <div className="text-xs font-bold text-muted-foreground">
                Showing <span className="text-foreground font-black">{filteredProducts.length}</span> resources
              </div>
              <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                {/* View switcher */}
                <div className="flex items-center bg-muted/50 rounded-xl p-0.5 border border-border/50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "grid" ? "bg-background text-brand-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "list" ? "bg-background text-brand-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">Sort By:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="h-10 bg-background border border-border rounded-xl px-3 text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500/20"
                  >
                    <option value="newest">Newest Additions</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border/80 rounded-3xl h-[380px] w-full animate-pulse p-4 flex flex-col justify-between"
                  >
                    <div className="aspect-video w-full rounded-2xl bg-muted" />
                    <div className="space-y-3 flex-1 mt-4">
                      <div className="h-4 bg-muted rounded-full w-2/3" />
                      <div className="h-3 bg-muted rounded-full w-full" />
                      <div className="h-3 bg-muted rounded-full w-5/6" />
                    </div>
                    <div className="h-9 bg-muted rounded-2xl w-full" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border/80 rounded-3xl py-20 text-center shadow-sm"
              >
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-bold text-foreground text-base mb-1.5">No resources match your filters</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Try checking other categories or clear your search input to discover placement materials.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedType("all");
                    setSearchQuery("");
                  }}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-6 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-all"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className={
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p, index) => {
                    const isFree = p.type === "free" || p.price === 0;

                    return viewMode === "grid" ? (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.92, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 10 }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25), ease: "easeOut" }}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        key={p._id}
                        className="group bg-card border border-border/85 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all duration-300 relative"
                      >
                        <Link href={`/digital-store/${p.slug}`} className="block relative aspect-video bg-muted overflow-hidden">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-black bg-neutral-900/90 text-white tracking-wider uppercase backdrop-blur-md">
                            {p.category}
                          </span>
                        </Link>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2.5">
                            {/* Rating and Downloads */}
                            <div className="flex items-center gap-3.5 text-[10px] text-muted-foreground font-bold">
                              <span className="flex items-center gap-0.5 text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                {p.averageRating > 0 ? p.averageRating.toFixed(1) : "NEW"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {p.downloadCount.toLocaleString("en-IN")} downloads
                              </span>
                            </div>

                            <Link href={`/digital-store/${p.slug}`} className="block">
                              <h4 className="font-extrabold text-foreground text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                                {p.title}
                              </h4>
                            </Link>

                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {p.description}
                            </p>
                          </div>

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between border-t border-border/50 mt-5 pt-4">
                            <div>
                              <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                Price
                              </span>
                              {isFree ? (
                                <span className="text-sm font-black text-emerald-600 uppercase flex items-center gap-1">
                                  <Tag className="h-3.5 w-3.5" /> FREE
                                </span>
                              ) : (
                                <span className="text-base font-black text-foreground">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/digital-store/${p.slug}`}
                              className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-xs font-bold text-white hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Get Details
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
                        whileHover={{ x: 4, transition: { duration: 0.15 } }}
                        key={p._id}
                        className="group bg-card border border-border/85 rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all duration-300 relative p-4 gap-5"
                      >
                        <Link href={`/digital-store/${p.slug}`} className="block relative w-full sm:w-48 shrink-0 aspect-video rounded-2xl bg-muted overflow-hidden">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-black bg-neutral-900/90 text-white tracking-wider uppercase backdrop-blur-md">
                            {p.category}
                          </span>
                        </Link>

                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            {/* Rating and Downloads */}
                            <div className="flex items-center gap-3.5 text-[10px] text-muted-foreground font-bold">
                              <span className="flex items-center gap-0.5 text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                {p.averageRating > 0 ? p.averageRating.toFixed(1) : "NEW"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {p.downloadCount.toLocaleString("en-IN")} downloads
                              </span>
                            </div>

                            <Link href={`/digital-store/${p.slug}`} className="block">
                              <h4 className="font-extrabold text-foreground text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
                                {p.title}
                              </h4>
                            </Link>

                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>
                          </div>

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between border-t border-border/50 mt-4 pt-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                Price:
                              </span>
                              {isFree ? (
                                <span className="text-sm font-black text-emerald-600 uppercase flex items-center gap-1">
                                  <Tag className="h-3.5 w-3.5" /> FREE
                                </span>
                              ) : (
                                <span className="text-base font-black text-foreground">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/digital-store/${p.slug}`}
                              className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-xs font-bold text-white hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-200"
                            >
                              Get Details
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
