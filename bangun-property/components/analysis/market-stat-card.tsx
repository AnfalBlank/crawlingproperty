"use client";

import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn, formatCurrency, toPeriod, periodSuffix } from "@/lib/utils";
import { PriceSummary } from "@/types";
import { useAppStore } from "@/store/app-store";

/**
 * Compact "snapshot" card that fills the 4th column on xl screens, summarising
 * the market in 4 numbers + a sparkline-ish bar.
 */
export function MarketStatCard({ summary }: { summary: PriceSummary }) {
  const { currency, getRate, rentalPeriod } = useAppStore();
  const rate = getRate();

  const fair = toPeriod(summary.fairPrice, rentalPeriod);
  const avg = toPeriod(summary.avgPrice, rentalPeriod);
  const median = toPeriod(summary.medianPrice, rentalPeriod);

  // Spread: how volatile is this market? (avg-median delta as % of median)
  const spread = Math.abs(avg - median) / median;
  const stability =
    spread < 0.05 ? { label: "Stable", color: "emerald", Icon: Minus } :
    spread < 0.12 ? { label: "Balanced", color: "blue", Icon: TrendingUp } :
    avg > median  ? { label: "Top-heavy", color: "amber", Icon: ArrowUpRight } :
                    { label: "Skewed", color: "rose", Icon: ArrowDownRight };

  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
    blue:    "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
    amber:   "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
    rose:    "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
  };

  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-2xl p-5 h-full flex flex-col interactive-card">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-[15px] font-bold text-ink tracking-tight">Market Snapshot</h3>
          <p className="text-[12px] text-muted mt-0.5">Quick read of the market</p>
        </div>
        <div className={cn(
          "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border",
          colorClasses[stability.color]
        )}>
          <stability.Icon className="w-3 h-3" />
          {stability.label}
        </div>
      </div>

      {/* Big fair price */}
      <div className="bg-gradient-to-br from-rose-50 to-canvas dark:from-rose-950/20 dark:to-canvas border border-primary/15 rounded-xl px-4 py-3 mb-3">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Fair Price</p>
        <p className="text-2xl font-bold text-primary tabular-nums leading-none">
          {formatCurrency(fair, currency, rate)}
          <span className="text-xs text-muted font-normal ml-1">{periodSuffix(rentalPeriod)}</span>
        </p>
        <p className="text-[11px] text-muted mt-1.5">70% median + 30% average</p>
      </div>

      {/* Stat rows */}
      <div className="space-y-2 flex-1">
        {[
          { label: "Total listings", value: summary.totalListings.toLocaleString("en-US"), tone: "text-ink" },
          { label: "Avg unit size", value: `${Math.round(summary.avgSqft)} ft²`, tone: "text-ink" },
          { label: "Top unit type", value: summary.dominantUnitType, tone: "text-ink" },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between text-[12px]">
            <span className="text-muted">{r.label}</span>
            <span className={cn("font-bold tabular-nums", r.tone)}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Spread bar */}
      <div className="mt-4 pt-3 border-t border-hairline-soft">
        <div className="flex items-center justify-between text-[11px] text-muted mb-1.5">
          <span>Avg vs Median spread</span>
          <span className="font-bold text-ink">{(spread * 100).toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-surface-strong rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(spread * 400, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
