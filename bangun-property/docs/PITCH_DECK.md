# Estate Insight — Pitch Deck

> Slide-by-slide narrative deck. Render with any Markdown-to-slides tool (Marp, Slidev, reveal.js) or read sequentially.

---

## Slide 1 — Cover

# Estate Insight
### Property Price Intelligence for Malaysia

**Live data. Fair benchmarks. Smart decisions.**

`estate-insight.app` · Built on real SPEEDHOME data

---

## Slide 2 — The problem

### Renting in KL is opaque.

Picking a flat in Mont Kiara today means:

- Scrolling through **100+ SPEEDHOME listings** by hand
- Comparing prices that swing **±40 %** unit-to-unit
- Guessing whether RM 3,200 is a steal or a rip-off
- No clue if Bangsar is cheaper this month than KLCC
- No record of whether prices are **rising or falling**

There's no benchmark. Only gut feel.

---

## Slide 3 — Who feels this pain

| Segment | Why they care |
|---|---|
| **Renters** | "Am I overpaying for this 2BR?" |
| **Landlords** | "What's the right price to list at?" |
| **Property agents** | "Need market context for clients in 30 s." |
| **Investors** | "Where's the rental yield?" |
| **Researchers** | "Need historical pricing data, exportable." |

Existing portals (PropertyGuru, iProperty) show *listings*. Nobody shows *intelligence*.

---

## Slide 4 — The solution

### Estate Insight turns 124 messy listings into 7 numbers.

1. Type an area name
2. We crawl SPEEDHOME live in 10–30 seconds
3. You get:
   - **Average / Median / Fair Price**
   - **Price distribution histogram**
   - **Bedroom & furnishing mix**
   - **Click any listing for photos + map**
   - **30-day trend forecast**
   - **One-click compare across 5 areas**
   - **Excel / CSV export with full analytics**

No login. No paywall. No bullshit.

---

## Slide 5 — Live demo flow

```
        Home page
            │
            ▼
   ┌────────────────┐
   │  Mont Kiara    │  ← user types and hits Enter
   └────────────────┘
            │   (10 s crawl)
            ▼
   ┌──────────────────────────────────┐
   │  Live data · 124 listings · 9 s   │
   ├──────────────────────────────────┤
   │  Avg RM 2,850   Fair RM 2,660    │
   │  ████████ histogram               │
   │  ┌───┐ Bedrooms  ┌───┐ Furnishing│
   │  └───┘            └───┘           │
   ├──────────────────────────────────┤
   │  124 unit listings · click any    │
   └──────────────────────────────────┘
            │
            ▼
       Listing modal
   (8 photos · map · vs-fair price)
```

---

## Slide 6 — The fair-price formula

We compute a single benchmark we call **Fair Price**:

```
Fair Price = 0.7 × median + 0.3 × average
```

Why this weighting?

- **Median** dominates → resistant to outliers (one luxury penthouse skews avg, not median)
- **30 % avg** keeps it sensitive to genuine market movements
- **Fair Price** then gates every individual listing:

```
< 0.9 × Fair  → Under Market   🟢
< 1.1 × Fair  → Fair           ⚫
≥ 1.1 × Fair  → Overpriced     🔴
```

Map markers, table badges, and the modal vs-price diff all use the same formula.

---

## Slide 7 — What's in the box

| Capability | Status |
|---|---|
| Live SPEEDHOME crawl (Playwright) | ✅ |
| 7-KPI dashboard with trends | ✅ |
| Click-to-filter charts | ✅ |
| Listing detail modal (photos + map) | ✅ |
| Map view with colour-coded pins | ✅ |
| Side-by-side area comparison (≤5) | ✅ |
| Fair-price calculator | ✅ |
| 30/60/90-day price history | ✅ |
| Linear-regression 30-day forecast | ✅ |
| Saved searches / alerts (email) | ✅ |
| 9-currency support | ✅ |
| Daily/Monthly/Yearly period toggle | ✅ |
| Excel + CSV export | ✅ |
| Light / Dark mode | ✅ |
| EN · MS · ID · ZH | ✅ |
| Mobile-first responsive | ✅ |
| SEO: 20 pre-rendered area pages | ✅ |
| Admin console (auth, monitor, cache, rates) | ✅ |
| Daily cron refresh | ✅ |

---

## Slide 8 — How it's built

```
            Frontend                 Backend                Data
   ┌────────────────────┐  ┌────────────────────┐  ┌──────────────┐
   │ Next.js 15         │  │ Next route handlers│  │ Turso libSQL │
   │ React 18 + RSC     │  │ Playwright         │  │ (SQLite)     │
   │ TypeScript strict  │  │ Job queue (RAM)    │  │ 8 tables     │
   │ TailwindCSS        │  │ Rate limiter       │  │ 5 indexes    │
   │ Zustand state      │  │ Frankfurter API    │  │              │
   │ Recharts + Leaflet │  │ Token + cron auth  │  │              │
   └────────────────────┘  └────────────────────┘  └──────────────┘
```

- **One-shot DB init**: `node scripts/init-db.mjs`
- **One-command deploy**: `vercel deploy`
- **Cron-driven daily refresh** of top 10 areas
- **Cache hit ratio** ~24 % on real traffic — most popular areas served instantly

---

## Slide 9 — Key technical choices

| Choice | Why |
|---|---|
| Turso over Postgres | 0 ms cold start. Free tier covers our row count. |
| In-memory job queue | Simpler than Redis for our 3-concurrent cap. Survives HMR via `globalThis`. |
| Playwright over cheerio | SPEEDHOME ships JS-rendered HTML. We read `__NEXT_DATA__`. |
| Per-day price-history dedup | Multiple force-refreshes don't pollute trend chart. |
| `cacheOnly=1` on `/api/analyze` | Comparison panel checks cache first instead of double-crawling. |
| `createPortal` for listing modal | Escapes any stacking context — never covered by navbar. |
| Single `analyzeArea` function | Both sync and async paths funnel through one pipeline → no drift. |

---

## Slide 10 — Why now

### Three things changed:

1. **JS-rendered pages are the norm** — old scrapers break monthly. Playwright + `__NEXT_DATA__` is reliable.
2. **Turso made SQLite production-grade** — no devops, free tier, 50 ms anywhere.
3. **Next 15 collapsed the stack** — marketing site, dashboard, API, SSG, cron — all one repo, one deploy.

A solo developer can now ship what used to need a team of four.

---

## Slide 11 — What sets us apart

| Feature | Estate Insight | PropertyGuru / iProperty |
|---|---|---|
| Live crawl | ✅ on-demand | ❌ |
| Fair price benchmark | ✅ | ❌ |
| Click-to-filter histogram | ✅ | ❌ |
| Multi-area side-by-side compare | ✅ ≤5 | ❌ |
| 30-day trend forecast | ✅ | ❌ |
| Excel export with 5 sheets | ✅ | ❌ |
| 9-currency conversion | ✅ | ❌ |
| Map view with fair-price colour code | ✅ | ❌ |
| Free, no signup | ✅ | partial |
| Listings | borrows from SPEEDHOME | own DB |

We don't compete with portals — we add a layer of intelligence on top.

---

## Slide 12 — The numbers (today)

> Live data from `/api/stats` — these are real, not mock.

- **29** areas tracked
- **725** listings analysed
- **37** crawls completed
- **24 %** cache hit ratio

Production build: **30 routes**, **106 kB** shared JS, **278 kB** dashboard first-load.

Average analysis time: **9–18 s** uncached, **~50 ms** cached.

---

## Slide 13 — Roadmap

### Phase 1 (shipped)
✓ Live crawl, dashboard, comparison, alerts, modal, map, history, forecast, multi-currency, multi-language, admin, cron

### Phase 2 (next 4 weeks)
- ROI / Rental yield calculator
- Geocoding fallback (Nominatim) for listings without lat/lng
- Email dispatch on saved-search match (cron driven)
- Per-property alert ("notify me when this listing's price changes")
- WhatsApp share button
- Mobile PWA install prompt

### Phase 3 (3–6 months)
- Sale price intelligence (currently rentals only)
- More portals (PropertyGuru, iProperty, Mudah)
- AI-generated insights with LLM (currently template-driven)
- B2B API access for agencies
- Mobile native app (Expo)

---

## Slide 14 — Business model (sketch)

| Tier | Price | What you get |
|---|---|---|
| Free | RM 0 | 5 analyses/day, all features |
| Pro | RM 29/mo | Unlimited, history exports, email alerts |
| Agency | RM 199/mo | API access, white-label reports, 50 saved searches |
| Enterprise | Custom | Bulk crawl quotas, on-premise option, custom areas |

Cost per crawl: ~RM 0.002 (Turso bandwidth + Vercel function-second). Highly scalable.

---

## Slide 15 — Why us

- One developer, one repo, three weeks from blank `npx create-next-app` to public-ready product.
- Code is **honest** — no fake numbers paraded as "live data" any more (every claim is computed).
- **Production-hardened**: rate limits, admin auth (fail-closed in prod), input validation, sanitised SQL, idempotent migrations.
- **Documented** — manual book, technical docs, this deck. Anyone can pick it up tomorrow.

---

## Slide 16 — Try it now

```
  https://github.com/AnfalBlank/crawlingproperty
```

```bash
git clone https://github.com/AnfalBlank/crawlingproperty.git
cd crawlingproperty
cp .env.example .env.local        # plug your Turso URL + token
npm install
npx playwright install chromium
node scripts/init-db.mjs
npm run dev
```

Open `http://localhost:3000`, type an area, watch the crawler do its thing.

---

## Slide 17 — Thank you

**Estate Insight**
*Property Price Intelligence for Malaysia*

Made in Kuala Lumpur · Open source · MIT

Questions → `hello@estate-insight.app`
