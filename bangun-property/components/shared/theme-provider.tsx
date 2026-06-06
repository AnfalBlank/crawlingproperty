"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const theme = useAppStore((s) => s.theme);
  const loadExchangeRates = useAppStore((s) => s.loadExchangeRates);

  // Manually rehydrate the persisted store on the client only,
  // so server-rendered markup uses default values (no mismatch).
  useEffect(() => {
    useAppStore.persist.rehydrate();
    setHydrated(true);
    // Load live exchange rates from the backend (PRD §22, §23)
    loadExchangeRates();
  }, [loadExchangeRates]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme, hydrated]);

  return <>{children}</>;
}
