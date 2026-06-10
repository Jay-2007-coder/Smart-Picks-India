import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  let sitemapUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://smart-picks-india.vercel.app"}/sitemap.xml`;
  if (sitemapUrl.includes("smartpicksindia.com")) {
    sitemapUrl = "https://smart-picks-india.vercel.app/sitemap.xml";
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: sitemapUrl,
  };
}
