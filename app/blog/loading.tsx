"use client";

import { BlogCardSkeleton, SkeletonGrid } from "@/components/Skeletons";

export default function BlogLoading() {
  return (
    <div className="container-custom py-12 space-y-12">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="skeleton h-10 w-64 rounded-xl mx-auto" />
        <div className="skeleton h-4 w-96 rounded mx-auto" />
      </div>

      {/* Categories skeleton */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-border/60 pb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-8 w-20 rounded-xl" />
        ))}
      </div>

      {/* Grid skeleton */}
      <SkeletonGrid count={6} skeleton={BlogCardSkeleton} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" />
    </div>
  );
}
