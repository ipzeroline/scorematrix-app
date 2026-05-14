"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CheckCircle2,
  Copy,
  Gift,
  Link2,
  Share2,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  affiliateProgram,
  affiliateReferrals,
  affiliateTiers,
} from "@/data/affiliates";
import { cn } from "@/lib/utils";

export function AffiliateDashboard() {
  const t = useTranslations("affiliate");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const inviteUrl = useMemo(
    () => `https://scorematrix.app/${locale}/auth/register?ref=${affiliateProgram.code}`,
    [locale]
  );

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const progress = Math.min(
    100,
    Math.round((affiliateProgram.qualifiedSignups / 25) * 100)
  );

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#0b1018] p-5 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_82%_28%,rgba(245,158,11,0.12),transparent_28%)]" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div>
            <Badge variant="gold" size="md">
              {t("eyebrow")}
            </Badge>
            <h1 className="mt-3 font-display text-3xl font-black leading-tight text-white md:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
              {t("description")}
            </p>
          </div>

          <Card className="relative overflow-hidden border-amber-400/20 bg-black/25 p-4">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
                  {t("yourCode")}
                </p>
                <p className="mt-1 font-mono text-2xl font-black text-white">
                  {affiliateProgram.code}
                </p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                <Share2 size={22} />
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-gray-800 bg-[#070a10] p-3">
              <p className="truncate font-mono text-xs text-gray-300">
                {inviteUrl}
              </p>
            </div>
            <Button
              type="button"
              onClick={copyInviteLink}
              variant={copied ? "green" : "primary"}
              className="mt-3 w-full"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? t("copied") : t("copyLink")}
            </Button>
          </Card>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: t("clicks"),
            value: affiliateProgram.totalClicks.toLocaleString(),
            icon: Link2,
            tone: "text-cyan-300",
          },
          {
            label: t("signups"),
            value: affiliateProgram.totalSignups.toLocaleString(),
            icon: Users,
            tone: "text-green-300",
          },
          {
            label: t("qualified"),
            value: affiliateProgram.qualifiedSignups.toLocaleString(),
            icon: UserPlus,
            tone: "text-amber-300",
          },
          {
            label: t("conversion"),
            value: `${affiliateProgram.conversionRate}%`,
            icon: TrendingUp,
            tone: "text-purple-300",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <Icon size={18} className={stat.tone} />
              <p className="mt-3 font-mono text-2xl font-black text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                {t("referralsTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("referralsSubtitle")}
              </p>
            </div>
            <Badge variant="cyan" size="md">
              {t("pending", { count: affiliateProgram.pendingSignups })}
            </Badge>
          </div>

          <div className="mt-4 divide-y divide-gray-800/80">
            {affiliateReferrals.map((referral) => (
              <div
                key={referral.id}
                className="grid gap-2 py-3 md:grid-cols-[minmax(0,1fr)_130px_100px] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {referral.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(referral.joinedAt, locale)}
                  </p>
                </div>
                <ReferralStatus status={referral.status} />
                <p className="font-mono text-sm font-bold text-green-300 md:text-right">
                  +{referral.rewardPoints.toLocaleString()} {t("pointsShort")}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-200">
              <Gift size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                {t("rewardsTitle")}
              </h2>
              <p className="text-xs text-gray-500">
                {t("earned", {
                  points: affiliateProgram.totalPointsEarned.toLocaleString(),
                  credits: affiliateProgram.totalCreditsEarned.toLocaleString(),
                })}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-full border border-gray-800 bg-black/30 p-1">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-amber-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {t("nextMilestone", {
              count: Math.max(0, 25 - affiliateProgram.qualifiedSignups),
            })}
          </p>

          <div className="mt-4 space-y-2">
            {affiliateTiers.map((tier) => (
              <div
                key={tier.referrals}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  affiliateProgram.qualifiedSignups >= tier.referrals
                    ? "border-green-400/30 bg-green-400/10"
                    : "border-gray-800 bg-white/[0.02]"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">
                    {t("tier", { count: tier.referrals })}
                  </span>
                  {affiliateProgram.qualifiedSignups >= tier.referrals && (
                    <CheckCircle2 size={16} className="text-green-300" />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t("tierReward", {
                    points: tier.rewardPoints.toLocaleString(),
                    credits: tier.rewardCredits.toLocaleString(),
                  })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((step) => (
          <Card key={step} className="p-4">
            <Sparkles size={18} className="text-cyan-300" />
            <h3 className="mt-3 text-sm font-bold text-white">
              {t(`steps.${step}.title`)}
            </h3>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {t(`steps.${step}.text`)}
            </p>
          </Card>
        ))}
      </section>
    </div>
  );
}

function ReferralStatus({
  status,
}: {
  status: "registered" | "qualified" | "rewarded";
}) {
  const t = useTranslations("affiliate.status");
  const tone = {
    registered: "default",
    qualified: "gold",
    rewarded: "green",
  } as const;

  return <Badge variant={tone[status]}>{t(status)}</Badge>;
}

function formatDate(value: string, locale: string) {
  const localeMap: Record<string, string> = {
    th: "th-TH",
    en: "en-US",
    lo: "lo-LA",
    my: "my-MM",
    km: "km-KH",
    zh: "zh-CN",
  };

  return new Intl.DateTimeFormat(localeMap[locale] ?? "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
