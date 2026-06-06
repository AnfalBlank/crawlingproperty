"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Sun, Moon, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { LANGUAGES, t } from "@/lib/i18n";
import { CurrencySelector } from "@/components/ui/currency-selector";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme, lang, setLang } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled && !menuOpen;

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, [menuOpen]);

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const NAV_LINKS = [
    { href: "/",         label: t(lang, "nav.home")     },
    { href: "/analysis", label: t(lang, "nav.analysis") },
    { href: "/admin",    label: t(lang, "nav.admin")    },
  ];

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return cn(
      "relative px-3.5 py-2 rounded-xl text-[14px] font-semibold transition-all duration-200 whitespace-nowrap",
      isTransparent
        ? active
          ? "text-white bg-white/15 backdrop-blur-md"
          : "text-white/80 hover:text-white hover:bg-white/10"
        : active
          ? "text-ink bg-surface-soft dark:bg-surface-strong"
          : "text-muted hover:text-ink hover:bg-surface-soft dark:hover:bg-surface-strong"
    );
  };

  const iconBtnClass = cn(
    "w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0",
    isTransparent
      ? "text-white hover:bg-white/15"
      : "text-muted hover:text-ink hover:bg-surface-soft dark:hover:bg-surface-strong"
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-canvas/85 dark:bg-canvas/85 backdrop-blur-xl border-b border-hairline"
      )}
      role="banner"
    >
      <div className="h-[72px] max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-3">

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="Estate Insight — home"
        >
          <span className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-105",
            isTransparent
              ? "bg-white/10 backdrop-blur-md ring-1 ring-white/25"
              : "bg-canvas ring-1 ring-hairline shadow-sm"
          )}>
            <Image
              src="/logo.png"
              alt="Estate Insight"
              width={40} height={40}
              className="w-full h-full object-cover"
              priority
            />
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className={cn(
              "text-[16px] font-bold tracking-tight",
              isTransparent ? "text-white" : "text-ink"
            )}>
              Estate Insight
            </span>
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.18em] mt-1",
              isTransparent ? "text-white/60" : "text-muted"
            )}>
              Price Intelligence
            </span>
          </span>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-0.5 px-1" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>{label}</Link>
          ))}
        </nav>

        {/* ── Right controls ────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5">

          {/* Currency selector — sm and up */}
          <div className="hidden sm:block">
            <CurrencySelector
              compact
              variant={isTransparent ? "ghost" : "default"}
            />
          </div>

          {/* Language selector — sm and up */}
          <div ref={langRef} className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={cn(
                "flex items-center gap-1.5 h-10 px-2.5 lg:px-3 rounded-xl text-[13px] font-semibold transition-all border whitespace-nowrap",
                isTransparent
                  ? "text-white hover:bg-white/15 backdrop-blur-md border-white/20"
                  : "text-muted hover:text-ink hover:bg-surface-soft dark:hover:bg-surface-strong border-hairline"
              )}
              aria-label="Language"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{currentLang.code.toUpperCase()}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", langOpen && "rotate-180")} />
            </button>

            {langOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-canvas dark:bg-canvas border border-hairline rounded-xl shadow-lifted overflow-hidden z-50 animate-fade-in-down"
                role="listbox"
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-2.5 text-[14px] text-left transition-colors",
                      l.code === lang
                        ? "bg-surface-soft dark:bg-surface-strong font-bold text-ink"
                        : "text-muted hover:bg-surface-soft dark:hover:bg-surface-strong hover:text-ink"
                    )}
                    role="option"
                    aria-selected={l.code === lang}
                  >
                    <span className="text-base leading-none">{l.flag}</span>
                    <span>{l.label}</span>
                    {l.code === lang && <span className="ml-auto text-primary">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={iconBtnClass}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {/* Mobile hamburger */}
          <button
            className={cn(iconBtnClass, "md:hidden")}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-[72px] bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden absolute inset-x-0 top-full bg-canvas dark:bg-canvas border-b border-hairline shadow-lifted animate-fade-in-down z-50 max-h-[calc(100vh-72px)] overflow-y-auto">
            <nav className="px-4 pt-3 pb-5 space-y-1" aria-label="Mobile">
              {NAV_LINKS.map(({ href, label }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors",
                      active
                        ? "bg-surface-soft dark:bg-surface-strong text-ink"
                        : "text-muted hover:text-ink hover:bg-surface-soft dark:hover:bg-surface-strong"
                    )}
                  >
                    {label}
                    {active && <span className="text-primary text-xs">●</span>}
                  </Link>
                );
              })}

              {/* Mobile preferences row */}
              <div className="pt-4 mt-3 border-t border-hairline-soft">
                <p className="px-4 mb-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                  Currency
                </p>
                <div className="px-1 mb-4">
                  <CurrencySelector className="w-full" />
                </div>

                <p className="px-4 mb-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                  Language
                </p>
                <div className="grid grid-cols-2 gap-2 px-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                        l.code === lang
                          ? "bg-ink text-white dark:bg-surface-strong dark:text-ink"
                          : "border border-hairline text-muted hover:text-ink hover:bg-surface-soft"
                      )}
                    >
                      <span className="text-base leading-none">{l.flag}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
