import { getDb } from "./client";

// ─── Schema DDL (matches PRD §38) ─────────────────────────────────────────────

const SCHEMA_STATEMENTS = [
  // areas
  `CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // crawl_jobs
  `CREATE TABLE IF NOT EXISTS crawl_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER REFERENCES areas(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    started_at TEXT,
    completed_at TEXT,
    listing_count INTEGER,
    duration INTEGER,
    error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // listings
  `CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    area_id INTEGER REFERENCES areas(id) ON DELETE CASCADE,
    area TEXT NOT NULL,
    title TEXT NOT NULL,
    property_name TEXT,
    bedrooms TEXT,
    bathrooms INTEGER,
    monthly_rent REAL,
    yearly_rent REAL,
    daily_rent REAL,
    sqft INTEGER,
    price_per_sqft REAL,
    furnishing TEXT,
    url TEXT,
    scraped_at TEXT NOT NULL DEFAULT (datetime('now')),
    description TEXT,
    images TEXT,
    latitude REAL,
    longitude REAL,
    address TEXT,
    carpark INTEGER,
    facilities TEXT,
    furnishes TEXT
  )`,

  // price_history (PRD §40 — phase 2: historical tracking)
  `CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER NOT NULL,
    area_name TEXT NOT NULL,
    avg_price REAL,
    median_price REAL,
    fair_price REAL,
    avg_price_per_sqft REAL,
    total_listings INTEGER,
    snapshot_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // saved_searches (alerts)
  `CREATE TABLE IF NOT EXISTS saved_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    area_name TEXT NOT NULL,
    max_price REAL,
    min_bedrooms INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_notified_at TEXT
  )`,

  // price_summaries
  `CREATE TABLE IF NOT EXISTS price_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER REFERENCES areas(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    avg_price REAL,
    median_price REAL,
    mode_price REAL,
    fair_price REAL,
    avg_sqft REAL,
    avg_price_per_sqft REAL,
    total_listings INTEGER,
    dominant_unit_type TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // exchange_rates
  `CREATE TABLE IF NOT EXISTS exchange_rates (
    currency TEXT PRIMARY KEY,
    rate REAL NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // scan_history
  `CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER,
    area_name TEXT NOT NULL,
    listing_count INTEGER NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // analysis_cache — stores full computed AreaAnalysis JSON with 24h TTL
  `CREATE TABLE IF NOT EXISTS analysis_cache (
    slug TEXT PRIMARY KEY,
    area_name TEXT NOT NULL,
    payload TEXT NOT NULL,
    listing_count INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  )`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_listings_area ON listings(area_id)`,
  `CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status)`,
  `CREATE INDEX IF NOT EXISTS idx_scan_history_created ON scan_history(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_price_history_area ON price_history(area_id, snapshot_at)`,
  `CREATE INDEX IF NOT EXISTS idx_saved_searches_area ON saved_searches(area_name)`,
];

let _initialized = false;

/**
 * Initialise the schema. Safe to call multiple times — guards against re-running.
 */
export async function initSchema(force = false): Promise<void> {
  if (_initialized && !force) return;
  const db = getDb();
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.execute(stmt);
  }

  // Idempotent column additions for already-existing tables (no-op if column exists)
  const newColumns: { table: string; column: string; type: string }[] = [
    { table: "listings", column: "description", type: "TEXT" },
    { table: "listings", column: "images", type: "TEXT" },
    { table: "listings", column: "latitude", type: "REAL" },
    { table: "listings", column: "longitude", type: "REAL" },
    { table: "listings", column: "address", type: "TEXT" },
    { table: "listings", column: "carpark", type: "INTEGER" },
    { table: "listings", column: "facilities", type: "TEXT" },
    { table: "listings", column: "furnishes", type: "TEXT" },
  ];
  for (const c of newColumns) {
    try {
      await db.execute(`ALTER TABLE ${c.table} ADD COLUMN ${c.column} ${c.type}`);
    } catch {
      /* column already exists — ignore */
    }
  }

  _initialized = true;
}

/**
 * Ensures schema is ready before any DB operation.
 */
export async function ensureSchema(): Promise<void> {
  if (!_initialized) await initSchema();
}
