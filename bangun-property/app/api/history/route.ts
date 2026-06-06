import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/db/repository";
import { rateLimit, getClientIp, LIMITS } from "@/lib/services/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/history?area=Bangsar&days=60
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, "search", LIMITS.search.limit, LIMITS.search.windowMs);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const area = (searchParams.get("area") || "").trim();
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "60", 10), 7), 365);
  if (!area) return NextResponse.json({ error: "area required" }, { status: 400 });

  try {
    const points = await getPriceHistory(area, days);
    return NextResponse.json({ area, days, points });
  } catch (e) {
    const m = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
