import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlogClient from "@/components/BlogClient";
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
    <div className="container-custom pt-8 pb-24">
      <Breadcrumbs items={[{ label: "Blog" }]} />

      <div className="mt-8 mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
          Latest Reviews &amp; Guides
        </h1>
        <p className="text-lg text-muted-foreground">
          In-depth analysis, top 10 lists, and buying advice to help you make smarter purchasing decisions.
        </p>
      </div>

      <BlogClient initialPosts={allPosts} />
    </div>
  );
}
