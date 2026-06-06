"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector, ReferenceLine, LabelList,
} from "recharts";
import { TrendingUp, BedDouble, Sofa } from "lucide-react";
import { cn, formatCurrency, toPeriod } from "@/lib/utils";
import { PriceBucket, BedroomBucket, FurnishingBucket, PriceSummary } from "@/types";
import { useAppStore } from "@/store/app-store";

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function BarTip({ active, payload }: { active?: boolean; payload?: { payload: PriceBucket }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-canvas border border-hairline rounded-xl px-3.5 py-2.5 shadow-lifted text-[13px] animate-fade-in">
      <p className="font-bold text-ink mb-0.5">{d.label}</p>
      <p className="text-muted">
        <span className="font-semibold text-ink">{d.count}</span> listings
        <span className="text-primary font-bold ml-1.5">{d.percentage}%</span>
      </p>
    </div>
  );
}

function PieTip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { percentage: number; fill?: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-canvas border border-hairline rounded-xl px-3.5 py-2.5 shadow-lifted text-[13px] animate-fade-in">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.payload.fill }} />
        <p className="font-bold text-ink">{p.name}</p>
      </div>
      <p className="text-muted">
        <span className="font-semibold text-ink">{p.value}</span> listings
        <span className="text-primary font-bold ml-1.5">{p.payload.percentage}%</span>
      </p>
    </div>
  );
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function ChartCard({
  title, sub, right, children,
}: { title: string; sub: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-2xl p-5 h-full flex flex-col interactive-card">
      <div className="mb-4 shrink-0 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-ink tracking-tight">{title}</h3>
          <p className="text-[12px] text-muted mt-0.5">{sub}</p>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

// ─── Price Distribution — richer, with stat reference lines ──────────────────

export function PriceDistributionChart({
  data,
  summary,
}: {
  data: PriceBucket[];
  summary?: PriceSummary;
}) {
  const { activePriceBucket, setActivePriceBucket, currency, getRate, rentalPeriod } = useAppStore();
  const [hover, setHover] = useState<number | null>(null);
  const rate = getRate();

  const total = data.reduce((a, b) => a + b.count, 0);
  // Which bucket is the mode (tallest)?
  const peakIdx = data.reduce((best, b, i) => (b.count > data[best].count ? i : best), 0);

  // Map a price value (RM) to its bucket index for reference markers
  const bucketIndexForPrice = (price: number) => {
    for (let i = 0; i < data.length; i++) {
      const b = data[i];
      if (b.max === null) { if (price >= b.min) return i; }
      else if (price >= b.min && price < b.max) return i;
    }
    return -1;
  };

  const medianIdx = summary ? bucketIndexForPrice(summary.medianPrice) : -1;
  const fairIdx = summary ? bucketIndexForPrice(summary.fairPrice) : -1;

  return (
    <ChartCard
      title="Price Distribution"
      sub="Tap a bar to filter listings"
      right={
        <div className="flex items-center gap-1 text-[11px] font-semibold text-muted bg-surface-soft dark:bg-surface-strong px-2.5 py-1 rounded-full">
          <TrendingUp className="w-3 h-3 text-primary" />
          {total} units
        </div>
      }
    >
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart
            data={data}
            barCategoryGap="18%"
            margin={{ top: 22, right: 6, left: -16, bottom: 0 }}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="barActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b85" />
                <stop offset="100%" stopColor="#ff385c" />
              </linearGradient>
              <linearGradient id="barPeak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffa3b4" />
                <stop offset="100%" stopColor="#ff5c78" />
              </linearGradient>
              <linearGradient id="barIdle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-surface-strong)" />
                <stop offset="100%" stopColor="var(--color-surface-strong)" />
              </linearGradient>
              <linearGradient id="barHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffc9d3" />
                <stop offset="100%" stopColor="#ff8fa3" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9.5, fill: "var(--color-muted)", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-muted)" }}
              axisLine={false}
              tickLine={false}
              width={26}
              allowDecimals={false}
            />
            <Tooltip content={<BarTip />} cursor={false} />

            {/* Reference markers for median & fair price */}
            {medianIdx >= 0 && (
              <ReferenceLine
                x={data[medianIdx].label}
                stroke="#3b82f6"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: "Median", position: "top", fontSize: 9, fill: "#3b82f6", fontWeight: 700 }}
              />
            )}
            {fairIdx >= 0 && fairIdx !== medianIdx && (
              <ReferenceLine
                x={data[fairIdx].label}
                stroke="#10b981"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: "Fair", position: "top", fontSize: 9, fill: "#10b981", fontWeight: 700 }}
              />
            )}

            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              animationDuration={700}
              animationEasing="ease-out"
              onMouseEnter={(_, idx) => setHover(idx)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(d: any) => setActivePriceBucket(
                activePriceBucket === d.label ? null : d.label
              )}
            >
              <LabelList
                dataKey="count"
                position="top"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={(props: any) => {
                  const { x, y, width, value } = props;
                  if (!value) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y - 5}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={700}
                      fill="var(--color-ink)"
                    >
                      {value}
                    </text>
                  );
                }}
              />
              {data.map((entry, i) => {
                const isActive = activePriceBucket === entry.label;
                const isHover = hover === i;
                const isPeak = i === peakIdx;
                const fill = isActive
                  ? "url(#barActive)"
                  : isHover
                  ? "url(#barHover)"
                  : isPeak
                  ? "url(#barPeak)"
                  : "url(#barIdle)";
                return <Cell key={entry.label} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat strip below chart */}
      {summary && (
        <div className="grid grid-cols-3 gap-2 mt-3 shrink-0">
          {[
            { label: "Average", value: toPeriod(summary.avgPrice, rentalPeriod), color: "text-ink" },
            { label: "Median", value: toPeriod(summary.medianPrice, rentalPeriod), color: "text-blue-600 dark:text-blue-400" },
            { label: "Fair Price", value: toPeriod(summary.fairPrice, rentalPeriod), color: "text-emerald-600 dark:text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-soft dark:bg-surface-strong rounded-lg px-2 py-1.5 text-center">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider">{s.label}</p>
              <p className={cn("text-[12px] font-bold tabular-nums truncate", s.color)}>
                {formatCurrency(s.value, currency, rate)}
              </p>
            </div>
          ))}
        </div>
      )}

      {activePriceBucket && (
        <div className="mt-2.5 flex items-center justify-between bg-primary/8 border border-primary/15 rounded-xl px-3 py-2 shrink-0 animate-fade-in-up">
          <span className="text-[12px] text-muted">
            Filtering: <span className="font-bold text-primary">{activePriceBucket}</span>
          </span>
          <button
            onClick={() => setActivePriceBucket(null)}
            className="text-[11px] font-bold text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </ChartCard>
  );
}

// ─── Donut chart with active sector + center total ───────────────────────────

const BEDROOM_COLORS = ["#ff385c", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];
const FURNISH_COLORS = ["#10b981", "#f59e0b", "#94a3b8"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
    </g>
  );
}

interface DonutData { label: string; count: number; percentage: number; }

function DonutChart({
  data, colors, centerLabel,
}: { data: DonutData[]; colors: string[]; centerLabel: string }) {
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);
  const total = data.reduce((a, b) => a + b.count, 0);
  const withFill = data.map((d, i) => ({ ...d, fill: colors[i % colors.length] }));

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative shrink-0" style={{ width: 130, height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={withFill}
              dataKey="count"
              nameKey="label"
              cx="50%" cy="50%"
              outerRadius={58}
              innerRadius={40}
              paddingAngle={3}
              cornerRadius={4}
              activeIndex={activeIdx}
              activeShape={renderActiveShape}
              onMouseEnter={(_, i) => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(undefined)}
              animationDuration={700}
              animationEasing="ease-out"
              stroke="none"
            >
              {withFill.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<PieTip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[22px] font-bold text-ink leading-none tabular-nums">
            {activeIdx !== undefined ? data[activeIdx].count : total}
          </span>
          <span className="text-[9px] text-muted uppercase tracking-widest font-semibold mt-0.5">
            {activeIdx !== undefined ? data[activeIdx].label : centerLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        {withFill.map((entry, i) => (
          <button
            key={entry.label}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(undefined)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-colors text-left",
              activeIdx === i ? "bg-surface-soft dark:bg-surface-strong" : ""
            )}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
            <span className="text-[12px] text-ink font-medium truncate flex-1">{entry.label}</span>
            <span className="text-[12px] text-muted font-semibold tabular-nums">{entry.percentage}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BedroomDistributionChart({ data }: { data: BedroomBucket[] }) {
  return (
    <ChartCard
      title="Bedroom Types"
      sub="Unit type breakdown"
      right={<BedDouble className="w-4 h-4 text-muted" />}
    >
      <div className="flex-1 flex items-center">
        <DonutChart data={data} colors={BEDROOM_COLORS} centerLabel="units" />
      </div>
    </ChartCard>
  );
}

export function FurnishingDistributionChart({ data }: { data: FurnishingBucket[] }) {
  return (
    <ChartCard
      title="Furnishing"
      sub="Furnishing status breakdown"
      right={<Sofa className="w-4 h-4 text-muted" />}
    >
      <div className="flex-1 flex items-center">
        <DonutChart data={data} colors={FURNISH_COLORS} centerLabel="units" />
      </div>
    </ChartCard>
  );
}
