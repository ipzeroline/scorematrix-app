"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

interface LogoProps {
  size?: "sm" | "md";
}

export function Logo({ size = "md" }: LogoProps) {
  const { locale } = useParams<{ locale: string }>();

  return (
    <Link
      href={`/${locale || "th"}`}
      className="flex items-center gap-2 no-underline shrink-0"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
        <span className="text-black font-bold text-sm">SM</span>
      </div>
      {size === "md" && (
        <span className="font-display font-bold text-lg tracking-tight hidden sm:block">
          <span className="text-white">Score</span>
          <span className="text-cyan-400">Matrix</span>
        </span>
      )}
    </Link>
  );
}
