import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Flame,
  Gauge,
  ListChecks,
  ListPlus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import { formatMatchDateTimeWithZone } from "@/lib/utils";
import {
  ApiFootballError,
  type ApiFootballAIInsight,
  type ApiFootballEvent,
  type ApiFootballFixture,
  type ApiFootballLineup,
  type ApiFootballPlayerStats,
  type ApiFootballTeamStatistics,
  getApiFootballAIInsights,
  getApiFootballFixtureDetails,
  getApiFootballH2H,
} from "@/lib/api-football";
import { extractApiFixtureId } from "@/lib/football-slugs";
import { cn } from "@/lib/utils";
import type { AIInsight } from "@/types/ai-insight";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
};

type DetailCopy = (typeof detailCopy)["th"];

type DetailInsight = Omit<
  AIInsight,
  | "confidenceScore"
  | "homeWinProbability"
  | "drawProbability"
  | "awayWinProbability"
  | "heatMeter"
  | "homeAdvantageFactor"
  | "formComparison"
  | "injuryImpact"
  | "communitySentiment"
> & {
  confidenceScore: number | null;
  homeWinProbability: number | null;
  drawProbability: number | null;
  awayWinProbability: number | null;
  heatMeter: number | null;
  homeAdvantageFactor: number | null;
  formComparison: {
    homeFormIndex: number | null;
    awayFormIndex: number | null;
    homeLastFive: Array<"W" | "D" | "L">;
    awayLastFive: Array<"W" | "D" | "L">;
  };
  communitySentiment: ApiFootballAIInsight["communitySentiment"];
};

type DetailContext = {
  kind: "api";
  fixture: ApiFootballFixture;
  insight: DetailInsight | null;
  api: {
    events: ApiFootballEvent[];
    statistics: ApiFootballTeamStatistics[];
    lineups: ApiFootballLineup[];
    playerStats: ApiFootballPlayerStats[];
    h2h: ApiFootballFixture[];
  };
};

const localeMap: Record<string, string> = {
  th: "th-TH",
  en: "en-US",
  lo: "lo-LA",
  my: "my-MM",
  km: "km-KH",
  zh: "zh-CN",
};

const detailCopy = {
  th: {
    back: "กลับ AI Insight",
    matchTimeline: "เหตุการณ์ในเกม",
    teamStats: "สถิติทีม",
    lineupPreview: "รายชื่อและแผนการเล่น",
    h2h: "พบกันล่าสุด",
    playerData: "ข้อมูลผู้เล่น",
    score: "สกอร์",
    venue: "สนาม",
    round: "รอบ",
    formIndex: "ดัชนีฟอร์ม",
    homeAdvantage: "ความได้เปรียบเจ้าบ้าน",
    modelSignals: "สัญญาณที่โมเดลใช้",
    events: "เหตุการณ์",
    stats: "สถิติ",
    lineups: "ไลน์อัป",
    players: "ผู้เล่น",
    possession: "ครองบอล",
    shots: "ยิงทั้งหมด",
    shotsOnGoal: "ยิงเข้ากรอบ",
    corners: "เตะมุม",
    fouls: "ฟาวล์",
    cards: "ใบเหลือง/แดง",
    startingXi: "ตัวจริง",
    substitutes: "สำรอง",
    noData: "ไม่มีข้อมูล",
  },
  en: {
    back: "Back to AI Insight",
    matchTimeline: "Match timeline",
    teamStats: "Team statistics",
    lineupPreview: "Lineups and shape",
    h2h: "Recent head-to-head",
    playerData: "Player data",
    score: "Score",
    venue: "Venue",
    round: "Round",
    formIndex: "Form index",
    homeAdvantage: "Home advantage",
    modelSignals: "Model signals",
    events: "Events",
    stats: "Stats",
    lineups: "Lineups",
    players: "Players",
    possession: "Possession",
    shots: "Total shots",
    shotsOnGoal: "Shots on goal",
    corners: "Corners",
    fouls: "Fouls",
    cards: "Yellow/red",
    startingXi: "Starting XI",
    substitutes: "Substitutes",
    noData: "No data",
  },
  lo: {
    back: "ກັບໄປ AI Insight",
    matchTimeline: "ເຫດການໃນເກມ",
    teamStats: "ສະຖິຕິທີມ",
    lineupPreview: "ລາຍຊື່ ແລະ ແຜນ",
    h2h: "ພົບກັນຫຼ້າສຸດ",
    playerData: "ຂໍ້ມູນນັກເຕະ",
    score: "ຄະແນນ",
    venue: "ສະໜາມ",
    round: "ຮອບ",
    formIndex: "ດັດຊະນີຟອມ",
    homeAdvantage: "ຄວາມໄດ້ປຽບເຈົ້າບ້ານ",
    modelSignals: "ສັນຍານຂອງໂມເດວ",
    events: "ເຫດການ",
    stats: "ສະຖິຕິ",
    lineups: "ໄລນອັບ",
    players: "ນັກເຕະ",
    possession: "ຄອງບານ",
    shots: "ຍິງທັງໝົດ",
    shotsOnGoal: "ຍິງເຂົ້າກອບ",
    corners: "ລູກເຕະມຸມ",
    fouls: "ຟາວ",
    cards: "ເຫຼືອງ/ແດງ",
    startingXi: "ຕົວຈິງ",
    substitutes: "ສໍາຮອງ",
    noData: "ບໍ່ມີຂໍ້ມູນ",
  },
  my: {
    back: "AI Insight သို့ပြန်ရန်",
    matchTimeline: "ပွဲဖြစ်ရပ်များ",
    teamStats: "အသင်းစာရင်းအင်း",
    lineupPreview: "လူစာရင်းနှင့်ဖွဲ့စည်းပုံ",
    h2h: "နောက်ဆုံးတွေ့ဆုံမှု",
    playerData: "ကစားသမားဒေတာ",
    score: "ရလဒ်",
    venue: "ကွင်း",
    round: "အဆင့်",
    formIndex: "ဖောင်မ်ညွှန်းကိန်း",
    homeAdvantage: "အိမ်ကွင်းအားသာချက်",
    modelSignals: "မော်ဒယ် signal များ",
    events: "ဖြစ်ရပ်",
    stats: "စာရင်းအင်း",
    lineups: "လူစာရင်း",
    players: "ကစားသမား",
    possession: "ဘောလုံးပိုင်ဆိုင်မှု",
    shots: "စုစုပေါင်းကန်ချက်",
    shotsOnGoal: "ဂိုးပေါက်တည့်",
    corners: "ထောင့်ကန်ဘော",
    fouls: "ပြစ်ဒဏ်ဘော",
    cards: "အဝါ/အနီ",
    startingXi: "ပွဲထွက်",
    substitutes: "အရန်",
    noData: "ဒေတာမရှိပါ",
  },
  km: {
    back: "ត្រឡប់ទៅ AI Insight",
    matchTimeline: "ព្រឹត្តិការណ៍ប្រកួត",
    teamStats: "ស្ថិតិក្រុម",
    lineupPreview: "ជម្រើសកីឡាករ និងទម្រង់",
    h2h: "ជួបគ្នាថ្មីៗ",
    playerData: "ទិន្នន័យកីឡាករ",
    score: "ពិន្ទុ",
    venue: "ទីលាន",
    round: "ជុំ",
    formIndex: "សន្ទស្សន៍ទម្រង់",
    homeAdvantage: "អត្ថប្រយោជន៍ម្ចាស់ផ្ទះ",
    modelSignals: "សញ្ញាម៉ូដែល",
    events: "ព្រឹត្តិការណ៍",
    stats: "ស្ថិតិ",
    lineups: "ជម្រើសកីឡាករ",
    players: "កីឡាករ",
    possession: "គ្រប់គ្រងបាល់",
    shots: "ស៊ុតសរុប",
    shotsOnGoal: "ស៊ុតចំគោលដៅ",
    corners: "បាល់ជ្រុង",
    fouls: "កំហុស",
    cards: "លឿង/ក្រហម",
    startingXi: "១១នាក់ដំបូង",
    substitutes: "បម្រុង",
    noData: "គ្មានទិន្នន័យ",
  },
  zh: {
    back: "返回 AI Insight",
    matchTimeline: "比赛事件",
    teamStats: "球队统计",
    lineupPreview: "阵容与阵型",
    h2h: "近期交锋",
    playerData: "球员数据",
    score: "比分",
    venue: "场地",
    round: "轮次",
    formIndex: "状态指数",
    homeAdvantage: "主场优势",
    modelSignals: "模型信号",
    events: "事件",
    stats: "统计",
    lineups: "阵容",
    players: "球员",
    possession: "控球率",
    shots: "射门",
    shotsOnGoal: "射正",
    corners: "角球",
    fouls: "犯规",
    cards: "黄/红牌",
    startingXi: "首发",
    substitutes: "替补",
    noData: "暂无数据",
  },
};

export default async function AIInsightDetailPage({ params }: Props) {
  const { locale, matchId } = await params;
  const copy = getAIInsightPageCopy(locale);
  const details = detailCopy[locale as keyof typeof detailCopy] ?? detailCopy.th;
  const context = await getDetailContext(matchId);

  if (!context) notFound();

  const fixture = context.fixture;
  const insight = context.insight;
  const communitySentiment = insight?.communitySentiment ?? null;
  const apiCounts = getApiCounts(context);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-3 sm:px-4 md:px-6">
      <Link
        href={`/${locale}/ai-insight`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-cyan-300"
      >
        <ArrowLeft size={16} />
        {details.back}
      </Link>

      <section className="overflow-hidden rounded-xl border border-gray-800 bg-[#101018]">
        <div className="border-b border-gray-800 bg-gradient-to-r from-cyan-500/10 via-[#12121a] to-magenta-500/10 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles size={13} />
                    {copy.title}
                  </span>
                </Badge>
                <StatusBadge status={fixture.status} />
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-white md:text-4xl">
                {fixture.home.name} vs {fixture.away.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-2 text-gray-400">
                  <ApiLeagueLogo name={fixture.league.name} logo={fixture.league.logo} size="sm" />
                  {fixture.league.name}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock size={14} />
                  {copy.labels.kickoff}: {formatDateTime(fixture.kickoffTime, locale)}
                </span>
                <span>{details.round}: {fixture.league.round}</span>
                <span>{details.venue}: {fixture.venue || details.noData}</span>
              </div>
            </div>

            <div className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-gray-800 bg-black/25 p-2.5 text-center sm:gap-3 sm:p-3">
              <TeamBlock team={fixture.home} tone="cyan" />
              <div className="shrink-0">
                <p className="font-mono text-lg font-black text-white sm:text-2xl">
                  {fixture.score.home === null
                    ? "VS"
                    : `${fixture.score.home} - ${fixture.score.away}`}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-600">
                  {details.score}
                </p>
              </div>
              <TeamBlock team={fixture.away} tone="magenta" />
            </div>
          </div>
        </div>

        {insight ? (
          <div className="grid gap-4 p-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-white">
                  {details.modelSignals}
                </h2>
                <span className="text-xs text-gray-500">
                  {copy.labels.generated}: {formatDateTime(insight.generatedAt, locale)}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <SignalTile icon={Gauge} label={copy.labels.confidence} value={formatOptionalMetric(insight.confidenceScore, "%")} tone="text-cyan-300" />
                <SignalTile icon={Flame} label={copy.labels.heat} value={formatOptionalMetric(insight.heatMeter, "/10")} tone="text-amber-300" />
                <SignalTile icon={TrendingUp} label={details.formIndex} value={formatFormIndex(insight.formComparison.homeFormIndex, insight.formComparison.awayFormIndex)} tone="text-green-300" />
                <SignalTile icon={Activity} label={details.homeAdvantage} value={formatOptionalMetric(insight.homeAdvantageFactor === null ? null : Math.round(insight.homeAdvantageFactor * 100), "%")} tone="text-purple-300" />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ProbabilityCard label={copy.labels.homeWin} value={insight.homeWinProbability} color="cyan" />
                <ProbabilityCard label={copy.labels.draw} value={insight.drawProbability} color="purple" />
                <ProbabilityCard label={copy.labels.awayWin} value={insight.awayWinProbability} color="magenta" />
              </div>
            </Card>

            {communitySentiment && <Card className="p-4">
              <h2 className="mb-3 text-sm font-semibold text-white">
                {copy.labels.community}
              </h2>
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                <Users size={14} className="text-purple-300" />
                {communitySentiment.totalVotes.toLocaleString(localeMap[locale] ?? "th-TH")} {copy.labels.votes}
              </div>
              <div className="space-y-3">
                <ProbabilityRow label={copy.labels.home} value={communitySentiment.homePercentage} color="cyan" />
                <ProbabilityRow label={copy.labels.draw} value={communitySentiment.drawPercentage} color="purple" />
                <ProbabilityRow label={copy.labels.away} value={communitySentiment.awayPercentage} color="magenta" />
              </div>
            </Card>}
          </div>
        ) : (
          <div className="p-4">
            <Card className="flex items-start gap-3 border-cyan-500/20 bg-cyan-500/5 p-4">
              <Sparkles size={20} className="mt-0.5 shrink-0 text-cyan-300" />
              <div>
                <h2 className="text-sm font-semibold text-white">{copy.empty.title}</h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">{copy.empty.description}</p>
              </div>
            </Card>
          </div>
        )}
      </section>

      {insight?.upsetAlert && insight.upsetDescription && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <h2 className="text-sm font-semibold text-red-300">
              {copy.labels.upsetAlert}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              {insight.upsetDescription}
            </p>
          </div>
        </div>
      )}

      {insight && hasFormData(insight) && <section>
        <Card className="p-4">
          <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
            <TrendingUp size={15} className="text-cyan-300" />
            {copy.labels.form}
          </h2>
          <div className="space-y-3">
            <FormRow label={fixture.home.name} results={insight.formComparison.homeLastFive} tone="cyan" />
            <FormRow label={fixture.away.name} results={insight.formComparison.awayLastFive} tone="magenta" />
          </div>
        </Card>
      </section>}

      <section className={`grid gap-4 ${insight && insight.keyFactors.length > 0 ? "lg:grid-cols-[1fr_0.9fr]" : ""}`}>
        {insight && insight.keyFactors.length > 0 && <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">
            {copy.labels.keyFactors}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {insight.keyFactors.map((factor) => (
              <li key={factor} className="flex items-start gap-2 rounded-lg border border-gray-800 bg-[#0a0a0f] p-3 text-sm leading-6 text-gray-400">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                {factor}
              </li>
            ))}
          </ul>
        </Card>}

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">
            {details.h2h}
          </h2>
          <div className="space-y-2">
            {renderH2H(context, locale, details.noData)}
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex justify-end">
          <div className="grid grid-cols-4 gap-2 text-center">
            <ApiCount label={details.events} value={apiCounts.events} />
            <ApiCount label={details.stats} value={apiCounts.stats} />
            <ApiCount label={details.lineups} value={apiCounts.lineups} />
            <ApiCount label={details.players} value={apiCounts.players} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
              <ListChecks size={15} className="text-cyan-300" />
              {details.matchTimeline}
            </h3>
            <Timeline context={context} empty={details.noData} />
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
              <BarChart3 size={15} className="text-purple-300" />
              {details.teamStats}
            </h3>
            <StatsPanel context={context} labels={details} />
          </Card>
        </div>

        <LiveLineupsPanel
          lineups={context.api.lineups}
          locale={locale}
          season={context.fixture.league.season ?? new Date().getFullYear()}
          labels={getLineupLabels(locale, details)}
        />
        <LivePlayerStatsPanel
          playerStats={context.api.playerStats}
          locale={locale}
          season={context.fixture.league.season ?? new Date().getFullYear()}
          labels={getPlayerStatsLabels(locale, details)}
        />
      </section>
    </div>
  );
}

async function getDetailContext(matchId: string): Promise<DetailContext | null> {
  const fixtureId = extractApiFixtureId(matchId);
  if (!fixtureId) return null;

  try {
    const [details, groupedInsights] = await Promise.all([
      getApiFootballFixtureDetails(fixtureId),
      getApiFootballAIInsights(),
    ]);
    const apiInsight = [
      ...groupedInsights.live,
      ...groupedInsights.highConfidence,
      ...groupedInsights.upsetAlert,
    ].find((item) => item.provider_id === fixtureId);

    const h2h =
      details.fixture.home.apiTeamId && details.fixture.away.apiTeamId
        ? await getApiFootballH2H(details.fixture.home.apiTeamId, details.fixture.away.apiTeamId)
        : [];

    return {
      kind: "api",
      fixture: details.fixture,
      insight:
        apiInsight && hasCompleteAIProbabilities(apiInsight)
          ? buildApiInsight(apiInsight, details.fixture, h2h)
          : null,
      api: {
        events: details.events,
        statistics: details.statistics,
        lineups: details.lineups,
        playerStats: details.playerStats,
        h2h,
      },
    };
  } catch (error) {
    if (error instanceof ApiFootballError) return null;
    throw error;
  }
}

function buildApiInsight(
  insight: ApiFootballAIInsight,
  fixture: ApiFootballFixture,
  h2h: ApiFootballFixture[]
): DetailInsight {
  return {
    id: `api-insight-${insight.provider_id}`,
    matchId: fixture.id,
    confidenceScore: insight.confidenceScore,
    homeWinProbability: insight.homeWinProbability,
    drawProbability: insight.drawProbability,
    awayWinProbability: insight.awayWinProbability,
    heatMeter: insight.heatMeter,
    homeAdvantageFactor: null,
    formComparison: {
      homeFormIndex: null,
      awayFormIndex: null,
      homeLastFive: resultSequenceFromFixtures(h2h, fixture.home.name),
      awayLastFive: resultSequenceFromFixtures(h2h, fixture.away.name),
    },
    headToHead: h2h.slice(0, 5).map((match) => ({
      date: match.kickoffTime,
      competition: match.league.name,
      homeTeam: match.home.name,
      awayTeam: match.away.name,
      score: `${match.score.home ?? "-"}-${match.score.away ?? "-"}`,
    })),
    upsetAlert: insight.upsetAlert,
    upsetDescription: insight.upsetAlert ? insight.apiAdvice : null,
    communitySentiment: insight.communitySentiment,
    keyFactors: insight.keyFactors,
    generatedAt: insight.generatedAt ?? insight.starts_at,
  };
}

function resultSequenceFromFixtures(fixtures: ApiFootballFixture[], teamName: string) {
  return fixtures
    .filter((fixture) => fixture.score.home !== null && fixture.score.away !== null)
    .slice(0, 5)
    .map((fixture): "W" | "D" | "L" => {
    const isHome = fixture.home.name === teamName;
    const own = isHome ? fixture.score.home! : fixture.score.away!;
    const other = isHome ? fixture.score.away! : fixture.score.home!;
    if (own > other) return "W";
    if (own < other) return "L";
    return "D";
  });
}

function hasCompleteAIProbabilities(insight: ApiFootballAIInsight): boolean {
  return [
    insight.confidenceScore,
    insight.homeWinProbability,
    insight.drawProbability,
    insight.awayWinProbability,
  ].every((value) => typeof value === "number");
}

function hasFormData(insight: DetailInsight): boolean {
  return (
    insight.formComparison.homeLastFive.length > 0 ||
    insight.formComparison.awayLastFive.length > 0
  );
}

function getApiCounts(context: DetailContext) {
  return {
    events: context.api.events.length,
    stats: context.api.statistics.reduce((total, item) => total + item.statistics.length, 0),
    lineups: context.api.lineups.length,
    players: context.api.playerStats.reduce((total, team) => total + team.players.length, 0),
  };
}

function formatDateTime(value: string, locale: string) {
  return formatMatchDateTimeWithZone(value, localeMap[locale] ?? "th-TH");
}

function formatOptionalMetric(value: number | null, suffix: string) {
  return value === null ? "-" : `${value}${suffix}`;
}

function formatFormIndex(home: number | null, away: number | null) {
  return home === null || away === null ? "-" : `${home}-${away}`;
}

function TeamBlock({
  team,
  tone,
}: {
  team: ApiFootballFixture["home"];
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "cyan" : "magenta";
  return (
    <div className="w-full min-w-0">
      <div className="flex justify-center">
        <ApiTeamLogo name={team.name} logo={team.logo} size="md" accent={accent} />
      </div>
      <p className={`mt-2 w-full break-words text-center text-[11px] font-semibold leading-tight ${tone === "cyan" ? "text-cyan-200" : "text-magenta-200"}`}>
        {team.name}
      </p>
    </div>
  );
}

function SignalTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
      <Icon size={15} className={tone} />
      <p className="mt-2 font-mono text-xl font-bold text-white">{value}</p>
      <p className="mt-1 text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function ProbabilityCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: "cyan" | "purple" | "magenta";
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
      <div className="mb-2 flex justify-between gap-3 text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-mono text-gray-200">{formatOptionalMetric(value, "%")}</span>
      </div>
      <ProgressBar value={value ?? 0} color={color} size="md" />
    </div>
  );
}

function ProbabilityRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "cyan" | "purple" | "magenta";
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-mono text-gray-300">{value}%</span>
      </div>
      <ProgressBar value={value} color={color} size="sm" />
    </div>
  );
}

function FormRow({
  label,
  results,
  tone,
}: {
  label: string;
  results: Array<"W" | "D" | "L">;
  tone: "cyan" | "magenta";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`truncate text-sm ${tone === "cyan" ? "text-cyan-300" : "text-magenta-300"}`}>
        {label}
      </span>
      <div className="flex gap-1">
        {results.map((result, index) => (
          <span
            key={`${label}-${index}`}
            className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${formTone(result)}`}
          >
            {result}
          </span>
        ))}
      </div>
    </div>
  );
}

function formTone(result: "W" | "D" | "L") {
  if (result === "W") return "bg-green-500/15 text-green-300";
  if (result === "D") return "bg-amber-500/15 text-amber-300";
  return "bg-red-500/15 text-red-300";
}

function ApiCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] px-3 py-2">
      <p className="font-mono text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function Timeline({ context, empty }: { context: DetailContext; empty: string }) {
  if (context.api.events.length === 0) return <EmptyText label={empty} />;
  return (
    <div className="space-y-2">
      {context.api.events.slice(0, 12).map((event, index) => (
        <div key={`${event.time.elapsed}-${event.type}-${index}`} className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-mono font-bold text-cyan-300">
              {event.time.elapsed}{event.time.extra ? `+${event.time.extra}` : ""}&apos;
            </span>
            <span className="text-gray-500">{event.team.name}</span>
          </div>
          <p className="mt-1 text-sm text-white">{event.type} - {event.detail}</p>
          <p className="mt-1 text-xs text-gray-500">{event.player.name ?? "-"}</p>
        </div>
      ))}
    </div>
  );
}

function StatsPanel({
  context,
  labels,
}: {
  context: DetailContext;
  labels: DetailCopy;
}) {
  if (context.api.statistics.length === 0) return <EmptyText label={labels.noData} />;
  const home = context.api.statistics[0];
  const away = context.api.statistics[1];
  return (
    <div className="space-y-3">
      {[
        ["Ball Possession", labels.possession],
        ["Total Shots", labels.shots],
        ["Shots on Goal", labels.shotsOnGoal],
        ["Corner Kicks", labels.corners],
        ["Fouls", labels.fouls],
        ["Yellow Cards", labels.cards],
      ].map(([type, label]) => (
        <CompareStat
          key={type}
          label={label}
          home={statDisplay(home, type)}
          away={statDisplay(away, type)}
        />
      ))}
    </div>
  );
}

function statDisplay(stats: ApiFootballTeamStatistics | undefined, type: string) {
  const value = stats?.statistics.find((item) => item.type === type)?.value;
  return value ?? "-";
}

function CompareStat({
  label,
  home,
  away,
}: {
  label: string;
  home: string | number;
  away: string | number;
}) {
  return (
    <div className="grid grid-cols-[70px_1fr_70px] items-center gap-3 text-sm">
      <span className="font-mono text-cyan-300">{home}</span>
      <span className="text-center text-xs text-gray-500">{label}</span>
      <span className="text-right font-mono text-magenta-300">{away}</span>
    </div>
  );
}

function LiveLineupsPanel({
  lineups,
  locale,
  season,
  labels,
}: {
  lineups: ApiFootballLineup[];
  locale: string;
  season: number;
  labels: {
    empty: string;
    coach: string;
    unavailable: string;
    startingXI: string;
    substitutes: string;
    formationPitch: string;
    noGridData: string;
  };
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {lineups.length === 0 ? (
        <Card className="p-4 lg:col-span-2">
          <EmptyText label={labels.empty} />
        </Card>
      ) : (
        lineups.map((lineup, index) => (
          <Card key={lineup.team.id} className="overflow-hidden p-0">
            <div
              className={cn(
                "flex items-center justify-between gap-3 border-b border-gray-800 px-3 py-3 sm:px-4",
                index === 0 ? "bg-cyan-500/10" : "bg-magenta-500/10"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ApiTeamLogo
                  name={lineup.team.name}
                  logo={lineup.team.logo}
                  size="sm"
                  accent={index === 0 ? "cyan" : "magenta"}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-white">
                    {lineup.team.name}
                  </h2>
                  <p className="truncate text-[10px] text-gray-500">
                    {labels.coach}: {lineup.coach.name ?? labels.unavailable}
                  </p>
                </div>
              </div>
              <Badge variant={index === 0 ? "cyan" : "magenta"} size="md" className="shrink-0">
                {lineup.formation ?? "N/A"}
              </Badge>
            </div>

            <div className="space-y-4 p-3 sm:p-4">
              <FormationPitch
                lineup={lineup}
                tone={index === 0 ? "cyan" : "magenta"}
                title={labels.formationPitch}
                emptyLabel={labels.noGridData}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="min-w-0">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <ListChecks size={14} className="shrink-0 text-cyan-300" aria-hidden="true" />
                    <span className="min-w-0 truncate">{labels.startingXI}</span>
                  </h3>
                  <div className="grid gap-2">
                    {lineup.startXI.map(({ player }) => (
                      <PlayerRow
                        key={`${player.id}-${player.number}`}
                        player={player}
                        locale={locale}
                        season={season}
                      />
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <ListPlus size={14} className="shrink-0 text-green-300" aria-hidden="true" />
                    <span className="min-w-0 truncate">{labels.substitutes}</span>
                  </h3>
                  <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {lineup.substitutes.map(({ player }) => (
                      <PlayerRow
                        key={`${player.id}-${player.number}`}
                        player={player}
                        locale={locale}
                        season={season}
                        compact
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </section>
  );
}

function FormationPitch({
  lineup,
  tone,
  title,
  emptyLabel,
}: {
  lineup: ApiFootballLineup;
  tone: "cyan" | "magenta";
  title: string;
  emptyLabel: string;
}) {
  const players = lineup.startXI
    .map(({ player }) => ({
      ...player,
      gridPosition: parseGridPosition(player.grid),
    }))
    .filter((player) => player.gridPosition);

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <ShieldCheck size={14} className="shrink-0 text-emerald-300" aria-hidden="true" />
        <span className="min-w-0 truncate">{title}</span>
      </h3>
      <div className="relative min-h-[260px] overflow-hidden rounded-xl border border-emerald-500/20 bg-[linear-gradient(90deg,rgba(16,185,129,0.08)_50%,rgba(16,185,129,0.14)_50%),linear-gradient(0deg,transparent_48%,rgba(255,255,255,0.12)_49%,rgba(255,255,255,0.12)_51%,transparent_52%)] bg-[length:30px_30px,100%_100%] sm:min-h-[320px] sm:bg-[length:40px_40px,100%_100%]">
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute inset-x-6 top-3 h-10 rounded-b-xl border-x border-b border-white/10 sm:inset-x-10 sm:top-4 sm:h-12" />
        <div className="absolute inset-x-6 bottom-3 h-10 rounded-t-xl border-x border-t border-white/10 sm:inset-x-10 sm:bottom-4 sm:h-12" />

        {players.length === 0 ? (
          <div className="absolute inset-4 flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/20 px-4 text-center text-xs text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          players.map((player) => {
            const position = player.gridPosition!;
            const rowCount = getFormationRowCount(players);
            const columnCount = getFormationColumnCount(players, position.row);
            const top = getVerticalPitchTop(position.row, rowCount);
            const left = getHorizontalPitchLeft(position.column, columnCount);

            return (
              <div
                key={`${player.id}-${player.number}-${player.grid}`}
                className="absolute max-w-[52px] -translate-x-1/2 -translate-y-1/2 text-center sm:max-w-[80px]"
                style={{ top: `${top}%`, left: `${left}%` }}
                title={`${player.number ?? "-"} ${player.name}`}
              >
                <div
                  className={cn(
                    "mx-auto flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] font-bold shadow-lg sm:h-8 sm:w-8 sm:text-[11px]",
                    tone === "cyan"
                      ? "border-cyan-300/70 bg-cyan-500 text-black shadow-cyan-500/20"
                      : "border-magenta-300/70 bg-magenta-500 text-black shadow-magenta-500/20"
                  )}
                >
                  {player.number ?? "-"}
                </div>
                <p className="mt-0.5 truncate rounded bg-black/65 px-0.5 text-[8px] font-medium text-white sm:text-[10px]">
                  {shortenPlayerName(player.name)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  locale,
  season,
  compact = false,
}: {
  player: ApiFootballLineup["startXI"][number]["player"];
  locale: string;
  season: number;
  compact?: boolean;
}) {
  const name = (
    <span className={cn("truncate text-white", compact ? "text-xs" : "text-sm")}>
      {player.name}
    </span>
  );

  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)_34px] items-center gap-1.5 rounded-md border border-gray-800 bg-[#0a0a0f] px-2 py-1.5 sm:grid-cols-[36px_minmax(0,1fr)_44px]">
      <span className="font-mono text-xs font-bold text-white">
        {player.number ?? "-"}
      </span>
      {player.id ? (
        <Link
          href={`/${locale}/football/players/${player.id}?season=${season}`}
          className="min-w-0 transition-colors hover:text-cyan-300"
        >
          {name}
        </Link>
      ) : (
        name
      )}
      <span className="text-right text-[10px] text-gray-500">
        {player.pos ?? player.grid ?? "-"}
      </span>
    </div>
  );
}

function LivePlayerStatsPanel({
  playerStats,
  locale,
  season,
  labels,
}: {
  playerStats: ApiFootballPlayerStats[];
  locale: string;
  season: number;
  labels: {
    empty: string;
    titleSuffix: string;
    player: string;
    minutes: string;
    rating: string;
    goalsAssists: string;
    shots: string;
    pass: string;
    cards: string;
    captain: string;
  };
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {playerStats.length === 0 ? (
        <Card className="p-4 lg:col-span-2">
          <EmptyText label={labels.empty} />
        </Card>
      ) : (
        playerStats.map((teamStats, index) => (
          <Card key={teamStats.team.id} className="min-w-0 p-3 sm:p-4">
            <div className="mb-4 flex items-center gap-3">
              <ApiTeamLogo
                name={teamStats.team.name}
                logo={teamStats.team.logo}
                size="sm"
                accent={index === 0 ? "cyan" : "magenta"}
              />
              <div className="flex min-w-0 items-center gap-2">
                <Users size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />
                <h2 className="truncate text-sm font-bold text-white">
                  {teamStats.team.name} {labels.titleSuffix}
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full min-w-[460px] text-sm sm:min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="px-2 py-2 text-left">{labels.player}</th>
                    <th className="px-2 py-2 text-center">{labels.minutes}</th>
                    <th className="px-2 py-2 text-center">{labels.rating}</th>
                    <th className="px-2 py-2 text-center">{labels.goalsAssists}</th>
                    <th className="px-2 py-2 text-center">{labels.shots}</th>
                    <th className="px-2 py-2 text-center">{labels.pass}</th>
                    <th className="px-2 py-2 text-center">{labels.cards}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70">
                  {teamStats.players.slice(0, 14).map(({ player, statistics }) => {
                    const stat = statistics[0];
                    return (
                      <tr key={player.id}>
                        <td className="px-2 py-2">
                          <Link
                            href={`/${locale}/football/players/${player.id}?season=${season}`}
                            className="block min-w-0"
                          >
                            <p className="truncate text-xs font-semibold text-white transition-colors hover:text-cyan-300">
                              {player.name}
                            </p>
                          </Link>
                          <p className="text-[10px] text-gray-600">
                            {stat?.games.position ?? "-"}
                            {stat?.games.captain ? ` - ${labels.captain}` : ""}
                          </p>
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat?.games.minutes ?? "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-cyan-300">
                          {stat?.games.rating ?? "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat ? `${stat.goals.total ?? 0}/${stat.goals.assists ?? 0}` : "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat ? `${stat.shots.on ?? 0}/${stat.shots.total ?? 0}` : "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat?.passes.accuracy ?? "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat ? `${stat.cards.yellow ?? 0}/${stat.cards.red ?? 0}` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </section>
  );
}

function getLineupLabels(locale: string, details: DetailCopy) {
  const isThai = locale === "th";
  return {
    empty: details.noData,
    coach: isThai ? "โค้ช" : "Coach",
    unavailable: details.noData,
    startingXI: details.startingXi,
    substitutes: details.substitutes,
    formationPitch: isThai ? "แผนการเล่น" : "Formation pitch",
    noGridData: details.noData,
  };
}

function getPlayerStatsLabels(locale: string, details: DetailCopy) {
  const isThai = locale === "th";
  return {
    empty: details.noData,
    titleSuffix: isThai ? "สถิติผู้เล่น" : "player stats",
    player: details.players,
    minutes: isThai ? "นาที" : "Min",
    rating: isThai ? "เรตติ้ง" : "Rat",
    goalsAssists: isThai ? "ประตู/แอสซิสต์" : "G/A",
    shots: details.shots,
    pass: isThai ? "ผ่านบอล" : "Pass",
    cards: details.cards,
    captain: isThai ? "กัปตัน" : "Captain",
  };
}

function parseGridPosition(grid: string | null) {
  if (!grid) return null;

  const [row, column] = grid.split(":").map((part) => Number.parseInt(part, 10));
  if (!row || !column) return null;

  return { row, column };
}

function getFormationRowCount(
  players: {
    gridPosition: { row: number; column: number } | null;
  }[]
) {
  return players.reduce(
    (max, player) => Math.max(max, player.gridPosition?.row ?? 1),
    1
  );
}

function getFormationColumnCount(
  players: {
    gridPosition: { row: number; column: number } | null;
  }[],
  row: number
) {
  return players.reduce((max, player) => {
    if (player.gridPosition?.row !== row) return max;
    return Math.max(max, player.gridPosition.column);
  }, 1);
}

function getVerticalPitchTop(row: number, rowCount: number) {
  if (rowCount <= 1) return 50;
  return clamp(10 + ((row - 1) / (rowCount - 1)) * 80, 10, 90);
}

function getHorizontalPitchLeft(column: number, columnCount: number) {
  if (columnCount <= 1) return 50;
  return clamp(14 + ((column - 1) / (columnCount - 1)) * 72, 14, 86);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function shortenPlayerName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0][0]}. ${parts.at(-1)}`;
}

function renderH2H(context: DetailContext, locale: string, empty: string) {
  if (context.api.h2h.length === 0) return <EmptyText label={empty} />;
  return context.api.h2h.slice(0, 5).map((fixture) => (
    <div key={fixture.id} className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3 text-xs">
      <p className="text-gray-500">{formatDateTime(fixture.kickoffTime, locale)}</p>
      <p className="mt-1 text-white">
        {fixture.home.name} {fixture.score.home ?? "-"} - {fixture.score.away ?? "-"} {fixture.away.name}
      </p>
    </div>
  ));
}

function EmptyText({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-800 p-5 text-center text-sm text-gray-500">
      {label}
    </div>
  );
}
