import { NextRequest, NextResponse } from "next/server";
import {
  getAdminStats, getCrawlJobs, getScanHistory,
  deleteScanHistory, clearCache, getCacheStats,
} from "@/lib/db/repository";
import { getRates, refreshExchangeRates } from "@/lib/services/exchange-rates";
import { enqueueAnalysis, jobToDTO } from "@/lib/services/job-queue";
import { checkAdminAuth } from "@/lib/services/admin-auth";
import { rateLimit, getClientIp, LIMITS } from "@/lib/services/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── GET /api/admin?type=stats|jobs|history|cache|rates ──────────────────────
export async function GET(request: NextRequest) {
  // Admin auth — read endpoints leak job/history/rate data, gate them too
  const auth = checkAdminAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "stats";

  try {
    switch (type) {
      case "stats": {
        const [stats, cache] = await Promise.all([getAdminStats(), getCacheStats()]);
        return NextResponse.json({ ...stats, cache });
      }
      case "jobs":
        return NextResponse.json(await getCrawlJobs());
      case "history":
        return NextResponse.json(await getScanHistory());
      case "rates":
        return NextResponse.json(await getRates());
      case "cache":
        return NextResponse.json(await getCacheStats());
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/admin  { action, areaId? } ─────────────────────────────────────
export async function POST(request: NextRequest) {
  // Admin auth (PRD §4)
  const auth = checkAdminAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  // Rate limit (PRD §39)
  const ip = getClientIp(request);
  const rl = rateLimit(ip, "admin", LIMITS.admin.limit, LIMITS.admin.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: { action?: string; area?: string; historyId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "start-crawl": {
        if (!body.area) return NextResponse.json({ error: "area required" }, { status: 400 });
        // Enqueue async job (force refresh — bypasses cache)
        const job = enqueueAnalysis(body.area, { force: true });
        return NextResponse.json({ success: true, job: jobToDTO(job) });
      }
      case "clear-cache":
        await clearCache();
        return NextResponse.json({ success: true, message: "Cache cleared" });
      case "refresh-rates": {
        const rates = await refreshExchangeRates();
        return NextResponse.json({ success: true, rates });
      }
      case "delete-history":
        if (!body.historyId) return NextResponse.json({ error: "historyId required" }, { status: 400 });
        await deleteScanHistory(body.historyId);
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
