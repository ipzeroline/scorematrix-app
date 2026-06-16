import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
];

const noStoreHeaders = [
  {
    key: "Cache-Control",
    value: "no-store, no-cache, max-age=0, must-revalidate",
  },
  {
    key: "Pragma",
    value: "no-cache",
  },
  {
    key: "Expires",
    value: "0",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  generateEtags: false,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/(th|en|lo|my|km|zh)/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/api/auth/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/api/data/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/api/football/fixtures/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/api/football/teams/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/api/football/players/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/api/news/regenerate",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/ai-insight/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/football/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: "/livescore/:path*",
        headers: [...securityHeaders, ...noStoreHeaders],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
