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

const ASIN_MAP: Record<string, string> = {
  "B0CHX1W1XY": "https://m.media-amazon.com/images/I/71657TiFeHL._SL1500_.jpg", // Apple iPhone 15
  "B0DZXTVL6V": "https://m.media-amazon.com/images/I/61c3+AAop3L._SL1500_.jpg", // boAt Airdopes Plus 311
  "B09B1NKKP6": "https://m.media-amazon.com/images/I/71fRHT5v7FL._SX679_.jpg",   // Echo Show 8
  "B0D5CSNLT2": "https://m.media-amazon.com/images/I/41+w1kM10xL._SX679_.jpg",   // Fire TV Stick HD
  "B08V8R3RMB": "https://m.media-amazon.com/images/I/51TjJOTfslL._SX679_.jpg",   // Philips Air Fryer
  "B00K3G8K1S": "https://m.media-amazon.com/images/I/41FUvMUmrUL._SX679_.jpg",   // LG Solo Microwave
  "B097RD2JZ7": "https://m.media-amazon.com/images/I/61xjQLSNw3L._SX679_.jpg",   // OnePlus Nord CE 5G
  "B0D9BGD7H7": "https://m.media-amazon.com/images/I/61nFB4NFVKL._SX679_.jpg",   // Realme Buds T310
  "B0CM353R5D": "https://m.media-amazon.com/images/I/71mLCnbhMrL._SX679_.jpg",   // Amazfit Smartwatch
  "B09R1NDHL2": "https://m.media-amazon.com/images/I/71Tz+AGLXDL._SY741_.jpg",   // Pilgrim Body Lotion
  "B0CQXGG8YY": "https://m.media-amazon.com/images/I/71wl5F6BCAL._SX679_.jpg",   // Ninja Air Fryer Pro
  "B0BLV169G7": "https://m.media-amazon.com/images/I/81gCxABPHYL._SX679_.jpg",   // Ceramic Vases Set of 2
};

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
    const cleanAsin = asin.toUpperCase();
    
    // Check static lookup first to bypass deprecated/broken widgets
    if (ASIN_MAP[cleanAsin]) {
      return proxyImage(ASIN_MAP[cleanAsin]);
    }

    const resolved = await resolveByAsin(cleanAsin);
    if (resolved) return proxyImage(resolved);
  }

  return NextResponse.redirect(FALLBACK);
}
