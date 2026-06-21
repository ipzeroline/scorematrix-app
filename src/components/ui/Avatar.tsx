import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  level?: number | null;
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-24 h-24 text-2xl",
};

const imageSizes = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
  "2xl": 96,
};

const frameStyles = {
  1: "bg-[conic-gradient(from_210deg,#475569,#06b6d4,#475569)] shadow-[0_0_14px_rgba(6,182,212,0.18)]",
  2: "bg-[conic-gradient(from_210deg,#0f766e,#22d3ee,#84cc16,#0f766e)] shadow-[0_0_16px_rgba(34,211,238,0.22)]",
  3: "bg-[conic-gradient(from_210deg,#2563eb,#38bdf8,#a78bfa,#2563eb)] shadow-[0_0_18px_rgba(59,130,246,0.28)]",
  4: "bg-[conic-gradient(from_210deg,#7c3aed,#22d3ee,#f472b6,#7c3aed)] shadow-[0_0_20px_rgba(168,85,247,0.32)]",
  5: "bg-[conic-gradient(from_210deg,#be123c,#f97316,#facc15,#be123c)] shadow-[0_0_22px_rgba(249,115,22,0.34)]",
  6: "bg-[conic-gradient(from_210deg,#047857,#34d399,#facc15,#06b6d4,#047857)] shadow-[0_0_24px_rgba(52,211,153,0.34)]",
  7: "bg-[conic-gradient(from_210deg,#7f1d1d,#ef4444,#facc15,#ffffff,#7f1d1d)] shadow-[0_0_26px_rgba(239,68,68,0.38)]",
  8: "bg-[conic-gradient(from_210deg,#0e7490,#22d3ee,#ffffff,#a855f7,#0e7490)] shadow-[0_0_28px_rgba(34,211,238,0.42)]",
  9: "bg-[conic-gradient(from_210deg,#713f12,#facc15,#ffffff,#f97316,#a855f7,#713f12)] shadow-[0_0_30px_rgba(250,204,21,0.44)]",
  10: "bg-[conic-gradient(from_210deg,#020617,#22d3ee,#ffffff,#facc15,#f472b6,#22c55e,#020617)] shadow-[0_0_34px_rgba(244,114,182,0.45)]",
} as const;

const badgeStyles = {
  1: "border-slate-400/40 bg-slate-900 text-slate-100",
  2: "border-cyan-300/45 bg-teal-950 text-cyan-100",
  3: "border-sky-300/45 bg-blue-950 text-sky-100",
  4: "border-fuchsia-300/45 bg-purple-950 text-fuchsia-100",
  5: "border-amber-300/45 bg-orange-950 text-amber-100",
  6: "border-emerald-300/45 bg-emerald-950 text-emerald-100",
  7: "border-red-300/45 bg-red-950 text-red-100",
  8: "border-cyan-200/50 bg-cyan-950 text-white",
  9: "border-yellow-200/60 bg-yellow-950 text-yellow-100",
  10: "border-white/65 bg-black text-white",
} as const;

const badgeSizeClasses = {
  sm: "h-4 min-w-4 px-0.5 text-[8px]",
  md: "h-4.5 min-w-4.5 px-1 text-[8px]",
  lg: "h-5 min-w-5 px-1 text-[9px]",
  xl: "h-5.5 min-w-5.5 px-1 text-[10px]",
  "2xl": "h-6 min-w-6 px-1.5 text-[10px]",
};

export function Avatar({
  src,
  fallback,
  size = "md",
  level,
  className,
}: AvatarProps) {
  const frameLevel = normalizeFrameLevel(level);
  const content = src ? (
    <AvatarImage src={src} fallback={fallback} size={size} className={className} />
  ) : (
    <AvatarFallback fallback={fallback} size={size} className={className} />
  );

  if (!frameLevel) return content;

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center rounded-full p-[3px]",
        "before:absolute before:inset-[2px] before:rounded-full before:border before:border-black/45",
        "after:absolute after:inset-[-2px] after:rounded-full after:border after:border-white/10",
        frameStyles[frameLevel]
      )}
      aria-label={`Level ${frameLevel} avatar frame`}
    >
      {content}
      <span
        className={cn(
          "absolute -bottom-1 -right-1 z-10 inline-flex items-center justify-center rounded-full border font-mono font-black leading-none shadow-[0_0_10px_rgba(0,0,0,0.45)]",
          badgeStyles[frameLevel],
          badgeSizeClasses[size]
        )}
      >
        L{frameLevel}
      </span>
    </span>
  );
}

function AvatarImage({
  src,
  fallback,
  size,
  className,
}: {
  src: string;
  fallback?: string;
  size: keyof typeof sizeClasses;
  className?: string;
}) {
  if (src) {
    if (src.startsWith("data:") || src.startsWith("blob:")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={fallback || ""}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className={cn(
            "rounded-full object-contain border border-gray-700 bg-[#0a0a0f] p-[2px]",
            sizeClasses[size],
            className
          )}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={fallback || ""}
        width={imageSizes[size]}
        height={imageSizes[size]}
        unoptimized
        className={cn(
          "rounded-full object-contain border border-gray-700 bg-[#0a0a0f] p-[2px]",
          sizeClasses[size],
          className
        )}
      />
    );
  }
}

function AvatarFallback({
  fallback,
  size,
  className,
}: {
  fallback?: string;
  size: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700",
        sizeClasses[size],
        className
      )}
    >
      {fallback ? (
        <span className="font-medium">{fallback.slice(0, 2).toUpperCase()}</span>
      ) : (
        <User size={size === "sm" ? 12 : size === "md" ? 16 : 20} />
      )}
    </div>
  );
}

function normalizeFrameLevel(level?: number | null): keyof typeof frameStyles | null {
  if (level === undefined || level === null || !Number.isFinite(level)) return null;
  return Math.min(Math.max(Math.round(level), 1), 10) as keyof typeof frameStyles;
}
