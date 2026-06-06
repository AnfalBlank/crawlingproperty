import { cn } from "@/lib/utils";
import { FairPriceStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted" | "primary";
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  className,
  size = "sm",
}: BadgeProps) {
  const variants = {
    default: "bg-surface-strong text-ink",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    danger:  "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    muted:   "bg-surface-soft text-muted",
    primary: "bg-primary/10 text-primary",
  };

  const sizes = {
    sm: "text-[10.5px] font-semibold px-2 py-0.5",
    md: "text-xs font-semibold px-2.5 py-1",
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-full whitespace-nowrap", variants[variant], sizes[size], className)}
    >
      {children}
    </span>
  );
}

export function FairPriceBadge({ status }: { status: FairPriceStatus }) {
  const map: Record<FairPriceStatus, { label: string; variant: BadgeProps["variant"] }> = {
    "Under Market": { label: "Under",     variant: "success" },
    "Fair":         { label: "Fair",      variant: "default" },
    "Overpriced":   { label: "Over",      variant: "danger" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CrawlStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    running:   { label: "Running",   variant: "primary" },
    queued:    { label: "Queued",    variant: "muted" },
    completed: { label: "Completed", variant: "success" },
    failed:    { label: "Failed",    variant: "danger" },
  };
  const config = map[status] || { label: status, variant: "muted" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
