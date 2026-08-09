"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Clock, Zap, ArrowUp, ArrowDown, Share2, Award, User, Sparkles, ExternalLink, BarChart2 } from "lucide-react";
import { CommunityDealSkeleton, SkeletonGrid } from "@/components/Skeletons";
import { cn } from "@/lib/utils";

interface CommunityDeal {
  id: string;
  title: string;
  category: string;
  url: string;
  price: number;
  oldPrice: number | null;
  image: string;
  submittedBy: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  upvotesCount: number;
  downvotesCount: number;
  upvotes: string[];
  downvotes: string[];
  score: number;
  createdAt: string;
}

interface DealsClientProps {
  curatedDeals: Array<{
    slug: string;
    title: string;
    image: string;
    price: number;
    oldPrice: number;
    category: string;
    affiliateLink: string;
    label: string;
    expiresIn: string;
    rating: number;
  }>;
}

const CATEGORIES = ["All", "Tech", "Kitchen", "Home", "Gadgets", "Fashion", "Study"];

export default function DealsClient({ curatedDeals }: DealsClientProps) {
  const { user } = useAuth() as any;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "community" ? "community" : "verified";
  
  const [activeTab, setActiveTab] = useState<"verified" | "community">(initialTab);
  const [communityDeals, setCommunityDeals] = useState<CommunityDeal[]>([]);
  const [communitySort, setCommunitySort] = useState<"hot" | "new">("hot");
  const [loadingDeals, setLoadingDeals] = useState<boolean>(false);

  // Client-side filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDiscount, setSelectedDiscount] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("highest-discount");

  const filteredCuratedDeals = useMemo(() => {
    let result = curatedDeals.map(d => ({
      ...d,
      discount: calculateDiscount(d.price, d.oldPrice)
    }));

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter(d => d.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Discount
    if (selectedDiscount !== "all") {
      const minDiscount = parseInt(selectedDiscount);
      if (!isNaN(minDiscount)) {
        result = result.filter(d => d.discount >= minDiscount);
      }
    }

    // Sort
    if (selectedSort === "highest-discount") {
      result.sort((a, b) => b.discount - a.discount);
    } else if (selectedSort === "lowest-price") {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "highest-rated") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [curatedDeals, selectedCategory, selectedDiscount, selectedSort]);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "community" || tab === "verified") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "community") {
      fetchCommunityDeals();
    }
  }, [activeTab, communitySort]);

  const fetchCommunityDeals = async () => {
    setLoadingDeals(true);
    try {
      const response = await fetch(`/api/v1/deals?sort=${communitySort}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setCommunityDeals(data.deals);
      }
    } catch (err) {
      console.error("Error fetching community deals:", err);
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleVote = async (dealId: string, action: "upvote" | "downvote") => {
    if (!user) {
      router.push(`/login?redirect=/deals?tab=community`);
      return;
    }

    try {
      const response = await fetch(`/api/v1/deals/${dealId}/${action}`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setCommunityDeals((prevDeals) =>
          prevDeals.map((d) => {
            if (d.id === dealId) {
              let updatedUpvotes = [...d.upvotes];
              let updatedDownvotes = [...d.downvotes];
              const userId = user.id || user._id;

              if (action === "upvote") {
                if (updatedUpvotes.includes(userId)) {
                  updatedUpvotes = updatedUpvotes.filter((id) => id !== userId);
                } else {
                  updatedUpvotes.push(userId);
                  updatedDownvotes = updatedDownvotes.filter((id) => id !== userId);
                }
              } else {
                if (updatedDownvotes.includes(userId)) {
                  updatedDownvotes = updatedDownvotes.filter((id) => id !== userId);
                } else {
                  updatedDownvotes.push(userId);
                  updatedUpvotes = updatedUpvotes.filter((id) => id !== userId);
                }
              }

              return {
                ...d,
                upvotes: updatedUpvotes,
                downvotes: updatedDownvotes,
                upvotesCount: updatedUpvotes.length,
                downvotesCount: updatedDownvotes.length,
                score: updatedUpvotes.length - updatedDownvotes.length,
              };
            }
            return d;
          })
        );
      }
    } catch (err) {
      console.error(`Failed to trigger ${action}:`, err);
    }
  };

  const setTabAndUrl = (tab: "verified" | "community") => {
    setActiveTab(tab);
    router.replace(`/deals?tab=${tab}`);
  };

  return (
    <div className="mt-8">
      {/* ── Clean Vercel-style Tab Bar & Actions ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 mb-8">
        <div className="inline-flex p-1 bg-muted rounded-lg border border-border self-start">
          <button
            onClick={() => setTabAndUrl("verified")}
            className={cn(
              "px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer",
              activeTab === "verified"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            Verified Handpicked
          </button>
          <button
            onClick={() => setTabAndUrl("community")}
            className={cn(
              "px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-2 cursor-pointer",
              activeTab === "community"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Community Shared
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "community" && (
            <select
              value={communitySort}
              onChange={(e) => setCommunitySort(e.target.value as "hot" | "new")}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="hot">Hot Score</option>
              <option value="new">Newly Posted</option>
            </select>
          )}

          <Link href="/submit-deal" className="btn-primary btn-sm">
            <Share2 className="h-3.5 w-3.5" />
            Share a deal
          </Link>
        </div>
      </div>

      {/* ── Verified Deals Panel ───────────────────────────────────────────── */}
      {activeTab === "verified" && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border p-4 rounded-xl">
            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-medium text-muted-foreground mr-1.5">Category:</span>
              {CATEGORIES.map((cat) => {
                const catId = cat.toLowerCase();
                const isActive = selectedCategory === catId;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(catId)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border",
                      isActive
                        ? "bg-[#111827] text-white border-[#111827] dark:bg-white dark:text-gray-900 dark:border-white"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Discount Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Discount:</span>
                <select
                  value={selectedDiscount}
                  onChange={(e) => setSelectedDiscount(e.target.value)}
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All Discounts</option>
                  <option value="20">20%+ off</option>
                  <option value="40">40%+ off</option>
                  <option value="50">50%+ off</option>
                </select>
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Sort By:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="highest-discount">Highest Discount</option>
                  <option value="lowest-price">Lowest Price</option>
                  <option value="highest-rated">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {filteredCuratedDeals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-xl border border-dashed border-border bg-card p-6">
              <p className="text-sm font-semibold text-foreground">No matching verified deals</p>
              <p className="text-xs text-muted-foreground mt-1">Try clearing or broadening your category or discount filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCuratedDeals.map((deal) => {
                const discount = deal.discount;
                return (
                  <article
                    key={deal.slug}
                    className="group card-hover flex flex-col overflow-hidden select-none"
                  >
                    <div className="relative aspect-square bg-white dark:bg-white/[0.03] border-b border-border overflow-hidden flex items-center justify-center">
                      <Image
                        src={deal.image}
                        alt={deal.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                        <span className="badge-brand text-[10px]">
                          -{discount}%
                        </span>
                        {deal.label && (
                          <span className="badge-warning text-[10px]">
                            {deal.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <span className="section-label text-[10px]">
                        {deal.category}
                      </span>
                      <Link href={`/product/${deal.slug}`}>
                        <h3 className="text-xs font-medium text-foreground leading-snug line-clamp-2 hover:text-brand-600 transition-colors">
                          {deal.title}
                        </h3>
                      </Link>

                      <div className="flex items-baseline gap-2 mt-auto pt-1">
                        <span className="text-base font-bold text-foreground">{formatPrice(deal.price)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(deal.oldPrice)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Validity:
                        </span>
                        <span className="font-medium text-foreground">{deal.expiresIn}</span>
                      </div>

                      <a
                        href={deal.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="btn-primary btn-sm w-full justify-center mt-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Buy on Amazon
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Community Deals Panel ──────────────────────────────────────────── */}
      {activeTab === "community" && (
        <div className="space-y-3">
          {loadingDeals ? (
            <SkeletonGrid count={3} skeleton={CommunityDealSkeleton} className="flex flex-col gap-3" />
          ) : communityDeals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-xl border border-dashed border-border bg-card p-6">
              <Award className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground">No Community Shared Deals</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                Found a great budget deal online? Click &ldquo;Share a deal&rdquo; above to share it with the community!
              </p>
            </div>
          ) : (
            communityDeals.map((deal) => {
              const discount = deal.oldPrice ? calculateDiscount(deal.price, deal.oldPrice) : null;
              const userId = user ? user.id || user._id : null;
              const hasUpvoted = userId ? deal.upvotes.includes(userId) : false;
              const hasDownvoted = userId ? deal.downvotes.includes(userId) : false;

              return (
                <div
                  key={deal.id}
                  className="card-hover flex flex-col sm:flex-row p-4 gap-4 items-start sm:items-center"
                >
                  {/* Upvote / Downvote column */}
                  <div className="flex sm:flex-col items-center justify-center shrink-0 gap-1 bg-muted/50 p-1.5 rounded-lg border border-border">
                    <button
                      onClick={() => handleVote(deal.id, "upvote")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors cursor-pointer",
                        hasUpvoted
                          ? "text-green-600 bg-green-50 dark:bg-green-950/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      aria-label="Upvote deal"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-semibold text-foreground px-1">
                      {deal.upvotesCount - deal.downvotesCount}
                    </span>
                    <button
                      onClick={() => handleVote(deal.id, "downvote")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors cursor-pointer",
                        hasDownvoted
                          ? "text-red-600 bg-red-50 dark:bg-red-950/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      aria-label="Downvote deal"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-24 h-20 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                    <Image
                      src={deal.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80"}
                      alt={deal.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="section-label text-[10px]">
                        {deal.category}
                      </span>
                      {discount && (
                        <span className="badge-brand text-[10px]">
                          -{discount}%
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                        {deal.submittedBy?.profileImage ? (
                          <img src={deal.submittedBy.profileImage} alt="" className="h-4 w-4 rounded-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        Shared by {deal.submittedBy?.name || "Member"}
                      </span>
                    </div>

                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-sm font-medium text-foreground hover:text-brand-600 transition-colors line-clamp-1"
                    >
                      {deal.title}
                    </a>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-bold text-foreground">{formatPrice(deal.price)}</span>
                      {deal.oldPrice && (
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(deal.oldPrice)}</span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 w-full sm:w-auto">
                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="btn-primary btn-sm w-full sm:w-auto justify-center"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Claim deal
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
