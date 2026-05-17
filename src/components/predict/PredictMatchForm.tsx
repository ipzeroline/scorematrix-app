"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  CheckCircle2,
  Gauge,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const scoreOptions = [0, 1, 2, 3, 4, 5];

export interface PredictPlayer {
  id: number | null;
  name: string;
  number: number | null;
}

export interface PredictMatch {
  home: {
    name: string;
    logo: string | null;
    players: PredictPlayer[];
  };
  away: {
    name: string;
    logo: string | null;
    players: PredictPlayer[];
  };
  league: string;
  leagueLogo: string | null;
  round: string;
  time: string;
  kickoffTime: string;
  venue: string;
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
  const [result, setResult] = useState<"home" | "draw" | "away" | "">("");
  const [winner, setWinner] = useState<"home" | "away" | "">("");
  const [homeScore, setHomeScore] = useState<number | null>(null);
  const [awayScore, setAwayScore] = useState<number | null>(null);
  const [firstScorer, setFirstScorer] = useState("");
  const [goalLine, setGoalLine] = useState<"over" | "under" | "">("");
  const [firstGoalTeam, setFirstGoalTeam] = useState<"home" | "away" | "none" | "">("");
  const [halfHomeScore, setHalfHomeScore] = useState<number | null>(null);
  const [halfAwayScore, setHalfAwayScore] = useState<number | null>(null);
  const [extraTime, setExtraTime] = useState<"yes" | "no" | "">("");
  const [penalties, setPenalties] = useState<"yes" | "no" | "">("");
  const [confidence, setConfidence] = useState("safe");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const countdown = getPendingCountdown();
  const isLocked = false;

  const completion = useMemo(() => {
    return [
      result,
      winner,
      homeScore !== null && awayScore !== null,
      firstScorer,
      goalLine,
      firstGoalTeam,
      halfHomeScore !== null && halfAwayScore !== null,
      extraTime,
      penalties,
      confidence,
    ].filter(Boolean).length;
  }, [
    result,
    winner,
    homeScore,
    awayScore,
    firstScorer,
    goalLine,
    firstGoalTeam,
    halfHomeScore,
    halfAwayScore,
    extraTime,
    penalties,
    confidence,
  ]);

  const canSubmit =
    !isLocked && result !== "" && homeScore !== null && awayScore !== null;
  const confidenceOptions = [
    { value: "safe", label: t("confidence.safe") },
    { value: "confident", label: t("confidence.confident") },
    { value: "bold", label: t("confidence.bold") },
  ];

  const confirmSubmit = () => {
    setShowConfirm(false);
    setSubmitted(true);
    setTimeout(() => router.push(`/${locale}/predict`), 1600);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="cyan" size="md">
            {t("badge")}
          </Badge>
          <h1 className="mt-2 text-2xl font-bold text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("subtitle")}
          </p>
        </div>
        <div
          className={cn(
            "predict-lock-countdown group relative overflow-hidden rounded-xl border px-3 py-2 shadow-[0_0_24px_rgba(245,158,11,0.12)]",
            isLocked
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-[#17120a] to-cyan-500/10 text-amber-200"
          )}
        >
          <div className="absolute inset-0 opacity-70 predict-countdown-scan" />
          <div className="relative flex items-center gap-3">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-black/30",
                isLocked ? "border-red-400/30" : "border-amber-300/30"
              )}
            >
              <Timer size={16} className={cn(!isLocked && "animate-pulse")} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {isLocked
                  ? t("locked")
                  : t("locksIn", { time: countdown.compact })}
              </p>
              <div className="mt-1 flex items-center gap-1.5 font-mono">
                {countdown.parts.map((part, index) => (
                  <div key={part.label} className="flex items-center gap-1.5">
                    {index > 0 && (
                      <span className="text-xs font-bold text-amber-300/70">
                        :
                      </span>
                    )}
                    <span className="min-w-8 rounded-md border border-white/10 bg-black/35 px-1.5 py-0.5 text-center text-sm font-bold text-white shadow-inner">
                      {part.value}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-500">
                      {part.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card neon="cyan" className="relative overflow-hidden p-0 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(217,70,239,0.16),transparent_30%)]" />
        <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent predict-scanline" />
        <div className="relative p-5">
          <div className="mx-auto mb-3 flex w-fit items-center gap-3 rounded-xl border border-cyan-500/20 bg-black/35 px-4 py-2 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
            <ApiLeagueLogo name={match.league} logo={match.leagueLogo} size="md" />
            <div className="text-left">
              <p className="text-sm font-bold text-white">{match.league}</p>
              <p className="text-[10px] text-gray-500">
                {match.round} - {match.venue}
              </p>
            </div>
          </div>
          <div className="my-5 grid grid-cols-[1fr_90px_1fr] items-center gap-3">
            <TeamBlock team={match.home} accent="cyan" />
            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/20 bg-black/40 shadow-[0_0_28px_rgba(34,211,238,0.18)] predict-vs-pulse">
                <p className="font-mono text-2xl font-bold text-white">{t("common.vs")}</p>
              </div>
              <p className="mt-2 text-xs text-cyan-400">{match.time}</p>
            </div>
            <TeamBlock team={match.away} accent="magenta" />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <PredictionSection
            icon={Target}
            title={t("basic.title")}
            subtitle={t("basic.subtitle")}
          >
            <div className="grid gap-4">
              <ChoiceGroup
                label={t("basic.result")}
                options={[
                  { key: "home", label: t("outcome.homeWin", { team: match.home.name }) },
                  { key: "draw", label: t("outcome.draw") },
                  { key: "away", label: t("outcome.awayWin", { team: match.away.name }) },
                ]}
                value={result}
                onChange={(value) => setResult(value as typeof result)}
              />

              <div>
                <p className="mb-3 text-sm font-semibold text-white">{t("basic.fullScore")}</p>
                <div className="grid gap-4 sm:grid-cols-[1fr_24px_1fr] sm:items-end">
                  <ScorePicker team={match.home.name} value={homeScore} onChange={setHomeScore} tone="cyan" />
                  <span className="hidden pb-2 text-center font-bold text-gray-600 sm:block">-</span>
                  <ScorePicker team={match.away.name} value={awayScore} onChange={setAwayScore} tone="magenta" />
                </div>
                <p className="mt-3 text-center text-xs text-gray-500">
                  {homeScore !== null && awayScore !== null
                    ? t("basic.scorePreview", { home: homeScore, away: awayScore })
                    : t("basic.selectScores")}
                </p>
              </div>

              <ChoiceGroup
                label={t("basic.winnerTeam")}
                options={[
                  { key: "home", label: match.home.name },
                  { key: "away", label: match.away.name },
                ]}
                value={winner}
                onChange={(value) => setWinner(value as typeof winner)}
              />
            </div>
          </PredictionSection>

          <PredictionSection
            icon={Sparkles}
            title={t("deep.title")}
            subtitle={t("deep.subtitle")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <PlayerPicker
                label={t("deep.firstScorer")}
                home={match.home}
                away={match.away}
                value={firstScorer}
                onChange={setFirstScorer}
              />
              <ChoiceGroup
                label={t("deep.totalGoals")}
                options={[
                  { key: "over", label: t("deep.over25") },
                  { key: "under", label: t("deep.under25") },
                ]}
                value={goalLine}
                onChange={(value) => setGoalLine(value as typeof goalLine)}
              />
              <ChoiceGroup
                label={t("deep.firstGoalTeam")}
                options={[
                  { key: "home", label: match.home.name },
                  { key: "away", label: match.away.name },
                  { key: "none", label: t("deep.noGoal") },
                ]}
                value={firstGoalTeam}
                onChange={(value) => setFirstGoalTeam(value as typeof firstGoalTeam)}
              />
              <div>
                <p className="mb-3 text-sm font-semibold text-white">{t("deep.halfTimeScore")}</p>
                <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-2">
                  <MiniScore value={halfHomeScore} onChange={setHalfHomeScore} tone="cyan" />
                  <span className="text-center text-gray-600">-</span>
                  <MiniScore value={halfAwayScore} onChange={setHalfAwayScore} tone="magenta" />
                </div>
              </div>
              <ChoiceGroup
                label={t("deep.extraTime")}
                options={[
                  { key: "yes", label: t("common.yes") },
                  { key: "no", label: t("common.no") },
                ]}
                value={extraTime}
                onChange={(value) => setExtraTime(value as typeof extraTime)}
              />
              <ChoiceGroup
                label={t("deep.penalties")}
                options={[
                  { key: "yes", label: t("common.yes") },
                  { key: "no", label: t("common.no") },
                ]}
                value={penalties}
                onChange={(value) => setPenalties(value as typeof penalties)}
              />
            </div>
          </PredictionSection>

          <PredictionSection
            icon={Gauge}
            title={t("confidence.title")}
            subtitle={t("confidence.subtitle")}
          >
            <Select
              options={confidenceOptions}
              value={confidence}
              onChange={setConfidence}
              className="w-full"
            />
          </PredictionSection>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-white">{t("summary.title")}</h2>
            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow label={t("basic.result")} value={resultLabel(result, match, t)} />
              <SummaryRow
                label={t("basic.fullScore")}
                value={homeScore !== null && awayScore !== null ? `${homeScore} - ${awayScore}` : "-"}
              />
              <SummaryRow label={t("basic.winnerTeam")} value={winnerLabel(winner, match)} />
              <SummaryRow label={t("summary.overUnder")} value={goalLineLabel(goalLine, t)} />
              <SummaryRow label={t("deep.firstGoalTeam")} value={firstGoalLabel(firstGoalTeam, match, t)} />
              <SummaryRow label={t("confidence.title")} value={confidenceOptions.find((item) => item.value === confidence)?.label ?? "-"} />
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <MiniPanel icon={Zap} label={t("side.streak")} value="3" tone="text-amber-400" />
            <MiniPanel icon={Medal} label={t("side.pointsCorrect")} value="+5-25" tone="text-green-400" />
            <Card className="p-3 text-center">
              <PointsBadge type="free" amount={2840} size="md" showLabel />
              <p className="mt-1 text-xs text-gray-500">{t("side.balance")}</p>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">{t("ai.title")}</h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {t("ai.description")}
            </p>
            <Button
              className="mt-3 w-full"
              variant="outline"
              size="sm"
              onClick={() => {
                setResult("home");
                setWinner("home");
                setHomeScore(2);
                setAwayScore(1);
                setGoalLine("over");
                setFirstGoalTeam("home");
                setConfidence("confident");
              }}
            >
              {t("ai.use")}
            </Button>
          </Card>

          {submitted ? (
            <Card className="border-green-500/30 p-5 text-center animate-slide-up">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
              <p className="font-semibold text-green-400">{t("submitted.title")}</p>
              <p className="text-sm text-gray-400">{t("submitted.description")}</p>
            </Card>
          ) : (
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!canSubmit}
              className="w-full"
              size="lg"
              neon
            >
              {t("submit")}
            </Button>
          )}
        </aside>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t("confirm.title")}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-4 text-sm text-gray-300">
            <p className="text-center text-gray-500">{t("confirm.youPredict")}</p>
            <p className="mt-2 text-center font-mono text-xl font-bold text-white">
              {match.home.name} {homeScore ?? "-"} - {awayScore ?? "-"} {match.away.name}
            </p>
            <p className="mt-3 text-center text-xs text-gray-500">
              {t("confirm.lockNotice")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
              {t("common.cancel")}
            </Button>
            <Button className="flex-1" onClick={confirmSubmit} neon>
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
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
    <Card className="p-5">
      <div className="mb-4 flex items-start gap-3">
        <Icon size={18} className="mt-0.5 text-cyan-400" />
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              value === option.key
                ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                : "border-gray-700 bg-[#0a0a0f] text-gray-400 hover:border-cyan-500/40"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScorePicker({
  team,
  value,
  onChange,
  tone,
}: {
  team: string;
  value: number | null;
  onChange: (value: number) => void;
  tone: "cyan" | "magenta";
}) {
  return (
    <div>
      <p className="mb-2 truncate text-xs text-gray-500">{team}</p>
      <div className="flex flex-wrap gap-1">
        {scoreOptions.map((score) => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className={`h-9 w-9 rounded-lg border font-mono text-sm font-bold transition-colors ${
              value === score
                ? tone === "cyan"
                  ? "border-cyan-200 bg-cyan-400 text-black shadow-[0_0_18px_rgba(34,211,238,0.42)] ring-2 ring-cyan-300/40"
                  : "border-fuchsia-200 bg-fuchsia-400 text-black shadow-[0_0_18px_rgba(217,70,239,0.42)] ring-2 ring-fuchsia-300/40"
                : "border-gray-700 bg-[#0a0a0f] text-gray-400 hover:border-cyan-400/50 hover:text-white"
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniScore({
  value,
  onChange,
  tone,
}: {
  value: number | null;
  onChange: (value: number) => void;
  tone: "cyan" | "magenta";
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {[0, 1, 2, 3].map((score) => (
        <button
          key={score}
          onClick={() => onChange(score)}
          className={`h-8 w-8 rounded-md border font-mono text-xs font-bold ${
            value === score
              ? tone === "cyan"
                ? "border-cyan-200 bg-cyan-400 text-black shadow-[0_0_14px_rgba(34,211,238,0.4)] ring-2 ring-cyan-300/35"
                : "border-fuchsia-200 bg-fuchsia-400 text-black shadow-[0_0_14px_rgba(217,70,239,0.4)] ring-2 ring-fuchsia-300/35"
              : "border-gray-700 bg-[#0a0a0f] text-gray-400 hover:border-cyan-400/50 hover:text-white"
          }`}
        >
          {score}
        </button>
      ))}
    </div>
  );
}

function PlayerPicker({
  label,
  home,
  away,
  value,
  onChange,
}: {
  label: string;
  home: { name: string; logo: string | null; players: PredictPlayer[] };
  away: { name: string; logo: string | null; players: PredictPlayer[] };
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="md:col-span-2">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        {value && (
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200">
            {value}
          </span>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <PlayerColumn team={home} value={value} onChange={onChange} tone="cyan" />
        <PlayerColumn team={away} value={value} onChange={onChange} tone="magenta" />
      </div>
    </div>
  );
}

function PlayerColumn({
  team,
  value,
  onChange,
  tone,
}: {
  team: { name: string; logo: string | null; players: PredictPlayer[] };
  value: string;
  onChange: (value: string) => void;
  tone: "cyan" | "magenta";
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#08080d] p-3">
      <div className="mb-3 flex items-center gap-2">
        <ApiTeamLogo
          name={team.name}
          logo={team.logo}
          size="sm"
          accent={tone}
        />
        <p className="truncate text-xs font-semibold text-white">{team.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {team.players.map((player, index) => (
          <button
            key={`${player.id ?? player.name}-${index}`}
            onClick={() => onChange(player.name)}
            className={`group flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 text-left transition-all hover:-translate-y-0.5 ${
              value === player.name
                ? tone === "cyan"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.16)]"
                  : "border-magenta-400 bg-magenta-500/20 text-magenta-100 shadow-[0_0_18px_rgba(217,70,239,0.16)]"
                : "border-gray-800 bg-white/[0.02] text-gray-400 hover:border-gray-600"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${
                tone === "cyan"
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "bg-magenta-500/15 text-magenta-300"
              }`}
            >
              {player.number ?? index + 1}
            </span>
            <span className="truncate text-xs font-medium">{player.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function getPendingCountdown() {
  return {
    compact: "--",
    parts: [
      { label: "h", value: "--" },
      { label: "m", value: "--" },
      { label: "s", value: "--" },
    ],
  };
}

function TeamBlock({
  team,
  accent,
}: {
  team: { name: string; logo: string | null };
  accent: "cyan" | "magenta";
}) {
  return (
    <div className="text-center">
      <div className="predict-team-float mx-auto mb-2 w-fit">
        <ApiTeamLogo
          name={team.name}
          logo={team.logo}
          size="lg"
          accent={accent}
        />
      </div>
      <p className="truncate text-sm font-semibold text-white">{team.name}</p>
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
    <Card className="p-3 text-center">
      <Icon size={14} className={`mx-auto mb-1 ${tone}`} />
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-mono text-lg font-bold text-white">{value}</p>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

function resultLabel(
  value: string,
  match: { home: { name: string }; away: { name: string } },
  t: (key: string, values?: Record<string, string | number>) => string
) {
  if (value === "home") return t("outcome.homeWin", { team: match.home.name });
  if (value === "away") return t("outcome.awayWin", { team: match.away.name });
  if (value === "draw") return t("outcome.draw");
  return "-";
}

function winnerLabel(
  value: string,
  match: { home: { name: string }; away: { name: string } }
) {
  if (value === "home") return match.home.name;
  if (value === "away") return match.away.name;
  return "-";
}

function goalLineLabel(
  value: string,
  t: (key: string, values?: Record<string, string | number>) => string
) {
  if (value === "over") return t("deep.over25");
  if (value === "under") return t("deep.under25");
  return "-";
}

function firstGoalLabel(
  value: string,
  match: { home: { name: string }; away: { name: string } },
  t: (key: string, values?: Record<string, string | number>) => string
) {
  if (value === "home") return match.home.name;
  if (value === "away") return match.away.name;
  if (value === "none") return t("deep.noGoal");
  return "-";
}
