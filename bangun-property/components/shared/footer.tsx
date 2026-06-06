"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MapPin, Mail, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { t } from "@/lib/i18n";

// ── Footer link sets ──────────────────────────────────────────────────────────
const FEATURES = [
  { label: "Price Analysis",        href: "/analysis?area=Mont+Kiara" },
  { label: "Area Comparison",       href: "/analysis?area=KLCC&compare=1" },
  { label: "Fair Price Calculator", href: "/analysis?area=Bangsar" },
  { label: "Map View",              href: "/analysis?area=Mont+Kiara&view=map" },
  { label: "Data Export",           href: "/analysis?area=Petaling+Jaya" },
];

const POPULAR_AREAS = [
  { name: "Mont Kiara",   slug: "mont-kiara"   },
  { name: "KLCC",         slug: "klcc"         },
  { name: "Bangsar",      slug: "bangsar"      },
  { name: "Petaling Jaya",slug: "petaling-jaya"},
  { name: "Subang Jaya",  slug: "subang-jaya"  },
];

const SYSTEM = [
  { label: "Admin Dashboard", href: "/admin" },
  { label: "Crawl Monitor",   href: "/admin?tab=monitor" },
  { label: "Cache Manager",   href: "/admin?tab=cache" },
  { label: "Exchange Rates",  href: "/admin?tab=rates" },
];

export function Footer() {
  return (
    <Suspense fallback={null}>
      <FooterInner />
    </Suspense>
  );
}

function FooterInner() {
  const { lang } = useAppStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16 md:mt-20 border-t border-hairline bg-canvas dark:bg-canvas"
      role="contentinfo"
    >
      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">

          {/* ── Brand column (4 cols on desktop) ────────────────────────── */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group" aria-label="Estate Insight — home">
              <span className="w-10 h-10 rounded-xl bg-canvas ring-1 ring-hairline shadow-sm flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Estate Insight logo"
                  width={40} height={40}
                  className="w-full h-full object-cover"
                />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[15px] font-bold text-ink tracking-tight">Estate Insight</span>
                <span className="text-[10px] font-semibold text-muted uppercase tracking-[0.18em] mt-1">
                  Price Intelligence
                </span>
              </span>
            </Link>

            <p className="text-[13.5px] text-muted leading-relaxed mb-5 max-w-sm">
              {t(lang, "footer.tagline")}
            </p>

            <div className="space-y-2 text-[12.5px]">
              <div className="flex items-center gap-2 text-muted">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                Kuala Lumpur, Malaysia
              </div>
              <a
                href="mailto:hello@estate-insight.app"
                className="flex items-center gap-2 text-muted hover:text-ink transition-colors w-fit"
              >
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                hello@estate-insight.app
              </a>
            </div>
          </div>

          {/* ── Features ────────────────────────────────────────────────── */}
          <div className="md:col-span-3">
            <h3 className="text-[10.5px] font-bold text-ink uppercase tracking-[0.18em] mb-4">
              Features
            </h3>
            <ul className="space-y-2.5">
              {FEATURES.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[13px] text-muted hover:text-primary inline-flex items-center gap-1 group transition-colors"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Popular Areas ───────────────────────────────────────────── */}
          <div className="md:col-span-2">
            <h3 className="text-[10.5px] font-bold text-ink uppercase tracking-[0.18em] mb-4">
              Popular Areas
            </h3>
            <ul className="space-y-2.5">
              {POPULAR_AREAS.map(({ name, slug }) => (
                <li key={slug}>
                  <Link
                    href={`/area/${slug}`}
                    className="text-[13px] text-muted hover:text-primary inline-flex items-center gap-1 group transition-colors"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── System ──────────────────────────────────────────────────── */}
          <div className="md:col-span-3">
            <h3 className="text-[10.5px] font-bold text-ink uppercase tracking-[0.18em] mb-4">
              System
            </h3>
            <ul className="space-y-2.5">
              {SYSTEM.map(({ label, href }) => {
                // Only mark active when current URL matches the exact href (incl. ?tab=)
                // — prevents all four System links from highlighting at once on /admin.
                const [hrefPath, hrefQuery] = href.split("?");
                const currentTab = searchParams.get("tab");
                const targetTab = hrefQuery ? new URLSearchParams(hrefQuery).get("tab") : null;
                const active =
                  pathname === hrefPath &&
                  (targetTab ? currentTab === targetTab : !currentTab);
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      className={cn(
                        "text-[13px] inline-flex items-center gap-1 group transition-colors",
                        active ? "text-primary font-semibold" : "text-muted hover:text-primary"
                      )}
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/analysis"
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink hover:text-primary transition-colors group"
            >
              Open dashboard
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Legal band ──────────────────────────────────────────────────── */}
      <div className="border-t border-hairline-soft">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10 py-5 flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-muted">
            © {year} Estate Insight. Data sourced from SPEEDHOME public listings.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-muted">
            <span>Not affiliated with SPEEDHOME Sdn. Bhd.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
