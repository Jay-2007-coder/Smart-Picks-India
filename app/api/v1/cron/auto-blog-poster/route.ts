import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60s for AI generation

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Verify Vercel Cron secret if configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized cron request" },
        { status: 401 }
      );
    }

    // Call our own Next.js generate-ai-blog route
    // This uses Gemini AI + saves directly to MongoDB — works even when Render is sleeping
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const res = await fetch(`${siteUrl}/api/v1/blog/generate-ai-blog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass cron secret so the generate route can identify internal calls if needed
        ...(cronSecret ? { "x-cron-secret": cronSecret } : {}),
      },
      body: JSON.stringify({ topic: "auto" }),
    });

    const data = await res.json();
    console.log(
      `✅ Daily cron blog posted: "${data?.blog?.title || "unknown"}" — ${new Date().toISOString()}`
    );
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Vercel Cron auto-blog-poster failed:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to trigger auto blog poster" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
