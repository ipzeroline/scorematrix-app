"use client";

import { useState } from "react";

interface ApiTeamLogoProps {
  name: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg";
  accent?: "cyan" | "magenta" | "gray";
}

const sizes = {
  sm: { outer: "h-8 w-8", image: "inset-[3px]", imageSize: "26px" },
  md: { outer: "h-10 w-10", image: "inset-1", imageSize: "32px" },
  lg: { outer: "h-14 w-14", image: "inset-1.5", imageSize: "44px" },
};

const accents = {
  cyan: "border-cyan-500/40",
  magenta: "border-magenta-500/40",
  gray: "border-gray-700/70",
};

const generatedPalettes = [
  "from-cyan-400 via-blue-500 to-indigo-600",
  "from-emerald-400 via-green-500 to-teal-600",
  "from-amber-300 via-orange-500 to-rose-600",
  "from-fuchsia-400 via-pink-500 to-purple-700",
  "from-lime-300 via-green-500 to-cyan-600",
  "from-sky-300 via-cyan-500 to-emerald-500",
];

export function ApiTeamLogo({
  name,
  logo,
  size = "md",
  accent = "gray",
}: ApiTeamLogoProps) {
  const config = sizes[size];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shouldGenerateLogo = !logo || isMissingMockLogo(logo) || failedSrc === logo;
  const palette = generatedPalettes[colorIndexFor(name, logo)];
  const initials = initialsFor(name);

  return (
    <div
      className={`relative flex ${config.outer} shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white p-1 ${accents[accent]}`}
    >
      {shouldGenerateLogo ? (
        <span
          aria-label={`${name} logo`}
          className={`absolute ${config.image} grid place-items-center rounded-full bg-gradient-to-br ${palette} text-[10px] font-black tracking-normal text-white shadow-inner shadow-white/20 ring-1 ring-black/10`}
        >
          <span className="absolute inset-[3px] rounded-full border border-white/25" />
          <span className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
            {initials}
          </span>
        </span>
      ) : (
        <span className={`absolute ${config.image} flex items-center justify-center`}>
          <img
            src={logo ?? ""}
            alt={`${name} logo`}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={() => setFailedSrc(logo ?? null)}
          />
        </span>
      )}
    </div>
  );
}

function isMissingMockLogo(logo: string): boolean {
  return logo.startsWith("/images/teams/");
}

function initialsFor(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "SM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function colorIndexFor(name: string, logo?: string | null): number {
  const value = logo || name;
  const sum = value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return sum % generatedPalettes.length;
}
