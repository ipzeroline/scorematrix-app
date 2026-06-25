"use client";

import { useState } from "react";

interface ApiLeagueLogoProps {
  name: string;
  logo?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizes = {
  xs: {
    outer: "h-5 w-5 rounded-md p-[2px]",
    inner: "h-4 w-4 rounded-[4px]",
    imageScale: 1,
    text: "text-[8px]",
  },
  sm: {
    outer: "h-9 w-9 rounded-xl p-1",
    inner: "h-7 w-7 rounded-lg",
    imageScale: 1,
    text: "text-[10px]",
  },
  md: {
    outer: "h-12 w-12 rounded-2xl p-1.5",
    inner: "h-9 w-9 rounded-xl",
    imageScale: 1,
    text: "text-xs",
  },
  lg: {
    outer: "h-16 w-16 rounded-2xl p-2",
    inner: "h-12 w-12 rounded-xl",
    imageScale: 1,
    text: "text-sm",
  },
  xl: {
    outer: "h-10 w-10 rounded-xl p-1 sm:h-11 sm:w-11",
    inner: "h-8 w-8 rounded-lg sm:h-9 sm:w-9",
    imageScale: 1.12,
    text: "text-xs",
  },
};

export function ApiLeagueLogo({ name, logo, size = "md" }: ApiLeagueLogoProps) {
  const config = sizes[size];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(logo && failedSrc !== logo);

  return (
    <div
      className={`relative flex ${config.outer} shrink-0 items-center justify-center border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(12,23,35,0.96),rgba(20,16,35,0.9))] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_24px_rgba(0,0,0,0.28)]`}
    >
      <span className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.16),transparent_48%)]" />
      <span
        className={`relative flex ${config.inner} items-center justify-center overflow-hidden bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]`}
      >
        {showImage ? (
          // Provider media is already proxied and intentionally bypasses Next image optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo ?? ""}
            alt={`${name} logo`}
            className="h-full w-full object-contain"
            style={{ transform: `scale(${config.imageScale})` }}
            loading="lazy"
            onError={() => setFailedSrc(logo ?? null)}
          />
        ) : (
          <span className={`${config.text} font-black text-gray-800`}>
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
    </div>
  );
}
