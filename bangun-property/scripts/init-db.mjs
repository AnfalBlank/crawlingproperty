/**
 * One-shot DB bootstrap. Idempotent — safe to re-run.
 * Mirrors `lib/db/schema.ts` so a fresh DB is identical to a migrated one.
 *
 * Usage:  node scripts/init-db.mjs
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf-8");
const vars = {};
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2];
}

if (!vars.TURSO_DATABASE_URL || !vars.TURSO_AUTH_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
  process.exit(1);
}

const db = createClient({
  url: vars.TURSO_DATABASE_URL,
  authToken: vars.TURSO_AUTH_TOKEN,
});

const SCHEMA = [
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

  // listings — full schema including rich fields
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

  // price_history (PRD §40)
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

  // analysis_cache (24h TTL)
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

// Idempotent ALTER TABLE — for upgrading older databases that were created before
// the rich-fields migration. Failures are expected (column already exists).
const ALTERS = [
  ["listings", "description", "TEXT"],
  ["listings", "images",      "TEXT"],
  ["listings", "latitude",    "REAL"],
  ["listings", "longitude",   "REAL"],
  ["listings", "address",     "TEXT"],
  ["listings", "carpark",     "INTEGER"],
  ["listings", "facilities",  "TEXT"],
  ["listings", "furnishes",   "TEXT"],
];

console.log("→ Creating schema...");
for (const stmt of SCHEMA) {
  await db.execute(stmt);
  const m = stmt.match(/(CREATE TABLE IF NOT EXISTS|CREATE INDEX IF NOT EXISTS) (\w+)/);
  if (m) console.log(`  ✓ ${m[2]}`);
}

console.log("→ Applying rich-field migrations (idempotent)...");
let altered = 0;
for (const [t, c, type] of ALTERS) {
  try {
    await db.execute(`ALTER TABLE ${t} ADD COLUMN ${c} ${type}`);
    console.log(`  ✓ ${t}.${c}`);
    altered++;
  } catch {
    /* exists — ignore */
  }
}
if (altered === 0) console.log("  (already up-to-date)");

console.log("→ Seeding exchange rates from Frankfurter...");
try {
  const res = await fetch("https://api.frankfurter.app/latest?base=MYR");
  const data = await res.json();
  const now = new Date().toISOString();
  const targets = ["IDR", "USD", "SGD", "EUR", "GBP", "AUD", "JPY", "THB"];
  const rows = [["MYR", 1, now]];
  for (const c of targets) if (data.rates[c]) rows.push([c, data.rates[c], now]);
  for (const [cur, rate, ts] of rows) {
    await db.execute({
      sql: "INSERT OR REPLACE INTO exchange_rates (currency, rate, updated_at) VALUES (?, ?, ?)",
      args: [cur, rate, ts],
    });
  }
  console.log(`  ✓ Seeded ${rows.length} rates`);
} catch (e) {
  console.log("  ! Rate seed failed (will use fallback):", e.message);
}

console.log("\n✓ Database ready");
process.exit(0);
