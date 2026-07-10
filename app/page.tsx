import HeroSection from "@/components/HeroSection";
import AIProductFinder from "@/components/AIProductFinder";
import AmbientBackground from "@/components/AmbientBackground";
import FlashDealsSection from "@/components/FlashDealsSection";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import BlogCard from "@/components/BlogCard";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import HomePersonalizer from "@/components/HomePersonalizer";
import NewsletterSection from "@/components/NewsletterSection";
import FAQAccordion from "@/components/FAQAccordion";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import AnimatedSectionHeader from "@/components/AnimatedSectionHeader";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { blogPosts as staticBlogs } from "@/data/blogPosts";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import {
  Zap,
  TrendingUp,
  ArrowRight,
  Clock,
  ShieldCheck,
  Bell,
  Brain,
  BookOpen,
  Target,
  Star,
  Sparkles,
  GraduationCap,
  FileText,
  Code2,
  Users,
} from "lucide-react";


export const revalidate = 60;

const homeFAQs = [
  {
    question: "Is Smart Picks India affiliated with Amazon?",
    answer:
      "Yes, we are an Amazon Associates affiliate. We earn a small commission when you purchase through our links, at no extra cost to you. This helps us keep the platform free and updated.",
  },
  {
    question: "Are your product reviews genuine?",
    answer:
      "All our reviews are based on thorough research, user feedback analysis, and hands-on testing where possible. We never accept paid reviews or sponsored placements. Our editorial independence is non-negotiable.",
  },
  {
    question: "How does the Price Drop Alert work?",
    answer:
      "Sign up for free, go to any product page, and set your target price. Our backend checks prices daily and sends you an email or Telegram message the moment the price drops to your target.",
  },
  {
    question: "What is the Student Hub?",
    answer:
      "Student Hub is a free suite of 15+ AI tools built for CS/IT students in India — including career roadmaps, AI skill tree builder, resume analyzer, interview prep, DSA code reviewer, and more. All powered by Google Gemini AI.",
  },
  {
    question: "How often are deals updated?",
    answer:
      "Our deals section is updated daily via automated scripts. Amazon prices change frequently, so we recommend checking the Amazon page for the final price before purchase as deals can expire quickly.",
  },
  {
    question: "Can I trust the prices shown?",
    answer:
      "Prices are updated regularly but may vary. Always check the current price on Amazon India before purchasing. Our 90-day price history charts help you verify if a deal is genuinely good or a fake discount.",
  },
];

const WHY_US = [
  {
    icon: ShieldCheck,
    title: "No Paid Reviews",
    desc: "Every recommendation is 100% editorial. We never accept money for product placements or rankings.",
    color: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  {
    icon: TrendingUp,
    title: "90-Day Price History",
    desc: "See if a deal is real. Our interactive charts expose fake discounts by showing price trends over 3 months.",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    glow: "shadow-blue-500/10",
  },
  {
    icon: Brain,
    title: "Gemini AI Powered",
    desc: "Describe your budget and needs in plain English — our AI instantly recommends the best products for you.",
    color: "from-violet-500/20 to-violet-600/5",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
    glow: "shadow-violet-500/10",
  },
  {
    icon: Bell,
    title: "Instant Drop Alerts",
    desc: "Set your target price. Get notified via Email or Telegram the moment any product crosses it.",
    color: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
];

const STUDENT_HUB_TOOLS = [
  { icon: Target, label: "AI Skill Tree", desc: "8-node career roadmap with quizzes", href: "/student-hub/ai-skill-tree", color: "text-violet-400" },
  { icon: FileText, label: "Resume Analyzer", desc: "ATS score + keyword gaps", href: "/student-hub/resume-analyzer", color: "text-blue-400" },
  { icon: Code2, label: "DSA Reviewer", desc: "Time/space complexity checker", href: "/student-hub/coding-helper", color: "text-emerald-400" },
  { icon: BookOpen, label: "Dev Roadmaps", desc: "Web Dev, AI/ML, DevOps paths", href: "/student-hub/roadmaps", color: "text-amber-400" },
  { icon: Users, label: "Interview Prep", desc: "Role-specific Q&A generator", href: "/student-hub/interview-generator", color: "text-rose-400" },
  { icon: GraduationCap, label: "Smart Notes", desc: "AI notes from your PDFs", href: "/student-hub/smart-notes", color: "text-cyan-400" },
];

async function getDynamicBlogs() {
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/v1/blog`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) return data.blogs;
    }
  } catch (err) {
    console.error("Failed to fetch dynamic blogs for homepage:", err);
  }
  return [];
}

export default async function HomePage() {
  const featuredProducts = [...products].reverse().filter((p) => p.featured).slice(0, 8);
  const trendingProducts = [...products].reverse().filter((p) => p.trending).slice(0, 4);

  const dynamicBlogs = await getDynamicBlogs();
  const allBlogs = [...dynamicBlogs, ...staticBlogs].sort((a, b) => {
    const dateA = new Date(a.datePublished).getTime() || 0;
    const dateB = new Date(b.datePublished).getTime() || 0;
    return dateB - dateA;
  });
  const featuredBlogs = allBlogs.filter((p) => p.featured).slice(0, 3);

  const todayDeals = [...products]
    .reverse()
    .filter((p) => p.oldPrice > p.price)
    .slice(0, 6)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      image: p.image,
      price: p.price,
      oldPrice: p.oldPrice,
      affiliateLink: p.affiliateLink,
      label: "🔥 Hot Deal",
      saved: p.oldPrice - p.price,
    }));

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category && p.category.toLowerCase() === cat.slug.toLowerCase()).length,
  }));

  return (
    <div className="relative overflow-hidden">
      <AmbientBackground />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <HeroSection heroProducts={[...products].reverse().slice(0, 4)} />

      {/* ── AI PRODUCT FINDER ────────────────────────────────────────────── */}
      <AIProductFinder />

      {/* ── FLASH DEALS ──────────────────────────────────────────────────── */}
      <FlashDealsSection />

      {/* ── TODAY'S BEST DEALS ───────────────────────────────────────────── */}
      {todayDeals.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="container-custom">
            <AnimatedSectionHeader
              eyebrow={<><Zap className="h-4 w-4" /> Flash Sales</>}
              eyebrowClass="text-brand-500"
              title="Today's Best Deals"
              subtitle="Prices verified daily · Click to see live price on Amazon"
              action={
                <Link href="/deals" className="btn-secondary hidden sm:flex text-sm gap-1.5">
                  View All Deals <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
              {todayDeals.map((deal) => {
                const discount = calculateDiscount(deal.price, deal.oldPrice);
                return (
                  <a
                    key={deal.slug}
                    href={deal.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="group relative rounded-2xl overflow-hidden flex flex-col bg-card border border-border/60 hover:border-brand-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300"
                  >
                    {/* Discount ribbon */}
                    <div className="absolute top-0 right-0 z-10">
                      <div className="bg-brand-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl">
                        -{discount}%
                      </div>
                    </div>
                    <div className="relative aspect-square overflow-hidden bg-muted/50">
                      <Image
                        src={deal.image}
                        alt={deal.title}
                        fill
                        sizes="200px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-3 flex flex-col gap-1.5 flex-1">
                      <span className="text-[10px] text-brand-500 font-bold tracking-wide">{deal.label}</span>
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{deal.title}</p>
                      <div className="mt-auto pt-1.5 border-t border-border/40">
                        <p className="text-sm font-black text-brand-600">{formatPrice(deal.price)}</p>
                        <p className="text-[10px] text-muted-foreground line-through">{formatPrice(deal.oldPrice)}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">Save {formatPrice(deal.saved)}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
            <div className="mt-6 sm:hidden">
              <Link href="/deals" className="btn-secondary w-full text-center text-sm">
                View All Deals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── RECENTLY VIEWED ──────────────────────────────────────────────── */}
      <RecentlyViewedBar />

      {/* ── WHY SMART PICKS INDIA ────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-custom">
          <AnimatedSectionHeader
            eyebrow={<><Sparkles className="h-4 w-4" /> Our Promise</>}
            title="Why 10,000+ Indians Trust Us"
            subtitle="Built by shoppers, for shoppers — with zero compromises on honesty."
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {WHY_US.map((item, i) => (
              <div
                key={item.title}
                className={`relative group rounded-3xl p-6 bg-gradient-to-br ${item.color} border ${item.border} hover:shadow-xl ${item.glow} transition-all duration-300 hover:-translate-y-1.5`}
              >
                <div className={`inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
                <h3 className="font-black text-foreground text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/20">
        <div className="container-custom">
          <AnimatedSectionHeader
            title="Shop by Category"
            subtitle="From tech to kitchen — find the best-reviewed products in every category"
            centered
          />
          <div className="mt-10">
            <CategoryGrid categories={categoriesWithCounts} />
          </div>
        </div>
      </section>

      {/* ── STUDENT HUB PROMO ────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        {/* Dark gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#080c18] via-[#0d1230] to-[#080c18]" />
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blue-600/8 blur-[100px]" />
        </div>
        <div className="container-custom relative z-10">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/15 border border-violet-500/25 text-violet-300 text-xs font-bold mb-5">
              <Brain className="h-3.5 w-3.5" />
              Free for Indian CS/IT Students
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Meet the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                Student Hub
              </span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
              15+ AI-powered tools to supercharge your career — roadmaps, interview prep, resume analysis, and more. All free, all powered by Google Gemini AI.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {STUDENT_HUB_TOOLS.map((tool) => (
              <Link
                key={tool.label}
                href={tool.href}
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] hover:-translate-y-1.5 transition-all duration-300 gap-3"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  <tool.icon className={`h-5 w-5 ${tool.color}`} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white/90">{tool.label}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/student-hub"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-black shadow-xl shadow-violet-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <GraduationCap className="h-5 w-5" />
              Explore Student Hub — It&apos;s Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PERSONALIZED FEED ────────────────────────────────────────────── */}
      <HomePersonalizer initialFeatured={featuredProducts} initialTrending={trendingProducts} />

      {/* ── BLOG POSTS ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/20">
        <div className="container-custom">
          <AnimatedSectionHeader
            eyebrow={<><BookOpen className="h-4 w-4" /> Buying Guides & Reviews</>}
            title="Research Before You Buy"
            subtitle="In-depth articles to help you make smarter purchasing decisions"
            action={
              <Link href="/blog" className="btn-secondary hidden sm:flex text-sm gap-1.5">
                All Articles <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {featuredBlogs.map((post, i) => (
              <BlogCard key={post.slug} post={post} priority={i === 0} index={i} />
            ))}
          </div>
          <div className="mt-8 sm:hidden">
            <Link href="/blog" className="btn-secondary w-full text-center text-sm">
              All Articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-custom">
          <NewsletterSection />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/20">
        <div className="container-custom max-w-3xl">
          <AnimatedSectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about Smart Picks India"
            centered
          />
          <div className="mt-10">
            <FAQAccordion faqs={homeFAQs} />
          </div>
          <div className="mt-8">
            <AffiliateDisclosure />
          </div>
        </div>
      </section>
    </div>
  );
}
