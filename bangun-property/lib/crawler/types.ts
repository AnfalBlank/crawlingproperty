// Raw SPEEDHOME property shape from __NEXT_DATA__.props.pageProps.propertyList.content[]
export interface SpeedhomeProperty {
  id: number;
  ref: string;
  name: string;
  address?: string;
  type?: string;
  furnishType?: "FULL" | "PARTIAL" | "NONE" | string;
  roomType?: string | null;
  status?: string;
  sqft?: number;
  bedroom?: number;
  bathroom?: number;
  carpark?: number;
  price?: number;
  postcode?: string;
  slug?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  images?: { url?: string; imageUrl?: string }[];
  description?: string;
  facilities?: string[];
  furnishes?: string[];
}

export interface SpeedhomePropertyList {
  content: SpeedhomeProperty[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface CrawlResult {
  area: string;
  slug: string;
  properties: SpeedhomeProperty[];
  totalElements: number;
  pagesCrawled: number;
  durationMs: number;
}

export interface CrawlOptions {
  maxPages?: number;        // cap pages to crawl (default 3)
  onProgress?: (stage: string, pct: number) => void;
}
