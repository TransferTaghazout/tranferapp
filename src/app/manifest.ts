import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Atlas Coast Travel",
    short_name: "Atlas Coast",
    description: "Tourist reservations, transfers and finance from the field.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3eb",
    theme_color: "#0c3d2e",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
