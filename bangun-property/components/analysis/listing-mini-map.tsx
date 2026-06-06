"use client";

/**
 * Lazy-loaded mini map for the listing detail modal (PRD §33).
 * Imported via `next/dynamic({ ssr: false })` so Leaflet only runs client-side.
 */
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export default function ListingMiniMap({ lat, lng, title }: Props) {
  // Fix Leaflet's default icon paths under Webpack (icons appear broken otherwise).
  // We replace with a custom SVG pin in the brand Rausch colour.
  useEffect(() => {
    // Override prototype defaults once
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
  }, []);

  const pin = L.divIcon({
    className: "leaflet-rausch-pin",
    html: `
      <div style="
        width: 32px; height: 40px; position: relative;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
      ">
        <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
          <path d="M16 0c-8.8 0-16 7.2-16 16 0 12 16 24 16 24s16-12 16-24c0-8.8-7.2-16-16-16z"
            fill="#FF385C"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  });

  return (
    <div className="w-full h-44 md:h-56 rounded-xl overflow-hidden border border-hairline">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        <Marker position={[lat, lng]} icon={pin}>
          <Popup>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{title}</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
