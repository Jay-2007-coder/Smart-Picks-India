"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  Tag, 
  ArrowRight, 
  Plus, 
  Layers, 
  Laptop, 
  Coffee, 
  Smartphone, 
  Sparkles, 
  GraduationCap, 
  Home as HomeIcon,
  Search,
  X
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/data/blogPosts";
import BlogCard from "@/components/BlogCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface BlogClientProps {
  initialPosts: BlogPost[];
}

const categoryInfo: Record<string, { label: string; icon: React.ComponentType<any>; color: string; glow: string }> = {
  all: { label: "All Guides", icon: Layers, color: "from-brand-600 to-rose-600", glow: "rgba(212,63,54,0.12)" },
  "buying-guides": { label: "Buying Guides", icon: Layers, color: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.12)" },
  tech: { label: "Tech", icon: Laptop, color: "from-blue-600 to-indigo-600", glow: "rgba(37,99,235,0.12)" },
  "student-hub": { label: "Student Hub", icon: GraduationCap, color: "from-purple-600 to-violet-600", glow: "rgba(147,51,234,0.12)" },
  "tech-trends": { label: "Tech Trends", icon: Sparkles, color: "from-cyan-600 to-blue-600", glow: "rgba(8,145,178,0.12)" },
  kitchen: { label: "Kitchen", icon: Coffee, color: "from-emerald-600 to-teal-600", glow: "rgba(5,150,105,0.12)" },
  gadgets: { label: "Gadgets", icon: Smartphone, color: "from-cyan-600 to-blue-600", glow: "rgba(8,145,178,0.12)" },
  fashion: { label: "Fashion", icon: Sparkles, color: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.12)" },
  study: { label: "Study Hub", icon: GraduationCap, color: "from-purple-600 to-violet-600", glow: "rgba(147,51,234,0.12)" },
  home: { label: "Home", icon: HomeIcon, color: "from-rose-500 to-pink-600", glow: "rgba(244,63,94,0.12)" }
};

export function FeaturedBlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55 }}
      whileHover={{
        y: -4,
        boxShadow: "0 22px 48px -12px rgba(0,0,0,0.18), 0 0 28px 4px rgba(212,63,54,0.08)",
        borderColor: "rgba(212,63,54,0.3)"
      }}
      className="group overflow-hidden border border-border/80 dark:border-border/30 bg-card rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 grid grid-cols-1 md:grid-cols-2 select-none"
    >
      {/* Left side: Image */}
      <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden min-h-[250px] md:min-h-[350px] bg-muted">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-103"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
        
        {/* Floating Featured badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-white bg-red-650/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-red-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Featured Guide
          </span>
        </div>

        {/* Floating Category Tag */}
        <span className="absolute bottom-4 left-4 inline-flex items-center text-[10px] font-black tracking-wide text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-white/10 uppercase">
          {post.category}
        </span>
      </Link>

      {/* Right side: Content */}
      <div className="p-6 sm:p-8 flex flex-col justify-center gap-4.5">
        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/80">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-brand-600" />
            {formatDate(post.datePublished)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            {post.readTime}
          </span>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-foreground leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-500/5 dark:bg-brand-500/10 rounded-lg px-2.5 py-1 border border-brand-500/15">
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 px-6 py-3 rounded-xl shadow-md shadow-brand-500/10 transition-all duration-300 btn-shiny"
          >
            Read Full Article <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function BlogClient({ initialPosts }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const categories = ["all", "buying-guides", "tech", "student-hub", "tech-trends", "kitchen", "gadgets", "fashion", "study", "home"];
  const { user } = useAuth() as any;
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
          return;
        }
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = initialPosts;
    
    // Category filter
    if (selectedCategory !== "all") {
      posts = posts.filter((post) => {
        const pCat = (post.category || "").toLowerCase();
        const sCat = selectedCategory.toLowerCase();
        if (pCat === sCat) return true;
        if (sCat === "tech" && (pCat.includes("tech") || pCat.includes("buying-guides") || pCat.includes("gadget"))) return true;
        if (sCat === "study" && (pCat.includes("student") || pCat.includes("study") || pCat.includes("placement"))) return true;
        if (sCat === "buying-guides" && (pCat.includes("buying") || pCat.includes("guide") || pCat.includes("review"))) return true;
        return false;
      });
    }
    
    // Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          post.category.toLowerCase().includes(query)
      );
    }
    
    return posts;
  }, [initialPosts, selectedCategory, searchQuery]);

  const activeInfo = categoryInfo[selectedCategory] || categoryInfo.all;

  return (
    <div className="space-y-8 select-none relative">
      {/* Dynamic Ambient Background Glow */}
      <div 
        className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full pointer-events-none blur-[140px] opacity-15 transition-all duration-1000 -z-20"
        style={{
          background: `radial-gradient(circle, ${activeInfo.glow.replace("0.12", "1")} 0%, transparent 70%)`
        }}
      />

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-2 relative z-10">
        <motion.h1 
          key={selectedCategory}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl sm:text-5xl font-display font-black text-foreground mb-4 tracking-tight leading-none"
        >
          Smart Picks <span className={`bg-gradient-to-r ${activeInfo.color} bg-clip-text text-transparent`}>Blog</span>
        </motion.h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          In-depth reviews, top 10 rankings, and expert buying guides to help you make smarter purchasing decisions in India.
        </p>
      </div>

      {/* Admin Quick Link */}
      {user && user.role === "admin" && (
        <div className="flex justify-end -mb-4 animate-fade-in">
          <Link
            href="/admin#blog-generator"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-tr from-red-650 via-indigo-650 to-indigo-700 px-4 text-xs font-bold text-white shadow-md hover:scale-102 hover:shadow-lg transition-all duration-300 border border-white/10"
          >
            <Plus className="h-4 w-4" /> Add Blog Post
          </Link>
        </div>
      )}

      {/* Search Input bar */}
      <div className="max-w-md mx-auto relative w-full px-1">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search buying guides or tags... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-border/80 dark:border-border/30 bg-card/60 dark:bg-slate-950/40 backdrop-blur-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
            id="blog-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="relative w-full border-b border-border/50 pb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none md:overflow-x-visible md:pb-0 md:justify-center w-full">
          {categories.map((cat) => {
            const catId = cat.toLowerCase();
            const isActive = selectedCategory === catId;
            const info = categoryInfo[catId] || categoryInfo.all;
            const IconComponent = info.icon;
            return (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(catId)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border select-none shrink-0 ${
                  isActive
                    ? "text-white border-transparent"
                    : "bg-muted dark:bg-slate-900/60 text-muted-foreground hover:text-foreground border-transparent hover:border-border/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${info.color} shadow-md shadow-brand-500/10 -z-10`}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <IconComponent className={`h-4 w-4 ${isActive ? "text-white animate-pulse-scale" : "text-muted-foreground/75"}`} />
                <span className="capitalize">{info.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Posts rendering with layout logic */}
      <AnimatePresence mode="wait">
        {filteredPosts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 text-muted-foreground border border-dashed border-border/80 bg-card rounded-3xl p-6"
          >
            <p className="text-base font-bold text-foreground">No articles found matching your criteria</p>
            <p className="text-xs text-muted-foreground mt-1">Try tweaking your search term or select another category!</p>
          </motion.div>
        ) : filteredPosts.length <= 3 ? (
          // Featured Layout
          <motion.div
            key={`featured-${selectedCategory}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <FeaturedBlogCard post={filteredPosts[0]} />

            {filteredPosts.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {filteredPosts.slice(1).map((post, i) => (
                  <BlogCard key={post.slug} post={post} priority={false} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // Standard 3-column Grid Layout
          <motion.div
            key={`grid-${selectedCategory}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post, i) => (
              <BlogCard key={post.slug} post={post} priority={i < 3} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
