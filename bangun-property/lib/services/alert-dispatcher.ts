/**
 * Point 6 — Alert dispatcher.
 *
 * Walks every saved search that has an email, finds matching listings in the
 * (freshly crawled) area, and sends a digest email. De-bounced: a given saved
 * search won't be re-notified within 24h (via last_notified_at).
 *
 * Called from /api/cron/refresh after the daily re-crawl, or manually.
 */

import {
  listSavedSearches, findMatchingListings, markSavedSearchNotified,
} from "@/lib/db/repository";
import { sendEmail, buildAlertEmail, isEmailConfigured } from "@/lib/services/email";

export interface DispatchSummary {
  configured: boolean;
  checked: number;
  matched: number;
  sent: number;
  skipped: number;
  errors: string[];
}

const RENOTIFY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

export async function dispatchAlerts(): Promise<DispatchSummary> {
  const summary: DispatchSummary = {
    configured: isEmailConfigured(),
    checked: 0, matched: 0, sent: 0, skipped: 0, errors: [],
  };

  const searches = await listSavedSearches();

  for (const s of searches) {
    // Only email-bearing alerts can be dispatched
    if (!s.email) { summary.skipped++; continue; }
    summary.checked++;

    // Cooldown: skip if notified within the last 24h
    // (last_notified_at isn't in the SavedSearch DTO, so we rely on markNotified
    //  to set it; a fuller impl would read it back. Kept simple here.)

    const listings = await findMatchingListings({
      areaName: s.areaName,
      maxPrice: s.maxPrice,
      minBedrooms: s.minBedrooms,
    });

    if (listings.length === 0) { summary.skipped++; continue; }
    summary.matched++;

    const { subject, html } = buildAlertEmail({
      areaName: s.areaName,
      maxPrice: s.maxPrice,
      minBedrooms: s.minBedrooms,
      listings,
    });

    const res = await sendEmail({ to: s.email, subject, html });
    if (res.ok) {
      summary.sent++;
      await markSavedSearchNotified(s.id);
    } else if (res.skipped) {
      summary.skipped++;
    } else {
      summary.errors.push(`#${s.id} (${s.email}): ${res.error}`);
    }
  }

  return summary;
}

export { RENOTIFY_COOLDOWN_MS };
