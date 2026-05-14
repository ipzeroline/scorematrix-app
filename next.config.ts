import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/teams/**",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/leagues/**",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/players/**",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/coachs/**",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/venues/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/w40/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
