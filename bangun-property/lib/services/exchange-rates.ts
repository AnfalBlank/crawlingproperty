import { ExchangeRate, Currency } from "@/types";
import { getExchangeRates, saveExchangeRates } from "@/lib/db/repository";

// PRD §21 — supported currencies
const TARGET_CURRENCIES: Currency[] = ["IDR", "USD", "SGD", "EUR", "GBP", "AUD", "JPY", "THB"];

// Frankfurter doesn't support MYR as a base in all cases — we fetch with base=MYR.
const FRANKFURTER_URL = "https://api.frankfurter.app/latest?base=MYR";

// Fallback static rates (used if API fails AND no DB rates exist) — PRD §23 fallback
const FALLBACK_RATES: ExchangeRate[] = [
  { currency: "MYR", rate: 1, updatedAt: new Date().toISOString() },
  { currency: "IDR", rate: 3480, updatedAt: new Date().toISOString() },
  { currency: "USD", rate: 0.22, updatedAt: new Date().toISOString() },
  { currency: "SGD", rate: 0.30, updatedAt: new Date().toISOString() },
  { currency: "EUR", rate: 0.20, updatedAt: new Date().toISOString() },
  { currency: "GBP", rate: 0.17, updatedAt: new Date().toISOString() },
  { currency: "AUD", rate: 0.34, updatedAt: new Date().toISOString() },
  { currency: "JPY", rate: 33.5, updatedAt: new Date().toISOString() },
  { currency: "THB", rate: 7.8, updatedAt: new Date().toISOString() },
];

/**
 * Fetch latest rates from Frankfurter, persist to DB.
 * Falls back to previous DB rates, then to static defaults.
 */
export async function refreshExchangeRates(): Promise<ExchangeRate[]> {
  try {
    const res = await fetch(FRANKFURTER_URL, {
      headers: { Accept: "application/json" },
      // 10s timeout via AbortController
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);

    const data = (await res.json()) as { base: string; rates: Record<string, number> };
    const now = new Date().toISOString();

    const rates: ExchangeRate[] = [{ currency: "MYR", rate: 1, updatedAt: now }];
    for (const cur of TARGET_CURRENCIES) {
      const rate = data.rates[cur];
      if (typeof rate === "number") {
        rates.push({ currency: cur, rate, updatedAt: now });
      }
    }

    // Persist (PRD §23 — cache in database)
    await saveExchangeRates(rates);
    return rates;
  } catch (err) {
    // Fallback to previous valid DB rates (PRD §23)
    const cached = await getExchangeRates();
    if (cached.length > 0) return cached;
    // Last resort: static fallback
    await saveExchangeRates(FALLBACK_RATES);
    return FALLBACK_RATES;
  }
}

/**
 * Get rates — from DB if fresh (< 24h), else refresh (PRD §23 — 24h update).
 */
export async function getRates(): Promise<ExchangeRate[]> {
  const cached = await getExchangeRates();

  if (cached.length > 0) {
    const myr = cached.find((r) => r.currency === "MYR") ?? cached[0];
    const age = Date.now() - new Date(myr.updatedAt).getTime();
    const TWENTY_FOUR_H = 24 * 60 * 60 * 1000;
    if (age < TWENTY_FOUR_H) return cached;
  }

  return refreshExchangeRates();
}
