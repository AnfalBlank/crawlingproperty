import { NextRequest, NextResponse } from "next/server";
import { analyzeArea } from "@/lib/services/analysis-service";
import { rateLimit, getClientIp, LIMITS } from "@/lib/services/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── GET /api/analyze?area=Mont+Kiara ─────────────────────────────────────────
// Synchronous analyze (used by comparison + cache hits). For interactive UI,
// prefer the async /api/jobs flow.
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, "analyze", LIMITS.analyze.limit, LIMITS.analyze.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  const url = searchParams.get("url");
  const force = searchParams.get("force") === "true";
  const cacheOnly = searchParams.get("cacheOnly") === "1";

  const target = area || url;
  if (!target) {
    return NextResponse.json({ error: "Area or URL parameter required" }, { status: 400 });
  }
  if (url && !isValidSpeedhomeInput(url)) {
    return NextResponse.json({ error: "Invalid SPEEDHOME URL" }, { status: 400 });
  }
  if (target.length > 200) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  try {
    // cacheOnly mode — return cache hit only, never trigger a fresh crawl.
    // Used by the comparison panel to decide whether to enqueue an async job.
    if (cacheOnly) {
      const { getCachedAnalysis } = await import("@/lib/db/repository");
      const { areaToSlug } = await import("@/lib/crawler/speedhome");
      const cached = await getCachedAnalysis(areaToSlug(target));
      if (cached) {
        return NextResponse.json({ ...cached.analysis, _cached: true });
      }
      return NextResponse.json({ error: "not cached" }, { status: 404 });
    }

    const { analysis, cached } = await analyzeArea(target, { forceRefresh: force });
    return NextResponse.json({ ...analysis, _cached: cached });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("[/api/analyze] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function isValidSpeedhomeInput(input: string): boolean {
  if (!input.includes("speedhome.com")) return false;
  try {
    const u = new URL(input.startsWith("http") ? input : `https://${input}`);
    return u.hostname.endsWith("speedhome.com");
  } catch {
    return false;
  }
}
