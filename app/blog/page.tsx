import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlogClient from "@/components/BlogClient";
import { blogPosts } from "@/data/blogPosts";

export const metadata = generateSEOMetadata({
  title: "Blog & Buying Guides",
  description: "Read our latest expert reviews, buying guides, and tips for finding the best budget products in India.",
  canonical: "https://smart-picks-india.vercel.app/blog",
});

export default function BlogListingPage() {
  return (
    <div className="container-custom py-8">
      <Breadcrumbs items={[{ label: "Blog" }]} />

      <div className="mt-8 mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
          Latest Reviews &amp; Guides
        </h1>
        <p className="text-lg text-muted-foreground">
          In-depth analysis, top 10 lists, and buying advice to help you make smarter purchasing decisions.
        </p>
      </div>

      <BlogClient initialPosts={blogPosts} />
    </div>
  );
}
