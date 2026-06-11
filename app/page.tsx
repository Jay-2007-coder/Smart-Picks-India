import HeroSection from "@/components/HeroSection";
import AIProductFinder from "@/components/AIProductFinder";
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
import { Zap, TrendingUp, ArrowRight, Clock } from "lucide-react";

export const revalidate = 60; // fetch fresh deals and blog posts every 60 seconds

const homeFAQs = [
  { question: "Is Smart Picks India affiliated with Amazon?", answer: "Yes, we are an Amazon Associates affiliate. We earn a small commission when you purchase through our links, at no extra cost to you." },
  { question: "Are your product reviews genuine?", answer: "All our reviews are based on thorough research, user feedback analysis, and hands-on testing where possible. We never recommend products we wouldn't use ourselves." },
  { question: "How do you select products to review?", answer: "We select products based on popularity, user demand, value for money, and brand reliability. We focus on budget-friendly options that offer the best bang for the rupee." },
  { question: "How often are deals updated?", answer: "Our deals section is updated daily. Amazon prices change frequently, so we recommend checking the Amazon page for the final price before purchase." },
  { question: "Can I trust the prices shown on your site?", answer: "Prices are updated regularly but may vary. Always check the current price on Amazon India before purchasing, as deals can expire quickly." },
];

async function getDynamicBlogs() {
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/v1/blog`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        return data.blogs;
      }
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
      expiresIn: "Ending soon",
    }));

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category && p.category.toLowerCase() === cat.slug.toLowerCase()).length,
  }));

  return (
    <div>
      {/* Hero */}
      <HeroSection heroProducts={[...products].reverse().slice(0, 4)} />

      {/* AI Product Recommendation Finder */}
      <AIProductFinder />

      {/* Super Flash Deals with Live Countdown Timers */}
      <FlashDealsSection />

      {/* Today's Flash Deals */}
      {todayDeals.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-background to-muted/30">
          <div className="container-custom">
            <AnimatedSectionHeader
              eyebrow={<><Zap className="h-4 w-4" /> Flash Sales</>}
              eyebrowClass="text-accent-500"
              title="Today's Best Deals"
              action={
                <Link href="/deals" className="btn-secondary hidden sm:flex text-sm">
                  View All Deals <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              {todayDeals.map((deal, i) => {
                const discount = calculateDiscount(deal.price, deal.oldPrice);
                return (
                  <a
                    key={deal.slug}
                    href={deal.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="card group overflow-hidden flex flex-col hover:shadow-lg hover:shadow-black/8 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={deal.image}
                        alt={deal.title}
                        fill
                        sizes="200px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="absolute top-2 left-2 badge bg-brand-600 text-white font-black text-xs">
                        -{discount}%
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <span className="text-xs text-accent-500 font-bold">{deal.label}</span>
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{deal.title}</p>
                      <p className="text-sm font-black text-brand-600 mt-auto">{formatPrice(deal.price)}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {deal.expiresIn} left
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
            <div className="mt-4 sm:hidden">
              <Link href="/deals" className="btn-secondary w-full text-center text-sm">
                View All Deals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      <RecentlyViewedBar />

      {/* Categories */}
      <section className="py-16">
        <div className="container-custom">
          <AnimatedSectionHeader
            title="Shop by Category"
            subtitle="Find the best products in every category"
            centered
          />
          <div className="mt-10">
            <CategoryGrid categories={categoriesWithCounts} />
          </div>
        </div>
      </section>

      {/* Personalized Feed Control & Product Listings */}
      <HomePersonalizer initialFeatured={featuredProducts} initialTrending={trendingProducts} />

      {/* Blog Posts */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <AnimatedSectionHeader
            title="Latest Reviews & Guides"
            subtitle="In-depth articles to help you buy smarter"
            action={
              <Link href="/blog" className="btn-secondary hidden sm:flex text-sm">
                All Articles <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {featuredBlogs.map((post, i) => (
              <BlogCard key={post.slug} post={post} priority={i === 0} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="container-custom">
          <NewsletterSection />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom max-w-3xl">
          <AnimatedSectionHeader title="Frequently Asked Questions" centered />
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
