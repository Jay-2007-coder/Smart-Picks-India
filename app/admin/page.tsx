"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Loader2,
  RefreshCw,
  Users,
  Tag,
  Bell,
  LineChart,
  Grid,
  CheckCircle,
  Database,
  Shield,
  Activity,
  Layers,
  Send,
  ShoppingCart,
  DollarSign,
  Download,
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalDeals: number;
  activeAlerts: number;
  priceHistoryPoints: number;
  totalProductsCatalog: number;
  totalDigitalSales?: number;
  totalDownloads?: number;
  totalRevenue?: number;
  conversionRate?: number;
}

interface CategoryStat {
  name: string;
  value: number;
}

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  telegramChatId: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "blogs">("analytics");

  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [usersList, setUsersList] = useState<UserInfo[]>([]);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [broadcasting, setBroadcasting] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // ASIN Scraper State
  const [asin, setAsin] = useState<string>("");
  const [category, setCategory] = useState<string>("tech");
  const [scraping, setScraping] = useState<boolean>(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState<string | null>(null);
  const [scrapedProduct, setScrapedProduct] = useState<any | null>(null);

  // Blog Generator State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogCategory, setBlogCategory] = useState("tech");
  const [blogTags, setBlogTags] = useState("");
  const [blogReadTime, setBlogReadTime] = useState("5 min read");
  const [blogContent, setBlogContent] = useState("");
  const [blogFaqs, setBlogFaqs] = useState<{ question: string; answer: string }[]>([
    { question: "", answer: "" }
  ]);
  const [generatedBlogCode, setGeneratedBlogCode] = useState<string | null>(null);
  const [copiedBlogCode, setCopiedBlogCode] = useState(false);
  const [publishingBlog, setPublishingBlog] = useState(false);
  const [blogPublishError, setBlogPublishError] = useState<string | null>(null);
  const [blogPublishSuccess, setBlogPublishSuccess] = useState<string | null>(null);

  // Manual Product State
  const [manualTitle, setManualTitle] = useState("");
  const [manualAsin, setManualAsin] = useState("");
  const [manualCategory, setManualCategory] = useState("tech");
  const [manualPrice, setManualPrice] = useState("");
  const [manualOriginalPrice, setManualOriginalPrice] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualAffiliateLink, setManualAffiliateLink] = useState("");
  const [manualFeatures, setManualFeatures] = useState("");
  const [manualPros, setManualPros] = useState("");
  const [manualCons, setManualCons] = useState("");
  const [manualTelegramBroadcast, setManualTelegramBroadcast] = useState(true);
  const [publishingProduct, setPublishingProduct] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishedProduct, setPublishedProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/admin");
      return;
    }

    if (user && user.role === "admin") {
      fetchAdminData();
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const statsRes = await fetch("/api/v1/admin/stats");
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats);
        setCategories(statsData.categoryStats);
      }

      const usersRes = await fetch("/api/v1/admin/users");
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        setUsersList(usersData.users);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSyncPrices = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch("/api/v1/admin/sync", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSyncResult(`Sync complete! ${data.updatedCount} database prices checked & updated.`);
        fetchAdminData();
      } else {
        setSyncResult(data.message || "Price sync failed.");
      }
    } catch (err) {
      setSyncResult("Error triggering synchronization.");
    } finally {
      setSyncing(false);
    }
  };

  const handleBroadcastDeals = async () => {
    setBroadcasting(true);
    setSyncResult(null);
    try {
      const response = await fetch("/api/v1/admin/broadcast-deals", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSyncResult(data.message || "Broadcast sent to Telegram channel!");
      } else {
        setSyncResult(data.message || "Failed to broadcast deals.");
      }
    } catch (err) {
      setSyncResult("Error triggering channel broadcast.");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleScrapeProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin) return;

    setScraping(true);
    setScrapeError(null);
    setScrapeSuccess(null);
    setScrapedProduct(null);

    try {
      const response = await fetch("/api/v1/admin/scrape-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asin, category }),
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setScrapeSuccess(`Successfully published product! Telegram post: ${data.telegramSent ? "Sent ✅" : "Failed / Logged to console ❌"}`);
        setScrapedProduct(data.product);
        setAsin(""); // Clear form input
        fetchAdminData(); // Reload statistics
      } else {
        setScrapeError(data.message || "Failed to scrape product.");
      }
    } catch (err) {
      setScrapeError("An error occurred during product scraping.");
    } finally {
      setScraping(false);
    }
  };

  const handleAddFaq = () => {
    setBlogFaqs([...blogFaqs, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    setBlogFaqs(blogFaqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: "question" | "answer", val: string) => {
    const updated = [...blogFaqs];
    updated[index][field] = val;
    setBlogFaqs(updated);
  };

  const handleGenerateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) return;

    // Generate slug automatically
    const slug = blogTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Generate ToC dynamically from ## headers
    const lines = blogContent.split("\n");
    const toc: { id: string; title: string }[] = [];
    lines.forEach((line) => {
      if (line.startsWith("## ")) {
        const titleText = line.replace("## ", "").trim();
        const id = titleText
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        toc.push({ id, title: titleText });
      }
    });

    const cleanFaqs = blogFaqs.filter((f) => f.question.trim() && f.answer.trim());
    const tagsArray = blogTags.split(",").map((t) => t.trim()).filter(Boolean);
    const dateStr = new Date().toISOString().split("T")[0];

    const blogObj = {
      slug,
      title: blogTitle,
      excerpt: blogExcerpt,
      image: blogImage || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1000&q=80",
      category: blogCategory,
      tags: tagsArray,
      datePublished: dateStr,
      dateModified: dateStr,
      readTime: blogReadTime,
      featured: true,
      toc,
      content: blogContent,
      faqs: cleanFaqs,
    };

    setGeneratedBlogCode(JSON.stringify(blogObj, null, 2));
  };

  const handleCopyBlogCode = () => {
    if (!generatedBlogCode) return;
    navigator.clipboard.writeText(generatedBlogCode);
    setCopiedBlogCode(true);
    setTimeout(() => setCopiedBlogCode(false), 2000);
  };

  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) return;

    setPublishingBlog(true);
    setBlogPublishError(null);
    setBlogPublishSuccess(null);

    // Generate slug automatically
    const slug = blogTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Generate ToC dynamically from ## headers
    const lines = blogContent.split("\n");
    const toc: { id: string; title: string }[] = [];
    lines.forEach((line) => {
      if (line.startsWith("## ")) {
        const titleText = line.replace("## ", "").trim();
        const id = titleText
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        toc.push({ id, title: titleText });
      }
    });

    const cleanFaqs = blogFaqs.filter((f) => f.question.trim() && f.answer.trim());
    const tagsArray = blogTags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      const response = await fetch("/api/v1/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blogTitle,
          excerpt: blogExcerpt,
          content: blogContent,
          image: blogImage,
          category: blogCategory,
          tags: tagsArray,
          readTime: blogReadTime,
          faqs: cleanFaqs,
          toc,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setBlogPublishSuccess(`Successfully published blog post: "${data.blog.title}"!`);
        handleResetBlogForm();
        fetchAdminData(); // refresh counts
      } else {
        setBlogPublishError(data.message || "Failed to publish blog post.");
      }
    } catch (err) {
      setBlogPublishError("An error occurred while publishing the blog post.");
    } finally {
      setPublishingBlog(false);
    }
  };

  const handleResetBlogForm = () => {
    setBlogTitle("");
    setBlogExcerpt("");
    setBlogImage("");
    setBlogCategory("tech");
    setBlogTags("");
    setBlogReadTime("5 min read");
    setBlogContent("");
    setBlogFaqs([{ question: "", answer: "" }]);
    setGeneratedBlogCode(null);
    setBlogPublishError(null);
    setBlogPublishSuccess(null);
  };

  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualCategory || !manualPrice || !manualOriginalPrice || !manualImage) {
      setPublishError("Please fill out all required fields.");
      return;
    }

    setPublishingProduct(true);
    setPublishError(null);
    setPublishSuccess(null);
    setPublishedProduct(null);

    try {
      const response = await fetch("/api/v1/admin/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle,
          asin: manualAsin,
          category: manualCategory,
          price: manualPrice,
          originalPrice: manualOriginalPrice,
          image: manualImage,
          description: manualDescription,
          affiliateLink: manualAffiliateLink,
          features: manualFeatures,
          pros: manualPros,
          cons: manualCons,
          telegramBroadcast: manualTelegramBroadcast,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPublishSuccess(`Successfully published product manually!`);
        setPublishedProduct(data.product);
        handleResetProductForm();
        fetchAdminData(); // refresh counts
      } else {
        setPublishError(data.message || "Failed to manually publish product.");
      }
    } catch (err) {
      setPublishError("An error occurred while publishing the product.");
    } finally {
      setPublishingProduct(false);
    }
  };

  const handleResetProductForm = () => {
    setManualTitle("");
    setManualAsin("");
    setManualCategory("tech");
    setManualPrice("");
    setManualOriginalPrice("");
    setManualImage("");
    setManualDescription("");
    setManualAffiliateLink("");
    setManualFeatures("");
    setManualPros("");
    setManualCons("");
    setManualTelegramBroadcast(true);
  };

  if (loading || (user && user.role === "admin" && loadingData)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
          <p className="text-muted-foreground text-sm font-semibold tracking-wide">Authorizing admin console access...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container-custom flex min-h-[70vh] items-center justify-center py-12">
        <div className="relative overflow-hidden card max-w-md w-full p-8 text-center border border-destructive/20 bg-destructive/5 rounded-3xl shadow-lg animate-fade-in">
          <div className="absolute -left-12 -bottom-12 h-28 w-28 rounded-full bg-destructive/5 blur-2xl" />
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Forbidden</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            You do not have the required role to view the administration panel. Please login with a verified administrator account.
          </p>
          <Link href="/login" className="btn-primary inline-flex py-2.5 px-6 rounded-2xl text-xs font-bold shadow-md">
            Sign In with Admin Account
          </Link>
        </div>
      </div>
    );
  }

  const categoryColors = ["bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];

  return (
    <div className="min-h-screen bg-slate-500/[0.03] py-10">
      <div className="container-custom max-w-6xl">
        {/* Header Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-red-600 font-bold uppercase tracking-wider text-[10px] bg-red-500/5 px-2.5 py-1 rounded-full max-w-max mb-2 border border-red-500/10">
              <Shield className="h-3.5 w-3.5" /> secure system access
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Admin Console</h1>
            <p className="text-xs text-muted-foreground">Monitor system analytics, watchlist performance, and trigger product price audits.</p>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            <Link
              href="/admin/digital-store"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 px-6 text-xs font-bold text-white shadow-md hover:scale-102 hover:shadow-lg transition-all duration-300 border border-white/10"
            >
              <ShoppingCart className="h-4 w-4" />
              Manage Digital Store
            </Link>

            <button
              onClick={handleSyncPrices}
              disabled={syncing || broadcasting}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 px-6 text-xs font-bold text-white shadow-md hover:scale-102 hover:shadow-lg transition-all duration-300 border border-white/10 ${
                syncing ? "animate-pulse" : ""
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Run Price Audit"}
            </button>
            
            <button
              onClick={handleBroadcastDeals}
              disabled={syncing || broadcasting}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 px-6 text-xs font-bold text-white shadow-md hover:scale-102 hover:shadow-lg transition-all duration-300 border border-white/10 ${
                broadcasting ? "animate-pulse" : ""
              }`}
            >
              {broadcasting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {broadcasting ? "Broadcasting..." : "Broadcast Deals"}
            </button>
          </div>
        </div>

        {syncResult && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs font-bold text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400 animate-fade-in shadow-sm">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>{syncResult}</span>
          </div>
        )}

        {/* Navigation Tab Pills */}
        <div className="bg-card border border-border/80 p-1.5 rounded-2xl flex gap-1 mb-8 overflow-x-auto scrollbar-none max-w-max shadow-sm">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "analytics"
                ? "bg-red-500/10 text-red-500 shadow-sm border border-red-500/15"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
            }`}
          >
            <LineChart className="h-4 w-4" />
            Overview & Analytics
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "products"
                ? "bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/15"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
            }`}
          >
            <Layers className="h-4 w-4" />
            Manage Products
          </button>

          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "blogs"
                ? "bg-indigo-500/10 text-indigo-500 shadow-sm border border-indigo-500/15"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
            }`}
          >
            <FileText className="h-4 w-4" />
            Manage Blogs
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "products" && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Publish ASIN Scraper Form */}
            <div className="card p-6 border border-border bg-card rounded-3xl shadow-sm relative overflow-hidden mb-8">
          <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-red-500/5 blur-2xl" />
          <h3 className="text-lg font-black mb-1 flex items-center gap-2 text-foreground">
            <Layers className="h-5 w-5 text-red-500" /> Scrape & Publish Amazon Product
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Enter an Amazon ASIN to automatically fetch its details, create an affiliate link, save to MongoDB, append it to the products.ts catalog, and publish to the Telegram channel.
          </p>

          <form onSubmit={handleScrapeProduct} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-1/2">
              <label htmlFor="asin" className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                Amazon ASIN
              </label>
              <input
                id="asin"
                type="text"
                value={asin}
                onChange={(e) => setAsin(e.target.value)}
                placeholder="e.g. B0CHX1W1XY, B0CXF4D189, B0CY5N681Z"
                className="w-full h-11 px-4 text-xs bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-red-500 text-foreground"
                required
              />
            </div>
            
            <div className="w-full sm:w-1/3">
              <label htmlFor="category" className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                Product Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 text-xs bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-red-500 text-foreground appearance-none capitalize"
              >
                <option value="tech">tech</option>
                <option value="kitchen">kitchen</option>
                <option value="home">home</option>
                <option value="gadgets">gadgets</option>
                <option value="fashion">fashion</option>
                <option value="study">study</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={scraping || !asin}
              className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-xs font-bold text-white shadow-md hover:scale-102 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {scraping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scraping & Publishing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Fetch & Publish Product
                </>
              )}
            </button>
          </form>

          {/* Scraper Status Alerts */}
          {scrapeError && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-xs font-bold text-red-500 animate-fade-in shadow-sm">
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
              <span>{scrapeError}</span>
            </div>
          )}

          {scrapeSuccess && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-500 animate-fade-in shadow-sm">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
              <div className="flex-1">
                <span>{scrapeSuccess}</span>
                {scrapedProduct && (
                  <div className="mt-2.5 flex flex-col sm:flex-row gap-4 p-3.5 bg-background border border-border/80 rounded-2xl">
                    {scrapedProduct.image && (
                      <img
                        src={scrapedProduct.image}
                        alt={scrapedProduct.title}
                        className="h-16 w-16 rounded-xl object-contain bg-white p-1 border border-border shrink-0"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-black text-foreground line-clamp-1">{scrapedProduct.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Price: <span className="text-emerald-500 font-bold">₹{scrapedProduct.price?.toLocaleString("en-IN")}</span> | Slug: <span className="font-semibold">{scrapedProduct.slug}</span>
                      </p>
                      <a
                        href={scrapedProduct.affiliateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-red-500 hover:underline font-bold mt-1.5 inline-block"
                      >
                        Generated Affiliate Link ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manual Product Publish Form */}
        <div className="card p-6 border border-border bg-card rounded-3xl shadow-sm relative overflow-hidden mb-8">
          <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl" />
          <h3 className="text-lg font-black mb-1 flex items-center gap-2 text-foreground">
            <Plus className="h-5 w-5 text-emerald-500" /> Manually Publish Product
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Add a product to the affiliate store manually. This will save it to MongoDB, write to the static products.ts catalog, and optionally broadcast it on the Telegram channel.
          </p>

          <form onSubmit={handlePublishProduct} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. boAt Airdopes 141 Bluetooth Earbuds"
                  className="w-full h-11 px-4 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground appearance-none capitalize"
                  required
                >
                  <option value="tech">tech</option>
                  <option value="kitchen">kitchen</option>
                  <option value="home">home</option>
                  <option value="gadgets">gadgets</option>
                  <option value="fashion">fashion</option>
                  <option value="study">study</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  ASIN (Optional, generated if empty)
                </label>
                <input
                  type="text"
                  value={manualAsin}
                  onChange={(e) => setManualAsin(e.target.value)}
                  placeholder="e.g. B0CHX1W1XY"
                  className="w-full h-11 px-4 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Deal Price (INR) *
                </label>
                <input
                  type="number"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="e.g. 1299"
                  className="w-full h-11 px-4 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Original Price (INR) *
                </label>
                <input
                  type="number"
                  value={manualOriginalPrice}
                  onChange={(e) => setManualOriginalPrice(e.target.value)}
                  placeholder="e.g. 2999"
                  className="w-full h-11 px-4 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Image URL *
                </label>
                <input
                  type="text"
                  value={manualImage}
                  onChange={(e) => setManualImage(e.target.value)}
                  placeholder="https://images-na.ssl-images-amazon.com/images/..."
                  className="w-full h-11 px-4 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Affiliate Link (Optional, auto-generated from ASIN if empty)
                </label>
                <input
                  type="text"
                  value={manualAffiliateLink}
                  onChange={(e) => setManualAffiliateLink(e.target.value)}
                  placeholder="https://www.amazon.in/dp/..."
                  className="w-full h-11 px-4 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                Product Description Summary (Optional)
              </label>
              <textarea
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Brief description of the product features, specs or target audience..."
                rows={2}
                className="w-full p-3.5 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground leading-relaxed"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Features (one per line)
                </label>
                <textarea
                  value={manualFeatures}
                  onChange={(e) => setManualFeatures(e.target.value)}
                  placeholder="8mm Dynamic Drivers&#10;IPX4 Water Resistant&#10;42h Playtime"
                  rows={3}
                  className="w-full p-3.5 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Pros (one per line)
                </label>
                <textarea
                  value={manualPros}
                  onChange={(e) => setManualPros(e.target.value)}
                  placeholder="Excellent battery life&#10;Very fast charging&#10;Clear voice calls"
                  rows={3}
                  className="w-full p-3.5 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1.5">
                  Cons (one per line)
                </label>
                <textarea
                  value={manualCons}
                  onChange={(e) => setManualCons(e.target.value)}
                  placeholder="Micro-USB port instead of Type-C&#10;Somewhat bulky charging case"
                  rows={3}
                  className="w-full p-3.5 text-xs bg-muted/40 border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="manualTelegramBroadcast"
                checked={manualTelegramBroadcast}
                onChange={(e) => setManualTelegramBroadcast(e.target.checked)}
                className="h-4.5 w-4.5 text-emerald-600 border-border rounded focus:ring-emerald-500 bg-muted/40 cursor-pointer"
              />
              <label htmlFor="manualTelegramBroadcast" className="text-xs font-bold text-foreground cursor-pointer select-none">
                Auto-broadcast to Telegram Channel
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={publishingProduct || !manualTitle || !manualPrice || !manualOriginalPrice || !manualImage}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 px-6 text-xs font-bold text-white shadow-md hover:scale-102 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:scale-100 cursor-pointer border border-white/10"
              >
                {publishingProduct ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing Product...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Manually Publish Product
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetProductForm}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-xs px-6 cursor-pointer"
              >
                Reset Form
              </button>
            </div>
          </form>

          {/* Status Alerts */}
          {publishError && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-xs font-bold text-red-500 animate-fade-in shadow-sm">
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
              <span>{publishError}</span>
            </div>
          )}

          {publishSuccess && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-500 animate-fade-in shadow-sm">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
              <div className="flex-1">
                <span>{publishSuccess}</span>
                {publishedProduct && (
                  <div className="mt-2.5 flex flex-col sm:flex-row gap-4 p-3.5 bg-background border border-border/80 rounded-2xl">
                    {publishedProduct.image && (
                      <img
                        src={publishedProduct.image}
                        alt={publishedProduct.title}
                        className="h-16 w-16 rounded-xl object-contain bg-white p-1 border border-border shrink-0"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-black text-foreground line-clamp-1">{publishedProduct.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Price: <span className="text-emerald-500 font-bold">₹{publishedProduct.price?.toLocaleString("en-IN")}</span> | Slug: <span className="font-semibold">{publishedProduct.slug}</span>
                      </p>
                      <a
                        href={publishedProduct.affiliateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-500 hover:underline font-bold mt-1.5 inline-block"
                      >
                        Affiliate Link ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

        {activeTab === "blogs" && (
          <div className="space-y-8 animate-fade-in">
            {/* Blog Post Helper & Code Template Generator */}
            <div id="blog-generator" className="card p-6 border border-border bg-card rounded-3xl shadow-sm relative overflow-hidden mb-8">
          <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-brand-500/5 blur-2xl" />
          <h3 className="text-lg font-black mb-1 flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-indigo-500" /> Publish & Manage Blog Posts
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Create and publish a blog post directly to the database or generate a static JSON block template for local development. Includes auto-slugging and table of contents compilation.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                  Blog Title
                </label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. 10 Best Kitchen Gadgets in India"
                  className="w-full h-10 px-3.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground capitalize"
                >
                  <option value="tech">tech</option>
                  <option value="kitchen">kitchen</option>
                  <option value="home">home</option>
                  <option value="fashion">fashion</option>
                  <option value="study">study</option>
                  <option value="gadgets">gadgets</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                  Excerpt Summary
                </label>
                <input
                  type="text"
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="e.g. Discover the top 10 kitchen helpers to speed up cooking..."
                  className="w-full h-10 px-3.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={blogImage}
                  onChange={(e) => setBlogImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full h-10 px-3.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={blogTags}
                  onChange={(e) => setBlogTags(e.target.value)}
                  placeholder="kitchen, gadgets, tools, best budget"
                  className="w-full h-10 px-3.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                  Read Time
                </label>
                <input
                  type="text"
                  value={blogReadTime}
                  onChange={(e) => setBlogReadTime(e.target.value)}
                  placeholder="e.g. 5 min read"
                  className="w-full h-10 px-3.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                Markdown Body Content (Use standard Markdown, prefix headings with `## ` to auto-generate ToC links)
              </label>
              <textarea
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                placeholder="## Introduction&#10;Write content here...&#10;&#10;## #1 Product Name&#10;Details here..."
                rows={6}
                className="w-full p-3.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground font-mono leading-relaxed"
                required
              />
            </div>

            {/* Dynamic FAQs Section */}
            <div className="space-y-2.5 bg-muted/15 border border-border/60 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Dynamic Blog FAQs</span>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-lg cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add FAQ Item
                </button>
              </div>
              
              <div className="space-y-3">
                {blogFaqs.map((faq, index) => (
                  <div key={index} className="flex gap-3 items-start border-b border-border/20 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                        placeholder="FAQ Question"
                        className="w-full h-9 px-3 text-xs bg-card border border-border rounded-xl focus:outline-none text-foreground font-semibold"
                      />
                      <input
                        type="text"
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                        placeholder="FAQ Answer"
                        className="w-full h-9 px-3 text-xs bg-card border border-border rounded-xl focus:outline-none text-muted-foreground"
                      />
                    </div>
                    {blogFaqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/5 rounded-lg mt-0.5 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Publish Blog Status Alerts */}
            {blogPublishError && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-xs font-bold text-red-500 animate-fade-in shadow-sm">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
                <span>{blogPublishError}</span>
              </div>
            )}

            {blogPublishSuccess && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-500 animate-fade-in shadow-sm">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>{blogPublishSuccess}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handlePublishBlog}
                disabled={publishingBlog || !blogTitle || !blogContent}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xs px-6 shadow-md hover:scale-102 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:scale-100 cursor-pointer border border-white/10"
              >
                {publishingBlog ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publish to Website
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGenerateBlog}
                disabled={!blogTitle || !blogContent}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-6 shadow disabled:opacity-50 cursor-pointer"
              >
                Generate Code Template
              </button>
              
              <button
                type="button"
                onClick={handleResetBlogForm}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-xs px-6 cursor-pointer"
              >
                Reset Form
              </button>
            </div>
          </form>

          {/* Generated Code Display block */}
          {generatedBlogCode && (
            <div className="mt-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" /> Template generated successfully!
                </span>
                
                <button
                  type="button"
                  onClick={handleCopyBlogCode}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  {copiedBlogCode ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" /> Copied Code
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Template
                    </>
                  )}
                </button>
              </div>

              {/* Quick instructions */}
              <div className="text-[11px] text-muted-foreground leading-relaxed bg-[#1b1c24]/5 border border-border/40 p-4 rounded-2xl space-y-1.5">
                <p className="font-bold text-foreground">💡 How to publish this article:</p>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li>Click <strong>Copy Template</strong> in the top-right of the box.</li>
                  <li>Open the file: <span className="font-mono text-indigo-500 font-bold select-all">data/blogPosts.ts</span>.</li>
                  <li>Scroll to the end of the array, paste this block as a new item inside the array.</li>
                  <li>Save the file and push the changes to GitHub. The article will deploy automatically!</li>
                </ol>
              </div>

              <pre className="p-4 bg-[#121318] text-[#a9b2c3] rounded-2xl overflow-x-auto text-[10px] font-mono leading-relaxed border border-border/60 max-h-80 overflow-y-auto select-all">
                <code>{generatedBlogCode}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    )}

        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in">
            {/* Analytics Card Metrics */}
            {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-blue-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Total Users</span>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{stats.totalUsers}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Registered accounts</p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-purple-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Catalog Size</span>
                <Layers className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{stats.totalProductsCatalog}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Tracked smart items</p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-amber-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Shared Deals</span>
                <Tag className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{stats.totalDeals}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Community posts</p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-emerald-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Watchlists</span>
                <Bell className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{stats.activeAlerts}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Active price monitors</p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-rose-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-rose-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Price Points</span>
                <LineChart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{stats.priceHistoryPoints}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Audited price updates</p>
              </div>
            </div>
          </div>
        )}

        {/* Digital Products Stats */}
        {stats && stats.totalDigitalSales !== undefined && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-emerald-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Digital Revenue</span>
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">₹{stats.totalRevenue?.toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Net marketplace earnings</p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-blue-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Total Sales</span>
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{stats.totalDigitalSales}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Completed transactions</p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-purple-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Downloads</span>
                <Download className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{stats.totalDownloads}</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Total file downloads</p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-5 border border-border bg-card shadow-sm rounded-3xl flex flex-col justify-between group hover:border-rose-500/30 transition-all duration-200">
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-rose-500/5 blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Conversion Rate</span>
                <Activity className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{stats.conversionRate}%</p>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">User purchase ratio</p>
              </div>
            </div>
          </div>
        )}

        {/* Section Layout grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Distribution chart card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6 border border-border bg-card rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-red-500/5 blur-2xl" />
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-foreground">
                <Database className="h-5 w-5 text-red-500" /> Category Breakdown
              </h3>
              
              <div className="space-y-4">
                {categories.map((cat, index) => {
                  const percent = Math.round((cat.value / (stats?.totalProductsCatalog || 1)) * 100);
                  const color = categoryColors[index % categoryColors.length];
                  
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-foreground capitalize">{cat.name}</span>
                        <span className="text-muted-foreground">{cat.value} items ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">No categories found in catalog.</p>
                )}
              </div>
            </div>
          </div>

          {/* User management list card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 border border-border bg-card rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-red-500" /> System Users
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                      <th className="py-3 px-3">Display Name</th>
                      <th className="py-3 px-3">Email Address</th>
                      <th className="py-3 px-3">Access Level</th>
                      <th className="py-3 px-3">Telegram ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {usersList.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-foreground">{userItem.name}</td>
                        <td className="py-3.5 px-3 text-muted-foreground font-semibold">{userItem.email}</td>
                        <td className="py-3.5 px-3">
                          <span className={`badge font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                            userItem.role === "admin"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/15"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/15"
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground font-mono text-[10px]">
                          {userItem.telegramChatId || <span className="text-slate-400">&mdash;</span>}
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground font-medium">
                          No users registered in system.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
);
}
