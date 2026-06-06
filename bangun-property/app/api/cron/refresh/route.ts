import { NextRequest, NextResponse } from "next/server";
import { enqueueAnalysis } from "@/lib/services/job-queue";
import { refreshExchangeRates } from "@/lib/services/exchange-rates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Top areas to keep cache warm (PRD §13: scheduled scan)
const POPULAR_AREAS = [
  "Mont Kiara", "KLCC", "Bangsar", "Petaling Jaya",
  "Subang Jaya", "Cheras", "Damansara", "Puchong", "Sentul", "Cyberjaya",
];

/**
 * GET /api/cron/refresh — scheduled job. Wire to Vercel Cron / VPS systemd /
 * GitHub Actions. Pass `Authorization: Bearer <CRON_SECRET>` to authenticate.
 *
 * 1. Refreshes exchange rates from Frankfurter.
 * 2. Force-enqueues a re-crawl for every popular area (queue handles concurrency).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const enqueued: string[] = [];
  try {
    await refreshExchangeRates();
    for (const area of POPULAR_AREAS) {
      enqueueAnalysis(area, { force: true });
      enqueued.push(area);
    }
    return NextResponse.json({
      ok: true,
      ratesRefreshed: true,
      areasEnqueued: enqueued,
      enqueuedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed", areasEnqueued: enqueued },
      { status: 500 }
    );
  }
}
