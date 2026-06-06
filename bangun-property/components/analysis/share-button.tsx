"use client";

/**
 * Item 8 — Share dashboard URL
 * Builds a deep-link with the current state (area, currency, period, compare)
 * and copies it to clipboard.
 */

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { buildShareUrl } from "@/lib/utils";

interface Props {
  area: string;
  withCompare?: boolean;
}

export function ShareButton({ area, withCompare }: Props) {
  const { currency, rentalPeriod } = useAppStore();
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    const url = buildShareUrl({ area, currency, period: rentalPeriod, compare: withCompare });

    // Use native share when available (mobile), fall back to clipboard
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: `${area} rental analysis`, url });
        return;
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-hairline bg-canvas text-ink text-sm font-semibold hover:bg-surface-soft dark:hover:bg-surface-strong transition-all whitespace-nowrap"
      title="Copy shareable link"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
      <span className="hidden xs:inline">{copied ? "Copied" : "Share"}</span>
    </button>
  );
}
