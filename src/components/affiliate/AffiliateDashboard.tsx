"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Copy,
  Gift,
  Link2,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  EMPTY_REFERRALS_VIEW_DATA,
  getReferrals,
  mapApiReferrals,
  type AffiliateViewData,
} from "@/lib/referrals-api";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export function AffiliateDashboard() {
  const t = useTranslations("affiliate");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [affiliateData, setAffiliateData] = useState<AffiliateViewData>(
    EMPTY_REFERRALS_VIEW_DATA
  );
  const [hasLoadError, setHasLoadError] = useState(false);
  const { program, referrals, tiers } = affiliateData;
  const inviteUrl = useMemo(
    () => buildInviteUrl(program.shareUrl, locale, program.code),
    [locale, program.code, program.shareUrl]
  );

  useEffect(() => {
    let isActive = true;

    getReferrals({ locale })
      .then((response) => {
        if (isActive) {
          setAffiliateData(mapApiReferrals(response));
          setHasLoadError(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setAffiliateData(EMPTY_REFERRALS_VIEW_DATA);
          setHasLoadError(true);
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
  const totalRewards =
    program.totalPointsEarned + program.totalCreditsEarned;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),transparent_34%),linear-gradient(315deg,rgba(245,158,11,0.12),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 xl:grid-cols-[1.04fr_0.96fr] xl:items-stretch">
          <div className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="gold" size="md" className="uppercase tracking-wider">
                  {t("eyebrow")}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={14} />
                  {t("skillNotice")}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                {t("description")}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MiniSignal icon={Users} label={t("signups")} value={program.totalSignups.toLocaleString()} />
              <MiniSignal icon={Target} label={t("qualified")} value={program.qualifiedSignups.toLocaleString()} />
              <MiniSignal icon={Trophy} label={t("conversion")} value={`${program.conversionRate}%`} />
            </div>
          </div>

          <Card className="relative flex min-h-[320px] flex-col overflow-hidden border-amber-400/20 bg-black/28 p-4 sm:p-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {t("inviteConsole")}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {t("yourCode")}
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  {t("shareHint")}
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                <Share2 size={22} />
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <p className="break-all font-mono text-3xl font-black leading-tight text-white">
                {program.code || "—"}
              </p>
            </div>

            <div className="mt-3 rounded-2xl border border-gray-800 bg-[#070a10] p-3 sm:p-4">
              <p className="break-all font-mono text-xs leading-5 text-gray-300 sm:text-sm">
                {inviteUrl || "—"}
              </p>
            </div>

            <Button
              type="button"
              onClick={copyInviteLink}
              disabled={!inviteUrl}
              variant={copied ? "green" : "primary"}
              className="mt-auto min-h-12 w-full text-base font-black"
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? t("copied") : t("copyLink")}
            </Button>
            {hasLoadError && (
              <p className="mt-3 text-xs text-rose-300">{tCommon("error")}</p>
            )}
          </Card>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HeroStat icon={Link2} label={t("clicks")} value={program.totalClicks.toLocaleString()} helper={t("performancePanel")} tone="text-cyan-300" />
        <HeroStat icon={Users} label={t("signups")} value={program.totalSignups.toLocaleString()} helper={t("recentActivity")} tone="text-green-300" />
        <HeroStat icon={UserPlus} label={t("qualified")} value={program.qualifiedSignups.toLocaleString()} helper={t("milestoneProgress")} tone="text-amber-300" />
        <HeroStat icon={TrendingUp} label={t("conversion")} value={`${program.conversionRate}%`} helper={t("performancePanel")} tone="text-purple-300" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="overflow-hidden border-cyan-400/20 bg-[#0b111d] p-4 md:p-5">
          <PanelHeader
            icon={Radio}
            eyebrow={t("recentActivity")}
            title={t("referralsTitle")}
            description={t("referralsSubtitle")}
            action={<Badge variant="cyan" size="md">{t("pending", { count: program.pendingSignups })}</Badge>}
          />

          <div className="mt-5 space-y-3">
            {referrals.length > 0 ? referrals.map((referral) => (
              <div
                key={referral.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[minmax(0,1fr)_130px_120px] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-white">
                    {referral.username}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                    {formatDate(referral.joinedAt, locale)}
                  </p>
                </div>
                <ReferralStatus status={referral.status} />
                <p className="font-mono text-base font-black text-green-300 md:text-right">
                  +{referral.rewardPoints.toLocaleString()} {t("pointsShort")}
                </p>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-gray-800 bg-black/16 py-10 text-center text-sm font-bold text-gray-500">
                {t("noReferrals")}
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden border-amber-400/20 bg-[#0b111d] p-4 md:p-5">
          <PanelHeader
            icon={Gift}
            eyebrow={t("rewardLadder")}
            title={t("rewardsTitle")}
            description={t("earned", {
              points: program.totalPointsEarned.toLocaleString(),
              credits: program.totalCreditsEarned.toLocaleString(),
            })}
          />

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/24 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-gray-400">
                {t("milestoneProgress")}
              </span>
              <span className="font-mono text-sm font-black text-white">
                {progress}%
              </span>
            </div>
            <div className="rounded-full border border-gray-800 bg-black/30 p-1">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              {t("nextMilestone", {
                count: Math.max(0, nextTierCount(tiers) - program.qualifiedSignups),
              })}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {tiers.map((tier) => {
              const unlocked = program.qualifiedSignups >= tier.referrals;
              return (
                <div
                  key={tier.referrals}
                  className={cn(
                    "rounded-2xl border px-4 py-3",
                    unlocked
                      ? "border-green-400/30 bg-green-400/10"
                      : "border-gray-800 bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-black text-white">
                      {t("tier", { count: tier.referrals })}
                    </span>
                    {unlocked ? (
                      <CheckCircle2 size={18} className="text-green-300" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-600" />
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-gray-400">
                    {tier.rewardLabel ??
                      t("tierReward", {
                        points: tier.rewardPoints.toLocaleString(),
                        credits: tier.rewardCredits.toLocaleString(),
                      })}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {t("totalRewards")}
            </p>
            <p className="mt-2 font-mono text-3xl font-black text-white">
              {totalRewards.toLocaleString()}
            </p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <PanelHeader
          icon={Sparkles}
          eyebrow={t("howItWorks")}
          title={t("howItWorks")}
          description={t("howItWorksHint")}
        />
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <Card key={step} className="relative overflow-hidden border-white/10 bg-[#0b111d] p-4 sm:p-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <Award size={20} />
              </span>
              <h3 className="mt-4 text-lg font-black text-white">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {t(`steps.${step}.text`)}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  helper: string;
  tone: string;
}) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-[#0b111d] p-4 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-400">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black leading-none text-white sm:text-4xl">
            {value}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            {helper}
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Icon size={22} className={tone} />
        </span>
      </div>
    </Card>
  );
}

function MiniSignal({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/24 p-3">
      <Icon size={17} className="text-cyan-200" />
      <p className="mt-2 font-mono text-2xl font-black leading-none text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: typeof Users;
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
            <Icon size={16} />
          </span>
          {eyebrow}
        </div>
        <h2 className="font-display text-2xl font-black text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function buildInviteUrl(shareUrl: string, locale: string, code: string) {
  if (!shareUrl && !code) return "";

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
