import { AreaAnalysis } from "@/types";
import { crawlArea, areaToSlug, slugToAreaName } from "@/lib/crawler/speedhome";
import { buildAnalysis, toListing } from "@/lib/crawler/processor";
import {
  upsertArea, replaceListings, savePriceSummary,
  getCachedAnalysis, saveCachedAnalysis,
  createCrawlJob, updateCrawlJob, addScanHistory,
  recordPriceHistory,
} from "@/lib/db/repository";

export interface AnalyzeOptions {
  forceRefresh?: boolean;       // bypass 24h cache
  maxPages?: number;
  onProgress?: (stage: string, pct: number) => void;
}

export interface AnalyzeResult {
  analysis: AreaAnalysis;
  cached: boolean;
}

/**
 * Single source of truth for the analyze pipeline (PRD §5/§6/§31/§37/§40):
 *   cache check → upsert area → DB job → crawl → process → persist → cache → history.
 *
 * Both `/api/analyze` and the async `/api/jobs` flow funnel through this. Any
 * change here is automatically reflected in both call sites.
 */
export async function analyzeArea(input: string, opts: AnalyzeOptions = {}): Promise<AnalyzeResult> {
  const { forceRefresh = false, maxPages, onProgress } = opts;
  const slug = areaToSlug(input);
  const areaName = slugToAreaName(slug);

  // 1. Cache check (PRD §31 — 24h cache)
  if (!forceRefresh) {
    const cached = await getCachedAnalysis(slug);
    if (cached) {
      onProgress?.("Loaded from cache", 100);
      return { analysis: cached.analysis, cached: true };
    }
  }

  // 2. Register crawl job (PRD §37 monitor)
  const areaId = await upsertArea(areaName);
  const jobId = await createCrawlJob(areaId, areaName);
  const startedAt = new Date().toISOString();
  await updateCrawlJob(jobId, { status: "running", startedAt });

  try {
    // 3. Crawl (PRD §10) — full crawl when maxPages omitted
    const crawl = await crawlArea(input, { maxPages, onProgress });

    if (crawl.properties.length === 0) {
      await updateCrawlJob(jobId, {
        status: "failed",
        completedAt: new Date().toISOString(),
        error: "No listings found",
      });
      await addScanHistory({
        areaName, listingCount: 0,
        duration: Math.round(crawl.durationMs / 1000),
        status: "failed", createdAt: new Date().toISOString(),
      });
      throw new Error(`No listings found for "${areaName}"`);
    }

    // 4. Process → AreaAnalysis (PRD §12-18)
    onProgress?.("Running analytics engine...", 80);
    const analysis = buildAnalysis(crawl);

    // 5. Persist listings + summary (PRD §38)
    onProgress?.("Saving results...", 90);
    const listingRows = crawl.properties
      .map((p) => toListing(p, areaName))
      .filter((l) => l !== null);
    await replaceListings(areaId, areaName, listingRows as never[]);
    await savePriceSummary(areaId, analysis.summary);
    // Record a snapshot for historical tracking (PRD §40).
    // De-duped per (area, day) inside repository — multiple force-refreshes
    // on the same day update the existing row instead of stacking.
    await recordPriceHistory(areaId, areaName, analysis.summary);

    // 6. Cache full analysis (PRD §31)
    await saveCachedAnalysis(slug, analysis);

    // 7. Complete job + scan history (PRD §32, §37)
    const completedAt = new Date().toISOString();
    await updateCrawlJob(jobId, {
      status: "completed",
      completedAt,
      listingCount: analysis.summary.totalListings,
      duration: analysis.crawlDuration,
    });
    await addScanHistory({
      areaName,
      listingCount: analysis.summary.totalListings,
      duration: analysis.crawlDuration,
      status: "completed",
      createdAt: completedAt,
    });

    onProgress?.("Done!", 100);
    return { analysis, cached: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Crawl failed";
    await updateCrawlJob(jobId, {
      status: "failed",
      completedAt: new Date().toISOString(),
      error: message,
    });
    throw err;
  }
}
