"use client";

/**
 * Point 7 — Rental Yield / ROI Calculator
 * For investors: input purchase price + monthly rent (or use the area's fair
 * price) → estimated gross/net yield, annual income, payback period.
 */

import { useMemo, useState } from "react";
import { TrendingUp, RotateCcw, PiggyBank } from "lucide-react";
import { cn, formatCurrency, formatNumber, calcYield } from "@/lib/utils";
import { PriceSummary } from "@/types";
import { useAppStore } from "@/store/app-store";
import { t } from "@/lib/i18n";

interface Props {
  summary: PriceSummary;
}

export function ROICalculator({ summary }: Props) {
  const { currency, getRate, lang } = useAppStore();
  const rate = getRate();
  const T = (k: Parameters<typeof t>[1]) => t(lang, k);

  // Purchase price guess: rough 200× monthly fair rent as a sensible default
  const defaultPrice = Math.round((summary.fairPrice * 200) / 1000) * 1000;

  const [purchasePrice, setPurchasePrice] = useState<string>(String(defaultPrice));
  const [monthlyRent, setMonthlyRent] = useState<string>(String(Math.round(summary.fairPrice)));
  const [monthlyCosts, setMonthlyCosts] = useState<string>("");

  const reset = () => {
    setPurchasePrice(String(defaultPrice));
    setMonthlyRent(String(Math.round(summary.fairPrice)));
    setMonthlyCosts("");
  };

  const useFair = () => setMonthlyRent(String(Math.round(summary.fairPrice)));

  const result = useMemo(
    () =>
      calcYield({
        purchasePrice: parseFloat(purchasePrice) || 0,
        monthlyRent: parseFloat(monthlyRent) || 0,
        monthlyCosts: parseFloat(monthlyCosts) || 0,
      }),
    [purchasePrice, monthlyRent, monthlyCosts]
  );

  const ratingColor: Record<string, string> = {
    excellent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    good:      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    average:   "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    low:       "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  };
  const ratingLabel: Record<string, string> = {
    excellent: T("roi.excellent"), good: T("roi.good"),
    average: T("roi.average"), low: T("roi.low"),
  };

  const inputCls =
    "w-full h-10 pl-10 pr-3 border border-hairline rounded-lg bg-canvas dark:bg-canvas text-ink text-sm focus:outline-none focus:border-border-strong tabular-nums";

  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-2xl p-5 md:p-6 interactive-card">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
            <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-ink tracking-tight">{T("roi.title")}</h3>
            <p className="text-[12px] text-muted">{T("roi.sub")}</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="text-[12px] font-medium text-muted hover:text-ink transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> {T("calc.reset")}
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {/* Purchase price */}
        <div>
          <label htmlFor="roi-price" className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2 block">
            {T("roi.purchasePrice")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted">RM</span>
            <input
              id="roi-price"
              type="number" inputMode="numeric" placeholder="500000"
              value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Monthly rent + use-fair */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="roi-rent" className="text-[11px] font-bold text-muted uppercase tracking-widest">
              {T("roi.monthlyRent")}
            </label>
            <button onClick={useFair} className="text-[11px] font-semibold text-primary hover:underline">
              {T("roi.useFair")} ({formatCurrency(summary.fairPrice, currency, rate)})
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted">RM</span>
            <input
              id="roi-rent"
              type="number" inputMode="numeric" placeholder="2500"
              value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Monthly costs */}
        <div>
          <label htmlFor="roi-costs" className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2 block">
            {T("roi.monthlyCosts")} <span className="text-muted-soft normal-case">{T("calc.optional")}</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted">RM</span>
            <input
              id="roi-costs"
              type="number" inputMode="numeric" placeholder="400"
              value={monthlyCosts} onChange={(e) => setMonthlyCosts(e.target.value)}
              className={inputCls}
            />
          </div>
          <p className="text-[11px] text-muted mt-1.5">{T("roi.maintenance")}</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-5 pt-5 border-t border-hairline-soft">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{T("roi.result")}</p>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", ratingColor[result.rating])}>
              <TrendingUp className="w-3 h-3" /> {ratingLabel[result.rating]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-surface-soft dark:bg-surface-strong rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{T("roi.grossYield")}</p>
              <p className="text-2xl font-bold text-ink tabular-nums leading-none">{result.grossYield.toFixed(2)}%</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-canvas dark:from-emerald-950/20 dark:to-canvas border border-emerald-100 dark:border-emerald-900 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{T("roi.netYield")}</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">{result.netYield.toFixed(2)}%</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">{T("roi.annualIncome")}</span>
              <span className="font-bold text-ink tabular-nums">
                {formatCurrency(result.annualNet, currency, rate)}<span className="text-muted font-normal">{T("roi.perYear")}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">{T("roi.payback")}</span>
              <span className="font-bold text-ink tabular-nums">
                {Number.isFinite(result.paybackYears) ? `${formatNumber(result.paybackYears, 1)} ${T("roi.years")}` : "—"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted mt-4 leading-relaxed">{T("roi.assumption")}</p>
        </div>
      )}
    </div>
  );
}
