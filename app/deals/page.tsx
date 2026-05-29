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
      label: "🔥 Hot Deal",
      expiresIn: "Ending soon",
    }));

  return (
    <div className="container-custom py-8">
      <Breadcrumbs items={[{ label: "Deals" }]} />

      <div className="mt-8 mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-4">
          <Zap className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
          Today&apos;s Best Deals
        </h1>
        <p className="text-lg text-muted-foreground">
          Handpicked lightning deals and discounts from Amazon India. Grab them before they expire!
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        }
      >
        <DealsClient curatedDeals={curatedDeals} />
      </Suspense>
    </div>
  );
}
