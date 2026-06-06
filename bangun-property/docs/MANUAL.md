# Estate Insight — User Manual

> Property price intelligence for Malaysia. Live SPEEDHOME data, fair-price benchmarks, area comparison, and exportable reports.

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [The home page](#2-the-home-page)
3. [Running an analysis](#3-running-an-analysis)
4. [Reading the dashboard](#4-reading-the-dashboard)
5. [Filtering listings](#5-filtering-listings)
6. [Listing detail modal](#6-listing-detail-modal)
7. [Map view](#7-map-view)
8. [Comparing areas](#8-comparing-areas)
9. [Fair price calculator](#9-fair-price-calculator)
10. [Price history & trend](#10-price-history--trend)
11. [Saved alerts](#11-saved-alerts)
12. [Sharing & exporting](#12-sharing--exporting)
13. [Currency & period](#13-currency--period)
14. [Theme & language](#14-theme--language)
15. [Admin dashboard](#15-admin-dashboard)
16. [Keyboard shortcuts](#16-keyboard-shortcuts)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. Quick start

```
1. Open the home page
2. Type an area in the search bar (e.g. "Mont Kiara")
3. Hit Enter or click Analyze
4. Watch the live crawl progress (~10–30 s)
5. Read the dashboard — KPIs, charts, listings, map
6. Click any listing for full detail
7. Optionally compare with another area, save an alert,
   or export to Excel
```

The first crawl for an area takes 10–30 s. Subsequent visits within 24 h load instantly from cache.

---

## 2. The home page

The landing page has four sections:

| Section | What it does |
|---|---|
| Hero | Search bar + popular area pills. Type or click to analyze |
| Trending areas | Four curated KL areas — clicking any starts a fresh analysis |
| Stats strip | Real numbers from the database (areas tracked, total listings, total crawls) |
| Features | Static info about platform capabilities |

The search bar accepts:
- **Area names** — `Mont Kiara`, `KLCC`, `Bangsar South`
- **SPEEDHOME URLs** — switch the tab to URL mode and paste a full link

Recent searches are saved on your device (localStorage) and shown below the hero.

---

## 3. Running an analysis

When you submit a search:

1. **Cache check** — if this area was crawled within 24 h, you get the cached result instantly with a `Cached` badge in the header.
2. **Fresh crawl** — otherwise, an async job is queued (`/api/jobs`). You see an interactive loader with stages:
   - `Queued`
   - `Initializing crawler`
   - `Fetching page X of N`
   - `Running analytics engine`
   - `Saving results`
   - `Done`
3. **Live indicator** — once data arrives, a pulsing green `Live data` pill appears next to the area name.

If the crawl fails, you see an error card with `Try again` (force-refresh) and `Dismiss` actions.

---

## 4. Reading the dashboard

The dashboard has six layers, top to bottom:

### a) Header strip
- Area name + `Live data` / `Cached` indicator
- Last crawl timestamp + duration + listing count
- Action bar: Period toggle, Filters (mobile), Compare, Alert, Share, Export, Refresh

### b) KPI cards (7)
| Card | Meaning |
|---|---|
| Total Listings | Active rentals matching the area |
| Average Rent | Mean monthly rent |
| Median Rent | The 50th-percentile rent |
| Fair Price | `0.7 × median + 0.3 × average` (the recommended benchmark) |
| Avg Sqft | Mean unit size |
| Price / Sqft | Mean ringgit per square foot |
| Top Unit | Most common bedroom configuration |

When 30-day price history exists, the Avg / Median / Fair cards show a trend pill (`+/-x.x%`).

### c) Persistent left sidebar (desktop) / drawer (mobile)
The Filters Panel — see [§5](#5-filtering-listings).

### d) Charts grid
- **Market Insight** (left, double-row span on xl) — AI-generated narrative paragraphs
- **Price Distribution** — histogram with reference lines for median, fair price, average. Click a bar to filter the table to that price bucket.
- **Bedroom donut** — share by bedroom type
- **Furnishing donut** — FF / Partial / Unfurn split
- **Market Snapshot** (xl only) — fair price + spread + dominant unit

### e) Calculator + History row
- **Fair Price Calculator** — pick bedrooms / sqft / furnishing → see the area-adjusted fair price
- **Price History Chart** — 30/60/90-day line + 30-day forward forecast tile

### f) Unit Listings
List view (default) or Map view (when listings have coordinates).

---

## 5. Filtering listings

Open the Filters Panel (always visible on desktop, drawer on mobile via `Filters` button).

| Filter | Behaviour |
|---|---|
| Search | Matches listing title, property name, or area substring |
| Bedrooms | Multi-select: `Studio`, `1BR`, `2BR`, `3BR`, `4+BR` |
| Bathrooms | Multi-select: `1`, `2`, `3+` |
| Furnishing | Multi-select: `Fully Furnished`, `Partially Furnished`, `Unfurnished` |
| Monthly Rent (RM) | Min / Max range (in RM, regardless of display currency) |
| Sqft Range | Min / Max range |
| Price / Sqft (RM) | Min / Max range |

A small dot next to `Filters` indicates active filters. Click `Reset all` to clear.

Clicking a histogram bar applies a price-bucket filter automatically.

---

## 6. Listing detail modal

Click any listing row (desktop) or card (mobile) to open the detail modal:

- Photo carousel (prev/next, dots, keyboard arrow nav)
- Asking rent in your selected currency + period
- vs Fair Price percentage diff
- Meta chips: bedrooms, bathrooms, sqft, furnishing, carpark
- Mini Leaflet map (when coordinates are present)
- Description (whitespace-preserving)
- Facilities & furnishings tags
- Sticky footer: Copy link / View on SPEEDHOME

Close with the `X` button, the backdrop, or the `Esc` key.
On mobile the modal slides up as a bottom sheet with a drag handle.

---

## 7. Map view

When at least one listing has coordinates, a List ⇄ Map toggle appears next to the listing count.

The map shows colour-coded markers:
- **Green** — under market
- **Black/ink** — fair
- **Red** — overpriced

Click a marker to see a popup with key facts. Click `View details →` in the popup to open the listing modal.

Auto-fits to the bounds of all markers, includes a legend (dismissible) and a counter showing how many listings are mapped.

---

## 8. Comparing areas

Click `Compare` in the action bar to expand the comparison panel.

1. Type an area name → click `Add` (max 5 areas).
2. Each area is fetched from cache instantly when available, or queued via the job system if not.
3. The comparison table shows: listings, avg rent, median, fair price, avg sqft, price/sqft.
4. The lowest price/sqft is marked `BEST`.
5. A grouped bar chart visualizes Avg / Median / Fair across all areas.
6. The "Smart Recommendation" calls out the best-value area.
7. Click `Show side-by-side details` for per-area cards with rank badges (`Most affordable`, `Largest units`, `Most options`).

You can save a comparison with a custom name to your device for later. Saved comparisons live in localStorage and are listed under the `Saved` button.

---

## 9. Fair price calculator

Below the charts you'll find the calculator. It estimates a fair monthly rent for a hypothetical unit in the current area based on three inputs:

| Input | Effect |
|---|---|
| Bedrooms | Multiplier: Studio 0.78 · 1BR 0.88 · 2BR 1.00 · 3BR 1.20 · 4+BR 1.45 |
| Sqft slider | Linear adjustment vs the area's average sqft |
| Furnishing | FF +5 % · Partial 0 % · Unfurn –3 % |

Optionally enter your asking price → the calculator returns a vs-fair-price diff with a status badge (`Under` / `Fair` / `Over`).

This is a heuristic intended for quick gut-checks, not a regulated valuation.

---

## 10. Price history & trend

The Price History chart loads `/api/history?area=...&days=N` and renders a multi-line area chart over 30, 60, or 90 days.

A trend tile sits above the chart:
- `Trending up +x.x% forecast in 30 days` — linear-regression projection
- `Trending down –x.x%` — direction down
- `Trending flat` — within ±0.5%

If the area has only one snapshot, you see an empty state ("Tracking starts now"). One snapshot per day is recorded — multiple force-refreshes won't pollute the trend.

---

## 11. Saved alerts

Click the `Alert` button to save a search:
- **Area** (auto-filled from current view)
- **Email** (optional — for future notifications)
- **Max price** (RM) (optional)
- **Min bedrooms** (optional)

Alerts are stored server-side. The list endpoint is admin-gated (so you can't read other users' emails). Future deliverable: cron-driven email when a new sub-threshold listing appears.

---

## 12. Sharing & exporting

### Share
Click `Share` to copy a deep link with your current state encoded:
- Area
- Currency (if not MYR)
- Period (if not monthly)
- `compare=1` if comparison is open

On mobile, the native share sheet opens first.

### Export
Click `Export` for:
- **Excel (.xlsx)** — 5 sheets: summary, listings, comparison, insights, currency
- **CSV** — listings only, flat
- **Image** — PNG snapshot of the chart area (when supported)

Filename format: `SPEEDHOME_<Area>_<YYYYMMDD>.xlsx`

---

## 13. Currency & period

Two controls in the navbar / action bar:

### Currency selector (navbar)
9 currencies: MYR · IDR · USD · SGD · EUR · GBP · AUD · JPY · THB.
Rates refresh every 24 h from the Frankfurter API. Every price on every page reformats live.

### Period toggle (action bar on dashboard)
Switch between `Daily` / `Monthly` / `Yearly`. The toggle reformats every price on the page in place — no reload, no refetch.

---

## 14. Theme & language

- **Theme** — Sun / Moon icon in the navbar toggles light/dark. Stored on device.
- **Language** — Globe icon offers EN · MS · ID · ZH. Stored on device.

The language toggle covers nav, hero, footer, and the major dashboard labels. Some component-internal strings are still English.

---

## 15. Admin dashboard

Open `/admin`. You'll be prompted for an admin token (from `ADMIN_TOKEN` env). After login, four tabs:

| Tab | Function |
|---|---|
| Crawler Monitor | Stats + start a new crawl + active/recent jobs table. Auto-polls every 5 s while a job is running. |
| Scan History | Past 50 crawls with re-run / delete actions |
| Cache Manager | Hit ratio, cached-area count, size in KB, clear cache |
| Exchange Rates | Current rates with manual refresh |

Logout via the `Logout` button at the top right.

---

## 16. Keyboard shortcuts

Within the listing modal:

| Key | Action |
|---|---|
| `Esc` | Close modal |
| `←` / `→` | Previous / next photo |
| Click backdrop | Close modal |

---

## 17. Troubleshooting

### "Rate limit reached"
Too many requests in a short window. Wait the retry-after seconds shown in the toast. Per-IP limits:

| Endpoint | Limit |
|---|---|
| `/api/analyze` & `/api/jobs` | 10 / min |
| `/api/search` & `/api/alerts` | 60 / min |
| `/api/compare` | 6 / min |
| `/api/admin` POST | 30 / min |

### "No listings found"
Either the area name is misspelled or SPEEDHOME has no listings for it. Try a nearby/parent area (e.g., `Bangsar` instead of `Lucky Garden`).

### "Cached" but stale
Click the `Refresh` icon (circular arrow) in the action bar to force a fresh crawl.

### Modal looks cut off on iPhone
The modal sizes to `92dvh` and respects `safe-area-inset-bottom`. If you still see issues, force-refresh the page so the latest CSS loads.

### Map shows "No locations available"
SPEEDHOME doesn't always expose lat/lng. Switch back to List view.

### Map page is empty in dark mode
The Leaflet OpenStreetMap tiles are light-only. The container around the map adapts; the tiles do not.

---

## Privacy

- We don't track you across sites.
- Local preferences (theme, currency, language, recent searches, saved comparisons) live in localStorage on your device.
- Optional alert emails are stored server-side and never sold or shared.

For source data attribution: listings are crawled from public SPEEDHOME pages. Estate Insight is not affiliated with SPEEDHOME Sdn. Bhd.
