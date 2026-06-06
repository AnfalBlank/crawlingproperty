"use client";

import { useEffect, useCallback, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { RefreshCw, SlidersHorizontal, Clock, Search, GitCompare, X, Map as MapIcon, List as ListIcon } from "lucide-react";
import { cn, formatDateTime, formatDuration, formatNumber } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { t } from "@/lib/i18n";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SearchBar } from "@/components/home/search-bar";
import { KPICards } from "@/components/analysis/kpi-cards";
import { MarketInsight } from "@/components/analysis/market-insight";
import {
  PriceDistributionChart,
  BedroomDistributionChart,
  FurnishingDistributionChart,
} from "@/components/analysis/charts";
import { FiltersPanel } from "@/components/analysis/filters-panel";
import { PeriodToggle } from "@/components/analysis/period-toggle";
import { MarketStatCard } from "@/components/analysis/market-stat-card";
import { ListingsTable } from "@/components/analysis/listings-table";
import { ComparisonPanel } from "@/components/analysis/comparison-panel";
import { ExportButton } from "@/components/analysis/export-button";
import { CrawlLoader } from "@/components/analysis/crawl-loader";
import { FairPriceCalculator } from "@/components/analysis/fair-price-calculator";
import { PriceHistoryChart } from "@/components/analysis/price-history-chart";
import { SaveAlertButton } from "@/components/analysis/save-alert-button";
import { ShareButton } from "@/components/analysis/share-button";
import { ListingModal } from "@/components/analysis/listing-modal";
import {
  SkeletonKPICard, SkeletonBarChart, SkeletonPieChart,
  SkeletonInsight,
} from "@/components/ui/skeleton";
import type { Listing } from "@/types";

// Map view is dynamically imported (Leaflet is client-only)
const ListingsMap = dynamic(() => import("@/components/analysis/listings-map"), {
  ssr: false,
  loading: () => <div className="h-[480px] rounded-xl bg-surface-strong skeleton" />,
});

const SUGGEST_AREAS = [
  { area: "Mont Kiara",   img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70&auto=format&fit=crop" },
  { area: "KLCC",         img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=70&auto=format&fit=crop" },
  { area: "Bangsar",      img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70&auto=format&fit=crop" },
  { area: "Petaling Jaya",img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=70&auto=format&fit=crop" },
];

// ─── Skeleton loading layout ──────────────────────────────────────────────────
function AnalysisSkeleton({ area, stage, progress, queuePosition }: {
  area: string; stage: string; progress: number; queuePosition: number;
}) {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Interactive crawl loader (PRD §34) */}
      <CrawlLoader area={area} stage={stage} progress={progress} queuePosition={queuePosition} />

      {/* Skeleton preview of the dashboard that's coming */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
            <SkeletonKPICard />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonInsight />
        <SkeletonBarChart />
        <SkeletonPieChart />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onAnalyze, lang }: { onAnalyze: (area: string) => void; lang: string }) {
  const T = (k: Parameters<typeof t>[1]) => t(lang as Parameters<typeof t>[0], k);
  return (
    <div className="py-10 animate-fade-in">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-xl bg-canvas border border-hairline shadow-sm flex items-center justify-center mx-auto mb-4">
          <Search className="w-6 h-6 text-muted" />
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">{T("empty.title")}</h2>
        <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">{T("empty.sub")}</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest text-center mb-5">
          {T("empty.popular")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SUGGEST_AREAS.map(({ area, img }) => (
            <button key={area} onClick={() => onAnalyze(area)}
              className="property-card group rounded-xl overflow-hidden border border-hairline hover:shadow-lifted transition-all duration-300 text-left bg-canvas">
              <div className="relative h-28 overflow-hidden bg-surface-strong">
                <Image src={img} alt={area} fill className="object-cover property-card-img"
                  sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="p-3">
                <p className="text-[13px] font-semibold text-ink truncate">{area}</p>
                <p className="text-[11px] text-primary font-medium mt-0.5">Analyze →</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main dashboard content ───────────────────────────────────────────────────
function AnalysisDashboardContent() {
  const searchParams = useSearchParams();
  const areaParam = searchParams.get("area") ?? "";
  const {
    analysis, isAnalyzing, analyzeProgress, analyzeStage,
    setAnalysis, setIsAnalyzing, setAnalyzeProgress,
    setCurrentArea, addRecentSearch, resetFilters, lang,
  } = useAppStore();

  const T = (k: Parameters<typeof t>[1]) => t(lang, k);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [view, setView] = useState<"list" | "map">("list");
  const [mapSelectedListing, setMapSelectedListing] = useState<Listing | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false); // Item 11 — live indicator

  const runAnalysis = useCallback(async (area: string, force = false) => {
    if (!area.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);
    setQueuePosition(0);
    resetFilters();
    setCurrentArea(area);
    setFiltersDrawerOpen(false);
    setShowComparison(false);
    setAnalyzeProgress(2, "Submitting request...");

    try {
      // 1. Enqueue async crawl job (PRD §10, §37)
      const enqueueRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, force }),
      });

      if (enqueueRes.status === 429) {
        const e = await enqueueRes.json().catch(() => ({}));
        throw new Error(e.error || "Rate limit reached. Please wait a moment.");
      }
      if (!enqueueRes.ok) {
        const e = await enqueueRes.json().catch(() => ({}));
        throw new Error(e.error || "Failed to start analysis");
      }

      const job = await enqueueRes.json();
      const jobId = job.id as string;

      // 2. Poll job status until done/failed (PRD §34 loading experience)
      let done = false;
      let guard = 0;
      while (!done && guard < 600) {
        guard++;
        await new Promise((r) => setTimeout(r, 800));
        const pollRes = await fetch(`/api/jobs/${jobId}`);
        if (!pollRes.ok) {
          if (pollRes.status === 404) throw new Error("Job expired. Please retry.");
          continue;
        }
        const state = await pollRes.json();

        setQueuePosition(state.queuePosition ?? 0);
        if (state.status === "running" || state.status === "queued") {
          setAnalyzeProgress(state.progress ?? 0, state.stage ?? "Working...");
        } else if (state.status === "completed") {
          done = true;
          if (state.analysis) {
            setAnalysis(state.analysis);
            setIsCached(Boolean(state.cached));
            addRecentSearch({
              area: state.analysis.area,
              listings: state.analysis.summary.totalListings,
              timestamp: new Date().toISOString(),
            });
          } else {
            throw new Error("No data returned");
          }
        } else if (state.status === "failed") {
          done = true;
          throw new Error(state.error || "Analysis failed");
        }
      }
      if (!done) throw new Error("Analysis timed out. Please try again.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed";
      setError(msg);
    } finally {
      setIsAnalyzing(false);
      setQueuePosition(0);
    }
  }, [setIsAnalyzing, setAnalysis, setAnalyzeProgress, setCurrentArea, addRecentSearch, resetFilters]);

  useEffect(() => {
    if (areaParam && areaParam !== analysis?.area) runAnalysis(areaParam);
  }, [areaParam]); // eslint-disable-line

  // Honour ?compare=1 deep link → auto-open comparison once analysis is ready
  useEffect(() => {
    const wantCompare = searchParams.get("compare") === "1";
    if (wantCompare && analysis && !isAnalyzing) setShowComparison(true);
  }, [analysis, isAnalyzing, searchParams]);

  // Honour ?currency=... and ?period=... deep links
  useEffect(() => {
    const c = searchParams.get("currency");
    const p = searchParams.get("period");
    const v = searchParams.get("view");
    const store = useAppStore.getState();
    if (c && c !== store.currency) {
      const valid = ["MYR","IDR","USD","SGD","EUR","GBP","AUD","JPY","THB"];
      if (valid.includes(c)) store.setCurrency(c as Parameters<typeof store.setCurrency>[0]);
    }
    if (p && p !== store.rentalPeriod) {
      if (p === "daily" || p === "monthly" || p === "yearly") store.setRentalPeriod(p);
    }
    if (v === "map" || v === "list") setView(v);
  }, [searchParams]);

  return (
    <div className="min-h-screen page-bg">
      <Navbar />

      {/* Search header strip — full width, below fixed nav */}
      <div className="bg-canvas dark:bg-canvas border-b border-hairline">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 py-3" style={{ paddingTop: "calc(68px + 12px)" }}>
          <SearchBar size="md" />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 py-6">
        {isAnalyzing && (
          <AnalysisSkeleton
            area={useAppStore.getState().currentArea || areaParam}
            stage={analyzeStage}
            progress={analyzeProgress}
            queuePosition={queuePosition}
          />
        )}

        {/* Error state */}
        {!isAnalyzing && error && !analysis && (
          <div className="py-16 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-5">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-ink mb-2">Analysis failed</h2>
            <p className="text-sm text-muted max-w-md mx-auto mb-6 leading-relaxed">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setError(null); }}
                className="h-11 px-5 rounded-xl border border-hairline bg-canvas text-ink text-sm font-semibold hover:bg-surface-soft transition-all"
              >
                Dismiss
              </button>
              {areaParam && (
                <button
                  onClick={() => runAnalysis(areaParam, true)}
                  className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-active transition-all"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {!isAnalyzing && !error && !analysis && (
          <EmptyState onAnalyze={runAnalysis} lang={lang} />
        )}

        {!isAnalyzing && analysis && (
          <div className="animate-fade-in space-y-6 md:space-y-8">

            {/* ── Dashboard header — bigger, more breathing room ──────────── */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-ink font-bold tracking-tight truncate"
                    style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em" }}>
                    {analysis.area}
                  </h1>
                  {isCached ? (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
                      <Clock className="w-3 h-3" />
                      Cached
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      Live data
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{formatDateTime(analysis.lastUpdated)}</span>
                  </span>
                  <span className="text-muted hidden sm:inline">·</span>
                  <span className="text-muted hidden sm:inline">Crawled in {formatDuration(analysis.crawlDuration)}</span>
                  <span className="text-muted">·</span>
                  <span className="text-muted font-medium">{formatNumber(analysis.listings.length)} listings</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Period toggle (PRD §27) — instantly reformats all prices */}
                <PeriodToggle />

                {/* Filters — opens drawer on mobile/tablet only */}
                <button
                  onClick={() => setFiltersDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 h-10 px-4 rounded-xl border border-hairline bg-canvas text-ink text-sm font-semibold hover:bg-surface-soft dark:hover:bg-surface-strong transition-all whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden xs:inline">{T("dash.filters")}</span>
                </button>

                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={cn(
                    "flex items-center gap-1.5 h-10 px-4 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap",
                    showComparison
                      ? "bg-ink text-white border-ink shadow-md dark:bg-surface-strong dark:text-ink dark:border-hairline"
                      : "border-hairline bg-canvas text-ink hover:bg-surface-soft dark:hover:bg-surface-strong"
                  )}
                >
                  <GitCompare className="w-4 h-4" />
                  <span className="hidden xs:inline">{T("dash.compare")}</span>
                </button>

                {/* Item 4 — Save alert */}
                <SaveAlertButton area={analysis.area} />

                {/* Item 8 — Share dashboard */}
                <ShareButton area={analysis.area} withCompare={showComparison} />

                <ExportButton analysis={analysis} />

                <button
                  onClick={() => runAnalysis(analysis.area, true)}
                  className="flex items-center justify-center h-10 w-10 rounded-xl border border-hairline bg-canvas text-muted hover:text-ink hover:bg-surface-soft dark:hover:bg-surface-strong transition-all"
                  title={T("dash.refresh")}
                  aria-label={T("dash.refresh")}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── KPI cards ────────────────────────────────────────────────── */}
            <KPICards summary={analysis.summary} area={analysis.area} />

            {/* ── Main layout: persistent sidebar lg+, drawer on mobile ──────── */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sticky sidebar (desktop) */}
              <aside className="hidden lg:block w-[300px] xl:w-[320px] shrink-0">
                <div className="sticky top-[88px]">
                  <FiltersPanel />
                </div>
              </aside>

              {/* Mobile drawer */}
              {filtersDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                    onClick={() => setFiltersDrawerOpen(false)}
                  />
                  <div className="relative ml-auto w-[88vw] max-w-[360px] h-full bg-canvas dark:bg-canvas border-l border-hairline overflow-y-auto animate-slide-right">
                    <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-hairline bg-canvas dark:bg-canvas z-10">
                      <h3 className="text-lg font-bold text-ink">Filters</h3>
                      <button
                        onClick={() => setFiltersDrawerOpen(false)}
                        className="w-9 h-9 rounded-full hover:bg-surface-soft flex items-center justify-center"
                        aria-label="Close filters"
                      >
                        <X className="w-5 h-5 text-muted" />
                      </button>
                    </div>
                    <div className="p-4">
                      <FiltersPanel onClose={() => setFiltersDrawerOpen(false)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Content area */}
              <div className="flex-1 min-w-0 space-y-6">

                {/* Charts grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Insight — spans wider on xl */}
                  <div className="sm:col-span-2 xl:col-span-1 xl:row-span-2">
                    <MarketInsight area={analysis.area} insights={analysis.insights} />
                  </div>
                  <div className="sm:col-span-2 xl:col-span-3">
                    <PriceDistributionChart data={analysis.priceDistribution} summary={analysis.summary} />
                  </div>
                  <div className="xl:col-span-1">
                    <BedroomDistributionChart data={analysis.bedroomDistribution} />
                  </div>
                  <div className="xl:col-span-1">
                    <FurnishingDistributionChart data={analysis.furnishingDistribution} />
                  </div>
                  {/* Add a fourth slot so the row stays balanced on xl */}
                  <div className="hidden xl:block xl:col-span-1">
                    <MarketStatCard summary={analysis.summary} />
                  </div>
                </div>

                {/* Comparison panel */}
                {showComparison && (
                  <div className="animate-slide-up">
                    <ComparisonPanel />
                  </div>
                )}

                {/* Item 1 + Item 2 — Calculator + Price History */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <FairPriceCalculator summary={analysis.summary} />
                  </div>
                  <div className="lg:col-span-3">
                    <PriceHistoryChart area={analysis.area} />
                  </div>
                </div>

                {/* Listings (table or map view) */}
                <div>
                  <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
                    <h2 className="text-xl md:text-2xl font-bold text-ink tracking-tight">
                      Unit Listings
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted font-medium">
                        {formatNumber(analysis.listings.length)} {T("dash.total")}
                      </span>
                      {/* Item 6 — List vs Map toggle. Hidden when no listings have coordinates */}
                      {analysis.listings.some((l) => l.latitude != null && l.longitude != null) && (
                        <div className="flex items-center gap-1 bg-surface-soft dark:bg-surface-strong rounded-lg p-1">
                          <button
                            onClick={() => setView("list")}
                            className={cn(
                              "h-8 px-3 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                              view === "list"
                                ? "bg-canvas text-ink shadow-sm dark:bg-canvas"
                                : "text-muted hover:text-ink"
                            )}
                            aria-pressed={view === "list"}
                          >
                            <ListIcon className="w-3.5 h-3.5" /> List
                          </button>
                          <button
                            onClick={() => setView("map")}
                            className={cn(
                              "h-8 px-3 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                              view === "map"
                                ? "bg-canvas text-ink shadow-sm dark:bg-canvas"
                                : "text-muted hover:text-ink"
                            )}
                            aria-pressed={view === "map"}
                          >
                            <MapIcon className="w-3.5 h-3.5" /> Map
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {view === "list" || !analysis.listings.some((l) => l.latitude != null && l.longitude != null) ? (
                    <ListingsTable listings={analysis.listings} summary={analysis.summary} />
                  ) : (
                    <ListingsMap
                      listings={analysis.listings}
                      onSelect={(l) => setMapSelectedListing(l)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Map → modal hand-off */}
            <ListingModal
              listing={mapSelectedListing}
              summary={analysis.summary}
              onClose={() => setMapSelectedListing(null)}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ─── Page export with Suspense ────────────────────────────────────────────────
export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen page-bg">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10" style={{ paddingTop: "calc(68px + 60px + 32px)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 7 }).map((_, i) => <SkeletonKPICard key={i} />)}
          </div>
        </div>
      </div>
    }>
      <AnalysisDashboardContent />
    </Suspense>
  );
}
