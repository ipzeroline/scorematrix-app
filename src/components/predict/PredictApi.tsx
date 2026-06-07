"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import type { ApiFootballFixture } from "@/lib/api-football";
import { buildFootballStatusLabels, getFixtureStatusLabel } from "@/lib/football-status";
import { buildFixtureSeoSlug } from "@/lib/football-slugs";
import { buildPredictMatchHref } from "@/lib/predict-route";
import { formatDate, formatMatchTimeWithZone } from "@/lib/utils";
import { apiGetRaw, isAuthSessionExpiredError } from "@/lib/api-client";
import { useUserStore } from "@/stores/user-store";
import { Brain, ShieldCheck, Trophy, Users, Zap, Award, Sparkles, X } from "lucide-react";

interface PredictApiProps {
  fixtures: ApiFootballFixture[];
  currentTime: number;
}

type PlayerProfileResponse = {
  data?: {
    name?: unknown;
    player?: {
      name?: unknown;
    };
  };
  player?: {
    name?: unknown;
  };
  profile?: unknown;
  result?: unknown;
  name?: unknown;
};

export function PredictApi({ fixtures, currentTime }: PredictApiProps) {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [tab, setTab] = useState("upcoming");
  const matches = useMemo(
    () => fixtures.filter((match) => isPredictableFixture(match, currentTime)),
    [fixtures, currentTime]
  );
  const leagueGroups = useMemo(() => groupPredictFixturesByLeague(matches), [matches]);
  const statusLabels = useMemo(() => buildFootballStatusLabels(t), [t]);

  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setHistory([]);
      return;
    }

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const response = await apiGetRaw<{ data: any[] }>("/predictions");
        if (response && Array.isArray(response.data)) {
          const mapped = response.data.map((item) => {
            const fixture = fixtures.find((f) => String(f.id ?? f.apiFixtureId) === String(item.matchId));
            
            const homeName = fixture?.home.name ?? (item.match?.homeTeam?.name ?? (item.match?.home?.name ?? "Home Team"));
            const awayName = fixture?.away.name ?? (item.match?.awayTeam?.name ?? (item.match?.away?.name ?? "Away Team"));

            const predictedScore = `${item.predictedHomeScore ?? 0}-${item.predictedAwayScore ?? 0}`;
            const actualScore = item.actualHomeScore !== null && item.actualAwayScore !== null
              ? `${item.actualHomeScore}-${item.actualAwayScore}`
              : "-";

            const statusLower = String(item.status ?? "").toLowerCase();
            let resultType: "correct" | "incorrect" | "pending" | "partial" = "incorrect";
            if (statusLower === "pending") {
              resultType = "pending";
            } else if (statusLower === "correct" || statusLower === "winner") {
              resultType = "correct";
            } else if (statusLower === "partial") {
              resultType = "partial";
            }

            return {
              id: item.id,
              home: homeName,
              away: awayName,
              predicted: predictedScore,
              actual: actualScore,
              points: item.pointsEarned ?? 0,
              result: resultType,
              matchId: item.matchId,
              confidenceLevel: item.confidenceLevel,
              boostUsed: item.boostUsed,
              firstScorerPlayerId:
                item.firstScorerPlayerId ?? item.first_scorer_player_id,
              firstScorerPlayerName:
                item.firstScorerPlayerName ??
                item.first_scorer_player_name ??
                item.firstScorer?.name ??
                item.first_scorer?.name,
              createdAt: item.createdAt,
              homeLogo: fixture?.home.logo ?? item.match?.homeTeam?.logo,
              awayLogo: fixture?.away.logo ?? item.match?.awayTeam?.logo,
              halfTimeHome: item.halfTimeHome,
              halfTimeAway: item.halfTimeAway,
              totalGoals: item.totalGoals,
              comboMultiplier: item.comboMultiplier,
              streakNumber: item.streakNumber,
              pointsWagered: item.pointsWagered ?? item.points_wagered ?? 0,
              lockedAt: item.lockedAt,
            };
          });

          setHistory(mapped);
        }
      } catch (error) {
        if (isAuthSessionExpiredError(error)) return;
        console.error("Error loading predictions history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [isLoggedIn, fixtures]);

  useEffect(() => {
    if (!selectedPrediction || !selectedPrediction.firstScorerPlayerId) {
      setPlayerName(null);
      setLoadingPlayer(false);
      return;
    }

    if (selectedPrediction.firstScorerPlayerName) {
      setPlayerName(String(selectedPrediction.firstScorerPlayerName));
      setLoadingPlayer(false);
      return;
    }

    const controller = new AbortController();

    const loadPlayerName = async () => {
      setLoadingPlayer(true);
      setPlayerName(null);

      try {
        const response = await fetch(
          `/api/football/players/${encodeURIComponent(String(selectedPrediction.firstScorerPlayerId))}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setPlayerName(null);
          return;
        }

        const payload = (await response.json()) as PlayerProfileResponse;
        const name = getPlayerNameFromProfilePayload(payload);
        if (name) {
          setPlayerName(name);
        } else {
          setPlayerName(null);
        }
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setPlayerName(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingPlayer(false);
        }
      }
    };

    loadPlayerName();

    return () => {
      controller.abort();
    };
  }, [selectedPrediction]);

  useEffect(() => {
    if (selectedPrediction) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPrediction]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-white">
          {t("prediction.title")}
        </h1>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          <span className="text-sm text-amber-400 font-mono">
            {t("prediction.streakCount", { count: 3 })}
          </span>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "upcoming", label: t("livescore.upcoming"), count: matches.length },
          { key: "history", label: t("prediction.predictionHistory"), count: history.length },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      {tab === "upcoming" && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <EmptyState
              title={t("prediction.noUpcomingMatches")}
              description={t("prediction.checkBackLater")}
            />
          ) : (
            leagueGroups.map((group) => (
              <section
                key={group.key}
                className="overflow-hidden rounded-lg border border-gray-800 bg-[#101018]"
              >
                <div className="border-b border-gray-800 bg-[#141421] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <ApiLeagueLogo
                        name={group.league.name}
                        logo={group.league.logo}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-white">
                          {group.league.name}
                        </h2>
                        <p className="truncate text-[11px] text-gray-500">
                          {[group.league.country, group.league.round]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="cyan" className="shrink-0">
                      {group.matches.length} {t("matches.metricMatches")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  {group.matches.map((match) => (
                    <Card key={match.id} neon="cyan" hover>
                      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                        <div className="flex-1 min-w-0">
                          <div className="mb-2 flex items-center justify-end">
                            <StatusBadge
                              status={match.status}
                              label={getFixtureStatusLabel(match, statusLabels)}
                              className="px-2 py-0.5 text-[10px]"
                            />
                          </div>
                          <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-3">
                            <TeamPick
                              name={match.home.name}
                              logo={match.home.logo}
                              accent="cyan"
                            />
                            <div className="min-w-[76px] shrink-0 text-center">
                              <p className="text-lg font-bold font-mono text-white">
                                {t("common.vs")}
                              </p>
                              <p className="mt-0.5 whitespace-nowrap text-[9px] text-gray-500">
                                {formatDate(match.kickoffTime, locale)}
                              </p>
                              <p className="whitespace-nowrap text-[9px] text-gray-500">
                                {formatMatchTimeWithZone(match.kickoffTime, locale)}
                              </p>
                            </div>
                            <TeamPick
                              name={match.away.name}
                              logo={match.away.logo}
                              accent="magenta"
                            />
                          </div>
                        </div>
                        <Link
                          className="self-center sm:self-auto sm:shrink-0"
                          href={buildPredictMatchHref(
                            locale,
                            buildFixtureSeoSlug(match),
                            match.home.apiTeamId ?? match.home.id,
                            match.away.apiTeamId ?? match.away.id
                          )}
                        >
                          <Button size="sm" neon className="min-w-32">
                            {t("prediction.predictScore")}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-2">
          {loadingHistory ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={`history-skeleton-${i}`} className="p-3 relative overflow-hidden bg-black/45 border-gray-900">
                <div className="absolute inset-0 animate-shimmer opacity-60" />
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-3.5 w-12 rounded" />
                  </div>
                </div>
              </Card>
            ))
          ) : history.length === 0 ? (
            <EmptyState
              title={t("prediction.noPredictions")}
              description={t("prediction.startPredictingHistory")}
            />
          ) : (
            history.map((h) => (
              <Card
                key={h.id}
                className="p-3 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] bg-black/35"
                onClick={() => setSelectedPrediction(h)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">
                      {h.home} {t("common.vs")} {h.away}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {t("prediction.predicted")}: {h.predicted} {"->"}{" "}
                      {t("prediction.actualResult")}: {h.actual}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge variant={
                      h.result === "correct"
                        ? "green"
                        : h.result === "pending"
                        ? "cyan"
                        : h.result === "partial"
                        ? "gold"
                        : "red"
                    }>
                      {h.result.toUpperCase()}
                    </Badge>
                    <p className="text-xs font-mono text-green-400 mt-1">
                      +{h.points} {t("common.points")}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <InfoPanel
          icon={Trophy}
          title="การทายระยะยาว"
          items={[
            "แชมป์ลีก/ทัวร์นาเมนต์",
            "ทีมตกชั้น",
            "ดาวซัลโวสูงสุด",
            "ผู้เล่นยอดเยี่ยม",
            "4 ทีมสุดท้าย / รอบรองชนะเลิศ",
          ]}
        />
        <InfoPanel
          icon={Users}
          title="รูปแบบการแข่งขันในเว็บ"
          items={[
            "ลีกส่วนตัวกับเพื่อน",
            "ระบบคะแนนสะสม",
            "โบนัสสกอร์ตรง",
            "Streak Bonus",
            "Leaderboard รายสัปดาห์/รายเดือน/ตลอดกาล",
          ]}
        />
        <InfoPanel
          icon={Brain}
          title="ฟีเจอร์เสริม"
          items={[
            "Confidence Level",
            "ทายด้วย AI",
            "ประวัติการทายย้อนหลัง",
            "Badge / Achievement",
            "วิเคราะห์ความแม่นของตัวเอง",
          ]}
        />
      </section>
      {/* Premium Cyberpunk Prediction Slip Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slip-pulse {
              0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(217, 70, 239, 0.1); }
              50% { box-shadow: 0 0 35px rgba(6, 182, 212, 0.5), 0 0 60px rgba(217, 70, 239, 0.3); }
            }
            .cyber-slip-modal {
              animation: slip-pulse 3s infinite alternate;
            }
          `}} />
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSelectedPrediction(null)}
          />

          {/* Modal Container */}
          <div className="cyber-slip-modal relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-cyan-500/50 bg-[#060913] text-center shadow-2xl transition-all duration-300 flex flex-col max-h-[90vh]">
            {/* Corner Decos */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-magenta" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-magenta" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

            {/* Close Button at top-right */}
            <button
              onClick={() => setSelectedPrediction(null)}
              className="absolute top-3 right-3 z-30 p-1.5 rounded-full border border-gray-800 bg-black/40 text-gray-500 hover:text-magenta hover:border-magenta/50 hover:bg-magenta/10 hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer"
              aria-label="Close modal"
            >
              <X size={14} />
            </button>

            {/* Holographic grid and scanning line */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-25" />
            <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 animate-scanline" />

            <div className="relative z-10 space-y-5 overflow-y-auto p-6 scrollbar-thin flex-1">
              <div className="flex justify-between items-center border-b border-gray-800/80 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono">
                  PREDICTION RECEIPT // TICKET #{selectedPrediction.id}
                </span>
                <Badge variant={
                  selectedPrediction.result === "correct"
                    ? "green"
                    : selectedPrediction.result === "pending"
                    ? "cyan"
                    : selectedPrediction.result === "partial"
                    ? "gold"
                    : "red"
                }>
                  {selectedPrediction.result.toUpperCase()}
                </Badge>
              </div>

              {/* Match Details */}
              <div className="bg-black/40 border border-gray-800/80 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-3 items-center gap-2">
                  <div className="text-center min-w-0">
                    {selectedPrediction.homeLogo ? (
                      <img src={selectedPrediction.homeLogo} alt={selectedPrediction.home} className="mx-auto h-12 w-12 object-contain" />
                    ) : (
                      <div className="mx-auto h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400 text-xs">HOME</div>
                    )}
                    <div className="mt-2 text-xs font-bold text-white truncate">{selectedPrediction.home}</div>
                  </div>

                  <div className="text-center font-mono shrink-0">
                    <div className="text-2xl font-black text-cyan-300">
                      {selectedPrediction.predicted}
                    </div>
                    <div className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">
                      PREDICTED SCORE
                    </div>
                  </div>

                  <div className="text-center min-w-0">
                    {selectedPrediction.awayLogo ? (
                      <img src={selectedPrediction.awayLogo} alt={selectedPrediction.away} className="mx-auto h-12 w-12 object-contain" />
                    ) : (
                      <div className="mx-auto h-12 w-12 rounded-full bg-magenta-500/10 flex items-center justify-center font-bold text-magenta-400 text-xs">AWAY</div>
                    )}
                    <div className="mt-2 text-xs font-bold text-white truncate">{selectedPrediction.away}</div>
                  </div>
                </div>

                <div className="border-t border-gray-900/60 pt-3 flex justify-between text-xs font-mono">
                  <span className="text-gray-500">ACTUAL RESULT:</span>
                  <span className="text-white font-bold">{selectedPrediction.actual}</span>
                </div>
              </div>

              {/* Deep Details HUD Grid */}
              <div className="space-y-4 text-left font-mono text-xs text-gray-400">
                {/* Section 1: Rewards & Multipliers */}
                <div className="bg-black/40 border border-cyan-500/10 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] text-cyan-400/80 font-black uppercase tracking-wider border-b border-gray-900/60 pb-1.5 mb-2">
                    {t("prediction.yourPrediction").toUpperCase()} // METRICS
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">{t("predictionForm.payload.confidenceLevel").toUpperCase()}</span>
                      <span className="text-white font-bold uppercase truncate">
                        {selectedPrediction.confidenceLevel
                          ? t(`predictionForm.confidence.${selectedPrediction.confidenceLevel}`)
                          : t("predictionForm.confidence.safe")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">{t("predictionForm.boost.label").toUpperCase()}</span>
                      <span className={`font-bold uppercase truncate ${selectedPrediction.boostUsed ? "text-magenta" : "text-gray-600"}`}>
                        {selectedPrediction.boostUsed ? "ACTIVE (x2)" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">{t("prediction.combo").toUpperCase()}</span>
                      <span className={`font-bold ${selectedPrediction.comboMultiplier > 1 ? "text-amber-400" : "text-white"}`}>
                        x{selectedPrediction.comboMultiplier ?? 1}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">{t("prediction.streak").toUpperCase()}</span>
                      <span className={`font-bold ${selectedPrediction.streakNumber > 0 ? "text-green-400" : "text-white"}`}>
                        {selectedPrediction.streakNumber ?? 0}
                      </span>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <span className="text-[10px] text-gray-500">{t("predictionForm.payload.pointsWagered").toUpperCase()}</span>
                      <span className="text-amber-300 font-bold">
                        {Number(selectedPrediction.pointsWagered ?? 0).toLocaleString()} PTS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Props Details */}
                <div className="bg-black/40 border border-magenta/10 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] text-magenta/80 font-black uppercase tracking-wider border-b border-gray-900/60 pb-1.5 mb-2">
                    {t("predictionForm.deep.title").toUpperCase()} // DETAILS
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">{t("predictionForm.summary.halfTime").toUpperCase()}</span>
                      <span className="text-white font-bold">
                        {selectedPrediction.halfTimeHome !== null && selectedPrediction.halfTimeAway !== null
                          ? `${selectedPrediction.halfTimeHome} - ${selectedPrediction.halfTimeAway}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">{t("predictionForm.deep.totalGoals").toUpperCase()}</span>
                      <span className="text-white font-bold">
                        {selectedPrediction.totalGoals !== null && selectedPrediction.totalGoals !== undefined
                          ? selectedPrediction.totalGoals
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <span className="text-[10px] text-gray-500">{t("predictionForm.deep.firstScorer").toUpperCase()}</span>
                      <span className="text-cyan-300 font-bold truncate">
                        {selectedPrediction.firstScorerPlayerId ? (
                          loadingPlayer ? (
                            <span className="animate-pulse text-gray-500">Loading...</span>
                          ) : playerName ? (
                            playerName
                          ) : (
                            "-"
                          )
                        ) : (
                          t("predictionForm.deep.noGoal")
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Time & Auditing */}
                <div className="bg-black/20 border border-gray-900/80 rounded-xl p-3 space-y-2 text-[10px] text-gray-500">
                  <div className="flex justify-between items-center">
                    <span>{t("prediction.pointsEarned").toUpperCase()}:</span>
                    <span className="text-green-400 font-bold text-xs">+{selectedPrediction.points} PTS</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-900/40 pt-1.5">
                    <span>{t("prediction.lockedAt").toUpperCase()}:</span>
                    <span className="text-gray-400 font-medium">
                      {selectedPrediction.lockedAt
                        ? new Date(selectedPrediction.lockedAt.replace(" ", "T")).toLocaleString(locale)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t("prediction.submittedAt").toUpperCase()}:</span>
                    <span className="text-gray-400 font-medium">
                      {selectedPrediction.createdAt
                        ? new Date(selectedPrediction.createdAt).toLocaleString(locale)
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="gold"
                className="w-full text-xs font-black tracking-widest py-2.5 uppercase border border-yellow-400/40"
                onClick={() => setSelectedPrediction(null)}
              >
                CLOSE TICKET
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPlayerNameFromProfilePayload(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  const directName = toNonEmptyString(payload.name);
  if (directName) return directName;

  const playerName = isRecord(payload.player)
    ? toNonEmptyString(payload.player.name)
    : null;
  if (playerName) return playerName;

  return (
    getPlayerNameFromProfilePayload(payload.data) ??
    getPlayerNameFromProfilePayload(payload.profile) ??
    getPlayerNameFromProfilePayload(payload.result)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

type PredictLeagueGroup = {
  key: string;
  league: ApiFootballFixture["league"];
  matches: ApiFootballFixture[];
};

function isPredictableFixture(fixture: ApiFootballFixture, currentTime: number) {
  const kickoffTime = new Date(fixture.kickoffTime).getTime();

  return (
    fixture.status === MatchStatus.UPCOMING &&
    Number.isFinite(kickoffTime) &&
    kickoffTime > currentTime
  );
}

function groupPredictFixturesByLeague(fixtures: ApiFootballFixture[]) {
  const groups = new Map<string, PredictLeagueGroup>();

  for (const fixture of fixtures) {
    const key = `${fixture.league.apiLeagueId ?? fixture.league.id}-${fixture.league.season ?? "season"}`;
    const existing = groups.get(key);

    if (existing) {
      existing.matches.push(fixture);
    } else {
      groups.set(key, {
        key,
        league: fixture.league,
        matches: [fixture],
      });
    }
  }

  return Array.from(groups.values());
}

function InfoPanel({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={17} className="text-cyan-400" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-gray-400">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-green-400" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TeamPick({
  name,
  logo,
  accent,
}: {
  name: string;
  logo: string | null;
  accent: "cyan" | "magenta";
}) {
  return (
    <div className="text-center min-w-0">
      <div className="mb-1 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} accent={accent} />
      </div>
      <p className="text-xs text-white truncate">{name}</p>
    </div>
  );
}
