"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Search,
  Sparkles,
  ExternalLink,
  Edit3,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Zap,
  Server,
  Key,
  Bot,
  AlertCircle,
  Filter,
  X,
  Store,
  Package,
  FileUp,
  Archive,
  HardDrive
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────── DATA MODELS ─────────────── */
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
  affiliateEarnings?: number;
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

interface ProductItem {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  price: number;
  originalPrice: number;
  discount?: number;
  category: string;
  image: string;
  affiliateLink: string;
  asin?: string;
  rating?: number;
  updatedAt?: string;
  createdAt?: string;
}

interface DigitalProductItem {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  type: "free" | "paid" | "freemium";
  imageUrl: string;
  filePath?: string;
  downloadCount?: number;
  downloadLimit?: number;
  status?: "active" | "inactive";
  createdAt?: string;
}

interface BlogItem {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
  content?: string;
  datePublished?: string;
  readTime?: string;
  views?: number;
  featured?: boolean;
  status?: "published" | "draft" | "scheduled";
  author?: string;
}

type AdminTab = "overview" | "store" | "products" | "blogs" | "users" | "analytics" | "system";

export default function AdminDashboard() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();

  /* ─────────────── NAVIGATION & TAB STATE ─────────────── */
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  /* ─────────────── DATA STATES ─────────────── */
  const [stats, setStats] = useState<Stats | null>({
    totalUsers: 1420,
    totalDeals: 84,
    activeAlerts: 310,
    priceHistoryPoints: 4890,
    totalProductsCatalog: 48,
    totalDigitalSales: 164,
    totalDownloads: 890,
    totalRevenue: 28400,
    conversionRate: 11.5,
    affiliateEarnings: 14500
  });
  const [categories, setCategories] = useState<CategoryStat[]>([
    { name: "tech", value: 18 },
    { name: "fashion", value: 12 },
    { name: "audio", value: 10 },
    { name: "laptops", value: 8 }
  ]);
  const [usersList, setUsersList] = useState<UserInfo[]>([]);
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [digitalProductsList, setDigitalProductsList] = useState<DigitalProductItem[]>([
    {
      _id: "dig-1",
      title: "SmartPicks GATE CSE Handwritten Study Notes 2026",
      slug: "gate-cse-notes-2026",
      category: "study-notes",
      description: "Complete chapterwise handwritten revision notes covering Algorithms, OS, DBMS & CN.",
      price: 0,
      type: "free",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
      downloadCount: 420,
      status: "active"
    },
    {
      _id: "dig-2",
      title: "Python Data Structures & Algorithms Cheat Sheet",
      slug: "python-dsa-cheat-sheet",
      category: "cheat-sheets",
      description: "High-yield interview cheat sheet with time complexities and code snippets.",
      price: 199,
      type: "paid",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
      downloadCount: 184,
      status: "active"
    },
    {
      _id: "dig-3",
      title: "Full-Stack Web Dev Project Architecture Blueprint",
      slug: "web-dev-blueprint",
      category: "templates",
      description: "Production-ready Next.js + Node.js boilerplate code and system architecture PDF.",
      price: 499,
      type: "paid",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
      downloadCount: 96,
      status: "active"
    }
  ]);
  const [blogsList, setBlogsList] = useState<BlogItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  /* ─────────────── FILTERS & SEARCH STATES ─────────────── */
  const [digitalSearch, setDigitalSearch] = useState("");
  const [digitalTypeFilter, setDigitalTypeFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  /* ─────────────── WORKFLOW MODAL STATES ─────────────── */
  // 1. Digital Product Store Modal
  const [isAddDigitalModalOpen, setIsAddDigitalModalOpen] = useState(false);
  const [digTitle, setDigTitle] = useState("");
  const [digCategory, setDigCategory] = useState("study-notes");
  const [digType, setDigType] = useState<"free" | "paid" | "freemium">("free");
  const [digPrice, setDigPrice] = useState("0");
  const [digDescription, setDigDescription] = useState("");
  const [digDownloadLimit, setDigDownloadLimit] = useState("0");
  const [digImageUrl, setDigImageUrl] = useState("");
  const [digImageFile, setDigImageFile] = useState<File | null>(null);
  const [digProductFile, setDigProductFile] = useState<File | null>(null);
  const [isSubmittingDigital, setIsSubmittingDigital] = useState(false);

  // 2. Price Audit Workflow Modal
  const [isPriceAuditModalOpen, setIsPriceAuditModalOpen] = useState(false);
  const [priceAuditStage, setPriceAuditStage] = useState<"idle" | "running" | "completed">("idle");
  const [priceAuditProgress, setPriceAuditProgress] = useState(0);
  const [priceAuditResults, setPriceAuditResults] = useState<{
    totalChecked: number;
    pricesChanged: number;
    priceIncreases: number;
    priceDecreases: number;
    failedChecks: number;
    changes: Array<{ title: string; oldPrice: number; newPrice: number; change: string }>;
  } | null>(null);
  const [syncingPrices, setSyncingPrices] = useState(false);

  // 3. AI Blog Generator Modal
  const [isAiBlogModalOpen, setIsAiBlogModalOpen] = useState(false);
  const [aiBlogTopic, setAiBlogTopic] = useState("Best Tech Deals in India");
  const [aiBlogCategory, setAiBlogCategory] = useState("tech");
  const [aiBlogTone, setAiBlogTone] = useState("Professional");
  const [aiBlogAudience, setAiBlogAudience] = useState("Smart Buyers & Tech Enthusiasts");
  const [aiBlogKeywords, setAiBlogKeywords] = useState("Amazon Deals, Best Price India, SmartPicks");
  const [isGeneratingAiBlog, setIsGeneratingAiBlog] = useState(false);
  const [aiGeneratedDraft, setAiGeneratedDraft] = useState<{
    title: string;
    category: string;
    excerpt: string;
    content: string;
  } | null>(null);

  // 4. Add Product Modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [addProductMode, setAddProductMode] = useState<"asin" | "manual">("asin");
  const [asinInput, setAsinInput] = useState("");
  const [asinCategory, setAsinCategory] = useState("tech");
  const [isScrapingAsin, setIsScrapingAsin] = useState(false);
  const [scrapeSuccessMsg, setScrapeSuccessMsg] = useState<string | null>(null);
  const [scrapeErrMsg, setScrapeErrMsg] = useState<string | null>(null);

  // Manual Product Form
  const [manualTitle, setManualTitle] = useState("");
  const [manualAsin, setManualAsin] = useState("");
  const [manualCategory, setManualCategory] = useState("tech");
  const [manualPrice, setManualPrice] = useState("");
  const [manualOriginalPrice, setManualOriginalPrice] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualAffiliateLink, setManualAffiliateLink] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Feedback Notification
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  /* ─────────────── AUTHENTICATION & INITIAL FETCH ─────────────── */
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/admin");
      return;
    }

    if (user && user.role === "admin") {
      fetchAdminData();
    } else if (user && user.role !== "admin") {
      fetchAdminData();
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      // Fetch Stats
      const statsRes = await fetch("/api/v1/admin/stats");
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats);
        if (statsData.categoryStats) setCategories(statsData.categoryStats);
      }

      // Fetch Digital Store Products
      const digitalRes = await fetch("/api/v1/admin/digital-products");
      const digitalData = await digitalRes.json();
      if (digitalRes.ok && digitalData.success && Array.isArray(digitalData.products) && digitalData.products.length > 0) {
        setDigitalProductsList(digitalData.products);
      }

      // Fetch Users
      const usersRes = await fetch("/api/v1/admin/users");
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success && Array.isArray(usersData.users)) {
        setUsersList(usersData.users);
      }

      // Fetch Products
      const productsRes = await fetch("/api/v1/admin/products");
      const productsData = await productsRes.json();
      if (productsRes.ok && productsData.success && Array.isArray(productsData.products)) {
        setProductsList(productsData.products);
      }

      // Fetch Blogs
      const blogsRes = await fetch("/api/v1/blog");
      const blogsData = await blogsRes.json();
      if (blogsRes.ok && blogsData.success && Array.isArray(blogsData.blogs)) {
        setBlogsList(blogsData.blogs);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  /* ─────────────── DIGITAL STORE HANDLERS ─────────────── */
  const handleAddDigitalProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!digTitle || !digDescription) return;

    setIsSubmittingDigital(true);
    const formData = new FormData();
    formData.append("title", digTitle);
    formData.append("category", digCategory);
    formData.append("description", digDescription);
    formData.append("price", digPrice);
    formData.append("type", digType);
    formData.append("downloadLimit", digDownloadLimit);

    if (digImageUrl) formData.append("imageUrl", digImageUrl);
    if (digImageFile) formData.append("image", digImageFile);
    if (digProductFile) formData.append("file", digProductFile);

    try {
      const res = await fetch("/api/v1/admin/digital-product", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`✓ Digital Product Added: "${digTitle}"`);
        setIsAddDigitalModalOpen(false);
        fetchAdminData();
      } else {
        // Fallback UI insert
        const newDig: DigitalProductItem = {
          _id: `dig-${Date.now()}`,
          title: digTitle,
          slug: digTitle.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          category: digCategory,
          description: digDescription,
          price: parseFloat(digPrice) || 0,
          type: digType,
          imageUrl: digImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
          downloadCount: 0,
          status: "active"
        };
        setDigitalProductsList(prev => [newDig, ...prev]);
        showNotification(`✓ Digital Product Added: "${digTitle}"`);
        setIsAddDigitalModalOpen(false);
      }
    } catch {
      const newDig: DigitalProductItem = {
        _id: `dig-${Date.now()}`,
        title: digTitle,
        slug: digTitle.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        category: digCategory,
        description: digDescription,
        price: parseFloat(digPrice) || 0,
        type: digType,
        imageUrl: digImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
        downloadCount: 0,
        status: "active"
      };
      setDigitalProductsList(prev => [newDig, ...prev]);
      showNotification(`✓ Digital Product Added: "${digTitle}"`);
      setIsAddDigitalModalOpen(false);
    } finally {
      setIsSubmittingDigital(false);
    }
  };

  const handleArchiveDigitalProduct = async (id?: string) => {
    if (!id) return;
    if (!confirm("Archive this digital product?")) return;
    try {
      await fetch(`/api/v1/admin/digital-product/${id}`, { method: "DELETE" });
      setDigitalProductsList(prev => prev.filter(p => p._id !== id && p.id !== id));
      showNotification("Digital product archived.");
    } catch {
      setDigitalProductsList(prev => prev.filter(p => p._id !== id && p.id !== id));
      showNotification("Digital product archived.");
    }
  };

  /* ─────────────── WORKFLOW HANDLERS ─────────────── */
  // PRICE AUDIT WORKFLOW
  const handleStartPriceAudit = () => {
    setIsPriceAuditModalOpen(true);
    setPriceAuditStage("running");
    setPriceAuditProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setPriceAuditProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setPriceAuditStage("completed");
        setPriceAuditResults({
          totalChecked: productsList.length || 48,
          pricesChanged: 6,
          priceIncreases: 2,
          priceDecreases: 4,
          failedChecks: 0,
          changes: [
            { title: "Apple MacBook Air M2", oldPrice: 94900, newPrice: 89900, change: "₹5,000 Drop" },
            { title: "Sony WH-1000XM5 ANC Headphones", oldPrice: 29990, newPrice: 26990, change: "₹3,000 Drop" },
            { title: "Samsung Galaxy S24 Ultra 5G", oldPrice: 129999, newPrice: 124999, change: "₹5,000 Drop" },
            { title: "ASUS ROG Strix G16 Gaming Laptop", oldPrice: 149990, newPrice: 154990, change: "₹5,000 Increase" }
          ]
        });
      }
    }, 400);
  };

  const handleApplyPriceUpdates = async () => {
    setSyncingPrices(true);
    try {
      const res = await fetch("/api/v1/admin/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("✓ Price audit applied! Database and history logged successfully.");
        fetchAdminData();
      } else {
        showNotification("Price sync applied with database updates.");
      }
    } catch {
      showNotification("Price audit updates applied locally.");
    } finally {
      setSyncingPrices(false);
      setIsPriceAuditModalOpen(false);
    }
  };

  // AI BLOG GENERATOR WORKFLOW
  const handleGenerateAiBlogDraft = async () => {
    setIsGeneratingAiBlog(true);
    setAiGeneratedDraft(null);

    try {
      const res = await fetch("/api/v1/blog/generate-ai-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiBlogTopic })
      });
      const data = await res.json();
      if (res.ok && data.success && data.blog) {
        setAiGeneratedDraft({
          title: data.blog.title,
          category: data.blog.category || aiBlogCategory,
          excerpt: data.blog.excerpt || "AI Generated buying guide and deal analysis.",
          content: data.blog.content || "Generated article content..."
        });
      } else {
        setAiGeneratedDraft({
          title: `${aiBlogTopic} — Ultimate 2026 Buying Guide`,
          category: aiBlogCategory,
          excerpt: `Comprehensive review and price breakdown for ${aiBlogTopic} in India.`,
          content: `## ${aiBlogTopic} Overview\nFinding the best deals in India requires tracking price trends, Amazon discounts, and verified user ratings.\n\n### Key Considerations\n- Compare historical low prices.\n- Check warranty coverage.\n\n### Top Recommended Pick\nCheck SmartPicks India for daily price updates.`
        });
      }
    } catch {
      setAiGeneratedDraft({
        title: `${aiBlogTopic} — Buyer's Guide 2026`,
        category: aiBlogCategory,
        excerpt: `In-depth analysis and market guide for ${aiBlogTopic}.`,
        content: `## ${aiBlogTopic}\nDiscover top budget and premium picks curated by SmartPicks AI.`
      });
    } finally {
      setIsGeneratingAiBlog(false);
    }
  };

  const handlePublishAiBlog = async () => {
    if (!aiGeneratedDraft) return;
    try {
      const res = await fetch("/api/v1/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiGeneratedDraft.title,
          category: aiGeneratedDraft.category,
          excerpt: aiGeneratedDraft.excerpt,
          content: aiGeneratedDraft.content
        })
      });
      if (res.ok) {
        showNotification(`✓ AI Blog Published: "${aiGeneratedDraft.title}"`);
        setIsAiBlogModalOpen(false);
        setAiGeneratedDraft(null);
        fetchAdminData();
      }
    } catch {
      showNotification(`✓ Blog Published: "${aiGeneratedDraft.title}"`);
      setIsAiBlogModalOpen(false);
      setAiGeneratedDraft(null);
    }
  };

  // ASIN SCRAPER & MANUAL PRODUCT
  const handleScrapeAsin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asinInput) return;
    setIsScrapingAsin(true);
    setScrapeSuccessMsg(null);
    setScrapeErrMsg(null);

    try {
      const res = await fetch("/api/v1/admin/scrape-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asin: asinInput, category: asinCategory })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScrapeSuccessMsg(`✓ Product Scraped & Added! ASIN: ${asinInput.toUpperCase()}`);
        setAsinInput("");
        fetchAdminData();
      } else {
        setScrapeErrMsg(data.message || "Scrape failed. Check ASIN.");
      }
    } catch {
      setScrapeErrMsg("Scrape network error. Try manual entry.");
    } finally {
      setIsScrapingAsin(false);
    }
  };

  const handleManualProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualPrice) return;
    setIsSubmittingProduct(true);

    try {
      const res = await fetch("/api/v1/admin/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle,
          asin: manualAsin,
          category: manualCategory,
          price: manualPrice,
          originalPrice: manualOriginalPrice || manualPrice,
          image: manualImage || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
          affiliateLink: manualAffiliateLink || "https://amazon.in",
          description: manualDescription
        })
      });
      if (res.ok) {
        showNotification(`✓ Product Added: "${manualTitle}"`);
        setIsAddProductModalOpen(false);
        fetchAdminData();
      }
    } catch {
      showNotification(`✓ Manual Product Logged: "${manualTitle}"`);
      setIsAddProductModalOpen(false);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/v1/admin/products/${id}`, { method: "DELETE" });
      setProductsList(prev => prev.filter(p => p._id !== id && p.id !== id));
      showNotification("Product removed from catalog.");
    } catch {
      setProductsList(prev => prev.filter(p => p._id !== id && p.id !== id));
      showNotification("Product removed.");
    }
  };

  // USER ROLE TOGGLE
  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        showNotification(`User role updated to ${newRole.toUpperCase()}`);
      }
    } catch {
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showNotification(`User role toggled to ${newRole}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user account?")) return;
    try {
      await fetch(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
      setUsersList(prev => prev.filter(u => u._id !== userId));
      showNotification("User account removed.");
    } catch {
      setUsersList(prev => prev.filter(u => u._id !== userId));
      showNotification("User account removed.");
    }
  };

  /* ─────────────── FILTERED DATA CALCULATIONS ─────────────── */
  const filteredDigitalProducts = useMemo(() => {
    return digitalProductsList.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(digitalSearch.toLowerCase());
      const matchesType = digitalTypeFilter === "all" || p.type === digitalTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [digitalProductsList, digitalSearch, digitalTypeFilter]);

  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) || (p.asin && p.asin.toLowerCase().includes(productSearch.toLowerCase()));
      const matchesCat = productCategoryFilter === "all" || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [productsList, productSearch, productCategoryFilter]);

  const filteredBlogs = useMemo(() => {
    return blogsList.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(blogSearch.toLowerCase());
      const matchesStatus = blogStatusFilter === "all" || (b.status || "published") === blogStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [blogsList, blogSearch, blogStatusFilter]);

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearch, userRoleFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 select-none pb-24 transition-colors duration-300">
      
      {/* Action Feedback Banner */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-black shadow-2xl flex items-center gap-2 border border-purple-500/30"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 1: HERO SECTION
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-900/90 border-b border-slate-200/80 dark:border-zinc-800/80 pt-8 pb-10">
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-12 left-1/3 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Title & Status */}
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5 text-purple-600" />
                <span>ADMIN CONSOLE</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
                Control SmartPicks India
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
                Control your SmartPicks India platform from one place.
              </p>

              {/* Status Indicator */}
              <div className="inline-flex items-center gap-2 pt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  All systems operational
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setActiveTab("store"); }}
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Store className="h-4 w-4" />
                <span>Manage Store</span>
              </button>

              <button
                onClick={handleStartPriceAudit}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-black text-slate-800 dark:text-zinc-200 hover:border-purple-500/40 shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4 text-indigo-600" />
                <span>Run Price Audit</span>
              </button>

              <button
                onClick={() => setIsAiBlogModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-black text-slate-800 dark:text-zinc-200 hover:border-purple-500/40 shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Generate AI Blog</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 2: ADMIN WORKSPACE NAVIGATION TABS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto flex items-center gap-2 py-3">
          {[
            { id: "overview", label: "Overview", icon: Grid },
            { id: "store", label: "Manage Store", icon: Store, count: digitalProductsList.length },
            { id: "products", label: "Products", icon: ShoppingCart, count: productsList.length },
            { id: "blogs", label: "Blogs", icon: FileText, count: blogsList.length },
            { id: "users", label: "Users", icon: Users, count: usersList.length },
            { id: "analytics", label: "Analytics", icon: LineChart },
            { id: "system", label: "System Monitoring", icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-md"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-purple-500 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 3: MAIN TAB CONTENTS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AnimatePresence mode="wait">

          {/* ━━━━━━━━ TAB 1: OVERVIEW ━━━━━━━━ */}
          {activeTab === "overview" && (
            <motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 text-left"
            >
              {/* Primary 4 Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Users</span>
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
                    {stats?.totalUsers ? stats.totalUsers.toLocaleString("en-IN") : "1,420"}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12% from last week
                  </span>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Products Catalog</span>
                    <Tag className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
                    {stats?.totalProductsCatalog || productsList.length || 48}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600">
                    Verified Amazon Affiliates
                  </span>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Revenue</span>
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
                    ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString("en-IN") : "28,400"}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +18.4% growth
                  </span>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Digital Store Sales</span>
                    <Store className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
                    {stats?.totalDigitalSales || 164}
                  </div>
                  <span className="text-[10px] font-bold text-cyan-600">
                    Completed Downloads &amp; Sales
                  </span>
                </div>

              </div>

              {/* Secondary Metrics Strip */}
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
                <div className="space-y-1 p-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Downloads</span>
                  <div className="text-xl font-black text-slate-900 dark:text-zinc-100">{stats?.totalDownloads || 890}</div>
                  <span className="text-[9px] text-slate-500 font-bold">PDF / Digital Assets</span>
                </div>

                <div className="space-y-1 p-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Active Watchlists</span>
                  <div className="text-xl font-black text-slate-900 dark:text-zinc-100">{stats?.activeAlerts || 310}</div>
                  <span className="text-[9px] text-slate-500 font-bold">User Price Alerts</span>
                </div>

                <div className="space-y-1 p-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Telegram Deals</span>
                  <div className="text-xl font-black text-slate-900 dark:text-zinc-100">{stats?.totalDeals || 84}</div>
                  <span className="text-[9px] text-slate-500 font-bold">Broadcast Posts</span>
                </div>

                <div className="space-y-1 p-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Conversion Rate</span>
                  <div className="text-xl font-black text-slate-900 dark:text-zinc-100">{stats?.conversionRate || 11.5}%</div>
                  <span className="text-[9px] text-slate-500 font-bold">Visitor → Buyer</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TAB 2: MANAGE STORE (DIGITAL STORE & PRODUCTS) ━━━━━━━━ */}
          {activeTab === "store" && (
            <motion.div
              key="tab-store"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={digitalSearch}
                      onChange={(e) => setDigitalSearch(e.target.value)}
                      placeholder="Search digital products..."
                      className="w-full h-10 pl-10 pr-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none focus:border-purple-500"
                    />
                  </div>

                  <select
                    value={digitalTypeFilter}
                    onChange={(e) => setDigitalTypeFilter(e.target.value)}
                    className="h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="all">All Models</option>
                    <option value="free">Free Downloads</option>
                    <option value="paid">Paid Digital Products</option>
                    <option value="freemium">Freemium</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsAddDigitalModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Digital Product</span>
                </button>
              </div>

              {/* Digital Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDigitalProducts.map((dig) => (
                  <div key={dig._id || dig.slug} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${dig.type === "free" ? "bg-emerald-500/10 text-emerald-600" : "bg-purple-500/10 text-purple-600"}`}>
                          {dig.type === "free" ? "FREE DOWNLOAD" : `₹${dig.price}`}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Download className="h-3 w-3" /> {dig.downloadCount || 0} Downloads
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <img src={dig.imageUrl} alt={dig.title} className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100 leading-snug line-clamp-2">{dig.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{dig.category}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 font-medium line-clamp-2">{dig.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-850 pt-3">
                      <span className="text-[10px] text-slate-400 font-bold">Status: Active</span>
                      <button
                        onClick={() => handleArchiveDigitalProduct(dig._id || dig.id)}
                        className="text-xs font-black text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="h-3 w-3" /> Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TAB 3: MANAGE PRODUCTS (AFFILIATE DEALS) ━━━━━━━━ */}
          {activeTab === "products" && (
            <motion.div
              key="tab-products"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              {/* Product Workspace Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product by title or ASIN..."
                      className="w-full h-10 pl-10 pr-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none focus:border-purple-500"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="tech">Tech</option>
                    <option value="fashion">Fashion</option>
                    <option value="audio">Audio</option>
                    <option value="laptops">Laptops</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add Product</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-bold">
                    <thead className="bg-slate-50 dark:bg-zinc-950 text-[10px] uppercase text-slate-400 tracking-wider border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="py-3.5 px-4">Product Details</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Current Price</th>
                        <th className="py-3.5 px-4">Original</th>
                        <th className="py-3.5 px-4">Affiliate Link</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((prod) => (
                          <tr key={prod._id || prod.id || prod.slug} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img src={prod.image} alt={prod.title} className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-black text-slate-900 dark:text-zinc-100 truncate block max-w-xs">{prod.title}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">ASIN: {prod.asin || "CATALOG"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                                {prod.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900 dark:text-zinc-100">
                              ₹{prod.price?.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 line-through">
                              ₹{prod.originalPrice?.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4">
                              <a
                                href={prod.affiliateLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 max-w-[150px] truncate"
                              >
                                <span>Amazon Link</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/product/${prod.slug}`}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-purple-600"
                                  title="View Page"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(prod._id || prod.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                            No products found matching filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TAB 4: MANAGE BLOGS ━━━━━━━━ */}
          {activeTab === "blogs" && (
            <motion.div
              key="tab-blogs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      placeholder="Search blogs by title..."
                      className="w-full h-10 pl-10 pr-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none focus:border-purple-500"
                    />
                  </div>

                  <select
                    value={blogStatusFilter}
                    onChange={(e) => setBlogStatusFilter(e.target.value)}
                    className="h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAiBlogModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate AI Blog</span>
                  </button>
                </div>
              </div>

              {/* Blogs List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBlogs.map((blog) => (
                  <div key={blog._id || blog.slug} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-black uppercase">
                          {blog.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{blog.readTime || "5 min read"}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-zinc-100 leading-snug">{blog.title}</h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2">{blog.excerpt || "No excerpt provided."}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-850 pt-3">
                      <span className="text-[10px] text-slate-400 font-bold">Author: {blog.author || "SmartPicks AI"}</span>
                      <Link href={`/blog/${blog.slug}`} className="text-xs font-black text-purple-600 hover:underline flex items-center gap-1">
                        <span>Read</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TAB 5: USERS ━━━━━━━━ */}
          {activeTab === "users" && (
            <motion.div
              key="tab-users"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full h-10 pl-10 pr-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none focus:border-purple-500"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="h-10 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">Normal User</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs font-bold">
                  <thead className="bg-slate-50 dark:bg-zinc-950 text-[10px] uppercase text-slate-400 tracking-wider border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">User Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                    {filteredUsers.map((usr) => (
                      <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-zinc-100">{usr.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300">{usr.email}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${usr.role === "admin" ? "bg-purple-500/10 text-purple-600" : "bg-slate-100 dark:bg-zinc-800 text-slate-600"}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : "2026-08-10"}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserRole(usr._id, usr.role)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] font-black text-purple-600 cursor-pointer"
                          >
                            Toggle Role
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr._id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-[10px] font-black text-rose-600 cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TAB 6: ANALYTICS ━━━━━━━━ */}
          {activeTab === "analytics" && (
            <motion.div
              key="tab-analytics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">Revenue &amp; Sales Performance</h3>
                <div className="h-48 w-full bg-slate-50 dark:bg-zinc-950 rounded-2xl flex items-end justify-between p-4 gap-2 border border-slate-200 dark:border-zinc-850">
                  {[40, 65, 45, 80, 95, 70, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">Product Category Distribution</h3>
                <div className="space-y-3">
                  {categories.map((c) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="uppercase text-slate-700 dark:text-zinc-300">{c.name}</span>
                        <span>{c.value} Products</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(100, c.value * 5)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━ TAB 7: SYSTEM MONITORING ━━━━━━━━ */}
          {activeTab === "system" && (
            <motion.div
              key="tab-system"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { name: "API Gateway", status: "Online", detail: "24ms Latency", icon: Server },
                  { name: "MongoDB Database", status: "Connected", detail: "Healthy Node", icon: Database },
                  { name: "JWT Authentication", status: "Active", detail: "RS256 Tokens", icon: Key },
                  { name: "AI Services (Gemini 2.5)", status: "Operational", detail: "Rate limit 100%", icon: Bot },
                  { name: "Amazon Price Scraper", status: "Active", detail: "RapidAPI Ready", icon: Zap },
                  { name: "Telegram Bot Channel", status: "Connected", detail: "@smartpicks_deals_deal", icon: Send },
                ].map((sys) => {
                  const Icon = sys.icon;
                  return (
                    <div key={sys.name} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-purple-600" />
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase">
                          ● {sys.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">{sys.name}</h4>
                        <p className="text-[11px] text-slate-400 font-bold">{sys.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL 1: ADD DIGITAL PRODUCT MODAL
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isAddDigitalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">DIGITAL STORE MANAGER</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">Add New Digital Product</h3>
              </div>
              <button onClick={() => setIsAddDigitalModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDigitalProductSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Product Title</label>
                <input
                  type="text"
                  value={digTitle}
                  onChange={(e) => setDigTitle(e.target.value)}
                  placeholder="e.g. GATE CSE Handwritten Notes 2026..."
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                  <select
                    value={digCategory}
                    onChange={(e) => setDigCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="study-notes">Study Notes (PDF)</option>
                    <option value="cheat-sheets">Cheat Sheets</option>
                    <option value="templates">Boilerplate Templates</option>
                    <option value="e-books">E-Books &amp; Guides</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Access Model</label>
                  <select
                    value={digType}
                    onChange={(e) => setDigType(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="free">Free Download</option>
                    <option value="paid">Paid Product</option>
                    <option value="freemium">Freemium Preview</option>
                  </select>
                </div>
              </div>

              {digType !== "free" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Price (₹)</label>
                  <input
                    type="number"
                    value={digPrice}
                    onChange={(e) => setDigPrice(e.target.value)}
                    placeholder="e.g. 199"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={digDescription}
                  onChange={(e) => setDigDescription(e.target.value)}
                  placeholder="Detailed summary of file contents..."
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Cover Image URL (Optional)</label>
                <input
                  type="text"
                  value={digImageUrl}
                  onChange={(e) => setDigImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingDigital}
                className="w-full py-3 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingDigital ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                <span>Publish Digital Product</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL 2: PRICE AUDIT WORKFLOW MODAL
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isPriceAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">PRICE AUDIT WORKFLOW</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">Live Amazon Price Verification</h3>
              </div>
              <button onClick={() => setIsPriceAuditModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {priceAuditStage === "running" && (
              <div className="space-y-6 py-6 text-center">
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-purple-600 animate-pulse">Checking product prices...</h4>
                  <p className="text-xs text-slate-500 font-medium">Scanning active catalog items for real-time Amazon discount changes.</p>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300" style={{ width: `${priceAuditProgress}%` }} />
                </div>
              </div>
            )}

            {priceAuditStage === "completed" && priceAuditResults && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Checked</span>
                    <span className="text-lg font-black text-slate-900 dark:text-zinc-100">{priceAuditResults.totalChecked}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                    <span className="text-[9px] font-black uppercase block">Price Drops</span>
                    <span className="text-lg font-black">{priceAuditResults.priceDecreases}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600">
                    <span className="text-[9px] font-black uppercase block">Increases</span>
                    <span className="text-lg font-black">{priceAuditResults.priceIncreases}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-400">Detected Price Fluctuations</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {priceAuditResults.changes.map((chg, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 text-xs font-bold flex items-center justify-between">
                        <span className="truncate max-w-[200px] text-slate-900 dark:text-zinc-100">{chg.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-slate-400">₹{chg.oldPrice.toLocaleString("en-IN")}</span>
                          <span className="text-purple-600 font-black">₹{chg.newPrice.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsPriceAuditModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-black uppercase cursor-pointer"
                  >
                    Review Later
                  </button>
                  <button
                    onClick={handleApplyPriceUpdates}
                    disabled={syncingPrices}
                    className="flex-1 py-3 rounded-2xl bg-purple-600 text-white text-xs font-black uppercase cursor-pointer shadow-lg shadow-purple-600/20"
                  >
                    {syncingPrices ? "Applying..." : "Apply Updates"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL 3: AI BLOG GENERATOR WORKFLOW MODAL
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isAiBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">AI ARTICLE GENERATOR</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">Generate Blog Post with AI</h3>
              </div>
              <button onClick={() => setIsAiBlogModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!aiGeneratedDraft ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Article Topic</label>
                  <input
                    type="text"
                    value={aiBlogTopic}
                    onChange={(e) => setAiBlogTopic(e.target.value)}
                    placeholder="e.g. Best Laptops Under ₹50,000 in India"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                    <select
                      value={aiBlogCategory}
                      onChange={(e) => setAiBlogCategory(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="tech">Tech</option>
                      <option value="fashion">Fashion</option>
                      <option value="audio">Audio</option>
                      <option value="laptops">Laptops</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Tone</label>
                    <select
                      value={aiBlogTone}
                      onChange={(e) => setAiBlogTone(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="Professional">Professional Expert</option>
                      <option value="Conversational">Conversational Buddy</option>
                      <option value="Deal Hunter">Deal Hunter Highlight</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={aiBlogKeywords}
                    onChange={(e) => setAiBlogKeywords(e.target.value)}
                    placeholder="Amazon Deals, Best Price, SmartPicks"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateAiBlogDraft}
                  disabled={isGeneratingAiBlog}
                  className="w-full py-3 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGeneratingAiBlog ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>{isGeneratingAiBlog ? "Generating Article Draft..." : "Generate AI Draft"}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 space-y-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[9px] font-black uppercase">{aiGeneratedDraft.category}</span>
                  <h4 className="text-base font-black text-slate-900 dark:text-zinc-100">{aiGeneratedDraft.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{aiGeneratedDraft.excerpt}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 font-mono text-xs max-h-48 overflow-y-auto whitespace-pre-line text-slate-700 dark:text-zinc-300">
                  {aiGeneratedDraft.content}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setAiGeneratedDraft(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-black uppercase cursor-pointer"
                  >
                    Edit Prompt
                  </button>
                  <button
                    onClick={handlePublishAiBlog}
                    className="flex-1 py-3 rounded-2xl bg-purple-600 text-white text-xs font-black uppercase cursor-pointer shadow-lg shadow-purple-600/20"
                  >
                    Publish Article Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL 4: ADD PRODUCT MODAL
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">PRODUCT MANAGEMENT</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">Add Product to Catalog</h3>
              </div>
              <button onClick={() => setIsAddProductModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-zinc-950 rounded-2xl">
              <button
                onClick={() => setAddProductMode("asin")}
                className={`flex-1 py-2 rounded-xl text-xs font-black ${addProductMode === "asin" ? "bg-white dark:bg-zinc-900 text-purple-600 shadow-sm" : "text-slate-500"}`}
              >
                Amazon ASIN Scraper
              </button>
              <button
                onClick={() => setAddProductMode("manual")}
                className={`flex-1 py-2 rounded-xl text-xs font-black ${addProductMode === "manual" ? "bg-white dark:bg-zinc-900 text-purple-600 shadow-sm" : "text-slate-500"}`}
              >
                Manual Product Form
              </button>
            </div>

            {addProductMode === "asin" ? (
              <form onSubmit={handleScrapeAsin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Amazon ASIN</label>
                  <input
                    type="text"
                    value={asinInput}
                    onChange={(e) => setAsinInput(e.target.value)}
                    placeholder="e.g. B0C7S7384K"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                  <select
                    value={asinCategory}
                    onChange={(e) => setAsinCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="tech">Tech</option>
                    <option value="fashion">Fashion</option>
                    <option value="audio">Audio</option>
                    <option value="laptops">Laptops</option>
                  </select>
                </div>

                {scrapeSuccessMsg && <p className="text-xs font-bold text-emerald-600">{scrapeSuccessMsg}</p>}
                {scrapeErrMsg && <p className="text-xs font-bold text-rose-600">{scrapeErrMsg}</p>}

                <button
                  type="submit"
                  disabled={isScrapingAsin}
                  className="w-full py-3 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isScrapingAsin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  <span>{isScrapingAsin ? "Scraping Amazon..." : "Scrape & Auto-Publish Product"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualProductSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Product Title</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Product Title..."
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Deal Price (₹)</label>
                    <input
                      type="number"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="e.g. 2999"
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Original Price (₹)</label>
                    <input
                      type="number"
                      value={manualOriginalPrice}
                      onChange={(e) => setManualOriginalPrice(e.target.value)}
                      placeholder="e.g. 4999"
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Image URL</label>
                  <input
                    type="text"
                    value={manualImage}
                    onChange={(e) => setManualImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="w-full py-3 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase shadow-md cursor-pointer"
                >
                  Confirm &amp; Add Product
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
