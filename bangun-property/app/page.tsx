"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3, TrendingUp, Globe, Zap, Shield, Sparkles,
  ArrowRight, ArrowUpRight, MapPin, Building2, LineChart, FileSpreadsheet,
  CheckCircle2, Activity, Bot, BadgeCheck,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SearchBar } from "@/components/home/search-bar";
import { RecentSearches } from "@/components/home/recent-searches";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { AnimatedCounter } from "@/components/home/animated-counter";
import { useAppStore } from "@/store/app-store";
import { t } from "@/lib/i18n";

const HERO_BG = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=85&auto=format&fit=crop";

const PROPERTY_CARDS = [
  {
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop",
    area: "Mont Kiara",
    tag: "Premium",
  },
  {
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop",
    area: "KLCC",
    tag: "Iconic",
  },
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop",
    area: "Bangsar",
    tag: "Trending",
  },
  {
    image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80&auto=format&fit=crop",
    area: "Damansara",
    tag: "Family",
  },
];

const POPULAR_AREAS = ["Mont Kiara", "KLCC", "Bangsar", "Petaling Jaya", "Subang Jaya", "Chow Kit"];

export default function HomePage() {
  const { lang } = useAppStore();
  const T = (key: Parameters<typeof t>[1]) => t(lang, key);

  // Real stats from /api/stats — falls back to smart defaults if fetch fails
  // so the page never shows "0 areas / 0 listings" while loading.
  const [liveStats, setLiveStats] = useState<{
    totalAreas: number; totalListings: number; totalCrawls: number;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (alive && d && !d.error) setLiveStats(d); })
      .catch(() => { /* keep null — STATS will show fallback */ });
    return () => { alive = false; };
  }, []);

  const STATS = [
    { value: liveStats?.totalAreas    ?? 24,    suffix: liveStats?.totalAreas    ? ""  : "+", label: T("stats.areas"),    icon: MapPin    },
    { value: liveStats?.totalListings ?? 3847,  suffix: "",                                    label: T("stats.listings"), icon: Building2 },
    { value: liveStats?.totalCrawls   ?? 156,   suffix: "",                                    label: T("stats.crawls"),   icon: LineChart },
    { value: 95,                                suffix: "%",                                   label: T("stats.accuracy"), icon: Shield    },
  ];

  const FEATURES = [
    { icon: BarChart3, title: T("feat.analytics.title"), desc: T("feat.analytics.desc"),
      gradient: "from-rose-500/20 to-rose-500/5", iconBg: "bg-rose-50 text-primary dark:bg-rose-950/40" },
    { icon: TrendingUp, title: T("feat.compare.title"), desc: T("feat.compare.desc"),
      gradient: "from-blue-500/20 to-blue-500/5", iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
    { icon: Globe, title: T("feat.currency.title"), desc: T("feat.currency.desc"),
      gradient: "from-emerald-500/20 to-emerald-500/5", iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
    { icon: FileSpreadsheet, title: T("feat.export.title"), desc: T("feat.export.desc"),
      gradient: "from-violet-500/20 to-violet-500/5", iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
    { icon: Zap, title: T("feat.crawl.title"), desc: T("feat.crawl.desc"),
      gradient: "from-amber-500/20 to-amber-500/5", iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    { icon: Shield, title: T("feat.robot.title"), desc: T("feat.robot.desc"),
      gradient: "from-slate-500/20 to-slate-500/5", iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300" },
  ];

  const STEPS = [
    { num: "01", title: T("how.s1.title"), desc: T("how.s1.desc"), icon: MapPin },
    { num: "02", title: T("how.s2.title"), desc: T("how.s2.desc"), icon: Bot },
    { num: "03", title: T("how.s3.title"), desc: T("how.s3.desc"), icon: BarChart3 },
    { num: "04", title: T("how.s4.title"), desc: T("how.s4.desc"), icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas">
      <Navbar />

      {/* ─── HERO — refined wireframe ───────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">

        {/* Background image (KL skyline) */}
        <div className="absolute inset-0">
          <Image
            src={HERO_BG}
            alt="Kuala Lumpur skyline"
            fill priority sizes="100vw"
            className="object-cover scale-105"
          />
          <div className="absolute inset-0 hero-image-overlay" />
          {/* subtle texture grid replaces noisy pulse dots */}
          <div className="absolute inset-0 hero-dotgrid opacity-40" aria-hidden="true" />
        </div>

        {/* Ambient gradient orbs (replace noisy pulse-ring dots) */}
        <div aria-hidden="true">
          <div className="hero-orb hero-orb-rose hero-orb-a"
            style={{ width: 520, height: 520, top: "-12%", right: "-8%", opacity: 0.55 }} />
          <div className="hero-orb hero-orb-blue hero-orb-b"
            style={{ width: 480, height: 480, bottom: "-15%", left: "-10%", opacity: 0.45 }} />
          <div className="hero-orb hero-orb-amber hero-orb-c"
            style={{ width: 360, height: 360, top: "30%", left: "55%", opacity: 0.30 }} />
        </div>

        {/* Content grid: text on left, preview card stack on right (lg+) */}
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10 pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* ── LEFT — copy block (lg: 7/12) ─────────────────────────────── */}
            <div className="lg:col-span-7 text-center lg:text-left">

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-6 md:mb-7 animate-fade-in-down">
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-white text-[12.5px] md:text-[13px] font-semibold tracking-wide">
                  {T("hero.eyebrow")}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-display font-bold text-white leading-[0.96] mb-5 md:mb-6 animate-fade-in-up text-balance"
                style={{ fontSize: "clamp(40px, 6.4vw, 80px)", letterSpacing: "-0.035em", animationDelay: "0.08s" }}
              >
                {T("hero.headline1")}{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary via-[#ff6b85] to-[#ffa07d] bg-clip-text text-transparent">
                    {T("hero.headline2")}
                  </span>
                  <svg className="absolute left-0 right-0 -bottom-2 w-full" viewBox="0 0 200 14" fill="none" preserveAspectRatio="none" style={{ height: "10px" }} aria-hidden="true">
                    <path d="M2 8 Q50 2 100 6 T 198 8" stroke="#ff385c" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />
                  </svg>
                </span>
                <br className="hidden sm:block" />
                <span className="text-white"> {T("hero.headline3")}</span>
              </h1>

              <p
                className="text-white/75 leading-relaxed mb-8 md:mb-9 max-w-[600px] mx-auto lg:mx-0 animate-fade-in-up text-balance"
                style={{ fontSize: "clamp(15px, 1.4vw, 17.5px)", animationDelay: "0.18s" }}
              >
                {T("hero.sub")}
              </p>

              {/* Search container — left-aligned on lg+ */}
              <div
                className="glass-card rounded-2xl p-3 md:p-3.5 max-w-[640px] mx-auto lg:mx-0 shadow-2xl animate-fade-in-up"
                style={{ animationDelay: "0.28s" }}
              >
                <SearchBar size="lg" />
              </div>

              {/* Popular pills */}
              <div
                className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="text-white/55 text-[13px] font-medium mr-1">{T("hero.popular")}</span>
                {POPULAR_AREAS.map((area) => (
                  <Link
                    key={area}
                    href={`/analysis?area=${encodeURIComponent(area)}`}
                    className="text-[12.5px] text-white/85 hover:text-white border border-white/15 hover:border-white/40 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {area}
                  </Link>
                ))}
              </div>

              {/* Trust strip */}
              <div
                className="mt-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-[520px] mx-auto lg:mx-0 animate-fade-in-up"
                style={{ animationDelay: "0.52s" }}
              >
                {[
                  { v: "10s",  l: "Avg crawl" },
                  { v: "95%+", l: "Success rate" },
                  { v: "9",    l: "Currencies" },
                ].map(({ v, l }) => (
                  <div key={l} className="text-center lg:text-left">
                    <div className="text-white text-2xl md:text-[28px] font-bold tabular-nums leading-none">{v}</div>
                    <div className="text-white/55 text-[11.5px] md:text-[12px] mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT — floating preview stack (lg+ only) ────────────────── */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative w-full max-w-[440px] ml-auto" style={{ aspectRatio: "5/6" }}>

                {/* Card 1 — KPI Average rent (foreground) */}
                <div
                  className="absolute right-0 top-[6%] w-[80%] glass-card rounded-2xl p-5 shadow-2xl animate-float"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary" />
                      </span>
                      <p className="text-white text-[13px] font-bold">Mont Kiara</p>
                    </div>
                    <span className="text-[10px] font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                      PREVIEW
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-white/55 uppercase tracking-widest mb-1.5">
                    Average Rent
                  </p>
                  <p className="text-3xl font-bold text-white tabular-nums leading-none">
                    RM 2,850<span className="text-sm text-white/55 font-normal ml-1">/mo</span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-white/55">vs last month</p>
                      <p className="text-[13px] font-bold text-emerald-300 mt-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +3.2%
                      </p>
                    </div>
                    {/* mini sparkline */}
                    <div className="flex items-end gap-1 h-8">
                      {[40, 55, 35, 70, 50, 80, 65, 90].map((h, i) => (
                        <span
                          key={i}
                          className="w-1.5 rounded-sm bg-gradient-to-t from-primary/40 to-primary"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 2 — distribution chart (background-left) */}
                <div
                  className="absolute left-0 top-[40%] w-[68%] glass-card rounded-2xl p-4 shadow-xl animate-float"
                  style={{ animationDelay: "0.7s" }}
                >
                  <p className="text-[10px] font-bold text-white/55 uppercase tracking-widest mb-3">
                    Price Distribution
                  </p>
                  <div className="flex items-end gap-1.5 h-16 mb-1">
                    {[28, 60, 84, 72, 48, 26].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary/80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-white/50">
                    <span>1.5K</span><span>2K</span><span>2.5K</span><span>3K</span><span>3.5K</span><span>+</span>
                  </div>
                </div>

                {/* Card 3 — fair price chip (top-left) */}
                <div
                  className="absolute left-[8%] top-[2%] glass-card rounded-2xl px-4 py-3 shadow-xl animate-float"
                  style={{ animationDelay: "1.2s" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/25 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    </span>
                    <div>
                      <p className="text-[9.5px] font-bold text-white/55 uppercase tracking-widest">Fair Price</p>
                      <p className="text-[15px] font-bold text-white tabular-nums leading-none mt-0.5">
                        RM 2,660<span className="text-[10px] text-white/55 font-normal ml-1">/mo</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 4 — listings count (bottom-right) */}
                <div
                  className="absolute right-[4%] bottom-[6%] glass-card rounded-2xl px-4 py-3 shadow-xl animate-float"
                  style={{ animationDelay: "1.6s" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>
                    <div>
                      <p className="text-[9.5px] font-bold text-white/55 uppercase tracking-widest">Listings</p>
                      <p className="text-[15px] font-bold text-white tabular-nums leading-none mt-0.5">
                        124 <span className="text-[10px] text-white/55 font-normal">active</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
      </section>

      {/* ─── Recent Searches ──────────────────────────────────────────────────── */}
      <RecentSearches />

      {/* ─── Trending Areas ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-canvas dark:bg-canvas">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10">

          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Popular Areas
                </p>
                <h2 className="font-display text-ink font-bold leading-tight"
                  style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.02em" }}>
                  {T("section.trending")}
                </h2>
                <p className="text-muted text-base md:text-lg mt-2 max-w-md">
                  Tap any area to crawl live SPEEDHOME data and see real numbers.
                </p>
              </div>
              <Link href="/analysis"
                className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-primary transition-colors group">
                {T("section.viewAll")}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {PROPERTY_CARDS.map((card, i) => (
              <ScrollReveal key={card.area} delay={i * 80}>
                <Link
                  href={`/analysis?area=${encodeURIComponent(card.area)}`}
                  className="property-card group block rounded-2xl overflow-hidden border border-hairline interactive-card bg-canvas h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-[5/4] overflow-hidden bg-surface-strong">
                    <Image
                      src={card.image}
                      alt={card.area}
                      fill
                      className="property-card-img object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Tag pill */}
                    <span className="absolute top-3 left-3 bg-canvas/95 backdrop-blur-md text-ink text-[11px] font-bold px-2.5 py-1 rounded-full border border-hairline">
                      {card.tag}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <h3 className="text-base md:text-lg font-bold text-ink truncate">{card.area}</h3>
                        </div>
                        <p className="text-sm text-muted">Kuala Lumpur</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-hairline-soft flex items-center justify-between">
                      <p className="text-xs text-muted">
                        Click to crawl live SPEEDHOME data
                      </p>
                      <div className="flex items-center gap-1 text-primary text-sm font-bold group-hover:gap-2 transition-all">
                        Analyze <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Strip — bigger numbers ─────────────────────────────────────── */}
      <section className="border-y border-hairline bg-surface-soft dark:bg-surface-soft py-14 md:py-16 mesh-gradient">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map(({ value, suffix, label, icon: Icon }, i) => (
              <ScrollReveal key={label} delay={i * 80}>
                <div className="text-center md:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-canvas border border-hairline flex items-center justify-center mb-4 shadow-sm mx-auto md:mx-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-display text-ink font-bold leading-none mb-1.5"
                    style={{ fontSize: "clamp(36px, 4.5vw, 56px)", letterSpacing: "-0.03em" }}>
                    <AnimatedCounter value={value} suffix={suffix} />
                  </div>
                  <div className="text-sm md:text-base text-muted font-medium">{label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10">

          <ScrollReveal>
            <div className="text-center mb-14 md:mb-16 max-w-2xl mx-auto">
              <p className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
                <Activity className="w-3.5 h-3.5" />
                Features
              </p>
              <h2 className="font-display text-ink font-bold leading-[1.05] mb-4 text-balance"
                style={{ fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.03em" }}>
                {T("feat.title")}
              </h2>
              <p className="text-muted text-base md:text-lg leading-relaxed text-balance">
                {T("feat.sub")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, gradient, iconBg }, i) => (
              <ScrollReveal key={title} delay={i * 60}>
                <div className="relative group h-full">
                  {/* Gradient glow on hover */}
                  <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 blur transition-opacity duration-500`} />
                  <div className="relative bg-canvas dark:bg-canvas border border-hairline rounded-2xl p-6 md:p-7 interactive-card h-full">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-ink mb-2.5">{title}</h3>
                    <p className="text-sm md:text-[15px] text-muted leading-[1.6]">{desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works — interactive step cards ────────────────────────────── */}
      <section className="py-20 md:py-28 bg-surface-soft dark:bg-surface-soft border-y border-hairline">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10">

          <ScrollReveal>
            <div className="text-center mb-14 md:mb-16 max-w-xl mx-auto">
              <p className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
                <Zap className="w-3.5 h-3.5" />
                How It Works
              </p>
              <h2 className="font-display text-ink font-bold leading-[1.05]"
                style={{ fontSize: "clamp(30px, 4.5vw, 52px)", letterSpacing: "-0.03em" }}>
                {T("how.title")}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 relative">
            {/* Connector line desktop */}
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px"
              aria-hidden="true">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-hairline to-transparent" />
            </div>

            {STEPS.map(({ num, title, desc, icon: Icon }, i) => (
              <ScrollReveal key={num} delay={i * 100}>
                <div className="relative group">
                  <div className="bg-canvas dark:bg-canvas border border-hairline rounded-2xl p-6 md:p-7 interactive-card h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#ff6b85] flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-display text-[44px] md:text-[52px] font-bold leading-none text-hairline group-hover:text-primary/30 transition-colors">
                        {num}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-ink mb-2">{title}</h3>
                    <p className="text-sm md:text-[15px] text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Dashboard Preview Split ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            <ScrollReveal>
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analytics Dashboard
                </p>
                <h2 className="font-display text-ink font-bold leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(30px, 4.5vw, 52px)", letterSpacing: "-0.03em" }}>
                  Interactive market<br />
                  <span className="text-primary">data</span> in real time.
                </h2>
                <p className="text-muted text-base md:text-lg leading-relaxed mb-8 max-w-md">
                  Click chart bars to filter listings. Compare areas instantly. Switch
                  currencies without reloading. Every data point is interactive.
                </p>

                <ul className="space-y-3 mb-10">
                  {[
                    "Price histogram with one-click table filter",
                    "Bedroom & furnishing distribution charts",
                    "Smart fair price classification per listing",
                    "Area comparison across up to 5 markets",
                  ].map((item, i) => (
                    <li key={item}
                      className="flex items-start gap-3 text-base text-ink animate-fade-in-up"
                      style={{ animationDelay: `${i * 80}ms` }}>
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link href="/analysis"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active text-white font-bold px-6 py-3.5 rounded-xl text-base btn-lift">
                  {T("cta.button")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden border border-hairline shadow-lifted">
                  <Image
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80&auto=format&fit=crop"
                    alt="Dashboard preview"
                    width={900} height={650}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>

                {/* Floating stat card 1 */}
                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-canvas dark:bg-canvas rounded-2xl p-4 md:p-5 border border-hairline shadow-lifted animate-float w-[170px] md:w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-muted uppercase tracking-wide font-bold">Fair Price</p>
                    <span className="text-[9px] font-bold text-muted bg-surface-soft px-1.5 py-0.5 rounded-full">SAMPLE</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-primary num">RM 2,660</p>
                  <p className="text-xs text-muted mt-1">Mont Kiara avg</p>
                  <div className="mt-3 pt-3 border-t border-hairline-soft">
                    <span className="text-[10px] text-muted">70% median + 30% average</span>
                  </div>
                </div>

                {/* Floating stat card 2 */}
                <div className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 bg-canvas dark:bg-canvas rounded-2xl p-4 md:p-5 border border-hairline shadow-lifted animate-float w-[170px] md:w-[200px]"
                  style={{ animationDelay: "1s" }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-muted uppercase tracking-wide font-bold">Listings</p>
                    <span className="text-[9px] font-bold text-muted bg-surface-soft px-1.5 py-0.5 rounded-full">SAMPLE</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-ink num">124</p>
                  <p className="text-xs text-muted mt-1">Active rentals</p>
                  <div className="mt-3 flex gap-1">
                    {[40, 65, 35, 80, 55, 90, 60].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-sm" style={{ height: `${h * 0.3}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80&auto=format&fit=crop"
                alt="Kuala Lumpur"
                fill className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-primary/30" />

              <div className="relative z-10 text-center px-6 py-16 md:py-24">
                <p className="inline-flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {T("cta.eyebrow")}
                </p>
                <h2 className="font-display text-white font-bold mb-5 text-balance leading-[1.05]"
                  style={{ fontSize: "clamp(32px, 5.5vw, 64px)", letterSpacing: "-0.03em" }}>
                  {T("cta.title")}
                </h2>
                <p className="text-white/70 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed text-balance">
                  {T("cta.sub")}
                </p>
                <Link href="/analysis"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active text-white font-bold px-7 md:px-8 py-4 rounded-2xl text-base md:text-lg btn-lift">
                  {T("cta.button")}
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {/* Trust mini stats */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-white/60 text-sm">
                  {[
                    "No signup required",
                    "Free to use",
                    "Real-time data",
                  ].map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
