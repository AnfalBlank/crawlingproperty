import { ExchangeRate } from "@/types";

// ─── Fallback exchange rates ──────────────────────────────────────────────────
// Used only as the initial client-side value before /api/currency loads the
// live rates from the backend (Frankfurter API → Turso). Real data always
// comes from the DB; these are just sane defaults to avoid a flash of "0".

export const MOCK_EXCHANGE_RATES: ExchangeRate[] = [
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
