"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardList,
  Coins,
  Copy,
  Crown,
  Flame,
  LockKeyhole,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Search,
  Send,
  Smile,
  Trash2,
  UserMinus,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import {
  approveLeagueJoinRequest,
  getLeague,
  getLeagues,
  getLeagueJoinRequests,
  kickLeagueMember,
  rejectLeagueJoinRequest,
  type AvailableLeague,
  type JoinedLeague,
  type LeagueDetail,
  type LeagueStanding,
  type LeagueJoinRequest,
} from "@/lib/leagues-api";
import { ApiClientError, isAuthSessionExpiredError } from "@/lib/api-client";
import {
  createLeagueThread,
  createLeagueThreadReply,
  deleteLeagueThread,
  deleteLeagueThreadReaction,
  getLeagueThread,
  getLeagueThreads,
  sendMemberHeartbeat,
  setLeagueThreadLocked,
  setLeagueThreadPinned,
  setLeagueThreadReaction,
  type LeagueWebboardChannel,
  type LeagueWebboardDetailResult,
  type LeagueWebboardListResult,
  type LeagueWebboardReaction,
  type LeagueWebboardReply,
  type LeagueWebboardThread,
  type LeagueWebboardUser,
} from "@/lib/league-webboard-api";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

const LEAGUE_LOGO_OVERRIDE_KEY = "scorematrix:league-logo:";
const LEAGUE_DETAIL_CACHE_KEY = "scorematrix:league-detail:";
const MEMBER_HEARTBEAT_INTERVAL_MS = 40_000;
const WEBBOARD_PAGE_SIZE = 20;
const WEBBOARD_EMOJI_GROUPS = [
  {
    id: "match",
    icon: "⚽",
    label: "Match",
    emojis: [
      "⚽",
      "🥅",
      "🏟️",
      "📣",
      "🏃",
      "🥇",
      "🥈",
      "🥉",
      "🏅",
      "🎖️",
      "🏆",
      "👑",
      "🧤",
      "🥾",
      "🟨",
      "🟥",
    ],
  },
  {
    id: "hype",
    icon: "🔥",
    label: "Hype",
    emojis: [
      "🔥",
      "⚡",
      "🚀",
      "💥",
      "💯",
      "✅",
      "☑️",
      "🎯",
      "💪",
      "👏",
      "🙌",
      "🤝",
      "🫡",
      "👌",
      "👍",
      "💎",
    ],
  },
  {
    id: "mood",
    icon: "😀",
    label: "Mood",
    emojis: [
      "😀",
      "😄",
      "😂",
      "🤣",
      "😎",
      "🤩",
      "🥳",
      "😤",
      "😮",
      "😱",
      "😭",
      "😅",
      "🤔",
      "🫣",
      "😬",
      "🫠",
    ],
  },
  {
    id: "strategy",
    icon: "🧠",
    label: "Strategy",
    emojis: [
      "🧠",
      "📊",
      "📈",
      "📉",
      "🔍",
      "👀",
      "📝",
      "📌",
      "🧩",
      "♟️",
      "⏱️",
      "🔒",
      "🔓",
      "🧪",
      "🪄",
      "💡",
    ],
  },
  {
    id: "celebrate",
    icon: "🎉",
    label: "Celebrate",
    emojis: [
      "🎉",
      "🎊",
      "🥂",
      "🍻",
      "🍾",
      "💰",
      "🪙",
      "🎁",
      "🌟",
      "✨",
      "💫",
      "🔱",
      "🛡️",
      "⚔️",
      "🦾",
      "🖤",
    ],
  },
];

type LeagueTranslator = ReturnType<typeof useTranslations<"leagues">>;
type WebboardChannel = LeagueWebboardChannel;
type WebboardReaction = LeagueWebboardReaction;

type WebboardReply = {
  id: string;
  author: string;
  avatarUrl: string | null;
  level: number;
  body: string;
  time: string;
};

type WebboardThread = {
  id: string;
  source: "api" | "fallback";
  channel: WebboardChannel;
  author: string;
  avatarUrl: string | null;
  level: number;
  time: string;
  title: string;
  body: string;
  tags: string[];
  replies: WebboardReply[];
  replyCount: number;
  reactions: Record<WebboardReaction, number>;
  reacted: WebboardReaction | null;
  views: number;
  isLocked?: boolean;
  pinned?: boolean;
};

type OnlineWebboardMember = {
  id: string;
  name: string;
  avatarUrl: string | null;
  level: number;
};

export default function LeagueDetailPage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const t = useTranslations("leagues");
  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(() => Date.now());
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [joinRequests, setJoinRequests] = useState<LeagueJoinRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [processingRequestKey, setProcessingRequestKey] = useState<string | null>(
    null
  );
  const [kickingUserId, setKickingUserId] = useState<string | null>(null);
  const logoOverrideUrl = readStoredLeagueLogoOverride(id);
  const addToast = useNotificationStore((state) => state.addToast);
  const currentUserId = useUserStore((state) => state.userId);
  const currentUsername = useUserStore((state) => state.username);
  const currentDisplayName = useUserStore((state) => state.displayName);
  const currentAvatarUrl = useUserStore((state) => state.avatarUrl);
  const currentAccuracy = useUserStore((state) => state.accuracy);
  const currentPredictions = useUserStore((state) => state.totalPredictions);
  const currentCorrectPredictions = useUserStore(
    (state) => state.correctPredictions
  );
  const currentLevel = useUserStore((state) => state.level);
  const canManageLeague = league
    ? canManageLeagueDetail(league, {
        userId: currentUserId,
        username: currentUsername,
        displayName: currentDisplayName,
      })
    : false;

  const copyInviteCode = async (inviteCode: string) => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1600);
    } catch {
      setCopiedInvite(false);
    }
  };

  useEffect(() => {
    let active = true;

    getLeague(id, { locale })
      .then((response) => {
        if (!active) return;
        setLeague(response);
        storeCachedLeagueDetail(response);
        setLoadFailed(false);
      })
      .catch(async (error) => {
        if (!active || isAuthSessionExpiredError(error)) return;
        const fallbackLeague =
          readCachedLeagueDetail(id) ??
          (await loadLeagueDetailFallback(id, locale, currentUserId));
        if (!active) return;
        setLeague(fallbackLeague);
        setLoadFailed(!fallbackLeague);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUserId, id, locale, refreshKey]);

  useEffect(() => {
    if (!canManageLeague) {
      return;
    }

    let active = true;

    getLeagueJoinRequests(id, { locale })
      .then((requests) => {
        if (!active) return;
        setJoinRequests(
          requests.filter(
            (request) =>
              request.status === "pending" &&
              !isSelfJoinRequest(request, league, {
                userId: currentUserId,
                username: currentUsername,
                displayName: currentDisplayName,
              })
          )
        );
      })
      .catch((error) => {
        if (!active || isAuthSessionExpiredError(error)) return;
        setJoinRequests([]);
      })
      .finally(() => {
        if (active) setRequestsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    canManageLeague,
    currentDisplayName,
    currentUserId,
    currentUsername,
    id,
    league,
    locale,
    refreshKey,
  ]);

  const handleApproveRequest = async (request: LeagueJoinRequest) => {
    setProcessingRequestKey(`approve:${request.id}`);

    try {
      await approveLeagueJoinRequest(id, request.id, request.userId, { locale });
      setJoinRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
      setRefreshKey((current) => current + 1);
      addToast({ type: "success", title: t("requestApproved") });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : t("requestActionError");
      addToast({ type: "error", title: t("requestActionError"), message });
    } finally {
      setProcessingRequestKey(null);
    }
  };

  const handleRejectRequest = async (request: LeagueJoinRequest) => {
    setProcessingRequestKey(`reject:${request.id}`);

    try {
      await rejectLeagueJoinRequest(id, request.id, request.userId, { locale });
      setJoinRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
      addToast({ type: "success", title: t("requestRejected") });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : t("requestActionError");
      addToast({ type: "error", title: t("requestActionError"), message });
    } finally {
      setProcessingRequestKey(null);
    }
  };

  const handleKickMember = async (userId: string) => {
    if (!window.confirm(t("confirmKick"))) return;

    setKickingUserId(userId);

    try {
      await kickLeagueMember(id, userId, { locale });
      setRefreshKey((current) => current + 1);
      addToast({
        type: "success",
        title: t("memberKicked"),
        message: t("cooldownNotice"),
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : t("kickError");
      addToast({ type: "error", title: t("kickError"), message });
    } finally {
      setKickingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-56" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (loadFailed || !league) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        <BackLink locale={locale} label={t("backToLeagues")} />
        <Card className="p-10 text-center">
          <Trophy className="mx-auto text-gray-600" size={36} />
          <h1 className="mt-4 text-lg font-semibold text-white">
            {t("detailUnavailable")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t("loadError")}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setLoading(true);
              setRefreshKey((value) => value + 1);
            }}
          >
            {t("retry")}
          </Button>
        </Card>
      </div>
    );
  }

  const capacityPercent = Math.min(
    Math.round((league.memberCount / league.maxMembers) * 100),
    100
  );
  const createdAt = new Date(league.createdAt).toLocaleDateString(locale, {
    dateStyle: "medium",
  });
  const standings = sortLeagueStandingsForDisplay(
    buildDisplayStandings(league, {
      userId: currentUserId,
      username: currentUsername,
      displayName: currentDisplayName,
      avatarUrl: currentAvatarUrl,
      points: league.myPoints ?? 0,
      accuracy: currentAccuracy,
      predictionsCount: currentPredictions,
      correctPredictions: currentCorrectPredictions,
      level: currentLevel,
    }),
    league,
    {
      canManageLeague,
      userId: currentUserId,
      username: currentUsername,
      displayName: currentDisplayName,
    }
  );
  const displayedMemberCount = Math.max(league.memberCount, standings.length);
  const filteredHistory = filterLeagueHistory(league.history, historySearch);
  const historyPreview = league.history.slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        <BackLink locale={locale} label={t("backToLeagues")} />

        <Card
          neon="cyan"
          className="overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] via-[#12121a] to-purple-500/[0.05] p-5 sm:p-6"
        >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
            <LeagueLogo
              name={league.name}
              logoUrl={logoOverrideUrl ?? league.logoUrl}
              cacheKey={refreshKey}
            />
            <div className="min-w-0 max-w-2xl">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant={league.isPrivate ? "purple" : "green"}>
                  {league.isPrivate ? t("locked") : t("public")}
                </Badge>
                {league.myRank && (
                  <Badge variant="gold">
                    {t("yourRank")} #{league.myRank}
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 font-display text-3xl font-black leading-tight text-white sm:text-4xl">
                {league.name}
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-gray-400 sm:text-base">
                {league.description || t("noDescription")}
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-6 grid gap-3 sm:grid-cols-2 ${canManageLeague ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
          <Metric icon={Users} label={t("members")} value={`${displayedMemberCount}/${league.maxMembers}`} tone="text-cyan-300" />
          <Metric icon={Coins} label={t("entryFee")} value={league.entryFeeCredits === 0 ? t("free") : `${league.entryFeeCredits.toLocaleString()} Premium Credits`} tone="text-amber-300" />
          {canManageLeague ? (
            <Metric
              icon={WalletCards}
              label={t("totalFeesReceived")}
              value={`${(league.totalFeesReceived ?? 0).toLocaleString()} Premium Credits`}
              tone="text-green-300"
            />
          ) : null}
          <Metric icon={Crown} label={t("yourRank")} value={league.myRank ? `#${league.myRank}` : "-"} tone="text-amber-300" />
          <Metric icon={CalendarDays} label={t("createdAt")} value={createdAt} tone="text-purple-300" />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>{t("capacity")}</span>
            <span>{capacityPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-cyan-400"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
        </Card>

        <LeagueWebboardMockup
          league={league}
          standings={standings}
          locale={locale}
          canManageLeague={canManageLeague}
          currentUser={{
            username: currentUsername,
            displayName: currentDisplayName,
            avatarUrl: currentAvatarUrl,
            level: currentLevel,
          }}
          t={t}
        />

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-4">
            <div>
              <h2 className="text-sm font-semibold text-white">{t("standings")}</h2>
              <p className="mt-1 text-xs text-gray-500">{t("standingsDescription")}</p>
            </div>
            <Badge variant="cyan">{standings.length} {t("members")}</Badge>
          </div>

          {standings.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              {t("noStandings")}
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {standings.map((standing) => {
                const memberLevel = getDisplayLevel(standing.level);

                return (
                  <div
                    key={`${standing.userId}-${standing.rank}`}
                    className="grid gap-3 px-4 py-4 md:grid-cols-[44px_minmax(0,1fr)_auto_auto] md:items-center"
                  >
                  <div className="flex items-center gap-3 md:contents">
                    <Rank rank={standing.rank} />
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar
                        src={standing.avatarUrl}
                        fallback={getMemberInitials(standing)}
                        size="lg"
                        level={memberLevel}
                        className="shrink-0 border-cyan-500/20 bg-cyan-500/10"
                      />
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white sm:text-base">
                            {getMemberDisplayName(standing, t("rankedMember", { rank: standing.rank }))}
                          </p>
                          {isOwnerStanding(standing, league, {
                            canManageLeague,
                            userId: currentUserId,
                            username: currentUsername,
                            displayName: currentDisplayName,
                          }) ? (
                            <Badge variant="gold" size="sm">
                              <Crown size={12} />
                              {t("owner")}
                            </Badge>
                          ) : null}
                          <span className="rounded-md border border-purple-400/20 bg-purple-400/10 px-2 py-0.5 text-[10px] font-bold text-purple-200">
                            LV {memberLevel}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                          {standing.username && standing.username !== standing.displayName ? (
                            <span className="truncate">@{standing.username}</span>
                          ) : null}
                          <span>{t("accuracy")}: {formatPercentValue(standing.accuracy)}</span>
                          {standing.predictionsCount !== null ? (
                            <span>{t("predictions")}: {standing.predictionsCount.toLocaleString()}</span>
                          ) : null}
                          {standing.wins !== null ? (
                            <span>{t("wins")}: {standing.wins.toLocaleString()}</span>
                          ) : null}
                          {standing.joinedAt ? (
                            <span>{formatJoinedDate(standing.joinedAt, locale)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] px-3 py-2 md:block md:min-w-28 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 md:hidden">
                      {t("points")}
                    </p>
                    <p className="text-lg font-black text-cyan-300 md:text-sm md:font-semibold">
                      {standing.points.toLocaleString()}
                    </p>
                    <p className="hidden text-[10px] text-gray-600 md:block">{t("points")}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Target size={15} className="hidden text-gray-600 md:block" />
                    {canManageLeague && !isOwnerStanding(standing, league, {
                      canManageLeague,
                      userId: currentUserId,
                      username: currentUsername,
                      displayName: currentDisplayName,
                    }) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        loading={kickingUserId === standing.userId}
                        onClick={() => handleKickMember(standing.userId)}
                        className="min-h-8 px-2 text-xs"
                      >
                        <UserMinus size={13} />
                        {t("kick")}
                      </Button>
                    ) : null}
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              {league.isPrivate ? (
                <LockKeyhole size={16} className="text-purple-300" />
              ) : (
                <ShieldCheck size={16} className="text-green-300" />
              )}
              <h2 className="text-sm font-semibold text-white">
                {t("leagueAccess")}
              </h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {league.isPrivate ? t("privateLeagueDescription") : t("publicLeagueDescription")}
            </p>
            {league.inviteCode && (
              <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-purple-300">
                  {t("inviteCode")}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate font-mono text-sm font-semibold text-white">
                    {league.inviteCode}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyInviteCode(league.inviteCode ?? "")}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-purple-300/20 text-purple-100 transition-colors hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100"
                    title={t("inviteCode")}
                    aria-label={t("inviteCode")}
                  >
                    {copiedInvite ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            )}
          </Card>

          {canManageLeague ? (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-amber-300" />
                  <h2 className="text-sm font-semibold text-white">
                    {t("pendingRequests")}
                  </h2>
                </div>
                <Badge variant="gold" size="sm">
                  {joinRequests.length}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {t("pendingRequestsDescription")}
              </p>

              {requestsLoading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : joinRequests.length === 0 ? (
                <p className="mt-4 rounded-lg border border-gray-800 bg-black/20 p-3 text-xs text-gray-500">
                  {t("noPendingRequests")}
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {joinRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-lg border border-gray-800 bg-black/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar
                            src={request.avatarUrl}
                            fallback={getJoinRequestInitials(request)}
                            size="lg"
                            level={1}
                            className="shrink-0 border-cyan-400/25 bg-cyan-400/10"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {getJoinRequestDisplayName(request)}
                            </p>
                            {request.username ? (
                              <p className="mt-0.5 truncate text-xs font-semibold text-cyan-200/80">
                                @{request.username}
                              </p>
                            ) : (
                              <p className="mt-0.5 truncate text-xs font-semibold text-cyan-200/70">
                                ID: {shortUserId(request.userId)}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                              {request.requestedAt
                                ? formatRequestDate(request.requestedAt, locale)
                                : t("pendingApproval")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="gold" size="sm">
                          {t("pendingApproval")}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          size="sm"
                          loading={processingRequestKey === `approve:${request.id}`}
                          onClick={() => handleApproveRequest(request)}
                          className="min-h-9 text-sm font-black"
                        >
                          <Check size={14} />
                          {t("approve")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          loading={processingRequestKey === `reject:${request.id}`}
                          onClick={() => handleRejectRequest(request)}
                          className="min-h-9 text-sm font-black"
                        >
                          {t("reject")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : null}

          {canManageLeague ? (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-cyan-300" />
                  <h2 className="text-sm font-semibold text-white">
                    {t("historyTitle")}
                  </h2>
                </div>
                <Badge variant="cyan" size="sm">
                  {league.history.length}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {t("historyDescription")}
              </p>

              {league.history.length === 0 ? (
                <p className="mt-4 rounded-lg border border-gray-800 bg-black/20 p-3 text-xs text-gray-500">
                  {t("noHistory")}
                </p>
              ) : (
                <>
                  <div className="mt-4 space-y-2">
                    {historyPreview.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-gray-800 bg-black/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {formatHistoryTitle(entry, t)}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {formatHistoryMeta(entry)}
                          </p>
                          {entry.createdAt ? (
                            <p className="mt-1 text-[11px] text-gray-600">
                              {formatRequestDate(entry.createdAt, locale)}
                            </p>
                          ) : null}
                        </div>
                        {entry.pointsChange !== 0 ? (
                          <span className="shrink-0 rounded-md border border-green-400/20 bg-green-400/10 px-2 py-1 font-mono text-xs font-black text-green-300">
                            +{entry.pointsChange.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => setHistoryOpen(true)}
                  >
                    {t("viewAllHistory")}
                  </Button>
                </>
              )}
            </Card>
          ) : null}
        </div>
      </div>
      </div>

      {canManageLeague ? (
        <Modal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          title={t("historyTitle")}
          size="lg"
          className="max-w-3xl p-4 sm:p-6"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">
                  {t("historyDescription")}
                </p>
                <Badge variant="cyan" size="sm">
                  {filteredHistory.length}
                </Badge>
              </div>
              <div className="relative mt-3">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <Input
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  placeholder={t("historySearch")}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <p className="rounded-xl border border-gray-800 bg-black/20 p-4 text-sm text-gray-500">
                {t("noHistory")}
              </p>
            ) : (
              <div className="max-h-[min(62vh,620px)] space-y-2 overflow-y-auto pr-1">
                {filteredHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-gray-800 bg-black/20 p-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {formatHistoryTitle(entry, t)}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {formatHistoryMeta(entry)}
                        </p>
                        {entry.createdAt ? (
                          <p className="mt-1 text-[11px] text-gray-600">
                            {formatRequestDate(entry.createdAt, locale)}
                          </p>
                        ) : null}
                      </div>
                      {entry.pointsChange !== 0 ? (
                        <span className="w-fit shrink-0 rounded-md border border-green-400/20 bg-green-400/10 px-2 py-1 font-mono text-xs font-black text-green-300">
                          +{entry.pointsChange.toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function LeagueWebboardMockup({
  league,
  standings,
  locale,
  canManageLeague,
  currentUser,
  t,
}: {
  league: LeagueDetail;
  standings: LeagueStanding[];
  locale: string;
  canManageLeague: boolean;
  currentUser: {
    username: string;
    displayName: string;
    avatarUrl: string;
    level: number;
  };
  t: LeagueTranslator;
}) {
  const topMembers = standings.slice(0, 4);
  const displayName =
    currentUser.displayName ||
    currentUser.username ||
    topMembers[0]?.displayName ||
    topMembers[0]?.username ||
    t("webboardMember");
  const leagueId = String(league.id);
  const seedThreads = useMemo(
    () => buildMockThreads(league, standings, t),
    [league, standings, t]
  );
  const [threads, setThreads] = useState<WebboardThread[]>([]);
  const [webboardLoading, setWebboardLoading] = useState(true);
  const [webboardLoadingMore, setWebboardLoadingMore] = useState(false);
  const [webboardFailed, setWebboardFailed] = useState(false);
  const [postingThread, setPostingThread] = useState(false);
  const [postingReply, setPostingReply] = useState(false);
  const [reactionThreadId, setReactionThreadId] = useState<string | null>(null);
  const [moderatingThreadId, setModeratingThreadId] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<WebboardChannel>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [activeEmojiGroupId, setActiveEmojiGroupId] = useState(
    WEBBOARD_EMOJI_GROUPS[0].id
  );
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThreadDetail, setActiveThreadDetail] =
    useState<WebboardThread | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [channelCounts, setChannelCounts] = useState<Record<WebboardChannel, number>>({
    general: 0,
    predictions: 0,
    results: 0,
  });
  const [webboardPage, setWebboardPage] = useState(1);
  const [webboardTotalPages, setWebboardTotalPages] = useState(1);
  const [webboardAccessDenied, setWebboardAccessDenied] = useState(false);
  const [heartbeatOnlineCount, setHeartbeatOnlineCount] = useState<number | null>(null);
  const [heartbeatOnlineMembers, setHeartbeatOnlineMembers] = useState<
    OnlineWebboardMember[]
  >([]);
  const addToast = useNotificationStore((state) => state.addToast);
  const onlineCount = heartbeatOnlineCount ?? 0;
  const onlineMembers = heartbeatOnlineMembers;
  const activeThread =
    activeThreadDetail ??
    threads.find((thread) => thread.id === activeThreadId) ??
    null;
  const filteredThreads = useMemo(() => {
    if (searchQuery.trim()) return threads;

    return threads.filter((thread) => {
      const matchesChannel = thread.channel === activeChannel || thread.pinned;
      return matchesChannel;
    });
  }, [activeChannel, searchQuery, threads]);
  const pinnedCount = threads.filter((thread) => thread.pinned).length;
  const featuredPinnedThread =
    threads.find((thread) => thread.pinned) ??
    (webboardFailed ? seedThreads.find((thread) => thread.pinned) : undefined);
  const totalThreadCount =
    Object.values(channelCounts).reduce((sum, value) => sum + value, 0) ||
    threads.length;
  const activeEmojiGroup =
    WEBBOARD_EMOJI_GROUPS.find((group) => group.id === activeEmojiGroupId) ??
    WEBBOARD_EMOJI_GROUPS[0];
  const canLoadMoreThreads =
    !webboardLoading &&
    !webboardLoadingMore &&
    !webboardFailed &&
    !webboardAccessDenied &&
    webboardPage < webboardTotalPages;
  const applyOnlinePresence = useCallback((response: Pick<LeagueWebboardListResult, "onlineCount" | "onlineUsers">) => {
    setHeartbeatOnlineCount(response.onlineCount);
    setHeartbeatOnlineMembers(
      response.onlineUsers
        .map((member) => mapHeartbeatUserToOnlineMember(member, t))
        .filter((member): member is OnlineWebboardMember => Boolean(member))
        .slice(0, 12)
    );
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    async function loadThreads() {
      setWebboardLoading(true);
      setWebboardFailed(false);
      setWebboardAccessDenied(false);

      try {
        const response = await getLeagueThreads(
          leagueId,
          {
            channel: activeChannel,
            search: searchQuery.trim() || undefined,
            page: 1,
            limit: WEBBOARD_PAGE_SIZE,
          },
          { locale }
        );
        if (cancelled) return;
        setThreads(
          response.threads.map((thread) =>
            mapLeagueThreadToWebboardThread(thread, locale, t)
          )
        );
        setChannelCounts(response.channelCounts);
        setWebboardPage(response.pagination.page);
        setWebboardTotalPages(response.pagination.totalPages);
        applyOnlinePresence(response);
      } catch (error) {
        if (cancelled || isAuthSessionExpiredError(error)) return;
        if (isWebboardAccessDeniedError(error)) {
          setThreads([]);
          setChannelCounts({ general: 0, predictions: 0, results: 0 });
          setWebboardPage(1);
          setWebboardTotalPages(1);
          setWebboardAccessDenied(true);
          return;
        }
        console.warn(
          "Error loading league webboard:",
          error instanceof ApiClientError ? error.message : "request failed"
        );
        setThreads(seedThreads);
        setChannelCounts({
          general: seedThreads.filter((thread) => thread.channel === "general").length,
          predictions: seedThreads.filter((thread) => thread.channel === "predictions").length,
          results: seedThreads.filter((thread) => thread.channel === "results").length,
        });
        setWebboardPage(1);
        setWebboardTotalPages(1);
        setWebboardFailed(true);
      } finally {
        if (!cancelled) setWebboardLoading(false);
      }
    }

    void loadThreads();

    return () => {
      cancelled = true;
    };
  }, [activeChannel, applyOnlinePresence, leagueId, locale, searchQuery, seedThreads, t]);

  useEffect(() => {
    if (webboardAccessDenied || webboardFailed) return;

    let cancelled = false;

    const syncHeartbeat = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await sendMemberHeartbeat({ locale });
        if (cancelled) return;
        const nextOnlineMembers = response.onlineUsers
          .map((member) => mapHeartbeatUserToOnlineMember(member, t))
          .filter((member): member is OnlineWebboardMember => Boolean(member))
          .slice(0, 12);

        // Some heartbeat responses only acknowledge the ping. Do not clear the
        // webboard online list unless the backend sends an explicit count/list.
        if (response.onlineCount !== null) setHeartbeatOnlineCount(response.onlineCount);
        if (nextOnlineMembers.length > 0) setHeartbeatOnlineMembers(nextOnlineMembers);

        const presence = await getLeagueThreads(
          leagueId,
          {
            channel: activeChannel,
            page: 1,
            limit: 1,
          },
          { locale }
        );
        if (!cancelled) applyOnlinePresence(presence);
      } catch (error) {
        if (!cancelled && !isAuthSessionExpiredError(error)) {
          console.error("Error sending member heartbeat:", error);
        }
      }
    };

    void syncHeartbeat();
    const intervalId = window.setInterval(syncHeartbeat, MEMBER_HEARTBEAT_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void syncHeartbeat();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeChannel, applyOnlinePresence, leagueId, locale, t, webboardAccessDenied, webboardFailed]);

  const channelOptions: Array<{
    id: WebboardChannel;
    label: string;
    tone: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "general",
      label: t("webboardChannelGeneral"),
      tone: "text-cyan-300",
      icon: <MessageSquare size={14} />,
    },
    {
      id: "predictions",
      label: t("webboardChannelPredictions"),
      tone: "text-amber-300",
      icon: <Target size={14} />,
    },
    {
      id: "results",
      label: t("webboardChannelResults"),
      tone: "text-green-300",
      icon: <Trophy size={14} />,
    },
  ];

  const createThread = async () => {
    const body = draftBody.trim();
    const title = draftTitle.trim() || body.slice(0, 72);
    if (!title || !body || webboardAccessDenied) return;

    setPostingThread(true);
    try {
      const thread = await createLeagueThread(
        leagueId,
        {
          channel: activeChannel,
          title,
          body,
          tags: getWebboardChannelTags(activeChannel, t).slice(0, 5),
        },
        { locale }
      );
      const nextThread = mapLeagueThreadToWebboardThread(thread, locale, t);
      setThreads((current) => [nextThread, ...current]);
      setChannelCounts((current) => ({
        ...current,
        [activeChannel]: current[activeChannel] + 1,
      }));
      setDraftTitle("");
      setDraftBody("");
    } catch (error) {
      if (!isAuthSessionExpiredError(error)) {
        const message =
          error instanceof ApiClientError ? error.message : t("requestActionError");
        addToast({ type: "error", title: t("requestActionError"), message });
      }
    } finally {
      setPostingThread(false);
    }
  };

  const loadMoreThreads = async () => {
    if (!canLoadMoreThreads) return;

    const nextPage = webboardPage + 1;
    setWebboardLoadingMore(true);
    try {
      const response = await getLeagueThreads(
        leagueId,
        {
          channel: activeChannel,
          search: searchQuery.trim() || undefined,
          page: nextPage,
          limit: WEBBOARD_PAGE_SIZE,
        },
        { locale }
      );
      const nextThreads = response.threads.map((thread) =>
        mapLeagueThreadToWebboardThread(thread, locale, t)
      );
      setThreads((current) => mergeUniqueWebboardThreads(current, nextThreads));
      setChannelCounts(response.channelCounts);
      setWebboardPage(response.pagination.page);
      setWebboardTotalPages(response.pagination.totalPages);
      setHeartbeatOnlineCount(response.onlineCount);
      setHeartbeatOnlineMembers(
        response.onlineUsers
          .map((member) => mapHeartbeatUserToOnlineMember(member, t))
          .filter((member): member is OnlineWebboardMember => Boolean(member))
          .slice(0, 12)
      );
    } catch (error) {
      if (!isAuthSessionExpiredError(error)) {
        const message =
          error instanceof ApiClientError ? error.message : t("requestActionError");
        addToast({ type: "error", title: t("requestActionError"), message });
      }
    } finally {
      setWebboardLoadingMore(false);
    }
  };

  const openThread = async (threadId: string) => {
    const localThread = threads.find((thread) => thread.id === threadId) ?? null;
    setActiveThreadId(threadId);
    setActiveThreadDetail(localThread);
    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId ? { ...thread, views: thread.views + 1 } : thread
      )
    );

    if (!localThread || localThread.source !== "api") {
      return;
    }

    try {
      const response = await getLeagueThread(leagueId, threadId, { locale });
      const detail = mapLeagueThreadDetailToWebboardThread(response, locale, t);
      setActiveThreadDetail(detail);
      setThreads((current) =>
        current.map((thread) => (thread.id === threadId ? detail : thread))
      );
    } catch (error) {
      if (!isAuthSessionExpiredError(error)) {
        console.error("Error loading league webboard thread:", error);
      }
    }
  };

  const toggleReaction = async (threadId: string, reaction: WebboardReaction) => {
    const previousThread = threads.find((thread) => thread.id === threadId);
    if (!previousThread || reactionThreadId || webboardAccessDenied) return;

    setReactionThreadId(threadId);
    if (previousThread.source !== "api") {
      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId ? applyOptimisticReaction(thread, reaction) : thread
        )
      );
      setReactionThreadId(null);
      return;
    }

    setThreads((current) =>
      current.map((thread) => {
        if (thread.id !== threadId) return thread;
        return applyOptimisticReaction(thread, reaction);
      })
    );

    if (activeThreadDetail?.id === threadId) {
      setActiveThreadDetail(applyOptimisticReaction(activeThreadDetail, reaction));
    }

    try {
      const response =
        previousThread.reacted === reaction
          ? await deleteLeagueThreadReaction(leagueId, threadId, { locale })
          : await setLeagueThreadReaction(leagueId, threadId, reaction, { locale });

      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                reacted: response.myReaction,
                reactions: response.reactions,
              }
            : thread
        )
      );
      if (activeThreadDetail?.id === threadId) {
        setActiveThreadDetail((current) =>
          current
            ? {
                ...current,
                reacted: response.myReaction,
                reactions: response.reactions,
              }
            : current
        );
      }
    } catch (error) {
      setThreads((current) =>
        current.map((thread) => (thread.id === threadId ? previousThread : thread))
      );
      if (activeThreadDetail?.id === threadId) {
        setActiveThreadDetail(previousThread);
      }
      if (!isAuthSessionExpiredError(error)) {
        const message =
          error instanceof ApiClientError ? error.message : t("requestActionError");
        addToast({ type: "error", title: t("requestActionError"), message });
      }
    } finally {
      setReactionThreadId(null);
    }
  };

  const submitReply = async () => {
    const body = replyDraft.trim();
    if (
      !body ||
      !activeThread ||
      activeThread.isLocked ||
      activeThread.source !== "api" ||
      webboardAccessDenied
    ) {
      return;
    }

    setPostingReply(true);
    try {
      const reply = await createLeagueThreadReply(
        leagueId,
        activeThread.id,
        { body },
        { locale }
      );
      const nextReply = mapLeagueReplyToWebboardReply(reply, locale, t);
      const updatedThread = {
        ...activeThread,
        replies: [...activeThread.replies, nextReply],
        replyCount: activeThread.replyCount + 1,
      };
      setActiveThreadDetail(updatedThread);
      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeThread.id
            ? {
                ...updatedThread,
                replies: updatedThread.replies,
              }
            : thread
        )
      );
      setReplyDraft("");
    } catch (error) {
      if (!isAuthSessionExpiredError(error)) {
        const message =
          error instanceof ApiClientError ? error.message : t("requestActionError");
        addToast({ type: "error", title: t("requestActionError"), message });
      }
    } finally {
      setPostingReply(false);
    }
  };

  const moderateThread = async (
    thread: WebboardThread,
    action: "pin" | "lock" | "delete"
  ) => {
    if (!canManageLeague || thread.source !== "api" || moderatingThreadId) return;

    setModeratingThreadId(thread.id);
    try {
      if (action === "delete") {
        await deleteLeagueThread(leagueId, thread.id, { locale });
        setThreads((current) => current.filter((item) => item.id !== thread.id));
        setActiveThreadId((current) => (current === thread.id ? null : current));
        setActiveThreadDetail((current) => (current?.id === thread.id ? null : current));
        setChannelCounts((current) => ({
          ...current,
          [thread.channel]: Math.max(0, current[thread.channel] - 1),
        }));
        return;
      }

      const updated =
        action === "pin"
          ? await setLeagueThreadPinned(leagueId, thread.id, !thread.pinned, { locale })
          : await setLeagueThreadLocked(leagueId, thread.id, !thread.isLocked, { locale });
      const nextThread = mapLeagueThreadToWebboardThread(updated, locale, t);
      setThreads((current) =>
        current.map((item) =>
          item.id === thread.id
            ? {
                ...item,
                pinned: nextThread.pinned,
                isLocked: nextThread.isLocked,
              }
            : item
        )
      );
      setActiveThreadDetail((current) =>
        current?.id === thread.id
          ? {
              ...current,
              pinned: nextThread.pinned,
              isLocked: nextThread.isLocked,
            }
          : current
      );
    } catch (error) {
      if (!isAuthSessionExpiredError(error)) {
        const message =
          error instanceof ApiClientError ? error.message : t("requestActionError");
        addToast({ type: "error", title: t("requestActionError"), message });
      }
    } finally {
      setModeratingThreadId(null);
    }
  };

  const addEmojiToDraft = (emoji: string) => {
    setDraftBody((current) => `${current}${current ? " " : ""}${emoji}`);
  };

  return (
    <>
      <Card className="overflow-hidden border-cyan-400/20 bg-[#080d16] p-0 shadow-[0_0_42px_rgba(34,211,238,0.06)]">
        <div className="relative overflow-hidden border-b border-cyan-400/10 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,rgba(14,21,34,0.98),rgba(5,8,14,0.98))] px-4 py-4 sm:px-5">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="sm">
                  <MessageSquare size={12} />
                  {t("webboardEsportRoom")}
                </Badge>
                {webboardFailed ? (
                  <Badge variant="gold" size="sm">
                    {t("webboardLocalOnly")}
                  </Badge>
                ) : null}
              </div>
              <h2 className="mt-3 text-xl font-black leading-tight text-white sm:text-2xl">
                {t("webboardTitle")}
              </h2>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-gray-400">
                {t("webboardDescription")}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
              <WebboardStat label={t("webboardOnline")} value={onlineCount.toLocaleString()} tone="text-green-300" />
              <WebboardStat label={t("webboardThreads")} value={totalThreadCount.toLocaleString()} tone="text-cyan-300" />
              <WebboardStat label={t("webboardPinned")} value={pinnedCount.toLocaleString()} tone="text-amber-300" />
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-4 p-4 sm:p-5">
            <button
              type="button"
              onClick={() => {
                if (featuredPinnedThread) void openThread(featuredPinnedThread.id);
              }}
              disabled={!featuredPinnedThread}
              className="w-full rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4 text-left transition-colors hover:border-amber-300/40 disabled:cursor-default disabled:opacity-80"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-amber-200">
                    <Pin size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wide text-amber-300">
                      {t("webboardPinnedTopic")}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-base font-black text-white">
                      {featuredPinnedThread?.title ?? t("webboardPinnedTitle")}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-400">
                      {featuredPinnedThread?.body ?? t("webboardPinnedDescription")}
                    </p>
                  </div>
                </div>
                <Badge variant="gold" size="sm">
                  <Flame size={12} />
                  {t("webboardHot")}
                </Badge>
              </div>
            </button>

            {webboardAccessDenied ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 text-sm font-semibold leading-6 text-amber-100">
                {t("webboardMembersOnly")}
              </div>
            ) : null}

            <div className="rounded-2xl border border-cyan-400/15 bg-black/25 p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <Avatar
                  src={currentUser.avatarUrl}
                  fallback={displayName.slice(0, 2).toUpperCase()}
                  size="lg"
                  level={getDisplayLevel(currentUser.level)}
                  className="shrink-0 border-cyan-400/25 bg-cyan-400/10"
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {channelOptions.map((channel) => (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => setActiveChannel(channel.id)}
                        className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-black transition-colors ${
                          activeChannel === channel.id
                            ? "border-cyan-300/45 bg-cyan-300/10 text-cyan-100"
                            : "border-gray-800 bg-[#070a10] text-gray-500 hover:border-gray-700 hover:text-gray-300"
                        }`}
                      >
                        <span className={channel.tone}>{channel.icon}</span>
                        {channel.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    placeholder={t("webboardTitlePlaceholder")}
                    className="border-gray-800 bg-[#070a10] text-sm font-bold"
                    maxLength={96}
                  />
                  <textarea
                    value={draftBody}
                    onChange={(event) => setDraftBody(event.target.value)}
                    placeholder={t("webboardComposerPlaceholder")}
                    className="min-h-24 w-full resize-none rounded-xl border border-gray-800 bg-[#070a10] px-3 py-3 text-sm font-semibold leading-6 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-cyan-400/50"
                    maxLength={500}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-1">
                    <button
                      type="button"
                      onClick={() => setEmojiOpen((current) => !current)}
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-purple-400/20 bg-purple-400/[0.06] px-3 text-xs font-black text-purple-200 transition-colors hover:border-purple-300/40 hover:bg-purple-400/10"
                      aria-label={t("webboardReaction")}
                    >
                      <Smile size={16} />
                      {t("webboardEmoji")}
                    </button>
                    {emojiOpen ? (
                      <div className="order-last w-full rounded-xl border border-purple-400/20 bg-[#0b111d] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                        <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
                          {WEBBOARD_EMOJI_GROUPS.map((group) => (
                            <button
                              key={group.id}
                              type="button"
                              title={group.label}
                              onClick={() => setActiveEmojiGroupId(group.id)}
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-lg transition-colors ${
                                activeEmojiGroup.id === group.id
                                  ? "border-purple-300/50 bg-purple-400/15"
                                  : "border-transparent bg-black/20 hover:border-white/10 hover:bg-white/5"
                              }`}
                            >
                              {group.icon}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-8 gap-1 sm:grid-cols-10 md:grid-cols-12">
                          {activeEmojiGroup.emojis.map((emoji) => (
                            <button
                              key={`${activeEmojiGroup.id}-${emoji}`}
                              type="button"
                              onClick={() => addEmojiToDraft(emoji)}
                              className="grid h-9 w-9 place-items-center rounded-lg text-lg transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      className="min-h-9"
                      disabled={!draftBody.trim() || postingThread || webboardAccessDenied}
                      loading={postingThread}
                      onClick={createThread}
                    >
                      <Send size={14} />
                      {t("webboardPost")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-black/20 p-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("webboardSearchPlaceholder")}
                  className="border-gray-800 bg-[#070a10] pl-9 text-sm"
                />
              </div>
              <Badge variant="cyan" size="sm">
                {filteredThreads.length.toLocaleString()} {t("webboardThreads")}
              </Badge>
            </div>

            <div className="space-y-3">
              {webboardLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`webboard-skeleton-${index}`}
                    className="rounded-2xl border border-gray-800 bg-[#0b111d] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredThreads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-800 bg-[#0b111d] p-6 text-center text-sm font-semibold text-gray-500">
                  {t("webboardNoThreads")}
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="rounded-2xl border border-gray-800 bg-[#0b111d] p-4 transition-colors hover:border-cyan-400/20"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={thread.avatarUrl}
                        fallback={thread.author.slice(0, 2).toUpperCase()}
                        size="lg"
                        level={thread.level}
                        className="shrink-0 border-cyan-400/25 bg-cyan-400/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-black text-white">
                            {thread.author}
                          </p>
                          <span className="rounded-md border border-purple-400/20 bg-purple-400/10 px-2 py-0.5 text-[10px] font-bold text-purple-200">
                            LV {thread.level}
                          </span>
                          {thread.pinned ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black text-amber-200">
                              <Pin size={10} />
                              {t("webboardPinned")}
                            </span>
                          ) : null}
                          {thread.isLocked ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[10px] font-black text-red-200">
                              <LockKeyhole size={10} />
                              {t("webboardLocked")}
                            </span>
                          ) : null}
                          <span className="text-[11px] font-semibold text-gray-600">
                            {thread.time}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openThread(thread.id)}
                          className="mt-2 block w-full text-left"
                        >
                          <h3 className="text-base font-black leading-6 text-white transition-colors hover:text-cyan-200">
                            {thread.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-400">
                            {thread.body}
                          </p>
                        </button>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {thread.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <ReactionButton
                            label={t("webboardFire")}
                            value={thread.reactions.fire}
                            active={thread.reacted === "fire"}
                            onClick={() => toggleReaction(thread.id, "fire")}
                            icon={<Flame size={13} />}
                            disabled={reactionThreadId === thread.id}
                          />
                          <ReactionButton
                            label={t("webboardTarget")}
                            value={thread.reactions.target}
                            active={thread.reacted === "target"}
                            onClick={() => toggleReaction(thread.id, "target")}
                            icon={<Target size={13} />}
                            disabled={reactionThreadId === thread.id}
                          />
                          <ReactionButton
                            label={t("webboardSmile")}
                            value={thread.reactions.smile}
                            active={thread.reacted === "smile"}
                            onClick={() => toggleReaction(thread.id, "smile")}
                            icon={<Smile size={13} />}
                            disabled={reactionThreadId === thread.id}
                          />
                        </div>
                        {canManageLeague && thread.source === "api" ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <ThreadAdminButton
                              label={thread.pinned ? t("webboardUnpin") : t("webboardPin")}
                              icon={<Pin size={12} />}
                              disabled={moderatingThreadId === thread.id}
                              onClick={() => void moderateThread(thread, "pin")}
                            />
                            <ThreadAdminButton
                              label={thread.isLocked ? t("webboardUnlock") : t("webboardLock")}
                              icon={<LockKeyhole size={12} />}
                              disabled={moderatingThreadId === thread.id}
                              onClick={() => void moderateThread(thread, "lock")}
                            />
                            <ThreadAdminButton
                              label={t("webboardDelete")}
                              tone="danger"
                              icon={<Trash2 size={12} />}
                              disabled={moderatingThreadId === thread.id}
                              onClick={() => void moderateThread(thread, "delete")}
                            />
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => openThread(thread.id)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-600 transition-colors hover:bg-white/5 hover:text-white"
                        aria-label={t("webboardOpenThread")}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-800 pt-3 text-center">
                      <ThreadMetric label={t("webboardReplies")} value={thread.replyCount} />
                      <ThreadMetric label={t("webboardReactions")} value={getReactionTotal(thread)} />
                      <ThreadMetric label={t("webboardViews")} value={thread.views} />
                    </div>
                  </div>
                ))
              )}
              {canLoadMoreThreads ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-cyan-400/20 bg-black/20 text-cyan-100 hover:border-cyan-300/45"
                  loading={webboardLoadingMore}
                  disabled={webboardLoadingMore}
                  onClick={loadMoreThreads}
                >
                  {t("webboardLoadMore")}
                </Button>
              ) : null}
            </div>
          </div>

          <aside className="border-t border-gray-800 bg-black/18 p-4 sm:p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-green-400/15 bg-green-400/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-white">
                  {t("webboardOnlineSquad")}
                </h3>
                <span className="flex items-center gap-1 text-xs font-black text-green-300">
                  <span className="h-2 w-2 rounded-full bg-green-300 shadow-[0_0_10px_rgba(134,239,172,0.9)]" />
                  {onlineCount}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {onlineMembers.map((member) => {
                  return (
                    <div key={`${member.id}-online`} className="flex min-w-0 items-center gap-3">
                      <Avatar
                        src={member.avatarUrl}
                        fallback={getInitials(member.name)}
                        size="md"
                        level={member.level}
                        className="shrink-0 border-green-400/25 bg-green-400/10"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{member.name}</p>
                        <p className="text-xs text-gray-500">{t("webboardTypingReady")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
              <h3 className="text-sm font-black text-white">
                {t("webboardChannels")}
              </h3>
              <div className="mt-3 space-y-2">
                {channelOptions.map((channel) => {
                  const count = channelCounts[channel.id] ?? 0;
                  return (
                    <button
                      type="button"
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-3 py-2 transition-colors ${
                        activeChannel === channel.id
                          ? "border-cyan-300/45 bg-cyan-300/10"
                          : "border-gray-800 bg-black/20 hover:border-gray-700"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-gray-300">
                        <span className={channel.tone}>{channel.icon}</span>
                        <span className="truncate">{channel.label}</span>
                      </span>
                      <span className="font-mono text-xs font-black text-gray-500">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </Card>

      <Modal
        open={Boolean(activeThread)}
        onClose={() => {
          setActiveThreadId(null);
          setActiveThreadDetail(null);
          setReplyDraft("");
        }}
        title={activeThread?.title}
        size="lg"
        className="border-cyan-400/20 bg-[#0b111d]"
      >
        {activeThread ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-black/20 p-4">
              <Avatar
                src={activeThread.avatarUrl}
                fallback={activeThread.author.slice(0, 2).toUpperCase()}
                size="lg"
                level={activeThread.level}
                className="shrink-0 border-cyan-400/25 bg-cyan-400/10"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-black text-white">
                    {activeThread.author}
                  </p>
                  <span className="rounded-md border border-purple-400/20 bg-purple-400/10 px-2 py-0.5 text-[10px] font-bold text-purple-200">
                    LV {activeThread.level}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-600">
                    {activeThread.time}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {activeThread.body}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <ThreadMetric label={t("webboardReplies")} value={activeThread.replyCount} />
              <ThreadMetric label={t("webboardReactions")} value={getReactionTotal(activeThread)} />
              <ThreadMetric label={t("webboardViews")} value={activeThread.views} />
            </div>

            <div className="space-y-3">
              {activeThread.replies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-800 p-4 text-center text-sm font-semibold text-gray-500">
                  {t("webboardNoReplies")}
                </div>
              ) : (
                activeThread.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-3 rounded-xl border border-gray-800 bg-black/20 p-3">
                    <Avatar
                      src={reply.avatarUrl}
                      fallback={reply.author.slice(0, 2).toUpperCase()}
                      size="md"
                      level={reply.level}
                      className="shrink-0 border-purple-400/25 bg-purple-400/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-white">
                          {reply.author}
                        </p>
                        <span className="text-[11px] font-semibold text-gray-600">
                          {reply.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        {reply.body}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
                placeholder={t("webboardReplyPlaceholder")}
                className="border-gray-800 bg-[#070a10]"
                disabled={activeThread.isLocked || activeThread.source !== "api" || postingReply}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitReply();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                disabled={
                  !replyDraft.trim() ||
                  activeThread.isLocked ||
                  activeThread.source !== "api" ||
                  postingReply
                }
                loading={postingReply}
                onClick={submitReply}
                className="shrink-0"
              >
                <Send size={14} />
                {t("webboardSendReply")}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

function ReactionButton({
  label,
  value,
  active,
  onClick,
  icon,
  disabled,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-black transition-colors disabled:cursor-wait disabled:opacity-60 ${
        active
          ? "border-cyan-300/45 bg-cyan-300/10 text-cyan-100"
          : "border-gray-800 bg-black/20 text-gray-500 hover:border-gray-700 hover:text-gray-300"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className="font-mono">{value.toLocaleString()}</span>
    </button>
  );
}

function ThreadAdminButton({
  label,
  icon,
  onClick,
  disabled,
  tone = "neutral",
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-black transition-colors disabled:cursor-wait disabled:opacity-60 ${
        tone === "danger"
          ? "border-red-400/20 bg-red-400/10 text-red-200 hover:border-red-300/40"
          : "border-gray-800 bg-black/20 text-gray-400 hover:border-cyan-400/25 hover:text-cyan-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function mapLeagueThreadToWebboardThread(
  thread: LeagueWebboardThread,
  locale: string,
  t: LeagueTranslator
): WebboardThread {
  const author = getWebboardUserName(thread.author, t);

  return {
    id: thread.id,
    source: "api",
    channel: thread.channel,
    author,
    avatarUrl: thread.author.avatarUrl,
    level: getDisplayLevel(thread.author.level ?? 1),
    time: formatWebboardTime(thread.createdAt, locale, t),
    title: thread.title,
    body: thread.body || thread.bodyPreview,
    tags: thread.tags,
    replies: [],
    replyCount: thread.repliesCount,
    reactions: thread.reactions,
    reacted: thread.myReaction,
    views: thread.viewsCount,
    isLocked: thread.isLocked,
    pinned: thread.isPinned,
  };
}

function mapLeagueThreadDetailToWebboardThread(
  detail: LeagueWebboardDetailResult,
  locale: string,
  t: LeagueTranslator
): WebboardThread {
  const thread = mapLeagueThreadToWebboardThread(detail.thread, locale, t);

  return {
    ...thread,
    replyCount: Math.max(detail.replies.length, detail.thread.repliesCount),
    replies: detail.replies.map((reply) =>
      mapLeagueReplyToWebboardReply(reply, locale, t)
    ),
  };
}

function mapLeagueReplyToWebboardReply(
  reply: LeagueWebboardReply,
  locale: string,
  t: LeagueTranslator
): WebboardReply {
  const author = getWebboardUserName(reply.author, t);

  return {
    id: reply.id,
    author,
    avatarUrl: reply.author.avatarUrl,
    level: getDisplayLevel(reply.author.level ?? 1),
    body: reply.body,
    time: formatWebboardTime(reply.createdAt, locale, t),
  };
}

function getWebboardUserName(user: LeagueWebboardThread["author"], t: LeagueTranslator) {
  return user.displayName || user.username || t("webboardMember");
}

function mapHeartbeatUserToOnlineMember(
  user: LeagueWebboardUser,
  t: LeagueTranslator
): OnlineWebboardMember | null {
  const name = getWebboardUserName(user, t);
  if (!name) return null;

  return {
    id: user.id ?? user.username ?? name,
    name,
    avatarUrl: user.avatarUrl,
    level: getDisplayLevel(user.level ?? 1),
  };
}

function getInitials(name: string) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2);

  return (letters || name.slice(0, 2) || "SM").toUpperCase();
}

function formatWebboardTime(
  value: string | null,
  locale: string,
  t: LeagueTranslator
) {
  return value ? formatRequestDate(value, locale) : t("webboardTimeNow");
}

function applyOptimisticReaction(
  thread: WebboardThread,
  reaction: WebboardReaction
): WebboardThread {
  const reactions = { ...thread.reactions };

  if (thread.reacted === reaction) {
    reactions[reaction] = Math.max(0, reactions[reaction] - 1);
    return { ...thread, reactions, reacted: null };
  }

  if (thread.reacted) {
    reactions[thread.reacted] = Math.max(0, reactions[thread.reacted] - 1);
  }
  reactions[reaction] += 1;

  return { ...thread, reactions, reacted: reaction };
}

function mergeUniqueWebboardThreads(
  current: WebboardThread[],
  next: WebboardThread[]
) {
  const seen = new Set(current.map((thread) => thread.id));
  const uniqueNext = next.filter((thread) => {
    if (seen.has(thread.id)) return false;
    seen.add(thread.id);
    return true;
  });

  return [...current, ...uniqueNext];
}

function isWebboardAccessDeniedError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    (error.status === 403 || error.status === 404)
  );
}

function getReactionTotal(thread: WebboardThread) {
  return Object.values(thread.reactions).reduce((sum, value) => sum + value, 0);
}

function getWebboardChannelTags(channel: WebboardChannel, t: LeagueTranslator) {
  if (channel === "predictions") {
    return [t("webboardTagPrediction"), t("webboardTagStats")];
  }
  if (channel === "results") {
    return [t("webboardChannelResults"), t("webboardTagStats")];
  }
  return [t("webboardTagStrategy"), t("webboardTagMatchday")];
}

function WebboardStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-center">
      <p className={`font-mono text-lg font-black ${tone}`}>{value}</p>
      <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
    </div>
  );
}

function ThreadMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-sm font-black text-white">
        {value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">
        {label}
      </p>
    </div>
  );
}

function buildMockThreads(
  league: LeagueDetail,
  standings: LeagueStanding[],
  t: LeagueTranslator
): WebboardThread[] {
  const primary = standings[0];
  const secondary = standings[1] ?? standings[0];
  const fallbackAuthor = primary
    ? getMemberDisplayName(primary, t("webboardMember"))
    : t("webboardMember");

  return [
    {
      id: "rules",
      source: "fallback",
      channel: "general",
      author: fallbackAuthor,
      avatarUrl: null,
      level: getDisplayLevel(primary?.level ?? 10),
      time: t("webboardTimeNow"),
      title: t("webboardPinnedTitle"),
      body: t("webboardPinnedDescription"),
      tags: [t("webboardPinnedTopic"), t("webboardTagStrategy")],
      replies: [],
      replyCount: 0,
      reactions: { fire: 12, target: 7, smile: 5 },
      reacted: null,
      views: 210,
      pinned: true,
    },
    {
      id: "lineup",
      source: "fallback",
      channel: "general",
      author: primary ? getMemberDisplayName(primary, fallbackAuthor) : fallbackAuthor,
      avatarUrl: primary?.avatarUrl ?? null,
      level: getDisplayLevel(primary?.level ?? 10),
      time: t("webboardTimeNow"),
      title: t("webboardThreadLineupTitle"),
      body: t("webboardThreadLineupBody"),
      tags: [t("webboardTagStrategy"), t("webboardTagMatchday")],
      replies: [
        {
          id: "lineup-reply",
          author: secondary
            ? getMemberDisplayName(secondary, fallbackAuthor)
            : fallbackAuthor,
          avatarUrl: secondary?.avatarUrl ?? null,
          level: getDisplayLevel(secondary?.level ?? 6),
          body: t("webboardThreadPredictionBody"),
          time: t("webboardTimeRecent"),
        },
      ],
      replyCount: 1,
      reactions: { fire: 18, target: 16, smile: 8 },
      reacted: null,
      views: 128,
    },
    {
      id: "prediction",
      source: "fallback",
      channel: "predictions",
      author: secondary ? getMemberDisplayName(secondary, fallbackAuthor) : fallbackAuthor,
      avatarUrl: secondary?.avatarUrl ?? null,
      level: getDisplayLevel(secondary?.level ?? 6),
      time: t("webboardTimeRecent"),
      title: t("webboardThreadPredictionTitle"),
      body: t("webboardThreadPredictionBody"),
      tags: [t("webboardTagPrediction"), t("webboardTagStats")],
      replies: [],
      replyCount: 0,
      reactions: { fire: 10, target: 13, smile: 4 },
      reacted: null,
      views: 96,
    },
  ];
}

function LeagueLogo({
  name,
  logoUrl,
  cacheKey,
}: {
  name: string;
  logoUrl: string | null;
  cacheKey?: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (logoUrl) {
    return (
      <div className="relative grid h-32 w-32 shrink-0 place-items-center sm:h-36 sm:w-36 lg:h-40 lg:w-40">
        <div className="absolute inset-0 rounded-[2rem] border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_48px_rgba(34,211,238,0.16)]" />
        <div className="absolute inset-2 rounded-[1.65rem] border border-white/10 bg-black/30" />
        <div className="absolute -inset-1 rounded-[2.25rem] bg-[radial-gradient(circle_at_35%_20%,rgba(34,211,238,0.22),transparent_54%),radial-gradient(circle_at_80%_75%,rgba(168,85,247,0.18),transparent_50%)] blur-sm" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withCacheKey(logoUrl, cacheKey)}
          alt=""
          className="relative h-[7rem] w-[7rem] rounded-[1.45rem] border border-cyan-300/25 bg-[#070a10] object-cover p-1.5 shadow-[0_18px_52px_rgba(0,0,0,0.38)] sm:h-[7.75rem] sm:w-[7.75rem] lg:h-[8.75rem] lg:w-[8.75rem]"
        />
      </div>
    );
  }

  return (
    <div className="relative grid h-32 w-32 shrink-0 place-items-center sm:h-36 sm:w-36 lg:h-40 lg:w-40">
      <div className="absolute inset-0 rounded-[2rem] border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_48px_rgba(34,211,238,0.16)]" />
      <div className="absolute inset-2 rounded-[1.65rem] border border-white/10 bg-black/30" />
      <div className="relative grid h-[7rem] w-[7rem] place-items-center rounded-[1.45rem] border border-cyan-300/25 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(168,85,247,0.12)),#070a10] shadow-[0_18px_52px_rgba(0,0,0,0.38)] sm:h-[7.75rem] sm:w-[7.75rem] lg:h-[8.75rem] lg:w-[8.75rem]">
        <span className="font-mono text-4xl font-black tracking-wider text-cyan-100 lg:text-5xl">
          {initials || "L"}
        </span>
      </div>
    </div>
  );
}

function withCacheKey(url: string, cacheKey?: number) {
  if (!cacheKey || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${cacheKey}`;
}

function formatRequestDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatJoinedDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(date);
}

function formatPercentValue(value: number) {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function getMemberDisplayName(standing: LeagueStanding, fallback: string) {
  return standing.displayName || standing.username || fallback;
}

function getMemberInitials(standing: LeagueStanding) {
  const name = standing.displayName || standing.username;
  if (!name) return "";

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function buildDisplayStandings(
  league: LeagueDetail,
  currentUser: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    points: number;
    accuracy: number;
    predictionsCount: number;
    correctPredictions: number;
    level: number;
  }
) {
  if (league.standings.length > 0) {
    return league.standings.map((standing) =>
      isCurrentUserStanding(standing, currentUser)
        ? {
            ...standing,
            avatarUrl: standing.avatarUrl ?? currentUser.avatarUrl ?? null,
            points: standing.points,
            accuracy:
              standing.accuracy > 0 ? standing.accuracy : currentUser.accuracy,
            predictionsCount:
              standing.predictionsCount ?? currentUser.predictionsCount,
            correctPredictions:
              standing.correctPredictions ?? currentUser.correctPredictions,
            wins: standing.wins ?? currentUser.correctPredictions,
            level: standing.level ?? currentUser.level,
          }
        : standing
    );
  }
  if (!currentUser.userId && !currentUser.username && !currentUser.displayName) {
    return [];
  }

  return [
    {
      rank: league.myRank ?? 1,
      userId: currentUser.userId || league.owner.id || "current-user",
      username: currentUser.username || null,
      displayName: currentUser.displayName || currentUser.username || null,
      avatarUrl: currentUser.avatarUrl || null,
      points: currentUser.points,
      accuracy: currentUser.accuracy,
      predictionsCount: currentUser.predictionsCount,
      correctPredictions: currentUser.correctPredictions,
      wins: currentUser.correctPredictions,
      level: currentUser.level,
      joinedAt: null,
    } satisfies LeagueStanding,
  ];
}

function isCurrentUserStanding(
  standing: LeagueStanding,
  currentUser: {
    userId: string;
    username: string;
    displayName: string;
  }
) {
  if (currentUser.userId && standing.userId === currentUser.userId) return true;

  const standingNames = [standing.username, standing.displayName]
    .map(normalizeIdentity)
    .filter(Boolean);
  const currentNames = [currentUser.username, currentUser.displayName]
    .map(normalizeIdentity)
    .filter(Boolean);

  return standingNames.some((name) => currentNames.includes(name));
}

function sortLeagueStandingsForDisplay(
  standings: LeagueStanding[],
  league: LeagueDetail,
  currentUser: {
    canManageLeague: boolean;
    userId: string;
    username: string;
    displayName: string;
  }
) {
  return standings
    .map((standing, index) => ({ standing, index }))
    .sort((left, right) => {
      const leftIsOwner = isOwnerStanding(left.standing, league, currentUser);
      const rightIsOwner = isOwnerStanding(right.standing, league, currentUser);
      if (leftIsOwner !== rightIsOwner) return leftIsOwner ? -1 : 1;

      const leftJoinedAt = readTimestamp(left.standing.joinedAt);
      const rightJoinedAt = readTimestamp(right.standing.joinedAt);
      if (leftJoinedAt !== rightJoinedAt) return leftJoinedAt - rightJoinedAt;

      return left.index - right.index;
    })
    .map(({ standing }, index) => ({
      ...standing,
      rank: index + 1,
    }));
}

function isOwnerStanding(
  standing: LeagueStanding,
  league: LeagueDetail,
  currentUser: {
    canManageLeague: boolean;
    userId: string;
    username: string;
    displayName: string;
  }
) {
  if (league.owner.id && standing.userId === league.owner.id) return true;
  if (
    (league.isOwner || currentUser.canManageLeague) &&
    currentUser.userId !== "" &&
    standing.userId === currentUser.userId
  ) {
    return true;
  }

  if (!currentUser.canManageLeague) return false;

  const standingNames = [standing.username, standing.displayName]
    .map(normalizeIdentity)
    .filter(Boolean);
  const currentNames = [currentUser.username, currentUser.displayName]
    .map(normalizeIdentity)
    .filter(Boolean);

  return standingNames.some((name) => currentNames.includes(name));
}

function readTimestamp(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function getJoinRequestDisplayName(request: LeagueJoinRequest) {
  if (request.displayName && request.displayName !== "Member") {
    return request.displayName;
  }

  return request.username || `User ${shortUserId(request.userId)}`;
}

function getJoinRequestInitials(request: LeagueJoinRequest) {
  const name = getJoinRequestDisplayName(request);
  if (!name || name === "Member") return "";

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function canManageLeagueDetail(
  league: LeagueDetail,
  currentUser: {
    userId: string;
    username: string;
    displayName: string;
  }
) {
  if (league.isOwner) return true;
  if (currentUser.userId && currentUser.userId === league.owner.id) return true;

  const ownerStanding = league.standings.find(
    (standing) => standing.userId === league.owner.id
  );
  if (!ownerStanding) return false;

  const currentNames = [currentUser.username, currentUser.displayName]
    .map(normalizeIdentity)
    .filter(Boolean);
  const ownerNames = [ownerStanding.username, ownerStanding.displayName]
    .map(normalizeIdentity)
    .filter(Boolean);

  return currentNames.some((name) => ownerNames.includes(name));
}

function isSelfJoinRequest(
  request: LeagueJoinRequest,
  league: LeagueDetail | null,
  currentUser: {
    userId: string;
    username: string;
    displayName: string;
  }
) {
  if (currentUser.userId && request.userId === currentUser.userId) return true;
  if (league?.owner.id && request.userId === league.owner.id) return true;

  const requestNames = [request.username, request.displayName]
    .map(normalizeIdentity)
    .filter(Boolean);
  const currentNames = [currentUser.username, currentUser.displayName]
    .map(normalizeIdentity)
    .filter(Boolean);

  return requestNames.some((name) => currentNames.includes(name));
}

function normalizeIdentity(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function shortUserId(userId: string) {
  return userId.length > 8 ? userId.slice(0, 8) : userId;
}

function readStoredLeagueLogoOverride(leagueId: string) {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(`${LEAGUE_LOGO_OVERRIDE_KEY}${leagueId}`);
  } catch {
    return null;
  }
}

function readCachedLeagueDetail(leagueId: string) {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(
      `${LEAGUE_DETAIL_CACHE_KEY}${leagueId}`
    );
    if (!rawValue) return null;
    const value = JSON.parse(rawValue) as LeagueDetail;
    return value?.id === leagueId ? value : null;
  } catch {
    return null;
  }
}

function storeCachedLeagueDetail(league: LeagueDetail) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      `${LEAGUE_DETAIL_CACHE_KEY}${league.id}`,
      JSON.stringify(league)
    );
  } catch {
    // Detail cache is best-effort; the live backend response remains the source of truth.
  }
}

async function loadLeagueDetailFallback(
  leagueId: string,
  locale: string,
  currentUserId: string
) {
  try {
    const response = await getLeagues({ locale, page: 1, limit: 100 });
    const joinedLeague = response.joined.find((league) => league.id === leagueId);
    if (joinedLeague) return joinedLeagueToDetail(joinedLeague, currentUserId);

    const availableLeague = response.available.find(
      (league) => league.id === leagueId
    );
    if (availableLeague) return availableLeagueToDetail(availableLeague);
  } catch {
    return null;
  }

  return null;
}

function joinedLeagueToDetail(
  league: JoinedLeague,
  currentUserId: string
): LeagueDetail {
  return {
    id: league.id,
    name: league.name,
    description: league.description,
    memberCount: league.memberCount,
    maxMembers: league.maxMembers,
    entryFeeCredits: league.entryFeeCredits ?? 0,
    logoUrl: league.logoUrl,
    isPrivate: league.isPrivate,
    isOwner: league.isOwner,
    inviteCode: league.inviteCode,
    createdAt: new Date().toISOString(),
    owner: {
      id: league.isOwner ? currentUserId : "",
    },
    standings: [],
    history: [],
    myRank: league.myRank || null,
    myPoints: league.myPoints,
    totalFeesReceived: 0,
  };
}

function availableLeagueToDetail(league: AvailableLeague): LeagueDetail {
  return {
    id: league.id,
    name: league.name,
    description: league.description,
    memberCount: league.memberCount,
    maxMembers: league.maxMembers,
    entryFeeCredits: league.entryFeeCredits,
    logoUrl: league.logoUrl,
    isPrivate: league.isLocked,
    isOwner: false,
    inviteCode: null,
    createdAt: new Date().toISOString(),
    owner: {
      id: "",
    },
    standings: [],
    history: [],
    myRank: null,
    myPoints: null,
    totalFeesReceived: 0,
  };
}

function BackLink({ locale, label }: { locale: string; label: string }) {
  return (
    <Link
      href={`/${locale}/leagues`}
      className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-cyan-300"
    >
      <ArrowLeft size={15} />
      {label}
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f]/80 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Icon size={14} className={tone} />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Rank({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
      : rank === 2
        ? "border-gray-400/30 bg-gray-400/10 text-gray-300"
        : rank === 3
          ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
          : "border-gray-800 bg-gray-900 text-gray-500";

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${tone}`}>
      #{rank}
    </div>
  );
}

function getDisplayLevel(level: number | null | undefined) {
  if (level === undefined || level === null || !Number.isFinite(level)) return 1;
  return Math.min(Math.max(Math.round(level), 1), 10);
}

function filterLeagueHistory(
  history: LeagueDetail["history"],
  query: string
) {
  const search = query.trim().toLowerCase();
  if (!search) return history;

  return history.filter((entry) =>
    [
      entry.id,
      entry.userId,
      entry.username,
      entry.type,
      entry.referenceType,
      entry.createdAt,
      stringValue(entry.metadata.league_name),
      stringValue(entry.metadata.description),
      stringValue(entry.metadata.currency),
      numberValue(entry.metadata.entry_fee)?.toString() ?? null,
      entry.pointsChange.toString(),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search))
  );
}

function formatHistoryTitle(
  entry: LeagueDetail["history"][number],
  t: ReturnType<typeof useTranslations<"leagues">>
) {
  const username = entry.username || entry.userId || "Member";
  if (entry.type === "league_joined") return t("historyLeagueJoined", { username });
  if (entry.type === "points_earned") return t("historyPointsEarned", { username });
  return t("historyActivity", { username });
}

function formatHistoryMeta(entry: LeagueDetail["history"][number]) {
  const leagueName = stringValue(entry.metadata.league_name);
  const entryFee = numberValue(entry.metadata.entry_fee);
  const currency = stringValue(entry.metadata.currency);
  const parts = [
    leagueName,
    entryFee !== null ? `${entryFee.toLocaleString()} Premium Credits` : null,
    currency,
    entry.referenceType,
  ].filter(Boolean);

  return parts.join(" · ");
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
