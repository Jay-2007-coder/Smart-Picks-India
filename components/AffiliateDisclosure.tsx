import { Info } from "lucide-react";

export default function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/30 border border-border/40 px-3.5 py-2.5 rounded-xl">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-brand-500" />
        <p className="leading-relaxed font-semibold">
          This page contains affiliate links. We earn a small commission if you buy through our links, at no extra cost to you.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 dark:border-amber-500/35 bg-gradient-to-br from-amber-500/5 via-orange-500/2 to-amber-500/5 p-5 flex gap-4 shadow-sm hover:shadow-md transition-all duration-350 group"
      id="affiliate-disclosure"
    >
      {/* Decorative background circle */}
      <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-300" />
      
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm shrink-0">
        <Info className="h-5 w-5" />
      </div>
      
      <div className="space-y-1.5 z-10 relative">
        <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
          Affiliate Disclosure
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-semibold">
          Smart Picks India participates in the Amazon Associates Programme. When you click our links and make a purchase,
          we earn a small commission at <span className="text-amber-700 dark:text-amber-400 font-extrabold underline decoration-amber-500/35 decoration-2 underline-offset-2">no extra cost to you</span>. This helps us keep the site running and the reviews honest.
          We only recommend products we genuinely believe in.
        </p>
      </div>
    </div>
  );
}
