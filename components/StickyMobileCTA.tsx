"use client";

import { ShoppingCart, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StickyMobileCTAProps {
  affiliateLink: string;
  title: string;
  price: number;
  oldPrice?: number;
}

export default function StickyMobileCTA({ affiliateLink, title, price, oldPrice }: StickyMobileCTAProps) {
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/80 p-3 px-4 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] transition-all">
      <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-foreground truncate">{title}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-foreground">{formatPrice(price)}</span>
            {oldPrice && oldPrice > price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(oldPrice)}</span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs shadow-md shrink-0 transition-transform"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Buy Now</span>
          <ExternalLink className="h-3 w-3 opacity-75" />
        </a>
      </div>
    </div>
  );
}
