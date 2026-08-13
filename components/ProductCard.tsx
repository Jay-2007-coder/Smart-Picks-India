"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Star, ExternalLink, TrendingUp, Zap, Heart, BarChart2 } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/data/products";
import { useCompare } from "@/hooks/useCompare";
import QuickViewModal from "@/components/QuickViewModal";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
  aiBadge?: boolean;
}

export default function ProductCard({
  product,
  priority = false,
  index = 0,
  aiBadge = false,
}: ProductCardProps) {
  const { toggleCompare, isInCompare } = useCompare();
  const discount  = calculateDiscount(product.price, product.oldPrice);
  const [imgSrc, setImgSrc] = useState(product.image);
  const [wishlist, setWishlist] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const inCompare = isInCompare(product.slug);
  const isProxied = imgSrc.startsWith("/api/product-image");

  return (
    <>
      <article
        className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-border select-none"
        aria-label={product.title}
      >

        {/* ── Image area ──────────────────────────────────────── */}
        <div className="relative aspect-square bg-white dark:bg-white/[0.03] border-b border-border overflow-hidden">

          {/* Product image */}
          <Link
            href={`/product/${product.slug}`}
            className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            tabIndex={-1}
            aria-label={`View ${product.title}`}
          >
            <Image
              src={imgSrc}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
              priority={priority}
              unoptimized={isProxied}
              onError={() =>
                setImgSrc("https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80")
              }
            />
          </Link>

          {/* Badges — top-left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10" aria-label="Product badges">
            {aiBadge && (
              <span className="badge-success text-[10px]">AI Pick</span>
            )}
            {discount > 0 && (
              <span className="badge-brand text-[10px]">-{discount}%</span>
            )}
            {product.dealOfTheDay && (
              <span className="badge-warning text-[10px] flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" strokeWidth={2} aria-hidden="true" />
                Deal
              </span>
            )}
            {product.trending && !product.dealOfTheDay && (
              <span className="badge-default text-[10px] flex items-center gap-1">
                <TrendingUp className="h-2.5 w-2.5" strokeWidth={2} aria-hidden="true" />
                Trending
              </span>
            )}
          </div>

          {/* Wishlist button — top-right, appears on hover */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlist((v) => !v); }}
            className={cn(
              "absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 dark:bg-card/90 border border-border",
              "transition-opacity duration-150 z-10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "opacity-0 group-hover:opacity-100"
            )}
            aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlist}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                wishlist ? "fill-brand-600 text-brand-600" : "text-muted-foreground"
              )}
              strokeWidth={wishlist ? 0 : 2}
            />
          </button>

          {/* Compare toggle — bottom-left, appears on hover */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product); }}
            className={cn(
              "absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md border",
              "text-xs font-medium transition-all duration-150 z-10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "opacity-0 group-hover:opacity-100",
              inCompare
                ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/30 dark:border-brand-800/30 dark:text-brand-400"
                : "bg-white/90 dark:bg-card/90 border-border text-muted-foreground hover:text-foreground"
            )}
            aria-label={inCompare ? "Remove from comparison" : "Add to comparison"}
            aria-pressed={inCompare}
          >
            <BarChart2 className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            {inCompare ? "Added" : "Compare"}
          </button>
        </div>

        {/* ── Content ─────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">

          {/* Category label */}
          <span className="section-label text-[10px]" aria-label={`Category: ${product.category}`}>
            {product.category}
          </span>

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
          >
            <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 hover:text-brand-600 transition-colors duration-150">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5" aria-label={`Rated ${product.rating} out of 5`}>
            <div className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-border text-border"
                  )}
                  strokeWidth={0}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating}&nbsp;({product.reviewCount.toLocaleString("en-IN")})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through" aria-label={`Original price ${formatPrice(product.oldPrice)}`}>
                {formatPrice(product.oldPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs text-green-600 font-medium dark:text-green-400 ml-auto" aria-label={`You save ${discount}%`}>
                Save {discount}%
              </span>
            )}
          </div>

          {/* Buy CTA */}
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer nofollow"
            id={`buy-${product.slug}`}
            className="btn-amazon w-full justify-center mt-1"
            aria-label={`Buy ${product.title} on Amazon`}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            Buy on Amazon
          </a>
        </div>
      </article>

      {/* QuickView modal rendered at body level via portal to avoid stacking-context issues
          (Framer Motion transform on the card creates a new stacking context that breaks
          position: fixed on child modals — portal sidesteps this entirely). */}
      {quickViewOpen && typeof document !== "undefined" && createPortal(
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />,
        document.body
      )}
    </>
  );
}
