/**
 * Item 14 — SEO-friendly per-area page (PRD §41).
 * Server component that pre-fetches the cached analysis for an area,
 * generates rich metadata, and links into the interactive /analysis dashboard.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { getCachedAnalysis } from "@/lib/db/repository";
import { formatNumber } from "@/lib/utils";

const POPULAR_AREAS = [
  "Mont Kiara", "KLCC", "Bangsar", "Bangsar South", "Petaling Jaya",
  "Subang Jaya", "Damansara", "Cheras", "Puchong", "Kepong",
  "Setapak", "Sri Hartamas", "Ampang", "Gombak", "Wangsa Maju",
  "Old Klang Road", "Kuchai Lama", "Sungai Buloh", "Shah Alam", "Klang",
];

function deslugify(slug: string) {
  // "mont-kiara" → "Mont Kiara"
  const known = POPULAR_AREAS.find((a) => a.toLowerCase().replace(/\s+/g, "-") === slug);
  if (known) return known;
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function generateStaticParams() {
  return POPULAR_AREAS.map((a) => ({ slug: a.toLowerCase().replace(/\s+/g, "-") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = deslugify(slug);

  // Try cached numbers for richer titles/descriptions
  let avgRm = 0;
  let count = 0;
  try {
    const cached = await getCachedAnalysis(slug.toLowerCase());
    if (cached) {
      avgRm = Math.round(cached.analysis.summary.avgPrice);
      count = cached.analysis.summary.totalListings;
    }
  } catch { /* ignore — generic metadata still works */ }

  const title = avgRm
    ? `${area} rental price 2026 — RM${formatNumber(avgRm)}/mo avg`
    : `${area} rental analysis`;
  const description = count
    ? `Live market intelligence for ${area}. ${count} active rental listings, RM${formatNumber(avgRm)}/mo average, fair-price analysis & comparison.`
    : `Discover average rental price, fair-price benchmarks, and live listings in ${area}. Powered by Estate Insight.`;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://estate-insight.example.com";

  return {
    title,
    description,
    alternates: { canonical: `${base}/area/${slug}` },
    openGraph: {
      title, description, type: "website", url: `${base}/area/${slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = deslugify(slug);

  let summary: {
    avg: number; median: number; fair: number; count: number; ppsf: number;
  } | null = null;

  try {
    const cached = await getCachedAnalysis(slug.toLowerCase());
    if (cached) {
      const s = cached.analysis.summary;
      summary = {
        avg:    Math.round(s.avgPrice),
        median: Math.round(s.medianPrice),
        fair:   Math.round(s.fairPrice),
        count:  s.totalListings,
        ppsf:   Math.round(s.avgPricePerSqft * 100) / 100,
      };
    }
  } catch { /* ignore */ }

  return (
    <div className="min-h-screen page-bg">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 pt-32 pb-20">
        <div className="mb-2">
          <Link href="/" className="text-xs text-muted hover:text-ink">Home</Link>
          <span className="text-xs text-muted mx-1">/</span>
          <Link href="/analysis" className="text-xs text-muted hover:text-ink">Analysis</Link>
          <span className="text-xs text-muted mx-1">/</span>
          <span className="text-xs text-ink">{area}</span>
        </div>

        <h1 className="font-display text-ink font-bold tracking-tight"
            style={{ fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.02em" }}>
          {area} rental market
        </h1>
        <p className="text-base md:text-lg text-muted mt-3 max-w-2xl flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-1.5 text-primary shrink-0" />
          Live rental price intelligence for {area}, Kuala Lumpur. Average rents, fair-price benchmarks, and unit listings refreshed daily.
        </p>

        {/* Summary cards */}
        {summary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[
              { label: "Total listings", value: formatNumber(summary.count), suffix: "" },
              { label: "Average rent",   value: `RM${formatNumber(summary.avg)}`, suffix: "/mo" },
              { label: "Median rent",    value: `RM${formatNumber(summary.median)}`, suffix: "/mo" },
              { label: "Fair price",     value: `RM${formatNumber(summary.fair)}`, suffix: "/mo" },
            ].map((it) => (
              <div key={it.label} className="bg-canvas border border-hairline rounded-2xl p-4">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">{it.label}</p>
                <p className="text-2xl font-bold text-ink tabular-nums">
                  {it.value}<span className="text-xs text-muted font-normal ml-1">{it.suffix}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 p-5 bg-surface-soft border border-hairline rounded-2xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted">
              Running a live crawl will give you the latest numbers for {area}.
            </p>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/analysis?area=${encodeURIComponent(area)}`}
          className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-active transition-colors btn-lift"
        >
          <Building2 className="w-4 h-4" />
          Open interactive dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Internal links — popular areas (good for SEO) */}
        <div className="mt-16 pt-10 border-t border-hairline">
          <h2 className="text-lg font-bold text-ink mb-4">Other popular areas</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_AREAS.filter((a) => a !== area).slice(0, 16).map((a) => (
              <Link
                key={a}
                href={`/area/${a.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-ink bg-surface-soft hover:bg-surface-strong border border-hairline px-3 py-1.5 rounded-full transition-colors"
              >
                {a}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
