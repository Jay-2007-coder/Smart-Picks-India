import { Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealBadgeProps {
  discount: number;
  label?: string;
  className?: string;
}

export default function DealBadge({ discount, label, className }: DealBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-brand-600 text-white text-xs font-bold px-2.5 py-1", className)}>
      <Percent className="h-3 w-3" />
      {label || `${discount}% OFF`}
    </span>
  );
}
