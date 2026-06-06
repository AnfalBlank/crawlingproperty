import { chromium, type Browser, type BrowserContext } from "playwright";

// ─── Browser pool with idle auto-close + context concurrency (PRD §10) ────────
//
// - One shared headless Chromium, launched lazily.
// - A semaphore caps simultaneous browser contexts at MAX_CONCURRENCY (3 tabs).
// - The browser auto-closes after IDLE_MS with no active contexts to free RAM.

const MAX_CONCURRENCY = Number(process.env.CRAWLER_MAX_CONCURRENCY ?? 3);
const IDLE_MS = 60_000; // close browser after 60s idle

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let browser: Browser | null = null;
let launching: Promise<Browser> | null = null;
let activeContexts = 0;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Semaphore ────────────────────────────────────────────────────────────────
let available = MAX_CONCURRENCY;
const waiters: (() => void)[] = [];

function acquire(): Promise<void> {
  if (available > 0) {
    available--;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiters.push(resolve));
}

function release() {
  available++;
  const next = waiters.shift();
  if (next) {
    available--;
    next();
  }
}

// ─── Browser lifecycle ────────────────────────────────────────────────────────

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function scheduleIdleClose() {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    if (activeContexts === 0 && browser) {
      browser.close().catch(() => {});
      browser = null;
    }
  }, IDLE_MS);
}

async function getBrowser(): Promise<Browser> {
  clearIdleTimer();
  if (browser && browser.isConnected()) return browser;
  if (launching) return launching;

  launching = chromium
    .launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
      ],
    })
    .then((b) => {
      browser = b;
      launching = null;
      // If the browser dies unexpectedly, reset state
      b.on("disconnected", () => {
        browser = null;
      });
      return b;
    })
    .catch((e) => {
      launching = null;
      throw e;
    });

  return launching;
}

/**
 * Run a callback with a fresh BrowserContext, respecting the concurrency cap.
 * The context is always closed; the browser auto-closes when idle.
 */
export async function withContext<T>(fn: (ctx: BrowserContext) => Promise<T>): Promise<T> {
  await acquire();
  activeContexts++;
  clearIdleTimer();

  let context: BrowserContext | null = null;
  try {
    const b = await getBrowser();
    context = await b.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1366, height: 900 },
      locale: "en-US",
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    });
    return await fn(context);
  } finally {
    if (context) await context.close().catch(() => {});
    activeContexts--;
    release();
    if (activeContexts === 0) scheduleIdleClose();
  }
}

/** Force-close the browser (e.g. on graceful shutdown). */
export async function closeBrowser() {
  clearIdleTimer();
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}

export function poolStats() {
  return { activeContexts, available, maxConcurrency: MAX_CONCURRENCY, browserUp: !!browser };
}
