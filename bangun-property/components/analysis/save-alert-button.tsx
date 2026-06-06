"use client";

/**
 * Item 4 — Saved Searches & Email Alerts
 * Lets the user persist a search ("Ping me when 2BR in Bangsar drops below RM2,500")
 * via /api/alerts.
 */

import { useState } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  area: string;
}

export function SaveAlertButton({ area }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaName: area,
          email: email.trim() || undefined,
          maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
          minBedrooms: minBedrooms ? parseInt(minBedrooms, 10) : undefined,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save");
      }
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); }, 1400);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-hairline bg-canvas text-ink text-sm font-semibold hover:bg-surface-soft dark:hover:bg-surface-strong transition-all whitespace-nowrap"
        title="Save search"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden xs:inline">Alert</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
          role="dialog" aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => !busy && setOpen(false)}
          />
          <div
            className="relative w-full md:max-w-md bg-canvas dark:bg-canvas border-t md:border border-hairline rounded-t-3xl md:rounded-3xl shadow-lifted overflow-hidden"
            style={{ animation: "modal-in 0.3s cubic-bezier(0.16,1,0.3,1)" }}
          >
            {/* Drag handle on mobile */}
            <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-hairline" />

            <div className="p-5 md:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">Save this search</h3>
                  <p className="text-xs text-muted mt-1">
                    Get notified about <span className="font-semibold text-ink">{area}</span>
                  </p>
                </div>
                <button
                  onClick={() => !busy && setOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface-soft flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>

              {done ? (
                <div className="py-8 text-center animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-base font-bold text-ink">Saved!</p>
                  <p className="text-xs text-muted mt-1">We&apos;ll keep an eye on it.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="alert-email" className="text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block">
                      Email <span className="text-muted-soft normal-case">(optional)</span>
                    </label>
                    <input
                      id="alert-email"
                      type="email" placeholder="you@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3 border border-hairline rounded-lg bg-canvas dark:bg-canvas text-ink text-sm focus:outline-none focus:border-border-strong"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="alert-max" className="text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block">
                        Max RM
                      </label>
                      <input
                        id="alert-max"
                        type="number" inputMode="numeric" placeholder="2500"
                        value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full h-10 px-3 border border-hairline rounded-lg bg-canvas dark:bg-canvas text-ink text-sm focus:outline-none focus:border-border-strong tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="alert-bed" className="text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block">
                        Min Bed
                      </label>
                      <input
                        id="alert-bed"
                        type="number" inputMode="numeric" placeholder="2" min={0} max={5}
                        value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)}
                        className="w-full h-10 px-3 border border-hairline rounded-lg bg-canvas dark:bg-canvas text-ink text-sm focus:outline-none focus:border-border-strong tabular-nums"
                      />
                    </div>
                  </div>

                  {err && (
                    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{err}</p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 h-10 rounded-xl border border-hairline text-ink text-sm font-semibold hover:bg-surface-soft transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submit}
                      disabled={busy}
                      className={cn(
                        "flex-1 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-active transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60",
                      )}
                    >
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                      {busy ? "Saving..." : "Save alert"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes modal-in {
              from { opacity: 0; transform: translateY(40px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
