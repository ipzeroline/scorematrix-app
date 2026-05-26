"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
  DEFAULT_REFERRALS_VIEW_DATA,
  getReferrals,
  mapApiReferrals,
  type AffiliateViewData,
} from "@/lib/referrals-api";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export function AffiliateDashboard() {
  const t = useTranslations("affiliate");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [affiliateData, setAffiliateData] = useState<AffiliateViewData>(
    DEFAULT_REFERRALS_VIEW_DATA
  );
  const { program, referrals, tiers } = affiliateData;
  const inviteUrl = useMemo(
    () => buildInviteUrl(program.shareUrl, locale, program.code),
    [locale, program.code, program.shareUrl]
  );
  const inviteLayoutStyle = useMemo(
    () =>
      ({
        "--invite-card-width": `${Math.min(Math.max(inviteUrl.length + 8, 44), 96)}ch`,
      }) as CSSProperties & Record<"--invite-card-width", string>,
    [inviteUrl]
  );

  useEffect(() => {
    let isActive = true;

    getReferrals({ locale })
      .then((response) => {
        if (isActive) {
          setAffiliateData(mapApiReferrals(response));
        }
      })
      .catch(() => {
        if (isActive) {
          setAffiliateData(DEFAULT_REFERRALS_VIEW_DATA);
        }
      });

    return () => {
      isActive = false;
    };
  }, [locale]);

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
    Math.round((program.qualifiedSignups / Math.max(nextTierCount(tiers), 1)) * 100)
  );

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#0b1018] p-5 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_82%_28%,rgba(245,158,11,0.12),transparent_28%)]" />
        <div
          className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(440px,var(--invite-card-width))] lg:items-center"
          style={inviteLayoutStyle}
        >
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

          <Card className="relative w-full overflow-hidden border-amber-400/20 bg-black/25 p-4 sm:p-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
                  {t("yourCode")}
                </p>
                <p className="mt-1 break-all font-mono text-2xl font-black text-white">
                  {program.code}
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                <Share2 size={22} />
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-gray-800 bg-[#070a10] p-3 sm:p-4">
              <p className="break-all font-mono text-xs leading-5 text-gray-300 sm:text-sm">
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
            value: program.totalClicks.toLocaleString(),
            icon: Link2,
            tone: "text-cyan-300",
          },
          {
            label: t("signups"),
            value: program.totalSignups.toLocaleString(),
            icon: Users,
            tone: "text-green-300",
          },
          {
            label: t("qualified"),
            value: program.qualifiedSignups.toLocaleString(),
            icon: UserPlus,
            tone: "text-amber-300",
          },
          {
            label: t("conversion"),
            value: `${program.conversionRate}%`,
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
              {t("pending", { count: program.pendingSignups })}
            </Badge>
          </div>

          <div className="mt-4 divide-y divide-gray-800/80">
            {referrals.length > 0 ? referrals.map((referral) => (
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
            )) : (
              <div className="py-8 text-center text-sm text-gray-500">
                {t("noReferrals")}
              </div>
            )}
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
                  points: program.totalPointsEarned.toLocaleString(),
                  credits: program.totalCreditsEarned.toLocaleString(),
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
              count: Math.max(0, nextTierCount(tiers) - program.qualifiedSignups),
            })}
          </p>

          <div className="mt-4 space-y-2">
            {tiers.map((tier) => (
              <div
                key={tier.referrals}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  program.qualifiedSignups >= tier.referrals
                    ? "border-green-400/30 bg-green-400/10"
                    : "border-gray-800 bg-white/[0.02]"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">
                    {t("tier", { count: tier.referrals })}
                  </span>
                  {program.qualifiedSignups >= tier.referrals && (
                    <CheckCircle2 size={16} className="text-green-300" />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {tier.rewardLabel ??
                    t("tierReward", {
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

function buildInviteUrl(shareUrl: string, locale: string, code: string) {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : SITE_URL;
  const referralCode = extractReferralCode(shareUrl) || code;
  const url = new URL(`/${locale}/auth/register`, origin);
  url.searchParams.set("ref", referralCode);
  return url.toString();
}

function extractReferralCode(shareUrl: string) {
  if (!shareUrl) return "";

  try {
    const url = new URL(
      shareUrl,
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : SITE_URL
    );
    return url.searchParams.get("ref") ?? "";
  } catch {
    return "";
  }
}

function nextTierCount(tiers: { referrals: number }[]) {
  return tiers.reduce((max, tier) => Math.max(max, tier.referrals), 0);
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
