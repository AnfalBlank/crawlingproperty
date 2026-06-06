import { NextRequest, NextResponse } from "next/server";
import { SearchSuggestion } from "@/types";
import { rateLimit, getClientIp, LIMITS } from "@/lib/services/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Known KL/Selangor areas covered by SPEEDHOME (PRD §9 autocomplete source)
const KNOWN_AREAS: { name: string; region: string }[] = [
  { name: "Mont Kiara", region: "Kuala Lumpur" },
  { name: "KLCC", region: "City Centre" },
  { name: "Bangsar", region: "Kuala Lumpur" },
  { name: "Bangsar South", region: "Kuala Lumpur" },
  { name: "Petaling Jaya", region: "Selangor" },
  { name: "Subang Jaya", region: "Selangor" },
  { name: "Damansara", region: "Kuala Lumpur" },
  { name: "Cheras", region: "Kuala Lumpur" },
  { name: "Puchong", region: "Selangor" },
  { name: "Cyberjaya", region: "Selangor" },
  { name: "Shah Alam", region: "Selangor" },
  { name: "Kajang", region: "Selangor" },
  { name: "Sentul", region: "Kuala Lumpur" },
  { name: "Setapak", region: "Kuala Lumpur" },
  { name: "Wangsa Maju", region: "Kuala Lumpur" },
  { name: "Ampang", region: "Kuala Lumpur" },
  { name: "Bukit Bintang", region: "Kuala Lumpur" },
  { name: "Chow Kit", region: "Kuala Lumpur" },
  { name: "Sri Petaling", region: "Kuala Lumpur" },
  { name: "Old Klang Road", region: "Kuala Lumpur" },
  { name: "Kepong", region: "Kuala Lumpur" },
  { name: "Segambut", region: "Kuala Lumpur" },
  { name: "Setia Alam", region: "Selangor" },
  { name: "Putrajaya", region: "Federal Territory" },
];

// GET /api/search?q=mont  (PRD §9 — debounced on the client, max 10 results)
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, "search", LIMITS.search.limit, LIMITS.search.windowMs);
  if (!rl.allowed) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  // Detect URL input
  if (q.includes("speedhome.com")) {
    const suggestion: SearchSuggestion = {
      type: "url",
      label: "Analyze this SPEEDHOME URL",
      value: searchParams.get("q") || "",
      subtitle: "Direct link",
    };
    return NextResponse.json({ suggestions: [suggestion] });
  }

  const matches = KNOWN_AREAS.filter(
    (a) => a.name.toLowerCase().includes(q) || a.region.toLowerCase().includes(q)
  )
    .slice(0, 10)
    .map<SearchSuggestion>((a) => ({
      type: "area",
      label: a.name,
      value: a.name,
      subtitle: a.region,
    }));

  return NextResponse.json({ suggestions: matches });
}
