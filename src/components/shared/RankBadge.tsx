import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const rankConfig: Record<
  string,
  {
    icon: string;
    label: string;
    colors: {
      bg: string;
      border: string;
      text: string;
      glow?: string;
    };
  }
> = {
  bronze: {
    icon: "🥉",
    label: "Bronze",
    colors: {
      bg: "bg-amber-700/15",
      border: "border-amber-700/30",
      text: "text-amber-600",
    },
  },
  silver: {
    icon: "🥈",
    label: "Silver",
    colors: {
      bg: "bg-gray-400/10",
      border: "border-gray-400/25",
      text: "text-gray-300",
    },
  },
  gold: {
    icon: "🥇",
    label: "Gold",
    colors: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      text: "text-amber-400",
    },
  },
  platinum: {
    icon: "💎",
    label: "Platinum",
    colors: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/25",
      text: "text-cyan-400",
      glow: "shadow-[0_0_10px_rgba(34,211,238,0.2)]",
    },
  },
  diamond: {
    icon: "👑",
    label: "Diamond",
    colors: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/25",
      text: "text-purple-400",
      glow: "shadow-[0_0_10px_rgba(139,92,246,0.2)]",
    },
  },
  master: {
    icon: "🌟",
    label: "Master",
    colors: {
      bg: "bg-magenta-500/10",
      border: "border-magenta-500/25",
      text: "text-magenta-400",
      glow: "shadow-[0_0_10px_rgba(217,70,239,0.2)]",
    },
  },
  grandmaster: {
    icon: "🔥",
    label: "Grandmaster",
    colors: {
      bg: "bg-red-500/10",
      border: "border-red-500/25",
      text: "text-red-400",
      glow: "shadow-[0_0_10px_rgba(239,68,68,0.2)]",
    },
  },
  legend: {
    icon: "⚡",
    label: "Legend",
    colors: {
      bg: "bg-gradient-to-r from-cyan-500/10 via-magenta-500/10 to-amber-500/10",
      border: "border-cyan-500/30",
      text: "text-white",
      glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]",
    },
  },
};

export function RankBadge({
  rank,
  level,
  size = "md",
  className,
}: RankBadgeProps) {
  const lowerRank = rank.toLowerCase();
  const config = rankConfig[lowerRank] ?? {
    icon: "🏅",
    label: rank,
    colors: {
      bg: "bg-gray-500/10",
      border: "border-gray-500/20",
      text: "text-gray-400",
    },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  };

  const iconSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-bold font-display",
        config.colors.bg,
        config.colors.border,
        config.colors.text,
        config.colors.glow,
        sizeClasses[size],
        className
      )}
    >
      <span className={iconSize[size]}>{config.icon}</span>
      <span>{config.label}</span>
      <span className={cn("font-mono", config.colors.text, "opacity-70")}>
        Lv.{level}
      </span>
    </span>
  );
}
