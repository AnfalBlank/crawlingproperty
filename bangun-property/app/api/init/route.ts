import { NextRequest, NextResponse } from "next/server";
import { initSchema } from "@/lib/db/schema";
import { refreshExchangeRates } from "@/lib/services/exchange-rates";
import { checkAdminAuth } from "@/lib/services/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/init — create schema + seed exchange rates. Admin-gated.
export async function POST(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  try {
    await initSchema(true);
    const rates = await refreshExchangeRates();
    return NextResponse.json({
      success: true,
      message: "Database schema initialised",
      ratesSeeded: rates.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Init failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
