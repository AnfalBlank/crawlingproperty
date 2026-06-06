"use client";

import { useRouter } from "next/navigation";
import { Clock, X, ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";

export function RecentSearches() {
  const router = useRouter();
  const { recentSearches, clearRecentSearches, setCurrentArea } = useAppStore();

  if (!recentSearches.length) return null;

  return (
    <section className="py-6 md:py-8 border-b border-hairline bg-canvas dark:bg-canvas">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted" />
            <h2 className="text-[14px] font-semibold text-ink">Recent Searches</h2>
          </div>
          <button
            onClick={clearRecentSearches}
            className="text-[12px] text-muted hover:text-ink transition-colors font-medium"
          >
            Clear all
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {recentSearches.map((search) => (
            <button
              key={search.area}
              onClick={() => {
                setCurrentArea(search.area);
                router.push(`/analysis?area=${encodeURIComponent(search.area)}`);
              }}
              className="group flex items-center gap-2 border border-hairline rounded-full pl-4 pr-3 py-2 bg-canvas hover:shadow-card hover:border-border-strong transition-all"
            >
              <span className="text-[13px] font-medium text-ink">{search.area}</span>
              <span className="text-[11px] text-muted">{search.listings} listings</span>
              <span className="text-muted text-[10px]">·</span>
              <span className="text-[11px] text-muted">{formatDate(search.timestamp)}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
