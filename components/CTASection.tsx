"use client";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CTASectionProps {
  affiliateLink: string;
  title: string;
  price: number;
  oldPrice?: number;
}

export default function CTASection({ affiliateLink, title, price, oldPrice }: CTASectionProps) {
  return (
    <div className="rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950 dark:to-card p-6">
      <p className="text-sm text-muted-foreground mb-1">Best price on Amazon India</p>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-3xl font-bold text-foreground">{formatPrice(price)}</span>
        {oldPrice && oldPrice > price && (
          <span className="text-lg text-muted-foreground line-through">{formatPrice(oldPrice)}</span>
        )}
      </div>
      <a
        href={affiliateLink}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="btn-primary w-full justify-center text-base py-4 bg-amber-500 hover:bg-amber-600 mb-3"
        id={`cta-buy-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <ShoppingCart className="h-5 w-5" />
        Buy on Amazon India
      </a>
      <a
        href={affiliateLink}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-brand-600 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        View on Amazon.in
      </a>
      <p className="text-xs text-center text-muted-foreground mt-3">
        ✓ Free delivery on eligible orders &nbsp;✓ Easy returns
      </p>
    </div>
  );
}
