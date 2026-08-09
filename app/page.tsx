import FlashDealsSection from "@/components/FlashDealsSection";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import BlogCard from "@/components/BlogCard";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import HomePersonalizer from "@/components/HomePersonalizer";
import NewsletterSection from "@/components/NewsletterSection";
import FAQAccordion from "@/components/FAQAccordion";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import AIProductFinder from "@/components/AIProductFinder";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { blogPosts as staticBlogs } from "@/data/blogPosts";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Brain,
  Bell,
  Zap,
  BookOpen,
  Target,
  FileText,
  Code2,
  Users,
  GraduationCap,
  CheckCircle2,
  Star,
  Sparkles,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Page-level static data
───────────────────────────────────────────────────────── */

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
  },
  {
    icon: TrendingUp,
    title: "90-Day Price History",
    desc: "See if a deal is real. Our charts expose fake discounts by showing 3 months of price trends.",
  },
  {
    icon: Brain,
    title: "Gemini AI Powered",
    desc: "Describe your budget and needs in plain English — our AI instantly recommends the best products.",
  },
  {
    icon: Bell,
    title: "Price Drop Alerts",
    desc: "Set your target price. Get notified via Email or Telegram the moment any product crosses it.",
  },
];

const STUDENT_HUB_TOOLS = [
  { icon: Target,       label: "AI Skill Tree",    desc: "8-node career roadmap",       href: "/student-hub/ai-skill-tree"          },
  { icon: FileText,     label: "Resume Analyzer",  desc: "ATS score + keyword gaps",    href: "/student-hub/resume-analyzer"        },
  { icon: Code2,        label: "DSA Reviewer",     desc: "Time/space complexity check", href: "/student-hub/coding-helper"          },
  { icon: BookOpen,     label: "Dev Roadmaps",     desc: "Web Dev, AI/ML, DevOps paths",href: "/student-hub/roadmaps"              },
  { icon: Users,        label: "Interview Prep",   desc: "Role-specific Q&A generator", href: "/student-hub/interview-generator"   },
  { icon: GraduationCap, label: "Smart Notes",     desc: "AI notes from your PDFs",     href: "/student-hub/smart-notes"           },
];

/* ─────────────────────────────────────────────────────────
   Data fetching
───────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */

export default async function HomePage() {
  const featuredProducts  = [...products].reverse().filter((p) => p.featured).slice(0, 8);
  const trendingProducts  = [...products].reverse().filter((p) => p.trending).slice(0, 4);
  const heroProducts      = [...products].reverse().filter((p) => p.featured).slice(0, 4);

  const dynamicBlogs = await getDynamicBlogs();
  const allBlogs     = [...dynamicBlogs, ...staticBlogs].sort((a, b) => {
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
      slug:          p.slug,
      title:         p.title,
      image:         p.image,
      price:         p.price,
      oldPrice:      p.oldPrice,
      affiliateLink: p.affiliateLink,
      saved:         p.oldPrice - p.price,
    }));

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: products.filter(
      (p) => p.category && p.category.toLowerCase() === cat.slug.toLowerCase()
    ).length,
  }));

  const activeDeals = products.filter((p) => p.oldPrice > p.price).length;

  return (
    <div>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section
        className="border-b border-border bg-background"
        aria-labelledby="hero-heading"
      >
        <div className="container-custom py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — headline + CTAs */}
            <div className="max-w-xl">

              {/* Label */}
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground mb-6">
                <Sparkles className="h-3 w-3 text-brand-600" strokeWidth={2} aria-hidden="true" />
                India&apos;s most trusted product platform
              </div>

              {/* Headline */}
              <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-foreground leading-[1.08]">
                The smartest way to shop{" "}
                <span className="text-brand-600">Amazon India</span>
              </h1>

              <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-lg">
                Handpicked deals, 90-day price history charts, AI-powered
                recommendations, and real-time price drop alerts — all in one place.
              </p>

              {/* Trust signals */}
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="Key features">
                {[
                  "No sponsored reviews",
                  "90-day price charts",
                  "Telegram + email alerts",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" strokeWidth={2} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/deals" className="btn-primary btn-lg">
                  Browse deals
                  <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </Link>
                <Link href="/student-hub" className="btn-secondary btn-lg">
                  Student Hub — free
                </Link>
              </div>
            </div>

            {/* Right — product preview grid */}
            <div className="relative hidden lg:block" aria-hidden="true">
              <div className="grid grid-cols-2 gap-3">
                {heroProducts.map((product, i) => {
                  const discount = calculateDiscount(product.price, product.oldPrice);
                  return (
                    <Link
                      key={product.slug}
                      href={`/product/${product.slug}`}
                      className="group card-hover p-3 flex flex-col gap-2.5 cursor-pointer"
                      tabIndex={-1}
                    >
                      <div className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="200px"
                          className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                          priority={i < 2}
                        />
                        {discount > 0 && (
                          <span className="absolute top-1.5 left-1.5 badge-brand text-[10px]">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                          {product.title}
                        </p>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-muted/30" aria-label="Platform statistics">
        <div className="container-custom">
          <dl className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            {[
              { label: "Products reviewed",   value: `${products.length}+`  },
              { label: "Active deals",        value: `${activeDeals}+`      },
              { label: "Categories",          value: `${categories.length}` },
              { label: "Trusted by shoppers", value: "10,000+"              },
            ].map((stat) => (
              <div key={stat.label} className="py-5 px-6 sm:py-6 sm:px-8 flex flex-col gap-1">
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="text-xl font-bold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          AI PRODUCT FINDER
      ══════════════════════════════════════════════════ */}
      <AIProductFinder />

      {/* ══════════════════════════════════════════════════
          FLASH DEALS (live, client component)
      ══════════════════════════════════════════════════ */}
      <FlashDealsSection />

      {/* ══════════════════════════════════════════════════
          TODAY'S BEST DEALS
      ══════════════════════════════════════════════════ */}
      {todayDeals.length > 0 && (
        <section className="py-16 sm:py-20 border-b border-border" aria-labelledby="deals-heading">
          <div className="container-custom">

            {/* Section header */}
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <p className="section-label flex items-center gap-1.5 mb-2">
                  <Zap className="h-3.5 w-3.5 text-brand-600" strokeWidth={2} aria-hidden="true" />
                  Flash Sales
                </p>
                <h2 id="deals-heading" className="section-title">Today&apos;s Best Deals</h2>
                <p className="section-subtitle">
                  Prices verified daily · Click to see live price on Amazon
                </p>
              </div>
              <Link href="/deals" className="btn-secondary btn-sm shrink-0 hidden sm:inline-flex">
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>

            {/* Deals grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {todayDeals.map((deal) => {
                const discount = calculateDiscount(deal.price, deal.oldPrice);
                return (
                  <a
                    key={deal.slug}
                    href={deal.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label={`${deal.title} — ${formatPrice(deal.price)}`}
                    className="group card-hover flex flex-col overflow-hidden"
                  >
                    <div className="relative aspect-square bg-white overflow-hidden">
                      <Image
                        src={deal.image}
                        alt={deal.title}
                        fill
                        sizes="180px"
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 right-2 badge-brand text-[10px]">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1.5 flex-1">
                      <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                        {deal.title}
                      </p>
                      <div className="mt-auto pt-2 border-t border-border">
                        <p className="text-sm font-bold text-foreground">{formatPrice(deal.price)}</p>
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(deal.oldPrice)}</p>
                        <p className="text-xs text-green-600 font-medium dark:text-green-400">
                          Save {formatPrice(deal.saved)}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="mt-5 sm:hidden">
              <Link href="/deals" className="btn-secondary w-full justify-center">
                View all deals
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          RECENTLY VIEWED
      ══════════════════════════════════════════════════ */}
      <RecentlyViewedBar />

      {/* ══════════════════════════════════════════════════
          WHY SMART PICKS INDIA
      ══════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-muted/30 border-y border-border" aria-labelledby="why-us-heading">
        <div className="container-custom">

          <div className="text-center mb-10">
            <p className="section-label mb-2">Our Promise</p>
            <h2 id="why-us-heading" className="section-title">Why 10,000+ Indians trust us</h2>
            <p className="section-subtitle mx-auto">
              Built by shoppers, for shoppers — with zero compromises on honesty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="card p-6 flex flex-col gap-4 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border">
                  <item.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SHOP BY CATEGORY
      ══════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20" aria-labelledby="categories-heading">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 id="categories-heading" className="section-title">Shop by category</h2>
            <p className="section-subtitle mx-auto">
              From tech to kitchen — the best-reviewed picks in every category
            </p>
          </div>
          <CategoryGrid categories={categoriesWithCounts} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STUDENT HUB PROMO
      ══════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-muted/30 border-y border-border" aria-labelledby="student-hub-heading">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text */}
            <div>
              <p className="section-label mb-3 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                Free for Indian CS / IT students
              </p>
              <h2 id="student-hub-heading" className="section-title mb-4">
                Meet the Student Hub
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                15+ AI-powered tools to supercharge your career — roadmaps, interview
                prep, resume analysis, DSA review, and more. All free, all powered by
                Google Gemini AI.
              </p>
              <Link
                href="/student-hub"
                className="btn-primary"
                aria-label="Explore Student Hub — free AI career tools"
              >
                Explore Student Hub
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>

            {/* Tool grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="list" aria-label="Student Hub tools">
              {STUDENT_HUB_TOOLS.map((tool) => (
                <Link
                  key={tool.label}
                  href={tool.href}
                  role="listitem"
                  className="card p-4 flex flex-col gap-3 hover:shadow-sm hover:border-gray-300 dark:hover:border-border transition-shadow duration-200 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted border border-border group-hover:border-gray-300 dark:group-hover:border-border transition-colors duration-200">
                    <tool.icon className="h-4.5 w-4.5 text-foreground" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-none mb-1.5">{tool.label}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{tool.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PERSONALIZED FEED (client — recently viewed / featured)
      ══════════════════════════════════════════════════ */}
      <HomePersonalizer initialFeatured={featuredProducts} initialTrending={trendingProducts} />

      {/* ══════════════════════════════════════════════════
          BLOG
      ══════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-muted/30 border-y border-border" aria-labelledby="blog-heading">
        <div className="container-custom">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <p className="section-label flex items-center gap-1.5 mb-2">
                <BookOpen className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                Buying Guides &amp; Reviews
              </p>
              <h2 id="blog-heading" className="section-title">Research before you buy</h2>
              <p className="section-subtitle">
                In-depth articles to help you make smarter purchasing decisions
              </p>
            </div>
            <Link href="/blog" className="btn-secondary btn-sm shrink-0 hidden sm:inline-flex">
              All articles
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredBlogs.map((post, i) => (
              <BlogCard key={post.slug} post={post} priority={i === 0} index={i} />
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link href="/blog" className="btn-secondary w-full justify-center">
              All articles
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20" aria-label="Newsletter signup">
        <div className="container-custom">
          <NewsletterSection />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-muted/30 border-y border-border" aria-labelledby="faq-heading">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-10">
            <h2 id="faq-heading" className="section-title">Frequently asked questions</h2>
            <p className="section-subtitle mx-auto">
              Everything you need to know about Smart Picks India
            </p>
          </div>
          <FAQAccordion faqs={homeFAQs} />
          <div className="mt-8">
            <AffiliateDisclosure />
          </div>
        </div>
      </section>
    </div>
  );
}
