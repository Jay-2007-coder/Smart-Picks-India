"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, BookOpen, Download, Star, Sparkles, Tag, ArrowRight, Grid, List, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";
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

  useEffect(() => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden select-none pb-24">
      
      {/* Background Ambient Glowing Orbs (Same as Student Hub) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container-custom max-w-7xl relative z-10 py-10 px-4 sm:px-6 lg:px-8"
      >
        {/* Hero Section — Styled to match Student Hub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 px-6 py-12 sm:py-16 text-center shadow-xl dark:shadow-none backdrop-blur-xl mb-12 select-none"
        >
          {/* Inner banner glowing accent */}
          <div className="absolute top-[-50%] left-[25%] w-[50%] h-[100%] rounded-full bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 blur-[90px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto relative z-10">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 uppercase tracking-widest mb-6 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" /> Digital Resource Library
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4 text-slate-900 dark:text-white"
            >
              Premium Coding Templates &amp;{" "}
              <span className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600 dark:from-teal-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Study Notes
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-8 font-semibold max-w-xl mx-auto"
            >
              Equip yourself with semester guides, interview packages, cheatsheets, and source codes. Built to help you compile faster and study smarter.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center items-center gap-3 flex-wrap"
            >
              <Link
                href="/student-hub"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-6 py-3 text-xs font-black shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                Explore Student Hub <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Filter Controls Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm dark:shadow-none backdrop-blur-xl relative overflow-hidden text-left">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3.5 flex items-center gap-2">
                <Search className="h-4 w-4 text-brand-500" /> Search Library
              </h3>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. DSA Guide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-950/90 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Category Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm dark:shadow-none backdrop-blur-xl relative overflow-hidden text-left">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3.5 flex items-center gap-2">
                <Filter className="h-4 w-4 text-teal-500" /> Categories
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
                            ? "bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-400 shadow-sm"
                            : "border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] font-black rounded-lg px-2 py-0.5 transition-colors duration-200 ${
                            isSelected
                              ? "bg-teal-500/20 text-teal-800 dark:text-teal-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
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
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm dark:shadow-none backdrop-blur-xl relative overflow-hidden text-left">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3.5">Price Filter</h3>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800 rounded-2xl relative">
                {["all", "free", "paid"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`relative h-8 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                      selectedType === t
                        ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                        : "border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl px-6 py-4 shadow-sm dark:shadow-none backdrop-blur-xl relative overflow-hidden">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Showing <span className="text-slate-900 dark:text-white font-black"><SmoothCounter value={filteredProducts.length} /></span> resources
              </div>
              
              <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                {/* View switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-950/60 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "grid" ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "list" ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-left">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sort By:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="h-9 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500"
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
                    <div key={idx} className="h-80 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 flex flex-col justify-between space-y-4 animate-pulse">
                      <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                      <div className="space-y-2 flex-1 pt-2">
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                      <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  ))}
                </motion.div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl py-20 text-center shadow-sm dark:shadow-none backdrop-blur-xl relative overflow-hidden"
                >
                  <BookOpen className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4 animate-pulse" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1.5">No resources match your filters</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-semibold">
                    Try checking other categories or clear your search input to discover placement materials.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedType("all");
                      setSearchQuery("");
                    }}
                    className="mt-5 inline-flex h-9 items-center justify-center rounded-xl bg-teal-500 hover:bg-teal-600 px-6 text-xs font-black text-white shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
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
                        className="group bg-white dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/40 dark:hover:border-teal-500/40 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative text-left"
                      >
                        <Link href={`/digital-store/${p.slug}`} className="block relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-slate-900/80 text-white border border-slate-700/50 tracking-wider uppercase backdrop-blur-md">
                            {categories.find(c => c.id === p.category)?.label || p.category}
                          </span>
                        </Link>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2.5">
                            {/* Rating and Downloads */}
                            <div className="flex items-center gap-3.5 text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                                {p.averageRating > 0 ? p.averageRating.toFixed(1) : "NEW"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3.5 w-3.5" />
                                {p.downloadCount.toLocaleString("en-IN")} downloads
                              </span>
                            </div>

                            <Link href={`/digital-store/${p.slug}`} className="block cursor-pointer">
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                                {p.title}
                              </h4>
                            </Link>

                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-semibold">
                              {p.description}
                            </p>
                          </div>

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-5 pt-4">
                            <div>
                              <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Price
                              </span>
                              {isFree ? (
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-0.5">
                                  <Tag className="h-3.5 w-3.5" /> FREE
                                </span>
                              ) : (
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/digital-store/${p.slug}`}
                              className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 px-4 text-xs font-black text-white shadow-md shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
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
                        className="group bg-white dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/40 rounded-3xl overflow-hidden flex flex-col sm:flex-row hover:shadow-xl transition-all duration-300 relative p-4 gap-5 text-left"
                      >
                        <Link href={`/digital-store/${p.slug}`} className="block relative w-full sm:w-48 shrink-0 aspect-video rounded-2xl bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[8px] font-black bg-slate-900/80 text-white border border-slate-700/50 tracking-wider uppercase backdrop-blur-md">
                            {categories.find(c => c.id === p.category)?.label || p.category}
                          </span>
                        </Link>

                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            {/* Rating and Downloads */}
                            <div className="flex items-center gap-3.5 text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                                {p.averageRating > 0 ? p.averageRating.toFixed(1) : "NEW"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3.5 w-3.5" />
                                {p.downloadCount.toLocaleString("en-IN")} downloads
                              </span>
                            </div>

                            <Link href={`/digital-store/${p.slug}`} className="block cursor-pointer">
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                                {p.title}
                              </h4>
                            </Link>

                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-semibold">
                              {p.description}
                            </p>
                          </div>

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-4 pt-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Price:
                              </span>
                              {isFree ? (
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-0.5">
                                  <Tag className="h-3.5 w-3.5" /> FREE
                                </span>
                              ) : (
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/digital-store/${p.slug}`}
                              className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 px-4 text-xs font-black text-white shadow-md shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
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
