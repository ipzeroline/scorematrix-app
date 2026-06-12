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
import { Target, Zap, Star, TrendingUp, BarChart3, Pencil } from "lucide-react";

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
  const xpProgress = profileUser.xp - (profileUser.level - 1) * 1000;
  const xpTarget = 1000;
  const memberSince = profileMeta.createdAt
    ? formatMemberSince(profileMeta.createdAt, locale)
    : "Jan 2026";

  const stats = [
    { label: t("predictions"), value: profileUser.totalPredictions.toString(), icon: Target, className: "text-cyan-400" },
    { label: t("accuracy"), value: `${profileUser.accuracy}%`, icon: TrendingUp, className: "text-green-400" },
    { label: t("bestStreak"), value: profileUser.bestStreak.toString(), icon: Zap, className: "text-amber-400" },
    { label: t("achievements"), value: `${profileUser.achievementsUnlocked}/25`, icon: Star, className: "text-purple-400" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="flex flex-col sm:flex-row items-center gap-4 p-6">
        <Avatar
          src={profileMeta.avatarUrl}
          fallback={profileUser.username.slice(0, 2).toUpperCase()}
          size="xl"
          className="ring-2 ring-cyan-500/30"
        />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-xl font-bold font-display text-white">{profileUser.displayName}</h1>
          <p className="text-xs text-gray-500">@{profileUser.username}</p>
          <p className="text-sm text-gray-500">
            {profileLoading
              ? t("loadingProfile")
              : t("memberSince", { date: memberSince })}
          </p>
          {profileError && (
            <p className="mt-1 text-xs text-red-400">{profileError}</p>
          )}
          <div className="flex gap-2 mt-2 justify-center sm:justify-start">
            <Badge variant="purple">{t("level", { level: profileUser.level })}</Badge>
            <Badge variant="cyan">{profileUser.rank}</Badge>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 sm:items-end">
          <div className="flex gap-2">
            <PointsBadge type="free" amount={profileUser.freePoints} size="lg" showLabel />
            <PointsBadge type="premium" amount={profileUser.premiumCredits} size="lg" showLabel />
          </div>
          <Link
            href={`/${locale}/profile/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
          >
            <Pencil size={14} />
            {t("editProfile")}
          </Link>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="text-center p-4">
            <s.icon size={20} className={`mx-auto mb-2 ${s.className}`} />
            <div className="text-lg font-bold font-mono text-white">{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* XP Progress */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-white">{t("level", { level: profileUser.level })}</h3>
          <span className="text-xs text-purple-400 font-mono">{xpProgress.toLocaleString()} / {xpTarget.toLocaleString()} XP</span>
        </div>
        <ProgressBar value={xpProgress} max={xpTarget} color="purple" size="md" />
        <p className="text-[10px] text-gray-600 mt-1">
          {t("xpToLevel", { xp: xpTarget - xpProgress, level: profileUser.level + 1 })}
        </p>
      </Card>

      {/* View Full Stats */}
      <Link
        href={`/${locale}/stats`}
        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm font-medium"
      >
        <BarChart3 size={16} />
        View Full Statistics
      </Link>

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
