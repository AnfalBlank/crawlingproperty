// ─── Listing & Property Types ─────────────────────────────────────────────────

export type Furnishing = "Fully Furnished" | "Partially Furnished" | "Unfurnished";
export type RentalType = "Monthly" | "Yearly" | "Daily";
export type FairPriceStatus = "Under Market" | "Fair" | "Overpriced";

export interface Listing {
  id: string;
  title: string;
  propertyName: string;
  area: string;
  bedrooms: number | "Studio";
  bathrooms: number;
  monthlyRent: number | null;
  yearlyRent: number | null;
  dailyRent: number | null;
  sqft: number;
  pricePerSqft: number;
  furnishing: Furnishing;
  url: string;
  scrapedAt: string;
  fairPriceStatus?: FairPriceStatus;
  // Optional rich fields (PRD §11) used by the listing detail modal
  description?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
  carpark?: number;
  facilities?: string[];
  furnishes?: string[];
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface PriceSummary {
  areaId: string;
  areaName: string;
  avgPrice: number;
  medianPrice: number;
  modePrice: number;
  fairPrice: number;
  avgSqft: number;
  avgPricePerSqft: number;
  totalListings: number;
  dominantUnitType: string;
}

export interface AreaAnalysis {
  area: string;
  summary: PriceSummary;
  listings: Listing[];
  priceDistribution: PriceBucket[];
  bedroomDistribution: BedroomBucket[];
  furnishingDistribution: FurnishingBucket[];
  insights: string[];
  lastUpdated: string;
  crawlDuration: number;
}

export interface PriceBucket {
  label: string;
  min: number;
  max: number | null;
  count: number;
  percentage: number;
}

export interface BedroomBucket {
  label: string;
  count: number;
  percentage: number;
}

export interface FurnishingBucket {
  label: Furnishing;
  count: number;
  percentage: number;
}

// ─── Comparison Types ─────────────────────────────────────────────────────────

export interface AreaComparison {
  areas: AreaComparisonItem[];
  recommendation: string;
  savedAt?: string;
  name?: string;
}

export interface AreaComparisonItem {
  areaName: string;
  listings: number;
  avgRent: number;
  medianRent: number;
  fairPrice: number;
  avgSqft: number;
  pricePerSqft: number;
}

// ─── Currency Types ───────────────────────────────────────────────────────────

export type Currency = "MYR" | "IDR" | "USD" | "SGD" | "EUR" | "GBP" | "AUD" | "JPY" | "THB";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MYR: "RM",
  IDR: "Rp",
  USD: "$",
  SGD: "S$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  JPY: "¥",
  THB: "฿",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  MYR: "Malaysian Ringgit",
  IDR: "Indonesian Rupiah",
  USD: "US Dollar",
  SGD: "Singapore Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  THB: "Thai Baht",
};

export interface ExchangeRate {
  currency: Currency;
  rate: number;
  updatedAt: string;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface Filters {
  bedrooms: string[];
  bathrooms: string[];
  priceMin: number | null;
  priceMax: number | null;
  sqftMin: number | null;
  sqftMax: number | null;
  pricePerSqftMin: number | null;
  pricePerSqftMax: number | null;
  furnishing: Furnishing[];
  search: string;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export type CrawlStatus = "running" | "queued" | "completed" | "failed";

export interface CrawlJob {
  id: string;
  areaId: string;
  areaName: string;
  status: CrawlStatus;
  startedAt: string | null;
  completedAt: string | null;
  listingCount?: number;
  duration?: number;
  error?: string;
}

export interface ScanHistory {
  id: string;
  areaName: string;
  listingCount: number;
  duration: number;
  status: CrawlStatus;
  createdAt: string;
}

export interface AdminStats {
  totalAreas: number;
  totalListings: number;
  totalCrawls: number;
  cacheHitRatio: number;
  activeCrawls: number;
}

// ─── Search Types ─────────────────────────────────────────────────────────────

export interface SearchSuggestion {
  type: "area" | "property" | "url";
  label: string;
  value: string;
  subtitle?: string;
}

export interface RecentSearch {
  area: string;
  listings: number;
  timestamp: string;
}
