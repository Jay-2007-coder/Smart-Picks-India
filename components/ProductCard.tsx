"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, TrendingUp, Zap, Heart, Eye } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";
import { useCompare } from "@/hooks/useCompare";
import QuickViewModal from "@/components/QuickViewModal";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
  aiBadge?: boolean;
}

export default function ProductCard({ product, priority = false, index = 0, aiBadge = false }: ProductCardProps) {
  const { toggleCompare, isInCompare } = useCompare();
  const discount = calculateDiscount(product.price, product.oldPrice);
  const [imgSrc, setImgSrc] = useState(product.image);
  const [wishlist, setWishlist] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const isProxied = imgSrc.startsWith("/api/product-image");

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
        whileHover={{ y: -4 }}
        className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-xl hover:shadow-black/8"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
            <Image
              src={imgSrc}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={priority}
              unoptimized={isProxied}
              onError={() =>
                setImgSrc(
                  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"
                )
              }
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {aiBadge && (
              <span className="badge bg-teal-600 text-white flex items-center gap-1 shadow font-black text-[10px]">
                ✨ AI Pick
              </span>
            )}
            {discount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="badge bg-brand-600 text-white text-xs font-black shadow"
              >
                -{discount}%
              </motion.span>
            )}
            {product.dealOfTheDay && (
              <span className="badge bg-accent-500 text-white flex items-center gap-1 shadow">
                <Zap className="h-3 w-3" /> Deal
              </span>
            )}
            {product.trending && (
              <span className="badge bg-purple-600 text-white flex items-center gap-1 shadow">
                <TrendingUp className="h-3 w-3" /> Trending
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.preventDefault(); setWishlist((v) => !v); }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-border/40 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
            aria-label="Wishlist"
          >
            <Heart className={`h-3.5 w-3.5 transition-colors ${wishlist ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
          </motion.button>

          {/* Compare Checkbox */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(product);
            }}
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/95 dark:bg-slate-900/95 text-[10px] font-bold text-foreground border border-border/40 shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 hover:scale-105"
          >
            <input
              type="checkbox"
              checked={isInCompare(product.slug)}
              onChange={() => {}} // toggled by parent click handler
              className="h-3.5 w-3.5 accent-teal-600 rounded cursor-pointer"
            />
            <span className="text-[10px] font-black">Compare</span>
          </div>

          {/* Quick View button on hover */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:bg-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Eye className="h-3 w-3" /> Quick View
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          {/* Category */}
          <span className="text-xs font-semibold text-brand-600 capitalize">{product.category}</span>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviewCount.toLocaleString("en-IN")})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-lg font-black text-foreground">{formatPrice(product.price)}</span>
            {product.oldPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* CTA */}
          <motion.a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn-primary w-full mt-2 text-center justify-center"
            id={`buy-${product.slug}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <ShoppingCart className="h-4 w-4" />
            Buy on Amazon
          </motion.a>
        </div>
      </motion.article>

      {/* QuickViewModal rendered via portal at document.body —
          This is critical! Framer Motion applies CSS `transform` on the article for the
          whileHover y:-4 animation, which creates a new stacking context that breaks
          `position: fixed` on any child elements. Moving the modal outside the card
          via a portal fixes the layout glitch completely. */}
      {quickViewOpen && typeof document !== "undefined" && createPortal(
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />,
        document.body
      )}
    </>
  );
}
