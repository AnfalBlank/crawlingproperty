import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Estate Insight — Property Price Intelligence",
    short_name: "Estate Insight",
    description: "Real-time property rental price analytics for Malaysia.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF385C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
