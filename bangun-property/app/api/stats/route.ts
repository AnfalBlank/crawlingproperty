import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/db/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public stats endpoint — used by the marketing home page to show real numbers
 * (areas tracked, total listings, total crawls). No PII, no per-area data,
 * lightly cached.
 */
export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(
      {
        totalAreas: stats.totalAreas,
        totalListings: stats.totalListings,
        totalCrawls: stats.totalCrawls,
        cacheHitRatio: stats.cacheHitRatio,
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
