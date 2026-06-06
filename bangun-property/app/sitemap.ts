import type { MetadataRoute } from "next";

/**
 * Item 14 — Sitemap (PRD §41 SEO)
 * Listing the popular Klang Valley areas so search engines can crawl per-area pages.
 */

const POPULAR = [
  "Mont Kiara", "KLCC", "Bangsar", "Bangsar South", "Petaling Jaya",
  "Subang Jaya", "Damansara", "Cheras", "Puchong", "Kepong",
  "Setapak", "Sri Hartamas", "Ampang", "Gombak", "Wangsa Maju",
  "Old Klang Road", "Kuchai Lama", "Sungai Buloh", "Shah Alam", "Klang",
];

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://estate-insight.example.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`,         lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/analysis`, lastModified: now, changeFrequency: "daily",   priority: 0.9 },
  ];

  const areaPages: MetadataRoute.Sitemap = POPULAR.map((area) => ({
    url: `${base}/area/${slugify(area)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...areaPages];
}
