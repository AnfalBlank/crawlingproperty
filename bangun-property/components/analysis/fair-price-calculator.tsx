"use client";

/**
 * Item 1 — Fair Price Calculator
 * Lets a user plug in spec (bedrooms / sqft / furnishing) and instantly
 * see what a "fair" price for those specs would be in this area.
 *
 * Adjustment model:
 *   sqft factor:    sqft / area_avg_sqft        (linear)
 *   furnishing:     FF +5 %, PF 0 %, Unfurn -3 %
 *   bedroom factor: from area's bedroom distribution (heuristic):
 *                     Studio  → 0.78
 *                     1BR     → 0.88
 *                     2BR     → 1.00 (baseline)
 *                     3BR     → 1.20
 *                     4+BR    → 1.45
 */

import { useMemo, useState } from "react";
import { Calculator, Sparkles, RotateCcw } from "lucide-react";
import { cn, formatCurrency, formatNumber, getFairPriceStatus, toPeriod, periodSuffix } from "@/lib/utils";
import { Furnishing, PriceSummary } from "@/types";
import { useAppStore } from "@/store/app-store";

interface Props {
  summary: PriceSummary;
}

const BEDROOM_OPTS: { value: string; label: string; factor: number }[] = [
  { value: "Studio", label: "Studio", factor: 0.78 },
  { value: "1",      label: "1BR",    factor: 0.88 },
  { value: "2",      label: "2BR",    factor: 1.00 },
  { value: "3",      label: "3BR",    factor: 1.20 },
  { value: "4",      label: "4+BR",   factor: 1.45 },
];

const FURNISH_OPTS: { value: Furnishing; short: string; premium: number }[] = [
  { value: "Fully Furnished",     short: "FF",     premium:  0.05 },
  { value: "Partially Furnished", short: "Partial",premium:  0.00 },
  { value: "Unfurnished",         short: "Unfurn", premium: -0.03 },
];

export function FairPriceCalculator({ summary }: Props) {
  const { currency, getRate, rentalPeriod } = useAppStore();
  const rate = getRate();

  const [bedrooms, setBedrooms]     = useState<string>("2");
  const [sqft, setSqft]             = useState<number>(Math.round(summary.avgSqft || 800));
  const [furnishing, setFurnishing] = useState<Furnishing>("Partially Furnished");
  const [yourPrice, setYourPrice]   = useState<string>("");

  const reset = () => {
    setBedrooms("2");
    setSqft(Math.round(summary.avgSqft || 800));
    setFurnishing("Partially Furnished");
    setYourPrice("");
  };

  const result = useMemo(() => {
    const bed = BEDROOM_OPTS.find((o) => o.value === bedrooms) ?? BEDROOM_OPTS[2];
    const fur = FURNISH_OPTS.find((o) => o.value === furnishing) ?? FURNISH_OPTS[1];
    const baselineSqft = summary.avgSqft || 800;
    const sqftFactor = sqft > 0 ? sqft / baselineSqft : 1;
    // weighted: bedroom factor dominates, sqft fine-tunes
    const adjusted = summary.fairPrice * (0.55 * bed.factor + 0.45 * sqftFactor) * (1 + fur.premium);
    const ppsf = sqft > 0 ? adjusted / sqft : 0;
    return { fair: adjusted, ppsf };
  }, [bedrooms, sqft, furnishing, summary]);

  const yourPriceNum = parseFloat(yourPrice) || 0;
  const status = yourPriceNum > 0 ? getFairPriceStatus(yourPriceNum, result.fair) : null;
  const diffPct = yourPriceNum > 0 ? ((yourPriceNum - result.fair) / result.fair) * 100 : 0;

  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-2xl p-5 md:p-6 interactive-card">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-ink tracking-tight">Fair Price Calculator</h3>
            <p className="text-[12px] text-muted">Estimate based on this area</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="text-[12px] font-medium text-muted hover:text-ink transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {/* Bedrooms */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2 block">Bedrooms</label>
          <div className="grid grid-cols-5 gap-1.5">
            {BEDROOM_OPTS.map((o) => (
              <button
                key={o.value}
                onClick={() => setBedrooms(o.value)}
                className={cn(
                  "h-9 rounded-lg text-[12px] font-bold transition-all border",
                  bedrooms === o.value
                    ? "bg-ink text-white border-ink shadow-sm"
                    : "bg-canvas text-muted border-hairline hover:border-border-strong"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sqft slider + input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest">Built-up size</label>
            <span className="text-[12px] font-bold text-ink tabular-nums">{formatNumber(sqft)} ft²</span>
          </div>
          <input
            type="range"
            min={300} max={3000} step={50}
            value={sqft}
            onChange={(e) => setSqft(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-surface-strong rounded-full appearance-none cursor-pointer accent-primary"
            aria-label="Built-up size"
          />
          <div className="flex items-center justify-between text-[10px] text-muted mt-1.5">
            <span>300 ft²</span><span>3,000 ft²</span>
          </div>
        </div>

        {/* Furnishing */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2 block">Furnishing</label>
          <div className="grid grid-cols-3 gap-1.5">
            {FURNISH_OPTS.map((o) => (
              <button
                key={o.value}
                onClick={() => setFurnishing(o.value)}
                className={cn(
                  "h-9 rounded-lg text-[12px] font-semibold transition-all border",
                  furnishing === o.value
                    ? "bg-ink text-white border-ink"
                    : "bg-canvas text-muted border-hairline hover:border-border-strong"
                )}
              >
                {o.short}
              </button>
            ))}
          </div>
        </div>

        {/* Your price (optional vs-market) */}
        <div>
          <label htmlFor="fpc-your-price" className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2 block">
            Your price <span className="text-muted-soft normal-case">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted">RM</span>
            <input
              id="fpc-your-price"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 2500"
              value={yourPrice}
              onChange={(e) => setYourPrice(e.target.value)}
              className="w-full h-10 pl-10 pr-3 border border-hairline rounded-lg bg-canvas dark:bg-canvas text-ink text-sm focus:outline-none focus:border-border-strong tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-5 pt-5 border-t border-hairline-soft">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Estimated fair rent</p>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="text-3xl font-bold text-primary tabular-nums leading-none">
              {formatCurrency(toPeriod(result.fair, rentalPeriod), currency, rate)}
              <span className="text-sm text-muted font-normal ml-1">{periodSuffix(rentalPeriod)}</span>
            </p>
            <p className="text-[12px] text-muted mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              {formatCurrency(result.ppsf, currency, rate)} / ft²
            </p>
          </div>

          {status && (
            <div className="text-right">
              <p className={cn(
                "text-base font-bold tabular-nums",
                status === "Overpriced"   ? "text-red-600 dark:text-red-400" :
                status === "Under Market" ? "text-emerald-600 dark:text-emerald-400" :
                                            "text-ink"
              )}>
                {diffPct > 0 ? "+" : ""}{diffPct.toFixed(1)}%
              </p>
              <p className={cn(
                "inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full mt-1",
                status === "Overpriced"   ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" :
                status === "Under Market" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                                            "bg-surface-strong text-ink"
              )}>
                {status === "Under Market" ? "Under" : status === "Overpriced" ? "Over" : "Fair"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
