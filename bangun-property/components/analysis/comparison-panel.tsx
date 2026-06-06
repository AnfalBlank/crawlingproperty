"use client";

import { useState } from "react";
import { Plus, X, Save, Trash2, GitCompare, Star, ChevronDown, ChevronUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { AreaComparisonItem } from "@/types";
import { useAppStore } from "@/store/app-store";
import { t } from "@/lib/i18n";

const POPULAR_AREAS = ["Mont Kiara", "KLCC", "Bangsar", "Petaling Jaya", "Subang Jaya", "Damansara", "Cheras", "Puchong"];

export function ComparisonPanel() {
  const { currency, getRate, comparison, setComparison, savedComparisons, saveComparison, deleteSavedComparison, lang } = useAppStore();
  const rate = getRate();
  const T = (k: Parameters<typeof t>[1]) => t(lang, k);

  const [areaInput, setAreaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const areas = comparison?.areas ?? [];
  const canAdd = areas.length < 5;

  const addArea = async () => {
    const input = areaInput.trim();
    if (!input || !canAdd) return;
    setLoading(true);
    setError(null);
    try {
      // Try the cached/sync endpoint first (instant if cached)
      let analysis = await fetchSync(input);

      // If not cached → use the async job queue (handles long crawls)
      if (!analysis) {
        analysis = await runAsyncJob(input);
      }

      const item: AreaComparisonItem = {
        areaName: analysis.area,
        listings: analysis.summary.totalListings,
        avgRent: analysis.summary.avgPrice,
        medianRent: analysis.summary.medianPrice,
        fairPrice: analysis.summary.fairPrice,
        avgSqft: analysis.summary.avgSqft,
        pricePerSqft: analysis.summary.avgPricePerSqft,
      };
      if (areas.some((a) => a.areaName.toLowerCase() === item.areaName.toLowerCase())) {
        setError(`${item.areaName} is already in comparison`);
        return;
      }
      const newAreas = [...areas, item];
      setComparison({ areas: newAreas, recommendation: generateRecommendation(newAreas) });
      setAreaInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add area");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  // Try the cached path. Returns null if the area is uncached and we should
  // route through the job queue instead.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function fetchSync(input: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/analyze?area=${encodeURIComponent(input)}&cacheOnly=1`);
      if (res.status === 429) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Rate limit reached. Please wait a moment.");
      }
      if (!res.ok) return null;
      const data = await res.json();
      // Only treat as success when it actually came from cache.
      // Otherwise we'd be triggering a 30-60s synchronous crawl on this endpoint.
      if (data && data._cached === true) return data;
      return null;
    } catch {
      return null;
    }
  }

  // Async crawl via job queue + polling (PRD §10)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function runAsyncJob(input: string): Promise<any> {
    setLoadingStage("Queueing crawl...");
    const enq = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area: input }),
    });
    if (enq.status === 429) {
      const e = await enq.json().catch(() => ({}));
      throw new Error(e.error || "Rate limit reached.");
    }
    if (!enq.ok) {
      const e = await enq.json().catch(() => ({}));
      throw new Error(e.error || "Failed to enqueue crawl");
    }
    const job = await enq.json();
    const jobId = job.id as string;

    let guard = 0;
    while (guard < 600) {
      guard++;
      await new Promise((r) => setTimeout(r, 800));
      const pr = await fetch(`/api/jobs/${jobId}`);
      if (!pr.ok) {
        if (pr.status === 404) throw new Error("Job expired. Try again.");
        continue;
      }
      const state = await pr.json();
      if (state.stage) setLoadingStage(state.stage);
      if (state.status === "completed") {
        if (state.analysis) return state.analysis;
        throw new Error("No data returned");
      }
      if (state.status === "failed") {
        throw new Error(state.error || "Crawl failed");
      }
    }
    throw new Error("Timed out waiting for crawl");
  }

  const removeArea = (name: string) => {
    const newAreas = areas.filter((a) => a.areaName !== name);
    setComparison(newAreas.length ? { areas: newAreas, recommendation: generateRecommendation(newAreas) } : null);
  };

  const handleSave = () => {
    if (!comparison || !saveName.trim()) return;
    saveComparison({ ...comparison, name: saveName });
    setSaveName("");
    setShowSave(false);
  };

  const fmt = (n: number) => formatCurrency(n, currency, rate);

  const chartData = areas.map((a) => ({
    name: a.areaName,
    "Avg Rent": Math.round(a.avgRent * rate),
    "Median Rent": Math.round(a.medianRent * rate),
    "Fair Price": Math.round(a.fairPrice * rate),
  }));

  const bestValue = areas.length >= 2
    ? areas.reduce((prev, curr) => curr.pricePerSqft < prev.pricePerSqft ? curr : prev)
    : null;

  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
            <GitCompare className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-ink">{T("cmp.title")}</h3>
            <p className="text-xs text-muted">{T("cmp.sub")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedComparisons.length > 0 && (
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-1 text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              {T("cmp.saved")} ({savedComparisons.length})
            </button>
          )}
          {comparison && (
            <button
              onClick={() => setShowSave(!showSave)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Save className="w-3.5 h-3.5" />
              {T("cmp.save")}
            </button>
          )}
        </div>
      </div>

      {/* Save Form */}
      {showSave && (
        <div className="flex gap-2 mb-4 p-3 bg-surface-soft dark:bg-surface-strong rounded-xl">
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="e.g. Mont Kiara vs KLCC"
            className="flex-1 h-9 px-3 border border-hairline rounded-lg text-sm focus:outline-none focus:border-border-strong bg-canvas dark:bg-canvas text-ink"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={!saveName.trim()}
            className="px-3 h-9 bg-primary text-white rounded-sm text-sm font-medium disabled:opacity-50"
          >
            Save
          </button>
        </div>
      )}

      {/* Saved Comparisons */}
      {showSaved && savedComparisons.length > 0 && (
        <div className="mb-4 p-3 bg-surface-soft dark:bg-surface-strong rounded-xl space-y-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Saved Comparisons</p>
          {savedComparisons.map((sc) => (
            <div key={sc.name} className="flex items-center justify-between">
              <button
                onClick={() => setComparison(sc)}
                className="text-sm font-medium text-ink hover:text-primary transition-colors"
              >
                {sc.name}
              </button>
              <button
                onClick={() => deleteSavedComparison(sc.name!)}
                className="w-6 h-6 flex items-center justify-center text-muted hover:text-primary transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Area */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <input
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addArea()}
            placeholder={T("cmp.addPh")}
            disabled={!canAdd}
            list="comparison-areas"
            className={cn(
              "w-full h-10 px-3 border border-hairline rounded-lg text-sm focus:outline-none focus:border-border-strong bg-canvas dark:bg-canvas text-ink transition-colors",
              !canAdd && "opacity-50 cursor-not-allowed"
            )}
          />
          <datalist id="comparison-areas">
            {POPULAR_AREAS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <button
          onClick={addArea}
          disabled={!canAdd || !areaInput.trim() || loading}
          className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shrink-0"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {T("cmp.add")}
        </button>
      </div>

      {/* Loading stage banner */}
      {loading && loadingStage && (
        <div className="mb-4 px-3 py-2.5 bg-primary/5 border border-primary/15 rounded-lg flex items-center gap-2 animate-fade-in">
          <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
          <span className="text-[13px] text-ink font-medium">{loadingStage}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
          <X className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Areas Tags */}
      {areas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {areas.map((a) => (
            <div
              key={a.areaName}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-soft rounded-full text-sm border border-hairline"
            >
              <span className="text-ink font-medium">{a.areaName}</span>
              <button
                onClick={() => removeArea(a.areaName)}
                className="text-muted hover:text-ink transition-colors"
                aria-label={`Remove ${a.areaName}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {areas.length >= 2 && (
        <>
          <div className="table-container mb-5 rounded-xl border border-hairline overflow-hidden">
            <table className="w-full text-sm min-w-[560px]" aria-label="Area comparison table">
              <thead>
                <tr className="border-b border-hairline bg-surface-soft/50 dark:bg-surface-strong/50">
                  {["Area", "Listings", "Avg Rent", "Median", "Fair Price", "Avg Sqft", "Price/Sqft"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a.areaName} className="border-b border-hairline-soft hover:bg-surface-soft/40 dark:hover:bg-surface-strong/40 transition-colors">
                    <td className="px-3 py-3 font-semibold text-ink whitespace-nowrap">{a.areaName}</td>
                    <td className="px-3 py-3 text-muted">{a.listings}</td>
                    <td className="px-3 py-3 font-medium text-ink">{fmt(a.avgRent)}</td>
                    <td className="px-3 py-3 text-muted">{fmt(a.medianRent)}</td>
                    <td className="px-3 py-3 text-primary font-medium">{fmt(a.fairPrice)}</td>
                    <td className="px-3 py-3 text-muted">{formatNumber(a.avgSqft)} ft²</td>
                    <td className="px-3 py-3">
                      <span className={cn("font-medium", bestValue?.areaName === a.areaName ? "text-emerald-600 dark:text-emerald-400" : "text-muted")}>
                        {fmt(a.pricePerSqft)}
                        {bestValue?.areaName === a.areaName && (
                          <span className="ml-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                            Best
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={4} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="cmpAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5c78" />
                  <stop offset="100%" stopColor="#ff385c" />
                </linearGradient>
                <linearGradient id="cmpMedian" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="cmpFair" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted)", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                cursor={{ fill: "rgba(128,128,128,0.05)", radius: 6 }}
                contentStyle={{
                  borderRadius: 12, border: "1px solid var(--color-hairline)",
                  background: "var(--color-canvas)", fontSize: 13,
                  boxShadow: "var(--shadow-lifted)",
                }}
              />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{v}</span>} />
              <Bar dataKey="Avg Rent" fill="url(#cmpAvg)" radius={[4, 4, 0, 0]} animationDuration={700} />
              <Bar dataKey="Median Rent" fill="url(#cmpMedian)" radius={[4, 4, 0, 0]} animationDuration={700} />
              <Bar dataKey="Fair Price" fill="url(#cmpFair)" radius={[4, 4, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>

          {/* Recommendation */}
          {bestValue && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold">{T("cmp.recommend")} </span>
                {comparison?.recommendation}
              </p>
            </div>
          )}

          {/* Show details toggle (Item 9) */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-hairline bg-canvas hover:bg-surface-soft dark:hover:bg-surface-strong text-ink text-sm font-semibold transition-colors"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? T("cmp.hideDetails") : T("cmp.showDetails")}
          </button>

          {showDetails && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
              {areas.map((a) => {
                const isBest = bestValue?.areaName === a.areaName;
                const ranks = {
                  cheapest: areas.reduce((p, c) => c.avgRent < p.avgRent ? c : p, areas[0]).areaName === a.areaName,
                  largest: areas.reduce((p, c) => c.avgSqft > p.avgSqft ? c : p, areas[0]).areaName === a.areaName,
                  mostListings: areas.reduce((p, c) => c.listings > p.listings ? c : p, areas[0]).areaName === a.areaName,
                };
                return (
                  <div
                    key={a.areaName}
                    className={cn(
                      "rounded-xl border p-4 flex flex-col gap-3 transition-all",
                      isBest
                        ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900"
                        : "border-hairline bg-canvas dark:bg-canvas"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-ink tracking-tight">{a.areaName}</h4>
                        <p className="text-[11px] text-muted mt-0.5">{a.listings} {T("cmp.listingsAnalyzed")}</p>
                      </div>
                      {isBest && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          {T("cmp.bestValue")}
                        </span>
                      )}
                    </div>

                    {/* Big fair price */}
                    <div className="bg-surface-soft dark:bg-surface-strong rounded-lg p-3">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{T("chart.fairPrice")}</p>
                      <p className="text-2xl font-bold text-primary tabular-nums leading-none">
                        {fmt(a.fairPrice)}<span className="text-xs text-muted font-normal ml-1">/mo</span>
                      </p>
                    </div>

                    {/* Stat rows */}
                    <div className="space-y-1.5">
                      {[
                        { label: T("kpi.avg"), value: fmt(a.avgRent) },
                        { label: T("kpi.median"), value: fmt(a.medianRent) },
                        { label: T("snap.avgSize"), value: `${formatNumber(a.avgSqft)} ft²` },
                        { label: T("kpi.psf"), value: fmt(a.pricePerSqft) },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between text-[12px]">
                          <span className="text-muted">{r.label}</span>
                          <span className="font-bold text-ink tabular-nums">{r.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick badges */}
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-hairline-soft">
                      {ranks.cheapest && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                          {T("cmp.mostAffordable")}
                        </span>
                      )}
                      {ranks.largest && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                          {T("cmp.largestUnits")}
                        </span>
                      )}
                      {ranks.mostListings && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                          {T("cmp.mostOptions")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {areas.length === 0 && (
        <div className="text-center py-10 text-muted">
          <GitCompare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{T("cmp.need2")}</p>
        </div>
      )}

      {areas.length === 1 && (
        <div className="text-center py-6 text-muted">
          <p className="text-sm">{T("cmp.need1")}</p>
        </div>
      )}
    </div>
  );
}

function generateRecommendation(areas: AreaComparisonItem[]): string {
  if (areas.length < 2) return "";
  const best = areas.reduce((prev, curr) => curr.pricePerSqft < prev.pricePerSqft ? curr : prev);
  return `${best.areaName} provides the best value among selected areas due to the lowest price per sqft (${formatCurrency(best.pricePerSqft, "MYR", 1)}/sqft).`;
}
