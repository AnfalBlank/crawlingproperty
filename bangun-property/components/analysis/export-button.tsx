"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { cn, getExportFilename } from "@/lib/utils";
import { AreaAnalysis } from "@/types";
import { useAppStore } from "@/store/app-store";

interface ExportButtonProps {
  analysis: AreaAnalysis;
}

export function ExportButton({ analysis }: ExportButtonProps) {
  const { currency, getRate, comparison } = useAppStore();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const rate = getRate();
  const filename = getExportFilename(analysis.area);

  const exportCSV = () => {
    setExporting(true);
    try {
      const headers = [
        "Listing Title", "Property Name", "Area", "Bedrooms", "Bathrooms",
        `Monthly Rent (${currency})`, `Yearly Rent (${currency})`, `Daily Rent (${currency})`,
        "Sqft", `Price/Sqft (${currency})`, "Furnishing", "Fair Price Status", "URL"
      ];

      const rows = analysis.listings.map((l) => [
        `"${l.title}"`,
        `"${l.propertyName}"`,
        `"${l.area}"`,
        l.bedrooms,
        l.bathrooms,
        l.monthlyRent !== null ? Math.round(l.monthlyRent * rate) : "N/A",
        l.yearlyRent !== null ? Math.round(l.yearlyRent * rate) : "N/A",
        l.dailyRent !== null ? Math.round(l.dailyRent * rate) : "N/A",
        l.sqft,
        Math.round(l.pricePerSqft * rate * 100) / 100,
        `"${l.furnishing}"`,
        `"${l.fairPriceStatus || "N/A"}"`,
        `"${l.url}"`,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      // Dynamic import for ExcelJS
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "Estate Insight";
      wb.created = new Date();

      // ─── Sheet 1: Summary ───────────────────────────────────────────────────
      const summary = wb.addWorksheet("Summary");
      summary.columns = [
        { header: "Metric", key: "metric", width: 24 },
        { header: "Value", key: "value", width: 20 },
      ];
      const s = analysis.summary;
      summary.addRows([
        { metric: "Area", value: analysis.area },
        { metric: "Total Listings", value: s.totalListings },
        { metric: `Average Rent (${currency})`, value: Math.round(s.avgPrice * rate) },
        { metric: `Median Rent (${currency})`, value: Math.round(s.medianPrice * rate) },
        { metric: `Mode Rent (${currency})`, value: Math.round(s.modePrice * rate) },
        { metric: `Fair Price (${currency})`, value: Math.round(s.fairPrice * rate) },
        { metric: "Average Sqft", value: Math.round(s.avgSqft) },
        { metric: `Price Per Sqft (${currency})`, value: Math.round(s.avgPricePerSqft * rate * 100) / 100 },
        { metric: "Dominant Unit Type", value: s.dominantUnitType },
        { metric: "Last Updated", value: analysis.lastUpdated },
        { metric: "Crawl Duration (s)", value: analysis.crawlDuration },
        { metric: "Export Currency", value: currency },
        { metric: "Export Date", value: new Date().toISOString() },
      ]);

      // ─── Sheet 2: Listings ──────────────────────────────────────────────────
      const listingsWs = wb.addWorksheet("Listings");
      listingsWs.columns = [
        { header: "Title", key: "title", width: 35 },
        { header: "Property", key: "property", width: 25 },
        { header: "Area", key: "area", width: 15 },
        { header: "Bedrooms", key: "bedrooms", width: 12 },
        { header: "Bathrooms", key: "bathrooms", width: 12 },
        { header: `Monthly Rent (${currency})`, key: "monthly", width: 18 },
        { header: `Yearly Rent (${currency})`, key: "yearly", width: 18 },
        { header: `Daily Rent (${currency})`, key: "daily", width: 16 },
        { header: "Sqft", key: "sqft", width: 10 },
        { header: `Price/Sqft (${currency})`, key: "psf", width: 16 },
        { header: "Furnishing", key: "furnishing", width: 18 },
        { header: "Fair Price Status", key: "status", width: 16 },
        { header: "URL", key: "url", width: 40 },
      ];
      listingsWs.addRows(
        analysis.listings.map((l) => ({
          title: l.title,
          property: l.propertyName,
          area: l.area,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          monthly: l.monthlyRent !== null ? Math.round(l.monthlyRent * rate) : "",
          yearly: l.yearlyRent !== null ? Math.round(l.yearlyRent * rate) : "",
          daily: l.dailyRent !== null ? Math.round(l.dailyRent * rate) : "",
          sqft: l.sqft,
          psf: Math.round(l.pricePerSqft * rate * 100) / 100,
          furnishing: l.furnishing,
          status: l.fairPriceStatus || "",
          url: l.url,
        }))
      );

      // ─── Sheet 3: Comparison (PRD §29 sheet 3) ──────────────────────────────
      const comparisonWs = wb.addWorksheet("Comparison");
      comparisonWs.columns = [
        { header: "Area", key: "area", width: 22 },
        { header: "Listings", key: "listings", width: 12 },
        { header: `Avg Rent (${currency})`, key: "avg", width: 18 },
        { header: `Median (${currency})`, key: "median", width: 16 },
        { header: `Fair Price (${currency})`, key: "fair", width: 18 },
        { header: "Avg Sqft", key: "sqft", width: 12 },
        { header: `Price/Sqft (${currency})`, key: "psf", width: 18 },
      ];
      if (comparison?.areas?.length) {
        comparisonWs.addRows(
          comparison.areas.map((a) => ({
            area: a.areaName,
            listings: a.listings,
            avg: Math.round(a.avgRent * rate),
            median: Math.round(a.medianRent * rate),
            fair: Math.round(a.fairPrice * rate),
            sqft: Math.round(a.avgSqft),
            psf: Math.round(a.pricePerSqft * rate * 100) / 100,
          }))
        );
        comparisonWs.addRow([]);
        if (comparison.recommendation) {
          comparisonWs.addRow(["Recommendation:", comparison.recommendation]);
        }
      } else {
        // Fall back to the single analysed area
        const s = analysis.summary;
        comparisonWs.addRow({
          area: analysis.area,
          listings: s.totalListings,
          avg: Math.round(s.avgPrice * rate),
          median: Math.round(s.medianPrice * rate),
          fair: Math.round(s.fairPrice * rate),
          sqft: Math.round(s.avgSqft),
          psf: Math.round(s.avgPricePerSqft * rate * 100) / 100,
        });
        comparisonWs.addRow([]);
        comparisonWs.addRow(["Note:", "Add areas in the Compare panel to populate this sheet."]);
      }

      // ─── Sheet 4: Market Insights ───────────────────────────────────────────
      const insightsWs = wb.addWorksheet("Market Insights");
      insightsWs.addRow(["Market Insights for " + analysis.area]);
      insightsWs.addRow([]);
      analysis.insights.forEach((insight, i) => {
        insightsWs.addRow([`${i + 1}. ${insight}`]);
      });

      // ─── Sheet 5: Currency Info ─────────────────────────────────────────────
      const currWs = wb.addWorksheet("Currency Info");
      currWs.addRows([
        ["Base Currency", "MYR"],
        ["Export Currency", currency],
        ["Exchange Rate", rate],
        ["Rate Source", "Frankfurter API"],
        ["Updated", new Date().toISOString()],
      ]);

      // Style header rows
      [summary, listingsWs, comparisonWs, insightsWs, currWs].forEach((ws) => {
        ws.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF385C" },
        };
        ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export failed:", err);
      alert("Excel export failed. Please try CSV export.");
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={exporting}
        className={cn(
          "flex items-center gap-1.5 h-9 px-3 rounded-lg border border-hairline bg-canvas text-ink text-[13px] font-medium hover:bg-surface-soft transition-all whitespace-nowrap",
          exporting && "opacity-60 cursor-not-allowed"
        )}
        aria-expanded={open}
        aria-label="Export data"
      >
        {exporting ? (
          <span className="w-4 h-4 border-2 border-muted/30 border-t-ink rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-canvas dark:bg-canvas border border-hairline rounded-xl shadow-card z-50 overflow-hidden">
          <button
            onClick={exportCSV}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-surface-soft dark:hover:bg-surface-strong transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-muted" />
            <div>
              <p className="font-medium">Export CSV</p>
              <p className="text-xs text-muted">Plain spreadsheet</p>
            </div>
          </button>
          <div className="border-t border-hairline-soft" />
          <button
            onClick={exportExcel}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-surface-soft dark:hover:bg-surface-strong transition-colors text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="font-medium">Export Excel XLSX</p>
              <p className="text-xs text-muted">5 sheets with analytics</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
