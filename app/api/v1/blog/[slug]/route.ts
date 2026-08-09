import { NextResponse } from "next/server";
import { getBlogBySlug } from "@/lib/blogStore";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: `Blog post '${slug}' not found.` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
