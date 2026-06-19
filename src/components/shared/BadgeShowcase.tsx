"use client";

import {
  Award,
  Flag,
  Globe,
  Medal,
  Shield,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { EventBadge } from "@/types/event";

const ICON_MAP: Record<string, typeof Trophy> = {
  trophy: Trophy,
  globe: Globe,
  star: Star,
  medal: Medal,
  zap: Zap,
  shield: Shield,
  flag: Flag,
  sun: Sun,
};

type Props = {
  badges: EventBadge[];
};

export function BadgeShowcase({ badges }: Props) {
  const t = useTranslations("events");

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-400/15 bg-[#0f1119]">
      <div className="flex items-center gap-2 border-b border-purple-400/10 bg-purple-400/[0.04] px-5 py-4">
        <Award size={16} className="text-purple-300" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-purple-200">
          {t("badgeShowcaseTitle")}
        </h2>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => {
          const Icon = ICON_MAP[badge.icon] ?? Sparkles;
          const isWinnerBadge = badge.id.includes("champion") || badge.id.includes("runnerup");

          return (
            <div
              key={badge.id}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-purple-400/20 hover:bg-purple-400/[0.03]"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  isWinnerBadge
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    : "border-purple-400/20 bg-purple-400/10 text-purple-300"
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{badge.name}</p>
                <p className="mt-0.5 text-xs leading-5 text-gray-400">{badge.description}</p>
                <span
                  className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isWinnerBadge
                      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                      : "border-purple-400/20 bg-purple-400/10 text-purple-300"
                  }`}
                >
                  {isWinnerBadge ? t("badgeTypeWinner") : t("badgeTypeParticipation")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
