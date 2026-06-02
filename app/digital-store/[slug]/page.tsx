"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Download, Star, Sparkles, AlertCircle, Bookmark, CheckCircle2, ShoppingCart, HelpCircle } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  type: "free" | "paid" | "freemium";
  imageUrl: string;
  downloadCount: number;
  downloadLimit: number;
  averageRating: number;
  ratings: Array<{
    userId: string;
    userName: string;
    rating: number;
    review: string;
    createdAt: string;
  }>;
}

export default function DigitalProductDetail() {
  const { slug } = useParams() as any;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  
  // Review Form States
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchProductDetails() {
      if (authLoading) return;
      try {
        const headers: HeadersInit = {};
        if (user && (user as any).id) {
          headers["x-user-id"] = (user as any).id;
        }

        const response = await fetch(`/api/v1/digital-store/product/${slug}`, {
          headers,
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setProduct(data.product);
          setHasAccess(data.hasAccess);
          setIsBookmarked(data.isBookmarked);
          setPurchase(data.purchase);
        } else {
          router.push("/digital-store");
        }
      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [slug, user, authLoading, router]);

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch(`/api/v1/digital-store/favorite/${product?._id}`, {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsBookmarked(data.isBookmarked);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  const handleDownload = async () => {
    if (!product) return;
    setDownloading(true);

    try {
      let downloadUrl = "";
      if (product.type === "free") {
        downloadUrl = `/api/v1/digital-store/download-free/${product._id}`;
      } else if (purchase && purchase.secureToken) {
        downloadUrl = `/api/v1/digital-store/download/${purchase.secureToken}`;
      }

      if (downloadUrl) {
        // Trigger browser file download directly
        window.location.href = downloadUrl;
      }
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      // Keep loading spinner showing briefly
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    
    setReviewLoading(true);
    setReviewStatus(null);

    try {
      const response = await fetch(`/api/v1/digital-store/product/${product._id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: ratingInput,
          review: reviewInput,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setReviewStatus({ type: "success", message: "Thank you! Your review has been saved." });
        setReviewInput("");
        
        // Refresh product details to show new review
        setProduct((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            averageRating: data.averageRating,
            ratings: data.ratings,
          };
        });
      } else {
        setReviewStatus({ type: "error", message: data.message || "Failed to submit review." });
      }
    } catch (err) {
      setReviewStatus({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Loading resource details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12">
      <div className="container-custom max-w-6xl">
        {/* Back Link */}
        <Link
          href="/digital-store"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        {/* Content Columns */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Product Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-brand-50 text-brand-600 dark:bg-brand-950/40 uppercase tracking-widest">
                  {product.category}
                </span>
                <button
                  onClick={handleToggleFavorite}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                    isBookmarked
                      ? "border-rose-200 bg-rose-50 text-rose-500 dark:bg-rose-950/20"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                  title={isBookmarked ? "Remove Bookmark" : "Bookmark Resource"}
                >
                  <Bookmark className={`h-4.5 w-4.5 ${isBookmarked ? "fill-rose-500" : ""}`} />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-snug">
                {product.title}
              </h1>

              {/* Stats row */}
              <div className="flex items-center gap-6 border-y border-border/50 py-4 text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Star className="h-4.5 w-4.5 fill-amber-500" />
                  {product.averageRating > 0 ? `${product.averageRating.toFixed(1)} Rating` : "No Ratings"}
                </span>
                <span>•</span>
                <span>{product.downloadCount.toLocaleString("en-IN")} Downloads</span>
              </div>

              {/* Cover Image Banner */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/80 bg-muted select-none">
                <img src={product.imageUrl} alt={product.title} className="object-cover w-full h-full" />
              </div>
            </div>

            {/* Tab navigation */}
            <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm flex gap-2">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 h-10 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === "details"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Resource details
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 h-10 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === "reviews"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Reviews ({product.ratings.length})
              </button>
            </div>

            {/* Tab: Details */}
            {activeTab === "details" && (
              <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-base font-black text-foreground">About this Resource</h3>
                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>

                {product.type === "freemium" && (
                  <div className="rounded-2xl border border-dashed border-brand-500/30 bg-brand-600/5 p-5">
                    <h4 className="font-extrabold text-brand-600 text-sm mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Freemium Preview Available
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This is a premium resource. You can download the preview chapters/modules for free or purchase the full guide to get complete unlimited access to all assets.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === "reviews" && (
              <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                {/* Form to submit review */}
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4 border-b border-border/50 pb-8">
                    <h3 className="font-bold text-sm text-foreground">Leave a review</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            className="text-amber-500 hover:scale-110 transition-transform"
                          >
                            <Star className={`h-5 w-5 ${ratingInput >= star ? "fill-amber-500" : ""}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Your Feedback
                      </label>
                      <textarea
                        value={reviewInput}
                        onChange={(e) => setReviewInput(e.target.value)}
                        placeholder="Write your review here..."
                        className="w-full h-24 bg-muted/40 border border-input rounded-2xl p-4 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500/30 focus-visible:border-brand-500/40"
                        required
                      />
                    </div>

                    {reviewStatus && (
                      <div
                        className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs border ${
                          reviewStatus.type === "success"
                            ? "border-emerald-100 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400"
                            : "border-destructive/10 bg-destructive/5 text-destructive"
                        }`}
                      >
                        {reviewStatus.type === "success" ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                        )}
                        <span className="font-semibold leading-relaxed">{reviewStatus.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-6 text-xs font-bold text-white hover:bg-brand-700 transition-all"
                    >
                      {reviewLoading ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center p-4 border border-dashed border-border/80 rounded-2xl bg-card">
                    <p className="text-xs text-muted-foreground mb-3">Please sign in to write a review.</p>
                    <Link href="/login" className="btn-secondary text-xs h-9 px-4">
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  <h3 className="text-base font-black text-foreground">Customer Reviews</h3>
                  {product.ratings.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                      No reviews submitted yet. Be the first to share your experience!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {product.ratings.map((review, idx) => (
                        <div key={idx} className="border-b border-border/50 pb-4 last:border-0 last:pb-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-extrabold text-foreground text-xs">{review.userName}</h5>
                            <span className="text-[10px] text-muted-foreground font-bold">
                              {new Date(review.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar CTA Purchase Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border/85 rounded-3xl p-6 shadow-md space-y-6 sticky top-24">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  RESOURCE COST
                </span>
                {product.price === 0 || product.type === "free" ? (
                  <h2 className="text-2xl font-black text-emerald-600 uppercase flex items-center gap-1.5">
                    FREE
                  </h2>
                ) : (
                  <h2 className="text-3xl font-black text-foreground">
                    ₹{product.price.toLocaleString("en-IN")}
                  </h2>
                )}
              </div>

              {/* Actions Section */}
              {!user ? (
                <div className="space-y-3">
                  <Link
                    href={`/login?redirect=/digital-store/${product.slug}`}
                    className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-rose-600 text-xs font-bold text-white hover:shadow-md transition-all active:scale-97"
                  >
                    Sign in to Download
                  </Link>
                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    A free user account is required to download or purchase study resources securely.
                  </p>
                </div>
              ) : hasAccess ? (
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-xs font-bold text-white hover:shadow-md transition-all active:scale-97 disabled:opacity-50"
                  >
                    <Download className="h-4.5 w-4.5" />
                    {downloading ? "Starting Download..." : "Download File"}
                  </button>
                  {purchase && (
                    <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 text-[10px] text-emerald-800 dark:bg-emerald-950/15 dark:border-emerald-950/20 dark:text-emerald-400 font-medium">
                      <p className="font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Purchase Confirmed
                      </p>
                      <p className="mt-1 leading-relaxed">
                        You have lifetime access. Downloads registered: <strong>{purchase.downloadCount}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href={`/digital-store/checkout/${product.slug}`}
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-600 text-xs font-bold text-white hover:shadow-md transition-all active:scale-97"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" /> Purchase Access
                  </Link>
                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    Secure checkout powered by Razorpay. Includes instant PDF/ZIP file download and email receipt confirmation.
                  </p>
                </div>
              )}

              {/* Resource specs checklist */}
              <div className="border-t border-border/50 pt-5 space-y-3 text-xs font-bold text-muted-foreground">
                <div className="flex justify-between">
                  <span>Resource Type:</span>
                  <span className="text-foreground capitalize">{product.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-foreground capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>File Format:</span>
                  <span className="text-foreground">PDF / ZIP</span>
                </div>
                {product.type !== "free" && (
                  <div className="flex justify-between">
                    <span>Download Limit:</span>
                    <span className="text-foreground">
                      {product.downloadLimit > 0 ? `${product.downloadLimit} times` : "Unlimited"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
