"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X, ChevronLeft, ChevronRight, MapPin, BedDouble, Bath, Maximize2,
  Sofa, Car, ExternalLink, Sparkles, Copy, Check, Building2,
} from "lucide-react";
import { cn, formatCurrency, formatNumber, toPeriod, periodSuffix } from "@/lib/utils";
import { Listing, PriceSummary } from "@/types";
import { useAppStore } from "@/store/app-store";
import { FairPriceBadge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";

// ── Mini map (Leaflet) — lazy loaded to avoid SSR issues ────────────────────
const ListingMiniMap = dynamic(() => import("./listing-mini-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-44 md:h-56 rounded-xl bg-surface-strong skeleton" />
  ),
});

interface ListingModalProps {
  listing: Listing | null;
  summary?: PriceSummary;
  onClose: () => void;
}

export function ListingModal({ listing, summary, onClose }: ListingModalProps) {
  const { currency, getRate, rentalPeriod, lang } = useAppStore();
  const rate = getRate();
  const T = (k: Parameters<typeof t>[1]) => t(lang, k);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portal target only available on client
  useEffect(() => { setMounted(true); }, []);

  // Reset gallery on listing change
  useEffect(() => { setPhotoIdx(0); }, [listing?.id]);

  // Lock body scroll + add a body class so navbar can hide if needed
  useEffect(() => {
    if (!listing) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = orig;
      document.body.classList.remove("modal-open");
    };
  }, [listing]);

  // Keyboard: ESC + arrow nav
  useEffect(() => {
    if (!listing) return;
    const total = listing.images?.length ?? 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (total > 0) {
        if (e.key === "ArrowRight") setPhotoIdx((i) => (i + 1) % total);
        if (e.key === "ArrowLeft")  setPhotoIdx((i) => (i - 1 + total) % total);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listing, onClose]);

  if (!mounted || !listing) return null;

  const images = listing.images?.length ? listing.images : [];
  const monthly = listing.monthlyRent ?? 0;
  const periodPrice = toPeriod(monthly, rentalPeriod);

  // vs market
  const fair = summary?.fairPrice;
  const diff = fair ? ((monthly - fair) / fair) * 100 : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(listing.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Render via portal to document.body so the modal escapes any parent
  // stacking context (navbar fixed @ z-50 won't cover it).
  const modal = (
    <div
      className="fixed inset-0 z-[2147483600] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet/Modal — height-limited to leave room around safe areas */}
      <div
        className={cn(
          "relative w-full md:max-w-4xl bg-canvas dark:bg-canvas",
          "border-t md:border border-hairline rounded-t-3xl md:rounded-3xl",
          "overflow-hidden shadow-lifted flex flex-col",
          "h-[92dvh] md:h-auto md:max-h-[88vh]"
        )}
        style={{
          animation: "modal-in 0.32s cubic-bezier(0.16,1,0.3,1)",
          // Avoid being eaten by mobile address bar / iOS notch
          marginBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Drag handle on mobile */}
        <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-hairline z-30" aria-hidden="true" />

        {/* Close button — always above gallery */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-canvas/95 dark:bg-canvas/95 backdrop-blur-md border border-hairline flex items-center justify-center hover:bg-surface-soft transition-colors shadow-md"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-ink" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 overscroll-contain">

          {/* ── Photo gallery ──────────────────────────────────────────── */}
          {images.length > 0 ? (
            <div className="relative w-full h-56 sm:h-64 md:h-80 bg-surface-strong">
              <Image
                src={images[photoIdx]}
                alt={`${listing.propertyName} photo ${photoIdx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                unoptimized
              />
              {/* Gradient bottom for text legibility */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIdx((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-canvas/85 hover:bg-canvas backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 z-10"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5 text-ink" />
                  </button>
                  <button
                    onClick={() => setPhotoIdx((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-canvas/85 hover:bg-canvas backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 z-10"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5 text-ink" />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        className={cn(
                          "rounded-full transition-all",
                          i === photoIdx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50"
                        )}
                        aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                  {/* Counter */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10">
                    {photoIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-40 sm:h-48 bg-surface-strong flex items-center justify-center">
              <Building2 className="w-12 h-12 text-muted-soft" />
            </div>
          )}

          {/* ── Body ───────────────────────────────────────────────────── */}
          <div className="p-4 sm:p-5 md:p-7 space-y-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 id="listing-modal-title" className="text-lg sm:text-xl md:text-2xl font-bold text-ink leading-tight tracking-tight">
                  {listing.title}
                </h2>
                <p className="text-sm text-muted mt-1 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                  <span className="line-clamp-2">{listing.address || `${listing.area}, Kuala Lumpur`}</span>
                </p>
              </div>
              {listing.fairPriceStatus && <FairPriceBadge status={listing.fairPriceStatus} />}
            </div>

            {/* Price block */}
            <div className="bg-gradient-to-br from-rose-50 to-canvas dark:from-rose-950/20 dark:to-canvas border border-primary/15 rounded-2xl p-4 md:p-5">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{T("modal.askingRent")}</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary tabular-nums leading-none">
                    {formatCurrency(periodPrice, currency, rate)}
                    <span className="text-sm text-muted font-normal ml-1">{periodSuffix(rentalPeriod)}</span>
                  </p>
                  <p className="text-xs text-muted mt-2">
                    {formatCurrency(listing.pricePerSqft, currency, rate)} / ft²
                  </p>
                </div>
                {fair && monthly > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{T("modal.vsFair")}</p>
                    <p className={cn(
                      "text-base sm:text-lg font-bold tabular-nums",
                      diff > 5 ? "text-red-600 dark:text-red-400"
                      : diff < -5 ? "text-emerald-600 dark:text-emerald-400"
                      : "text-ink"
                    )}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted mt-1">vs {formatCurrency(toPeriod(fair, rentalPeriod), currency, rate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Meta chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { Icon: BedDouble, label: listing.bedrooms === "Studio" ? "Studio" : `${listing.bedrooms} ${T("modal.bed")}` },
                { Icon: Bath, label: `${listing.bathrooms} ${T("modal.bath")}` },
                { Icon: Maximize2, label: `${formatNumber(listing.sqft)} ft²` },
                { Icon: Sofa, label: listing.furnishing },
                ...(listing.carpark != null ? [{ Icon: Car, label: `${listing.carpark} ${T("modal.carpark")}` }] : []),
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-surface-soft dark:bg-surface-strong rounded-xl px-3 py-2.5">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-[13px] font-semibold text-ink truncate">{label}</span>
                </div>
              ))}
            </div>

            {/* Map (PRD §33) */}
            {listing.latitude && listing.longitude && (
              <div>
                <h3 className="text-sm font-bold text-ink mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" /> {T("modal.location")}
                </h3>
                <ListingMiniMap
                  lat={listing.latitude}
                  lng={listing.longitude}
                  title={listing.propertyName}
                />
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div>
                <h3 className="text-sm font-bold text-ink mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> {T("modal.about")}
                </h3>
                <p className="text-sm text-body whitespace-pre-line leading-relaxed line-clamp-[10]">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Facilities */}
            {listing.facilities && listing.facilities.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-ink mb-2">{T("modal.facilities")}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {listing.facilities.map((f) => (
                    <span key={f} className="text-[12px] font-medium text-ink bg-surface-soft dark:bg-surface-strong px-2.5 py-1 rounded-full border border-hairline capitalize">
                      {f.replace(/[_-]/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Furnishes */}
            {listing.furnishes && listing.furnishes.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-ink mb-2">{T("modal.furnishings")}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {listing.furnishes.map((f) => (
                    <span key={f} className="text-[12px] font-medium text-muted bg-surface-soft dark:bg-surface-strong px-2.5 py-1 rounded-full capitalize">
                      {f.replace(/[_-]/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky CTA footer */}
        <div className="border-t border-hairline bg-canvas dark:bg-canvas px-4 sm:px-5 md:px-7 py-3 md:py-4 flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="h-11 px-4 rounded-xl border border-hairline text-sm font-semibold text-ink hover:bg-surface-soft dark:hover:bg-surface-strong transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? T("modal.copied") : T("modal.copyLink")}</span>
          </button>
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary-active text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors btn-lift"
          >
            {T("modal.viewSh")} <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
