"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Currency, CURRENCY_SYMBOLS, CURRENCY_NAMES } from "@/types";
import { useAppStore } from "@/store/app-store";

const CURRENCIES: Currency[] = ["MYR", "IDR", "USD", "SGD", "EUR", "GBP", "AUD", "JPY", "THB"];

interface CurrencySelectorProps {
  className?: string;
  compact?: boolean;
  variant?: "default" | "ghost";
  /** When true (mobile drawer), dropdown spans full width and pushes content
   *  down instead of floating over neighbouring sections. */
  fullWidth?: boolean;
}

export function CurrencySelector({ className, compact = false, variant = "default", fullWidth = false }: CurrencySelectorProps) {
  const { currency, setCurrency } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isGhost = variant === "ghost";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border font-medium transition-colors",
          fullWidth && "w-full justify-between",
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
          isGhost
            ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
            : "border-hairline bg-canvas text-ink hover:bg-surface-soft dark:hover:bg-surface-strong"
        )}
        aria-label="Select currency"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5">
          <span>{CURRENCY_SYMBOLS[currency]}</span>
          {(!compact || fullWidth) && <span>{currency}</span>}
        </span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform",
            open && "rotate-180",
            isGhost ? "text-white/70" : "text-muted"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "z-50 bg-canvas dark:bg-canvas border border-hairline rounded-xl shadow-card overflow-hidden",
            fullWidth
              ? "relative w-full mt-2"
              : "absolute right-0 top-full mt-2 w-52"
          )}
          role="listbox"
          aria-label="Currency options"
        >
          <div className={cn("py-1 overflow-y-auto", fullWidth ? "max-h-56" : "max-h-72")}>
            {CURRENCIES.map((c) => (
              <button
                key={c}
                role="option"
                aria-selected={c === currency}
                onClick={() => { setCurrency(c); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                  c === currency
                    ? "bg-surface-soft dark:bg-surface-strong font-semibold text-ink"
                    : "text-muted hover:bg-surface-soft dark:hover:bg-surface-strong hover:text-ink"
                )}
              >
                <span className="text-ink truncate">{CURRENCY_NAMES[c]}</span>
                <span className="font-semibold text-[13px] text-muted tabular-nums shrink-0">
                  {CURRENCY_SYMBOLS[c]} {c}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
