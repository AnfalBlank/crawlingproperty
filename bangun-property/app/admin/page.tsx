"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart3, Bot, Database, RefreshCw, Trash2, Play, Clock,
  TrendingUp, Globe, CheckCircle2, Loader2, Activity, Lock, LogOut, ShieldCheck,
} from "lucide-react";
import { cn, formatDateTime, formatDuration, formatNumber } from "@/lib/utils";
import { CrawlJob, ScanHistory, AdminStats, ExchangeRate } from "@/types";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CrawlStatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const POPULAR_AREAS = ["Mont Kiara", "KLCC", "Bangsar", "Petaling Jaya", "Subang Jaya", "Damansara", "Cheras", "Puchong"];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, sub, loading }: {
  label: string; value: string | number; icon: React.ReactNode; sub?: string; loading?: boolean;
}) {
  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5">
      <div className="w-9 h-9 rounded-lg bg-surface-strong dark:bg-surface-strong flex items-center justify-center text-muted mb-3">
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-1">{label}</p>
      {loading ? <Skeleton className="h-7 w-20 rounded" /> : <p className="text-[22px] font-bold text-ink">{value}</p>}
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

function CrawlJobRow({ job }: { job: CrawlJob }) {
  const isRunning = job.status === "running";
  return (
    <tr className="border-b border-hairline-soft hover:bg-surface-soft/40 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {isRunning && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />}
          <span className="text-sm font-medium text-ink">{job.areaName}</span>
        </div>
      </td>
      <td className="px-4 py-3"><CrawlStatusBadge status={job.status} /></td>
      <td className="px-4 py-3 text-sm text-muted">{job.startedAt ? formatDateTime(job.startedAt) : "—"}</td>
      <td className="px-4 py-3 text-sm text-muted">{job.completedAt ? formatDateTime(job.completedAt) : "—"}</td>
      <td className="px-4 py-3 text-sm text-muted">{job.listingCount ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-muted">
        {job.error ? <span className="text-primary-error text-xs">{job.error}</span>
          : job.duration ? formatDuration(job.duration) : "—"}
      </td>
    </tr>
  );
}

function HistoryRow({ item, onRerun, onDelete }: {
  item: ScanHistory; onRerun: () => void; onDelete: () => void;
}) {
  return (
    <tr className="border-b border-hairline-soft hover:bg-surface-soft/40 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-ink">{item.areaName}</td>
      <td className="px-4 py-3"><CrawlStatusBadge status={item.status} /></td>
      <td className="px-4 py-3 text-sm text-muted">{item.listingCount}</td>
      <td className="px-4 py-3 text-sm text-muted">{formatDuration(item.duration)}</td>
      <td className="px-4 py-3 text-sm text-muted">{formatDateTime(item.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onRerun} className="flex items-center gap-1 text-xs font-medium text-ink hover:text-primary transition-colors">
            <Play className="w-3 h-3" /> Re-run
          </button>
          <button onClick={onDelete} className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageInner />
    </Suspense>
  );
}

function AdminPageInner() {
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<(AdminStats & { cache?: { cachedAreas: number; sizeKb: number } }) | null>(null);
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin auth (PRD §4)
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [newCrawlArea, setNewCrawlArea] = useState("");
  const [activeTab, setActiveTab] = useState<"monitor" | "history" | "cache" | "rates">("monitor");
  const [toast, setToast] = useState<string | null>(null);

  // Honour ?tab= query param from footer/deep links (reactive to navigation changes)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "monitor" || tab === "history" || tab === "cache" || tab === "rates") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, j, h, r] = await Promise.all([
        fetch("/api/admin?type=stats").then((x) => x.json()),
        fetch("/api/admin?type=jobs").then((x) => x.json()),
        fetch("/api/admin?type=history").then((x) => x.json()),
        fetch("/api/admin?type=rates").then((x) => x.json()),
      ]);
      setStats(s);
      setJobs(Array.isArray(j) ? j : []);
      setHistory(Array.isArray(h) ? h : []);
      setRates(Array.isArray(r) ? r : []);
    } catch {
      showToast("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Auto-refresh while a crawl is running so the table reflects state quickly.
  useEffect(() => {
    if (!stats || stats.activeCrawls === 0) return;
    const id = setInterval(loadAll, 5000);
    return () => clearInterval(id);
  }, [stats, loadAll]);

  // Check auth status on mount (PRD §4)
  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => { setAuthed(!!d.authed); setAuthChecked(true); })
      .catch(() => { setAuthed(false); setAuthChecked(true); });
  }, []);

  const handleLogin = async () => {
    setLoggingIn(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput }),
      });
      if (res.ok) {
        setAuthed(true);
        setTokenInput("");
      } else {
        const e = await res.json().catch(() => ({}));
        setAuthError(e.error || "Invalid token");
      }
    } catch {
      setAuthError("Login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  };

  const handleStartCrawl = async () => {
    if (!newCrawlArea.trim()) return;
    setCrawling(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start-crawl", area: newCrawlArea }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Crawl queued for ${data.job?.area || newCrawlArea}`);
        setNewCrawlArea("");
        // Poll a few times to reflect the new job
        setTimeout(loadAll, 1500);
        setTimeout(loadAll, 6000);
      } else {
        showToast(data.error || "Crawl failed");
      }
    } catch {
      showToast("Crawl request failed");
    } finally {
      setCrawling(false);
    }
  };

  const handleRefreshRates = async () => {
    setRefreshingRates(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh-rates" }),
      });
      const data = await res.json();
      if (res.ok && data.rates) { setRates(data.rates); showToast("Exchange rates refreshed"); }
    } catch { showToast("Refresh failed"); }
    finally { setRefreshingRates(false); }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-cache" }),
      });
      if (res.ok) { showToast("Cache cleared"); await loadAll(); }
    } catch { showToast("Clear cache failed"); }
    finally { setClearingCache(false); }
  };

  const handleDeleteHistory = async (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    await fetch("/api/admin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-history", historyId: id }),
    });
  };

  const handleRerun = async (area: string) => {
    setNewCrawlArea(area);
    setActiveTab("monitor");
    showToast(`Switch to Monitor and click Start to re-crawl ${area}`);
  };

  const TABS = [
    { id: "monitor", label: "Crawler Monitor", icon: Bot },
    { id: "history", label: "Scan History", icon: Clock },
    { id: "cache", label: "Cache Manager", icon: Database },
    { id: "rates", label: "Exchange Rates", icon: Globe },
  ] as const;

  // ─── Login gate (PRD §4) ────────────────────────────────────────────────
  if (authChecked && !authed) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas page-bg">
        <Navbar />
        <div className="max-w-md mx-auto px-5" style={{ paddingTop: "calc(68px + 60px)" }}>
          <div className="bg-canvas dark:bg-canvas border border-hairline rounded-3xl p-8 text-center shadow-card">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2 tracking-tight">Admin Access</h1>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              This area is restricted. Enter your admin token to manage crawlers,
              cache, and exchange rates.
            </p>
            <div className="space-y-3">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && tokenInput && handleLogin()}
                placeholder="Admin token"
                autoFocus
                className="w-full h-12 px-4 border border-hairline rounded-xl text-sm text-ink bg-canvas dark:bg-canvas focus:outline-none focus:border-primary transition-colors text-center"
              />
              {authError && (
                <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
              )}
              <button
                onClick={handleLogin}
                disabled={!tokenInput || loggingIn}
                className="w-full h-12 bg-primary text-white rounded-xl font-semibold hover:bg-primary-active disabled:opacity-50 transition-colors flex items-center justify-center gap-2 btn-lift"
              >
                {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Unlock Admin
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Loading auth check
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas page-bg">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas page-bg">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-white px-5 py-3 rounded-xl shadow-lifted text-sm font-medium animate-fade-in-up">
          {toast}
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 pb-8" style={{ paddingTop: "calc(68px + 24px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink mb-1 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted">Monitor crawlers, manage cache, and configure exchange rates.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="hidden sm:flex items-center gap-1.5 h-10 px-4 rounded-xl border border-hairline bg-canvas text-ink text-sm font-semibold hover:bg-surface-soft transition-all"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Reload
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-hairline bg-canvas text-muted hover:text-primary hover:border-primary/30 text-sm font-semibold transition-all"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Areas" value={stats?.totalAreas ?? 0} loading={loading} icon={<BarChart3 className="w-4 h-4" />} sub="Tracked areas" />
          <StatCard label="Total Listings" value={formatNumber(stats?.totalListings ?? 0)} loading={loading} icon={<TrendingUp className="w-4 h-4" />} sub="Across all areas" />
          <StatCard label="Total Crawls" value={stats?.totalCrawls ?? 0} loading={loading} icon={<Activity className="w-4 h-4" />} sub="Lifetime" />
          <StatCard label="Cache Hit Ratio" value={`${stats?.cacheHitRatio ?? 0}%`} loading={loading} icon={<Database className="w-4 h-4" />} sub="Cached / crawls" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-hairline mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors relative",
                activeTab === id
                  ? "text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted hover:text-ink"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === "monitor" && (stats?.activeCrawls ?? 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Monitor */}
        {activeTab === "monitor" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5">
              <h3 className="text-[15px] font-semibold text-ink mb-1">Start New Crawl</h3>
              <p className="text-xs text-muted mb-3">Live crawl from SPEEDHOME. Takes ~10-30s per area.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={newCrawlArea}
                  onChange={(e) => setNewCrawlArea(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !crawling && handleStartCrawl()}
                  placeholder="Enter area name (e.g. Mont Kiara)..."
                  list="admin-areas"
                  disabled={crawling}
                  className="flex-1 h-10 px-3 border border-hairline rounded-lg text-sm text-ink focus:outline-none focus:border-border-strong bg-canvas dark:bg-canvas disabled:opacity-60"
                />
                <datalist id="admin-areas">
                  {POPULAR_AREAS.map((a) => <option key={a} value={a} />)}
                </datalist>
                <button
                  onClick={handleStartCrawl}
                  disabled={!newCrawlArea.trim() || crawling}
                  className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  {crawling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {crawling ? "Crawling..." : "Start Crawl"}
                </button>
              </div>
            </div>

            <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-hairline bg-surface-soft/40 dark:bg-surface-strong/30 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-ink">Active & Recent Jobs</h3>
                <div className="text-xs text-muted">
                  {jobs.filter((j) => j.status === "running").length} running ·{" "}
                  {jobs.filter((j) => j.status === "queued").length} queued
                </div>
              </div>
              <div className="table-container">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-hairline">
                      {["Area", "Status", "Started", "Completed", "Listings", "Duration / Error"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => <CrawlJobRow key={job.id} job={job} />)}
                  </tbody>
                </table>
              </div>
              {!loading && jobs.length === 0 && (
                <div className="text-center py-12 text-muted text-sm">No crawl jobs yet. Start one above.</div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="animate-fade-in">
            <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-hairline bg-surface-soft/40 dark:bg-surface-strong/30">
                <h3 className="text-[14px] font-semibold text-ink">Scan History</h3>
              </div>
              <div className="table-container">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-hairline">
                      {["Area", "Status", "Listings", "Duration", "Date", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <HistoryRow key={item.id} item={item}
                        onRerun={() => handleRerun(item.areaName)}
                        onDelete={() => handleDeleteHistory(item.id)} />
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && history.length === 0 && (
                <div className="text-center py-12 text-muted text-sm">No scan history found</div>
              )}
            </div>
          </div>
        )}

        {/* Cache */}
        {activeTab === "cache" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-[15px] font-semibold text-ink mb-1">Cache Manager</h3>
                  <p className="text-sm text-muted">Cache duration: 24 hours (PRD §31)</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={loadAll}
                    className="flex items-center gap-1.5 h-9 px-3 border border-hairline rounded-lg text-[13px] font-medium text-ink hover:bg-surface-soft dark:hover:bg-surface-strong transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                  <button onClick={handleClearCache} disabled={clearingCache}
                    className="flex items-center gap-1.5 h-9 px-3 border border-primary/30 bg-primary/5 dark:bg-primary/10 rounded-lg text-[13px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                    {clearingCache ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Hit Ratio", value: `${stats?.cacheHitRatio ?? 0}%`, Icon: CheckCircle2 },
                  { label: "Cached Areas", value: String(stats?.cache?.cachedAreas ?? 0), Icon: Database },
                  { label: "Cache Size", value: `${stats?.cache?.sizeKb ?? 0} KB`, Icon: Activity },
                  { label: "Total Listings", value: formatNumber(stats?.totalListings ?? 0), Icon: TrendingUp },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="bg-surface-soft dark:bg-surface-strong rounded-xl p-4 text-center border border-hairline">
                    <div className="w-8 h-8 rounded-lg bg-canvas border border-hairline flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-4 h-4 text-muted" />
                    </div>
                    <div className="text-lg font-bold text-ink">{value}</div>
                    <div className="text-xs text-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rates */}
        {activeTab === "rates" && (
          <div className="animate-fade-in">
            <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-hairline bg-surface-soft/40 dark:bg-surface-strong/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-semibold text-ink">Exchange Rates</h3>
                  <p className="text-xs text-muted mt-0.5">Source: Frankfurter API · Base MYR · 24h refresh</p>
                </div>
                <button onClick={handleRefreshRates} disabled={refreshingRates}
                  className="self-start sm:self-auto flex items-center gap-1.5 h-9 px-4 border border-hairline rounded-lg text-sm font-medium text-ink hover:bg-surface-soft transition-colors disabled:opacity-50">
                  <RefreshCw className={cn("w-3.5 h-3.5", refreshingRates && "animate-spin")} />
                  Refresh Rates
                </button>
              </div>
              <div className="table-container">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-hairline">
                      {["Currency", "Rate (vs MYR)", "Last Updated", "Status"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((r) => (
                      <tr key={r.currency} className="border-b border-hairline-soft hover:bg-surface-soft/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-ink">{r.currency}</td>
                        <td className="px-4 py-3 text-ink font-mono tabular-nums">{r.currency === "MYR" ? "1.000000" : r.rate.toFixed(6)}</td>
                        <td className="px-4 py-3 text-muted text-sm">{formatDateTime(r.updatedAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs text-emerald-600 font-medium">Active</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && rates.length === 0 && (
                <div className="text-center py-12 text-muted text-sm">No rates loaded. Click Refresh.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
