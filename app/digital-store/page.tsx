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
  { id: "all", label: "All Resources" },
  { id: "notes", label: "Engineering Notes" },
  { id: "guides", label: "DSA & Interview Guides" },
  { id: "cheatsheets", label: "Coding Cheat Sheets" },
  { id: "ebooks", label: "E-books" },
  { id: "templates", label: "Resume & Web Templates" },
  { id: "tools", label: "Mini Tools" },
  { id: "prompts", label: "AI Prompt Bundles" },
];

function SmoothCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 400; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

export default function DigitalStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [clientParticles, setClientParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random particles client-side
    const pts = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 14 + 12,
      delay: Math.random() * 4,
    }));
    setClientParticles(pts);

    async function fetchProducts() {
      const startTime = Date.now();
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
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 600 - elapsed);
        setTimeout(() => {
          setLoading(false);
        }, remaining);
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
      // Naturally returned newest first from backend
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

  const getCategoryCount = (catId: string) => {
    if (catId === "all") return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden select-none pb-16">
      
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-950/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-950/10 blur-[120px]" />
        
        {/* Floating Particles */}
        {clientParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-rose-500/10 rounded-full blur-[1.5px]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -120, 0],
              x: [0, 60, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container-custom max-w-7xl relative z-10 py-10 px-4 sm:px-6 lg:px-8"
      >
        {/* Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden bg-zinc-900/30 border border-zinc-800/80 px-8 py-16 text-center shadow-xl backdrop-blur-xl mb-12 select-none"
        >
          {/* Inner banner glowing ambient circle */}
          <div className="absolute top-[-40%] left-[30%] w-[40%] h-[80%] rounded-full bg-rose-500/10 blur-[90px] pointer-events-none" />
          
          <div className="max-w-2xl mx-auto relative z-10">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-450 border border-rose-500/25 uppercase tracking-widest mb-6 animate-pulse"
              style={{ animationDuration: "3s" }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Digital Library
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-zinc-50 via-zinc-200 to-zinc-400"
            >
              Premium Coding Templates &amp; Study Notes
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-8 font-semibold max-w-lg mx-auto"
            >
              Equip yourself with semester guides, interview packages, cheatsheets, and source codes. Built to help you compile faster and study smarter.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-3"
            >
              <Link
                href="/student-hub"
                className="inline-flex items-center gap-2 rounded-2xl bg-zinc-50 text-neutral-950 px-5 py-2.5 text-xs font-black hover:bg-white shadow-lg hover:shadow-zinc-50/5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                Go to Student Hub <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Filter Controls Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 shadow-lg backdrop-blur-xl relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-850 to-zinc-800/0" />
              <h3 className="font-black text-xs uppercase tracking-wider text-zinc-400 mb-4">Search Library</h3>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. DSA Guide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-zinc-950/60 border border-zinc-850 rounded-2xl pl-10 pr-4 text-xs font-bold text-zinc-200 outline-none focus:border-rose-500/40 focus:bg-zinc-950/80 transition-all"
                />
              </div>
            </div>

            {/* Category Card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 shadow-lg backdrop-blur-xl relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-850 to-zinc-800/0" />
              <h3 className="font-black text-xs uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-rose-500" /> Categories
              </h3>
              <div className="space-y-1.5 relative">
                {categories
                  .filter((cat) => getCategoryCount(cat.id) > 0)
                  .map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-black transition-all group z-10 cursor-pointer ${
                          isSelected 
                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={`text-[9px] font-black rounded-lg px-2 py-0.5 transition-colors duration-200 ${
                            isSelected
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-zinc-900 text-zinc-550 group-hover:bg-zinc-850"
                          }`}
                        >
                          {getCategoryCount(cat.id)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Price Type Filter */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 shadow-lg backdrop-blur-xl relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-850 to-zinc-800/0" />
              <h3 className="font-black text-xs uppercase tracking-wider text-zinc-400 mb-4">Price Filters</h3>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950/60 border border-zinc-900 rounded-2xl relative">
                {["all", "free", "paid"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`relative h-8 rounded-xl text-[9px] font-black capitalize transition-all cursor-pointer ${
                      selectedType === t
                        ? "bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-sm"
                        : "border border-transparent text-zinc-400 hover:text-zinc-200"
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/30 border border-zinc-800/80 rounded-3xl px-6 py-4 shadow-lg backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-850 to-zinc-800/0" />
              <div className="text-xs font-bold text-zinc-400">
                Showing <span className="text-zinc-200 font-black"><SmoothCounter value={filteredProducts.length} /></span> resources
              </div>
              
              <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                {/* View switcher */}
                <div className="flex items-center bg-zinc-950/60 rounded-xl p-0.5 border border-zinc-850">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "grid" ? "bg-zinc-900 text-rose-400 border border-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "list" ? "bg-zinc-900 text-rose-400 border border-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-left">
                  <span className="text-xs font-bold text-zinc-400">Sort By:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="h-9 bg-zinc-950 border border-zinc-855 rounded-xl px-2.5 text-xs font-bold text-zinc-200 outline-none focus:border-rose-500/40"
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

            {/* Catalog Grid / List */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-80 rounded-3xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 flex flex-col justify-between space-y-4 animate-pulse">
                      <div className="aspect-video bg-zinc-850 rounded-2xl" />
                      <div className="space-y-2 flex-1 pt-2">
                        <div className="h-3 w-16 bg-zinc-850 rounded" />
                        <div className="h-4 w-40 bg-zinc-850 rounded" />
                      </div>
                      <div className="h-8 w-full bg-zinc-850 rounded-xl" />
                    </div>
                  ))}
                </motion.div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl py-20 text-center shadow-lg backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-800/0 via-zinc-850 to-zinc-800/0" />
                  <BookOpen className="mx-auto h-12 w-12 text-zinc-600 mb-4 animate-pulse" />
                  <h3 className="font-extrabold text-zinc-200 text-base mb-1.5">No resources match your filters</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-semibold">
                    Try checking other categories or clear your search input to discover placement materials.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedType("all");
                      setSearchQuery("");
                    }}
                    className="mt-5 inline-flex h-9 items-center justify-center rounded-xl bg-rose-500 hover:bg-rose-600 px-6 text-xs font-black text-white shadow-lg shadow-rose-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="catalog"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={
                    viewMode === "grid"
                      ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredProducts.map((p, index) => {
                    const isFree = p.type === "free" || p.price === 0;

                    return viewMode === "grid" ? (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.2), ease: "easeOut" }}
                        key={p._id}
                        className="group bg-zinc-900/20 hover:bg-zinc-900/30 backdrop-blur-md border border-zinc-850 hover:border-rose-500/30 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 relative text-left"
                      >
                        <Link href={`/digital-store/${p.slug}`} className="block relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[8px] font-black bg-zinc-950/70 border border-zinc-800 text-zinc-350 tracking-wider uppercase backdrop-blur-md">
                            {categories.find(c => c.id === p.category)?.label || p.category}
                          </span>
                        </Link>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2.5">
                            {/* Rating and Downloads */}
                            <div className="flex items-center gap-3.5 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-0.5 text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                                {p.averageRating > 0 ? p.averageRating.toFixed(1) : "NEW"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {p.downloadCount.toLocaleString("en-IN")} dl
                              </span>
                            </div>

                            <Link href={`/digital-store/${p.slug}`} className="block cursor-pointer">
                              <h4 className="font-extrabold text-zinc-150 text-sm leading-snug group-hover:text-rose-400 transition-colors line-clamp-2">
                                {p.title}
                              </h4>
                            </Link>

                            <p className="text-xs text-zinc-455 line-clamp-3 leading-relaxed font-semibold">
                              {p.description}
                            </p>
                          </div>

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between border-t border-zinc-850 mt-5 pt-4">
                            <div>
                              <span className="block text-[8px] font-black text-zinc-550 uppercase tracking-widest">
                                Price
                              </span>
                              {isFree ? (
                                <span className="text-xs font-black text-emerald-455 uppercase flex items-center gap-0.5">
                                  <Tag className="h-3.5 w-3.5" /> FREE
                                </span>
                              ) : (
                                <span className="text-sm font-black text-zinc-200">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/digital-store/${p.slug}`}
                              className="inline-flex h-8.5 items-center justify-center rounded-xl bg-rose-500 hover:bg-rose-600 px-4 text-xs font-black text-white shadow-lg shadow-rose-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
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
                        key={p._id}
                        className="group bg-zinc-900/20 hover:bg-zinc-900/30 backdrop-blur-md border border-zinc-850 hover:border-rose-500/30 rounded-3xl overflow-hidden flex flex-col sm:flex-row hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-300 relative p-4 gap-5 text-left"
                      >
                        <Link href={`/digital-store/${p.slug}`} className="block relative w-full sm:w-48 shrink-0 aspect-video rounded-2xl bg-zinc-950 overflow-hidden cursor-pointer">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[8px] font-black bg-zinc-950/70 border border-zinc-800 text-zinc-350 tracking-wider uppercase backdrop-blur-md">
                            {categories.find(c => c.id === p.category)?.label || p.category}
                          </span>
                        </Link>

                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            {/* Rating and Downloads */}
                            <div className="flex items-center gap-3.5 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-0.5 text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                                {p.averageRating > 0 ? p.averageRating.toFixed(1) : "NEW"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {p.downloadCount.toLocaleString("en-IN")} dl
                              </span>
                            </div>

                            <Link href={`/digital-store/${p.slug}`} className="block cursor-pointer">
                              <h4 className="font-extrabold text-zinc-150 text-sm leading-snug group-hover:text-rose-400 transition-colors line-clamp-1">
                                {p.title}
                              </h4>
                            </Link>

                            <p className="text-xs text-zinc-455 line-clamp-2 leading-relaxed font-semibold">
                              {p.description}
                            </p>
                          </div>

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between border-t border-zinc-850 mt-4 pt-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black text-zinc-550 uppercase tracking-widest">
                                Price:
                              </span>
                              {isFree ? (
                                <span className="text-xs font-black text-emerald-455 uppercase flex items-center gap-0.5">
                                  <Tag className="h-3.5 w-3.5" /> FREE
                                </span>
                              ) : (
                                <span className="text-sm font-black text-zinc-200">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/digital-store/${p.slug}`}
                              className="inline-flex h-8.5 items-center justify-center rounded-xl bg-rose-500 hover:bg-rose-600 px-4 text-xs font-black text-white shadow-lg shadow-rose-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                            >
                              Get Details
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
