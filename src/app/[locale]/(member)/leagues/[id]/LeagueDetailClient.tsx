"use client";

import { useEffect, useState } from "react";
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
  LockKeyhole,
  Search,
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
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

const LEAGUE_LOGO_OVERRIDE_KEY = "scorematrix:league-logo:";
const LEAGUE_DETAIL_CACHE_KEY = "scorematrix:league-detail:";

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
