"use client";

import { useState, useMemo } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn, formatCurrency, formatNumber, toPeriod, periodSuffix } from "@/lib/utils";
import { Listing, PriceSummary } from "@/types";
import { useAppStore } from "@/store/app-store";
import { FairPriceBadge, Badge } from "@/components/ui/badge";
import { ListingModal } from "./listing-modal";
import { t } from "@/lib/i18n";

interface ListingsTableProps {
  listings: Listing[];
  summary?: PriceSummary;
}

type SortKey = keyof Pick<
  Listing,
  "title" | "bedrooms" | "bathrooms" | "monthlyRent" | "sqft" | "pricePerSqft" | "furnishing"
>;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      title="Copy link"
      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-soft transition-colors"
      aria-label="Copy listing URL"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-emerald-600" />
        : <Copy className="w-3.5 h-3.5 text-muted" />}
    </button>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted" />;
  return dir === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 text-ink" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-ink" />
  );
}

export function ListingsTable({ listings, summary }: ListingsTableProps) {
  const { currency, getRate, filters, activePriceBucket, rentalPeriod, lang } = useAppStore();
  const rate = getRate();
  const T = (k: Parameters<typeof t>[1]) => t(lang, k);
  const sfx = periodSuffix(rentalPeriod);
  const periodLabel = rentalPeriod === "daily" ? T("period.daily") : rentalPeriod === "yearly" ? T("period.yearly") : T("period.monthly");

  // Period-aware formatter — converts a stored monthly rent to the active period.
  const fmtPeriod = (monthly: number | null) =>
    monthly !== null ? formatCurrency(toPeriod(monthly, rentalPeriod), currency, rate) : "N/A";

  const [sortKey, setSortKey] = useState<SortKey>("monthlyRent");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [visibleCols, setVisibleCols] = useState({
    yearlyRent: false,
    dailyRent: false,
    bathrooms: true,
    sqft: true,
    pricePerSqft: true,
    furnishing: true,
    url: true,
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let data = [...listings];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.propertyName.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q)
      );
    }

    // Bedroom filter
    if (filters.bedrooms.length > 0) {
      data = data.filter((l) => {
        const b = l.bedrooms === "Studio" ? "Studio" : String(l.bedrooms);
        const b4plus = typeof l.bedrooms === "number" && l.bedrooms >= 4 ? "4+" : null;
        return (
          filters.bedrooms.includes(b) ||
          (b4plus && filters.bedrooms.includes(b4plus))
        );
      });
    }

    // Furnishing filter
    if (filters.furnishing.length > 0) {
      data = data.filter((l) => filters.furnishing.includes(l.furnishing));
    }

    // Price filter
    if (filters.priceMin !== null) {
      data = data.filter((l) => l.monthlyRent !== null && l.monthlyRent >= filters.priceMin!);
    }
    if (filters.priceMax !== null) {
      data = data.filter((l) => l.monthlyRent !== null && l.monthlyRent <= filters.priceMax!);
    }

    // Sqft filter
    if (filters.sqftMin !== null) data = data.filter((l) => l.sqft >= filters.sqftMin!);
    if (filters.sqftMax !== null) data = data.filter((l) => l.sqft <= filters.sqftMax!);

    // Price-per-sqft filter (PRD §24)
    if (filters.pricePerSqftMin !== null) data = data.filter((l) => l.pricePerSqft >= filters.pricePerSqftMin!);
    if (filters.pricePerSqftMax !== null) data = data.filter((l) => l.pricePerSqft <= filters.pricePerSqftMax!);

    // Bathrooms filter (PRD §24)
    if (filters.bathrooms.length > 0) {
      data = data.filter((l) => {
        const b = String(l.bathrooms);
        const b3plus = l.bathrooms >= 3 ? "3+" : null;
        return filters.bathrooms.includes(b) || (b3plus && filters.bathrooms.includes(b3plus));
      });
    }

    // Price bucket filter
    if (activePriceBucket) {
      if (activePriceBucket === "RM3,500+") {
        data = data.filter((l) => l.monthlyRent !== null && l.monthlyRent >= 3500);
      } else if (activePriceBucket === "< RM1,500") {
        data = data.filter((l) => l.monthlyRent !== null && l.monthlyRent < 1500);
      } else {
        const match = activePriceBucket.match(/RM([\d,]+)–([\d,]+)/);
        if (match) {
          const min = parseInt(match[1].replace(/,/g, ""));
          const max = parseInt(match[2].replace(/,/g, ""));
          data = data.filter(
            (l) => l.monthlyRent !== null && l.monthlyRent >= min && l.monthlyRent < max
          );
        }
      }
    }

    // Sort
    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = typeof aVal === "string" ? aVal.localeCompare(String(bVal)) : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [listings, filters, sortKey, sortDir, activePriceBucket]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fmt = (n: number | null) =>
    n !== null ? formatCurrency(n, currency, rate) : "N/A";

  const ColHeader = ({ label, sortable, colKey, className }: {
    label: string;
    sortable?: boolean;
    colKey?: SortKey;
    className?: string;
  }) => (
    <th
      className={cn(
        "px-3 py-3 text-left text-xs font-bold text-muted uppercase tracking-widest whitespace-nowrap border-b border-hairline",
        sortable && "cursor-pointer hover:text-ink select-none",
        className
      )}
      onClick={sortable && colKey ? () => handleSort(colKey) : undefined}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortable && colKey && <SortIcon active={sortKey === colKey} dir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div className="bg-canvas dark:bg-canvas border border-hairline rounded-xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-hairline bg-surface-soft/50 dark:bg-surface-strong/30">
        <p className="text-sm font-medium text-ink shrink-0">
          {formatNumber(filtered.length)} {T("table.listings")}
          {filtered.length !== listings.length && (
            <span className="text-muted ml-1 text-xs">({T("table.filteredFrom")} {formatNumber(listings.length)})</span>
          )}
        </p>
        {/* Column visibility toggles — hidden on mobile (card view used instead) */}
        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
          {Object.entries(visibleCols).map(([key, visible]) => (
            <button
              key={key}
              onClick={() => setVisibleCols((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full border transition-all whitespace-nowrap",
                visible
                  ? "bg-ink text-white border-ink"
                  : "bg-canvas text-muted border-hairline hover:border-border-strong"
              )}
            >
              {key === "yearlyRent" ? "Yearly" : key === "dailyRent" ? "Daily" :
               key === "pricePerSqft" ? "PSF" : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile card list (PRD §36 — card based listing) ─────────────────── */}
      <div className="md:hidden divide-y divide-hairline-soft">
        {paginated.map((listing) => (
          <div
            key={listing.id}
            onClick={() => setSelectedListing(listing)}
            className="p-4 cursor-pointer active:bg-surface-soft transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink text-sm leading-snug line-clamp-2">{listing.title}</p>
                <p className="text-xs text-muted mt-0.5 truncate">{listing.propertyName}</p>
              </div>
              {listing.fairPriceStatus && <FairPriceBadge status={listing.fairPriceStatus} />}
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge variant="muted">{listing.bedrooms === "Studio" ? "Studio" : `${listing.bedrooms}BR`}</Badge>
              <Badge variant="muted">{listing.bathrooms} Bath</Badge>
              <Badge variant="muted">{formatNumber(listing.sqft)} ft²</Badge>
              <Badge variant={
                listing.furnishing === "Fully Furnished" ? "success" :
                listing.furnishing === "Partially Furnished" ? "warning" : "muted"
              }>
                {listing.furnishing === "Fully Furnished" ? "Furnished" :
                 listing.furnishing === "Partially Furnished" ? "Partial" : "Unfurnished"}
              </Badge>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-bold text-ink leading-none">
                  {fmtPeriod(listing.monthlyRent)}<span className="text-xs text-muted font-normal">{sfx}</span>
                </p>
                <p className="text-xs text-muted mt-1">
                  {formatCurrency(listing.pricePerSqft, currency, rate)}/ft²
                </p>
              </div>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <CopyButton text={listing.url} />
                <button
                  onClick={() => setSelectedListing(listing)}
                  className="h-9 px-3 flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
                  aria-label="View details"
                >
                  <Eye className="w-3 h-3" /> {T("table.details")}
                </button>
              </div>
            </div>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="py-12 text-center text-muted text-sm">{T("table.noMatch")}</div>
        )}
      </div>

      {/* ── Desktop table ───────────────────────────────────────────────────── */}
      <div className="hidden md:block table-container">
        <table className="w-full text-sm" role="table" aria-label="Listings table">
          <thead>
            <tr>
              <ColHeader label={T("table.listing")} sortable colKey="title" className="min-w-[220px]" />
              <ColHeader label={T("filters.bedrooms")} sortable colKey="bedrooms" />
              {visibleCols.bathrooms && <ColHeader label={T("table.bath")} sortable colKey="bathrooms" />}
              <ColHeader label={`${periodLabel} ${T("table.rent")}`} sortable colKey="monthlyRent" />
              {visibleCols.yearlyRent && <ColHeader label={T("period.yearly")} />}
              {visibleCols.dailyRent && <ColHeader label={T("period.daily")} />}
              {visibleCols.sqft && <ColHeader label={T("table.sqft")} sortable colKey="sqft" />}
              {visibleCols.pricePerSqft && <ColHeader label={T("kpi.psf")} sortable colKey="pricePerSqft" />}
              {visibleCols.furnishing && <ColHeader label={T("table.furnishing")} sortable colKey="furnishing" />}
              <ColHeader label={T("table.status")} />
              {visibleCols.url && <ColHeader label={T("table.link")} />}
            </tr>
          </thead>
          <tbody>
            {paginated.map((listing) => (
              <tr
                key={listing.id}
                onClick={() => setSelectedListing(listing)}
                className="border-b border-hairline-soft cursor-pointer transition-colors hover:bg-surface-soft/60 dark:hover:bg-surface-strong/40"
                role="row"
              >
                <td className="px-3 py-3">
                  <div>
                    <p className="font-medium text-ink line-clamp-1 text-sm">{listing.title}</p>
                    <p className="text-xs text-muted mt-0.5">{listing.propertyName}</p>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <Badge variant="muted">
                    {listing.bedrooms === "Studio" ? "Studio" : `${listing.bedrooms}BR`}
                  </Badge>
                </td>
                {visibleCols.bathrooms && (
                  <td className="px-3 py-3 text-muted text-sm">{listing.bathrooms}</td>
                )}
                <td className="px-3 py-3 font-semibold text-ink whitespace-nowrap">
                  {fmtPeriod(listing.monthlyRent)}
                  <span className="text-muted font-normal text-xs">{sfx}</span>
                </td>
                {visibleCols.yearlyRent && (
                  <td className="px-3 py-3 text-muted text-sm">{fmt(listing.yearlyRent)}</td>
                )}
                {visibleCols.dailyRent && (
                  <td className="px-3 py-3 text-muted text-sm">{fmt(listing.dailyRent)}</td>
                )}
                {visibleCols.sqft && (
                  <td className="px-3 py-3 text-muted text-sm">{formatNumber(listing.sqft)} ft²</td>
                )}
                {visibleCols.pricePerSqft && (
                  <td className="px-3 py-3 text-muted text-sm">
                    {formatCurrency(listing.pricePerSqft, currency, rate)}
                  </td>
                )}
                {visibleCols.furnishing && (
                  <td className="px-3 py-3">
                    <Badge variant={
                      listing.furnishing === "Fully Furnished" ? "success" :
                        listing.furnishing === "Partially Furnished" ? "warning" : "muted"
                    } size="sm">
                      {listing.furnishing === "Fully Furnished" ? "FF" :
                        listing.furnishing === "Partially Furnished" ? "PF" : "Unfurn"}
                    </Badge>
                  </td>
                )}
                <td className="px-3 py-3">
                  {listing.fairPriceStatus && (
                    <FairPriceBadge status={listing.fairPriceStatus} />
                  )}
                </td>
                {visibleCols.url && (
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <CopyButton text={listing.url} />
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-soft"
                        aria-label="Open listing on SPEEDHOME"
                        title="Open on SPEEDHOME"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted" />
                      </a>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-hairline bg-surface-soft/30 dark:bg-surface-strong/20">
          <p className="text-xs text-muted">
            {T("table.page")} {page} {T("table.of")} {totalPages} · {filtered.length} {T("table.listings")}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-strong dark:hover:bg-surface-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-ink" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors",
                    p === page
                      ? "bg-ink text-white font-semibold"
                      : "hover:bg-surface-strong dark:hover:bg-surface-strong text-muted"
                  )}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-strong dark:hover:bg-surface-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 text-ink" />
            </button>
          </div>
        </div>
      )}

      {/* Listing detail modal (PRD §11) */}
      <ListingModal
        listing={selectedListing}
        summary={summary}
        onClose={() => setSelectedListing(null)}
      />
    </div>
  );
}