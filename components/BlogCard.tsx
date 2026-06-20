"use client";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/data/blogPosts";
import { motion } from "framer-motion";

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
  index?: number;
}

export default function BlogCard({ post, priority = false, index = 0 }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{
        y: -6,
        boxShadow: "0 22px 48px -12px rgba(0,0,0,0.22), 0 0 28px 4px rgba(212,63,54,0.12)",
        borderColor: "rgba(212,63,54,0.38)"
      }}
      className="group flex flex-col overflow-hidden transition-all duration-300 border border-border/80 dark:border-border/30 bg-card rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] select-none"
    >
      {/* Image */}
      <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden">
        <div className="relative aspect-[2/1.3] bg-muted border-b border-border/10">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Category badge */}
          <span className="absolute bottom-3 left-3 inline-flex items-center text-[9px] font-black tracking-wide text-white bg-brand-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-brand-500/20">
            {post.category}
          </span>

          {/* Read time pill */}
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-bold text-white bg-black/50 backdrop-blur-md rounded-lg px-2 py-0.5 border border-white/10">
            <Clock className="h-2.5 w-2.5 text-amber-400" />
            {post.readTime}
          </span>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-5 gap-3.5">
        {/* Meta */}
        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground/80">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brand-600" />
            {formatDate(post.datePublished)}
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-display font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-[9px] font-extrabold text-brand-600 dark:text-brand-400 bg-brand-500/5 dark:bg-brand-500/10 rounded-md px-2 py-0.5 border border-brand-500/15">
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="w-full text-center py-2.5 rounded-xl font-black text-xs text-foreground bg-muted hover:bg-brand-500/5 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/20 border border-transparent transition-all duration-300 inline-flex items-center justify-center gap-1.5 cursor-pointer btn-shiny"
        >
          Read Article <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}
