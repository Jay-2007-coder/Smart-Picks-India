"use client";

/**
 * ProductLazyWidgets — Client Component wrapper
 *
 * `dynamic()` with `ssr: false` is only allowed inside Client Components
 * in Next.js 13+. This wrapper hoists both lazy-loaded widgets out of the
 * Server Component (app/product/[slug]/page.tsx) so the build succeeds.
 */

import dynamic from "next/dynamic";

const PriceHistoryChart = dynamic(
  () => import("@/components/PriceHistoryChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-full animate-pulse rounded-xl bg-muted border border-border" />
    ),
  }
);

const PriceAlertTracker = dynamic(
  () => import("@/components/PriceAlertTracker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-24 w-full animate-pulse rounded-xl bg-muted border border-border" />
    ),
  }
);

interface Props {
  slug:         string;
  currentPrice: number;
}

export default function ProductLazyWidgets({ slug, currentPrice }: Props) {
  return (
    <>
      <PriceHistoryChart slug={slug} currentPrice={currentPrice} />
      <PriceAlertTracker slug={slug} currentPrice={currentPrice} />
    </>
  );
}
