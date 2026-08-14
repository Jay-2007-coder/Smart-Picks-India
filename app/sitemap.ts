import { MetadataRoute } from "next";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { getAllBlogs } from "@/lib/blogStore";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-picks-india.vercel.app";

  // Static Pages
  const routes = ["", "/deals", "/blog", "/about", "/contact", "/privacy-policy", "/disclaimer", "/terms"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  // Dynamic Categories
  const categoryRoutes = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Dynamic Products
  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Dynamic Blogs (fetches both static + MongoDB generated blogs)
  const allBlogs = await getAllBlogs().catch(() => []);
  const blogRoutes = allBlogs.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: b.dateModified || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}

