"use client";

import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { t } from "@/lib/i18n";

const PERIODS = [
  { key: "daily" as const, tkey: "period.daily" as const, short: "D", icon: Calendar },
  { key: "monthly" as const, tkey: "period.monthly" as const, short: "M", icon: CalendarDays },
  { key: "yearly" as const, tkey: "period.yearly" as const, short: "Y", icon: CalendarRange },
];

/**
 * Rental period switcher (PRD §27). Switching instantly re-renders all
 * price figures across KPIs, charts, and the listings table — no reload.
 */
export function PeriodToggle({ className }: { className?: string }) {
  const { rentalPeriod, setRentalPeriod, lang } = useAppStore();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 bg-surface-soft dark:bg-surface-strong rounded-xl p-1 border border-hairline",
        className
      )}
      role="tablist"
      aria-label="Rental period"
    >
      {PERIODS.map(({ key, tkey, short, icon: Icon }) => {
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
            <span className="hidden sm:inline">{t(lang, tkey)}</span>
            <span className="sm:hidden">{short}</span>
          </button>
        );
      })}
    </div>
  );
}
