import { NextResponse } from "next/server";
import { products } from "@/data/products";
import { blogPosts } from "@/data/blogPosts";
import { categories } from "@/data/categories";
import Fuse from "fuse.js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Initialize Fuse instances
  const productFuse = new Fuse(products, {
    keys: [
      { name: "title", weight: 0.5 },
      { name: "description", weight: 0.2 },
      { name: "tags", weight: 0.2 },
      { name: "category", weight: 0.1 }
    ],
    threshold: 0.4,
  });

  // Fetch dynamic blogs and merge with static blogs for search indexing
  let allBlogs = [...blogPosts];
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/v1/blog`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        allBlogs = [...data.blogs, ...blogPosts];
      }
    }
  } catch (err) {
    console.error("Error fetching dynamic blogs for search:", err);
  }

  const blogFuse = new Fuse(allBlogs, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "excerpt", weight: 0.2 },
      { name: "tags", weight: 0.2 }
    ],
    threshold: 0.4,
  });

  const categoryFuse = new Fuse(categories, {
    keys: ["name", "slug"],
    threshold: 0.3,
  });

  const results = [];

  // Search Products
  const productMatches = productFuse.search(query);
  results.push(
    ...productMatches.map(({ item }) => ({
      slug: item.slug,
      title: item.title,
      type: "product" as const,
      image: item.image,
      category: item.category,
      price: item.price,
    }))
  );

  // Search Blogs
  const blogMatches = blogFuse.search(query);
  results.push(
    ...blogMatches.map(({ item }) => ({
      slug: item.slug,
      title: item.title,
      type: "blog" as const,
      image: item.image,
      category: item.category,
    }))
  );

  // Search Categories
  const categoryMatches = categoryFuse.search(query);
  results.push(
    ...categoryMatches.map(({ item }) => ({
      slug: item.slug,
      title: item.name,
      type: "category" as const,
    }))
  );

  // Return limited results
  return NextResponse.json({ results: results.slice(0, 10) });
}
