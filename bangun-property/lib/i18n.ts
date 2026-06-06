// ─── Supported languages ──────────────────────────────────────────────────────
export type Lang = "en" | "ms" | "id" | "zh";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "ms", label: "Melayu",   flag: "🇲🇾" },
  { code: "id", label: "Indonesia",flag: "🇮🇩" },
  { code: "zh", label: "中文",      flag: "🇨🇳" },
];

// ─── Translation map ──────────────────────────────────────────────────────────
type TranslationKey =
  | "nav.home" | "nav.analysis" | "nav.admin"
  | "hero.eyebrow" | "hero.headline1" | "hero.headline2" | "hero.headline3" | "hero.sub"
  | "hero.popular" | "search.placeholder" | "search.area" | "search.url" | "search.analyze"
  | "section.trending" | "section.viewAll"
  | "stats.areas" | "stats.listings" | "stats.crawls" | "stats.accuracy"
  | "feat.title" | "feat.sub"
  | "feat.analytics.title" | "feat.analytics.desc"
  | "feat.compare.title" | "feat.compare.desc"
  | "feat.currency.title" | "feat.currency.desc"
  | "feat.export.title" | "feat.export.desc"
  | "feat.crawl.title" | "feat.crawl.desc"
  | "feat.robot.title" | "feat.robot.desc"
  | "how.title" | "how.sub"
  | "how.s1.title" | "how.s1.desc" | "how.s2.title" | "how.s2.desc"
  | "how.s3.title" | "how.s3.desc" | "how.s4.title" | "how.s4.desc"
  | "cta.eyebrow" | "cta.title" | "cta.sub" | "cta.button"
  | "dash.search" | "dash.filters" | "dash.compare" | "dash.refresh" | "dash.export"
  | "dash.live" | "dash.listings" | "dash.total"
  | "kpi.total" | "kpi.avg" | "kpi.median" | "kpi.fair" | "kpi.sqft" | "kpi.psf" | "kpi.topUnit"
  | "kpi.activeRentals" | "kpi.perMonth" | "kpi.middleValue" | "kpi.formula" | "kpi.unitSize" | "kpi.perSqft" | "kpi.mostCommon"
  | "insight.title"
  | "empty.title" | "empty.sub" | "empty.popular"
  | "admin.title" | "admin.sub"
  | "admin.tab.monitor" | "admin.tab.history" | "admin.tab.cache" | "admin.tab.rates"
  | "footer.tagline"
  // ── Dashboard header / actions ──
  | "dash.alert" | "dash.share" | "dash.shared" | "dash.cached" | "dash.crawledIn" | "dash.unitListings"
  // ── Period toggle ──
  | "period.daily" | "period.monthly" | "period.yearly"
  // ── Filters panel ──
  | "filters.title" | "filters.reset" | "filters.search" | "filters.searchPh"
  | "filters.bedrooms" | "filters.bathrooms" | "filters.furnishing"
  | "filters.advanced" | "filters.monthlyRent" | "filters.sqftRange" | "filters.psf"
  | "filters.min" | "filters.max"
  // ── Listings table ──
  | "table.listings" | "table.filteredFrom" | "table.listing" | "table.bath" | "table.sqft"
  | "table.status" | "table.link" | "table.furnishing" | "table.rent" | "table.noMatch"
  | "table.details" | "table.page" | "table.of" | "table.view" | "table.map" | "table.list"
  // ── Listing modal ──
  | "modal.askingRent" | "modal.vsFair" | "modal.location" | "modal.about"
  | "modal.facilities" | "modal.furnishings" | "modal.copyLink" | "modal.copied" | "modal.viewSh"
  | "modal.bed" | "modal.bath" | "modal.carpark"
  // ── Charts ──
  | "chart.priceDist" | "chart.tapToFilter" | "chart.bedroomTypes" | "chart.furnishing" | "chart.units"
  | "chart.median" | "chart.average" | "chart.fairPrice"
  // ── Market snapshot ──
  | "snap.title" | "snap.sub" | "snap.fairPrice" | "snap.totalListings" | "snap.avgSize"
  | "snap.topUnit" | "snap.spread" | "snap.stable" | "snap.balanced" | "snap.topHeavy" | "snap.skewed"
  // ── Fair price calculator ──
  | "calc.title" | "calc.sub" | "calc.reset" | "calc.bedrooms" | "calc.builtUp"
  | "calc.furnishing" | "calc.yourPrice" | "calc.optional" | "calc.estFair" | "calc.under" | "calc.fair" | "calc.over"
  // ── ROI calculator (Point 7) ──
  | "roi.title" | "roi.sub" | "roi.purchasePrice" | "roi.monthlyRent" | "roi.useFair"
  | "roi.grossYield" | "roi.netYield" | "roi.annualIncome" | "roi.payback" | "roi.years"
  | "roi.monthlyCosts" | "roi.maintenance" | "roi.result" | "roi.excellent" | "roi.good" | "roi.average" | "roi.low"
  | "roi.perYear" | "roi.assumption"
  // ── Price history ──
  | "hist.title" | "hist.lastDays" | "hist.trackingStarts" | "hist.trackingSub"
  | "hist.trendingUp" | "hist.trendingDown" | "hist.trendingFlat" | "hist.forecast" | "hist.projected"
  // ── Save alert ──
  | "alert.title" | "alert.sub" | "alert.email" | "alert.optional" | "alert.maxPrice" | "alert.minBed"
  | "alert.cancel" | "alert.save" | "alert.saving" | "alert.saved" | "alert.savedSub"
  // ── Comparison ──
  | "cmp.title" | "cmp.sub" | "cmp.saved" | "cmp.save" | "cmp.addPh" | "cmp.add"
  | "cmp.area" | "cmp.best" | "cmp.recommend" | "cmp.showDetails" | "cmp.hideDetails"
  | "cmp.bestValue" | "cmp.mostAffordable" | "cmp.largestUnits" | "cmp.mostOptions"
  | "cmp.need2" | "cmp.need1" | "cmp.listingsAnalyzed"
  // ── Recent searches ──
  | "recent.title" | "recent.clear" | "recent.listings"
  // ── Errors ──
  | "err.failed" | "err.dismiss" | "err.tryAgain" | "err.rateLimit";

type Translations = Record<TranslationKey, string>;

const EN: Translations = {
  "nav.home": "Home", "nav.analysis": "Analysis", "nav.admin": "Admin",
  "hero.eyebrow": "Malaysia Rental Price Intelligence",
  "hero.headline1": "Know the real", "hero.headline2": "rental market", "hero.headline3": "before you decide.",
  "hero.sub": "Scrape SPEEDHOME listings instantly, get fair price analysis, compare areas, and export professional reports.",
  "hero.popular": "Popular:",
  "search.placeholder": "Search area, apartment name...", "search.area": "Area / Property",
  "search.url": "SPEEDHOME URL", "search.analyze": "Analyze",
  "section.trending": "Trending rental markets", "section.viewAll": "View all areas",
  "stats.areas": "Areas Tracked", "stats.listings": "Active Listings",
  "stats.crawls": "Crawls Completed", "stats.accuracy": "Data Accuracy",
  "feat.title": "Everything for rental price intelligence",
  "feat.sub": "Professional-grade analytics for property investors, agents, and researchers.",
  "feat.analytics.title": "Price Analytics Engine",
  "feat.analytics.desc": "Average, median, mode, and fair price with automatic market classification.",
  "feat.compare.title": "Area Comparison",
  "feat.compare.desc": "Compare up to 5 areas side-by-side with interactive charts.",
  "feat.currency.title": "Multi-Currency",
  "feat.currency.desc": "View prices in 9 currencies. Exchange rates refreshed every 24 hours.",
  "feat.export.title": "Professional Export",
  "feat.export.desc": "Download Excel XLSX with 5 sheets: summary, listings, comparison, insights, currency.",
  "feat.crawl.title": "Lightning Fast Crawl",
  "feat.crawl.desc": "Playwright-powered with smart retry logic. Crawl any area in under 10 seconds.",
  "feat.robot.title": "Responsible Crawling",
  "feat.robot.desc": "Respects robots.txt, randomized delays, and rate limiting by default.",
  "how.title": "From search to insight in seconds",
  "how.sub": "Four simple steps to rental market intelligence.",
  "how.s1.title": "Search Area", "how.s1.desc": "Enter any area name, apartment, or paste a SPEEDHOME URL.",
  "how.s2.title": "Crawl & Collect", "how.s2.desc": "Our engine scrapes SPEEDHOME listings and normalises all data.",
  "how.s3.title": "Analyze", "how.s3.desc": "Analytics engine calculates fair price, distributions, and insights.",
  "how.s4.title": "Export", "how.s4.desc": "Download a professional Excel or CSV report with full analytics.",
  "cta.eyebrow": "Get Started Free",
  "cta.title": "Start analyzing any area now",
  "cta.sub": "No account needed. Search any area in Malaysia and get instant rental price intelligence.",
  "cta.button": "Open Dashboard",
  "dash.search": "Search area or URL...", "dash.filters": "Filters",
  "dash.compare": "Compare", "dash.refresh": "Refresh", "dash.export": "Export",
  "dash.live": "Live", "dash.listings": "listings", "dash.total": "total",
  "kpi.total": "Total Listings", "kpi.avg": "Average Rent", "kpi.median": "Median Rent",
  "kpi.fair": "Fair Price", "kpi.sqft": "Avg Sqft", "kpi.psf": "Price / Sqft", "kpi.topUnit": "Top Unit Type",
  "kpi.activeRentals": "active rentals", "kpi.perMonth": "/month", "kpi.middleValue": "middle value",
  "kpi.formula": "70% med + 30% avg", "kpi.unitSize": "unit size",
  "kpi.perSqft": "per sq ft", "kpi.mostCommon": "most common",
  "insight.title": "Market Insights",
  "empty.title": "Search an area to begin",
  "empty.sub": "Enter an area name, apartment, or SPEEDHOME URL above to start analyzing.",
  "empty.popular": "Popular areas to explore",
  "admin.title": "Admin Dashboard",
  "admin.sub": "Monitor crawlers, manage cache, and configure exchange rates.",
  "admin.tab.monitor": "Crawler Monitor", "admin.tab.history": "Scan History",
  "admin.tab.cache": "Cache Manager", "admin.tab.rates": "Exchange Rates",
  "footer.tagline": "Real-time rental price analytics for Malaysia, powered by live SPEEDHOME data.",
  // Dashboard
  "dash.alert": "Alert", "dash.share": "Share", "dash.shared": "Copied", "dash.cached": "Cached",
  "dash.crawledIn": "Crawled in", "dash.unitListings": "Unit Listings",
  // Period
  "period.daily": "Daily", "period.monthly": "Monthly", "period.yearly": "Yearly",
  // Filters
  "filters.title": "Filters", "filters.reset": "Reset all", "filters.search": "Search",
  "filters.searchPh": "Property name, area...", "filters.bedrooms": "Bedrooms",
  "filters.bathrooms": "Bathrooms", "filters.furnishing": "Furnishing",
  "filters.advanced": "Advanced filters", "filters.monthlyRent": "Monthly Rent (RM)",
  "filters.sqftRange": "Sqft Range", "filters.psf": "Price / Sqft (RM)",
  "filters.min": "Min", "filters.max": "Max",
  // Table
  "table.listings": "listings", "table.filteredFrom": "filtered from", "table.listing": "Listing",
  "table.bath": "Bath", "table.sqft": "Sqft", "table.status": "Status", "table.link": "Link",
  "table.furnishing": "Furnishing", "table.rent": "Rent", "table.noMatch": "No listings match your filters.",
  "table.details": "Details", "table.page": "Page", "table.of": "of",
  "table.view": "View", "table.map": "Map", "table.list": "List",
  // Modal
  "modal.askingRent": "Asking Rent", "modal.vsFair": "vs Fair Price", "modal.location": "Location",
  "modal.about": "About this place", "modal.facilities": "Facilities", "modal.furnishings": "Included furnishings",
  "modal.copyLink": "Copy link", "modal.copied": "Copied", "modal.viewSh": "View on SPEEDHOME",
  "modal.bed": "Bed", "modal.bath": "Bath", "modal.carpark": "carpark",
  // Charts
  "chart.priceDist": "Price Distribution", "chart.tapToFilter": "Tap a bar to filter listings",
  "chart.bedroomTypes": "Bedroom Types", "chart.furnishing": "Furnishing", "chart.units": "units",
  "chart.median": "Median", "chart.average": "Average", "chart.fairPrice": "Fair Price",
  // Snapshot
  "snap.title": "Market Snapshot", "snap.sub": "Quick read of the market", "snap.fairPrice": "Fair Price",
  "snap.totalListings": "Total listings", "snap.avgSize": "Avg unit size", "snap.topUnit": "Top unit type",
  "snap.spread": "Avg vs Median spread", "snap.stable": "Stable", "snap.balanced": "Balanced",
  "snap.topHeavy": "Top-heavy", "snap.skewed": "Skewed",
  // Calculator
  "calc.title": "Fair Price Calculator", "calc.sub": "Estimate based on this area", "calc.reset": "Reset",
  "calc.bedrooms": "Bedrooms", "calc.builtUp": "Built-up size", "calc.furnishing": "Furnishing",
  "calc.yourPrice": "Your price", "calc.optional": "(optional)", "calc.estFair": "Estimated fair rent",
  "calc.under": "Under", "calc.fair": "Fair", "calc.over": "Over",
  // ROI
  "roi.title": "Rental Yield Calculator", "roi.sub": "Estimate investment return",
  "roi.purchasePrice": "Purchase price", "roi.monthlyRent": "Monthly rent",
  "roi.useFair": "Use fair price", "roi.grossYield": "Gross Yield", "roi.netYield": "Net Yield",
  "roi.annualIncome": "Annual income", "roi.payback": "Payback period", "roi.years": "years",
  "roi.monthlyCosts": "Monthly costs", "roi.maintenance": "Maintenance & fees",
  "roi.result": "Estimated annual yield", "roi.excellent": "Excellent", "roi.good": "Good",
  "roi.average": "Average", "roi.low": "Low", "roi.perYear": "/year",
  "roi.assumption": "Net yield assumes the monthly costs you entered. Heuristic, not financial advice.",
  // History
  "hist.title": "Price History", "hist.lastDays": "last", "hist.trackingStarts": "Tracking starts now",
  "hist.trackingSub": "We'll record a snapshot each time this area is analyzed. Check back in 24h to see trends.",
  "hist.trendingUp": "Trending up", "hist.trendingDown": "Trending down", "hist.trendingFlat": "Trending flat",
  "hist.forecast": "forecast in 30 days", "hist.projected": "Projected fair price",
  // Save alert
  "alert.title": "Save this search", "alert.sub": "Get notified about", "alert.email": "Email",
  "alert.optional": "(optional)", "alert.maxPrice": "Max RM", "alert.minBed": "Min Bed",
  "alert.cancel": "Cancel", "alert.save": "Save alert", "alert.saving": "Saving...",
  "alert.saved": "Saved!", "alert.savedSub": "We'll keep an eye on it.",
  // Comparison
  "cmp.title": "Area Comparison", "cmp.sub": "Compare up to 5 areas", "cmp.saved": "Saved",
  "cmp.save": "Save", "cmp.addPh": "Add area to compare...", "cmp.add": "Add", "cmp.area": "Area",
  "cmp.best": "Best", "cmp.recommend": "Smart Recommendation:", "cmp.showDetails": "Show side-by-side details",
  "cmp.hideDetails": "Hide details", "cmp.bestValue": "BEST VALUE", "cmp.mostAffordable": "Most affordable",
  "cmp.largestUnits": "Largest units", "cmp.mostOptions": "Most options",
  "cmp.need2": "Add at least 2 areas to compare", "cmp.need1": "Add one more area to see the comparison",
  "cmp.listingsAnalyzed": "listings analyzed",
  // Recent
  "recent.title": "Recent Searches", "recent.clear": "Clear all", "recent.listings": "listings",
  // Errors
  "err.failed": "Analysis failed", "err.dismiss": "Dismiss", "err.tryAgain": "Try again",
  "err.rateLimit": "Rate limit reached. Please wait a moment.",
};

const MS: Translations = {
  "nav.home": "Utama", "nav.analysis": "Analisis", "nav.admin": "Pentadbir",
  "hero.eyebrow": "Perisikan Harga Sewa Malaysia",
  "hero.headline1": "Ketahui harga", "hero.headline2": "sewa sebenar", "hero.headline3": "sebelum membuat keputusan.",
  "hero.sub": "Kumpul senarai SPEEDHOME serta-merta, dapatkan analisis harga wajar, bandingkan kawasan, dan eksport laporan profesional.",
  "hero.popular": "Popular:",
  "search.placeholder": "Cari kawasan, nama apartmen...", "search.area": "Kawasan / Hartanah",
  "search.url": "URL SPEEDHOME", "search.analyze": "Analisis",
  "section.trending": "Pasaran sewa trending", "section.viewAll": "Lihat semua kawasan",
  "stats.areas": "Kawasan Dipantau", "stats.listings": "Senarai Aktif",
  "stats.crawls": "Crawl Selesai", "stats.accuracy": "Ketepatan Data",
  "feat.title": "Semua yang diperlukan untuk perisikan harga sewa",
  "feat.sub": "Analitik peringkat profesional untuk pelabur, ejen, dan penyelidik hartanah.",
  "feat.analytics.title": "Enjin Analitik Harga",
  "feat.analytics.desc": "Purata, median, mod, dan harga wajar dengan klasifikasi pasaran automatik.",
  "feat.compare.title": "Perbandingan Kawasan",
  "feat.compare.desc": "Bandingkan sehingga 5 kawasan secara berdampingan dengan carta interaktif.",
  "feat.currency.title": "Pelbagai Mata Wang",
  "feat.currency.desc": "Lihat harga dalam 9 mata wang. Kadar pertukaran dikemas kini setiap 24 jam.",
  "feat.export.title": "Eksport Profesional",
  "feat.export.desc": "Muat turun Excel XLSX dengan 5 helaian: ringkasan, senarai, perbandingan, perisikan, mata wang.",
  "feat.crawl.title": "Crawl Laju Kilat",
  "feat.crawl.desc": "Dikuasakan Playwright dengan logik cuba semula bijak. Crawl sebarang kawasan dalam masa 10 saat.",
  "feat.robot.title": "Crawling Bertanggungjawab",
  "feat.robot.desc": "Mematuhi robots.txt, kelewatan rawak, dan had kadar secara lalai.",
  "how.title": "Dari carian ke wawasan dalam beberapa saat",
  "how.sub": "Empat langkah mudah kepada perisikan pasaran sewa.",
  "how.s1.title": "Cari Kawasan", "how.s1.desc": "Masukkan nama kawasan, apartmen, atau tampal URL SPEEDHOME.",
  "how.s2.title": "Kumpul Data", "how.s2.desc": "Enjin kami mengikis senarai SPEEDHOME dan menormalkan semua data.",
  "how.s3.title": "Analisis", "how.s3.desc": "Enjin analitik mengira harga wajar, taburan, dan wawasan.",
  "how.s4.title": "Eksport", "how.s4.desc": "Muat turun laporan Excel atau CSV profesional dengan analitik penuh.",
  "cta.eyebrow": "Mulakan Percuma",
  "cta.title": "Mula menganalisis sebarang kawasan sekarang",
  "cta.sub": "Tiada akaun diperlukan. Cari sebarang kawasan di Malaysia dan dapatkan perisikan harga sewa serta-merta.",
  "cta.button": "Buka Papan Pemuka",
  "dash.search": "Cari kawasan atau URL...", "dash.filters": "Penapis",
  "dash.compare": "Bandingkan", "dash.refresh": "Muat Semula", "dash.export": "Eksport",
  "dash.live": "Langsung", "dash.listings": "senarai", "dash.total": "jumlah",
  "kpi.total": "Jumlah Senarai", "kpi.avg": "Sewa Purata", "kpi.median": "Sewa Median",
  "kpi.fair": "Harga Wajar", "kpi.sqft": "Purata Kaki Persegi", "kpi.psf": "Harga / Kaki Persegi", "kpi.topUnit": "Jenis Unit Teratas",
  "kpi.activeRentals": "sewa aktif", "kpi.perMonth": "/bulan", "kpi.middleValue": "nilai tengah",
  "kpi.formula": "70% med + 30% purata", "kpi.unitSize": "saiz unit",
  "kpi.perSqft": "per kaki persegi", "kpi.mostCommon": "paling biasa",
  "insight.title": "Wawasan Pasaran",
  "empty.title": "Cari kawasan untuk bermula",
  "empty.sub": "Masukkan nama kawasan, apartmen, atau URL SPEEDHOME di atas untuk mula menganalisis.",
  "empty.popular": "Kawasan popular untuk diterokai",
  "admin.title": "Papan Pemuka Pentadbir",
  "admin.sub": "Pantau crawler, urus cache, dan konfigurasikan kadar pertukaran.",
  "admin.tab.monitor": "Monitor Crawler", "admin.tab.history": "Sejarah Imbasan",
  "admin.tab.cache": "Pengurus Cache", "admin.tab.rates": "Kadar Pertukaran",
  "footer.tagline": "Analitik harga sewa masa nyata untuk Malaysia, dikuasakan oleh data SPEEDHOME langsung.",
  // Dashboard
  "dash.alert": "Amaran", "dash.share": "Kongsi", "dash.shared": "Disalin", "dash.cached": "Cache",
  "dash.crawledIn": "Crawl dalam", "dash.unitListings": "Senarai Unit",
  // Period
  "period.daily": "Harian", "period.monthly": "Bulanan", "period.yearly": "Tahunan",
  // Filters
  "filters.title": "Penapis", "filters.reset": "Set semula", "filters.search": "Cari",
  "filters.searchPh": "Nama hartanah, kawasan...", "filters.bedrooms": "Bilik Tidur",
  "filters.bathrooms": "Bilik Mandi", "filters.furnishing": "Perabot",
  "filters.advanced": "Penapis lanjutan", "filters.monthlyRent": "Sewa Bulanan (RM)",
  "filters.sqftRange": "Julat Kaki Persegi", "filters.psf": "Harga / Kaki Persegi (RM)",
  "filters.min": "Min", "filters.max": "Maks",
  // Table
  "table.listings": "senarai", "table.filteredFrom": "ditapis dari", "table.listing": "Senarai",
  "table.bath": "Mandi", "table.sqft": "Kaki²", "table.status": "Status", "table.link": "Pautan",
  "table.furnishing": "Perabot", "table.rent": "Sewa", "table.noMatch": "Tiada senarai sepadan dengan penapis anda.",
  "table.details": "Butiran", "table.page": "Halaman", "table.of": "daripada",
  "table.view": "Lihat", "table.map": "Peta", "table.list": "Senarai",
  // Modal
  "modal.askingRent": "Harga Sewa", "modal.vsFair": "vs Harga Wajar", "modal.location": "Lokasi",
  "modal.about": "Tentang tempat ini", "modal.facilities": "Kemudahan", "modal.furnishings": "Perabot disertakan",
  "modal.copyLink": "Salin pautan", "modal.copied": "Disalin", "modal.viewSh": "Lihat di SPEEDHOME",
  "modal.bed": "Bilik", "modal.bath": "Mandi", "modal.carpark": "tempat letak kereta",
  // Charts
  "chart.priceDist": "Taburan Harga", "chart.tapToFilter": "Ketik bar untuk menapis senarai",
  "chart.bedroomTypes": "Jenis Bilik Tidur", "chart.furnishing": "Perabot", "chart.units": "unit",
  "chart.median": "Median", "chart.average": "Purata", "chart.fairPrice": "Harga Wajar",
  // Snapshot
  "snap.title": "Gambaran Pasaran", "snap.sub": "Bacaan pantas pasaran", "snap.fairPrice": "Harga Wajar",
  "snap.totalListings": "Jumlah senarai", "snap.avgSize": "Purata saiz unit", "snap.topUnit": "Jenis unit teratas",
  "snap.spread": "Jurang purata vs median", "snap.stable": "Stabil", "snap.balanced": "Seimbang",
  "snap.topHeavy": "Berat atas", "snap.skewed": "Pencong",
  // Calculator
  "calc.title": "Kalkulator Harga Wajar", "calc.sub": "Anggaran berdasarkan kawasan ini", "calc.reset": "Set semula",
  "calc.bedrooms": "Bilik Tidur", "calc.builtUp": "Saiz binaan", "calc.furnishing": "Perabot",
  "calc.yourPrice": "Harga anda", "calc.optional": "(pilihan)", "calc.estFair": "Anggaran sewa wajar",
  "calc.under": "Bawah", "calc.fair": "Wajar", "calc.over": "Atas",
  // ROI
  "roi.title": "Kalkulator Hasil Sewa", "roi.sub": "Anggaran pulangan pelaburan",
  "roi.purchasePrice": "Harga belian", "roi.monthlyRent": "Sewa bulanan",
  "roi.useFair": "Guna harga wajar", "roi.grossYield": "Hasil Kasar", "roi.netYield": "Hasil Bersih",
  "roi.annualIncome": "Pendapatan tahunan", "roi.payback": "Tempoh pulang modal", "roi.years": "tahun",
  "roi.monthlyCosts": "Kos bulanan", "roi.maintenance": "Penyelenggaraan & yuran",
  "roi.result": "Anggaran hasil tahunan", "roi.excellent": "Cemerlang", "roi.good": "Baik",
  "roi.average": "Sederhana", "roi.low": "Rendah", "roi.perYear": "/tahun",
  "roi.assumption": "Hasil bersih menganggap kos bulanan yang anda masukkan. Heuristik, bukan nasihat kewangan.",
  // History
  "hist.title": "Sejarah Harga", "hist.lastDays": "akhir", "hist.trackingStarts": "Penjejakan bermula sekarang",
  "hist.trackingSub": "Kami akan merekod gambaran setiap kali kawasan ini dianalisis. Semak semula dalam 24j untuk melihat trend.",
  "hist.trendingUp": "Trend naik", "hist.trendingDown": "Trend turun", "hist.trendingFlat": "Trend mendatar",
  "hist.forecast": "ramalan dalam 30 hari", "hist.projected": "Unjuran harga wajar",
  // Save alert
  "alert.title": "Simpan carian ini", "alert.sub": "Dapatkan notifikasi tentang", "alert.email": "E-mel",
  "alert.optional": "(pilihan)", "alert.maxPrice": "Maks RM", "alert.minBed": "Min Bilik",
  "alert.cancel": "Batal", "alert.save": "Simpan amaran", "alert.saving": "Menyimpan...",
  "alert.saved": "Disimpan!", "alert.savedSub": "Kami akan memantaunya.",
  // Comparison
  "cmp.title": "Perbandingan Kawasan", "cmp.sub": "Bandingkan sehingga 5 kawasan", "cmp.saved": "Disimpan",
  "cmp.save": "Simpan", "cmp.addPh": "Tambah kawasan untuk dibandingkan...", "cmp.add": "Tambah", "cmp.area": "Kawasan",
  "cmp.best": "Terbaik", "cmp.recommend": "Cadangan Pintar:", "cmp.showDetails": "Tunjuk butiran sebelah-menyebelah",
  "cmp.hideDetails": "Sembunyi butiran", "cmp.bestValue": "NILAI TERBAIK", "cmp.mostAffordable": "Paling mampu milik",
  "cmp.largestUnits": "Unit terbesar", "cmp.mostOptions": "Paling banyak pilihan",
  "cmp.need2": "Tambah sekurang-kurangnya 2 kawasan untuk membandingkan", "cmp.need1": "Tambah satu lagi kawasan untuk melihat perbandingan",
  "cmp.listingsAnalyzed": "senarai dianalisis",
  // Recent
  "recent.title": "Carian Terkini", "recent.clear": "Kosongkan semua", "recent.listings": "senarai",
  // Errors
  "err.failed": "Analisis gagal", "err.dismiss": "Tolak", "err.tryAgain": "Cuba lagi",
  "err.rateLimit": "Had kadar dicapai. Sila tunggu sebentar.",
};

const ID: Translations = {
  "nav.home": "Beranda", "nav.analysis": "Analisis", "nav.admin": "Admin",
  "hero.eyebrow": "Intelijen Harga Sewa Malaysia",
  "hero.headline1": "Ketahui harga", "hero.headline2": "sewa sebenarnya", "hero.headline3": "sebelum memutuskan.",
  "hero.sub": "Kumpulkan listing SPEEDHOME seketika, dapatkan analisis harga wajar, bandingkan area, dan ekspor laporan profesional.",
  "hero.popular": "Populer:",
  "search.placeholder": "Cari area, nama apartmen...", "search.area": "Area / Properti",
  "search.url": "URL SPEEDHOME", "search.analyze": "Analisis",
  "section.trending": "Pasar sewa trending", "section.viewAll": "Lihat semua area",
  "stats.areas": "Area Dipantau", "stats.listings": "Listing Aktif",
  "stats.crawls": "Crawl Selesai", "stats.accuracy": "Akurasi Data",
  "feat.title": "Semua yang dibutuhkan untuk intelijen harga sewa",
  "feat.sub": "Analitik tingkat profesional untuk investor, agen, dan peneliti properti.",
  "feat.analytics.title": "Mesin Analitik Harga",
  "feat.analytics.desc": "Rata-rata, median, modus, dan harga wajar dengan klasifikasi pasar otomatis.",
  "feat.compare.title": "Perbandingan Area",
  "feat.compare.desc": "Bandingkan hingga 5 area secara berdampingan dengan grafik interaktif.",
  "feat.currency.title": "Multi-Mata Uang",
  "feat.currency.desc": "Lihat harga dalam 9 mata uang. Kurs diperbarui setiap 24 jam.",
  "feat.export.title": "Ekspor Profesional",
  "feat.export.desc": "Unduh Excel XLSX dengan 5 lembar: ringkasan, listing, perbandingan, wawasan, mata uang.",
  "feat.crawl.title": "Crawl Super Cepat",
  "feat.crawl.desc": "Didukung Playwright dengan logika retry cerdas. Crawl area mana pun dalam 10 detik.",
  "feat.robot.title": "Crawling Bertanggung Jawab",
  "feat.robot.desc": "Menghormati robots.txt, delay acak, dan pembatasan rate secara default.",
  "how.title": "Dari pencarian ke wawasan dalam hitungan detik",
  "how.sub": "Empat langkah sederhana menuju intelijen pasar sewa.",
  "how.s1.title": "Cari Area", "how.s1.desc": "Masukkan nama area, apartmen, atau tempel URL SPEEDHOME.",
  "how.s2.title": "Kumpulkan Data", "how.s2.desc": "Mesin kami mengikis listing SPEEDHOME dan menormalisasi semua data.",
  "how.s3.title": "Analisis", "how.s3.desc": "Mesin analitik menghitung harga wajar, distribusi, dan wawasan.",
  "how.s4.title": "Ekspor", "how.s4.desc": "Unduh laporan Excel atau CSV profesional dengan analitik lengkap.",
  "cta.eyebrow": "Mulai Gratis",
  "cta.title": "Mulai analisis area mana pun sekarang",
  "cta.sub": "Tidak perlu akun. Cari area mana pun di Malaysia dan dapatkan intelijen harga sewa seketika.",
  "cta.button": "Buka Dashboard",
  "dash.search": "Cari area atau URL...", "dash.filters": "Filter",
  "dash.compare": "Bandingkan", "dash.refresh": "Segarkan", "dash.export": "Ekspor",
  "dash.live": "Langsung", "dash.listings": "listing", "dash.total": "total",
  "kpi.total": "Total Listing", "kpi.avg": "Sewa Rata-rata", "kpi.median": "Sewa Median",
  "kpi.fair": "Harga Wajar", "kpi.sqft": "Rata-rata Sqft", "kpi.psf": "Harga / Sqft", "kpi.topUnit": "Tipe Unit Teratas",
  "kpi.activeRentals": "sewa aktif", "kpi.perMonth": "/bulan", "kpi.middleValue": "nilai tengah",
  "kpi.formula": "70% med + 30% rata-rata", "kpi.unitSize": "ukuran unit",
  "kpi.perSqft": "per sqft", "kpi.mostCommon": "paling umum",
  "insight.title": "Wawasan Pasar",
  "empty.title": "Cari area untuk memulai",
  "empty.sub": "Masukkan nama area, apartmen, atau URL SPEEDHOME di atas untuk mulai menganalisis.",
  "empty.popular": "Area populer untuk dieksplorasi",
  "admin.title": "Dashboard Admin",
  "admin.sub": "Pantau crawler, kelola cache, dan konfigurasi kurs tukar.",
  "admin.tab.monitor": "Monitor Crawler", "admin.tab.history": "Riwayat Scan",
  "admin.tab.cache": "Manajer Cache", "admin.tab.rates": "Kurs Tukar",
  "footer.tagline": "Analitik harga sewa real-time untuk Malaysia, didukung data SPEEDHOME langsung.",
  // Dashboard
  "dash.alert": "Peringatan", "dash.share": "Bagikan", "dash.shared": "Disalin", "dash.cached": "Cache",
  "dash.crawledIn": "Crawl dalam", "dash.unitListings": "Daftar Unit",
  // Period
  "period.daily": "Harian", "period.monthly": "Bulanan", "period.yearly": "Tahunan",
  // Filters
  "filters.title": "Filter", "filters.reset": "Atur ulang", "filters.search": "Cari",
  "filters.searchPh": "Nama properti, area...", "filters.bedrooms": "Kamar Tidur",
  "filters.bathrooms": "Kamar Mandi", "filters.furnishing": "Perabotan",
  "filters.advanced": "Filter lanjutan", "filters.monthlyRent": "Sewa Bulanan (RM)",
  "filters.sqftRange": "Rentang Sqft", "filters.psf": "Harga / Sqft (RM)",
  "filters.min": "Min", "filters.max": "Maks",
  // Table
  "table.listings": "listing", "table.filteredFrom": "difilter dari", "table.listing": "Listing",
  "table.bath": "Mandi", "table.sqft": "Sqft", "table.status": "Status", "table.link": "Tautan",
  "table.furnishing": "Perabotan", "table.rent": "Sewa", "table.noMatch": "Tidak ada listing yang cocok dengan filter Anda.",
  "table.details": "Detail", "table.page": "Halaman", "table.of": "dari",
  "table.view": "Lihat", "table.map": "Peta", "table.list": "Daftar",
  // Modal
  "modal.askingRent": "Harga Sewa", "modal.vsFair": "vs Harga Wajar", "modal.location": "Lokasi",
  "modal.about": "Tentang tempat ini", "modal.facilities": "Fasilitas", "modal.furnishings": "Perabotan termasuk",
  "modal.copyLink": "Salin tautan", "modal.copied": "Disalin", "modal.viewSh": "Lihat di SPEEDHOME",
  "modal.bed": "Kamar", "modal.bath": "Mandi", "modal.carpark": "parkir",
  // Charts
  "chart.priceDist": "Distribusi Harga", "chart.tapToFilter": "Ketuk bar untuk memfilter listing",
  "chart.bedroomTypes": "Tipe Kamar Tidur", "chart.furnishing": "Perabotan", "chart.units": "unit",
  "chart.median": "Median", "chart.average": "Rata-rata", "chart.fairPrice": "Harga Wajar",
  // Snapshot
  "snap.title": "Ringkasan Pasar", "snap.sub": "Bacaan cepat pasar", "snap.fairPrice": "Harga Wajar",
  "snap.totalListings": "Total listing", "snap.avgSize": "Rata-rata ukuran unit", "snap.topUnit": "Tipe unit teratas",
  "snap.spread": "Selisih rata-rata vs median", "snap.stable": "Stabil", "snap.balanced": "Seimbang",
  "snap.topHeavy": "Berat atas", "snap.skewed": "Miring",
  // Calculator
  "calc.title": "Kalkulator Harga Wajar", "calc.sub": "Estimasi berdasarkan area ini", "calc.reset": "Atur ulang",
  "calc.bedrooms": "Kamar Tidur", "calc.builtUp": "Ukuran bangunan", "calc.furnishing": "Perabotan",
  "calc.yourPrice": "Harga Anda", "calc.optional": "(opsional)", "calc.estFair": "Estimasi sewa wajar",
  "calc.under": "Bawah", "calc.fair": "Wajar", "calc.over": "Atas",
  // ROI
  "roi.title": "Kalkulator Imbal Hasil Sewa", "roi.sub": "Estimasi pengembalian investasi",
  "roi.purchasePrice": "Harga beli", "roi.monthlyRent": "Sewa bulanan",
  "roi.useFair": "Pakai harga wajar", "roi.grossYield": "Yield Kotor", "roi.netYield": "Yield Bersih",
  "roi.annualIncome": "Pendapatan tahunan", "roi.payback": "Periode balik modal", "roi.years": "tahun",
  "roi.monthlyCosts": "Biaya bulanan", "roi.maintenance": "Perawatan & biaya",
  "roi.result": "Estimasi yield tahunan", "roi.excellent": "Sangat baik", "roi.good": "Baik",
  "roi.average": "Rata-rata", "roi.low": "Rendah", "roi.perYear": "/tahun",
  "roi.assumption": "Yield bersih mengasumsikan biaya bulanan yang Anda masukkan. Heuristik, bukan nasihat keuangan.",
  // History
  "hist.title": "Riwayat Harga", "hist.lastDays": "terakhir", "hist.trackingStarts": "Pelacakan dimulai sekarang",
  "hist.trackingSub": "Kami akan merekam snapshot setiap kali area ini dianalisis. Kembali dalam 24j untuk melihat tren.",
  "hist.trendingUp": "Tren naik", "hist.trendingDown": "Tren turun", "hist.trendingFlat": "Tren datar",
  "hist.forecast": "perkiraan dalam 30 hari", "hist.projected": "Proyeksi harga wajar",
  // Save alert
  "alert.title": "Simpan pencarian ini", "alert.sub": "Dapatkan notifikasi tentang", "alert.email": "Email",
  "alert.optional": "(opsional)", "alert.maxPrice": "Maks RM", "alert.minBed": "Min Kamar",
  "alert.cancel": "Batal", "alert.save": "Simpan peringatan", "alert.saving": "Menyimpan...",
  "alert.saved": "Tersimpan!", "alert.savedSub": "Kami akan memantaunya.",
  // Comparison
  "cmp.title": "Perbandingan Area", "cmp.sub": "Bandingkan hingga 5 area", "cmp.saved": "Tersimpan",
  "cmp.save": "Simpan", "cmp.addPh": "Tambah area untuk dibandingkan...", "cmp.add": "Tambah", "cmp.area": "Area",
  "cmp.best": "Terbaik", "cmp.recommend": "Rekomendasi Cerdas:", "cmp.showDetails": "Tampilkan detail berdampingan",
  "cmp.hideDetails": "Sembunyikan detail", "cmp.bestValue": "NILAI TERBAIK", "cmp.mostAffordable": "Paling terjangkau",
  "cmp.largestUnits": "Unit terbesar", "cmp.mostOptions": "Paling banyak pilihan",
  "cmp.need2": "Tambah minimal 2 area untuk membandingkan", "cmp.need1": "Tambah satu area lagi untuk melihat perbandingan",
  "cmp.listingsAnalyzed": "listing dianalisis",
  // Recent
  "recent.title": "Pencarian Terkini", "recent.clear": "Hapus semua", "recent.listings": "listing",
  // Errors
  "err.failed": "Analisis gagal", "err.dismiss": "Tutup", "err.tryAgain": "Coba lagi",
  "err.rateLimit": "Batas permintaan tercapai. Mohon tunggu sebentar.",
};

const ZH: Translations = {
  "nav.home": "首页", "nav.analysis": "分析", "nav.admin": "管理",
  "hero.eyebrow": "马来西亚租金价格情报",
  "hero.headline1": "了解真实的", "hero.headline2": "租房市场", "hero.headline3": "再做决定。",
  "hero.sub": "即时抓取SPEEDHOME房源，获取公平价格分析，比较区域，导出专业报告。",
  "hero.popular": "热门区域：",
  "search.placeholder": "搜索区域、公寓名称...", "search.area": "区域 / 房产",
  "search.url": "SPEEDHOME 链接", "search.analyze": "分析",
  "section.trending": "热门租赁市场", "section.viewAll": "查看所有区域",
  "stats.areas": "跟踪区域", "stats.listings": "活跃房源",
  "stats.crawls": "完成爬取", "stats.accuracy": "数据准确率",
  "feat.title": "租金价格情报的一切",
  "feat.sub": "为房产投资者、经纪人和研究人员提供专业级分析。",
  "feat.analytics.title": "价格分析引擎",
  "feat.analytics.desc": "平均值、中位数、众数和公平价格，自动市场分类。",
  "feat.compare.title": "区域比较",
  "feat.compare.desc": "通过交互式图表并排比较最多5个区域。",
  "feat.currency.title": "多币种支持",
  "feat.currency.desc": "查看9种货币的价格。汇率每24小时更新一次。",
  "feat.export.title": "专业导出",
  "feat.export.desc": "下载包含5个工作表的Excel：摘要、房源、比较、洞察、货币。",
  "feat.crawl.title": "极速爬取",
  "feat.crawl.desc": "由Playwright驱动，智能重试逻辑。10秒内爬取任何区域。",
  "feat.robot.title": "负责任爬取",
  "feat.robot.desc": "默认遵守robots.txt、随机延迟和速率限制。",
  "how.title": "从搜索到洞察只需几秒",
  "how.sub": "四个简单步骤获得租赁市场情报。",
  "how.s1.title": "搜索区域", "how.s1.desc": "输入区域名称、公寓，或粘贴SPEEDHOME链接。",
  "how.s2.title": "采集数据", "how.s2.desc": "我们的引擎抓取SPEEDHOME房源并规范化所有数据。",
  "how.s3.title": "分析", "how.s3.desc": "分析引擎计算公平价格、分布和洞察。",
  "how.s4.title": "导出", "how.s4.desc": "下载包含完整分析的专业Excel或CSV报告。",
  "cta.eyebrow": "免费开始",
  "cta.title": "立即开始分析任何区域",
  "cta.sub": "无需账户。搜索马来西亚任何区域，立即获得租金价格情报。",
  "cta.button": "打开仪表板",
  "dash.search": "搜索区域或链接...", "dash.filters": "筛选",
  "dash.compare": "比较", "dash.refresh": "刷新", "dash.export": "导出",
  "dash.live": "实时", "dash.listings": "房源", "dash.total": "共",
  "kpi.total": "总房源", "kpi.avg": "平均租金", "kpi.median": "中位租金",
  "kpi.fair": "公平价格", "kpi.sqft": "平均面积", "kpi.psf": "每平方英尺价格", "kpi.topUnit": "主要户型",
  "kpi.activeRentals": "活跃租赁", "kpi.perMonth": "/月", "kpi.middleValue": "中间值",
  "kpi.formula": "70%中位数+30%均值", "kpi.unitSize": "单位面积",
  "kpi.perSqft": "每平方英尺", "kpi.mostCommon": "最常见",
  "insight.title": "市场洞察",
  "empty.title": "搜索区域开始分析",
  "empty.sub": "在上方输入区域名称、公寓或SPEEDHOME链接开始分析。",
  "empty.popular": "探索热门区域",
  "admin.title": "管理仪表板",
  "admin.sub": "监控爬虫、管理缓存并配置汇率。",
  "admin.tab.monitor": "爬虫监控", "admin.tab.history": "扫描历史",
  "admin.tab.cache": "缓存管理", "admin.tab.rates": "汇率",
  "footer.tagline": "为马来西亚提供实时租金价格分析，由SPEEDHOME实时数据驱动。",
  // Dashboard
  "dash.alert": "提醒", "dash.share": "分享", "dash.shared": "已复制", "dash.cached": "缓存",
  "dash.crawledIn": "爬取用时", "dash.unitListings": "房源列表",
  // Period
  "period.daily": "每日", "period.monthly": "每月", "period.yearly": "每年",
  // Filters
  "filters.title": "筛选", "filters.reset": "重置全部", "filters.search": "搜索",
  "filters.searchPh": "房产名称、区域...", "filters.bedrooms": "卧室",
  "filters.bathrooms": "浴室", "filters.furnishing": "家具",
  "filters.advanced": "高级筛选", "filters.monthlyRent": "月租 (RM)",
  "filters.sqftRange": "面积范围", "filters.psf": "每平方英尺价格 (RM)",
  "filters.min": "最小", "filters.max": "最大",
  // Table
  "table.listings": "房源", "table.filteredFrom": "筛选自", "table.listing": "房源",
  "table.bath": "浴室", "table.sqft": "面积", "table.status": "状态", "table.link": "链接",
  "table.furnishing": "家具", "table.rent": "租金", "table.noMatch": "没有符合筛选条件的房源。",
  "table.details": "详情", "table.page": "第", "table.of": "页 共",
  "table.view": "查看", "table.map": "地图", "table.list": "列表",
  // Modal
  "modal.askingRent": "要价", "modal.vsFair": "对比公平价格", "modal.location": "位置",
  "modal.about": "关于此房源", "modal.facilities": "设施", "modal.furnishings": "包含家具",
  "modal.copyLink": "复制链接", "modal.copied": "已复制", "modal.viewSh": "在SPEEDHOME查看",
  "modal.bed": "卧室", "modal.bath": "浴室", "modal.carpark": "停车位",
  // Charts
  "chart.priceDist": "价格分布", "chart.tapToFilter": "点击柱状图筛选房源",
  "chart.bedroomTypes": "卧室类型", "chart.furnishing": "家具", "chart.units": "套",
  "chart.median": "中位数", "chart.average": "平均", "chart.fairPrice": "公平价格",
  // Snapshot
  "snap.title": "市场快照", "snap.sub": "快速了解市场", "snap.fairPrice": "公平价格",
  "snap.totalListings": "总房源", "snap.avgSize": "平均面积", "snap.topUnit": "主要户型",
  "snap.spread": "平均值与中位数差", "snap.stable": "稳定", "snap.balanced": "平衡",
  "snap.topHeavy": "高端偏重", "snap.skewed": "偏斜",
  // Calculator
  "calc.title": "公平价格计算器", "calc.sub": "基于此区域的估算", "calc.reset": "重置",
  "calc.bedrooms": "卧室", "calc.builtUp": "建筑面积", "calc.furnishing": "家具",
  "calc.yourPrice": "您的价格", "calc.optional": "(可选)", "calc.estFair": "估算公平租金",
  "calc.under": "偏低", "calc.fair": "公平", "calc.over": "偏高",
  // ROI
  "roi.title": "租金回报计算器", "roi.sub": "估算投资回报",
  "roi.purchasePrice": "购买价格", "roi.monthlyRent": "月租金",
  "roi.useFair": "使用公平价格", "roi.grossYield": "毛收益率", "roi.netYield": "净收益率",
  "roi.annualIncome": "年收入", "roi.payback": "回本周期", "roi.years": "年",
  "roi.monthlyCosts": "月成本", "roi.maintenance": "维护与费用",
  "roi.result": "估算年收益率", "roi.excellent": "优秀", "roi.good": "良好",
  "roi.average": "一般", "roi.low": "偏低", "roi.perYear": "/年",
  "roi.assumption": "净收益率基于您输入的月成本。仅为启发式估算，非财务建议。",
  // History
  "hist.title": "价格历史", "hist.lastDays": "最近", "hist.trackingStarts": "开始追踪",
  "hist.trackingSub": "每次分析此区域时我们都会记录快照。24小时后回来查看趋势。",
  "hist.trendingUp": "上升趋势", "hist.trendingDown": "下降趋势", "hist.trendingFlat": "平稳趋势",
  "hist.forecast": "30天预测", "hist.projected": "预测公平价格",
  // Save alert
  "alert.title": "保存此搜索", "alert.sub": "获取通知关于", "alert.email": "邮箱",
  "alert.optional": "(可选)", "alert.maxPrice": "最高 RM", "alert.minBed": "最少卧室",
  "alert.cancel": "取消", "alert.save": "保存提醒", "alert.saving": "保存中...",
  "alert.saved": "已保存！", "alert.savedSub": "我们会持续关注。",
  // Comparison
  "cmp.title": "区域比较", "cmp.sub": "最多比较5个区域", "cmp.saved": "已保存",
  "cmp.save": "保存", "cmp.addPh": "添加要比较的区域...", "cmp.add": "添加", "cmp.area": "区域",
  "cmp.best": "最佳", "cmp.recommend": "智能推荐：", "cmp.showDetails": "显示并排详情",
  "cmp.hideDetails": "隐藏详情", "cmp.bestValue": "最佳价值", "cmp.mostAffordable": "最实惠",
  "cmp.largestUnits": "最大单位", "cmp.mostOptions": "最多选择",
  "cmp.need2": "添加至少2个区域进行比较", "cmp.need1": "再添加一个区域查看比较",
  "cmp.listingsAnalyzed": "已分析房源",
  // Recent
  "recent.title": "最近搜索", "recent.clear": "清除全部", "recent.listings": "房源",
  // Errors
  "err.failed": "分析失败", "err.dismiss": "关闭", "err.tryAgain": "重试",
  "err.rateLimit": "已达请求上限。请稍候。",
};

const DICT: Record<Lang, Translations> = { en: EN, ms: MS, id: ID, zh: ZH };

export function t(lang: Lang, key: TranslationKey): string {
  return DICT[lang]?.[key] ?? DICT.en[key] ?? key;
}
