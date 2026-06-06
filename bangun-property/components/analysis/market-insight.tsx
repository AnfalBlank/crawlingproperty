"use client";

import { Lightbulb, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";

interface MarketInsightProps {
  area: string;
  insights: string[];
}

export function MarketInsight({ area, insights }: MarketInsightProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? insights : insights.slice(0, 3);

  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-2xl p-5 md:p-6 h-full flex flex-col interactive-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-950/20 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-bold text-ink leading-tight">Market Insights</h3>
          <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI-generated for {area}
          </p>
        </div>
      </div>

      <ul className="space-y-3.5 flex-1">
        {visible.map((insight, i) => (
          <li
            key={i}
            className="flex items-start gap-3 group"
            style={{ animation: `fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms both` }}
          >
            <span className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums group-hover:scale-110 transition-transform">
              {i + 1}
            </span>
            <p className="text-sm md:text-[15px] text-body leading-[1.65] flex-1">{insight}</p>
          </li>
        ))}
      </ul>

      {insights.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-5 flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline"
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4" /> Show less</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Show {insights.length - 3} more</>
          )}
        </button>
      )}
    </div>
  );
}
