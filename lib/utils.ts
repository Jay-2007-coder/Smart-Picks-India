import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function calculateDiscount(price: number, oldPrice: number): number {
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + "…" : text;
}

export function readingTime(text: string): string {
  const words = text.split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return `${mins} min read`;
}

export function getValidBlogImage(image?: string, category?: string): string {
  if (image && (image.startsWith("http://") || image.startsWith("https://"))) {
    return image;
  }
  const cat = (category || "").toLowerCase();
  if (cat.includes("deal") || cat.includes("buying") || cat.includes("shop")) {
    return "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80";
  }
  if (cat.includes("student") || cat.includes("study") || cat.includes("placement")) {
    return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80";
  }
  if (cat.includes("trend") || cat.includes("ai") || cat.includes("code")) {
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80";
  }
  if (cat.includes("kitchen")) {
    return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80";
}
