"use client";

/**
 * Item 6 — Map view (PRD §33)
 * Renders all listings as colour-coded markers on Leaflet.
 * Color: green = under market, red = overpriced, ink = fair.
 */

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Listing } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

interface Props {
  listings: Listing[];
  onSelect?: (listing: Listing) => void;
}

const DEFAULT_CENTER: [number, number] = [3.139, 101.687]; // KL center

const COLOURS = {
  "Under Market": "#10b981",
  "Fair":        "#222222",
  "Overpriced":  "#ef4444",
} as const;

function makeIcon(color: string) {
  return L.divIcon({
    className: "leaflet-status-pin",
    html: `
      <div style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));">
        <svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" width="28" height="36">
          <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.7-6.3-14-14-14z" fill="${color}"/>
          <circle cx="14" cy="14" r="5" fill="white"/>
        </svg>
      </div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
  }, [points, map]);
  return null;
}

export default function ListingsMap({ listings, onSelect }: Props) {
  const { currency, getRate } = useAppStore();
  const rate = getRate();

  // Only listings with coordinates can be plotted
  const plottable = useMemo(
    () => listings.filter((l) => l.latitude != null && l.longitude != null),
    [listings]
  );

  const [showLegend, setShowLegend] = useState(true);

  if (plottable.length === 0) {
    return (
      <div className="rounded-xl border border-hairline bg-canvas dark:bg-canvas p-8 text-center">
        <p className="text-sm font-semibold text-ink mb-1">No locations available</p>
        <p className="text-xs text-muted">
          Listings in this batch don&apos;t include map coordinates yet.
        </p>
      </div>
    );
  }

  const center: [number, number] = [
    plottable[0].latitude as number,
    plottable[0].longitude as number,
  ];
  const points: [number, number][] = plottable.map((l) => [l.latitude!, l.longitude!]);

  return (
    <div className="relative rounded-xl border border-hairline bg-canvas dark:bg-canvas overflow-hidden">
      <MapContainer
        center={center || DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom
        style={{ height: 480, width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        <FitBounds points={points} />
        {plottable.map((l) => {
          const color = COLOURS[l.fairPriceStatus ?? "Fair"];
          return (
            <Marker
              key={l.id}
              position={[l.latitude!, l.longitude!]}
              icon={makeIcon(color)}
              eventHandlers={{ click: () => onSelect?.(l) }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontSize: 12 }}>
                  <p style={{ fontWeight: 700, color: "#222", marginBottom: 2 }}>{l.propertyName}</p>
                  <p style={{ color: "#717171", fontSize: 11, marginBottom: 6 }}>{l.title}</p>
                  <p style={{ fontWeight: 700, color: "#FF385C", fontSize: 13 }}>
                    {l.monthlyRent ? formatCurrency(l.monthlyRent, currency, rate) + "/mo" : "—"}
                  </p>
                  <p style={{ color: "#717171", fontSize: 11, marginTop: 2 }}>
                    {l.bedrooms === "Studio" ? "Studio" : `${l.bedrooms}BR`} · {l.bathrooms} bath · {formatNumber(l.sqft)} ft²
                  </p>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(l)}
                      style={{
                        marginTop: 8, fontSize: 11, fontWeight: 700, color: "#FF385C",
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                      }}
                    >
                      View details →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 bg-canvas/95 dark:bg-canvas/95 backdrop-blur-md border border-hairline rounded-xl px-3 py-2.5 shadow-sm z-[400]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Fair Price</p>
            <button
              onClick={() => setShowLegend(false)}
              className="text-[10px] text-muted hover:text-ink"
              aria-label="Hide legend"
            >
              ×
            </button>
          </div>
          {[
            { c: COLOURS["Under Market"], l: "Under market" },
            { c: COLOURS["Fair"], l: "Fair" },
            { c: COLOURS["Overpriced"], l: "Overpriced" },
          ].map((it) => (
            <div key={it.l} className="flex items-center gap-2 text-[11px] text-ink">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: it.c }} />
              {it.l}
            </div>
          ))}
        </div>
      )}

      <div className="absolute top-3 right-3 bg-canvas/95 dark:bg-canvas/95 backdrop-blur-md border border-hairline rounded-full px-3 py-1.5 z-[400] text-[11px] font-semibold text-ink">
        {formatNumber(plottable.length)} of {formatNumber(listings.length)} mapped
      </div>
    </div>
  );
}
