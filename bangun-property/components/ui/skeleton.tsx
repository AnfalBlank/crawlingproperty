import { cn } from "@/lib/utils";

// ─── Base ─────────────────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      style={style}
      aria-hidden="true"
    />
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export function SkeletonKPICard() {
  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5 space-y-4 overflow-hidden">
      <div className="flex items-start justify-between">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="w-10 h-4 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2.5 w-20 rounded" />
        <Skeleton className="h-6 w-28 rounded" />
        <Skeleton className="h-2.5 w-14 rounded" />
      </div>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
export function SkeletonBarChart() {
  const heights = [50, 80, 42, 90, 62, 38];
  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5 overflow-hidden">
      <div className="space-y-1.5 mb-5">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-2.5 w-20 rounded" />
      </div>
      <div className="flex items-end gap-2" style={{ height: "140px" }}>
        {heights.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full">
            <Skeleton className="w-full rounded-t-md" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        {heights.map((_, i) => <Skeleton key={i} className="flex-1 h-2.5 rounded" />)}
      </div>
    </div>
  );
}

// ─── Pie Chart ────────────────────────────────────────────────────────────────
export function SkeletonPieChart() {
  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5 overflow-hidden">
      <div className="space-y-1.5 mb-4">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-2.5 w-20 rounded" />
      </div>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <Skeleton className="w-full h-full rounded-full" />
          <div className="absolute inset-[22%] rounded-full bg-canvas dark:bg-canvas" />
        </div>
        <div className="flex-1 space-y-2.5">
          {[75, 90, 60].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
              <Skeleton className="h-2.5 rounded" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Insight ──────────────────────────────────────────────────────────────────
export function SkeletonInsight() {
  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5 overflow-hidden">
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-2.5 w-20 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Skeleton className="w-[18px] h-[18px] rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 rounded" style={{ width: i === 3 ? "60%" : "80%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────
export function SkeletonRow({ index = 0 }: { index?: number }) {
  return (
    <div
      className="flex items-center gap-4 py-3.5 px-4 border-b border-hairline-soft"
      style={{ animation: `fade-in-up 0.4s ease both ${index * 35}ms` }}
      aria-hidden="true"
    >
      <Skeleton className="h-3.5 flex-1 max-w-[180px] rounded" />
      <Skeleton className="h-5 w-12 rounded-full" />
      <Skeleton className="h-3.5 w-20 rounded hidden sm:block" />
      <Skeleton className="h-3.5 w-16 rounded hidden md:block" />
      <Skeleton className="h-3.5 w-20 rounded hidden lg:block" />
      <Skeleton className="h-5 w-16 rounded-full hidden lg:block" />
      <div className="flex gap-1.5 ml-auto">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="w-7 h-7 rounded-full" />
      </div>
    </div>
  );
}

// ─── Dashboard header ─────────────────────────────────────────────────────────
export function SkeletonDashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div className="space-y-2">
        <Skeleton className="h-6 w-44 rounded-lg" />
        <Skeleton className="h-3.5 w-56 rounded" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {[64, 68, 80, 80, 40].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-lg" style={{ width: `${w}px` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Crawl progress ───────────────────────────────────────────────────────────
export function CrawlProgressCard({ stage, progress }: { stage: string; progress: number }) {
  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1 shrink-0" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary block"
                style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <span className="text-[13px] font-medium text-ink truncate">{stage}</span>
        </div>
        <span className="text-[13px] font-bold text-primary tabular-nums ml-4 shrink-0">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-strong rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage labels */}
      <div className="flex justify-between mt-3">
        {["Init", "Fetch", "Process", "Analyze", "Done"].map((s, i) => (
          <span
            key={s}
            className={progress >= (i + 1) * 20
              ? "text-[10px] font-semibold text-primary"
              : "text-[10px] font-semibold text-muted"
            }
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
