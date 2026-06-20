"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSectionHeader from "@/components/AnimatedSectionHeader";
import FlashDealTimer from "@/components/FlashDealTimer";
import { formatPrice, calculateDiscount } from "@/lib/utils";

interface FlashProduct {
  slug: string;
  title: string;
  image: string;
  category: string;
  description: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviewCount: number;
  affiliateLink: string;
  flashDealEndsAt: string;
}

export default function FlashDealsSection() {
  const [deals, setDeals] = useState<FlashProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlashDeals() {
      try {
        const response = await fetch("/api/v1/deals/flash");
        const data = await response.json();
        if (response.ok && data.success) {
          setDeals(data.deals || []);
        }
      } catch (err) {
        console.error("Failed to load flash deals", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFlashDeals();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container-custom">
          <div className="h-6 w-48 bg-muted animate-pulse rounded-full mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card flex flex-col h-[280px] bg-card border border-border/50 animate-pulse rounded-2xl overflow-hidden">
                <div className="aspect-square bg-muted/65" />
                <div className="p-3 gap-2 flex flex-col flex-1">
                  <div className="h-4 bg-muted/65 rounded w-3/4" />
                  <div className="h-3 bg-muted/65 rounded w-1/2" />
                  <div className="h-8 bg-muted/65 rounded w-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/25 border-b border-border/40">
      <div className="container-custom">
        <AnimatedSectionHeader
          eyebrow={<><Zap className="h-4 w-4" /> Limited Time</>}
          eyebrowClass="text-accent-500 animate-pulse"
          title="Super Flash Deals"
          subtitle="Extreme discount drops. Claim before countdown ends!"
          action={
            <Link href="/deals" className="btn-secondary hidden sm:flex text-xs">
              View All Deals <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-8">
          {deals.map((deal, idx) => {
            const discount = calculateDiscount(deal.price, deal.oldPrice);
            return (
              <motion.article
                key={deal.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 35px -10px rgba(0,0,0,0.15), 0 0 18px 2px rgba(249,115,22,0.06)",
                  borderColor: "rgba(249,115,22,0.25)"
                }}
                className="card group overflow-hidden flex flex-col transition-all duration-300 relative border border-border/60"
              >
                {/* Glowing subtle top border for flash deal */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 to-rose-500 z-10" />

                {/* Card Image Wrapper */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute top-3 left-3 badge bg-rose-600 text-white font-black text-[10px] shadow z-10">
                    -{discount}% OFF
                  </span>
                </div>

                {/* Card Details */}
                <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
                  <div className="mb-0.5">
                    <FlashDealTimer endsAt={deal.flashDealEndsAt} />
                  </div>

                  <Link href={`/product/${deal.slug}`}>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-accent-500 transition-colors">
                      {deal.title}
                    </h4>
                  </Link>

                  {/* Rating & Review Count */}
                  {deal.rating !== undefined && (
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center text-amber-400 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-2.5 w-2.5 sm:h-3 w-3 ${
                              i < Math.round(deal.rating) ? "fill-current" : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">
                        {deal.rating} <span className="text-muted-foreground/60">({deal.reviewCount})</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 mt-auto">
                    <span className="text-base font-black text-foreground">{formatPrice(deal.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(deal.oldPrice)}
                    </span>
                  </div>

                  <motion.a
                    href={deal.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-500 via-orange-500 to-rose-500 hover:from-accent-600 hover:to-rose-600 text-white font-bold text-xs py-2 w-full mt-2 shadow-sm border border-accent-400/20 transition-all duration-300 btn-shiny"
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 20px -4px rgba(249,115,22,0.3)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Buy on Amazon
                  </motion.a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
