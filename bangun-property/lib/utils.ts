import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency, CURRENCY_SYMBOLS, FairPriceStatus, Listing, PriceSummary } from "@/types";

// ─── Class Utility ────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Number Formatting (locale-stable for SSR/hydration) ─────────────────────

/**
 * Format number with comma separators using en-US locale.
 * Always returns the same string on server and client to prevent hydration mismatch.
 */
export function formatNumber(n: number, decimals = 0): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "0";
  const fixed = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
  // Manually insert thousand separators — locale-independent
  const [intPart, decPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${withCommas}.${decPart}` : withCommas;
}

// ─── Currency Formatting ──────────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency: Currency = "MYR",
  rate: number = 1
): string {
  const converted = amount * rate;
  const symbol = CURRENCY_SYMBOLS[currency];

  if (currency === "JPY" || currency === "IDR") {
    return `${symbol}${formatNumber(converted)}`;
  }

  return `${symbol}${formatNumber(converted)}`;
}

export function formatCompact(amount: number, currency: Currency = "MYR", rate: number = 1): string {
  const converted = amount * rate;
  const symbol = CURRENCY_SYMBOLS[currency];
  if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${symbol}${(converted / 1_000).toFixed(1)}K`;
  return `${symbol}${formatNumber(converted)}`;
}

// ─── Rental period conversion (PRD §27) ──────────────────────────────────────

export type RentalPeriod = "daily" | "monthly" | "yearly";

/** Convert a monthly rent figure into the selected period. */
export function toPeriod(monthlyRent: number, period: RentalPeriod): number {
  switch (period) {
    case "daily":
      return monthlyRent / 30;
    case "yearly":
      return monthlyRent * 12;
    case "monthly":
    default:
      return monthlyRent;
  }
}

export function periodSuffix(period: RentalPeriod): string {
  return period === "daily" ? "/day" : period === "yearly" ? "/yr" : "/mo";
}

// ─── Price Analytics ──────────────────────────────────────────────────────────

export function calcAverage(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function calcMedian(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function calcMode(nums: number[]): number {
  if (!nums.length) return 0;
  const freq: Record<number, number> = {};
  let maxFreq = 0;
  let mode = nums[0];
  for (const n of nums) {
    // Round to nearest 50 for bucketing
    const bucket = Math.round(n / 50) * 50;
    freq[bucket] = (freq[bucket] || 0) + 1;
    if (freq[bucket] > maxFreq) {
      maxFreq = freq[bucket];
      mode = bucket;
    }
  }
  return mode;
}

export function calcFairPrice(median: number, average: number): number {
  return median * 0.7 + average * 0.3;
}

export function getFairPriceStatus(price: number, fairPrice: number): FairPriceStatus {
  if (price < fairPrice * 0.9) return "Under Market";
  if (price > fairPrice * 1.1) return "Overpriced";
  return "Fair";
}

export function calcPriceSummary(listings: Listing[], areaName: string): PriceSummary {
  const monthly = listings
    .map((l) => l.monthlyRent)
    .filter((r): r is number => r !== null);

  const sqfts = listings.map((l) => l.sqft).filter((s) => s > 0);
  const pricePerSqfts = listings.map((l) => l.pricePerSqft).filter((p) => p > 0);

  const avg = calcAverage(monthly);
  const median = calcMedian(monthly);

  // Dominant unit type
  const bedroomCount: Record<string, number> = {};
  for (const l of listings) {
    const key = l.bedrooms === "Studio" ? "Studio" : `${l.bedrooms}BR`;
    bedroomCount[key] = (bedroomCount[key] || 0) + 1;
  }
  const dominantUnitType =
    Object.entries(bedroomCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return {
    areaId: areaName.toLowerCase().replace(/\s+/g, "-"),
    areaName,
    avgPrice: avg,
    medianPrice: median,
    modePrice: calcMode(monthly),
    fairPrice: calcFairPrice(median, avg),
    avgSqft: calcAverage(sqfts),
    avgPricePerSqft: calcAverage(pricePerSqfts),
    totalListings: listings.length,
    dominantUnitType,
  };
}

// ─── Price Distribution ───────────────────────────────────────────────────────

export function calcPriceDistribution(listings: Listing[]) {
  const buckets = [
    { label: "< RM1,500", min: 0, max: 1500 },
    { label: "RM1,500–2,000", min: 1500, max: 2000 },
    { label: "RM2,000–2,500", min: 2000, max: 2500 },
    { label: "RM2,500–3,000", min: 2500, max: 3000 },
    { label: "RM3,000–3,500", min: 3000, max: 3500 },
    { label: "RM3,500+", min: 3500, max: null },
  ];

  const monthly = listings.filter((l) => l.monthlyRent !== null);

  return buckets.map((b) => {
    const count = monthly.filter((l) => {
      const r = l.monthlyRent!;
      if (b.max === null) return r >= b.min;
      return r >= b.min && r < b.max;
    }).length;
    return {
      ...b,
      count,
      percentage: monthly.length ? Math.round((count / monthly.length) * 100) : 0,
    };
  });
}

// ─── Market Insight Generator ─────────────────────────────────────────────────

export function generateInsights(area: string, summary: PriceSummary, listings: Listing[]): string[] {
  const insights: string[] = [];
  const diff = Math.abs(summary.avgPrice - summary.medianPrice);
  const stability = diff / summary.medianPrice < 0.1 ? "stable" : "volatile";
  const bedroomCount: Record<string, number> = {};

  for (const l of listings) {
    const key = l.bedrooms === "Studio" ? "Studio" : `${l.bedrooms}BR`;
    bedroomCount[key] = (bedroomCount[key] || 0) + 1;
  }

  const topBedroom = Object.entries(bedroomCount).sort((a, b) => b[1] - a[1])[0];
  const topShare = topBedroom ? Math.round((topBedroom[1] / listings.length) * 100) : 0;

  insights.push(
    `${area} currently has ${summary.totalListings} active rental listings.`
  );
  insights.push(
    `The average rental price is RM${formatNumber(summary.avgPrice)}/month.`
  );
  if (topBedroom) {
    insights.push(
      `${topBedroom[0]} units dominate the market with ${topShare}% market share.`
    );
  }
  insights.push(
    `The market appears ${stability} — ${stability === "stable" ? "small" : "notable"} difference between average and median prices.`
  );

  const ffCount = listings.filter((l) => l.furnishing === "Fully Furnished").length;
  const ffPct = Math.round((ffCount / listings.length) * 100);
  insights.push(`${ffPct}% of listings are fully furnished.`);

  return insights;
}

// ─── Date Utilities (locale-stable) ──────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "_");
}

export function getExportFilename(area: string): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return `SPEEDHOME_${area.replace(/\s+/g, "_")}_${date}`;
}

// ─── Linear Trend / Forecasting (PRD §40 — price prediction) ─────────────────

export interface TrendResult {
  /** Slope per day (RM/day) */
  slope: number;
  /** Average y value (intercept basis) */
  baseline: number;
  /** Projected price 30 days from the latest data point */
  projected30d: number;
  /** Percent change vs current latest value */
  percent: number;
  /** Direction signal */
  direction: "up" | "down" | "flat";
}

/**
 * Simple linear regression on a series of {snapshotAt, value} points.
 * Returns slope (per-day) plus a 30-day-out projection.
 */
export function calcLinearTrend(
  points: { snapshotAt: string; value: number }[]
): TrendResult | null {
  if (!points || points.length < 2) return null;

  const t0 = new Date(points[0].snapshotAt).getTime();
  const xs = points.map((p) => (new Date(p.snapshotAt).getTime() - t0) / (1000 * 60 * 60 * 24));
  const ys = points.map((p) => p.value);
  const n = xs.length;

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];
  const projected30d = intercept + slope * (lastX + 30);
  const percent = lastY ? ((projected30d - lastY) / lastY) * 100 : 0;

  return {
    slope,
    baseline: intercept,
    projected30d,
    percent,
    direction: Math.abs(percent) < 0.5 ? "flat" : percent > 0 ? "up" : "down",
  };
}

// ─── URL Helpers (Item 8 — Share dashboard) ──────────────────────────────────
export function buildShareUrl(params: {
  area: string;
  currency?: string;
  period?: RentalPeriod;
  compare?: boolean;
}): string {
  if (typeof window === "undefined") return "";
  const u = new URL(window.location.origin + "/analysis");
  u.searchParams.set("area", params.area);
  if (params.currency && params.currency !== "MYR") u.searchParams.set("currency", params.currency);
  if (params.period && params.period !== "monthly") u.searchParams.set("period", params.period);
  if (params.compare) u.searchParams.set("compare", "1");
  return u.toString();
}

// ─── Rental Yield / ROI (Point 7 — investor calculator) ──────────────────────

export interface YieldResult {
  /** Annual rent (12 × monthly) in MYR */
  annualGross: number;
  /** Annual rent minus annual costs */
  annualNet: number;
  /** Gross yield % = annualGross / purchasePrice × 100 */
  grossYield: number;
  /** Net yield % = annualNet / purchasePrice × 100 */
  netYield: number;
  /** Years to recoup the purchase price from net income */
  paybackYears: number;
  /** Qualitative rating bucket based on net yield */
  rating: "excellent" | "good" | "average" | "low";
}

/**
 * Compute rental yield for a hypothetical purchase.
 * All money values in MYR (base currency); convert for display only.
 *
 * Malaysian residential rental yields typically run 3–6 %:
 *   ≥ 6 % excellent · 4.5–6 % good · 3–4.5 % average · < 3 % low
 */
export function calcYield(input: {
  purchasePrice: number;
  monthlyRent: number;
  monthlyCosts?: number;
}): YieldResult | null {
  const { purchasePrice, monthlyRent, monthlyCosts = 0 } = input;
  if (!purchasePrice || purchasePrice <= 0 || !monthlyRent || monthlyRent <= 0) return null;

  const annualGross = monthlyRent * 12;
  const annualNet = Math.max(0, (monthlyRent - monthlyCosts) * 12);
  const grossYield = (annualGross / purchasePrice) * 100;
  const netYield = (annualNet / purchasePrice) * 100;
  const paybackYears = annualNet > 0 ? purchasePrice / annualNet : Infinity;

  const rating: YieldResult["rating"] =
    netYield >= 6 ? "excellent" :
    netYield >= 4.5 ? "good" :
    netYield >= 3 ? "average" : "low";

  return { annualGross, annualNet, grossYield, netYield, paybackYears, rating };
}
