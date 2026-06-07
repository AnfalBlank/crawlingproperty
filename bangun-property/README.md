# Estate Insight

> Property price intelligence for Malaysia. Live SPEEDHOME data, fair-price benchmarks, area comparison, and exportable reports.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turso](https://img.shields.io/badge/Turso-libSQL-4ff8d2)](https://turso.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

---

## What it does

Type an area name (e.g. `Mont Kiara`), wait ~10 seconds, get:

- **7 KPIs** — Total Listings, Average / Median / Fair Price, Avg Sqft, Price/Sqft, Top Unit Type
- **3 charts** — Price distribution histogram (click to filter), bedroom donut, furnishing donut
- **Listing detail modal** — photos carousel, vs-fair-price diff, mini map
- **Map view** — colour-coded markers (under / fair / over)
- **30-day trend forecast** with linear-regression projection
- **Side-by-side comparison** of up to 5 areas
- **Excel / CSV export** with 5-sheet workbook
- **9-currency support**, daily/monthly/yearly toggle, dark mode, EN/MS/ID/ZH

All powered by live SPEEDHOME data, cached for 24 h, refreshed daily by cron.

---

## Documentation

| Doc | What it's for |
|---|---|
| [`docs/PANDUAN_SINGKAT.md`](./docs/PANDUAN_SINGKAT.md) | Ringkasan Bahasa Indonesia — apa, cara pakai, fitur |
| [`docs/MANUAL.md`](./docs/MANUAL.md) | End-user guide — every feature, every flow |
| [`docs/TECHNICAL.md`](./docs/TECHNICAL.md) | Architecture, data model, API reference, deploy |
| [`docs/PITCH_DECK.md`](./docs/PITCH_DECK.md) | Slide deck — vision, status, roadmap |
| [`prd.md`](../prd.md) (repo root) | Product requirements document |
| [`DESIGN.md`](../DESIGN.md) (repo root) | Design tokens & visual language |

---

## Quick start

```bash
git clone https://github.com/AnfalBlank/crawlingproperty.git
cd crawlingproperty/bangun-property
cp .env.example .env.local        # plug your Turso URL + token
npm install
npx playwright install chromium   # one-time
node scripts/init-db.mjs          # bootstrap schema + seed rates
npm run dev                       # http://localhost:3000
```

For deployment, environment variables, and admin setup see [`docs/TECHNICAL.md`](./docs/TECHNICAL.md).

---

## Stack

**Frontend** Next.js 15 · React 18 · TypeScript · TailwindCSS · Zustand · Recharts · Leaflet
**Backend** Next.js Route Handlers · Playwright · @libsql/client
**Database** Turso (libSQL/SQLite)
**Export** ExcelJS · Papaparse
**Exchange rates** Frankfurter API (cached 24 h)

---

## Project layout (high level)

```
bangun-property/
├── app/              # Next App Router (pages + route handlers)
├── components/       # analysis, home, shared, ui
├── lib/              # crawler, db, services, utils, i18n
├── store/            # Zustand store
├── types/            # TS types
├── scripts/init-db.mjs
├── docs/             # MANUAL · TECHNICAL · PITCH_DECK
└── public/           # logo + favicons
```

Full layout in [`docs/TECHNICAL.md` §3](./docs/TECHNICAL.md#3-project-layout).

---

## Routes

```
/                          marketing home (real stats from /api/stats)
/analysis                  interactive dashboard
/area/[slug]               SSG SEO page (20 pre-rendered popular areas)
/admin                     auth-gated console
/api/jobs                  enqueue async crawl (POST 202 + polling)
/api/jobs/[id]             poll job
/api/analyze               sync analyze (cacheOnly=1 mode)
/api/history               price history (PRD §40)
/api/alerts                saved searches (POST public, GET/DELETE admin)
/api/admin/*               admin endpoints (token gated)
/api/cron/refresh          daily refresh — Bearer CRON_SECRET
/api/stats                 public stats for home page
/api/init                  one-shot DB bootstrap (admin)
/sitemap.xml /robots.txt /manifest.webmanifest
```

---

## What's solid

- ✅ End-to-end working crawl → analyse → display (`enqueueAnalysis` → `analyzeArea` single source)
- ✅ Listing detail modal via React `createPortal` (escapes any stacking context)
- ✅ Map view with colour-coded fair-price markers
- ✅ Price history with forecast (30/60/90 days)
- ✅ Fair-price calculator with bedroom/sqft/furnishing inputs
- ✅ Multi-area comparison with `cacheOnly=1` to avoid double-crawls
- ✅ Real KPI trends from `price_history` (no fake `+3.2%`)
- ✅ Admin auth fail-closed in production
- ✅ Rate limiting on every public POST/GET that triggers work
- ✅ Input validation rejecting URLs in `area` field
- ✅ De-duped per-day price history snapshots
- ✅ SEO: 20 pre-rendered area pages, sitemap, robots, manifest

## Known limitations

- Geocoding fallback (Nominatim) for listings without lat/lng — not done
- i18n covers nav/hero/footer; analysis sub-components mostly English
- In-memory rate limiter (resets on cold start) — fine for single-instance
- No automated tests (PRD acceptance criteria checked manually)
- No alert email dispatch yet (alerts stored, cron-driven send to wire)

Full list in [`docs/TECHNICAL.md` §20](./docs/TECHNICAL.md#20-known-limitations).

---

## License

MIT. See `../LICENSE` if present, otherwise [opensource.org/licenses/MIT](https://opensource.org/licenses/MIT).
