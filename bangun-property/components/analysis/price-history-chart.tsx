"use client";

/**
 * Item 2 — Historical price tracking + Item 7 — Price prediction trend
 * Loads /api/history?area=...&days=N and renders a multi-line chart.
 */

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, Area, AreaChart, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, History, Sparkles } from "lucide-react";
import { cn, formatCurrency, calcLinearTrend, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

interface Point {
  snapshotAt: string;
  avgPrice: number;
  medianPrice: number;
  fairPrice: number;
  totalListings: number;
}

interface Props {
  area: string;
}

export function PriceHistoryChart({ area }: Props) {
  const { currency, getRate } = useAppStore();
  const rate = getRate();

  const [points, setPoints] = useState<Point[]>([]);
  const [days, setDays] = useState<30 | 60 | 90>(60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/history?area=${encodeURIComponent(area)}&days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setPoints(Array.isArray(data.points) ? data.points : []);
      })
      .catch(() => alive && setPoints([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [area, days]);

  const chartData = useMemo(
    () => points.map((p) => ({
      ...p,
      label: formatDate(p.snapshotAt).split(" ").slice(0, 2).join(" "), // "12 Jun"
      avgPriceConv: Math.round(p.avgPrice * rate),
      medianPriceConv: Math.round(p.medianPrice * rate),
      fairPriceConv: Math.round(p.fairPrice * rate),
    })),
    [points, rate]
  );

  // Linear trend on fair price
  const trend = useMemo(() => {
    if (points.length < 2) return null;
    return calcLinearTrend(points.map((p) => ({ snapshotAt: p.snapshotAt, value: p.fairPrice })));
  }, [points]);

  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-2xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-ink tracking-tight">Price History</h3>
            <p className="text-[12px] text-muted">{area} — last {days} days</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface-soft dark:bg-surface-strong rounded-lg p-1">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d as 30 | 60 | 90)}
              className={cn(
                "px-2.5 h-7 rounded-md text-[11px] font-bold transition-all",
                days === d
                  ? "bg-canvas text-ink shadow-sm dark:bg-canvas"
                  : "text-muted hover:text-ink"
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : points.length < 2 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 rounded-full bg-surface-soft dark:bg-surface-strong flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-muted" />
          </div>
          <p className="text-sm font-semibold text-ink">Tracking starts now</p>
          <p className="text-xs text-muted mt-1 max-w-xs">
            We&apos;ll record a snapshot each time this area is analyzed. Check back in 24h to see trends.
          </p>
        </div>
      ) : (
        <>
          {/* Trend tile (Item 7) */}
          {trend && (
            <div className={cn(
              "mb-4 px-4 py-3 rounded-xl border flex items-center gap-3",
              trend.direction === "up"   ? "bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900" :
              trend.direction === "down" ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900" :
                                           "bg-surface-soft border-hairline dark:bg-surface-strong"
            )}>
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center",
                trend.direction === "up"   ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                trend.direction === "down" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                                             "bg-muted/15 text-muted"
              )}>
                {trend.direction === "up" ? <TrendingUp className="w-4 h-4" /> :
                 trend.direction === "down" ? <TrendingDown className="w-4 h-4" /> :
                 <Minus className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-ink">
                  Trending {trend.direction === "up" ? "up" : trend.direction === "down" ? "down" : "flat"}
                  {" "}
                  <span className={cn(
                    "tabular-nums",
                    trend.direction === "up"   ? "text-amber-700 dark:text-amber-400" :
                    trend.direction === "down" ? "text-emerald-700 dark:text-emerald-400" :
                                                 "text-muted"
                  )}>
                    {trend.percent > 0 ? "+" : ""}{trend.percent.toFixed(1)}%
                  </span>
                  {" "}forecast in 30 days
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Projected fair price ≈ {formatCurrency(trend.projected30d, currency, rate)}
                </p>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="histFair" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF385C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF385C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                axisLine={false} tickLine={false} width={48}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}K`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12, border: "1px solid var(--color-hairline)",
                  background: "var(--color-canvas)", fontSize: 12,
                  boxShadow: "var(--shadow-lifted)",
                }}
                formatter={(v: number) => formatCurrency(Number(v) / rate, currency, rate)}
                labelFormatter={(l) => l}
              />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{v}</span>} />
              <Area
                type="monotone" dataKey="fairPriceConv" name="Fair Price"
                stroke="#FF385C" strokeWidth={2.5}
                fill="url(#histFair)"
                animationDuration={700}
              />
              <Line type="monotone" dataKey="avgPriceConv"    name="Avg"    stroke="#3b82f6" strokeWidth={1.8} dot={false} animationDuration={700} />
              <Line type="monotone" dataKey="medianPriceConv" name="Median" stroke="#10b981" strokeWidth={1.8} dot={false} strokeDasharray="4 3" animationDuration={700} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
