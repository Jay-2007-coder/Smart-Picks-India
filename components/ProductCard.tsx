"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, TrendingUp, Zap } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.oldPrice);
  const [imgSrc, setImgSrc] = useState(product.image);

  // Images served via our proxy or relative paths don't need Next.js domain config
  const isProxied = imgSrc.startsWith("/api/product-image");

  return (
    <article className="card group flex flex-col overflow-hidden">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden">
        <div className="relative aspect-square bg-muted">
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
            unoptimized={isProxied}
            onError={() =>
              setImgSrc(
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"
              )
            }
          />
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-brand-600 text-white text-xs font-bold">
              -{discount}%
            </span>
          )}
          {product.dealOfTheDay && (
            <span className="badge bg-accent-500 text-white flex items-center gap-1">
              <Zap className="h-3 w-3" /> Deal
            </span>
          )}
          {product.trending && (
            <span className="badge bg-purple-600 text-white flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Trending
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category */}
        <span className="text-xs font-medium text-brand-600 capitalize">{product.category}</span>

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
          <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.oldPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* CTA */}
        <a
          href={product.affiliateLink}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="btn-primary w-full mt-2 text-center"
          id={`buy-${product.slug}`}
        >
          <ShoppingCart className="h-4 w-4" />
          Buy on Amazon
        </a>
      </div>
    </article>
  );
}
