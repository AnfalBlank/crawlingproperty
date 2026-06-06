import { NextRequest, NextResponse } from "next/server";
import { createSavedSearch, listSavedSearches, deleteSavedSearch } from "@/lib/db/repository";
import { rateLimit, getClientIp, LIMITS } from "@/lib/services/rate-limiter";
import { checkAdminAuth } from "@/lib/services/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/alerts — list saved searches (admin only — contains emails)
export async function GET(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });

  try {
    const items = await listSavedSearches();
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// POST /api/alerts { areaName, email?, maxPrice?, minBedrooms? }
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  // Use search bucket — alerts are user-side and shouldn't compete with the compare quota
  const rl = rateLimit(ip, "search", LIMITS.search.limit, LIMITS.search.windowMs);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  let body: { areaName?: string; email?: string; maxPrice?: number; minBedrooms?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Validate areaName
  if (!body.areaName?.trim()) return NextResponse.json({ error: "areaName required" }, { status: 400 });
  if (body.areaName.length > 100) return NextResponse.json({ error: "areaName too long" }, { status: 400 });

  // Validate optional email
  if (body.email) {
    if (body.email.length > 120) return NextResponse.json({ error: "email too long" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
  }

  // Validate numeric bounds
  if (body.maxPrice != null && (typeof body.maxPrice !== "number" || body.maxPrice < 0 || body.maxPrice > 1_000_000)) {
    return NextResponse.json({ error: "maxPrice out of range" }, { status: 400 });
  }
  if (body.minBedrooms != null && (typeof body.minBedrooms !== "number" || body.minBedrooms < 0 || body.minBedrooms > 10)) {
    return NextResponse.json({ error: "minBedrooms out of range" }, { status: 400 });
  }

  const id = await createSavedSearch({
    email: body.email?.trim() || undefined,
    areaName: body.areaName.trim(),
    maxPrice: body.maxPrice,
    minBedrooms: body.minBedrooms,
  });
  return NextResponse.json({ id, success: true });
}

// DELETE /api/alerts?id=123 — admin only
export async function DELETE(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });

  const id = parseInt(new URL(request.url).searchParams.get("id") || "", 10);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteSavedSearch(id);
  return NextResponse.json({ success: true });
}
