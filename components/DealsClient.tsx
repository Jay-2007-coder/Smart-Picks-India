"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Clock, Zap, ArrowUp, ArrowDown, Share2, Award, User, Sparkles } from "lucide-react";

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
  }>;
}

export default function DealsClient({ curatedDeals }: DealsClientProps) {
  const { user } = useAuth() as any;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "community" ? "community" : "verified";
  
  const [activeTab, setActiveTab] = useState<"verified" | "community">(initialTab);
  const [communityDeals, setCommunityDeals] = useState<CommunityDeal[]>([]);
  const [communitySort, setCommunitySort] = useState<"hot" | "new">("hot");
  const [loadingDeals, setLoadingDeals] = useState<boolean>(false);

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
    <div className="mt-8 select-none">
      {/* Premium Tab Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4 mb-8">
        <div className="flex p-1 bg-muted rounded-2xl border border-border/50 max-w-max">
          <button
            onClick={() => setTabAndUrl("verified")}
            className={`px-5 py-2 text-xs font-black rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === "verified"
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${activeTab === "verified" ? "text-red-500 fill-red-500/20" : ""}`} />
            Verified Handpicked
          </button>
          <button
            onClick={() => setTabAndUrl("community")}
            className={`px-5 py-2 text-xs font-black rounded-xl transition-all duration-300 flex items-center gap-2 ${
              activeTab === "community"
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Community Shared
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "community" && (
            <select
              value={communitySort}
              onChange={(e) => setCommunitySort(e.target.value as "hot" | "new")}
              className="h-10 rounded-2xl border border-input/80 bg-background px-3 text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/20"
            >
              <option value="hot">🔥 Hot Score</option>
              <option value="new">🆕 Newly Posted</option>
            </select>
          )}

          <Link
            href="/submit-deal"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 px-5 text-xs font-bold text-white shadow-md hover:scale-103 hover:shadow-lg transition-all duration-300 border border-white/10"
          >
            <Share2 className="h-4 w-4 mr-2" /> Share a Deal
          </Link>
        </div>
      </div>

      {/* Verified Deals Panel */}
      {activeTab === "verified" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedDeals.map((deal) => {
            const discount = calculateDiscount(deal.price, deal.oldPrice);
            return (
              <div key={deal.slug} className="card overflow-hidden flex flex-col group border border-border/80 bg-card rounded-3xl shadow-sm hover:shadow-md hover:border-border transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="badge bg-red-600 text-white font-black px-3 py-1 rounded-full text-xs shadow-sm">
                      {discount}% OFF
                    </span>
                    <span className="badge bg-amber-500 text-black font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-sm">
                      {deal.label}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2">
                    {deal.category}
                  </span>
                  <h3 className="font-bold text-foreground text-base mb-4 leading-snug line-clamp-2">
                    <Link href={`/product/${deal.slug}`} className="hover:text-red-500 transition-colors">
                      {deal.title}
                    </Link>
                  </h3>

                  <div className="flex items-baseline gap-2 mt-auto mb-4">
                    <span className="text-2xl font-black text-foreground">{formatPrice(deal.price)}</span>
                    <span className="text-sm font-semibold text-muted-foreground line-through">{formatPrice(deal.oldPrice)}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 px-3 py-2.5 rounded-2xl border border-amber-500/10">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 animate-pulse" /> Offer validity:
                    </span>
                    <span>{deal.expiresIn}</span>
                  </div>

                  <a
                    href={deal.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="btn-primary w-full text-xs py-3 rounded-2xl text-center font-bold"
                  >
                    Claim Deal Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Community Deals Panel */}
      {activeTab === "community" && (
        <div className="space-y-4">
          {loadingDeals ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500/20 border-t-red-600" />
            </div>
          ) : communityDeals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-3xl border border-dashed border-border/80 bg-card p-6 shadow-sm select-none">
              <Award className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-base font-bold text-foreground">No Community Shared Deals</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                Found a great budget discount online? Click &ldquo;Share a Deal&rdquo; above and help the community save money!
              </p>
            </div>
          ) : (
            communityDeals.map((deal) => {
              const discount = deal.oldPrice ? calculateDiscount(deal.price, deal.oldPrice) : null;
              const userId = user ? user.id || user._id : null;
              const hasUpvoted = userId ? deal.upvotes.includes(userId) : false;
              const hasDownvoted = userId ? deal.downvotes.includes(userId) : false;

              return (
                <div key={deal.id} className="relative overflow-hidden flex border border-border/80 bg-card rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-border transition-all duration-300 group">
                  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-red-500/5 blur-2xl pointer-events-none" />

                  {/* Upvote Downvote Side Column */}
                  <div className="flex flex-col items-center justify-center pr-5 border-r border-border/60">
                    <button
                      onClick={() => handleVote(deal.id, "upvote")}
                      className={`p-2 rounded-xl transition-all duration-200 ${
                        hasUpvoted
                          ? "text-emerald-600 bg-emerald-500/10 shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      title="Upvote deal"
                    >
                      <ArrowUp className="h-5 w-5 hover:scale-110 active:scale-90 transition-transform" />
                    </button>
                    <span className="my-2 text-sm font-black text-foreground">{deal.upvotesCount - deal.downvotesCount}</span>
                    <button
                      onClick={() => handleVote(deal.id, "downvote")}
                      className={`p-2 rounded-xl transition-all duration-200 ${
                        hasDownvoted
                          ? "text-red-600 bg-red-500/10 shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      title="Downvote deal"
                    >
                      <ArrowDown className="h-5 w-5 hover:scale-110 active:scale-90 transition-transform" />
                    </button>
                  </div>

                  {/* Card Content details */}
                  <div className="flex flex-col md:flex-row flex-1 pl-5 gap-5 items-center">
                    {/* Compact Image */}
                    <div className="relative w-32 h-24 shrink-0 overflow-hidden rounded-2xl bg-muted border border-border/50 shadow-inner">
                      <Image
                        src={deal.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80"}
                        alt={deal.title}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>

                    {/* Main metadata descriptions */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-500/5 px-2.5 py-1 rounded-lg">
                          {deal.category}
                        </span>
                        {discount && (
                          <span className="text-[9px] font-black text-white bg-red-600 px-2.5 py-1 rounded-lg">
                            {discount}% OFF
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          {deal.submittedBy?.profileImage ? (
                            <img src={deal.submittedBy.profileImage} alt="" className="h-4.5 w-4.5 rounded-full object-cover" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-muted-foreground/80" />
                          )}
                          Shared by {deal.submittedBy?.name || "Member"}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-foreground text-base leading-snug hover:text-red-500 transition-colors truncate max-w-xl" title={deal.title}>
                        <a href={deal.url} target="_blank" rel="noopener noreferrer nofollow">
                          {deal.title}
                        </a>
                      </h3>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-black text-foreground">{formatPrice(deal.price)}</span>
                        {deal.oldPrice && (
                          <span className="text-xs font-semibold text-muted-foreground line-through">{formatPrice(deal.oldPrice)}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="w-full md:w-auto shrink-0 text-right">
                      <a
                        href={deal.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 px-6 text-xs font-bold text-white hover:shadow-md transition-all duration-300 w-full md:w-auto"
                      >
                        Claim Deal
                      </a>
                    </div>
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
