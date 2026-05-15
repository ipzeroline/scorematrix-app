"use client";

import { useState } from "react";

interface ApiTeamLogoProps {
  name: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg";
  accent?: "cyan" | "magenta" | "gray";
}

const sizes = {
  sm: { outer: "h-8 w-8", image: 26 },
  md: { outer: "h-10 w-10", image: 32 },
  lg: { outer: "h-14 w-14", image: 44 },
};

const accents = {
  cyan: "border-cyan-500/40",
  magenta: "border-magenta-500/40",
  gray: "border-gray-700/70",
};

export function ApiTeamLogo({
  name,
  logo,
  size = "md",
  accent = "gray",
}: ApiTeamLogoProps) {
  const config = sizes[size];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(logo && failedSrc !== logo);

  return (
    <div
      className={`relative flex ${config.outer} items-center justify-center rounded-full border bg-white p-1 ${accents[accent]}`}
    >
      {showImage ? (
        <img
          src={logo ?? ""}
          alt={`${name} logo`}
          width={config.image}
          height={config.image}
          className="object-contain"
          style={{ width: config.image, height: config.image }}
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
