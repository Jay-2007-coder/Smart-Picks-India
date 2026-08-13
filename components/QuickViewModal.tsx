"use client";

import { X, Star, ShoppingCart, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice, calculateDiscount } from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  if (!product) return null;

  const discount = calculateDiscount(product.price, product.oldPrice);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-4xl bg-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row select-none"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 dark:bg-slate-900/80 border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all z-20 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Left Column: Image */}
          <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-muted">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 badge bg-brand-600 text-white font-black text-xs shadow-md">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* Right Column: Scrollable Details */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[50vh] md:max-h-[90vh] flex flex-col justify-between">
            <div className="space-y-5">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-brand-600 bg-brand-50 dark:bg-brand-950/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                {product.dealOfTheDay && (
                  <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> deal of the day
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-foreground leading-snug">
                {product.title}
              </h2>

              {/* Rating & reviews */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-extrabold text-foreground ml-1">{product.rating}</span>
                </div>
                <span className="text-muted-foreground font-medium">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 border-b border-border pb-4">
                <span className="text-3xl font-black text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through font-semibold">
                      {formatPrice(product.oldPrice)}
                    </span>
                    <span className="text-sm font-black text-brand-600 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md">
                      Save {formatPrice(product.oldPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Pros & Cons grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Pros */}
                {product.pros && product.pros.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle className="h-3.5 w-3.5" /> Pros
                    </h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {product.pros.slice(0, 3).map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-500 font-bold mr-1">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cons */}
                {product.cons && product.cons.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-red-600 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle className="h-3.5 w-3.5" /> Cons
                    </h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {product.cons.slice(0, 3).map((con, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-red-500 font-bold mr-1">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="btn-secondary flex-1 py-3 text-xs uppercase font-extrabold tracking-wider text-center"
              >
                More Details
              </Link>
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn-amazon flex-1 py-3 text-xs uppercase font-extrabold tracking-wider text-center flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" /> Buy on Amazon
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
