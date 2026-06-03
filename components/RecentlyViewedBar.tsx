"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { products, type Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { Eye, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function RecentlyViewedBar() {
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      const stored = localStorage.getItem("smart_picks_recently_viewed");
      if (stored) {
        const slugs: string[] = JSON.parse(stored);
        if (slugs.length > 0) {
          // Resolve slugs to products, preserving the order in localStorage
          const resolved = slugs
            .map((slug) => products.find((p) => p.slug === slug))
            .filter((p): p is Product => !!p);

          setViewedProducts(resolved);
        }
      }
    } catch (err) {
      console.error("Failed to read recently viewed products:", err);
    }
  }, []);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-12 border-t border-border bg-slate-50/50 dark:bg-slate-950/10">
      <div className="container-custom">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">Recently Viewed</h2>
            <p className="text-xs text-muted-foreground">Jump back into products you recently browsed.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {viewedProducts.slice(0, 5).map((product, idx) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border/70 rounded-2xl p-3 flex flex-col justify-between group hover:shadow-md transition-all hover:border-brand-500/20"
            >
              <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-muted rounded-xl overflow-hidden mb-3">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{product.category}</p>
                  <Link href={`/product/${product.slug}`} className="block">
                    <h4 className="text-xs font-bold leading-snug text-foreground group-hover:text-brand-600 transition-colors line-clamp-2">
                      {product.title}
                    </h4>
                  </Link>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-sm font-black text-brand-600">{formatPrice(product.price)}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-3 w-3" /> View
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
