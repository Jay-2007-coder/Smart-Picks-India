const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "smartpick07d2-21";

export function appendAffiliateTag(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("tag", AMAZON_TAG);
    parsed.searchParams.set("linkCode", "ll1");
    parsed.searchParams.set("language", "en_IN");
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tag=${AMAZON_TAG}`;
  }
}

export function buildAmazonSearchLink(query: string): string {
  const base = "https://www.amazon.in/s";
  const params = new URLSearchParams({ k: query, tag: AMAZON_TAG });
  return `${base}?${params.toString()}`;
}

export function isAmazonUrl(url: string): boolean {
  return url.includes("amazon.in") || url.includes("amzn");
}
