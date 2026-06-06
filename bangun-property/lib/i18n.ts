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
  | "footer.tagline";

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
};

const DICT: Record<Lang, Translations> = { en: EN, ms: MS, id: ID, zh: ZH };

export function t(lang: Lang, key: TranslationKey): string {
  return DICT[lang]?.[key] ?? DICT.en[key] ?? key;
}
