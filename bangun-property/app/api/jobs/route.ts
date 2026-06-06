import { NextRequest, NextResponse } from "next/server";
import { enqueueAnalysis, jobToDTO } from "@/lib/services/job-queue";
import { rateLimit, getClientIp, LIMITS } from "@/lib/services/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/jobs  { area | url, force? }  → enqueue a crawl, returns job id immediately
export async function POST(request: NextRequest) {
  // Rate limit (PRD §39)
  const ip = getClientIp(request);
  const rl = rateLimit(ip, "analyze", LIMITS.analyze.limit, LIMITS.analyze.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: { area?: string; url?: string; force?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const target = (body.area || body.url || "").trim();
  if (!target) {
    return NextResponse.json({ error: "Area or URL required" }, { status: 400 });
  }

  // Input length guard
  if (target.length > 200) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  // If user submitted an explicit URL, it must be a SPEEDHOME URL.
  if (body.url && !isValidSpeedhomeInput(body.url)) {
    return NextResponse.json({ error: "Invalid SPEEDHOME URL" }, { status: 400 });
  }

  // If user submitted an "area" that looks like a URL, reject — area must be a place name.
  // Accept letters, numbers, spaces, hyphens, apostrophes, ampersand and slash for "Bangsar South".
  if (body.area) {
    const looksLikeUrl = /^https?:\/\//i.test(body.area) || /^www\./i.test(body.area);
    if (looksLikeUrl) {
      return NextResponse.json({ error: "Use the URL field for SPEEDHOME links" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9\s\-'&/]{1,200}$/.test(body.area)) {
      return NextResponse.json({ error: "Area name has invalid characters" }, { status: 400 });
    }
  }

  try {
    const job = enqueueAnalysis(target, { force: body.force });
    return NextResponse.json(jobToDTO(job), { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to enqueue";
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
