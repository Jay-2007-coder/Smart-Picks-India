import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import BlogCard from "@/components/BlogCard";
import NewsletterSection from "@/components/NewsletterSection";
import FAQAccordion from "@/components/FAQAccordion";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { blogPosts } from "@/data/blogPosts";
import { deals } from "@/data/deals";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Zap, TrendingUp, ArrowRight, Clock } from "lucide-react";

const homeFAQs = [
  { question: "Is Smart Picks India affiliated with Amazon?", answer: "Yes, we are an Amazon Associates affiliate. We earn a small commission when you purchase through our links, at no extra cost to you." },
  { question: "Are your product reviews genuine?", answer: "All our reviews are based on thorough research, user feedback analysis, and hands-on testing where possible. We never recommend products we wouldn't use ourselves." },
  { question: "How do you select products to review?", answer: "We select products based on popularity, user demand, value for money, and brand reliability. We focus on budget-friendly options that offer the best bang for the rupee." },
  { question: "How often are deals updated?", answer: "Our deals section is updated daily. Amazon prices change frequently, so we recommend checking the Amazon page for the final price before purchase." },
  { question: "Can I trust the prices shown on your site?", answer: "Prices are updated regularly but may vary. Always check the current price on Amazon India before purchasing, as deals can expire quickly." },
];

export default function HomePage() {
  const featuredProducts = [...products].reverse().filter((p) => p.featured).slice(0, 8);
  const trendingProducts = [...products].reverse().filter((p) => p.trending).slice(0, 4);
  const featuredBlogs = [...blogPosts].reverse().filter((p) => p.featured).slice(0, 3);
  
  // Dynamically calculate deals from products
  const todayDeals = [...products].reverse()
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

  // Dynamically calculate category counts
  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category && p.category.toLowerCase() === cat.slug.toLowerCase()).length,
  }));

  return (
    <div>
      {/* Hero */}
      <HeroSection heroProducts={[...products].reverse().slice(0, 4)} />

      {/* Today's Flash Deals */}
      {todayDeals.length > 0 && (
        <section className="py-14 bg-gradient-to-b from-background to-muted/30">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-5 w-5 text-accent-500" />
                  <span className="text-sm font-semibold text-accent-500 uppercase tracking-wide">Flash Sales</span>
                </div>
                <h2 className="section-title">Today&apos;s Best Deals</h2>
              </div>
              <Link href="/deals" className="btn-secondary hidden sm:flex text-sm">
                View All Deals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {todayDeals.map((deal) => {
                const discount = calculateDiscount(deal.price, deal.oldPrice);
                return (
                  <a
                    key={deal.slug}
                    href={deal.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="card group overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={deal.image}
                        alt={deal.title}
                        fill
                        sizes="200px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 badge bg-brand-600 text-white font-bold">
                        -{discount}%
                      </span>
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <span className="text-xs text-accent-500 font-semibold">{deal.label}</span>
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{deal.title}</p>
                      <p className="text-sm font-bold text-brand-600 mt-auto">{formatPrice(deal.price)}</p>
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

      {/* Categories */}
      <section className="py-14">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find the best products in every category</p>
          </div>
          <CategoryGrid categories={categoriesWithCounts} />
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-14 bg-muted/30">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Top Rated Products</h2>
                <p className="section-subtitle">Editor&apos;s best picks this month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.slug} product={product} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="py-14">
          <div className="container-custom">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <h2 className="section-title">Trending Right Now</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts */}
      <section className="py-14 bg-muted/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Latest Reviews &amp; Guides</h2>
              <p className="section-subtitle">In-depth articles to help you buy smarter</p>
            </div>
            <Link href="/blog" className="btn-secondary hidden sm:flex text-sm">
              All Articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBlogs.map((post, i) => (
              <BlogCard key={post.slug} post={post} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-14">
        <div className="container-custom">
          <NewsletterSection />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-muted/30">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <FAQAccordion faqs={homeFAQs} />
        </div>
      </section>

      {/* Affiliate Disclosure */}
      <section className="pb-14">
        <div className="container-custom max-w-3xl">
          <AffiliateDisclosure />
        </div>
      </section>
    </div>
  );
}
