import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
}

export default function BlogCard({ post, priority = false }: BlogCardProps) {
  return (
    <article className="card group flex flex-col overflow-hidden">
      {/* Pinterest-optimized image */}
      <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden">
        <div className="relative aspect-[2/1.3] bg-muted">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute bottom-3 left-3 badge bg-brand-600 text-white capitalize">
            {post.category}
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
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs text-brand-600 bg-brand-50 dark:bg-brand-950 rounded-full px-2.5 py-0.5">
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <Link href={`/blog/${post.slug}`} className="btn-secondary text-sm mt-2 text-center">
          Read Article →
        </Link>
      </div>
    </article>
  );
}
