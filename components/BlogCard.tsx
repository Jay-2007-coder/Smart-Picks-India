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
      whileHover={{ y: -6 }}
      className="card group flex flex-col overflow-hidden transition-all duration-300 border border-border/80 bg-card rounded-3xl shadow-sm glow-card-hover"
    >
      {/* Image */}
      <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden">
        <div className="relative aspect-[2/1.3] bg-muted">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Category badge */}
          <span className="absolute bottom-3 left-3 badge bg-brand-600 text-white capitalize">
            {post.category}
          </span>

          {/* Read time pill */}
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-bold text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Clock className="h-2.5 w-2.5" />
            {post.readTime}
          </span>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.datePublished)}
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-bold text-foreground leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs text-brand-600 bg-brand-50 dark:bg-brand-950 rounded-full px-2.5 py-0.5 border border-brand-500/10">
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <motion.div whileHover={{ x: 4 }}>
          <Link href={`/blog/${post.slug}`} className="btn-secondary text-sm mt-2 text-center inline-flex items-center gap-1.5 justify-center w-full btn-shiny cursor-pointer">
            Read Article <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </motion.article>
  );
}
