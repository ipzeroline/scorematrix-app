"use client";

import Image from "next/image";
import { useState } from "react";

interface ApiLeagueLogoProps {
  name: string;
  logo?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizes = {
  xs: { outer: "h-5 w-5", image: 16 },
  sm: { outer: "h-9 w-9", image: 28 },
  md: { outer: "h-12 w-12", image: 38 },
  lg: { outer: "h-16 w-16", image: 52 },
};

export function ApiLeagueLogo({ name, logo, size = "md" }: ApiLeagueLogoProps) {
  const config = sizes[size];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const useDirectProxy = logo?.startsWith("/api/football/") ?? false;
  const showImage = Boolean(logo && failedSrc !== logo);

  return (
    <div
      className={`relative flex ${config.outer} shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white p-1`}
    >
      {showImage ? (
        <Image
          src={logo ?? ""}
          alt={`${name} logo`}
          width={config.image}
          height={config.image}
          className="object-contain"
          style={{ width: config.image, height: config.image }}
          unoptimized={useDirectProxy}
          onError={() => setFailedSrc(logo ?? null)}
        />
      ) : (
        <span className="text-xs font-bold text-gray-700">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
