import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/th",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#8eea00",
    icons: [
      {
        src: "/icons/scorematrix-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/scorematrix-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/scorematrix-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
