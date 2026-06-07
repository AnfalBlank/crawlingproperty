"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, MapPin, Link2, X, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { SearchSuggestion } from "@/types";

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  size?: "lg" | "md";
}

export function SearchBar({ className, autoFocus = false, size = "lg" }: SearchBarProps) {
  const router = useRouter();
  const { recentSearches, setCurrentArea } = useAppStore();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"area" | "url">("area");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [mounted, setMounted] = useState(false);

  // Portal target only available client-side
  useEffect(() => { setMounted(true); }, []);

  // Position of the dropdown — tracks the pill input so the portal renders in place
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);

  const updatePos = useCallback(() => {
    if (!pillRef.current) return;
    const r = pillRef.current.getBoundingClientRect();
    setPos({ left: r.left, top: r.bottom + 8, width: r.width });
  }, []);

  // Real autocomplete via /api/search — 250ms debounce (PRD §9)
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions ?? []);
        }
      } catch {
        /* aborted or failed — ignore */
      }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Keep open if click is inside the input container OR the portal dropdown
      if (containerRef.current?.contains(target)) return;
      const dd = document.getElementById("searchbar-dropdown");
      if (dd?.contains(target)) return;
      setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAnalyze = useCallback((value: string) => {
    if (!value.trim()) return;
    setCurrentArea(value);
    router.push(`/analysis?area=${encodeURIComponent(value)}`);
    setFocused(false);
    setQuery("");
  }, [router, setCurrentArea]);

  const showDropdown = focused && (query.length > 0 || recentSearches.length > 0);
  const isLg = size === "lg";

  // Recompute position whenever the dropdown opens, and on scroll/resize
  useEffect(() => {
    if (!showDropdown) return;
    updatePos();
    const onScroll = () => updatePos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [showDropdown, updatePos]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>

      {/* Tabs (lg only) */}
      {isLg && (
        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => setActiveTab("area")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-full transition-all",
              activeTab === "area"
                ? "bg-white text-ink shadow-sm"
                : "bg-white/10 text-white/80 hover:text-white hover:bg-white/15 backdrop-blur-md"
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            Area / Property
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-full transition-all",
              activeTab === "url"
                ? "bg-white text-ink shadow-sm"
                : "bg-white/10 text-white/80 hover:text-white hover:bg-white/15 backdrop-blur-md"
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
            SPEEDHOME URL
          </button>
        </div>
      )}

      {/* Pill input */}
      <div
        ref={pillRef}
        className={cn(
          "flex items-center bg-canvas dark:bg-canvas rounded-full border-2 transition-all duration-200",
          focused
            ? "border-primary shadow-lifted"
            : "border-transparent shadow-card hover:shadow-lifted",
          isLg ? "h-[58px] md:h-[64px] pl-5 md:pl-6 pr-2" : "h-12 pl-4 pr-1.5"
        )}
      >
        <Search className={cn("text-muted shrink-0", isLg ? "w-5 h-5 mr-3" : "w-4 h-4 mr-2")} />
        <input
          ref={inputRef}
          type={activeTab === "url" ? "url" : "text"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) handleAnalyze(query.trim());
            if (e.key === "Escape") setFocused(false);
          }}
          placeholder={
            activeTab === "url"
              ? "https://speedhome.com/rent/mont-kiara"
              : "Search area, apartment name..."
          }
          autoFocus={autoFocus}
          className={cn(
            "flex-1 min-w-0 bg-transparent outline-none text-ink placeholder:text-muted-soft font-medium",
            isLg ? "text-[15px] md:text-base" : "text-sm"
          )}
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />

        {/* Clear */}
        {query && (
          <button
            onClick={() => setQuery("")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-strong transition-colors mr-1 shrink-0"
            aria-label="Clear"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        )}

        {/* CTA orb */}
        <button
          onClick={() => query.trim() ? handleAnalyze(query.trim()) : inputRef.current?.focus()}
          className={cn(
            "shrink-0 bg-primary hover:bg-primary-active active:scale-95 text-white rounded-full flex items-center justify-center font-bold transition-all shadow-md shadow-primary/30",
            isLg ? "h-[44px] md:h-[48px] px-4 md:px-5 gap-2 text-sm" : "h-9 w-9"
          )}
          aria-label="Analyze"
        >
          <Search className="w-4 h-4" />
          {isLg && <span className="hidden xs:inline">Analyze</span>}
        </button>
      </div>

      {/* Dropdown — rendered via portal to <body> so it escapes the hero's
          overflow-hidden clipping and floats above all hero layers. */}
      {mounted && showDropdown && pos && createPortal(
        <div
          id="searchbar-dropdown"
          className="fixed bg-canvas dark:bg-canvas border border-hairline rounded-2xl shadow-lifted overflow-hidden max-h-[55vh] overflow-y-auto origin-top"
          style={{
            left: pos.left,
            top: pos.top,
            width: pos.width,
            zIndex: 2147483600,
            animation: "dropdown-in 0.28s cubic-bezier(0.16,1,0.3,1)",
          }}
          role="listbox"
        >
          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted">
                Recent searches
              </p>
              {recentSearches.map((r, i) => (
                <button
                  key={r.area}
                  onClick={() => handleAnalyze(r.area)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-soft dark:hover:bg-surface-strong active:scale-[0.98] text-left transition-all group"
                  style={{ animation: `dropdown-item 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 45}ms both` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-strong dark:bg-surface-strong flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:scale-105 transition-all">
                    <Clock className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink truncate">{r.area}</p>
                    <p className="text-xs text-muted">{r.listings} listings tracked</p>
                  </div>
                  <span className="text-muted-soft group-hover:text-primary group-hover:translate-x-0.5 transition-all text-lg shrink-0">→</span>
                </button>
              ))}
            </div>
          )}

          {query && suggestions.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted">
                Suggestions
              </p>
              {suggestions.map((s, i) => (
                <button
                  key={s.value}
                  onClick={() => handleAnalyze(s.value)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-soft dark:hover:bg-surface-strong active:scale-[0.98] text-left transition-all group"
                  style={{ animation: `dropdown-item 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 45}ms both` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {s.type === "area"
                      ? <MapPin className="w-4 h-4 text-primary" />
                      : <TrendingUp className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink truncate">{s.label}</p>
                    {s.subtitle && <p className="text-xs text-muted truncate">{s.subtitle}</p>}
                  </div>
                  <span className="text-muted-soft group-hover:text-primary group-hover:translate-x-0.5 transition-all text-lg shrink-0">→</span>
                </button>
              ))}
            </div>
          )}

          {query && suggestions.length === 0 && (
            <div className="p-6 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-surface-soft dark:bg-surface-strong flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5 text-muted-soft" />
              </div>
              <p className="text-sm text-muted mb-3">No matches for &ldquo;{query}&rdquo;</p>
              <button
                onClick={() => handleAnalyze(query)}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all"
              >
                Analyze anyway <span>→</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
