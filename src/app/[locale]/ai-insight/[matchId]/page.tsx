import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Flame,
  Gauge,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import { formatMatchDateTimeWithZone } from "@/lib/utils";
import {
  ApiFootballError,
  type ApiFootballAIInsightDetail,
  type ApiFootballTeamFormProfile,
  type ApiFootballFixture,
  getApiFootballAIInsightDetail,
} from "@/lib/api-football";
import { extractApiFixtureId } from "@/lib/football-slugs";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
};

type DetailContext = {
  kind: "api";
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
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
  const communitySentiment = insight.communitySentiment;

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
          <div className="flex flex-col gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles size={13} />
                    {copy.title}
                  </span>
                </Badge>
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-white md:text-4xl">
                {fixture.home.name} vs {fixture.away.name}
              </h1>
            </div>
          </div>
        </div>

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

          <div className="space-y-4">
            <ApiPredictionCard insight={insight} empty={details.noData} />
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
        </div>
      </section>

      {insight.upsetAlert && insight.upsetDescription && (
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

      <section className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <ComparisonPanel
          comparison={insight.comparison}
          homeName={fixture.home.name}
          awayName={fixture.away.name}
          empty={details.noData}
        />
        <InjuryImpactCard
          injuryImpact={insight.injuryImpact}
          homeName={fixture.home.name}
          awayName={fixture.away.name}
          labels={copy.labels}
          empty={details.noData}
        />
      </section>

      {hasFormData(insight) && <section>
        <Card className="p-4">
          <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
            <TrendingUp size={15} className="text-cyan-300" />
            {copy.labels.form}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <TeamFormProfileCard
              name={fixture.home.name}
              profile={insight.formComparison.homeLastFive}
              tone="cyan"
              empty={details.noData}
            />
            <TeamFormProfileCard
              name={fixture.away.name}
              profile={insight.formComparison.awayLastFive}
              tone="magenta"
              empty={details.noData}
            />
          </div>
        </Card>
      </section>}

      {insight.keyFactors.length > 0 && (
        <section>
          <Card className="p-4">
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
          </Card>
        </section>
      )}
    </div>
  );
}

async function getDetailContext(matchId: string): Promise<DetailContext | null> {
  const fixtureId = extractApiFixtureId(matchId);
  if (!fixtureId) return null;

  try {
    const insight = await getApiFootballAIInsightDetail(fixtureId);

    return {
      kind: "api",
      fixture: insight.fixture,
      insight,
    };
  } catch (error) {
    if (error instanceof ApiFootballError) return null;
    throw error;
  }
}

function hasFormData(insight: ApiFootballAIInsightDetail): boolean {
  return (
    Boolean(insight.formComparison.homeLastFive) ||
    Boolean(insight.formComparison.awayLastFive)
  );
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

function ApiPredictionCard({
  insight,
  empty,
}: {
  insight: ApiFootballAIInsightDetail;
  empty: string;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
        <Sparkles size={15} className="text-cyan-300" />
        API Prediction
      </h2>
      <div className="grid gap-2 text-xs">
        <InfoLine label="Advice" value={insight.apiAdvice || empty} />
        <InfoLine label="Winner" value={insight.apiWinner?.name || empty} />
        <InfoLine label="Winner note" value={insight.apiWinner?.comment || empty} />
        <InfoLine label="Under / Over" value={insight.apiUnderOver || empty} />
        <InfoLine label="Win or draw" value={formatBoolean(insight.apiWinOrDraw)} />
        <InfoLine
          label="Predicted goals"
          value={`${insight.apiPredictedGoals?.home ?? "-"} - ${insight.apiPredictedGoals?.away ?? "-"}`}
        />
      </div>
    </Card>
  );
}

function ComparisonPanel({
  comparison,
  homeName,
  awayName,
  empty,
}: {
  comparison: ApiFootballAIInsightDetail["comparison"];
  homeName: string;
  awayName: string;
  empty: string;
}) {
  const rows = Object.entries(comparison);
  if (rows.length === 0) return <Card className="p-4"><EmptyText label={empty} /></Card>;
  return (
    <Card className="p-4">
      <h2 className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
        <BarChart3 size={15} className="text-purple-300" />
        Model comparison
      </h2>
      <div className="mb-2 grid grid-cols-[1fr_80px_80px] gap-3 text-[10px] uppercase tracking-wider text-gray-500">
        <span>Signal</span>
        <span className="text-right">{homeName}</span>
        <span className="text-right">{awayName}</span>
      </div>
      <div className="space-y-3">
        {rows.map(([key, value]) => (
          <div key={key} className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
            <div className="mb-2 grid grid-cols-[1fr_80px_80px] gap-3 text-xs">
              <span className="capitalize text-gray-400">{key.replace(/_/g, " ")}</span>
              <span className="text-right font-mono text-cyan-300">{formatOptionalMetric(value.home, "%")}</span>
              <span className="text-right font-mono text-magenta-300">{formatOptionalMetric(value.away, "%")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ProgressBar value={value.home ?? 0} color="cyan" size="sm" />
              <ProgressBar value={value.away ?? 0} color="magenta" size="sm" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InjuryImpactCard({
  injuryImpact,
  homeName,
  awayName,
  labels,
  empty,
}: {
  injuryImpact: ApiFootballAIInsightDetail["injuryImpact"];
  homeName: string;
  awayName: string;
  labels: ReturnType<typeof getAIInsightPageCopy>["labels"];
  empty: string;
}) {
  if (!injuryImpact) return <Card className="p-4"><EmptyText label={empty} /></Card>;
  return (
    <Card className="p-4">
      <h2 className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
        <AlertTriangle size={15} className="text-amber-300" />
        {labels.injuryImpact}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <InjuryTeamBlock
          name={homeName}
          impact={injuryImpact.homeImpact}
          injuries={injuryImpact.homeInjuries}
          empty={labels.noInjuries}
          tone="cyan"
        />
        <InjuryTeamBlock
          name={awayName}
          impact={injuryImpact.awayImpact}
          injuries={injuryImpact.awayInjuries}
          empty={labels.noInjuries}
          tone="magenta"
        />
      </div>
    </Card>
  );
}

function TeamFormProfileCard({
  name,
  profile,
  tone,
  empty,
}: {
  name: string;
  profile: ApiFootballTeamFormProfile | null;
  tone: "cyan" | "magenta";
  empty: string;
}) {
  if (!profile) return <EmptyText label={empty} />;

  const league = profile.league;
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta-300";
  const formLetters = String(profile.form || league?.form || "")
    .split("")
    .filter((value): value is "W" | "D" | "L" =>
      value === "W" || value === "D" || value === "L"
    );

  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className={`truncate text-sm font-semibold ${accent}`}>{name}</h3>
        <span className="font-mono text-xs text-gray-500">
          {profile.played ?? league?.fixtures?.played?.total ?? 0} played
        </span>
      </div>
      {formLetters.length > 0 && (
        <div className="mb-3 flex gap-1">
          {formLetters.slice(0, 8).map((result, index) => (
            <span
              key={`${name}-${result}-${index}`}
              className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${formTone(result)}`}
            >
              {result}
            </span>
          ))}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <MiniMetric label="Form index" value={formatOptionalMetric(numberOrNull(profile.att), "")} />
        <MiniMetric label="Def index" value={formatOptionalMetric(numberOrNull(profile.def), "")} />
        <MiniMetric label="Goals for" value={formatNumber(profile.goals?.for?.average ?? league?.goals?.for?.average?.total)} />
        <MiniMetric label="Goals against" value={formatNumber(profile.goals?.against?.average ?? league?.goals?.against?.average?.total)} />
        <MiniMetric label="Wins" value={formatNumber(league?.fixtures?.wins?.total)} />
        <MiniMetric label="Clean sheets" value={formatNumber(league?.clean_sheet?.total)} />
        <MiniMetric label="Failed to score" value={formatNumber(league?.failed_to_score?.total)} />
        <MiniMetric label="Penalty scored" value={league?.penalty?.scored?.percentage ?? "-"} />
      </div>
    </div>
  );
}

function InjuryTeamBlock({
  name,
  impact,
  injuries,
  empty,
  tone,
}: {
  name: string;
  impact: number | null;
  injuries: string[];
  empty: string;
  tone: "cyan" | "magenta";
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={tone === "cyan" ? "text-cyan-300" : "text-magenta-300"}>
          {name}
        </span>
        <span className="font-mono text-sm text-white">
          {formatOptionalMetric(impact, "%")}
        </span>
      </div>
      {injuries.length > 0 ? (
        <ul className="space-y-1 text-xs text-gray-400">
          {injuries.map((injury) => (
            <li key={injury}>{injury}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500">{empty}</p>
      )}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 rounded-lg border border-gray-800 bg-[#0a0a0f] px-3 py-2">
      <span className="text-gray-500">{label}</span>
      <span className="min-w-0 break-words text-gray-200">{value}</span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-800/80 bg-black/25 px-2.5 py-2">
      <p className="font-mono text-sm font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function formTone(result: "W" | "D" | "L") {
  if (result === "W") return "bg-green-500/15 text-green-300";
  if (result === "D") return "bg-amber-500/15 text-amber-300";
  return "bg-red-500/15 text-red-300";
}

function formatBoolean(value: boolean | null) {
  if (value === null) return "-";
  return value ? "Yes" : "No";
}

function formatNumber(value: number | string | null | undefined) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

function numberOrNull(value: number | null | undefined) {
  return typeof value === "number" ? value : null;
}

function EmptyText({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-800 p-5 text-center text-sm text-gray-500">
      {label}
    </div>
  );
}
