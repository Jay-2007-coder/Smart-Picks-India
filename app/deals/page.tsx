import React, { Suspense } from "react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Zap, Loader2 } from "lucide-react";
import { products } from "@/data/products";
import DealsClient from "@/components/DealsClient";

export const metadata = generateSEOMetadata({
  title: "Today's Best Amazon Deals & Offers",
  description: "Get the latest flash sales, discounts, and lightning deals on Amazon India. Handpicked budget deals updated daily.",
  canonical: "https://smart-picks-india.vercel.app/deals",
});

export default function DealsPage() {
  const curatedDeals = [...products].reverse()
    .filter((p) => p.oldPrice > p.price)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      image: p.image,
      price: p.price,
      oldPrice: p.oldPrice,
      category: p.category,
      affiliateLink: p.affiliateLink,
      label: p.dealOfTheDay ? "Deal of the Day" : p.featured ? "Featured" : "Hot Deal",
      expiresIn: "Ending soon",
      rating: p.rating,
    }));

  return (
    <div className="container-custom pt-8 pb-24">
      <Breadcrumbs items={[{ label: "Deals" }]} />

      {/* Header */}
      <div className="mt-8 mb-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          <Zap className="h-3.5 w-3.5 text-brand-600" />
          Verified Amazon India Price Drop Tracker
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
          Today&apos;s Best Deals
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Handpicked discounts and community-submitted deals verified daily. Click any deal to check live prices on Amazon.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <DealsClient curatedDeals={curatedDeals} />
      </Suspense>
    </div>
  );
}
