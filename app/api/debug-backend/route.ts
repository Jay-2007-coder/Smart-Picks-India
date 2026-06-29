import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    backendUrl: process.env.BACKEND_API_URL || "http://localhost:5000",
    nodeEnv: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL || "Not set",
    nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL || "Not set",
  });
}
