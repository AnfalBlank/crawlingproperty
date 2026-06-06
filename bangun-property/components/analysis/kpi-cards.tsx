"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3, TrendingUp, Target, Maximize2, Home, BedDouble, ListFilter,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { cn, formatCurrency, formatNumber, toPeriod, periodSuffix } from "@/lib/utils";
import { PriceSummary } from "@/types";
import { useAppStore } from "@/store/app-store";

function useCountUp(target: number, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);
        if (progress < 1) frameRef.current = requestAnimationFrame(step);
      };
      frameRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  iconBg?: string;
  delay?: number;
  trend?: { value: string; up: boolean };
}

function KPICard({ label, value, subtitle, icon, highlight, iconBg, delay = 0, trend }: KPICardProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 md:p-5 overflow-hidden interactive-card group",
        highlight
          ? "border-primary/30 bg-gradient-to-br from-rose-50 via-canvas to-canvas dark:from-rose-950/20 dark:via-canvas dark:to-canvas"
          : "border-hairline bg-canvas dark:bg-canvas"
      )}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
    >
      {highlight && (
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}

      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div
          className={cn(
            "w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3",
            iconBg || (highlight ? "bg-primary/10 text-primary" : "bg-surface-strong text-muted")
          )}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full",
              trend.up
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
            )}
          >
            {trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>

      <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p
        className={cn(
          "font-display font-bold leading-none tracking-tight truncate num",
          "text-[22px] md:text-[26px] lg:text-[28px]",
          highlight ? "text-primary" : "text-ink"
        )}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-[12px] text-muted mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  );
}

export function KPICards({ summary, area }: { summary: PriceSummary; area?: string }) {
  const { currency, getRate, rentalPeriod } = useAppStore();
  const rate = getRate();

  // Real trend computed from price_history (PRD §40). Null until loaded; null = no trend pill.
  const [trends, setTrends] = useState<{ avg: number | null; median: number | null; fair: number | null }>({
    avg: null, median: null, fair: null,
  });

  useEffect(() => {
    if (!area) return;
    let alive = true;
    fetch(`/api/history?area=${encodeURIComponent(area)}&days=30`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !Array.isArray(data.points) || data.points.length < 2) return;
        const first = data.points[0];
        const last = data.points[data.points.length - 1];
        const pct = (a: number, b: number) => (a > 0 ? ((b - a) / a) * 100 : 0);
        setTrends({
          avg:    pct(first.avgPrice,    last.avgPrice),
          median: pct(first.medianPrice, last.medianPrice),
          fair:   pct(first.fairPrice,   last.fairPrice),
        });
      })
      .catch(() => { /* ignore */ });
    return () => { alive = false; };
  }, [area]);

  // Apply rental period multiplier to monthly figures (PRD §27)
  const avgRent = toPeriod(summary.avgPrice, rentalPeriod);
  const medRent = toPeriod(summary.medianPrice, rentalPeriod);
  const fairRent = toPeriod(summary.fairPrice, rentalPeriod);

  const total  = useCountUp(summary.totalListings, 800, 0);
  const avg    = useCountUp(Math.round(avgRent * rate), 900, 80);
  const median = useCountUp(Math.round(medRent * rate), 900, 160);
  const fair   = useCountUp(Math.round(fairRent * rate), 1000, 240);
  const sqft   = useCountUp(Math.round(summary.avgSqft), 800, 320);
  const psf    = useCountUp(toPeriod(summary.avgPricePerSqft, rentalPeriod) * rate, 800, 400);

  const fmt = (n: number) => formatCurrency(n, currency, 1);
  const sfx = periodSuffix(rentalPeriod);

  // Build a trend prop from a percentage; only show when |%| > 0.3 to avoid noise.
  const trendOf = (pct: number | null): { value: string; up: boolean } | undefined => {
    if (pct == null || Math.abs(pct) < 0.3) return undefined;
    return { value: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`, up: pct > 0 };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
      <KPICard
        label="Total Listings"
        value={formatNumber(total)}
        subtitle="active rentals"
        icon={<ListFilter className="w-5 h-5" />}
        iconBg="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        delay={0}
      />
      <KPICard
        label="Average Rent"
        value={fmt(avg)}
        subtitle={sfx.replace("/", "per ")}
        icon={<BarChart3 className="w-5 h-5" />}
        iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        trend={trendOf(trends.avg)}
        delay={80}
      />
      <KPICard
        label="Median Rent"
        value={fmt(median)}
        subtitle="middle value"
        icon={<TrendingUp className="w-5 h-5" />}
        iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
        trend={trendOf(trends.median)}
        delay={160}
      />
      <KPICard
        label="Fair Price"
        value={fmt(fair)}
        subtitle="70% med + 30% avg"
        icon={<Target className="w-5 h-5" />}
        highlight
        trend={trendOf(trends.fair)}
        delay={240}
      />
      <KPICard
        label="Avg Sqft"
        value={`${formatNumber(sqft)} ft²`}
        subtitle="unit size"
        icon={<Maximize2 className="w-5 h-5" />}
        iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        delay={320}
      />
      <KPICard
        label="Price / Sqft"
        value={fmt(Math.round(psf * 100) / 100)}
        subtitle="per square foot"
        icon={<Home className="w-5 h-5" />}
        iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        delay={400}
      />
      <KPICard
        label="Top Unit"
        value={summary.dominantUnitType}
        subtitle="most common type"
        icon={<BedDouble className="w-5 h-5" />}
        iconBg="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
        delay={480}
      />
    </div>
  );
}
