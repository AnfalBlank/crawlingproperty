"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Lang } from "@/lib/i18n";
import {
  AreaAnalysis,
  AreaComparison,
  Currency,
  ExchangeRate,
  Filters,
  RecentSearch,
} from "@/types";
import { MOCK_EXCHANGE_RATES } from "@/lib/mock-data";

interface AppState {
  // ─── Analysis ───────────────────────────────────────────────────────────────
  currentArea: string;
  analysis: AreaAnalysis | null;
  isAnalyzing: boolean;
  analyzeProgress: number;
  analyzeStage: string;
  setCurrentArea: (area: string) => void;
  setAnalysis: (a: AreaAnalysis | null) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalyzeProgress: (p: number, stage?: string) => void;

  // ─── Currency ────────────────────────────────────────────────────────────────
  currency: Currency;
  exchangeRates: ExchangeRate[];
  setCurrency: (c: Currency) => void;
  setExchangeRates: (rates: ExchangeRate[]) => void;
  loadExchangeRates: () => Promise<void>;
  getRate: () => number;

  // ─── Filters ─────────────────────────────────────────────────────────────────
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  resetFilters: () => void;

  // ─── Comparison ──────────────────────────────────────────────────────────────
  comparison: AreaComparison | null;
  setComparison: (c: AreaComparison | null) => void;
  savedComparisons: AreaComparison[];
  saveComparison: (c: AreaComparison) => void;
  deleteSavedComparison: (name: string) => void;

  // ─── Recent Searches ─────────────────────────────────────────────────────────
  recentSearches: RecentSearch[];
  addRecentSearch: (s: RecentSearch) => void;
  clearRecentSearches: () => void;

  // ─── Active Price Bucket Filter ──────────────────────────────────────────────
  activePriceBucket: string | null;
  setActivePriceBucket: (bucket: string | null) => void;

  // ─── Rental period view (PRD §27) ────────────────────────────────────────────
  rentalPeriod: "monthly" | "yearly" | "daily";
  setRentalPeriod: (p: "monthly" | "yearly" | "daily") => void;

  // ─── Theme ───────────────────────────────────────────────────────────────────
  theme: "light" | "dark";
  toggleTheme: () => void;

  // ─── Language ────────────────────────────────────────────────────────────────
  lang: Lang;
  setLang: (l: Lang) => void;
}

const defaultFilters: Filters = {
  bedrooms: [],
  bathrooms: [],
  priceMin: null,
  priceMax: null,
  sqftMin: null,
  sqftMax: null,
  pricePerSqftMin: null,
  pricePerSqftMax: null,
  furnishing: [],
  search: "",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ─── Analysis ─────────────────────────────────────────────────────────────
      currentArea: "",
      analysis: null,
      isAnalyzing: false,
      analyzeProgress: 0,
      analyzeStage: "",
      setCurrentArea: (area) => set({ currentArea: area }),
      setAnalysis: (analysis) => set({ analysis }),
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),
      setAnalyzeProgress: (analyzeProgress, analyzeStage = "") =>
        set({ analyzeProgress, analyzeStage }),

      // ─── Currency ──────────────────────────────────────────────────────────────
      currency: "MYR",
      exchangeRates: MOCK_EXCHANGE_RATES,
      setCurrency: (currency) => set({ currency }),
      setExchangeRates: (exchangeRates) => set({ exchangeRates }),
      loadExchangeRates: async () => {
        try {
          const res = await fetch("/api/currency");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.rates) && data.rates.length > 0) {
              set({ exchangeRates: data.rates });
            }
          }
        } catch {
          /* keep fallback rates */
        }
      },
      getRate: () => {
        const { currency, exchangeRates } = get();
        return exchangeRates.find((r) => r.currency === currency)?.rate ?? 1;
      },

      // ─── Filters ───────────────────────────────────────────────────────────────
      filters: defaultFilters,
      setFilters: (f) =>
        set((state) => ({ filters: { ...state.filters, ...f } })),
      resetFilters: () => set({ filters: defaultFilters }),

      // ─── Comparison ────────────────────────────────────────────────────────────
      comparison: null,
      setComparison: (comparison) => set({ comparison }),
      savedComparisons: [],
      saveComparison: (c) =>
        set((state) => ({
          savedComparisons: [
            c,
            ...state.savedComparisons.filter((s) => s.name !== c.name),
          ].slice(0, 10),
        })),
      deleteSavedComparison: (name) =>
        set((state) => ({
          savedComparisons: state.savedComparisons.filter((s) => s.name !== name),
        })),

      // ─── Recent Searches ────────────────────────────────────────────────────────
      recentSearches: [],
      addRecentSearch: (s) =>
        set((state) => ({
          recentSearches: [
            s,
            ...state.recentSearches.filter((r) => r.area !== s.area),
          ].slice(0, 5),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),

      // ─── Active Price Bucket ────────────────────────────────────────────────────
      activePriceBucket: null,
      setActivePriceBucket: (bucket) => set({ activePriceBucket: bucket }),

      // ─── Rental period view ──────────────────────────────────────────────────────
      rentalPeriod: "monthly",
      setRentalPeriod: (rentalPeriod) => set({ rentalPeriod }),

      // ─── Theme ───────────────────────────────────────────────────────────────────
      theme: "light" as "light" | "dark",
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),

      // ─── Language ────────────────────────────────────────────────────────────────
      lang: "en" as Lang,
      setLang: (lang: Lang) => set({ lang }),
    }),
    {
      name: "bangun-property-store",
      skipHydration: true,
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        savedComparisons: state.savedComparisons,
        currency: state.currency,
        theme: state.theme,
        lang: state.lang,
      }),
    }
  )
);
