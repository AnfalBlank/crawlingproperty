# Estate Insight — Technical Documentation

> Architecture, data model, API reference, deployment guide.

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Stack](#2-stack)
3. [Project layout](#3-project-layout)
4. [Data flow](#4-data-flow)
5. [Database schema](#5-database-schema)
6. [API reference](#6-api-reference)
7. [Crawler internals](#7-crawler-internals)
8. [Job queue](#8-job-queue)
9. [Authentication & rate limiting](#9-authentication--rate-limiting)
10. [Caching strategy](#10-caching-strategy)
11. [Frontend state](#11-frontend-state)
12. [Internationalisation](#12-internationalisation)
13. [Theming](#13-theming)
14. [Environment variables](#14-environment-variables)
15. [Local development](#15-local-development)
16. [Deployment](#16-deployment)
17. [Cron / scheduled jobs](#17-cron--scheduled-jobs)
18. [Security checklist](#18-security-checklist)
19. [Performance budget](#19-performance-budget)
20. [Known limitations](#20-known-limitations)

---

## 1. Architecture overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js App Router)                  │
│ ┌─────────┐  ┌────────────┐  ┌─────────┐  ┌─────────┐           │
│ │ /       │  │ /analysis  │  │ /admin  │  │ /area/  │           │
│ │ marketing│  │ dashboard  │  │ console │  │ [slug]  │ (SSG)     │
│ └─────────┘  └────────────┘  └─────────┘  └─────────┘           │
│                  │                │                              │
│                  │  Zustand store │  React state                 │
│                  ▼                ▼                              │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │              Next 15 Route Handlers (Node runtime)           │ │
│ │ /api/jobs · /api/jobs/[id] · /api/analyze · /api/compare    │ │
│ │ /api/history · /api/alerts · /api/admin · /api/admin/login   │ │
│ │ /api/cron/refresh · /api/currency · /api/search · /api/stats │ │
│ │ /api/init                                                    │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼─────────────────────┐
       │                      │                     │
       ▼                      ▼                     ▼
 ┌─────────────┐    ┌──────────────────┐    ┌──────────────┐
 │  Turso      │    │   Job Queue      │    │ Playwright   │
 │  libSQL DB  │    │  (in-memory      │    │  (chromium)  │
 │  (SQLite)   │    │   on globalThis) │    │              │
 └─────────────┘    └──────────────────┘    └──────────────┘
                              │                     │
                              └────────┬────────────┘
                                       ▼
                              ┌─────────────────┐
                              │  SPEEDHOME      │
                              │  (public pages) │
                              └─────────────────┘
```

### Key decisions

| Decision | Reason |
|---|---|
| **Next.js 15 App Router** | One framework for SSR (`/area/[slug]`), CSR (`/analysis`, `/admin`), and route handlers (`/api/*`). |
| **Turso (libSQL)** | SQLite over the wire. Free tier covers our footprint, 0 ms cold starts vs Postgres for our row counts (<100 K). |
| **In-memory job queue** | Simpler than Redis/BullMQ for our concurrency cap of 3. Survives HMR via `globalThis`. Reset on deploy is acceptable — jobs finish in <60 s. |
| **Playwright + chromium** | SPEEDHOME uses Next.js → JS-rendered, so we read `__NEXT_DATA__` after hydration. cheerio alone wouldn't work. |
| **Zustand + persist** | Simpler than Redux Toolkit for our 12-slice state. localStorage persist for currency/lang/theme/recent searches. |

---

## 2. Stack

### Frontend
- **Next.js 15.1** — App Router, RSC, route handlers, dynamic imports
- **React 18.3** — Suspense, concurrent rendering
- **TypeScript 5.7** — strict mode
- **TailwindCSS 3.4** — design tokens via CSS variables (light/dark)
- **Zustand 5** — client state with `persist` middleware
- **Recharts 2.14** — bar / line / area / pie charts
- **react-leaflet 5** + **leaflet 1.9** — maps with custom DivIcon markers
- **lucide-react 0.468** — icons (no emoji)
- **framer-motion 11** — minimal use (most animations are CSS keyframes)
- **clsx + tailwind-merge** — conditional classes
- **@tanstack/react-table 8** — installed for future sortable tables
- **ExcelJS 4** — XLSX export with multi-sheet workbook
- **Papaparse 5** — CSV export

### Backend
- **Next.js Route Handlers** — `runtime = "nodejs"` for crypto + `@libsql/client`
- **@libsql/client 0.17** — Turso connection
- **Playwright 1.60 + playwright-core** — headless chromium
- **@sparticuz/chromium 149** — for Vercel serverless (optional)
- **cheerio 1.2** — fallback HTML parsing where used

### Tooling
- ESLint via `next lint`
- Prettier (defaults)

---

## 3. Project layout

```
bangun-property/
├── app/                          # Next App Router
│   ├── api/                      # Route handlers (server)
│   │   ├── admin/                # admin GET/POST + login
│   │   ├── alerts/               # saved searches
│   │   ├── analyze/              # sync analyze (cacheOnly support)
│   │   ├── compare/              # comparison (legacy sync)
│   │   ├── cron/refresh/         # scheduled top-areas refresh
│   │   ├── currency/             # exchange rates getter
│   │   ├── history/              # price history getter
│   │   ├── init/                 # one-shot DB init (admin only)
│   │   ├── jobs/                 # async crawl queue endpoints
│   │   ├── search/               # autocomplete
│   │   └── stats/                # public stats for home page
│   ├── admin/                    # /admin client page
│   ├── analysis/                 # /analysis client page
│   ├── area/[slug]/              # SSG per-area SEO page
│   ├── globals.css               # design tokens + animations
│   ├── layout.tsx                # root layout, theme, fonts, OG
│   ├── manifest.ts               # PWA manifest
│   ├── page.tsx                  # marketing home page
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── analysis/                 # dashboard pieces
│   │   ├── charts.tsx
│   │   ├── comparison-panel.tsx
│   │   ├── crawl-loader.tsx
│   │   ├── export-button.tsx
│   │   ├── fair-price-calculator.tsx
│   │   ├── filters-panel.tsx
│   │   ├── kpi-cards.tsx
│   │   ├── listing-mini-map.tsx  # lazy
│   │   ├── listing-modal.tsx     # uses createPortal
│   │   ├── listings-map.tsx      # lazy
│   │   ├── listings-table.tsx
│   │   ├── market-insight.tsx
│   │   ├── market-stat-card.tsx
│   │   ├── period-toggle.tsx
│   │   ├── price-history-chart.tsx
│   │   ├── save-alert-button.tsx
│   │   └── share-button.tsx
│   ├── home/                     # home page sub-components
│   │   ├── animated-counter.tsx
│   │   ├── recent-searches.tsx
│   │   ├── scroll-reveal.tsx
│   │   └── search-bar.tsx
│   ├── shared/                   # navbar, footer, theme provider
│   └── ui/                       # base elements (badge, skeleton)
├── hooks/                        # use-scroll-reveal, etc.
├── lib/
│   ├── crawler/                  # speedhome.ts, processor.ts, types.ts, browser-pool.ts
│   ├── db/                       # client.ts, schema.ts, repository.ts
│   ├── services/
│   │   ├── admin-auth.ts
│   │   ├── analysis-service.ts   # SINGLE SOURCE: cache→crawl→process→persist
│   │   ├── exchange-rates.ts
│   │   ├── job-queue.ts          # delegates to analysis-service
│   │   └── rate-limiter.ts
│   ├── i18n.ts                   # 4-language dictionary
│   ├── mock-data.ts              # fallback exchange rates
│   └── utils.ts                  # formatters, calc helpers
├── public/                       # logo + generated favicons
├── scripts/init-db.mjs           # idempotent schema bootstrap
├── store/app-store.ts            # Zustand store
├── types/index.ts                # all TS types
├── docs/                         # this folder
├── vercel.json                   # cron schedule
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 4. Data flow

### 4.1 First-time analysis (uncached)

```
User types "Mont Kiara" → SearchBar → router.push("/analysis?area=Mont+Kiara")
                                 ↓
   AnalysisDashboardContent.runAnalysis(area)
                                 ↓
                  POST /api/jobs { area: "Mont Kiara" }
                                 ↓
              enqueueAnalysis() → Job created, status="queued"
                                 ↓
                  Returns 202 + { id: "job_xxx", status, queuePosition }
                                 ↓
   Client polls GET /api/jobs/:id every 800 ms (max 600 attempts ~ 8 min)
                                 ↓
   Worker picks up job (concurrent cap = 3) → analyzeArea()
                                 ↓
       cache miss → Playwright launches → crawl loop (per-page)
                                 ↓
                onProgress() updates job.stage / job.progress
                                 ↓
       Build AreaAnalysis → write listings + summary + history → cache
                                 ↓
   GET /api/jobs/:id returns status:"completed" + analysis payload
                                 ↓
                Dashboard renders KPIs, charts, listings, map
```

### 4.2 Cached analysis (24 h)

```
GET /api/analyze?area=Bangsar
        ↓
analyzeArea(input, { forceRefresh: false })
        ↓
getCachedAnalysis(slug) → hit
        ↓
{ analysis, cached: true } returned synchronously
```

Latency: ~50–100 ms.

### 4.3 Comparison

```
ComparisonPanel.addArea("KLCC")
        ↓
GET /api/analyze?area=KLCC&cacheOnly=1
        ↓
   ┌──── 200 cached → use it
   └──── 404 not cached → POST /api/jobs → poll → use result
```

The `cacheOnly=1` flag prevents accidental synchronous crawls on the comparison endpoint.

---

## 5. Database schema

All tables are in a single Turso libSQL database. Schema is created idempotently by `lib/db/schema.ts` (called via `ensureSchema()` before every query) and by `scripts/init-db.mjs` (one-shot bootstrap).

### `areas`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK AUTO | |
| name | TEXT | "Mont Kiara" |
| slug | TEXT UNIQUE | "mont-kiara" |
| created_at | TEXT | `datetime('now')` |

### `listings`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | SPEEDHOME property id |
| area_id | INTEGER → areas | |
| area | TEXT | denormalised area name |
| title, property_name | TEXT | |
| bedrooms | TEXT | "Studio" or "1"/"2"/"3"/... |
| bathrooms | INTEGER | |
| monthly_rent, yearly_rent, daily_rent | REAL | nullable |
| sqft, price_per_sqft | INTEGER, REAL | |
| furnishing | TEXT | "Fully Furnished" / "Partially Furnished" / "Unfurnished" |
| url | TEXT | speedhome.com listing |
| scraped_at | TEXT | |
| description | TEXT | nullable |
| images | TEXT | JSON array of URLs |
| latitude, longitude | REAL | nullable |
| address | TEXT | nullable |
| carpark | INTEGER | nullable |
| facilities | TEXT | JSON array |
| furnishes | TEXT | JSON array |

### `price_summaries`
Stores the latest summary per area. One row per area (replaced on each crawl).

### `price_history` *(PRD §40)*
Time series — one row per (area, day). De-duped on insert by deleting any existing row with `date(snapshot_at) = date('now')` for that area.

### `crawl_jobs`
Persistent record of every crawl that's been started (queued/running/completed/failed) with timing.

### `scan_history`
Compact history for the admin tab (`area_name`, `listing_count`, `duration`, `status`, `created_at`).

### `analysis_cache`
| Column | Notes |
|---|---|
| slug | PK |
| payload | TEXT — JSON-serialised AreaAnalysis |
| expires_at | 24 h after created_at |

`getCachedAnalysis()` deletes expired rows on read.

### `exchange_rates`
| currency | rate | updated_at |
|---|---|---|
| MYR | 1.0 | … |
| USD | 0.21 | … |
| … | | |

### `saved_searches`
User alerts. `email`, `area_name`, `max_price`, `min_bedrooms`. List endpoint admin-gated.

### Indexes
- `idx_listings_area` on `listings(area_id)`
- `idx_crawl_jobs_status` on `crawl_jobs(status)`
- `idx_scan_history_created` on `scan_history(created_at)`
- `idx_price_history_area` on `price_history(area_id, snapshot_at)`
- `idx_saved_searches_area` on `saved_searches(area_name)`

---

## 6. API reference

All endpoints are at `runtime = "nodejs"` and `dynamic = "force-dynamic"`. JSON bodies, JSON responses.

### Public

#### `GET /api/stats`
Returns `{ totalAreas, totalListings, totalCrawls, cacheHitRatio }`. Cached at the edge for 5 min.

#### `GET /api/search?q=mont`
Returns `{ suggestions: [{ type, label, value, subtitle? }] }`. 250 ms debounced from the client.

#### `GET /api/currency`
Returns `{ rates: ExchangeRate[] }`. Refreshed every 24 h server-side.

#### `GET /api/analyze?area=X&[force=true]&[cacheOnly=1]`
Synchronous analyze. Returns `{ ...analysis, _cached: boolean }`.
- `force=true` — bypass cache, re-crawl
- `cacheOnly=1` — return only cache hit; 404 if uncached (used by comparison panel to decide whether to enqueue)

#### `POST /api/jobs`
Body `{ area?, url?, force? }`. Validates input (rejects URLs in `area` field, special characters). Returns 202 with `{ id, area, slug, status, stage, progress, queuePosition }`.

#### `GET /api/jobs/[id]`
Polls a job. Returns the same DTO shape; when `status === "completed"` includes the full `analysis` payload.

#### `GET /api/history?area=X&days=N`
Returns `{ area, days, points: PriceHistoryPoint[] }`. Days clamped 7–365.

#### `POST /api/alerts`
Body `{ areaName, email?, maxPrice?, minBedrooms? }`. Validates length (areaName ≤100, email ≤120) and ranges (maxPrice 0–1M, minBedrooms 0–10). Returns `{ id, success: true }`.

### Admin-only (require `Authorization: Bearer ADMIN_TOKEN` or `admin_token` cookie)

#### `GET /api/admin?type=stats|jobs|history|cache|rates`
Read endpoints for the admin UI.

#### `POST /api/admin`
Actions: `start-crawl` (body `{ area }`), `clear-cache`, `refresh-rates`, `delete-history` (body `{ historyId }`), `dispatch-alerts` (manually trigger saved-search email dispatch).

#### `POST /api/admin/login`
Body `{ token }`. Sets `admin_token` httpOnly cookie (8 h, sameSite=lax, secure in prod).

#### `GET /api/admin/login`
Returns `{ configured, authed }`. Fail-closed in production when token is missing.

#### `DELETE /api/admin/login`
Clears the cookie.

#### `GET /api/alerts`
Lists saved searches (contains emails — admin-only).

#### `DELETE /api/alerts?id=N`
Removes a saved search.

#### `POST /api/init`
Schema bootstrap + rate seed. Idempotent.

### Cron (require `Authorization: Bearer CRON_SECRET`)

#### `GET /api/cron/refresh`
Refreshes top 10 areas + exchange rates, then dispatches saved-search email alerts (Point 6). Designed for Vercel Cron (`vercel.json` schedules `0 3 * * *`).

---

## 7. Crawler internals

`lib/crawler/speedhome.ts`

```
crawlArea(input, { onProgress, maxPages? })
  ├─ areaToSlug(input)   → "mont-kiara"
  ├─ buildSearchUrl(slug, page) → "https://speedhome.com/rent/mont-kiara?page=N"
  ├─ Browser pool (browser-pool.ts) — singleton chromium, 60 s idle close
  ├─ For page = 1..MAX (default 15)
  │    ├─ context.newPage()
  │    ├─ goto(url, { timeout: 30s })
  │    ├─ wait for hydration
  │    ├─ extract __NEXT_DATA__.props.pageProps.propertyList.content[]
  │    ├─ if items.length < pageSize → break (no more pages)
  │    ├─ randomDelay(2000, 5000)  // be polite
  │    └─ retry on failure (max 3, exponential backoff)
  └─ Returns { properties, durationMs }
```

`lib/crawler/processor.ts`

```
toListing(SpeedhomeProperty, areaName) → Listing | null
  ├─ Map raw fields → typed shape
  ├─ Compute price_per_sqft
  ├─ Map bedroom (handles Studio + numeric)
  ├─ Map furnishing enum
  ├─ Extract images (first 8 URLs)
  ├─ Extract lat/lng/address/facilities/furnishes
  └─ Drop if no price (filtered)
```

`buildAnalysis(crawl)` → `AreaAnalysis`

```
listings (filtered)
  → calcPriceSummary  → { avg, median, mode, fairPrice, ... }
  → calcPriceDistribution → 6 buckets
  → bedroomDistribution
  → furnishingDistribution
  → generateInsights (heuristic narrative)
  → fairPriceStatus per listing (Under / Fair / Over)
```

### Crawler tuning (env vars)
- `CRAWLER_DELAY_MIN/MAX` — random delay between page fetches
- `CRAWLER_MAX_CONCURRENCY` — concurrent worker cap (default 3)
- `CRAWLER_MAX_RETRIES` — per-page retry count
- `CRAWLER_TIMEOUT` — per-page navigation timeout

---

## 8. Job queue

`lib/services/job-queue.ts`

In-memory state on `globalThis.__bangunQueue` (survives HMR, scopes per-server-instance).

```ts
interface QueueState {
  jobs: Map<string, Job>;         // all jobs (incl. finished, TTL 10 min)
  pending: string[];              // FIFO of queued job IDs
  bySlug: Map<string, string>;    // dedupe: same slug → same job
  runningCount: number;
}
```

### Lifecycle
1. **enqueueAnalysis(input, opts)** — dedupe by slug if not force, push to `pending`, kick scheduler.
2. **schedule()** — wait for free slot (concurrency cap), increment `runningCount`, call `runJob`.
3. **runJob()** — delegates to `analyzeArea` from `analysis-service.ts` (single source of truth).
4. **Cleanup** — finished jobs evicted after 10 min; failed jobs delete `bySlug` mapping so user can retry.

### DTO
`jobToDTO(job)` strips internal fields and only includes `analysis` when `status === "completed"`.

---

## 9. Authentication & rate limiting

### Admin token (`lib/services/admin-auth.ts`)
- Token from `ADMIN_TOKEN` env. Constant-time comparison.
- **Production**: missing token → fail-closed (returns 401 / "Admin not configured").
- **Development**: missing token → allow with warn-log. Lets engineers run locally without setting a secret.
- Sources (in priority): `Authorization: Bearer`, `x-admin-token` header, `admin_token` cookie.

### Cron token
`/api/cron/refresh` checks `Authorization: Bearer CRON_SECRET`. Vercel Cron auto-attaches.

### Rate limiter (`lib/services/rate-limiter.ts`)
In-memory sliding window per IP per bucket:

| Bucket | Limit | Window |
|---|---|---|
| `analyze` | 10 | 60 s |
| `search` | 60 | 60 s |
| `compare` | 6 | 60 s |
| `admin` | 30 | 60 s |

Returns `{ allowed, retryAfter }`. Routes return 429 with `Retry-After` header.

> **Production note**: in-memory limiter resets on each serverless cold start. For real production, swap to Upstash Redis with the same interface.

### IP extraction
`getClientIp(request)` reads (priority order): `x-forwarded-for` first IP, `x-real-ip`, `cf-connecting-ip`, falls back to `"unknown"`.

---

## 10. Caching strategy

| Layer | What | TTL | Invalidation |
|---|---|---|---|
| **Browser** | localStorage: theme, lang, currency, recent searches, saved comparisons | ∞ | User clears |
| **Edge cache** | `/api/stats`, `/api/currency` | 5 min / 24 h | Auto |
| **DB cache** | `analysis_cache.payload` per slug | 24 h | TTL or `force=true` or admin "Clear cache" |
| **Image** | `next/image` for Unsplash and own assets | 1 yr | `unoptimized={true}` for SPEEDHOME images (unknown CDN) |

### Cache hit ratio
`(cached_areas / total_crawls)` — surfaced in admin stats. Real-world hit ratio depends on how many distinct areas users analyze.

---

## 11. Frontend state

`store/app-store.ts` (Zustand + persist)

| Slice | Persisted? | Purpose |
|---|---|---|
| `analysis`, `isAnalyzing`, `analyzeProgress`, `analyzeStage` | no | current dashboard state |
| `currentArea` | no | last submitted area |
| `currency`, `exchangeRates` | currency only | display currency + cached rates |
| `filters`, `activePriceBucket` | no | filter state |
| `comparison` | no | current comparison (saved separately) |
| `savedComparisons` | yes | localStorage list |
| `recentSearches` | yes | up to 5 |
| `rentalPeriod` | no | daily/monthly/yearly |
| `theme` | yes | light/dark |
| `lang` | yes | en/ms/id/zh |

`skipHydration: true` in persist config — re-hydrated by `ThemeProvider` on mount to avoid SSR mismatch.

---

## 12. Internationalisation

`lib/i18n.ts` — flat dictionary, four locales.

```ts
import { t } from "@/lib/i18n";
const { lang } = useAppStore();
return <span>{t(lang, "hero.headline1")}</span>;
```

Keys grouped: `nav.*`, `hero.*`, `dash.*`, `kpi.*`, `feat.*`, `how.*`, `cta.*`, etc.

> **Coverage**: navbar, footer, hero, marketing sections, KPI labels, dashboard header. **Not yet covered**: most analysis sub-components (filters, calculator, charts internal labels, modal headings). Tracked as future work.

---

## 13. Theming

CSS variables in `globals.css`, two themes (`:root` / `.dark`):

| Token | Light | Dark |
|---|---|---|
| `--color-ink` | `#0f0f0f` | `#fafafa` |
| `--color-canvas` | `#ffffff` | `#161616` |
| `--color-surface-soft` | `#f5f5f5` | `#1e1e1e` |
| `--color-hairline` | `#e3e3e3` | `#2a2a2a` |
| `--color-primary` | `#FF385C` | (same) |
| `--color-muted` | `#555555` | `#a0a0a0` |
| ... | | |

`ThemeProvider` toggles `<html class="dark">` based on store. Tailwind `dark:*` variants resolve from there.

Custom utilities:
- `.glass-card`, `.hero-orb`, `.hero-dotgrid` — hero ambient elements
- `.interactive-card`, `.btn-lift`, `.property-card-img` — hover micro-interactions
- `.skeleton`, `.shimmer` — loading states
- `.reveal` — JS-driven scroll-reveal class
- `.modal-open` — body class set when listing modal is open (hides navbar)

`@media (prefers-reduced-motion: reduce)` disables decorative animations.

---

## 14. Environment variables

```env
# Turso libSQL
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=...

# Crawler
CRAWLER_DELAY_MIN=2000
CRAWLER_DELAY_MAX=5000
CRAWLER_MAX_CONCURRENCY=3
CRAWLER_MAX_RETRIES=3
CRAWLER_TIMEOUT=30000
SPEEDHOME_BASE_URL=https://speedhome.com

# Auth (production: REQUIRED)
ADMIN_TOKEN=long-random-secret
CRON_SECRET=long-random-secret

# Email alerts (optional — Point 6). When unset, alerts are stored but not emailed.
RESEND_API_KEY=
ALERT_FROM_EMAIL=Estate Insight <alerts@estate-insight.app>

# Public site URL (sitemap, robots, OG)
NEXT_PUBLIC_SITE_URL=https://your-domain.example.com
```

See `.env.example`.

---

## 15. Local development

```bash
git clone https://github.com/AnfalBlank/crawlingproperty.git
cd crawlingproperty
cp .env.example .env.local        # fill in your Turso URL + token
npm install
npx playwright install chromium   # one-time
node scripts/init-db.mjs          # bootstrap schema + seed rates
npm run dev                       # http://localhost:3000
```

### Common commands

```bash
npm run dev          # next dev (port 3000, falls back to 3001)
npm run build        # production build (~28 routes)
npm start            # next start
npm run lint         # next lint

# Free a stuck port
lsof -ti:3000 | xargs kill -9
```

### Hot reload caveats
- The dev server crashes if `npm run build` runs while it's up (overwrites `.next/`). Stop dev before building.
- Zustand `skipHydration: true` requires `ThemeProvider` to call `rehydrate()` on mount.

---

## 16. Deployment

### Vercel (recommended)

1. Connect the repo on Vercel.
2. Set env vars in **Settings → Environment Variables** (production-only):
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_TOKEN` (long random)
   - `CRON_SECRET` (long random)
   - `NEXT_PUBLIC_SITE_URL`
3. **Important**: install Playwright Chromium during build. Add to `package.json`:

```json
"scripts": {
  "build": "next build && npx playwright install chromium"
}
```

   Or use `@sparticuz/chromium` (already a dep) for serverless-friendly chromium.
4. Vercel Cron schedule defined in `vercel.json` runs daily at 03:00 UTC.

### Self-host / VPS

1. Build server: Node 20+, npm 10+.
2. Install Playwright deps:

```bash
npx playwright install --with-deps chromium
```

3. `npm run build && npm start` behind a reverse proxy (nginx/Caddy).
4. systemd timer for the cron call:

```
[Service]
ExecStart=curl -H "Authorization: Bearer ${CRON_SECRET}" https://your-domain/api/cron/refresh

[Timer]
OnCalendar=*-*-* 03:00:00
```

### After deploy
1. Visit `/api/init` once (with admin auth) to seed rates.
2. Crawl 5–10 popular areas to warm the cache.

---

## 17. Cron / scheduled jobs

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh",
      "schedule": "0 3 * * *"
    }
  ]
}
```

`/api/cron/refresh` does:
1. Verifies `Authorization: Bearer CRON_SECRET`.
2. Refreshes exchange rates (Frankfurter API).
3. Force-refreshes the top 10 most-popular areas (via `enqueueAnalysis`, max concurrency = 3, so it runs serially).

Returns immediately after enqueue — actual crawling happens in the background. Vercel functions have a 60 s ceiling, so the cron caller doesn't wait for completion.

---

## 18. Security checklist

- [x] Admin endpoints require token in production.
- [x] PII (saved-search emails) only readable via admin token.
- [x] Constant-time token comparison (no trivial timing leak).
- [x] httpOnly cookies, `secure` in production, sameSite=lax.
- [x] Input length + character validation on `/api/jobs` POST and `/api/alerts` POST.
- [x] URL field accepts only `*.speedhome.com`.
- [x] Rate limiting on every public POST/GET that triggers work.
- [x] CSP / SRI — **TODO** (not yet configured).
- [x] `.env.local` in `.gitignore`.
- [ ] **Rotate `ADMIN_TOKEN` and `CRON_SECRET`** before any public deploy.

---

## 19. Performance budget

Production build (`npm run build`):

| Page | First Load JS | Type |
|---|---|---|
| `/` | ~147 kB | Static |
| `/analysis` | ~278 kB | Static (CSR) |
| `/area/[slug]` | ~135 kB | SSG (20 pre-rendered) |
| `/admin` | ~141 kB | Static (CSR) |
| Shared chunks | 106 kB | |

Crawl latencies (warm chromium):
- 1 page (~30 listings) — 2–4 s
- Full crawl (15 pages cap) — 12–25 s

API latencies (cached):
- `/api/analyze` cache hit — ~50–100 ms
- `/api/jobs/:id` poll — ~20 ms

---

## 20. Known limitations

1. **Geocoding fallback** — listings without `latitude`/`longitude` from SPEEDHOME aren't plotted. No Nominatim/Google fallback yet.
2. **i18n** — full coverage across nav, hero, footer, dashboard, charts, modal, comparison, calculators, filters, and alerts in 4 languages (EN/MS/ID/ZH). Admin console remains English.
3. **Rate limiter is per-instance** — multi-instance deploys would need Redis-backed limiter.
4. **In-memory job queue** — survives HMR but not server restart. Acceptable trade-off for MVP.
5. **No tests** — neither unit nor e2e. PRD acceptance criteria checked manually.
6. **Alert email requires Resend** — alerts are stored + matched, and dispatched daily via cron, but only emailed when `RESEND_API_KEY` is set. Without it, dispatch is a safe no-op.
7. **Auto-rotate on Turso** — depends on Turso's own retention; no app-side cleanup of `crawl_jobs` / `scan_history` rows.
8. **PRD §40 ROI/Yield calculator** — not implemented (Phase 2).

---

## Contact & contributing

- Issues: https://github.com/AnfalBlank/crawlingproperty/issues
- License: MIT

Pull requests welcome. Please run `npm run build` locally before opening.
