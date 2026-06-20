"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight, ShoppingCart, Star } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimatedSectionHeader from "@/components/AnimatedSectionHeader";
import FlashDealTimer from "@/components/FlashDealTimer";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import Interactive3DCard from "@/components/Interactive3DCard";

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

function FlashDealCard({ deal, idx, discount }: { deal: FlashProduct; idx: number; discount: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const yImage = useTransform(scrollYProgress, [0, 1], [-15, 15]);
  const yBadge = useTransform(scrollYProgress, [0, 1], [-25, 25]);
  const yGlow = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: 20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (idx % 4) * 0.1, ease: "easeOut" }}
      className="w-full h-full flex"
      style={{ transformStyle: "preserve-3d", perspective: 1200 }}
    >
      <Interactive3DCard className="w-full h-full rounded-2xl">
        <div className="rounded-2xl border border-border/80 dark:border-border/30 bg-card flex flex-col overflow-hidden h-full w-full relative transition-colors duration-300">
          {/* Background Parallax Glow */}
          <motion.div
            style={{ y: yGlow }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.06),transparent_70%)] pointer-events-none"
          />

          {/* Glowing subtle top border for flash deal */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 to-rose-500 z-10" />

          {/* Card Image Wrapper */}
          <div className="relative aspect-square overflow-hidden bg-muted card-3d-image-container" style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              style={{ y: yImage, transformStyle: "preserve-3d" }}
              className="w-full h-full relative"
            >
              <div className="animate-float-subtle w-full h-full relative" style={{ transformStyle: "preserve-3d" }}>
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
            <motion.span
              style={{ y: yBadge }}
              className="absolute top-3 left-3 badge bg-rose-600 text-white font-black text-[10px] shadow z-10"
            >
              -{discount}% OFF
            </motion.span>
          </div>

          {/* Card Details */}
          <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1 relative z-10">
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

            <a
              href={deal.affiliateLink}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-500 via-orange-500 to-rose-500 hover:from-accent-600 hover:to-rose-600 text-white font-bold text-xs py-2.5 w-full mt-2 border border-accent-400/20 btn-amazon-3d cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Buy on Amazon
            </a>
          </div>
        </div>
      </Interactive3DCard>
    </motion.div>
  );
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
          {deals.map((deal, idx) => {
            const discount = calculateDiscount(deal.price, deal.oldPrice);
            return (
              <FlashDealCard key={deal.slug} deal={deal} idx={idx} discount={discount} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
