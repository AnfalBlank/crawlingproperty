import { SpeedhomeProperty, CrawlResult } from "./types";
import {
  AreaAnalysis, Listing, Furnishing,
} from "@/types";
import {
  calcPriceSummary, calcPriceDistribution, generateInsights, getFairPriceStatus,
} from "@/lib/utils";

// ─── Map SPEEDHOME furnish type → our Furnishing enum ────────────────────────

function mapFurnishing(raw?: string): Furnishing {
  switch ((raw || "").toUpperCase()) {
    case "FULL":
    case "FULLY":
      return "Fully Furnished";
    case "PARTIAL":
    case "PARTIALLY":
      return "Partially Furnished";
    default:
      return "Unfurnished";
  }
}

function mapBedrooms(p: SpeedhomeProperty): number | "Studio" {
  // Studio = roomType or 0/1 bed studio
  if (p.roomType && /studio/i.test(p.roomType)) return "Studio";
  if (p.bedroom === 0 || p.bedroom == null) return "Studio";
  return p.bedroom;
}

// ─── Transform a raw property → Listing (PRD §11) ────────────────────────────

export function toListing(p: SpeedhomeProperty, area: string): Listing | null {
  const monthlyRent = typeof p.price === "number" && p.price > 0 ? p.price : null;
  const sqft = typeof p.sqft === "number" && p.sqft > 0 ? p.sqft : 0;

  // Skip listings without a usable price
  if (monthlyRent === null) return null;

  const pricePerSqft = sqft > 0 ? Math.round((monthlyRent / sqft) * 100) / 100 : 0;

  const slugPath = p.slug || p.ref || String(p.id);
  const url = p.slug
    ? `https://speedhome.com/${p.slug}`
    : `https://speedhome.com/rent/property/${p.ref || p.id}`;

  // Extract images (already full URLs from SPEEDHOME)
  const images = (p.images || [])
    .map((i) => i.imageUrl || i.url)
    .filter((u): u is string => !!u)
    .slice(0, 8);

  return {
    id: String(p.id),
    title: p.name || "Untitled Property",
    propertyName: p.name || "",
    area,
    bedrooms: mapBedrooms(p),
    bathrooms: typeof p.bathroom === "number" ? p.bathroom : 0,
    monthlyRent,
    yearlyRent: Math.round(monthlyRent * 12),
    dailyRent: null, // SPEEDHOME long-term rentals don't expose daily
    sqft,
    pricePerSqft,
    furnishing: mapFurnishing(p.furnishType),
    url,
    scrapedAt: new Date().toISOString(),
    description: p.description,
    images,
    latitude: p.latitude,
    longitude: p.longitude,
    address: p.address,
    carpark: p.carpark,
    facilities: p.facilities,
    furnishes: p.furnishes,
  };
}

// ─── Build full AreaAnalysis from a CrawlResult (PRD §12-18) ─────────────────

export function buildAnalysis(crawl: CrawlResult): AreaAnalysis {
  const { area, properties, durationMs } = crawl;

  // Transform + filter
  const listings = properties
    .map((p) => toListing(p, area))
    .filter((l): l is Listing => l !== null);

  const summary = calcPriceSummary(listings, area);

  // Fair price classification (PRD §13)
  const enriched = listings.map((l) => ({
    ...l,
    fairPriceStatus: l.monthlyRent
      ? getFairPriceStatus(l.monthlyRent, summary.fairPrice)
      : undefined,
  }));

  // Price distribution histogram (PRD §16)
  const priceDistribution = calcPriceDistribution(listings);

  // Bedroom distribution (PRD §17)
  const bedroomMap: Record<string, number> = {};
  for (const l of listings) {
    const key = l.bedrooms === "Studio" ? "Studio" : `${l.bedrooms}BR`;
    bedroomMap[key] = (bedroomMap[key] || 0) + 1;
  }
  const bedroomDistribution = Object.entries(bedroomMap)
    .map(([label, count]) => ({
      label,
      count,
      percentage: listings.length ? Math.round((count / listings.length) * 100) : 0,
    }))
    .sort((a, b) => {
      const order = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];
      return order.indexOf(a.label) - order.indexOf(b.label);
    });

  // Furnishing distribution (PRD §18)
  const furnMap: Record<string, number> = {};
  for (const l of listings) {
    furnMap[l.furnishing] = (furnMap[l.furnishing] || 0) + 1;
  }
  const furnishingDistribution = (["Fully Furnished", "Partially Furnished", "Unfurnished"] as Furnishing[])
    .filter((label) => furnMap[label])
    .map((label) => ({
      label,
      count: furnMap[label],
      percentage: listings.length ? Math.round((furnMap[label] / listings.length) * 100) : 0,
    }));

  // Insights (PRD §15)
  const insights = generateInsights(area, summary, listings);

  return {
    area,
    summary,
    listings: enriched,
    priceDistribution,
    bedroomDistribution,
    furnishingDistribution,
    insights,
    lastUpdated: new Date().toISOString(),
    crawlDuration: Math.round(durationMs / 1000),
  };
}
