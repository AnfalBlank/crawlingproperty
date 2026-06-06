"use client";

import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const PERIODS = [
  { key: "daily" as const, label: "Daily", short: "D", icon: Calendar },
  { key: "monthly" as const, label: "Monthly", short: "M", icon: CalendarDays },
  { key: "yearly" as const, label: "Yearly", short: "Y", icon: CalendarRange },
];

/**
 * Rental period switcher (PRD §27). Switching instantly re-renders all
 * price figures across KPIs, charts, and the listings table — no reload.
 */
export function PeriodToggle({ className }: { className?: string }) {
  const { rentalPeriod, setRentalPeriod } = useAppStore();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 bg-surface-soft dark:bg-surface-strong rounded-xl p-1 border border-hairline",
        className
      )}
      role="tablist"
      aria-label="Rental period"
    >
      {PERIODS.map(({ key, label, short, icon: Icon }) => {
        const active = rentalPeriod === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => setRentalPeriod(key)}
            className={cn(
              "relative flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-[12px] font-semibold transition-all",
              active
                ? "bg-canvas dark:bg-canvas text-ink shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
          </button>
        );
      })}
    </div>
  );
}
