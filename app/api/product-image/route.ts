/**
 * Amazon Product Image Proxy
 *
 * Because Amazon blocks hotlinking from third-party domains,
 * this proxy fetches images server-side (no Referer header) and
 * streams them back to the browser. Results are cached in-memory
 * for 24 hours to avoid hitting Amazon repeatedly.
 *
 * Usage:
 *   /api/product-image?asin=B0CHX1W1XY     ← resolve via SiteStripe widget
 *   /api/product-image?url=https://m.media-amazon.com/...   ← proxy direct URL
 */

import { NextResponse } from "next/server";

const AFFILIATE_TAG = "smartpick07d2-21";
const FALLBACK =
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80";

// In-memory URL cache: asin → resolved m.media-amazon.com URL
const urlCache = new Map<string, string>();

/** Resolves the real image URL from Amazon's SiteStripe widget HTML */
async function resolveByAsin(asin: string): Promise<string | null> {
  if (urlCache.has(asin)) return urlCache.get(asin)!;

  const widget = `https://ws-in.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL500_&ID=AsinImage&MarketPlace=IN&ServiceVersion=20070822&WS=1&tag=${AFFILIATE_TAG}`;

  try {
    const res = await fetch(widget, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
      },
    });
    const html = await res.text();
    // The widget returns: <a href="..."><img border="0" src="https://m.media-amazon.com/images/I/xxx.jpg" ></a>
    const match = html.match(
      /src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/
    );
    if (match?.[1]) {
      urlCache.set(asin, match[1]);
      return match[1];
    }
  } catch {
    // ignore
  }
  return null;
}

/** Fetches an image and streams it back with 24-hour cache headers */
async function proxyImage(imageUrl: string): Promise<NextResponse> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/*,*/*",
        // No Referer – this is the key to bypassing Amazon hotlink protection
      },
    });

    if (!res.ok) throw new Error(`Status ${res.status}`);

    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    // Fall back to redirect on any proxy error
    return NextResponse.redirect(FALLBACK);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get("asin");
  const directUrl = searchParams.get("url");

  // --- Option A: proxy a direct m.media-amazon.com URL ---
  if (directUrl) {
    return proxyImage(directUrl);
  }

  // --- Option B: resolve by ASIN then proxy ---
  if (asin && /^[A-Z0-9]{10}$/i.test(asin)) {
    const resolved = await resolveByAsin(asin.toUpperCase());
    if (resolved) return proxyImage(resolved);
  }

  return NextResponse.redirect(FALLBACK);
}
