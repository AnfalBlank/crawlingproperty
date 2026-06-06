import { type BrowserContext } from "playwright";
import { SpeedhomeProperty, SpeedhomePropertyList, CrawlResult, CrawlOptions } from "./types";
import { withContext } from "./browser-pool";

// ─── Config (PRD §10) ─────────────────────────────────────────────────────────

const BASE_URL = process.env.SPEEDHOME_BASE_URL || "https://speedhome.com";
const DELAY_MIN = Number(process.env.CRAWLER_DELAY_MIN ?? 2000);
const DELAY_MAX = Number(process.env.CRAWLER_DELAY_MAX ?? 5000);
const MAX_RETRIES = Number(process.env.CRAWLER_MAX_RETRIES ?? 3);
const TIMEOUT = Number(process.env.CRAWLER_TIMEOUT ?? 30000);
const BACKOFF = [2000, 4000, 8000]; // PRD §10

// Hard cap so a single request can never crawl an unbounded number of pages.
const HARD_PAGE_CAP = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay() {
  return DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN));
}

export function areaToSlug(input: string): string {
  if (input.includes("speedhome.com")) {
    try {
      const u = new URL(input.startsWith("http") ? input : `https://${input}`);
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("rent");
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1].toLowerCase();
    } catch {
      /* fall through */
    }
  }
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function slugToAreaName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Page extraction with retry + backoff ─────────────────────────────────────

async function extractPropertyList(
  context: BrowserContext,
  url: string
): Promise<SpeedhomePropertyList | null> {
  const page = await context.newPage();
  try {
    let lastErr: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
        await page.waitForTimeout(3500 + attempt * 1500);

        const pageProps = await page.evaluate(() => {
          const el = document.getElementById("__NEXT_DATA__");
          if (!el || !el.textContent) return null;
          try {
            const json = JSON.parse(el.textContent);
            return json.props?.pageProps ?? null;
          } catch {
            return null;
          }
        });

        if (pageProps?.propertyList?.content) {
          return pageProps.propertyList as SpeedhomePropertyList;
        }

        lastErr = new Error("propertyList not found (anti-bot interstitial)");
        await sleep(BACKOFF[Math.min(attempt, BACKOFF.length - 1)]);
      } catch (e) {
        lastErr = e as Error;
        await sleep(BACKOFF[Math.min(attempt, BACKOFF.length - 1)]);
      }
    }

    if (lastErr) throw lastErr;
    return null;
  } finally {
    await page.close().catch(() => {});
  }
}

// ─── Main crawl ───────────────────────────────────────────────────────────────

/**
 * Crawl a SPEEDHOME area fully (up to HARD_PAGE_CAP pages).
 *
 * - Uses the shared browser pool (concurrency-capped) — PRD §10.
 * - Randomized delay between pages, retry with exponential backoff.
 * - Partial results are kept: if a later page fails, we still return
 *   everything collected so far instead of throwing away the crawl.
 */
export async function crawlArea(input: string, opts: CrawlOptions = {}): Promise<CrawlResult> {
  // maxPages: undefined/0 → crawl all (bounded by HARD_PAGE_CAP)
  const requestedMax = opts.maxPages && opts.maxPages > 0 ? opts.maxPages : HARD_PAGE_CAP;
  const { onProgress } = opts;
  const slug = areaToSlug(input);
  const area = slugToAreaName(slug);
  const started = Date.now();

  onProgress?.("Initializing crawler...", 5);

  return withContext(async (context) => {
    const allProps: SpeedhomeProperty[] = [];
    let totalElements = 0;
    let pagesCrawled = 0;

    onProgress?.("Connecting to SPEEDHOME...", 12);

    // Page 1 — must succeed
    const first = await extractPropertyList(context, `${BASE_URL}/rent/${slug}`);
    if (!first) {
      throw new Error(`Could not retrieve listings for "${area}"`);
    }

    totalElements = first.totalElements ?? first.content.length;
    allProps.push(...first.content);
    pagesCrawled = 1;

    const totalPages = Math.min(first.totalPages ?? 1, requestedMax, HARD_PAGE_CAP);

    onProgress?.(
      `Found ${totalElements} listings · fetching page 1/${totalPages}...`,
      totalPages > 1 ? 20 : 70
    );

    // Remaining pages — sequential with delay; keep partial on failure
    for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
      await sleep(randomDelay());
      try {
        const result = await extractPropertyList(context, `${BASE_URL}/rent/${slug}?page=${pageNum}`);
        if (result?.content?.length) {
          allProps.push(...result.content);
          pagesCrawled++;
        }
      } catch {
        // Stop on hard failure but keep what we have (partial crawl)
        break;
      }
      // 20% → 70% across pages
      const pct = 20 + Math.round(((pageNum - 1) / Math.max(totalPages - 1, 1)) * 50);
      onProgress?.(`Fetching page ${pageNum}/${totalPages}...`, pct);
    }

    onProgress?.("Processing data...", 75);

    return {
      area,
      slug,
      properties: allProps,
      totalElements,
      pagesCrawled,
      durationMs: Date.now() - started,
    };
  });
}

export { closeBrowser } from "./browser-pool";
