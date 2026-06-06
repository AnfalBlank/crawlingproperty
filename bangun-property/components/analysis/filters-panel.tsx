"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Furnishing } from "@/types";
import { useAppStore } from "@/store/app-store";

const BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4+"];
const BATHROOM_OPTIONS = ["1", "2", "3+"];
const FURNISHING_OPTIONS: Furnishing[] = ["Fully Furnished", "Partially Furnished", "Unfurnished"];

// Shared input class — handles dark mode
const INPUT_CLS =
  "w-full h-10 px-3 bg-canvas dark:bg-canvas border border-hairline rounded-lg text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-border-strong dark:focus:border-border-strong transition-colors";

interface FiltersPanelProps {
  onClose?: () => void;
}

export function FiltersPanel({ onClose }: FiltersPanelProps) {
  const { filters, setFilters, resetFilters } = useAppStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActive =
    filters.bedrooms.length > 0 ||
    filters.bathrooms.length > 0 ||
    filters.furnishing.length > 0 ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.sqftMin !== null ||
    filters.sqftMax !== null ||
    filters.pricePerSqftMin !== null ||
    filters.pricePerSqftMax !== null ||
    filters.search !== "";

  const toggleBedroom = (val: string) => {
    const curr = filters.bedrooms;
    setFilters({ bedrooms: curr.includes(val) ? curr.filter((b) => b !== val) : [...curr, val] });
  };

  const toggleBathroom = (val: string) => {
    const curr = filters.bathrooms;
    setFilters({ bathrooms: curr.includes(val) ? curr.filter((b) => b !== val) : [...curr, val] });
  };

  const toggleFurnishing = (val: Furnishing) => {
    const curr = filters.furnishing;
    setFilters({ furnishing: curr.includes(val) ? curr.filter((f) => f !== val) : [...curr, val] });
  };

  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-4 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted" />
          <span className="text-[14px] font-semibold text-ink">Filters</span>
          {hasActive && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-label="Active filters" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button onClick={resetFilters} className="text-xs font-semibold text-primary hover:underline">
              Reset all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-soft dark:hover:bg-surface-strong transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Property name, area..."
          className={INPUT_CLS}
        />
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">
          Bedrooms
        </label>
        <div className="flex flex-wrap gap-1.5">
          {BEDROOM_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleBedroom(opt)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all",
                filters.bedrooms.includes(opt)
                  ? "bg-ink text-white border-ink"
                  : "bg-canvas dark:bg-surface-soft text-ink border-hairline hover:border-border-strong"
              )}
            >
              {opt === "Studio" ? "Studio" : `${opt}BR`}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">
          Bathrooms
        </label>
        <div className="flex flex-wrap gap-1.5">
          {BATHROOM_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleBathroom(opt)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all",
                filters.bathrooms.includes(opt)
                  ? "bg-ink text-white border-ink"
                  : "bg-canvas dark:bg-surface-soft text-ink border-hairline hover:border-border-strong"
              )}
            >
              {opt === "3+" ? "3+ Bath" : `${opt} Bath`}
            </button>
          ))}
        </div>
      </div>

      {/* Furnishing */}
      <div>
        <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">
          Furnishing
        </label>
        <div className="space-y-2">
          {FURNISHING_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.furnishing.includes(opt)}
                onChange={() => toggleFurnishing(opt)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <span className="text-[13px] text-ink group-hover:text-primary transition-colors">
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Advanced filters
      </button>

      {/* Advanced fields */}
      {showAdvanced && (
        <div className="space-y-4 animate-slide-up pt-1">
          {/* Monthly rent */}
          <div>
            <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">
              Monthly Rent (RM)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.priceMin ?? ""}
                onChange={(e) => setFilters({ priceMin: e.target.value ? Number(e.target.value) : null })}
                placeholder="Min"
                className={INPUT_CLS}
              />
              <input
                type="number"
                value={filters.priceMax ?? ""}
                onChange={(e) => setFilters({ priceMax: e.target.value ? Number(e.target.value) : null })}
                placeholder="Max"
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Sqft */}
          <div>
            <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">
              Sqft Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.sqftMin ?? ""}
                onChange={(e) => setFilters({ sqftMin: e.target.value ? Number(e.target.value) : null })}
                placeholder="Min"
                className={INPUT_CLS}
              />
              <input
                type="number"
                value={filters.sqftMax ?? ""}
                onChange={(e) => setFilters({ sqftMax: e.target.value ? Number(e.target.value) : null })}
                placeholder="Max"
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Price per sqft */}
          <div>
            <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">
              Price / Sqft (RM)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.pricePerSqftMin ?? ""}
                onChange={(e) => setFilters({ pricePerSqftMin: e.target.value ? Number(e.target.value) : null })}
                placeholder="Min"
                className={INPUT_CLS}
              />
              <input
                type="number"
                value={filters.pricePerSqftMax ?? ""}
                onChange={(e) => setFilters({ pricePerSqftMax: e.target.value ? Number(e.target.value) : null })}
                placeholder="Max"
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
