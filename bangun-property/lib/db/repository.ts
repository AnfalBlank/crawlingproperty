import { getDb } from "./client";
import { ensureSchema } from "./schema";
import {
  AreaAnalysis, Listing, CrawlJob, ScanHistory, ExchangeRate,
  AdminStats, Currency, CrawlStatus, PriceSummary,
} from "@/types";
import { slugify } from "@/lib/utils";

// ─── Areas ────────────────────────────────────────────────────────────────────

export async function upsertArea(name: string): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const existing = await db.execute({
    sql: "SELECT id FROM areas WHERE slug = ?",
    args: [slug],
  });
  if (existing.rows.length > 0) {
    return Number(existing.rows[0].id);
  }

  const result = await db.execute({
    sql: "INSERT INTO areas (name, slug) VALUES (?, ?)",
    args: [name, slug],
  });
  return Number(result.lastInsertRowid);
}

export async function getAreaCount(): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute("SELECT COUNT(*) as c FROM areas");
  return Number(r.rows[0]?.c ?? 0);
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export async function replaceListings(areaId: number, area: string, listings: Listing[]): Promise<void> {
  await ensureSchema();
  const db = getDb();

  // Delete old listings for this area
  await db.execute({ sql: "DELETE FROM listings WHERE area_id = ?", args: [areaId] });

  if (listings.length === 0) return;

  // Batch insert
  const batch = listings.map((l) => ({
    sql: `INSERT OR REPLACE INTO listings
      (id, area_id, area, title, property_name, bedrooms, bathrooms,
       monthly_rent, yearly_rent, daily_rent, sqft, price_per_sqft,
       furnishing, url, scraped_at,
       description, images, latitude, longitude, address, carpark, facilities, furnishes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      l.id, areaId, area, l.title, l.propertyName,
      String(l.bedrooms), l.bathrooms,
      l.monthlyRent, l.yearlyRent, l.dailyRent,
      l.sqft, l.pricePerSqft, l.furnishing, l.url, l.scrapedAt,
      l.description ?? null,
      l.images ? JSON.stringify(l.images) : null,
      l.latitude ?? null,
      l.longitude ?? null,
      l.address ?? null,
      l.carpark ?? null,
      l.facilities ? JSON.stringify(l.facilities) : null,
      l.furnishes ? JSON.stringify(l.furnishes) : null,
    ] as (string | number | null)[],
  }));

  await db.batch(batch, "write");
}

export async function getListingsByArea(areaId: number): Promise<Listing[]> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: "SELECT * FROM listings WHERE area_id = ? ORDER BY monthly_rent ASC",
    args: [areaId],
  });
  return r.rows.map(rowToListing);
}

export async function getTotalListings(): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute("SELECT COUNT(*) as c FROM listings");
  return Number(r.rows[0]?.c ?? 0);
}

function rowToListing(row: Record<string, unknown>): Listing {
  const beds = String(row.bedrooms);
  const safeJsonArray = (v: unknown): string[] | undefined => {
    if (typeof v !== "string" || !v) return undefined;
    try { const a = JSON.parse(v); return Array.isArray(a) ? a : undefined; } catch { return undefined; }
  };
  return {
    id: String(row.id),
    title: String(row.title),
    propertyName: String(row.property_name ?? ""),
    area: String(row.area),
    bedrooms: beds === "Studio" ? "Studio" : Number(beds),
    bathrooms: Number(row.bathrooms ?? 0),
    monthlyRent: row.monthly_rent != null ? Number(row.monthly_rent) : null,
    yearlyRent: row.yearly_rent != null ? Number(row.yearly_rent) : null,
    dailyRent: row.daily_rent != null ? Number(row.daily_rent) : null,
    sqft: Number(row.sqft ?? 0),
    pricePerSqft: Number(row.price_per_sqft ?? 0),
    furnishing: String(row.furnishing) as Listing["furnishing"],
    url: String(row.url ?? ""),
    scrapedAt: String(row.scraped_at),
    description: row.description ? String(row.description) : undefined,
    images: safeJsonArray(row.images),
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    address: row.address ? String(row.address) : undefined,
    carpark: row.carpark != null ? Number(row.carpark) : undefined,
    facilities: safeJsonArray(row.facilities),
    furnishes: safeJsonArray(row.furnishes),
  };
}

// ─── Price Summaries ──────────────────────────────────────────────────────────

export async function savePriceSummary(areaId: number, s: PriceSummary): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM price_summaries WHERE area_id = ?", args: [areaId] });
  await db.execute({
    sql: `INSERT INTO price_summaries
      (area_id, area_name, avg_price, median_price, mode_price, fair_price,
       avg_sqft, avg_price_per_sqft, total_listings, dominant_unit_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      areaId, s.areaName, s.avgPrice, s.medianPrice, s.modePrice, s.fairPrice,
      s.avgSqft, s.avgPricePerSqft, s.totalListings, s.dominantUnitType,
    ],
  });
}

// ─── Analysis Cache (24h TTL — PRD §31) ──────────────────────────────────────

export async function getCachedAnalysis(slug: string): Promise<{ analysis: AreaAnalysis; cached: true } | null> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: "SELECT payload, expires_at FROM analysis_cache WHERE slug = ?",
    args: [slug],
  });
  if (r.rows.length === 0) return null;

  const expiresAt = new Date(String(r.rows[0].expires_at)).getTime();
  if (Date.now() > expiresAt) {
    // Expired — delete and return null
    await db.execute({ sql: "DELETE FROM analysis_cache WHERE slug = ?", args: [slug] });
    return null;
  }

  try {
    const analysis = JSON.parse(String(r.rows[0].payload)) as AreaAnalysis;
    return { analysis, cached: true };
  } catch {
    return null;
  }
}

export async function saveCachedAnalysis(slug: string, analysis: AreaAnalysis): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await db.execute({
    sql: `INSERT OR REPLACE INTO analysis_cache
      (slug, area_name, payload, listing_count, created_at, expires_at)
      VALUES (?, ?, ?, ?, datetime('now'), ?)`,
    args: [slug, analysis.area, JSON.stringify(analysis), analysis.summary.totalListings, expiresAt],
  });
}

export async function clearCache(): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute("DELETE FROM analysis_cache");
}

export async function getCacheStats(): Promise<{ cachedAreas: number; sizeKb: number }> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute("SELECT COUNT(*) as c, SUM(LENGTH(payload)) as sz FROM analysis_cache");
  return {
    cachedAreas: Number(r.rows[0]?.c ?? 0),
    sizeKb: Math.round(Number(r.rows[0]?.sz ?? 0) / 1024),
  };
}

// ─── Crawl Jobs ───────────────────────────────────────────────────────────────

export async function createCrawlJob(areaId: number | null, areaName: string): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: "INSERT INTO crawl_jobs (area_id, area_name, status) VALUES (?, ?, 'queued')",
    args: [areaId, areaName],
  });
  return Number(r.lastInsertRowid);
}

export async function updateCrawlJob(
  id: number,
  fields: Partial<{ status: CrawlStatus; startedAt: string; completedAt: string; listingCount: number; duration: number; error: string }>
): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const sets: string[] = [];
  const args: (string | number | null)[] = [];

  if (fields.status !== undefined) { sets.push("status = ?"); args.push(fields.status); }
  if (fields.startedAt !== undefined) { sets.push("started_at = ?"); args.push(fields.startedAt); }
  if (fields.completedAt !== undefined) { sets.push("completed_at = ?"); args.push(fields.completedAt); }
  if (fields.listingCount !== undefined) { sets.push("listing_count = ?"); args.push(fields.listingCount); }
  if (fields.duration !== undefined) { sets.push("duration = ?"); args.push(fields.duration); }
  if (fields.error !== undefined) { sets.push("error = ?"); args.push(fields.error); }

  if (sets.length === 0) return;
  args.push(id);
  await db.execute({ sql: `UPDATE crawl_jobs SET ${sets.join(", ")} WHERE id = ?`, args });
}

export async function getCrawlJobs(limit = 20): Promise<CrawlJob[]> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: "SELECT * FROM crawl_jobs ORDER BY created_at DESC LIMIT ?",
    args: [limit],
  });
  return r.rows.map((row) => ({
    id: String(row.id),
    areaId: String(row.area_id ?? ""),
    areaName: String(row.area_name),
    status: String(row.status) as CrawlStatus,
    startedAt: row.started_at ? String(row.started_at) : null,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    listingCount: row.listing_count != null ? Number(row.listing_count) : undefined,
    duration: row.duration != null ? Number(row.duration) : undefined,
    error: row.error ? String(row.error) : undefined,
  }));
}

export async function getTotalCrawls(): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute("SELECT COUNT(*) as c FROM crawl_jobs");
  return Number(r.rows[0]?.c ?? 0);
}

// ─── Scan History ─────────────────────────────────────────────────────────────

export async function addScanHistory(h: Omit<ScanHistory, "id">): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO scan_history (area_name, listing_count, duration, status, created_at)
          VALUES (?, ?, ?, ?, ?)`,
    args: [h.areaName, h.listingCount, h.duration, h.status, h.createdAt],
  });
}

export async function getScanHistory(limit = 50): Promise<ScanHistory[]> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: "SELECT * FROM scan_history ORDER BY created_at DESC LIMIT ?",
    args: [limit],
  });
  return r.rows.map((row) => ({
    id: String(row.id),
    areaName: String(row.area_name),
    listingCount: Number(row.listing_count),
    duration: Number(row.duration),
    status: String(row.status) as CrawlStatus,
    createdAt: String(row.created_at),
  }));
}

export async function deleteScanHistory(id: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM scan_history WHERE id = ?", args: [id] });
}

// ─── Exchange Rates ───────────────────────────────────────────────────────────

export async function saveExchangeRates(rates: ExchangeRate[]): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const batch = rates.map((r) => ({
    sql: "INSERT OR REPLACE INTO exchange_rates (currency, rate, updated_at) VALUES (?, ?, ?)",
    args: [r.currency, r.rate, r.updatedAt] as (string | number)[],
  }));
  await db.batch(batch, "write");
}

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute("SELECT * FROM exchange_rates");
  return r.rows.map((row) => ({
    currency: String(row.currency) as Currency,
    rate: Number(row.rate),
    updatedAt: String(row.updated_at),
  }));
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  await ensureSchema();
  const db = getDb();

  const [areas, listings, crawls, running] = await Promise.all([
    db.execute("SELECT COUNT(*) as c FROM areas"),
    db.execute("SELECT COUNT(*) as c FROM listings"),
    db.execute("SELECT COUNT(*) as c FROM crawl_jobs"),
    db.execute("SELECT COUNT(*) as c FROM crawl_jobs WHERE status IN ('running','queued')"),
  ]);

  // Cache hit ratio — completed crawls vs cached requests (approximation)
  const cacheRows = await db.execute("SELECT COUNT(*) as c FROM analysis_cache");
  const totalCrawls = Number(crawls.rows[0]?.c ?? 0);
  const cachedAreas = Number(cacheRows.rows[0]?.c ?? 0);
  const cacheHitRatio = totalCrawls > 0
    ? Math.min(99, Math.round((cachedAreas / Math.max(totalCrawls, 1)) * 100))
    : 0;

  return {
    totalAreas: Number(areas.rows[0]?.c ?? 0),
    totalListings: Number(listings.rows[0]?.c ?? 0),
    totalCrawls,
    cacheHitRatio,
    activeCrawls: Number(running.rows[0]?.c ?? 0),
  };
}


// ─── Price History (PRD §40 historical tracking) ─────────────────────────────

export interface PriceHistoryPoint {
  snapshotAt: string;
  avgPrice: number;
  medianPrice: number;
  fairPrice: number;
  avgPricePerSqft: number;
  totalListings: number;
}

export async function recordPriceHistory(areaId: number, areaName: string, s: PriceSummary): Promise<void> {
  await ensureSchema();
  const db = getDb();
  // De-dupe per (area, date) — at most one snapshot per day per area.
  // Multiple force-refreshes on the same day update the existing row instead of stacking.
  await db.execute({
    sql: `DELETE FROM price_history
          WHERE area_id = ? AND date(snapshot_at) = date('now')`,
    args: [areaId],
  });
  await db.execute({
    sql: `INSERT INTO price_history
      (area_id, area_name, avg_price, median_price, fair_price, avg_price_per_sqft, total_listings)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [areaId, areaName, s.avgPrice, s.medianPrice, s.fairPrice, s.avgPricePerSqft, s.totalListings],
  });
}

export async function getPriceHistory(areaName: string, days = 60): Promise<PriceHistoryPoint[]> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: `SELECT snapshot_at, avg_price, median_price, fair_price, avg_price_per_sqft, total_listings
          FROM price_history
          WHERE area_name = ? AND snapshot_at >= datetime('now', ?)
          ORDER BY snapshot_at ASC`,
    args: [areaName, `-${days} days`],
  });
  return r.rows.map((row) => ({
    snapshotAt: String(row.snapshot_at),
    avgPrice: Number(row.avg_price ?? 0),
    medianPrice: Number(row.median_price ?? 0),
    fairPrice: Number(row.fair_price ?? 0),
    avgPricePerSqft: Number(row.avg_price_per_sqft ?? 0),
    totalListings: Number(row.total_listings ?? 0),
  }));
}

// ─── Saved Searches / Alerts ─────────────────────────────────────────────────

export interface SavedSearch {
  id: number;
  email: string | null;
  areaName: string;
  maxPrice: number | null;
  minBedrooms: number | null;
  createdAt: string;
}

export async function createSavedSearch(input: {
  email?: string; areaName: string; maxPrice?: number; minBedrooms?: number;
}): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: `INSERT INTO saved_searches (email, area_name, max_price, min_bedrooms) VALUES (?, ?, ?, ?)`,
    args: [input.email ?? null, input.areaName, input.maxPrice ?? null, input.minBedrooms ?? null],
  });
  return Number(r.lastInsertRowid);
}

export async function listSavedSearches(): Promise<SavedSearch[]> {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute("SELECT * FROM saved_searches ORDER BY created_at DESC LIMIT 100");
  return r.rows.map((row) => ({
    id: Number(row.id),
    email: row.email ? String(row.email) : null,
    areaName: String(row.area_name),
    maxPrice: row.max_price != null ? Number(row.max_price) : null,
    minBedrooms: row.min_bedrooms != null ? Number(row.min_bedrooms) : null,
    createdAt: String(row.created_at),
  }));
}

export async function deleteSavedSearch(id: number): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM saved_searches WHERE id = ?", args: [id] });
}
