import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function RatingStars({ rating, reviewCount, size = "md", className }: RatingStarsProps) {
  const sizeMap = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  const textMap = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={i} className={cn(sizeMap[size], "fill-amber-400 text-amber-400")} />
        ))}
        {hasHalf && <StarHalf className={cn(sizeMap[size], "fill-amber-400 text-amber-400")} />}
        {Array.from({ length: 5 - fullStars - (hasHalf ? 1 : 0) }).map((_, i) => (
          <Star key={i} className={cn(sizeMap[size], "text-muted-foreground/30")} />
        ))}
      </div>
      <span className={cn(textMap[size], "font-semibold text-foreground")}>{rating}</span>
      {reviewCount !== undefined && (
        <span className={cn(textMap[size], "text-muted-foreground")}>
          ({reviewCount.toLocaleString("en-IN")} reviews)
        </span>
      )}
    </div>
  );
}
