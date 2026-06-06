import { NextRequest, NextResponse } from "next/server";
import { getRates, refreshExchangeRates } from "@/lib/services/exchange-rates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/currency  — returns current rates (refreshes if stale > 24h)
export async function GET() {
  try {
    const rates = await getRates();
    const myr = rates.find((r) => r.currency === "MYR");
    return NextResponse.json({
      base: "MYR",
      rates,
      updatedAt: myr?.updatedAt ?? new Date().toISOString(),
      source: "Frankfurter API",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load rates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/currency  — force refresh from Frankfurter (admin action)
export async function POST(request: NextRequest) {
  try {
    const rates = await refreshExchangeRates();
    return NextResponse.json({ success: true, rates, refreshedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
