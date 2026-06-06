import { AreaAnalysis } from "@/types";
import { areaToSlug, slugToAreaName } from "@/lib/crawler/speedhome";
import { analyzeArea } from "@/lib/services/analysis-service";

// ─── Job model ────────────────────────────────────────────────────────────────

export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface Job {
  id: string;
  slug: string;
  area: string;
  status: JobStatus;
  stage: string;
  progress: number;          // 0-100
  cached: boolean;
  analysis: AreaAnalysis | null;
  error: string | null;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
}

// ─── In-memory queue + worker pool ────────────────────────────────────────────
//
// PRD §10/§37: a real queue with running/queued states and a concurrency cap.
// Jobs run in the background; clients poll /api/jobs/:id for progress.

const MAX_CONCURRENT_JOBS = Number(process.env.CRAWLER_MAX_CONCURRENCY ?? 3);
const JOB_TTL_MS = 10 * 60 * 1000; // keep finished jobs 10 min for polling

// Store queue state on globalThis so it's shared across separately-bundled
// route handlers (/api/jobs POST and /api/jobs/[id] GET) and survives HMR.
interface QueueState {
  jobs: Map<string, Job>;
  pending: string[];
  bySlug: Map<string, string>;
  runningCount: number;
}

const g = globalThis as unknown as { __bangunQueue?: QueueState };
if (!g.__bangunQueue) {
  g.__bangunQueue = {
    jobs: new Map(),
    pending: [],
    bySlug: new Map(),
    runningCount: 0,
  };
}
const state = g.__bangunQueue;

const jobs = state.jobs;
const pending = state.pending;
const bySlug = state.bySlug;

function uid(): string {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cleanupOld() {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (job.finishedAt && now - job.finishedAt > JOB_TTL_MS) {
      jobs.delete(id);
      if (bySlug.get(job.slug) === id) bySlug.delete(job.slug);
    }
  }
}

/**
 * Enqueue a crawl. If an identical area is already queued/running and not
 * force-refresh, returns the existing job (dedupe).
 */
export function enqueueAnalysis(input: string, opts: { force?: boolean } = {}): Job {
  cleanupOld();
  const slug = areaToSlug(input);
  const area = slugToAreaName(slug);

  // Dedupe active jobs for same slug
  const existingId = bySlug.get(slug);
  if (existingId && !opts.force) {
    const existing = jobs.get(existingId);
    if (existing && (existing.status === "queued" || existing.status === "running")) {
      return existing;
    }
  }

  const job: Job = {
    id: uid(),
    slug,
    area,
    status: "queued",
    stage: "Queued — waiting for a crawler slot...",
    progress: 0,
    cached: false,
    analysis: null,
    error: null,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
  };

  jobs.set(job.id, job);
  bySlug.set(slug, job.id);
  pending.push(job.id);

  // Kick the scheduler (non-blocking)
  void schedule(input, opts.force ?? false, job.id);

  return job;
}

export function getJob(id: string): Job | null {
  return jobs.get(id) ?? null;
}

export function listActiveJobs(): Job[] {
  return [...jobs.values()].filter((j) => j.status === "queued" || j.status === "running");
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

async function schedule(input: string, force: boolean, jobId: string) {
  // Wait for a free slot
  while (state.runningCount >= MAX_CONCURRENT_JOBS) {
    await new Promise((r) => setTimeout(r, 300));
    if (!jobs.has(jobId)) return;
  }

  const idx = pending.indexOf(jobId);
  if (idx !== -1) pending.splice(idx, 1);

  state.runningCount++;
  try {
    await runJob(input, force, jobId);
  } finally {
    state.runningCount--;
  }
}

async function runJob(input: string, force: boolean, jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return;

  const update = (patch: Partial<Job>) => {
    const cur = jobs.get(jobId);
    if (cur) jobs.set(jobId, { ...cur, ...patch });
  };

  update({ status: "running", startedAt: Date.now(), stage: "Initializing crawler...", progress: 5 });

  try {
    // Delegate the full pipeline (cache → crawl → process → persist) to the
    // shared analyzeArea — keeps this file in sync with /api/analyze.
    const { analysis, cached } = await analyzeArea(input, {
      forceRefresh: force,
      onProgress: (stage, pct) => update({ stage, progress: pct }),
    });

    update({
      status: "completed",
      stage: cached ? "Loaded from cache" : "Done!",
      progress: 100,
      cached,
      analysis,
      finishedAt: Date.now(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Crawl failed";
    console.error(`[job-queue] Job ${jobId} (${job.area}) failed:`, message);
    update({ status: "failed", stage: "Failed", error: message, finishedAt: Date.now() });
  } finally {
    // Allow re-queue of same slug later
    if (bySlug.get(job.slug) === jobId) {
      const cur = jobs.get(jobId);
      if (cur && (cur.status === "completed" || cur.status === "failed")) {
        bySlug.delete(job.slug);
      }
    }
  }
}

// Serialisable view for API responses
export function jobToDTO(job: Job) {
  return {
    id: job.id,
    area: job.area,
    slug: job.slug,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    cached: job.cached,
    error: job.error,
    analysis: job.status === "completed" ? job.analysis : null,
    queuePosition: job.status === "queued" ? pending.indexOf(job.id) + 1 : 0,
  };
}
