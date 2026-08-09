import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/v1/blog/generate-ai-blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "auto" }),
    });

    const data = await res.json();
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
