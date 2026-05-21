import { cn } from "@/lib/utils";
import { MatchStatus } from "@/types";

const statusConfig: Record<
  MatchStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  [MatchStatus.LIVE]: {
    label: "LIVE",
    className:
      "bg-rose-500/18 text-rose-200 border-rose-300/55",
    pulse: true,
  },
  [MatchStatus.UPCOMING]: {
    label: "UPCOMING",
    className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  [MatchStatus.FINISHED]: {
    label: "FT",
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
  [MatchStatus.POSTPONED]: {
    label: "POSTPONED",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  [MatchStatus.CANCELLED]: {
    label: "CANCELLED",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

interface StatusBadgeProps {
  status: MatchStatus | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status as MatchStatus] ?? {
    label: String(status || "UNKNOWN").toUpperCase(),
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold",
        config.className,
        className
      )}
    >
      {config.pulse && (
        <span className="live-status-dot w-1.5 h-1.5 rounded-full bg-rose-300" />
      )}
      {label ?? config.label}
    </span>
  );
}
