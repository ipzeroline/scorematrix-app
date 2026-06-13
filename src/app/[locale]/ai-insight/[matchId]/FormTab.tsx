import { BarChart3, Goal, Shield, Swords, Trophy, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ApiFootballAIInsightDetail, ApiFootballTeamFormProfile, ApiFootballFixture } from "@/lib/api-football";
import { cn } from "@/lib/utils";
import {
  type LocalizedDetailCopy,
  type ExtendedBiggest,
  type ExtendedLeagueData,
  minuteBuckets,
  formatInteger,
  formatPercent,
  formatNullableNumber,
  formatMinuteStat,
  formatScoreline,
  formatTotalAndAverage,
  sumMinuteTotals,
  getProfileLineups,
  getProfileCards,
  resolveMinuteMap,
  resolveUnderOver,
} from "./_detail-shared";
import {
  SectionHeading,
  StatChip,
  TagPill,
  EmptyState,
  InfoRow,
} from "./_detail-ui";

type FormTabProps = {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
};

export default function FormTab({ fixture, insight, details }: FormTabProps) {
  return (
    <div className="space-y-5">
      <section className="grid items-start gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(12,17,31,0.96),rgba(7,10,18,0.98))] p-5">
          <SectionHeading
            icon={TrendingUp}
            title={details.formDeepDive}
            description={details.formSnapshot}
            accent="green"
          />
          <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
            <TeamFormCard
              name={fixture.home.name}
              profile={insight.formComparison.homeLastFive}
              tone="cyan"
              details={details}
            />
            <TeamFormCard
              name={fixture.away.name}
              profile={insight.formComparison.awayLastFive}
              tone="magenta"
              details={details}
            />
          </div>
          <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
            <GoalTimingCard
              title={`${fixture.home.name} · ${details.minuteGoals}`}
              profile={insight.formComparison.homeLastFive}
              color="cyan"
            />
            <GoalTimingCard
              title={`${fixture.away.name} · ${details.minuteGoals}`}
              profile={insight.formComparison.awayLastFive}
              color="magenta"
            />
          </div>
          <div className="mt-5">
            <TimingBreakdownSection
              title={details.goalsAgainstTiming}
              homeName={fixture.home.name}
              awayName={fixture.away.name}
              homeMap={resolveMinuteMap(insight.formComparison.homeLastFive, "against")}
              awayMap={resolveMinuteMap(insight.formComparison.awayLastFive, "against")}
            />
          </div>
        </Card>

        <div className="space-y-5">
          <SupplementalStatsCard
            title={details.frequentLineups}
            icon={Swords}
            tone="cyan"
            rows={[
              {
                label: fixture.home.name,
                content: getProfileLineups(insight.formComparison.homeLastFive)?.map((lineup) => (
                  <TagPill
                    key={`${fixture.home.name}-${lineup.formation}-${lineup.played ?? 0}`}
                    tone="cyan"
                  >
                    {lineup.formation} x{lineup.played ?? 0}
                  </TagPill>
                )),
              },
              {
                label: fixture.away.name,
                content: getProfileLineups(insight.formComparison.awayLastFive)?.map((lineup) => (
                  <TagPill
                    key={`${fixture.away.name}-${lineup.formation}-${lineup.played ?? 0}`}
                    tone="magenta"
                  >
                    {lineup.formation} x{lineup.played ?? 0}
                  </TagPill>
                )),
              },
            ]}
            empty={details.noPrediction}
          />
          <TrendCard
            title={details.biggestTrends}
            icon={Trophy}
            details={details}
            homeName={fixture.home.name}
            awayName={fixture.away.name}
            homeProfile={insight.formComparison.homeLastFive}
            awayProfile={insight.formComparison.awayLastFive}
          />
          <DisciplineCard
            title={details.specialStats}
            details={details}
            homeName={fixture.home.name}
            awayName={fixture.away.name}
            homeProfile={insight.formComparison.homeLastFive}
            awayProfile={insight.formComparison.awayLastFive}
          />
          <AdvancedStatsCard
            details={details}
            homeName={fixture.home.name}
            awayName={fixture.away.name}
            homeProfile={insight.formComparison.homeLastFive}
            awayProfile={insight.formComparison.awayLastFive}
          />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TeamFormCard({
  name,
  profile,
  tone,
  details,
}: {
  name: string;
  profile: ApiFootballTeamFormProfile | null;
  tone: "cyan" | "magenta";
  details: LocalizedDetailCopy;
}) {
  if (!profile) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <EmptyState label={details.noPrediction} />
      </div>
    );
  }

  const league = profile.league;
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";
  const rawForm = profile.form && /[WDL]/.test(String(profile.form)) ? profile.form : league?.form;
  const form = String(rawForm || "")
    .split("")
    .filter((value): value is "W" | "D" | "L" => value === "W" || value === "D" || value === "L");

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className={cn("text-lg font-bold", accent)}>{name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">
            {details.seasonPulse}
          </p>
        </div>
        <span className="font-mono text-sm text-gray-400">
          {formatInteger(profile.played ?? league?.fixtures?.played?.total ?? 0)}
        </span>
      </div>

      {form.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {form.map((result, index) => (
            <span
              key={`${name}-${result}-${index}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black",
                result === "W" && "bg-green-500/18 text-green-300",
                result === "D" && "bg-amber-500/18 text-amber-300",
                result === "L" && "bg-red-500/18 text-red-300"
              )}
            >
              {result}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatChip label={details.formSnapshot} value={profile.form ?? league?.form ?? "-"} />
        <StatChip label={details.attack} value={formatPercent(profile.att)} />
        <StatChip label={details.defense} value={formatPercent(profile.def)} />
        <StatChip label={details.played} value={league?.fixtures?.played?.total} />
        <StatChip label={details.wins} value={league?.fixtures?.wins?.total} />
        <StatChip label={details.draws} value={league?.fixtures?.draws?.total} />
        <StatChip label={details.losses} value={league?.fixtures?.loses?.total} />
        <StatChip
          label={details.goalsFor}
          value={formatTotalAndAverage(
            league?.goals?.for?.total?.total,
            league?.goals?.for?.average?.total,
            details
          )}
        />
        <StatChip
          label={details.goalsAgainst}
          value={formatTotalAndAverage(
            league?.goals?.against?.total?.total,
            league?.goals?.against?.average?.total,
            details
          )}
        />
      </div>
    </div>
  );
}

function GoalTimingCard({
  title,
  profile,
  color,
}: {
  title: string;
  profile: ApiFootballTeamFormProfile | null;
  color: "cyan" | "magenta";
}) {
  const minuteMap = resolveMinuteMap(profile, "for");
  const buckets = minuteBuckets.map((bucket) => ({
    bucket,
    total: minuteMap?.[bucket]?.total ?? 0,
    percentage: minuteMap?.[bucket]?.percentage ?? null,
  }));
  const maxTotal = Math.max(1, ...buckets.map((item) => item.total));
  const barClass = color === "cyan" ? "bg-cyan-400" : "bg-magenta";

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex items-center gap-2">
        <Goal size={15} className={color === "cyan" ? "text-cyan-300" : "text-magenta"} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="flex h-44 items-end gap-2">
        {buckets.map((item) => (
          <div key={item.bucket} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] font-mono text-gray-500">{item.total}</span>
            <div className="flex h-28 w-full items-end rounded-full bg-white/6 p-1">
              <div
                className={cn("w-full rounded-full transition-all duration-500", barClass)}
                style={{ height: `${Math.max(8, Math.round((item.total / maxTotal) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">{item.bucket}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimingBreakdownSection({
  title,
  homeName,
  awayName,
  homeMap,
  awayMap,
}: {
  title: string;
  homeName: string;
  awayName: string;
  homeMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
  awayMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MinuteList name={homeName} minuteMap={homeMap} tone="cyan" />
        <MinuteList name={awayName} minuteMap={awayMap} tone="magenta" />
      </div>
    </div>
  );
}

function MinuteList({
  name,
  minuteMap,
  tone,
}: {
  name: string;
  minuteMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <h4 className={cn("text-sm font-bold", accent)}>{name}</h4>
      <div className="mt-3 grid gap-2 text-sm text-gray-300">
        {minuteBuckets.map((bucket) => (
          <InfoRow
            key={`${name}-${bucket}`}
            label={bucket}
            value={formatMinuteStat(minuteMap?.[bucket])}
          />
        ))}
      </div>
    </div>
  );
}

function SupplementalStatsCard({
  title,
  icon: Icon,
  tone,
  rows,
  empty,
}: {
  title: string;
  icon: LucideIcon;
  tone: "cyan" | "magenta";
  rows: Array<{ label: string; content: React.ReactNode[] | undefined }>;
  empty: string;
}) {
  const iconClass = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <div className="flex items-center gap-2">
        <Icon size={15} className={iconClass} />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{row.label}</p>
            <div className="flex flex-wrap gap-2">
              {row.content && row.content.length > 0 ? row.content : <TagPill tone="neutral">{empty}</TagPill>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TrendCard({
  title,
  icon: Icon,
  details,
  homeName,
  awayName,
  homeProfile,
  awayProfile,
}: {
  title: string;
  icon: LucideIcon;
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
  homeProfile: ApiFootballTeamFormProfile | null;
  awayProfile: ApiFootballTeamFormProfile | null;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-amber-300" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">
        <TrendColumn name={homeName} details={details} profile={homeProfile} tone="cyan" />
        <TrendColumn name={awayName} details={details} profile={awayProfile} tone="magenta" />
      </div>
    </Card>
  );
}

function TrendColumn({
  name,
  details,
  profile,
  tone,
}: {
  name: string;
  details: LocalizedDetailCopy;
  profile: ApiFootballTeamFormProfile | null;
  tone: "cyan" | "magenta";
}) {
  const biggest =
    (!Array.isArray(profile?.biggest) ? (profile?.biggest as ExtendedBiggest | undefined) : undefined) ??
    (profile?.league?.biggest as ExtendedBiggest | undefined);
  const streak = biggest?.streak;
  const goals = biggest?.goals;
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
      <div className="mt-3 grid gap-2 text-sm text-gray-300">
        <InfoRow label={details.biggestWin} value={formatScoreline(biggest?.wins)} />
        <InfoRow label={details.biggestLoss} value={formatScoreline(biggest?.loses)} />
        <InfoRow label={details.biggestGoalsFor} value={formatNullableNumber(goals?.for?.home ?? goals?.for?.away)} />
        <InfoRow label={details.biggestGoalsAgainst} value={formatNullableNumber(goals?.against?.home ?? goals?.against?.away)} />
        <InfoRow label={details.winStreak} value={formatNullableNumber(streak?.wins)} />
        <InfoRow label={details.drawStreak} value={formatNullableNumber(streak?.draws)} />
        <InfoRow label={details.lossStreak} value={formatNullableNumber(streak?.loses)} />
      </div>
    </div>
  );
}

function DisciplineCard({
  title,
  details,
  homeName,
  awayName,
  homeProfile,
  awayProfile,
}: {
  title: string;
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
  homeProfile: ApiFootballTeamFormProfile | null;
  awayProfile: ApiFootballTeamFormProfile | null;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <div className="flex items-center gap-2">
        <Shield size={15} className="text-green-300" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">
        <DisciplineColumn
          name={homeName}
          details={details}
          profile={homeProfile}
          tone="cyan"
        />
        <DisciplineColumn
          name={awayName}
          details={details}
          profile={awayProfile}
          tone="magenta"
        />
      </div>
    </Card>
  );
}

function DisciplineColumn({
  name,
  details,
  profile,
  tone,
}: {
  name: string;
  details: LocalizedDetailCopy;
  profile: ApiFootballTeamFormProfile | null;
  tone: "cyan" | "magenta";
}) {
  const league = profile?.league as ExtendedLeagueData | undefined;
  const cards = getProfileCards(profile);
  const yellowCards = sumMinuteTotals(cards?.yellow);
  const cleanSheets = profile?.clean_sheet?.total ?? league?.clean_sheet?.total;
  const failedToScore = profile?.failed_to_score?.total ?? league?.failed_to_score?.total;
  const penalties = (!Array.isArray(profile?.penalty) ? profile?.penalty : undefined) ?? league?.penalty;
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
      <div className="mt-3 grid gap-2 text-sm text-gray-300">
        <InfoRow label={details.cardsLabel} value={formatNullableNumber(yellowCards)} />
        <InfoRow label={details.cleanSheets} value={formatNullableNumber(cleanSheets)} />
        <InfoRow label={details.failedToScore} value={formatNullableNumber(failedToScore)} />
        <InfoRow
          label={details.penalties}
          value={`${formatNullableNumber(penalties?.scored?.total)} / ${formatNullableNumber(
            penalties?.total
          )}`}
        />
      </div>
    </div>
  );
}

function AdvancedStatsCard({
  details,
  homeName,
  awayName,
  homeProfile,
  awayProfile,
}: {
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
  homeProfile: ApiFootballTeamFormProfile | null;
  awayProfile: ApiFootballTeamFormProfile | null;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <div className="flex items-center gap-2">
        <BarChart3 size={15} className="text-cyan-300" />
        <h2 className="text-sm font-semibold text-white">{details.advancedStats}</h2>
      </div>
      <div className="mt-4 space-y-5">
        <UnderOverSection
          name={homeName}
          profile={homeProfile}
          details={details}
          tone="cyan"
        />
        <UnderOverSection
          name={awayName}
          profile={awayProfile}
          details={details}
          tone="magenta"
        />
        <CardsBreakdownSection
          details={details}
          homeName={homeName}
          awayName={awayName}
          homeProfile={homeProfile}
          awayProfile={awayProfile}
        />
      </div>
    </Card>
  );
}

function UnderOverSection({
  name,
  profile,
  details,
  tone,
}: {
  name: string;
  profile: ApiFootballTeamFormProfile | null;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const goalsForUnderOver = resolveUnderOver(profile, "for");
  const goalsAgainstUnderOver = resolveUnderOver(profile, "against");
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";
  const ranges = ["0.5", "1.5", "2.5", "3.5", "4.5"] as const;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">{details.underOver}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{details.goalsFor}</p>
          <div className="grid gap-2 text-sm text-gray-300">
            {ranges.map((range) => (
              <InfoRow
                key={`${name}-for-${range}`}
                label={range}
                value={`${formatNullableNumber(goalsForUnderOver?.[range]?.over)} / ${formatNullableNumber(
                  goalsForUnderOver?.[range]?.under
                )}`}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{details.goalsAgainst}</p>
          <div className="grid gap-2 text-sm text-gray-300">
            {ranges.map((range) => (
              <InfoRow
                key={`${name}-against-${range}`}
                label={range}
                value={`${formatNullableNumber(goalsAgainstUnderOver?.[range]?.over)} / ${formatNullableNumber(
                  goalsAgainstUnderOver?.[range]?.under
                )}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardsBreakdownSection({
  details,
  homeName,
  awayName,
  homeProfile,
  awayProfile,
}: {
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
  homeProfile: ApiFootballTeamFormProfile | null;
  awayProfile: ApiFootballTeamFormProfile | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">{details.cardsBreakdown}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CardsList
          name={homeName}
          yellowMap={getProfileCards(homeProfile)?.yellow}
          redMap={getProfileCards(homeProfile)?.red}
          details={details}
          tone="cyan"
        />
        <CardsList
          name={awayName}
          yellowMap={getProfileCards(awayProfile)?.yellow}
          redMap={getProfileCards(awayProfile)?.red}
          details={details}
          tone="magenta"
        />
      </div>
    </div>
  );
}

function CardsList({
  name,
  yellowMap,
  redMap,
  details,
  tone,
}: {
  name: string;
  yellowMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
  redMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <h4 className={cn("text-sm font-bold", accent)}>{name}</h4>
      <div className="mt-3 space-y-3">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{details.cardsLabel}</p>
          <div className="grid gap-2 text-sm text-gray-300">
            {minuteBuckets.map((bucket) => (
              <InfoRow
                key={`${name}-yellow-${bucket}`}
                label={bucket}
                value={formatMinuteStat(yellowMap?.[bucket])}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{details.redCards}</p>
          <div className="grid gap-2 text-sm text-gray-300">
            {minuteBuckets.map((bucket) => (
              <InfoRow
                key={`${name}-red-${bucket}`}
                label={bucket}
                value={formatMinuteStat(redMap?.[bucket])}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
