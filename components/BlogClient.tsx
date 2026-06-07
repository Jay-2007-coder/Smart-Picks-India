"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowRight, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/data/blogPosts";
import BlogCard from "@/components/BlogCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface BlogClientProps {
  initialPosts: BlogPost[];
}

export function FeaturedBlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55 }}
      className="card group overflow-hidden border border-border/80 bg-card rounded-3xl shadow-sm hover:shadow-md hover:border-border transition-all duration-300 grid grid-cols-1 md:grid-cols-2 select-none"
    >
      {/* Left side: Image */}
      <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden min-h-[250px] md:min-h-[350px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
        <span className="absolute bottom-4 left-4 badge bg-brand-600 text-white capitalize text-xs">
          {post.category}
        </span>
      </Link>

      {/* Right side: Content */}
      <div className="p-6 sm:p-8 flex flex-col justify-center gap-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.datePublished)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.readTime}
          </span>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground leading-snug group-hover:text-brand-600 transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs text-brand-600 bg-brand-50 dark:bg-brand-950 rounded-full px-3 py-1 border border-brand-500/10">
              <Tag className="h-3.5 w-3.5" />
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2">
          <Link href={`/blog/${post.slug}`} className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold shadow-md">
            Read Full Article <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function BlogClient({ initialPosts }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const categories = ["All", "Tech", "Kitchen", "Gadgets", "Fashion", "Study", "Home"];
  const { user } = useAuth() as any;

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "all") return initialPosts;
    return initialPosts.filter((post) => post.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [initialPosts, selectedCategory]);

  return (
    <div className="space-y-8 select-none">
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

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-border/60 pb-6">
        {categories.map((cat) => {
          const catId = cat.toLowerCase();
          const isActive = selectedCategory === catId;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(catId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#d43f36] text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          );
        })}
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
            <p className="text-base font-bold text-foreground">No articles found in this category</p>
            <p className="text-xs text-muted-foreground mt-1">Check back later for new buying guides!</p>
          </motion.div>
        ) : filteredPosts.length <= 3 ? (
          // Featured Layout
          <motion.div
            key={`featured-${selectedCategory}`}
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
            key={`grid-${selectedCategory}`}
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
