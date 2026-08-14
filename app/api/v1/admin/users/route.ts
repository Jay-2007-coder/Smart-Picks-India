import { NextResponse } from "next/server";
import getClientPromise from "@/lib/mongoClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 4000);
      const backendRes = await fetch(`${backendUrl}/api/v1/admin/users`, {
        signal: ctrl.signal,
      });
      clearTimeout(to);
      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.success && Array.isArray(data.users)) {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Fallback to direct MongoDB fetch
    }

    const clientPromise = getClientPromise();
    if (!clientPromise) {
      return NextResponse.json({ success: true, users: [] });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    const usersCollection = db.collection("users");

    const rawUsers = await usersCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const users = rawUsers.map((u) => ({
      _id: u._id.toString(),
      name: u.name || u.displayName || (u.email ? u.email.split("@")[0] : "User"),
      email: u.email || "",
      role: u.role || "user",
      telegramChatId: u.telegramChatId || u.telegramId || null,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (err: any) {
    console.error("Admin Users Route Error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch users." },
      { status: 500 }
    );
  }
}
