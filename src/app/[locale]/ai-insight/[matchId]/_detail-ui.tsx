import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ProgressBarColor } from "@/components/ui/ProgressBar";
import type { LucideIcon } from "lucide-react";
import { formatPercent } from "./_detail-shared";
import type { LocalizedDetailCopy } from "./_detail-shared";

export function SectionHeading({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "cyan" | "purple" | "gold" | "green";
}) {
  const accentClass = {
    cyan: "text-cyan-300",
    purple: "text-purple-300",
    gold: "text-amber-300",
    green: "text-green-300",
  } as const;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon size={15} className={accentClass[accent]} />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
    </div>
  );
}

export function PredictionInfo({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-white">{value || "-"}</p>
    </div>
  );
}

export function TeamShare({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: ProgressBarColor;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="uppercase tracking-[0.24em] text-gray-500">{label}</span>
        <span className="font-mono text-gray-200">{formatPercent(value)}</span>
      </div>
      <ProgressBar value={value ?? 0} color={color} size="md" />
    </div>
  );
}

export function StatChip({
  label,
  value,
}: {
  label: string;
  value: number | string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value ?? "-"}</p>
    </div>
  );
}

export function TagPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "cyan" | "magenta" | "neutral";
}) {
  const classes = {
    cyan: "border-cyan-400/15 bg-cyan-400/8 text-cyan-200",
    magenta: "border-magenta/15 bg-magenta/8 text-magenta",
    neutral: "border-white/10 bg-white/6 text-gray-300",
  } as const;

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", classes[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 px-4 py-5 text-center text-sm text-gray-500">
      {label}
    </div>
  );
}

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const tone =
    normalized === "FT" || normalized === "AET" || normalized === "PEN"
      ? "border-green-400/20 bg-green-400/10 text-green-300"
      : normalized === "NS"
        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
        : normalized === "PST" || normalized === "CANC"
          ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
          : "border-red-400/20 bg-red-400/10 text-red-300";

  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", tone)}>
      {status}
    </span>
  );
}

export function StrengthTeamRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "cyan" | "purple" | "magenta";
}) {
  const tone = {
    cyan: "bg-cyan-400",
    purple: "bg-purple-400",
    magenta: "bg-magenta",
  }[color];
  const textTone = {
    cyan: "text-cyan-300",
    purple: "text-purple-300",
    magenta: "text-magenta",
  }[color];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={cn("truncate text-sm font-medium", textTone)}>{label}</span>
        <span className="font-mono text-sm text-white">{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// Re-export type for convenience
export type { LocalizedDetailCopy };
