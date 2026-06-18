import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/auth/forgot-password",
        "/*/auth/reset-password",
        "/*/affiliate",
        "/*/events",
        "/*/leaderboard",
        "/*/leagues",
        "/*/missions",
        "/*/notifications",
        "/*/profile",
        "/*/rewards",
        "/*/settings",
        "/*/stats",
        "/*/wallet",
        "/*/predict/*",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
