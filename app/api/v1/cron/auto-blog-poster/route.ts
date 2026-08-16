import { NextResponse } from "next/server";
import { POST as generateAiBlogPost } from "@/app/api/v1/blog/generate-ai-blog/route";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60s for AI generation

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const isManual = url.searchParams.get("manual") === "true";

    // Verify Vercel Cron secret if configured (unless manual admin trigger)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isManual) {
      return NextResponse.json(
        { success: false, message: "Unauthorized cron request" },
        { status: 401 }
      );
    }

    // Call internal POST handler directly — zero loopback network issues on Vercel
    const req = new Request("http://localhost/api/v1/blog/generate-ai-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "auto" }),
    });

    return await generateAiBlogPost(req);
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
