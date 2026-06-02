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
    <div className="min-h-screen bg-slate-500/[0.03] py-10 select-none">
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
              {broadcasting ? "Broadcasting..." : "Broadcast Deals to Channel"}
            </button>
          </div>
        </div>

        {syncResult && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs font-bold text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400 animate-fade-in shadow-sm">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>{syncResult}</span>
          </div>
        )}

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
                <option value="clothing">clothing</option>
                <option value="sports">sports</option>
                <option value="books">books</option>
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
    </div>
  );
}
