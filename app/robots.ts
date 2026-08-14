import { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`;
    }
  } catch {
    // fallback
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://smart-picks-india.vercel.app";
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getBaseUrl();
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: sitemapUrl,
  };
}

