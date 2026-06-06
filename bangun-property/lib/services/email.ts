/**
 * Point 6 — Email dispatch.
 *
 * Uses Resend's HTTP API (https://resend.com) via plain fetch — no SDK needed.
 * Set RESEND_API_KEY and ALERT_FROM_EMAIL in env to enable.
 * When unconfigured, sendEmail() is a no-op that logs and returns false, so
 * the alert dispatcher still runs safely in dev.
 */

import { Listing } from "@/types";
import { formatNumber } from "@/lib/utils";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.ALERT_FROM_EMAIL || "Estate Insight <alerts@estate-insight.app>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://estate-insight.example.com";

export function isEmailConfigured(): boolean {
  return RESEND_API_KEY.length > 0;
}

export interface SendResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  if (!isEmailConfigured()) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email to ${opts.to}`);
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

// ─── Alert email template ─────────────────────────────────────────────────────

export function buildAlertEmail(input: {
  areaName: string;
  maxPrice: number | null;
  minBedrooms: number | null;
  listings: Listing[];
}): { subject: string; html: string } {
  const { areaName, maxPrice, minBedrooms, listings } = input;

  const criteria: string[] = [];
  if (maxPrice != null) criteria.push(`under RM${formatNumber(maxPrice)}/mo`);
  if (minBedrooms != null) criteria.push(`${minBedrooms}+ bedrooms`);
  const criteriaText = criteria.length ? ` (${criteria.join(", ")})` : "";

  const subject = `${listings.length} new match${listings.length === 1 ? "" : "es"} in ${areaName} — Estate Insight`;

  const rows = listings
    .slice(0, 10)
    .map((l) => {
      const beds = l.bedrooms === "Studio" ? "Studio" : `${l.bedrooms}BR`;
      const rent = l.monthlyRent ? `RM${formatNumber(l.monthlyRent)}/mo` : "—";
      const status = l.fairPriceStatus
        ? `<span style="font-size:11px;padding:2px 8px;border-radius:99px;background:${
            l.fairPriceStatus === "Under Market" ? "#d1fae5;color:#047857"
            : l.fairPriceStatus === "Overpriced" ? "#fee2e2;color:#b91c1c"
            : "#f3f4f6;color:#374151"
          }">${l.fairPriceStatus}</span>`
        : "";
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">
            <a href="${l.url}" style="color:#222;font-weight:600;text-decoration:none;font-size:14px;">${escapeHtml(l.title)}</a>
            <div style="color:#717171;font-size:12px;margin-top:2px;">${escapeHtml(l.propertyName)} · ${beds} · ${l.bathrooms} bath · ${formatNumber(l.sqft)} ft²</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;vertical-align:top;">
            <div style="color:#FF385C;font-weight:700;font-size:15px;">${rent}</div>
            <div style="margin-top:4px;">${status}</div>
          </td>
        </tr>`;
    })
    .join("");

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <div style="width:36px;height:36px;border-radius:10px;background:#FF385C;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;">E</div>
      <div>
        <div style="font-weight:700;font-size:16px;">Estate Insight</div>
        <div style="font-size:11px;color:#717171;text-transform:uppercase;letter-spacing:1px;">Price Intelligence</div>
      </div>
    </div>

    <h1 style="font-size:20px;margin:0 0 8px;">New matches in ${escapeHtml(areaName)}</h1>
    <p style="color:#717171;font-size:14px;margin:0 0 20px;">
      We found ${listings.length} listing${listings.length === 1 ? "" : "s"} matching your saved search${criteriaText}.
    </p>

    <table style="width:100%;border-collapse:collapse;">${rows}</table>

    <a href="${SITE_URL}/analysis?area=${encodeURIComponent(areaName)}"
       style="display:inline-block;margin-top:24px;background:#FF385C;color:#fff;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;">
      View full analysis →
    </a>

    <p style="color:#999;font-size:11px;margin-top:32px;line-height:1.6;">
      You're receiving this because you saved a search on Estate Insight.
      Data sourced from public SPEEDHOME listings. Not affiliated with SPEEDHOME Sdn. Bhd.
    </p>
  </div>`;

  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
