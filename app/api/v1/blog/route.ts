import { NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/blogStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    return NextResponse.json({
      success: true,
      blogs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
