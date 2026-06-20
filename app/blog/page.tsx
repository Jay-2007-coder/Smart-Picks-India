import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlogClient from "@/components/BlogClient";
import NewsletterSection from "@/components/NewsletterSection";
import { blogPosts as staticPosts } from "@/data/blogPosts";

export const revalidate = 60; // fetch new posts and cache for 60 seconds

export const metadata = generateSEOMetadata({
  title: "Blog & Buying Guides",
  description: "Read our latest expert reviews, buying guides, and tips for finding the best budget products in India.",
  canonical: "https://smart-picks-india.vercel.app/blog",
});

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
    console.error("Failed to fetch dynamic blogs:", err);
  }
  return [];
}

export default async function BlogListingPage() {
  const dynamicPosts = await getDynamicBlogs();

  // Merge dynamic database blogs with local static blogs and sort by datePublished desc
  const allPosts = [...dynamicPosts, ...staticPosts].sort((a, b) => {
    const dateA = new Date(a.datePublished).getTime() || 0;
    const dateB = new Date(b.datePublished).getTime() || 0;
    return dateB - dateA;
  });

  return (
    <div className="container-custom pt-8 pb-24 space-y-16 relative">
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Blog" }]} />
        <BlogClient initialPosts={allPosts} />
      </div>

      <div className="pt-8 border-t border-border/50">
        <NewsletterSection />
      </div>
    </div>
  );
}
