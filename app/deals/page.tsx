import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
import { Clock, Zap } from "lucide-react";
import { products } from "@/data/products";
import { formatPrice, calculateDiscount } from "@/lib/utils";

export const metadata = generateSEOMetadata({
  title: "Today's Best Amazon Deals & Offers",
  description: "Get the latest flash sales, discounts, and lightning deals on Amazon India. Handpicked budget deals updated daily.",
  canonical: "https://smart-picks-india.vercel.app/deals",
});

export default function DealsPage() {
  const dynamicDeals = products
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dynamicDeals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No flash deals available right now. Check back later!
          </div>
        ) : (
          dynamicDeals.map((deal) => {
          const discount = calculateDiscount(deal.price, deal.oldPrice);
          return (
            <div key={deal.slug} className="card overflow-hidden flex flex-col group">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="badge bg-brand-600 text-white font-bold px-3 py-1 text-sm">
                    {discount}% OFF
                  </span>
                  <span className="badge bg-accent-500 text-white">
                    {deal.label}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">
                  {deal.category}
                </span>
                <h3 className="font-semibold text-foreground text-lg mb-4 line-clamp-2">
                  {deal.title}
                </h3>
                
                <div className="flex items-baseline gap-3 mt-auto mb-4">
                  <span className="text-3xl font-bold text-foreground">{formatPrice(deal.price)}</span>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(deal.oldPrice)}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4 text-sm font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 p-2.5 rounded-lg border border-accent-100 dark:border-accent-900/50">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Ends in:
                  </span>
                  <span>{deal.expiresIn}</span>
                </div>

                <a
                  href={deal.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-primary w-full"
                >
                  Claim Deal Now
                </a>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
