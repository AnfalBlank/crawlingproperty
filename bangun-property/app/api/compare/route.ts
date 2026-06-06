import { NextRequest, NextResponse } from "next/server";
import { analyzeArea } from "@/lib/services/analysis-service";
import { AreaComparisonItem } from "@/types";
import { formatNumber } from "@/lib/utils";
import { rateLimit, getClientIp, LIMITS } from "@/lib/services/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/compare  { areas: string[] }  (PRD §19, §20)
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, "compare", LIMITS.compare.limit, LIMITS.compare.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: { areas?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const areas = (body.areas || []).filter(Boolean).slice(0, 5); // PRD §19 max 5
  if (areas.length < 1) {
    return NextResponse.json({ error: "At least one area required" }, { status: 400 });
  }

  try {
    const items: AreaComparisonItem[] = [];
    for (const area of areas) {
      const { analysis } = await analyzeArea(area);
      const s = analysis.summary;
      items.push({
        areaName: analysis.area,
        listings: s.totalListings,
        avgRent: s.avgPrice,
        medianRent: s.medianPrice,
        fairPrice: s.fairPrice,
        avgSqft: s.avgSqft,
        pricePerSqft: s.avgPricePerSqft,
      });
    }

    // Smart recommendation (PRD §20) — lowest price/sqft = best value
    let recommendation = "";
    if (items.length >= 2) {
      const best = items.reduce((p, c) => (c.pricePerSqft < p.pricePerSqft ? c : p));
      recommendation = `${best.areaName} provides the best value among selected areas due to the lowest price per sqft (RM${formatNumber(best.pricePerSqft, 2)}/sqft).`;
    }

    return NextResponse.json({ areas: items, recommendation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
