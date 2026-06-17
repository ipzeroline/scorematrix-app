"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getCurrentUser,
  type CurrentUserData,
  type CurrentUserResponse,
} from "@/lib/auth-api";
import { useUserStore } from "@/stores/user-store";
import { useShallow } from "zustand/react/shallow";
import {
  Activity,
  BarChart3,
  ChevronRight,
  Crown,
  Pencil,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { locale } = useParams<{ locale: string }>();
  const user = useUserStore(
    useShallow((s) => ({
      username: s.username,
      displayName: s.displayName,
      freePoints: s.freePoints,
      premiumCredits: s.premiumCredits,
      level: s.level,
      rank: s.rank,
      xp: s.xp,
      accuracy: s.accuracy,
      totalPredictions: s.totalPredictions,
      bestStreak: s.bestStreak,
      achievementsUnlocked: s.achievementsUnlocked,
    }))
  );
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileMeta, setProfileMeta] = useState({
    avatarUrl: null as string | null,
    createdAt: "",
  });

  useEffect(() => {
    let active = true;

    getCurrentUser({ locale })
      .then((response) => {
        if (!active) return;
        const profile = extractCurrentUser(response);
        if (!profile) return;
        const currentUser = useUserStore.getState();
        const stats = profile.stats;
        const preferences = profile.preferences;
        const totalPredictions =
          pickNumber(
            stats?.totalPredictions,
            profile.totalPredictions,
            profile.total_predictions
          ) ??
          currentUser.totalPredictions;
        const correctPredictions =
          pickNumber(
            stats?.correctPredictions,
            profile.correctPredictions,
            profile.correct_predictions
          ) ?? currentUser.correctPredictions;

        useUserStore.setState({
          userId: pickString(profile.id, profile.code) ?? currentUser.userId,
          username:
            pickString(profile.username, profile.user_name) ??
            currentUser.username,
          displayName:
            pickString(profile.name, profile.displayName, profile.display_name) ??
            currentUser.displayName,
          email: pickString(profile.email) ?? currentUser.email,
          phone: pickString(profile.phone, profile.tel) ?? currentUser.phone,
          birthYear:
            pickString(profile.birthYear, profile.birth_day) ??
            currentUser.birthYear,
          country: pickString(profile.country) ?? currentUser.country,
          favoriteTeam:
            pickString(
              profile.favoriteTeamId,
              profile.favoriteTeam,
              profile.favorite_team
            ) ??
            currentUser.favoriteTeam,
          playerType:
            pickString(profile.playerType, profile.player_type) ??
            currentUser.playerType,
          language:
            pickString(profile.locale, profile.language) ??
            currentUser.language ??
            locale,
          marketingConsent: Boolean(
            profile.marketingConsent ??
              profile.marketing_consent ??
              currentUser.marketingConsent
          ),
          freePoints:
            pickNumber(
              stats?.freePoints,
              profile.freePoints,
              profile.point_deposit,
              profile.balance_free
            ) ?? currentUser.freePoints,
          premiumCredits:
            pickNumber(
              stats?.premiumCredits,
              profile.premiumCredits,
              profile.balance,
              profile.credit
            ) ?? currentUser.premiumCredits,
          xp: pickNumber(stats?.xp, profile.xp) ?? currentUser.xp,
          level: pickNumber(stats?.level, profile.level) ?? currentUser.level,
          rank: pickString(stats?.rank) ?? currentUser.rank,
          streak: pickNumber(stats?.streak) ?? currentUser.streak,
          bestStreak:
            pickNumber(stats?.bestStreak, profile.bestStreak, profile.best_streak) ??
            currentUser.bestStreak,
          totalPredictions,
          correctPredictions,
          accuracy:
            pickNumber(stats?.accuracy, profile.accuracy) ??
            (totalPredictions > 0
              ? Math.round((correctPredictions / totalPredictions) * 100)
              : currentUser.accuracy),
          missionsCompleted:
            pickNumber(stats?.missionsCompleted) ?? currentUser.missionsCompleted,
          achievementsUnlocked:
            pickNumber(
              stats?.achievementsUnlocked,
              profile.achievementsUnlocked,
              profile.achievements_unlocked
            ) ?? currentUser.achievementsUnlocked,
          streakShields:
            pickNumber(stats?.streakShields) ?? currentUser.streakShields,
          predictionBoosts:
            pickNumber(stats?.predictionBoosts) ?? currentUser.predictionBoosts,
          referralCount:
            pickNumber(stats?.referralCount) ?? currentUser.referralCount,
          qualifiedReferrals:
            pickNumber(stats?.qualifiedReferrals) ??
            currentUser.qualifiedReferrals,
          totalReferralEarnings:
            pickNumber(stats?.totalReferralEarnings) ??
            currentUser.totalReferralEarnings,
          preferences: {
            ...currentUser.preferences,
            publicProfile:
              preferences?.publicProfile ?? currentUser.preferences.publicProfile,
            pushNotifications:
              preferences?.pushNotifications ??
              currentUser.preferences.pushNotifications,
            matchReminder1hr:
              preferences?.matchReminder1hr ??
              currentUser.preferences.matchReminder1hr,
            matchReminder30min:
              preferences?.matchReminder30min ??
              currentUser.preferences.matchReminder30min,
            resultNotification:
              preferences?.resultNotification ??
              currentUser.preferences.resultNotification,
            rankChangeAlert:
              preferences?.rankChangeAlert ??
              currentUser.preferences.rankChangeAlert,
          },
        });
        setProfileMeta({
          avatarUrl: pickNullableString(profile.avatarUrl),
          createdAt: pickString(profile.createdAt) ?? "",
        });
      })
      .catch(() => {
        if (!active) return;
        setProfileError(t("profileLoadError"));
      })
      .finally(() => {
        if (!active) return;
        setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale, t]);

  const profileUser = user;
  const rawXpProgress = profileUser.xp - (profileUser.level - 1) * 1000;
  const xpTarget = 1000;
  const xpProgress = Math.min(Math.max(rawXpProgress, 0), xpTarget);
  const xpRemaining = Math.max(xpTarget - xpProgress, 0);
  const memberSince = profileMeta.createdAt
    ? formatMemberSince(profileMeta.createdAt, locale)
    : "Jan 2026";

  const stats = [
    { label: t("predictions"), value: profileUser.totalPredictions.toString(), icon: Target, tone: "text-cyan-300" },
    { label: t("accuracy"), value: `${profileUser.accuracy}%`, icon: TrendingUp, tone: "text-green-300" },
    { label: t("bestStreak"), value: profileUser.bestStreak.toString(), icon: Zap, tone: "text-amber-300" },
    { label: t("achievements"), value: `${profileUser.achievementsUnlocked}/25`, icon: Star, tone: "text-purple-300" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),transparent_34%),linear-gradient(315deg,rgba(168,85,247,0.13),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative mx-auto shrink-0 sm:mx-0">
                <div className="absolute -inset-2 rounded-full bg-cyan-400/15 blur-xl" />
                <Avatar
                  src={profileMeta.avatarUrl}
                  fallback={profileUser.username.slice(0, 2).toUpperCase()}
                  size="xl"
                  className="relative ring-2 ring-cyan-400/40"
                />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge variant="cyan" size="md" className="uppercase tracking-wider">
                    {t("commandCenter")}
                  </Badge>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                    <ShieldCheck size={14} />
                    {t("skillNotice")}
                  </span>
                </div>
                <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl">
                  {profileUser.displayName}
                </h1>
                <p className="mt-2 text-base font-bold text-cyan-200">
                  @{profileUser.username}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-400 sm:text-base">
                  {profileLoading
                    ? t("loadingProfile")
                    : t("memberSince", { date: memberSince })}
                </p>
                {profileError && (
                  <p className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {profileError}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="purple" size="md">
                    {t("level", { level: profileUser.level })}
                  </Badge>
                  <Badge variant="gold" size="md">
                    <Crown size={13} className="mr-1" />
                    {profileUser.rank}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/profile/edit`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-base font-black text-black transition-colors hover:bg-cyan-400"
              >
                <Pencil size={18} />
                {t("editProfile")}
              </Link>
              <Link
                href={`/${locale}/stats`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 text-base font-black text-cyan-200 transition-colors hover:border-cyan-300/50 hover:bg-cyan-500/15"
              >
                <BarChart3 size={18} />
                {t("fullStats")}
              </Link>
            </div>
          </div>

          <Card className="relative overflow-hidden border-purple-400/20 bg-[#0b111d] p-4 sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400/80 via-purple-400/70 to-amber-300/70" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  {t("walletStatus")}
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  {t("profileOverview")}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                <WalletCards size={22} />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-gray-800 bg-black/24 p-4">
                <p className="mb-3 text-sm font-bold text-gray-400">
                  {t("availableBalance")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <PointsBadge type="free" amount={profileUser.freePoints} size="lg" showLabel />
                  <PointsBadge type="premium" amount={profileUser.premiumCredits} size="lg" showLabel />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-black/24 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-400">
                      {t("nextLevel")}
                    </p>
                    <h3 className="mt-1 text-xl font-black text-white">
                      {t("level", { level: profileUser.level })}
                    </h3>
                  </div>
                  <span className="font-mono text-sm font-black text-purple-300">
                    {xpProgress.toLocaleString()} / {xpTarget.toLocaleString()} XP
                  </span>
                </div>
                <ProgressBar value={xpProgress} max={xpTarget} color="purple" size="lg" />
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {t("xpToLevel", { xp: xpRemaining, level: profileUser.level + 1 })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={Activity}
          eyebrow={t("accountSignal")}
          title={t("competitiveRecord")}
          description={t("competitiveRecordHint")}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              tone={stat.tone}
            />
          ))}
        </div>
      </section>

      <Card className="border-cyan-400/15 bg-[#0b111d] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
              {t("myStats")}
            </p>
            <h3 className="mt-1 text-xl font-black text-white">
              {t("fullStats")}
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              {t("fullStatsHint")}
            </p>
          </div>
          <Link
            href={`/${locale}/stats`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-black text-black transition-colors hover:bg-cyan-400"
          >
            <BarChart3 size={16} />
            {t("fullStats")}
            <ChevronRight size={16} />
          </Link>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-[#0b111d] p-4 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-400">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black leading-none text-white">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/28">
          <Icon size={20} className={tone} />
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Target;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#080d17] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black text-white">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function extractCurrentUser(response: CurrentUserResponse): CurrentUserData | null {
  if ("user" in response && response.user) {
    return extractCurrentUser(response.user);
  }
  if ("member" in response && response.member) {
    return extractCurrentUser(response.member);
  }
  if ("profile" in response && response.profile) {
    return extractCurrentUser(response.profile);
  }
  if ("data" in response && response.data) {
    return extractCurrentUser(response.data);
  }
  return response as CurrentUserData;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function pickNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function formatMemberSince(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date);
}
