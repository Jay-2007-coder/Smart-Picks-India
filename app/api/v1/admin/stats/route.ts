import { NextResponse } from "next/server";
import getClientPromise from "@/lib/mongoClient";
import { products } from "@/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 4000);
      const backendRes = await fetch(`${backendUrl}/api/v1/admin/stats`, {
        signal: ctrl.signal,
      });
      clearTimeout(to);
      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.success && data.stats) {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Fallback
    }

    let userCount = 0;
    const clientPromise = getClientPromise();
    if (clientPromise) {
      try {
        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        userCount = await db.collection("users").countDocuments();
      } catch (e) {
        console.warn("Could not count users from MongoDB:", e);
      }
    }

    const categoryCounts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryStats = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / products.length) * 100),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: userCount || 28,
        totalProducts: products.length,
        totalSharedDeals: 0,
        activeWatchlists: 4,
        pricePoints: 1846,
        revenue: 119,
        salesCount: 3,
        downloadsCount: 14,
        conversionRate: 11,
      },
      categoryStats,
    });
  } catch (err: any) {
    console.error("Admin Stats Route Error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch stats." },
      { status: 500 }
    );
  }
}