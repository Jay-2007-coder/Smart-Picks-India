import { Info } from "lucide-react";

export default function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand-500" />
        This page contains affiliate links. We earn a small commission if you buy through our links, at no extra cost to you.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 flex gap-3" id="affiliate-disclosure">
      <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Affiliate Disclosure</p>
        <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          Smart Picks India participates in the Amazon Associates Programme. When you click our links and make a purchase,
          we earn a small commission at <strong>no extra cost to you</strong>. This helps us keep the site running and the reviews honest.
          We only recommend products we genuinely believe in.
        </p>
      </div>
    </div>
  );
}
