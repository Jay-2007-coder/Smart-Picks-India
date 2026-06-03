"use client";

import { motion } from "framer-motion";

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden flex flex-col h-full bg-card border border-border">
      <div className="skeleton aspect-square w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category */}
          <div className="skeleton h-3 w-16 rounded-full" />
          {/* Title */}
          <div className="space-y-1.5">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Rating / Review count */}
          <div className="flex items-center gap-2">
            <div className="skeleton h-3 w-12 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <div className="skeleton h-6 w-16 rounded" />
            <div className="skeleton h-4 w-12 rounded" />
          </div>
          {/* Button */}
          <div className="skeleton h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="card overflow-hidden flex flex-col h-full bg-card border border-border">
      <div className="skeleton aspect-video w-full" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Date */}
          <div className="flex items-center justify-between">
            <div className="skeleton h-3 w-16 rounded-full" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          {/* Title */}
          <div className="space-y-1.5">
            <div className="skeleton h-5 w-full rounded-lg" />
            <div className="skeleton h-5 w-5/6 rounded-lg" />
          </div>
          {/* Excerpt */}
          <div className="space-y-1.5 pt-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-11/12 rounded" />
          </div>
        </div>
        {/* Read time and link */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="skeleton h-3.5 w-16 rounded" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DigitalProductSkeleton() {
  return (
    <div className="card overflow-hidden flex flex-col h-full bg-card border border-border">
      {/* Thumbnail */}
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Tags */}
          <div className="flex gap-1">
            <div className="skeleton h-3.5 w-12 rounded-full" />
            <div className="skeleton h-3.5 w-16 rounded-full" />
          </div>
          {/* Title */}
          <div className="space-y-1.5">
            <div className="skeleton h-4.5 w-full rounded" />
            <div className="skeleton h-4.5 w-2/3 rounded" />
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
          {/* Price & stats */}
          <div className="flex justify-between items-center">
            <div className="skeleton h-5 w-14 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <div className="skeleton h-9 rounded-lg" />
            <div className="skeleton h-9 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentToolSkeleton() {
  return (
    <div className="card p-6 bg-card border border-border flex flex-col justify-between h-full space-y-4">
      <div className="space-y-3">
        {/* Icon box and heading */}
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-5 w-32 rounded" />
        </div>
        {/* Description lines */}
        <div className="space-y-2 pt-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-11/12 rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
        </div>
      </div>
      {/* Footer / CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function CommunityDealSkeleton() {
  return (
    <div className="flex border border-border/85 bg-card rounded-3xl p-5 shadow-sm space-x-4 items-center">
      {/* Upvote placeholder */}
      <div className="flex flex-col items-center justify-center pr-5 border-r border-border/60 gap-1 shrink-0">
        <div className="skeleton h-6 w-6 rounded-lg" />
        <div className="skeleton h-4 w-4 rounded" />
        <div className="skeleton h-6 w-6 rounded-lg" />
      </div>
      {/* Product Image placeholder */}
      <div className="skeleton w-32 h-24 rounded-2xl shrink-0" />
      {/* Details placeholder */}
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="skeleton h-3.5 w-12 rounded-full" />
          <div className="skeleton h-3.5 w-16 rounded-full" />
          <div className="skeleton h-3.5 w-24 rounded-full" />
        </div>
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
      {/* Button placeholder */}
      <div className="skeleton h-9 w-24 rounded-xl shrink-0 hidden md:block" />
    </div>
  );
}

export function SkeletonGrid({
  count = 4,
  skeleton: Skeleton,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
}: {
  count?: number;
  skeleton: React.ComponentType;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        >
          <Skeleton />
        </motion.div>
      ))}
    </div>
  );
}
