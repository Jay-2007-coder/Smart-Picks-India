import { NextResponse } from "next/server";
import { products } from "@/data/products";
import { blogPosts } from "@/data/blogPosts";
import { categories } from "@/data/categories";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = [];

  // Search Products
  const matchedProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query))
  );

  results.push(
    ...matchedProducts.map((p) => ({
      slug: p.slug,
      title: p.title,
      type: "product",
      image: p.image,
    }))
  );

  // Search Blogs
  const matchedBlogs = blogPosts.filter(
    (b) =>
      b.title.toLowerCase().includes(query) ||
      b.tags.some((t) => t.toLowerCase().includes(query))
  );

  results.push(
    ...matchedBlogs.map((b) => ({
      slug: b.slug,
      title: b.title,
      type: "blog",
      image: b.image,
    }))
  );

  // Search Categories
  const matchedCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(query)
  );

  results.push(
    ...matchedCategories.map((c) => ({
      slug: c.slug,
      title: c.name,
      type: "category",
    }))
  );

  // Limit results
  return NextResponse.json({ results: results.slice(0, 8) });
}
