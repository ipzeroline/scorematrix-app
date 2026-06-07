"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Brain,
  CalendarClock,
  CheckCircle2,
  History,
  Medal,
  Sparkles,
  Timer,
  Zap,
  Minus,
  Plus,
  Search,
  HelpCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { useNotificationStore } from "@/stores/notification-store";
import { cn, formatDate, formatDateTime, formatMatchTimeWithZone } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { apiPostRaw, isAuthSessionExpiredError } from "@/lib/api-client";
import { dispatchMemberWalletRefresh } from "@/lib/member-refresh-event";
import { useUserStore } from "@/stores/user-store";

type ConfidenceLevel = "safe" | "confident" | "bold";

export interface PredictPlayer {
  id: number | null;
  name: string;
  number: number | null;
}

export interface PredictH2HFixture {
  id: string;
  kickoffTime: string;
  league: {
    name: string;
  };
  home: {
    name: string;
    logo: string | null;
  };
  away: {
    name: string;
    logo: string | null;
  };
  score: {
    home: number | null;
    away: number | null;
  };
}

export interface PredictMatch {
  matchId: string;
  home: {
    id: number | string | null;
    name: string;
    logo: string | null;
    players: PredictPlayer[];
    colors?: {
      primary: string | null;
      number: string | null;
      border: string | null;
    } | null;
  };
  away: {
    id: number | string | null;
    name: string;
    logo: string | null;
    players: PredictPlayer[];
    colors?: {
      primary: string | null;
      number: string | null;
      border: string | null;
    } | null;
  };
  league: string;
  leagueLogo: string | null;
  round: string;
  time: string;
  kickoffTime: string;
  venue: string;
  h2h?: PredictH2HFixture[];
}

export function PredictMatchForm({
  locale,
  match,
}: {
  locale: string;
  match: PredictMatch;
}) {
  const t = useTranslations("predictionForm");
  const router = useRouter();
  const addToast = useNotificationStore((s) => s.addToast);
  const freePoints = useUserStore((s) => s.freePoints);

  // Core prediction states
  const [homeScore, setHomeScore] = useState<number | null>(0);
  const [awayScore, setAwayScore] = useState<number | null>(0);
  const [firstScorerPlayerId, setFirstScorerPlayerId] = useState<string | null>(null);
  const [totalGoals, setTotalGoals] = useState<number | null>(null);
  const [halfHomeScore, setHalfHomeScore] = useState<number | null>(null);
  const [halfAwayScore, setHalfAwayScore] = useState<number | null>(null);
  const [pointsWagered, setPointsWagered] = useState(10);
  const [confidence, setConfidence] = useState<ConfidenceLevel>("safe");
  const [useBoost, setUseBoost] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dynamic squad player states
  const [homePlayers, setHomePlayers] = useState<PredictPlayer[]>(match.home.players);
  const [awayPlayers, setAwayPlayers] = useState<PredictPlayer[]>(match.away.players);
  const [loadingHome, setLoadingHome] = useState(false);
  const [loadingAway, setLoadingAway] = useState(false);
  const [hasLoadedAway, setHasLoadedAway] = useState(false);

  const fetchSquadPlayers = async (teamId: string | number) => {
    try {
      const numericId = typeof teamId === "string" ? parseInt(teamId.replace(/\D/g, ""), 10) : teamId;
      if (!numericId || isNaN(numericId)) return null;

      const res = await fetch(`/api/football/teams/${numericId}/squad`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch squad");
      const json = await res.json();
      
      let playersFlat: any[] = [];
      if (json && Array.isArray(json)) {
        playersFlat = json;
      } else if (json && Array.isArray(json.players)) {
        playersFlat = json.players;
      } else if (json && json.data && Array.isArray(json.data.players)) {
        playersFlat = json.data.players;
      } else if (json && json.data && Array.isArray(json.data)) {
        playersFlat = json.data;
      }

      if (playersFlat.length > 0) {
        return playersFlat.map((p: any) => {
          const item = p.player ?? p;
          return {
            id: item.id ?? item.apiPlayerId,
            name: item.name,
            number: item.number ?? (p.number ?? null),
          };
        });
      }
      return null;
    } catch (error) {
      console.error("Error loading squad players:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadSquads = async () => {
      const homeId = match.home.id;
      const awayId = match.away.id;

      if (homeId) {
        setLoadingHome(true);
        fetchSquadPlayers(homeId).then((playersList) => {
          if (playersList && playersList.length > 0) {
            setHomePlayers(playersList);
          }
          setLoadingHome(false);
        });
      }

      if (awayId) {
        setLoadingAway(true);
        fetchSquadPlayers(awayId).then((playersList) => {
          if (playersList && playersList.length > 0) {
            setAwayPlayers(playersList);
            setHasLoadedAway(true);
          }
          setLoadingAway(false);
        });
      }
    };

    loadSquads();
  }, [match.home.id, match.away.id]);

  const loadAwaySquad = async () => {
    const awayId = match.away.id;
    if (!awayId || hasLoadedAway || loadingAway) return;
    setLoadingAway(true);
    const playersList = await fetchSquadPlayers(awayId);
    if (playersList && playersList.length > 0) {
      setAwayPlayers(playersList);
      setHasLoadedAway(true);
    }
    setLoadingAway(false);
  };

  // UX display state: Summary Tab (Ticket vs JSON payload)


  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const kickoff = new Date(match.kickoffTime).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((kickoff - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [match.kickoffTime]);

  // Automatically calculate total goals when predicted scores change
  useEffect(() => {
    if (homeScore !== null && awayScore !== null) {
      setTotalGoals(homeScore + awayScore);
    } else if (homeScore !== null) {
      setTotalGoals(homeScore);
    } else if (awayScore !== null) {
      setTotalGoals(awayScore);
    } else {
      setTotalGoals(null);
    }
  }, [homeScore, awayScore]);

  const getCountdownInfo = () => {
    if (timeLeft === null) {
      return {
        compact: "--",
        isLocked: false,
        parts: [
          { label: "h", value: "--" },
          { label: "m", value: "--" },
          { label: "s", value: "--" },
        ],
      };
    }

    if (timeLeft <= 0) {
      return {
        compact: "LOCKED",
        isLocked: true,
        parts: [
          { label: "h", value: "00" },
          { label: "m", value: "00" },
          { label: "s", value: "00" },
        ],
      };
    }

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return {
      compact: `${hours}h ${minutes}m`,
      isLocked: false,
      parts: [
        { label: "h", value: String(hours).padStart(2, "0") },
        { label: "m", value: String(minutes).padStart(2, "0") },
        { label: "s", value: String(seconds).padStart(2, "0") },
      ],
    };
  };

  const countdownInfo = getCountdownInfo();
  const isLocked = countdownInfo.isLocked;

  const canSubmit =
    !isLocked && homeScore !== null && awayScore !== null && pointsWagered > 0;
  
  const confidenceOptions = [
    { value: "safe", label: t("confidence.safe") },
    { value: "confident", label: t("confidence.confident") },
    { value: "bold", label: t("confidence.bold") },
  ];
  const confidenceMultiplier = getConfidenceMultiplier(confidence);
  const effectivePointsWagered = Math.round(pointsWagered * confidenceMultiplier);
  const selectedFirstScorer = findPlayerById({ home: { players: homePlayers }, away: { players: awayPlayers } }, firstScorerPlayerId);
  
  const payload = {
    matchId: /^\d+$/.test(String(match.matchId)) ? Number(match.matchId) : match.matchId,
    predictedHomeScore: homeScore,
    predictedAwayScore: awayScore,
    firstScorerPlayerId: firstScorerPlayerId && /^\d+$/.test(String(firstScorerPlayerId)) ? Number(firstScorerPlayerId) : null,
    totalGoals,
    halfTimeHome: halfHomeScore,
    halfTimeAway: halfAwayScore,
    confidenceLevel: confidence,
    useBoost,
    pointsWagered: effectivePointsWagered,
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);

    try {
      await apiPostRaw("/predictions", payload);
      dispatchMemberWalletRefresh();

      addToast({
        type: "success",
        title: locale === "th" ? "ทายสำเร็จ" : "Prediction submitted",
        message:
          locale === "th"
            ? "คำทายของคุณได้รับการบันทึกเรียบร้อยแล้ว"
            : "Your prediction has been successfully recorded",
      });

      setSubmitted(true);
      setTimeout(() => router.push(`/${locale}/predict`), 1600);
    } catch (error) {
      if (isAuthSessionExpiredError(error)) return;
      const apiError = error as { status?: number; code?: string; message?: string };
      const status = apiError.status ?? 0;
      const code = apiError.code ?? "";

      let title: string;
      let message: string;

      if (status === 404 && code === "NOT_FOUND") {
        title = locale === "th" ? "ไม่พบแมตช์" : "Match not found";
        message = locale === "th"
          ? "ไม่พบข้อมูลการแข่งขันนี้ในระบบ"
          : "This match was not found in the system";
      } else if (status === 409 && code === "MATCH_LOCKED") {
        title = locale === "th" ? "เริ่มแข่งแล้ว" : "Match locked";
        message = locale === "th"
          ? "การแข่งขันเริ่มแล้ว ไม่สามารถส่งคำทายได้"
          : "The match has already started, predictions are locked";
      } else if (status === 409 && code === "DUPLICATE_PREDICTION") {
        title = locale === "th" ? "ทายซ้ำ" : "Duplicate prediction";
        message = locale === "th"
          ? "คุณได้ส่งคำทายสำหรับแมตช์นี้ไปแล้ว"
          : "You have already submitted a prediction for this match";
      } else {
        title = locale === "th" ? "ส่งคำทายไม่สำเร็จ" : "Prediction failed";
        message = apiError.message || (locale === "th"
          ? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
          : "An error occurred, please try again");
      }

      addToast({
        type: "error",
        title,
        message,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6 space-y-6 pb-8">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-800/40 pb-5">
        <div>
          <Badge variant="cyan" size="md">
            {t("badge")}
          </Badge>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">{t("title")}</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
        
        {/* Countdown capsule */}
        <div
          className={cn(
            "predict-lock-countdown group relative overflow-hidden rounded-2xl border px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-[0_0_35px_rgba(245,158,11,0.18)] transition-all shrink-0 w-full sm:w-auto",
            isLocked
              ? "border-red-500/40 bg-gradient-to-b from-[#1c0c0c] to-[#0f0505] shadow-[0_0_30px_rgba(239,68,68,0.2)] text-red-300"
              : "border-amber-500/40 bg-gradient-to-b from-[#1c130b] to-[#0e0a05] text-amber-200"
          )}
        >
          <div className="absolute inset-0 opacity-50 predict-countdown-scan" />
          <div className="relative flex items-center justify-between sm:justify-start gap-4">
            <span
              className={cn(
                "flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl border bg-black/60 shadow-[inset_0_0_12px_rgba(255,255,255,0.05)]",
                isLocked 
                  ? "border-red-500/35 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                  : "border-amber-500/35 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              )}
            >
              <Timer size={20} className={cn(!isLocked && "animate-pulse")} />
            </span>
            <div className="min-w-0 flex items-center justify-center">
              {isLocked ? (
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-400 px-3 py-2 bg-black/60 border border-red-500/30 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                  {t("locked")}
                </span>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 font-mono">
                  {countdownInfo.parts.map((part, index) => (
                    <div key={part.label} className="flex items-center gap-1 sm:gap-1.5">
                      {index > 0 && (
                        <span className="text-[14px] sm:text-lg font-black text-amber-400/90 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] animate-pulse">
                          :
                        </span>
                      )}
                      <span className="min-w-[34px] sm:min-w-[44px] h-9 sm:h-11 rounded-lg border border-amber-500/40 bg-black/75 text-center text-sm sm:text-base font-black text-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2),inset_0_0_8px_rgba(245,158,11,0.15)] tracking-tight">
                        {part.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unified Scoreboard Console Header */}
      <Card neon="cyan" className="relative overflow-hidden p-0 border border-gray-800 bg-[#101017] shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(217,70,239,0.1),transparent_30%)]" />
        
        <div className="relative p-5 sm:p-6 flex flex-col items-center">
          {/* League badge glass capsule */}
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 rounded-xl border border-cyan-500/20 bg-black/45 px-3.5 py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.08)] max-w-full">
            <ApiLeagueLogo name={match.league} logo={match.leagueLogo} size="md" />
            <div className="text-left min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-white truncate">{match.league}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
                {match.round} • {match.venue}
              </p>
            </div>
          </div>

          {/* Epic Unified Interactive Scoreboard Display Grid */}
          <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6 max-w-2xl mx-auto w-full select-none">
            {/* Home Team header Block */}
            <div className="min-w-0 flex flex-col items-center gap-1.5 sm:flex-row sm:justify-end sm:gap-3">
              <p className="text-xs sm:text-sm md:text-base font-black text-white text-center sm:text-right">
                {match.home.name}
              </p>
              <div className="predict-team-float shrink-0">
                <div className="hidden sm:block">
                  <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="lg" accent="cyan" />
                </div>
                <div className="block sm:hidden">
                  <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="md" accent="cyan" />
                </div>
              </div>
            </div>
            
            {/* Centered VS Block */}
            <div className="flex flex-col items-center justify-center bg-black/50 px-4 py-2.5 rounded-xl border border-gray-800/80 shadow-2xl shrink-0 min-w-[90px] sm:min-w-[110px]">
              <span className="font-mono text-base sm:text-lg font-black text-cyan-400 tracking-wider">VS</span>
              <span className="mt-1 whitespace-nowrap text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                {formatDate(match.kickoffTime, locale)}
              </span>
              <span className="whitespace-nowrap font-mono text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                {formatMatchTimeWithZone(match.kickoffTime, locale)}
              </span>
            </div>
            
            {/* Away Team Header Block */}
            <div className="min-w-0 flex flex-col items-center gap-1.5 sm:flex-row sm:justify-start sm:gap-3">
              <div className="predict-team-float shrink-0">
                <div className="hidden sm:block">
                  <ApiTeamLogo name={match.away.name} logo={match.away.logo} size="lg" accent="magenta" />
                </div>
                <div className="block sm:hidden">
                  <ApiTeamLogo name={match.away.name} logo={match.away.logo} size="md" accent="magenta" />
                </div>
              </div>
              <p className="text-xs sm:text-sm md:text-base font-black text-white text-center sm:text-left">
                {match.away.name}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* SCORE PREDICTOR CONSOLE */}
      <div className="space-y-6">
        <Card className="relative overflow-hidden p-5 border border-gray-800/80 bg-gradient-to-b from-[#0c0d12] to-[#06070a]">
          <ScorePredictorConsole
            homeTeamName={match.home.name}
            homeLogo={match.home.logo}
            awayTeamName={match.away.name}
            awayLogo={match.away.logo}
            homeScore={homeScore}
            awayScore={awayScore}
            setHomeScore={setHomeScore}
            setAwayScore={setAwayScore}
            isLocked={isLocked}
          />
        </Card>
      </div>
      {/* Main Grid: Form Inputs + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Column (Prediction inputs) */}
        <div className="space-y-6 min-w-0">
          
          {/* Section 1: Scorer & Stats HUD (Deep Prediction) */}
          <PredictionSection
            icon={Sparkles}
            title={t("deep.title")}
            subtitle={t("deep.subtitle")}
          >
            <div className="grid gap-5">
              {/* Tactical pitch player picker */}
              <PlayerPicker
                label={t("deep.firstScorer")}
                home={match.home}
                away={match.away}
                value={firstScorerPlayerId}
                onChange={setFirstScorerPlayerId}
                locale={locale}
                homePlayers={homePlayers}
                awayPlayers={awayPlayers}
                loadingHome={loadingHome}
                loadingAway={loadingAway}
                onLoadAwaySquad={loadAwaySquad}
              />
              
              {/* Futuristic Statistics Console (Halftime & Total Goals Redesigned) */}
              <div className="grid gap-5 grid-cols-1 bg-black/35 p-4 sm:p-5 rounded-xl border border-gray-900 shadow-inner">
                {/* 1st Half Scorecard Section */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-3 border-b border-gray-800/40 pb-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-black font-mono">1ST</span>
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">{t("deep.halfTimeScore")}</p>
                  </div>
                  
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {/* Home Halftime Pods */}
                    <div className="bg-[#05070b] p-3 rounded-lg border border-gray-950">
                      <p className="truncate text-[10px] font-bold text-gray-500 mb-2 font-mono uppercase tracking-wide">
                        {match.home.name} {locale === "th" ? "(ครึ่งแรก)" : "(Half-time)"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {[0, 1, 2, 3, "4+"].map((val) => {
                          const isSelected = val === "4+" ? (halfHomeScore ?? 0) >= 4 : halfHomeScore === val;
                          return (
                            <button
                              type="button"
                              key={`ht-home-${val}`}
                              onClick={() => {
                                if (isLocked) return;
                                setHalfHomeScore(val === "4+" ? 4 : (val as number));
                              }}
                              disabled={isLocked}
                              className={cn(
                                "flex-1 py-1 px-2.5 rounded font-mono text-xs font-bold transition-all cursor-pointer h-7",
                                isSelected
                                  ? "bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                                  : "bg-[#12121a] border border-gray-900 text-gray-500 hover:border-cyan-400/20 hover:text-white"
                              )}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Away Halftime Pods */}
                    <div className="bg-[#05070b] p-3 rounded-lg border border-gray-950">
                      <p className="truncate text-[10px] font-bold text-gray-500 mb-2 font-mono uppercase tracking-wide">
                        {match.away.name} {locale === "th" ? "(ครึ่งแรก)" : "(Half-time)"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {[0, 1, 2, 3, "4+"].map((val) => {
                          const isSelected = val === "4+" ? (halfAwayScore ?? 0) >= 4 : halfAwayScore === val;
                          return (
                            <button
                              type="button"
                              key={`ht-away-${val}`}
                              onClick={() => {
                                if (isLocked) return;
                                setHalfAwayScore(val === "4+" ? 4 : (val as number));
                              }}
                              disabled={isLocked}
                              className={cn(
                                "flex-1 py-1 px-2.5 rounded font-mono text-xs font-bold transition-all cursor-pointer h-7",
                                isSelected
                                  ? "bg-magenta-500/20 border border-magenta-400 text-magenta-200 shadow-[0_0_8px_rgba(217,70,239,0.2)]"
                                  : "bg-[#12121a] border border-gray-900 text-gray-500 hover:border-magenta-400/20 hover:text-white"
                              )}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear halftime score helper */}
                  {(halfHomeScore !== null || halfAwayScore !== null) && (
                    <button
                      type="button"
                      onClick={() => {
                        setHalfHomeScore(null);
                        setHalfAwayScore(null);
                      }}
                      className="mt-2.5 text-[9px] font-black text-gray-500 hover:text-red-400 cursor-pointer self-start"
                    >
                      ✕ CLEAR HALFTIME
                    </button>
                  )}
                </div>

                {/* Total Goals Section */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-3 border-b border-gray-800/40 pb-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-950 text-amber-400 text-[10px]">⚽</span>
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">{t("deep.totalGoals")}</p>
                  </div>
                  <div className="flex flex-col bg-[#05070b] p-4 rounded-lg border border-gray-950 w-full space-y-3 select-none">
                    {/* Glowing Bead Horizontal Selector */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-500/80 uppercase font-mono tracking-wider animate-pulse flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {locale === "th" ? "คำนวณอัตโนมัติจากผลสกอร์" : "AUTO-CALCULATED FROM SCORE"}
                      </span>
                      <span className="font-mono text-sm font-black text-amber-300 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/15">
                        {totalGoals ?? "-"} {locale === "th" ? "ประตู" : "goals"}
                      </span>
                    </div>
                    {/* Quick values beads */}
                    <div className="flex flex-wrap gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 6, 7, "8+"].map((val) => {
                        const isSelected = val === "8+" ? (totalGoals ?? 0) >= 8 : totalGoals === val;
                        return (
                          <button
                            type="button"
                            key={`total-${val}`}
                            disabled={true}
                            className={cn(
                              "h-8 min-w-8 flex-1 rounded-lg font-mono text-xs font-bold transition-all select-none",
                              isSelected
                                ? "bg-amber-400 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.35)] scale-105 border border-amber-300"
                                : "bg-[#12121a]/40 border border-gray-900/60 text-gray-600"
                            )}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PredictionSection>

          <Card className="relative overflow-hidden border border-amber-500/20 bg-gradient-to-br from-[#140f06] to-[#07080b] p-4 sm:p-5">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-400/5 blur-2xl" />
            <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-end">
              <div className="min-w-0">
                <label
                  htmlFor="pointsWagered"
                  className="block text-xs font-black uppercase tracking-wider text-amber-300"
                >
                  {t("payload.pointsWagered")}
                </label>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {locale === "th"
                    ? "แต้มฐานจะถูกคูณด้วยระดับความมั่นใจก่อนส่งคำทาย"
                    : "Base points are multiplied by confidence before submission."}
                </p>
              </div>
              <div className="min-w-0">
                <div className="flex items-center rounded-xl border border-amber-500/30 bg-black/45 px-3 py-2 shadow-[inset_0_0_14px_rgba(245,158,11,0.06)] focus-within:border-amber-300/70">
                  <input
                    id="pointsWagered"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={pointsWagered}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setPointsWagered(Number.isFinite(nextValue) ? Math.max(0, Math.floor(nextValue)) : 0);
                    }}
                    disabled={isLocked}
                    className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-black text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="shrink-0 text-xs font-bold uppercase text-amber-300">
                    {locale === "th" ? "แต้ม" : "pts"}
                  </span>
                </div>
                <p className="mt-1.5 text-right text-[10px] font-semibold text-gray-500">
                  {t("side.balance")}: {freePoints.toLocaleString()} {locale === "th" ? "แต้ม" : "pts"}
                </p>
              </div>
            </div>
            <div className="relative mt-4 rounded-lg border border-amber-500/15 bg-black/30 px-3 py-2 text-right font-mono text-xs font-bold text-amber-200">
              {pointsWagered.toLocaleString()} x {confidenceMultiplier.toFixed(1)} = {effectivePointsWagered.toLocaleString()} {locale === "th" ? "แต้ม" : "pts"}
            </div>
          </Card>

          {/* Section 2: Confidence Tactical Cards */}
          <PredictionSection
            icon={Medal}
            title={t("confidence.title")}
            subtitle={t("confidence.subtitle")}
          >
            <div className="space-y-4">
              <ConfidenceCards
                options={confidenceOptions}
                value={confidence}
                onChange={(value) => setConfidence(value as ConfidenceLevel)}
              />
              
              <BoostToggle 
                checked={useBoost} 
                onChange={setUseBoost} 
                label={t("boost.label")} 
                description={t("boost.description")} 
              />
            </div>
          </PredictionSection>
        </div>

        {/* Right Column (Sidebar Ticket & Actions) */}
        <aside className="space-y-4 min-w-0">
          
          {/* Physical Football Ticket summary */}
          <Card className="overflow-hidden p-0 border border-gray-800 bg-gradient-to-b from-[#12121a] to-[#0b0b10]">
            <div className="border-b border-gray-800/80 px-4 py-3 bg-black/20 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400">{t("summary.title")}</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative rounded-xl border border-dashed border-gray-800 bg-black/40 p-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(34,211,238,0.06),transparent_60%)]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{t("basic.fullScore")}</p>
                <p className="mt-1 font-mono text-4xl font-extrabold text-white tracking-tight">
                  {homeScore ?? "-"} <span className="text-gray-700 font-normal">:</span> {awayScore ?? "-"}
                </p>
                <p className="mt-2 truncate text-xs font-semibold text-gray-400">
                  {match.home.name} <span className="text-gray-600 text-[10px]">vs</span> {match.away.name}
                </p>
              </div>
              
              <div className="space-y-2 text-xs font-mono">
                <SummaryRow label="predictedHomeScore" value={formatNullableNumber(payload.predictedHomeScore)} />
                <SummaryRow label="predictedAwayScore" value={formatNullableNumber(payload.predictedAwayScore)} />
                <SummaryRow 
                  label="firstScorerPlayerId" 
                  value={selectedFirstScorer ? selectedFirstScorer.name : "-"} 
                  mono={!selectedFirstScorer} 
                />
                <SummaryRow label="totalGoals" value={formatNullableNumber(payload.totalGoals)} />
                <SummaryRow 
                  label="halfTimeHome" 
                  value={formatNullableNumber(payload.halfTimeHome)} 
                />
                <SummaryRow 
                  label="halfTimeAway" 
                  value={formatNullableNumber(payload.halfTimeAway)} 
                />
                <SummaryRow label="pointsWagered" value={String(payload.pointsWagered)} mono />
                <SummaryRow label="confidenceLevel" value={payload.confidenceLevel} mono />
                <SummaryRow label="useBoost" value={payload.useBoost ? "true" : "false"} />
              </div>

              {/* Soccer Digital Ticket Barcode */}
              <div className="pt-4 border-t border-dashed border-gray-800 flex flex-col items-center justify-center opacity-70">
                <div className="w-full h-8 bg-[repeating-linear-gradient(90deg,theme(colors.gray.600)_0_2px,transparent_2px_5px,theme(colors.gray.600)_5px_6px,transparent_6px_8px)]" />
                <p className="mt-1 font-mono text-[9px] text-cyan-500/50 tracking-widest uppercase">SCM-PRD-TICKET</p>
              </div>
            </div>
          </Card>

          {/* Mini dashboards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            <MiniPanel icon={Zap} label={t("side.streak")} value="3" tone="text-amber-400" />
            <MiniPanel icon={Medal} label={t("side.pointsCorrect")} value={useBoost ? "+10-50" : "+5-25"} tone="text-green-400" />
            <Card className="p-3 text-center border border-gray-800/60 bg-gradient-to-b from-[#161622] to-[#0d0d15] flex flex-col justify-center items-center">
              <PointsBadge type="free" amount={2840} size="md" showLabel />
              <p className="mt-1.5 text-[10px] text-gray-500 font-semibold tracking-wider uppercase">{t("side.balance")}</p>
            </Card>
          </div>

          {/* AI Helper tool */}
          <Card className="relative overflow-hidden p-4 border border-cyan-500/20 bg-gradient-to-br from-[#0c1622] to-[#060b11]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                <Brain size={15} className="animate-pulse" />
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">{t("ai.title")}</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              {t("ai.description")}
            </p>
            <Button
              className="mt-3.5 w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold hover:bg-cyan-400 hover:text-black cursor-pointer shadow-md transition-all active:scale-[0.98]"
              size="sm"
              onClick={() => {
                setHomeScore(2);
                setAwayScore(1);
                setTotalGoals(3);
                setHalfHomeScore(1);
                setHalfAwayScore(0);
                setConfidence("confident");
                
                addToast({
                  type: "success",
                  title: locale === "th" ? "กรอกผลด้วย AI แล้ว" : "Filled with AI",
                  message: locale === "th" 
                    ? "กรอกค่าทายผลสำเร็จโดยอ้างอิงจากบทวิเคราะห์ AI" 
                    : "Predictions filled successfully using AI recommendations",
                });
              }}
            >
              <Sparkles size={13} className="mr-1" />
              {t("ai.use")}
            </Button>
          </Card>

          {/* Head-to-Head listing */}
          <H2HPanel
            h2h={match.h2h ?? []}
            locale={locale}
            title={t("h2h.title")}
            emptyLabel={t("h2h.empty")}
            vsLabel={t("common.vs")}
            homeTeamName={match.home.name}
          />

          {/* Form Actions */}
          {submitted ? (
            <Card className="border-green-500/30 p-5 text-center bg-green-950/10 animate-slide-up">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
              <p className="font-semibold text-green-400">{t("submitted.title")}</p>
              <p className="text-sm text-gray-400">{t("submitted.description")}</p>
            </Card>
          ) : (
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!canSubmit}
              className="w-full cursor-pointer h-12 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              size="lg"
              neon
            >
              {t("submit")}
            </Button>
          )}
        </aside>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t("confirm.title")}
        size="lg"
      >
        <div className="space-y-5">
          {/* Match Scoreboard Card */}
          <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-[#0a0a0f] to-[#06080c] px-5 py-4 text-center shadow-[0_0_30px_rgba(34,211,238,0.06)]">
            <p className="mb-3 text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-widest">
              {t("confirm.youPredict")}
            </p>

            {/* Teams vs Score */}
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {/* Home team */}
              <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
                <ApiTeamLogo
                  name={match.home.name}
                  logo={match.home.logo}
                  size="md"
                  accent="cyan"
                />
                <span className="text-[11px] sm:text-xs font-bold text-white truncate max-w-full">
                  {match.home.name}
                </span>
              </div>

              {/* Score */}
              <div className="shrink-0">
                <p className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight">
                  <span className="text-cyan-400">{homeScore ?? "-"}</span>
                  <span className="text-gray-600 mx-0.5">:</span>
                  <span className="text-magenta-400">{awayScore ?? "-"}</span>
                </p>
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
                <ApiTeamLogo
                  name={match.away.name}
                  logo={match.away.logo}
                  size="md"
                  accent="magenta"
                />
                <span className="text-[11px] sm:text-xs font-bold text-white truncate max-w-full">
                  {match.away.name}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10px] sm:text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Timer size={11} className="text-cyan-400/70" />
                {match.league} - {match.round}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock size={11} className="text-amber-400/70" />
                {formatDateTime(match.kickoffTime, locale)}
              </span>
            </div>
          </div>

          {/* Detail Rows Grid */}
          <div className="grid gap-2 sm:grid-cols-2">
            {/* First Scorer */}
            <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 shrink-0">
                  {t("deep.firstScorer")}
                </p>
                {selectedFirstScorer ? (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-black font-mono text-cyan-300">
                      {selectedFirstScorer.number ?? "?"}
                    </span>
                    <span className="text-xs font-semibold text-white truncate text-right">{selectedFirstScorer.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-600">—</span>
                )}
              </div>
            </div>

            {/* Total Goals */}
            <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 shrink-0">
                  {t("deep.totalGoals")}
                </p>
                <span className="text-xs font-black font-mono text-amber-300 text-right">
                  {totalGoals !== null ? `${totalGoals} ${locale === "th" ? "ประตู" : "goals"}` : "-"}
                </span>
              </div>
            </div>

            {/* Half-time Score */}
            <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 shrink-0">
                  {t("summary.halfTime")}
                </p>
                <span className="text-xs font-black font-mono text-white text-right">
                  {halfHomeScore !== null ? halfHomeScore : "-"}
                  {" : "}
                  {halfAwayScore !== null ? halfAwayScore : "-"}
                </span>
              </div>
            </div>

            {/* Points wagered */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/80 shrink-0">
                  {t("payload.pointsWagered")}
                </p>
                <span className="text-xs font-black font-mono text-amber-200 text-right">
                  {effectivePointsWagered.toLocaleString()} {locale === "th" ? "แต้ม" : "pts"}
                </span>
              </div>
            </div>

            {/* Confidence Level */}
            <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 shrink-0">
                  {t("confidence.title")}
                </p>
                <span className="text-xs font-black text-white text-right">
                  {confidenceOptions.find((o) => o.value === confidence)?.label ?? confidence}
                </span>
              </div>
            </div>
            
          </div>

          {/* Boost indicator */}
          {useBoost && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
              <Zap size={14} className="shrink-0 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">
                {locale === "th" ? "เปิดใช้บูสต์ — แต้มคูณเพิ่มขึ้น" : "Boost active — increased point multiplier"}
              </span>
            </div>
          )}

          {/* Warning notice */}
          <p className="text-center text-[10px] sm:text-xs text-amber-400/80 font-semibold flex items-center justify-center gap-1.5">
            <AlertTriangle size={13} className="shrink-0" />
            {t("confirm.lockNotice")}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1 cursor-pointer h-11" onClick={() => setShowConfirm(false)}>
              {t("common.cancel")}
            </Button>
            <Button className="flex-1 cursor-pointer h-11 shadow-[0_0_20px_rgba(34,211,238,0.2)]" onClick={confirmSubmit} neon>
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ----------------------------------------------------
// SCORE PREDICTOR CONSOLE
// ----------------------------------------------------
function ScorePredictorConsole({
  homeTeamName,
  homeLogo,
  awayTeamName,
  awayLogo,
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  isLocked,
}: {
  homeTeamName: string;
  homeLogo: string | null;
  awayTeamName: string;
  awayLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  setHomeScore: (val: number | null) => void;
  setAwayScore: (val: number | null) => void;
  isLocked: boolean;
}) {
  const quickSelects = [1, 2, 3, 4, 5];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Home Giant Stepper */}
      <div className="bg-[#05070b] p-4 rounded-xl border border-gray-950 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <ApiTeamLogo name={homeTeamName} logo={homeLogo} size="sm" accent="cyan" />
          <p className="truncate text-xs font-bold text-gray-400 font-mono uppercase tracking-wider">{homeTeamName}</p>
        </div>
        <div className="flex items-center w-full max-w-xs gap-3 mb-4">
          <button
            type="button"
            onClick={() => !isLocked && setHomeScore(Math.max(0, (homeScore ?? 0) - 1))}
            disabled={isLocked || homeScore === null || homeScore === 0}
            className="h-14 flex-1 rounded-xl bg-black border border-cyan-500/20 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/5 transition-all text-xl font-black flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-25"
          >
            -
          </button>
          <div className="w-16 h-14 bg-black/60 border border-cyan-950/40 rounded-xl flex items-center justify-center shadow-inner">
            <span className="font-mono text-2xl font-black text-white">{homeScore ?? "-"}</span>
          </div>
          <button
            type="button"
            onClick={() => !isLocked && setHomeScore(Math.min(20, (homeScore ?? 0) + 1))}
            disabled={isLocked}
            className="h-14 flex-1 rounded-xl bg-black border border-cyan-500/20 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/5 transition-all text-xl font-black flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-25"
          >
            +
          </button>
        </div>
        {/* Quick Select Buttons */}
        <div className="flex w-full max-w-xs gap-2">
          {quickSelects.map((num) => (
            <button
              key={`home-quick-${num}`}
              type="button"
              onClick={() => !isLocked && setHomeScore(num)}
              disabled={isLocked}
              className={cn(
                "h-10 flex-1 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-25",
                homeScore === num
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                  : "bg-black/50 border-gray-800 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-400"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Away Giant Stepper */}
      <div className="bg-[#05070b] p-4 rounded-xl border border-gray-950 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <p className="truncate text-xs font-bold text-gray-400 font-mono uppercase tracking-wider">{awayTeamName}</p>
          <ApiTeamLogo name={awayTeamName} logo={awayLogo} size="sm" accent="magenta" />
        </div>
        <div className="flex items-center w-full max-w-xs gap-3 mb-4">
          <button
            type="button"
            onClick={() => !isLocked && setAwayScore(Math.max(0, (awayScore ?? 0) - 1))}
            disabled={isLocked || awayScore === null || awayScore === 0}
            className="h-14 flex-1 rounded-xl bg-black border border-magenta-500/20 text-magenta-400 hover:border-magenta-400 hover:bg-magenta-500/5 transition-all text-xl font-black flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-25"
          >
            -
          </button>
          <div className="w-16 h-14 bg-black/60 border border-magenta-950/40 rounded-xl flex items-center justify-center shadow-inner">
            <span className="font-mono text-2xl font-black text-white">{awayScore ?? "-"}</span>
          </div>
          <button
            type="button"
            onClick={() => !isLocked && setAwayScore(Math.min(20, (awayScore ?? 0) + 1))}
            disabled={isLocked}
            className="h-14 flex-1 rounded-xl bg-black border border-magenta-500/20 text-magenta-400 hover:border-magenta-400 hover:bg-magenta-500/5 transition-all text-xl font-black flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-25"
          >
            +
          </button>
        </div>
        {/* Quick Select Buttons */}
        <div className="flex w-full max-w-xs gap-2">
          {quickSelects.map((num) => (
            <button
              key={`away-quick-${num}`}
              type="button"
              onClick={() => !isLocked && setAwayScore(num)}
              disabled={isLocked}
              className={cn(
                "h-10 flex-1 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-25",
                awayScore === num
                  ? "bg-magenta-500/20 border-magenta-400 text-magenta-400"
                  : "bg-black/50 border-gray-800 text-gray-500 hover:border-magenta-500/50 hover:text-magenta-400"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Head-to-Head listing panel
// ----------------------------------------------------
function H2HPanel({
  h2h,
  locale,
  title,
  emptyLabel,
  vsLabel,
  homeTeamName,
}: {
  h2h: PredictH2HFixture[];
  locale: string;
  title: string;
  emptyLabel: string;
  vsLabel: string;
  homeTeamName: string;
}) {
  return (
    <Card className="overflow-hidden p-0 border border-gray-800">
      <div className="border-b border-gray-800 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <History size={16} className="text-purple-300" />
          <span className="min-w-0 truncate">{title}</span>
        </h3>
      </div>
      {h2h.length === 0 ? (
        <div className="px-4 py-5 text-center text-xs text-gray-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="divide-y divide-gray-800/70">
          {h2h.map((fixture) => {
            const isFinished = fixture.score.home !== null && fixture.score.away !== null;
            let resultDot = null;
            if (isFinished) {
              const homeScoreVal = fixture.score.home ?? 0;
              const awayScoreVal = fixture.score.away ?? 0;
              const isHomeTeamMatches = fixture.home.name.toLowerCase() === homeTeamName.toLowerCase();
              
              let isWin = false;
              let isDraw = false;
              
              if (homeScoreVal === awayScoreVal) {
                isDraw = true;
              } else if (homeScoreVal > awayScoreVal) {
                isWin = isHomeTeamMatches;
              } else {
                isWin = !isHomeTeamMatches;
              }
              
              resultDot = (
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isDraw ? "bg-gray-500" : isWin ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                )} />
              );
            }

            return (
              <div key={fixture.id} className="px-4 py-3 hover:bg-white/[0.01] transition-colors">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {resultDot}
                    <span className="font-mono text-[10px] text-gray-500">
                      {formatH2HDate(fixture.kickoffTime, locale)}
                    </span>
                  </div>
                  <span className="truncate text-right text-[10px] text-gray-500">
                    {fixture.league.name}
                  </span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_54px_minmax(0,1fr)] items-center gap-2">
                  <H2HTeam name={fixture.home.name} logo={fixture.home.logo} align="right" />
                  <span className="text-center font-mono text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-gray-800/50">
                    {isFinished
                      ? `${fixture.score.home} - ${fixture.score.away}`
                      : vsLabel}
                  </span>
                  <H2HTeam name={fixture.away.name} logo={fixture.away.logo} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function H2HTeam({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo: string | null;
  align?: "left" | "right";
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", align === "right" && "justify-end")}>
      {align === "right" && (
        <span className="truncate text-xs font-semibold text-white">{name}</span>
      )}
      <ApiTeamLogo name={name} logo={logo} size="sm" accent={align === "right" ? "cyan" : "magenta"} />
      {align === "left" && (
        <span className="truncate text-xs font-semibold text-white">{name}</span>
      )}
    </div>
  );
}

function formatH2HDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// ----------------------------------------------------
// Confidence Selector cards
// ----------------------------------------------------
function ConfidenceCards({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const cardDetails: Record<string, { desc: string; tone: "cyan" | "gold" | "magenta"; badge: string }> = {
    safe: {
      desc: "เสี่ยงต่ำ แต้มคูณปกติ เหมาะกับคู่แข่งสายสูสีที่เดาทางยาก",
      tone: "cyan",
      badge: "x1.0",
    },
    confident: {
      desc: "มั่นใจปานกลาง โบนัสแต้มคูณ 1.5 หากทายผลถูกเป๊ะ",
      tone: "gold",
      badge: "x1.5",
    },
    bold: {
      desc: "เสี่ยงสูงจัดเต็ม ดับเบิ้ลแต้มคูณ 2.0 ลุ้นรางวัลใหญ่สะใจ",
      tone: "magenta",
      badge: "x2.0",
    },
  };

  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
      {options.map((option) => {
        const isSelected = value === option.value;
        const details = cardDetails[option.value];
        
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden",
              isSelected
                ? details.tone === "cyan"
                  ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                  : details.tone === "gold"
                    ? "border-amber-400 bg-amber-950/20 shadow-[0_0_18px_rgba(245,158,11,0.12)]"
                    : "border-magenta-400 bg-magenta-950/20 shadow-[0_0_18px_rgba(217,70,239,0.12)]"
                : "border-gray-800 bg-[#08080d] hover:border-gray-700"
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1 w-full">
              <span className={cn(
                "text-xs sm:text-sm font-extrabold tracking-wide",
                isSelected
                  ? details.tone === "cyan" ? "text-cyan-300" : details.tone === "gold" ? "text-amber-300" : "text-magenta-300"
                  : "text-gray-300"
              )}>
                {option.label}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                isSelected
                  ? details.tone === "cyan" 
                    ? "bg-cyan-400 text-black" 
                    : details.tone === "gold" 
                      ? "bg-amber-400 text-black" 
                      : "bg-magenta-400 text-black"
                  : "bg-gray-800 text-gray-400"
              )}>
                {details.badge}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed mt-2 font-medium">
              {details.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------
// Boost Toggle Button
// ----------------------------------------------------
function BoostToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-all cursor-pointer",
        checked
          ? "border-amber-300/50 bg-amber-400/10 shadow-[0_0_16px_rgba(245,158,11,0.08)]"
          : "border-gray-800 bg-[#08080d] hover:border-gray-700"
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-white tracking-wide">{label}</span>
        <span className="mt-1 block text-xs leading-relaxed text-gray-500 font-medium">{description}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200",
          checked ? "border-amber-300 bg-amber-400" : "border-gray-700 bg-gray-950"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200 shadow-sm",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}

function getConfidenceMultiplier(confidence: ConfidenceLevel) {
  switch (confidence) {
    case "bold":
      return 2;
    case "confident":
      return 1.5;
    case "safe":
    default:
      return 1;
  }
}

// ----------------------------------------------------
// Payload and general helper previews
// ----------------------------------------------------
function PayloadPreview({
  payload,
}: {
  payload: {
    matchId: string;
    predictedHomeScore: number | null;
    predictedAwayScore: number | null;
    firstScorerPlayerId: string | null;
    totalGoals: number | null;
    halfTimeHome: number | null;
    halfTimeAway: number | null;
    confidenceLevel: ConfidenceLevel;
    useBoost: boolean;
    pointsWagered: number;
  };
}) {
  return (
    <pre className="max-h-40 overflow-auto text-[10px] sm:text-xs leading-5 text-cyan-200/90 font-mono scrollbar-thin">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}

function PredictionSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 border border-gray-800 bg-[#12121a]/85 backdrop-blur-md">
      <div className="mb-4 flex items-start gap-3 border-b border-gray-800/40 pb-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-950/20 text-cyan-400">
          <Icon size={16} />
        </span>
        <div>
          <h2 className="text-sm font-extrabold tracking-wide text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500 font-medium leading-normal">{subtitle}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

// ----------------------------------------------------
// Player picker component
// ----------------------------------------------------
function PlayerPicker({
  label,
  home,
  away,
  value,
  onChange,
  locale,
  homePlayers,
  awayPlayers,
  loadingHome,
  loadingAway,
  onLoadAwaySquad,
}: {
  label: string;
  home: {
    id: number | string | null;
    name: string;
    logo: string | null;
    players: PredictPlayer[];
    colors?: {
      primary: string | null;
      number: string | null;
      border: string | null;
    } | null;
  };
  away: {
    id: number | string | null;
    name: string;
    logo: string | null;
    players: PredictPlayer[];
    colors?: {
      primary: string | null;
      number: string | null;
      border: string | null;
    } | null;
  };
  value: string | null;
  onChange: (value: string | null) => void;
  locale: string;
  homePlayers: PredictPlayer[];
  awayPlayers: PredictPlayer[];
  loadingHome: boolean;
  loadingAway: boolean;
  onLoadAwaySquad: () => void;
}) {
  const selectedPlayer = findPlayerById({ home: { players: homePlayers }, away: { players: awayPlayers } }, value);

  // Team Selection State (Home by default, or Away if away player is selected)
  const isSelectedPlayerAway = awayPlayers.some(p => String(p.id ?? p.name) === value);
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">(isSelectedPlayerAway ? "away" : "home");

  // Load away squad when the away tab is active
  useEffect(() => {
    if (selectedTeam === "away") {
      onLoadAwaySquad();
    }
  }, [selectedTeam, onLoadAwaySquad]);

  // Keep tab in sync with selected player value
  useEffect(() => {
    if (value) {
      const isAway = awayPlayers.some(p => String(p.id ?? p.name) === value);
      setSelectedTeam(isAway ? "away" : "home");
    }
  }, [value, awayPlayers]);

  // Position classifications and search filters
  const [homeSearch, setHomeSearch] = useState("");
  const [awaySearch, setAwaySearch] = useState("");

  const searchPlaceholder = locale === "th" ? "ค้นหาชื่อผู้เล่น..." : "Search player name...";

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-bold text-white tracking-wide">{label}</p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="truncate rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 transition-all hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 cursor-pointer"
          >
            {selectedPlayer?.name ?? value} ✕
          </button>
        )}
      </div>

      {/* Futuristic Tactical Pitch HUD Display */}
      <div className="relative w-full h-32 bg-[#0c1e18] border border-emerald-950/40 rounded-xl overflow-hidden mb-4 select-none">
        {/* Pitch grass grid lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_50%,rgba(16,185,129,0.2)_50%),linear-gradient(rgba(16,185,129,0.2)_50%,transparent_50%)] bg-[size:20px_20px]" />
        {/* Pitch white lines */}
        <div className="absolute inset-2 border border-white/5 rounded-lg pointer-events-none" />
        <div className="absolute inset-y-2 left-1/2 w-px bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-2 -translate-y-1/2 w-4 h-12 border-y border-r border-white/5 pointer-none" />
        <div className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-12 border-y border-l border-white/5 pointer-none" />
        
        {/* Selected Scorer Pitch Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-3">
          {selectedPlayer ? (
            <div className="flex flex-col items-center animate-slide-up text-center">
              {(() => {
                const isHome = homePlayers.some(p => String(p.id ?? p.name) === value);
                const kitColors = isHome ? home.colors : away.colors;
                const style = kitColors && kitColors.primary ? {
                  backgroundColor: `#${kitColors.primary}`,
                  color: kitColors.number ? `#${kitColors.number}` : "#000000",
                  borderColor: kitColors.border ? `#${kitColors.border}` : `#${kitColors.primary}`,
                  borderWidth: "2px",
                  borderStyle: "solid"
                } : {};
                
                return (
                  <span 
                    style={style}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-black shadow-lg animate-pulse mb-1.5",
                      !kitColors?.primary && (isHome ? "bg-cyan-400 text-black animate-pulse" : "bg-magenta-400 text-black animate-pulse")
                    )}
                  >
                    {selectedPlayer.number ?? "?"}
                  </span>
                );
              })()}
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">TACTICAL GOALSCORER SELECTED</p>
              <p className="text-xs sm:text-sm font-black text-white">{selectedPlayer.name}</p>
            </div>
          ) : (
            <div className="text-center opacity-40">
              <HelpCircle className="mx-auto mb-1 text-gray-500" size={18} />
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">NO SCORER ASSIGNED</p>
              <p className="text-[10px] sm:text-[11px] text-gray-600 font-medium">Click on any player in the squads below to predict first scorer</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Tabs Selector */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-black/40 border border-gray-900 mb-3.5">
        <button
          type="button"
          onClick={() => setSelectedTeam("home")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer min-w-0",
            selectedTeam === "home"
              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.08)]"
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          )}
        >
          <ApiTeamLogo name={home.name} logo={home.logo} size="sm" accent="cyan" />
          <span className="truncate max-w-full">{home.name}</span>
        </button>
        
        <button
          type="button"
          onClick={() => setSelectedTeam("away")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer min-w-0",
            selectedTeam === "away"
              ? "bg-magenta/10 border border-magenta/30 text-magenta shadow-[0_0_15px_rgba(217,70,239,0.08)]"
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          )}
        >
          <ApiTeamLogo name={away.name} logo={away.logo} size="sm" accent="magenta" />
          <span className="truncate max-w-full">{away.name}</span>
        </button>
      </div>

      {/* Roster Column */}
      <div className="w-full">
        {selectedTeam === "home" ? (
          <PlayerColumn 
            team={{ ...home, players: homePlayers }} 
            value={value} 
            onChange={onChange} 
            tone="cyan" 
            searchQuery={homeSearch}
            onSearchChange={setHomeSearch}
            searchPlaceholder={searchPlaceholder}
            loading={loadingHome}
          />
        ) : (
          <PlayerColumn 
            team={{ ...away, players: awayPlayers }} 
            value={value} 
            onChange={onChange} 
            tone="magenta" 
            searchQuery={awaySearch}
            onSearchChange={setAwaySearch}
            searchPlaceholder={searchPlaceholder}
            loading={loadingAway}
          />
        )}
      </div>
    </div>
  );
}

function PlayerColumn({
  team,
  value,
  onChange,
  tone,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  loading,
}: {
  team: { name: string; logo: string | null; players: PredictPlayer[] };
  value: string | null;
  onChange: (value: string) => void;
  tone: "cyan" | "magenta";
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  loading?: boolean;
}) {
  // Categorize player position dynamically based on squad numbers or indexing
  const getPlayerPosition = (player: PredictPlayer, index: number) => {
    if (player.number) {
      if (player.number === 1) return { key: "GK", label: "GKP" };
      if (player.number >= 2 && player.number <= 5) return { key: "DF", label: "DEF" };
      if (player.number >= 6 && player.number <= 8) return { key: "MF", label: "MID" };
      return { key: "FW", label: "FWD" };
    }
    if (index === 0) return { key: "GK", label: "GKP" };
    if (index >= 1 && index <= 4) return { key: "DF", label: "DEF" };
    if (index >= 5 && index <= 8) return { key: "MF", label: "MID" };
    return { key: "FW", label: "FWD" };
  };

  // Filter roster by name search
  const filteredPlayers = team.players.filter((p) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  return (
    <div className="rounded-xl border border-gray-800 bg-[#08080d]/80 p-3 flex flex-col min-w-0">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ApiTeamLogo
            name={team.name}
            logo={team.logo}
            size="sm"
            accent={tone}
          />
          <p className="truncate text-xs font-bold text-white">{team.name}</p>
        </div>
        <span className="text-[10px] text-gray-500 font-mono font-semibold shrink-0">
          {filteredPlayers.length} / {team.players.length}
        </span>
      </div>

      {/* Roster Search bar */}
      <div className="relative mb-2">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full h-8 pl-8 pr-7 text-xs bg-black/45 border rounded-lg text-gray-300 placeholder-gray-600 outline-none transition-all",
            tone === "cyan" 
              ? "border-gray-800/80 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/40" 
              : "border-gray-800/80 focus:border-magenta-500/40 focus:ring-1 focus:ring-magenta-500/40"
          )}
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable list of players */}
      <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className={cn(
                "group flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all w-full relative overflow-hidden bg-black/45 shadow-[inset_0_0_8px_rgba(255,255,255,0.02)]",
                tone === "cyan" ? "border-cyan-950/40" : "border-magenta-950/40"
              )}
            >
              {/* Shimmer absolute layer */}
              <div className="absolute inset-0 animate-shimmer opacity-80" />
              
              {/* Left Side: Jersey and Name skeleton */}
              <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <div className="h-3.5 w-24 bg-gray-800/80 rounded relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer opacity-60" />
                </div>
              </div>
              
              {/* Right Side: Position skeleton */}
              <div className="h-4.5 w-10 bg-gray-900/95 rounded border border-gray-900 relative overflow-hidden z-10 shrink-0">
                <div className="absolute inset-0 animate-shimmer opacity-55" />
              </div>
            </div>
          ))
        ) : filteredPlayers.length === 0 ? (
          <p className="col-span-1 text-center py-6 text-[11px] text-gray-500 italic font-medium">
            No players found
          </p>
        ) : (
          filteredPlayers.map((player, index) => {
            const isSelected = value === String(player.id ?? player.name);
            const pos = getPlayerPosition(player, index);
            return (
              <button
                key={`${player.id ?? player.name}-${index}`}
                onClick={() => onChange(String(player.id ?? player.name))}
                className={cn(
                  "group flex items-center justify-between rounded-lg border px-3 py-2 transition-all cursor-pointer hover:bg-white/[0.02] active:scale-[0.98] w-full gap-3",
                  isSelected
                    ? tone === "cyan"
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.12)]"
                      : "border-magenta bg-magenta/10 text-white shadow-[0_0_12px_rgba(217,70,239,0.12)]"
                    : "border-gray-900 bg-black/35 text-gray-400 hover:border-gray-700"
                )}
              >
                {/* Left Side: Number and Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] transition-all font-black",
                      isSelected
                        ? tone === "cyan"
                          ? "bg-cyan-400 text-black"
                          : "bg-magenta text-black"
                        : tone === "cyan"
                          ? "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20"
                          : "bg-magenta/20 text-magenta border border-magenta/25"
                    )}
                  >
                    {player.number ?? index + 1}
                  </span>
                  <span className={cn(
                    "truncate text-[11px] font-bold leading-tight transition-colors",
                    isSelected ? "text-white" : "text-gray-300 group-hover:text-white"
                  )}>
                    {player.name}
                  </span>
                </div>
                
                {/* Right Side: Position */}
                <span className={cn(
                  "text-[9px] font-black tracking-wider uppercase font-mono px-2 py-0.5 rounded border transition-all shrink-0",
                  isSelected
                    ? tone === "cyan"
                      ? "bg-cyan-400/20 border-cyan-400 text-cyan-200"
                      : "bg-magenta/20 border-magenta text-white"
                    : tone === "cyan"
                      ? "bg-black/40 border-gray-900 text-gray-500 group-hover:text-cyan-400/80 group-hover:border-cyan-500/10"
                      : "bg-black/40 border-gray-900 text-gray-500 group-hover:text-magenta group-hover:border-magenta/20"
                )}>
                  {pos.label}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function MiniPanel({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card className="p-3 text-center border border-gray-805 bg-gradient-to-b from-[#161622] to-[#0d0d15] flex flex-col justify-center items-center">
      <span className={cn("flex h-6 w-6 items-center justify-center rounded-full bg-black/35 mb-1", tone)}>
        <Icon size={12} />
      </span>
      <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase leading-none mb-1">{label}</p>
      <p className="font-mono text-base font-black text-white leading-none">{value}</p>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const t = useTranslations("predictionForm");
  const translatedLabel = t.has(`payload.${label}`) ? t(`payload.${label}`) : label;

  let translatedValue = value;
  if (label === "confidenceLevel") {
    translatedValue = t.has(`confidence.${value}`) ? t(`confidence.${value}`) : value;
  } else if (label === "useBoost") {
    translatedValue = value === "true" ? t("common.yes") : t("common.no");
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-900/60 pb-1.5 last:border-0 last:pb-0">
      <span className="text-gray-500 font-medium text-[11px]">{translatedLabel}</span>
      <span className={cn("text-right font-extrabold text-white text-[11px]", mono && "font-mono text-[10px] text-cyan-300")}>{translatedValue}</span>
    </div>
  );
}

function findPlayerById(
  match: {
    home: { players: PredictPlayer[] };
    away: { players: PredictPlayer[] };
  },
  playerId: string | null
) {
  if (!playerId) return null;
  return [...match.home.players, ...match.away.players].find(
    (player) => String(player.id ?? player.name) === playerId
  );
}

function formatNullableNumber(value: number | null) {
  return value === null ? "-" : String(value);
}

function JSONPayloadView({
  payload,
}: {
  payload: {
    matchId: string;
    predictedHomeScore: number | null;
    predictedAwayScore: number | null;
    firstScorerPlayerId: string | null;
    totalGoals: number | null;
    halfTimeHome: number | null;
    halfTimeAway: number | null;
    confidenceLevel: ConfidenceLevel;
    useBoost: boolean;
    pointsWagered: number;
  };
}) {
  const entries = Object.entries(payload);
  return (
    <div className="font-mono text-[11px] bg-[#04060a]/90 p-3 rounded-lg border border-gray-900 leading-relaxed text-gray-400 space-y-1 select-all">
      <div className="text-gray-600">{"{"}</div>
      {entries.map(([key, value], idx) => {
        const isLast = idx === entries.length - 1;
        let valueElement = null;
        
        if (value === null) {
          valueElement = <span className="text-gray-600">null</span>;
        } else if (typeof value === "boolean") {
          valueElement = <span className="text-emerald-400">{String(value)}</span>;
        } else if (typeof value === "number") {
          valueElement = <span className="text-fuchsia-400">{value}</span>;
        } else {
          valueElement = <span className="text-amber-300">&quot;{String(value)}&quot;</span>;
        }

        return (
          <div key={key} className="pl-4 flex flex-wrap gap-x-1 items-center">
            <span className="text-cyan-400">&quot;{key}&quot;</span>
            <span className="text-gray-500">:</span>
            {valueElement}
            {!isLast && <span className="text-gray-500">,</span>}
          </div>
        );
      })}
      <div className="text-gray-600">{"}"}</div>
    </div>
  );
}
