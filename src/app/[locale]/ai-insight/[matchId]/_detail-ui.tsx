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
    cyan: "text-primary",
    purple: "text-purple",
    gold: "text-warning",
    green: "text-success",
  } as const;

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5">
          <Icon size={14} className={cn("shrink-0", accentClass[accent])} />
        </span>
        <h2 className="text-sm font-black uppercase tracking-wider text-white">{title}</h2>
      </div>
      <p className="mt-2 text-xs font-semibold leading-relaxed text-text-secondary">{description}</p>
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
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-2 text-sm font-black leading-tight text-white">{value || "-"}</p>
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
    <div className="rounded-xl border border-border bg-elevated/30 p-3.5">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="uppercase font-bold tracking-wider text-text-muted">{label}</span>
        <span className="font-mono text-text-secondary font-semibold">{formatPercent(value)}</span>
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
    <div className="rounded-xl border border-border bg-elevated/30 p-3.5">
      <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">{label}</p>
      <p className="mt-2 text-sm font-bold text-white">{value ?? "-"}</p>
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
    cyan: "border-primary/15 bg-primary/8 text-primary",
    magenta: "border-magenta/15 bg-magenta/8 text-magenta",
    neutral: "border-border bg-elevated text-text-secondary",
  } as const;

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", classes[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-5 text-center text-sm text-text-muted font-medium">
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
      <span className="text-text-muted font-medium">{label}</span>
      <span className="text-right font-bold text-white">{value}</span>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const tone =
    normalized === "FT" || normalized === "AET" || normalized === "PEN"
      ? "border-success/20 bg-success/10 text-success"
      : normalized === "NS"
        ? "border-primary/20 bg-primary/10 text-primary"
        : normalized === "PST" || normalized === "CANC"
          ? "border-warning/20 bg-warning/10 text-warning"
          : "border-danger/20 bg-danger/10 text-danger";

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
    cyan: "bg-primary",
    purple: "bg-purple",
    magenta: "bg-magenta",
  }[color];
  const textTone = {
    cyan: "text-primary",
    purple: "text-purple",
    magenta: "text-magenta",
  }[color];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={cn("truncate text-sm font-bold", textTone)}>{label}</span>
        <span className="font-mono text-sm text-white">{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border/60">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// Re-export type for convenience
export type { LocalizedDetailCopy };
