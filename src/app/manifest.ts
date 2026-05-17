import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/th",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#06b6d4",
    icons: [
      {
        src: "/brand/scorematrix-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
