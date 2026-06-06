"use client";

import { useEffect, useState } from "react";
import {
  Radar, Globe2, Database, BarChart3, Sparkles, CheckCircle2,
  Search, Clock, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Crawl stages mapped to icons (matches backend progress) ──────────────────
const STAGES = [
  { key: "init", label: "Initializing", icon: Radar, min: 0 },
  { key: "connect", label: "Connecting", icon: Globe2, min: 12 },
  { key: "fetch", label: "Fetching listings", icon: Search, min: 20 },
  { key: "process", label: "Processing", icon: Database, min: 75 },
  { key: "analyze", label: "Analyzing", icon: BarChart3, min: 80 },
  { key: "done", label: "Done", icon: CheckCircle2, min: 100 },
];

// Rotating "did you know" facts to keep the user engaged while waiting
const FACTS = [
  "Fair Price blends 70% median + 30% average for a balanced benchmark.",
  "We respect SPEEDHOME's robots.txt and crawl politely with delays.",
  "Click any price bar in the chart to instantly filter the listings table.",
  "Compare up to 5 areas side-by-side to spot the best value.",
  "Switch between 9 currencies — the whole dashboard updates live.",
  "Results are cached for 24 hours, so repeat searches are instant.",
  "Price per sqft is the fairest way to compare units of different sizes.",
];

interface CrawlLoaderProps {
  area: string;
  stage: string;
  progress: number;
  queuePosition?: number;
}

export function CrawlLoader({ area, stage, progress, queuePosition = 0 }: CrawlLoaderProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Rotate facts every 4s
  useEffect(() => {
    const t = setInterval(() => setFactIndex((i) => (i + 1) % FACTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const activeStageIdx = STAGES.reduce(
    (acc, s, i) => (progress >= s.min ? i : acc),
    0
  );

  const isQueued = queuePosition > 0;

  return (
    <div className="animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl border border-hairline bg-canvas dark:bg-canvas">
        {/* Animated mesh background */}
        <div className="absolute inset-0 mesh-gradient opacity-60 pointer-events-none" />

        {/* Scanning beam */}
        <div className="absolute inset-x-0 top-0 h-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{ width: "40%", animation: "beam 1.8s ease-in-out infinite" }}
          />
        </div>

        <div className="relative px-5 py-8 md:px-10 md:py-12">
          {/* ── Radar / orbit visual ─────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative w-28 h-28 md:w-32 md:h-32 mb-6">
              {/* Pulsing rings */}
              <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
              <span className="absolute inset-2 rounded-full border-2 border-primary/15 animate-ping" style={{ animationDuration: "2.4s", animationDelay: "0.3s" }} />
              {/* Rotating conic sweep */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,56,92,0.25) 60deg, transparent 120deg)",
                  animation: "spin 1.6s linear infinite",
                }}
              />
              {/* Core */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-[#ff6b85] flex items-center justify-center shadow-lg shadow-primary/30">
                {isQueued
                  ? <Clock className="w-9 h-9 text-white" />
                  : <Radar className="w-9 h-9 text-white animate-pulse" />}
              </div>
            </div>

            {isQueued ? (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-ink mb-1.5">
                  Queued — position #{queuePosition}
                </h3>
                <p className="text-sm text-muted max-w-sm">
                  Crawler slots are busy. Your analysis of{" "}
                  <span className="font-semibold text-ink">{area}</span> will start automatically.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-ink mb-1.5">
                  Analyzing <span className="text-primary">{area}</span>
                </h3>
                <p className="text-sm text-muted max-w-md">{stage}</p>
              </>
            )}

            {/* Elapsed + percent */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1.5 text-muted tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                {elapsed}s elapsed
              </span>
              <span className="w-px h-4 bg-hairline" />
              <span className="font-bold text-primary tabular-nums">{progress}%</span>
            </div>
          </div>

          {/* ── Progress bar ─────────────────────────────────────────────── */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="h-2.5 bg-surface-strong rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-bar relative overflow-hidden"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #ff385c, #ff6b85)",
                }}
              >
                <div className="absolute inset-0 bg-white/30" style={{ animation: "beam 1.2s ease-in-out infinite" }} />
              </div>
            </div>

            {/* Stage steps */}
            <div className="flex justify-between mt-4">
              {STAGES.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === activeStageIdx && !isQueued;
                const isDone = i < activeStageIdx || progress >= 100;
                return (
                  <div key={s.key} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={cn(
                      "w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                      isDone ? "bg-emerald-500 text-white"
                        : isActive ? "bg-primary text-white scale-110 shadow-md shadow-primary/30"
                        : "bg-surface-strong text-muted-soft"
                    )}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" />
                        : isActive ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      "text-[9px] md:text-[10px] font-semibold text-center leading-tight transition-colors",
                      isActive ? "text-primary" : isDone ? "text-emerald-600 dark:text-emerald-400" : "text-muted-soft"
                    )}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Rotating fact ────────────────────────────────────────────── */}
          <div className="max-w-lg mx-auto">
            <div className="flex items-start gap-3 bg-surface-soft dark:bg-surface-strong rounded-2xl px-4 py-3.5 border border-hairline">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">
                  Did you know
                </p>
                <p key={factIndex} className="text-[13px] text-body leading-snug animate-fade-in">
                  {FACTS[factIndex]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes beam {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
