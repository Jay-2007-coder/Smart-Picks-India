import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlogClient from "@/components/BlogClient";
import NewsletterSection from "@/components/NewsletterSection";
import { getAllBlogs } from "@/lib/blogStore";

export const dynamic = "force-dynamic"; // always read fresh blogs from disk

export const metadata = generateSEOMetadata({
  title: "Blog & Buying Guides",
  description: "Read our latest expert reviews, buying guides, and tips for finding the best budget products in India.",
  canonical: "https://smart-picks-india.vercel.app/blog",
});

export default async function BlogListingPage() {
  const allPosts = await getAllBlogs();

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
