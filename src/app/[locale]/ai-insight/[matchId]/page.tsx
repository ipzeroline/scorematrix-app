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
  Shirt,
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
import { aiInsights } from "@/data/ai-insights";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import { leagues } from "@/data/leagues";
import { lineups as mockLineups } from "@/data/lineups";
import { matchEvents } from "@/data/match-events";
import { matchStats } from "@/data/match-stats";
import { matches } from "@/data/matches";
import { teams } from "@/data/teams";
import {
  ApiFootballError,
  type ApiFootballEvent,
  type ApiFootballFixture,
  type ApiFootballLineup,
  type ApiFootballPlayerStats,
  type ApiFootballTeamStatistics,
  getApiFootballFixtureDetails,
  getApiFootballH2H,
} from "@/lib/api-football";
import { extractApiFixtureId } from "@/lib/football-slugs";
import { MatchStatus } from "@/types/common";
import type { AIInsight } from "@/types/ai-insight";
import type { Lineup, Match, MatchEvent, MatchStats } from "@/types/match";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
};

type DetailCopy = (typeof detailCopy)["th"];

const localizedInsightCopy: Record<
  string,
  Partial<Record<keyof typeof detailCopy, Pick<AIInsight, "keyFactors">>>
> = {
  "match-003": {
    th: {
      keyFactors: [
        "Real Catalonia ฟอร์มเหนือกว่าอย่างชัดเจน",
        "Sevilla Sur ขาดผู้เล่นหลัก 3 คน",
        "Catalonia ชนะ 5 จาก 6 นัดหลังในบ้าน",
        "Sevilla มีสถิติเกมเยือนอ่อนในฤดูกาลนี้",
      ],
    },
    en: {
      keyFactors: [
        "Real Catalonia in dominant form",
        "Sevilla Sur missing 3 key players",
        "Catalonia has won 5 of last 6 at home",
        "Sevilla poor away record this season",
      ],
    },
    lo: {
      keyFactors: [
        "Real Catalonia ຟອມເໜືອກວ່າຢ່າງຊັດເຈນ",
        "Sevilla Sur ຂາດນັກເຕະຫຼັກ 3 ຄົນ",
        "Catalonia ຊະນະ 5 ຈາກ 6 ນັດຫຼ້າສຸດໃນບ້ານ",
        "Sevilla ມີສະຖິຕິເກມຢາມບໍ່ດີໃນລະດູການນີ້",
      ],
    },
    my: {
      keyFactors: [
        "Real Catalonia သည် ဖောင်မ်အရ သိသိသာသာသာလွန်နေသည်",
        "Sevilla Sur တွင် အဓိကကစားသမား 3 ယောက် မပါနိုင်",
        "Catalonia သည် အိမ်ကွင်းနောက်ဆုံး 6 ပွဲတွင် 5 ပွဲနိုင်ထားသည်",
        "Sevilla ၏ ယခုရာသီ အဝေးကွင်းမှတ်တမ်း အားနည်းနေသည်",
      ],
    },
    km: {
      keyFactors: [
        "Real Catalonia កំពុងមានទម្រង់លេចធ្លោ",
        "Sevilla Sur ខ្វះកីឡាករសំខាន់ 3 នាក់",
        "Catalonia ឈ្នះ 5 ក្នុង 6 ប្រកួតចុងក្រោយក្នុងទឹកដី",
        "Sevilla មានកំណត់ត្រាក្រៅដីខ្សោយក្នុងរដូវកាលនេះ",
      ],
    },
    zh: {
      keyFactors: [
        "Real Catalonia 近期状态明显占优",
        "Sevilla Sur 缺少 3 名关键球员",
        "Catalonia 近 6 个主场赢下 5 场",
        "Sevilla 本赛季客场表现偏弱",
      ],
    },
  },
};

type LocalTeam = {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
};

type DetailContext =
  | {
      kind: "local";
      fixture: LocalFixture;
      insight: AIInsight;
      api: {
        events: MatchEvent[];
        stats: MatchStats | null;
        lineup: Lineup | null;
        h2h: AIInsight["headToHead"];
      };
    }
  | {
      kind: "api";
      fixture: ApiFootballFixture;
      insight: AIInsight;
      api: {
        events: ApiFootballEvent[];
        statistics: ApiFootballTeamStatistics[];
        lineups: ApiFootballLineup[];
        playerStats: ApiFootballPlayerStats[];
        h2h: ApiFootballFixture[];
      };
    };

type LocalFixture = {
  id: string;
  league: {
    name: string;
    country: string;
    logo: string | null;
    round: string;
  };
  home: LocalTeam;
  away: LocalTeam;
  score: {
    home: number | null;
    away: number | null;
  };
  status: MatchStatus;
  kickoffTime: string;
  venue: string;
};

const localeMap: Record<string, string> = {
  th: "th-TH",
  en: "en-US",
  lo: "lo-LA",
  my: "my-MM",
  km: "km-KH",
  zh: "zh-CN",
};

const localLogoFallbacks: Record<string, string> = {
  "league-01": "https://media.api-sports.io/football/leagues/39.png",
  "league-02": "https://media.api-sports.io/football/leagues/140.png",
  "team-01": "https://media.api-sports.io/football/teams/33.png",
  "team-02": "https://media.api-sports.io/football/teams/50.png",
  "team-06": "https://media.api-sports.io/football/teams/529.png",
  "team-08": "https://media.api-sports.io/football/teams/536.png",
};

const detailCopy = {
  th: {
    back: "กลับ AI Insight",
    apiData: "ข้อมูลเสริมจาก API",
    matchTimeline: "เหตุการณ์ในเกม",
    teamStats: "สถิติทีม",
    lineupPreview: "รายชื่อและแผนการเล่น",
    h2h: "พบกันล่าสุด",
    playerData: "ข้อมูลผู้เล่น",
    source: "แหล่งข้อมูล",
    score: "สกอร์",
    venue: "สนาม",
    round: "รอบ",
    formIndex: "ดัชนีฟอร์ม",
    homeAdvantage: "ความได้เปรียบเจ้าบ้าน",
    modelSignals: "สัญญาณที่โมเดลใช้",
    availableFromApi: "ข้อมูลนี้ดึงจาก endpoint รายละเอียดของ API เมื่อ match id เป็น API fixture",
    noApiData: "ยังไม่มีข้อมูลจาก API สำหรับแมตช์นี้ ระบบจะแสดงข้อมูลจำลองที่มีในแอป",
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
    apiData: "Extra API Data",
    matchTimeline: "Match timeline",
    teamStats: "Team statistics",
    lineupPreview: "Lineups and shape",
    h2h: "Recent head-to-head",
    playerData: "Player data",
    source: "Source",
    score: "Score",
    venue: "Venue",
    round: "Round",
    formIndex: "Form index",
    homeAdvantage: "Home advantage",
    modelSignals: "Model signals",
    availableFromApi: "This section is populated from the API fixture detail endpoint when the match id is an API fixture.",
    noApiData: "No API detail is available for this match yet, so the app is showing its local match data.",
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
    apiData: "ຂໍ້ມູນເພີ່ມຈາກ API",
    matchTimeline: "ເຫດການໃນເກມ",
    teamStats: "ສະຖິຕິທີມ",
    lineupPreview: "ລາຍຊື່ ແລະ ແຜນ",
    h2h: "ພົບກັນຫຼ້າສຸດ",
    playerData: "ຂໍ້ມູນນັກເຕະ",
    source: "ແຫຼ່ງຂໍ້ມູນ",
    score: "ຄະແນນ",
    venue: "ສະໜາມ",
    round: "ຮອບ",
    formIndex: "ດັດຊະນີຟອມ",
    homeAdvantage: "ຄວາມໄດ້ປຽບເຈົ້າບ້ານ",
    modelSignals: "ສັນຍານຂອງໂມເດວ",
    availableFromApi: "ສ່ວນນີ້ດຶງຈາກ API fixture detail ເມື່ອ match id ເປັນ API fixture.",
    noApiData: "ຍັງບໍ່ມີຂໍ້ມູນ API detail ສໍາລັບແມຕຊ໌ນີ້.",
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
    apiData: "API မှ ထပ်ဆောင်းဒေတာ",
    matchTimeline: "ပွဲဖြစ်ရပ်များ",
    teamStats: "အသင်းစာရင်းအင်း",
    lineupPreview: "လူစာရင်းနှင့်ဖွဲ့စည်းပုံ",
    h2h: "နောက်ဆုံးတွေ့ဆုံမှု",
    playerData: "ကစားသမားဒေတာ",
    source: "ရင်းမြစ်",
    score: "ရလဒ်",
    venue: "ကွင်း",
    round: "အဆင့်",
    formIndex: "ဖောင်မ်ညွှန်းကိန်း",
    homeAdvantage: "အိမ်ကွင်းအားသာချက်",
    modelSignals: "မော်ဒယ် signal များ",
    availableFromApi: "match id သည် API fixture ဖြစ်ပါက API fixture detail endpoint မှ ဒေတာကို ဖြည့်ပေးသည်။",
    noApiData: "ဤပွဲအတွက် API detail မရှိသေးပါ။ local ဒေတာကို ပြထားသည်။",
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
    apiData: "ទិន្នន័យបន្ថែមពី API",
    matchTimeline: "ព្រឹត្តិការណ៍ប្រកួត",
    teamStats: "ស្ថិតិក្រុម",
    lineupPreview: "ជម្រើសកីឡាករ និងទម្រង់",
    h2h: "ជួបគ្នាថ្មីៗ",
    playerData: "ទិន្នន័យកីឡាករ",
    source: "ប្រភព",
    score: "ពិន្ទុ",
    venue: "ទីលាន",
    round: "ជុំ",
    formIndex: "សន្ទស្សន៍ទម្រង់",
    homeAdvantage: "អត្ថប្រយោជន៍ម្ចាស់ផ្ទះ",
    modelSignals: "សញ្ញាម៉ូដែល",
    availableFromApi: "ផ្នែកនេះនឹងយកពី API fixture detail នៅពេល match id ជា API fixture។",
    noApiData: "មិនទាន់មាន API detail សម្រាប់ការប្រកួតនេះទេ ដូច្នេះបង្ហាញទិន្នន័យក្នុងប្រព័ន្ធ។",
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
    apiData: "API 附加数据",
    matchTimeline: "比赛事件",
    teamStats: "球队统计",
    lineupPreview: "阵容与阵型",
    h2h: "近期交锋",
    playerData: "球员数据",
    source: "来源",
    score: "比分",
    venue: "场地",
    round: "轮次",
    formIndex: "状态指数",
    homeAdvantage: "主场优势",
    modelSignals: "模型信号",
    availableFromApi: "当 match id 是 API fixture 时，此区域会从 API fixture detail endpoint 填充。",
    noApiData: "该比赛暂无 API detail，因此显示应用内本地数据。",
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
  const context = await getDetailContext(matchId, locale);

  if (!context) notFound();

  const fixture = context.fixture;
  const insight = context.insight;
  const apiCounts = getApiCounts(context);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
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
                <Badge variant={statusVariant(fixture.status)} size="md">
                  {statusLabel(fixture.status, copy)}
                </Badge>
                <Badge variant="gold" size="md">
                  {details.source}: {context.kind === "api" ? "Live API" : "Local"}
                </Badge>
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

            <div className="grid min-w-[240px] grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-gray-800 bg-black/25 p-3 text-center">
              <TeamBlock team={fixture.home} tone="cyan" />
              <div>
                <p className="font-mono text-2xl font-black text-white">
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
              <SignalTile icon={Gauge} label={copy.labels.confidence} value={`${insight.confidenceScore}%`} tone="text-cyan-300" />
              <SignalTile icon={Flame} label={copy.labels.heat} value={`${insight.heatMeter}/10`} tone="text-amber-300" />
              <SignalTile icon={TrendingUp} label={details.formIndex} value={`${insight.formComparison.homeFormIndex}-${insight.formComparison.awayFormIndex}`} tone="text-green-300" />
              <SignalTile icon={Activity} label={details.homeAdvantage} value={`${Math.round(insight.homeAdvantageFactor * 100)}%`} tone="text-purple-300" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ProbabilityCard label={copy.labels.homeWin} value={insight.homeWinProbability} color="cyan" />
              <ProbabilityCard label={copy.labels.draw} value={insight.drawProbability} color="purple" />
              <ProbabilityCard label={copy.labels.awayWin} value={insight.awayWinProbability} color="magenta" />
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">
              {copy.labels.community}
            </h2>
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
              <Users size={14} className="text-purple-300" />
              {insight.communitySentiment.totalVotes.toLocaleString(localeMap[locale] ?? "th-TH")} {copy.labels.votes}
            </div>
            <div className="space-y-3">
              <ProbabilityRow label={copy.labels.home} value={insight.communitySentiment.homePercentage} color="cyan" />
              <ProbabilityRow label={copy.labels.draw} value={insight.communitySentiment.drawPercentage} color="purple" />
              <ProbabilityRow label={copy.labels.away} value={insight.communitySentiment.awayPercentage} color="magenta" />
            </div>
          </Card>
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

      <section className="grid gap-4 lg:grid-cols-2">
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

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">
            {copy.labels.injuryImpact}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InjuryBlock
              label={fixture.home.name}
              impact={insight.injuryImpact.homeImpact}
              injuries={insight.injuryImpact.homeInjuries}
              empty={copy.labels.noInjuries}
            />
            <InjuryBlock
              label={fixture.away.name}
              impact={insight.injuryImpact.awayImpact}
              injuries={insight.injuryImpact.awayInjuries}
              empty={copy.labels.noInjuries}
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              {details.apiData}
            </h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              {context.kind === "api" ? details.availableFromApi : details.noApiData}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <ApiCount label={details.events} value={apiCounts.events} />
            <ApiCount label={details.stats} value={apiCounts.stats} />
            <ApiCount label={details.lineups} value={apiCounts.lineups} />
            <ApiCount label={details.players} value={apiCounts.players} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
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

        <Card className="p-4">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Shirt size={15} className="text-amber-300" />
            {details.lineupPreview}
          </h3>
          <LineupsPanel context={context} labels={details} />
        </Card>
      </section>
    </div>
  );
}

async function getDetailContext(matchId: string, locale: string): Promise<DetailContext | null> {
  const fixtureId = extractApiFixtureId(matchId);
  if (fixtureId) {

    try {
      const details = await getApiFootballFixtureDetails(fixtureId);
      const h2h =
        details.fixture.home.apiTeamId && details.fixture.away.apiTeamId
          ? await getApiFootballH2H(details.fixture.home.apiTeamId, details.fixture.away.apiTeamId)
          : [];

      return {
        kind: "api",
        fixture: details.fixture,
        insight: buildApiInsight(details.fixture, h2h, details.statistics, details.events),
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

  const insight = aiInsights.find((item) => item.matchId === matchId);
  const match = matches.find((item) => item.id === matchId);
  if (!insight || !match) return null;

  const fixture = buildLocalFixture(match);

  if (!fixture) return null;

  return {
    kind: "local",
    fixture,
    insight: localizeInsight(insight, matchId, locale),
    api: {
      events: matchEvents.filter((event) => event.matchId === matchId),
      stats: matchStats.find((stats) => stats.matchId === matchId) ?? null,
      lineup: mockLineups.find((lineup) => lineup.matchId === matchId) ?? null,
      h2h: insight.headToHead,
    },
  };
}

function localizeInsight(insight: AIInsight, matchId: string, locale: string): AIInsight {
  const localized = localizedInsightCopy[matchId]?.[locale as keyof typeof detailCopy];
  if (!localized) return insight;
  return {
    ...insight,
    ...localized,
  };
}

function buildLocalFixture(match: Match): LocalFixture | null {
  const home = teams.find((team) => team.id === match.homeTeamId);
  const away = teams.find((team) => team.id === match.awayTeamId);
  const league = leagues.find((item) => item.id === match.leagueId);
  if (!home || !away || !league) return null;

  return {
    id: match.id,
    league: {
      name: league.name,
      country: league.country,
      logo: renderableLogo(league.logo, league.id),
      round: match.round,
    },
    home: {
      id: home.id,
      name: home.name,
      shortName: home.shortName,
      logo: renderableLogo(home.crest, home.id),
    },
    away: {
      id: away.id,
      name: away.name,
      shortName: away.shortName,
      logo: renderableLogo(away.crest, away.id),
    },
    score: {
      home: match.homeScore,
      away: match.awayScore,
    },
    status: match.status,
    kickoffTime: match.kickoffTime,
    venue: match.venue,
  };
}

function renderableLogo(logo: string | null | undefined, fallbackId?: string) {
  if (!logo || logo.startsWith("/images/")) {
    return fallbackId ? (localLogoFallbacks[fallbackId] ?? null) : null;
  }
  return logo;
}

function buildApiInsight(
  fixture: ApiFootballFixture,
  h2h: ApiFootballFixture[],
  statistics: ApiFootballTeamStatistics[],
  events: ApiFootballEvent[]
): AIInsight {
  const homeStats = statistics.find((item) => item.team.id === fixture.home.apiTeamId);
  const awayStats = statistics.find((item) => item.team.id === fixture.away.apiTeamId);
  const homeShots = statNumber(homeStats, "Total Shots");
  const awayShots = statNumber(awayStats, "Total Shots");
  const totalShots = homeShots + awayShots;
  const homeWinProbability = totalShots > 0 ? Math.round((homeShots / totalShots) * 70 + 15) : 40;
  const awayWinProbability = totalShots > 0 ? Math.round((awayShots / totalShots) * 70 + 15) : 35;
  const drawProbability = Math.max(5, 100 - homeWinProbability - awayWinProbability);
  const goals = events.filter((event) => event.type.toLowerCase() === "goal").length;

  return {
    id: `api-insight-${fixture.apiFixtureId ?? fixture.id}`,
    matchId: fixture.id,
    confidenceScore: Math.min(92, Math.max(50, Math.abs(homeWinProbability - awayWinProbability) + 55)),
    homeWinProbability,
    drawProbability,
    awayWinProbability,
    heatMeter: Math.min(10, Math.max(4, Math.round((goals + totalShots / 6) * 10) / 10)),
    homeAdvantageFactor: 1.15,
    formComparison: {
      homeFormIndex: Math.min(95, Math.max(35, homeWinProbability + 15)),
      awayFormIndex: Math.min(95, Math.max(35, awayWinProbability + 15)),
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
    injuryImpact: {
      homeImpact: 0,
      awayImpact: 0,
      homeInjuries: [],
      awayInjuries: [],
    },
    upsetAlert: Math.abs(homeWinProbability - awayWinProbability) <= 8,
    upsetDescription:
      Math.abs(homeWinProbability - awayWinProbability) <= 8
        ? "The API match data points to a tight fixture with a narrow probability gap."
        : null,
    communitySentiment: {
      homePercentage: homeWinProbability,
      drawPercentage: drawProbability,
      awayPercentage: awayWinProbability,
      totalVotes: 0,
    },
    keyFactors: [
      `${fixture.league.name} - ${fixture.league.round}`,
      `${events.length} match events available from fixture detail`,
      `${statistics.length} team statistic groups available from API`,
      `${h2h.length} head-to-head fixtures returned`,
    ],
    generatedAt: new Date().toISOString(),
  };
}

function resultSequenceFromFixtures(fixtures: ApiFootballFixture[], teamName: string) {
  const sequence = fixtures.slice(0, 5).map((fixture): "W" | "D" | "L" => {
    if (fixture.score.home === null || fixture.score.away === null) return "D";
    const isHome = fixture.home.name === teamName;
    const own = isHome ? fixture.score.home : fixture.score.away;
    const other = isHome ? fixture.score.away : fixture.score.home;
    if (own > other) return "W";
    if (own < other) return "L";
    return "D";
  });

  return sequence.length > 0 ? sequence : (["D", "D", "D", "D", "D"] as Array<"W" | "D" | "L">);
}

function statNumber(stats: ApiFootballTeamStatistics | undefined, type: string) {
  const value = stats?.statistics.find((item) => item.type === type)?.value;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value.replace("%", "")) || 0;
  return 0;
}

function getApiCounts(context: DetailContext) {
  if (context.kind === "api") {
    return {
      events: context.api.events.length,
      stats: context.api.statistics.reduce((total, item) => total + item.statistics.length, 0),
      lineups: context.api.lineups.length,
      players: context.api.playerStats.reduce((total, team) => total + team.players.length, 0),
    };
  }

  return {
    events: context.api.events.length,
    stats: context.api.stats ? 1 : 0,
    lineups: context.api.lineup ? 1 : 0,
    players:
      (context.api.lineup?.homeStarting.length ?? 0) +
      (context.api.lineup?.awayStarting.length ?? 0),
  };
}

function statusVariant(status: MatchStatus) {
  const variants: Record<MatchStatus, "cyan" | "green" | "gold" | "red" | "default"> = {
    [MatchStatus.LIVE]: "green",
    [MatchStatus.UPCOMING]: "cyan",
    [MatchStatus.FINISHED]: "default",
    [MatchStatus.POSTPONED]: "gold",
    [MatchStatus.CANCELLED]: "red",
  };
  return variants[status];
}

function statusLabel(status: MatchStatus, copy: ReturnType<typeof getAIInsightPageCopy>) {
  const labels = {
    [MatchStatus.LIVE]: copy.labels.live,
    [MatchStatus.UPCOMING]: copy.labels.upcoming,
    [MatchStatus.FINISHED]: copy.labels.finished,
    [MatchStatus.POSTPONED]: copy.labels.postponed,
    [MatchStatus.CANCELLED]: copy.labels.cancelled,
  };
  return labels[status];
}

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(localeMap[locale] ?? "th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function TeamBlock({
  team,
  tone,
}: {
  team: LocalTeam | ApiFootballFixture["home"];
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "cyan" : "magenta";
  return (
    <div className="min-w-0">
      <div className="flex justify-center">
        <ApiTeamLogo name={team.name} logo={team.logo} size="md" accent={accent} />
      </div>
      <p className={`mt-2 truncate text-xs font-semibold ${tone === "cyan" ? "text-cyan-200" : "text-magenta-200"}`}>
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
  value: number;
  color: "cyan" | "purple" | "magenta";
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
      <div className="mb-2 flex justify-between gap-3 text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-mono text-gray-200">{value}%</span>
      </div>
      <ProgressBar value={value} color={color} size="md" />
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

function InjuryBlock({
  label,
  impact,
  injuries,
  empty,
}: {
  label: string;
  impact: number;
  injuries: string[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
      <div className="mb-2 flex justify-between gap-3 text-xs">
        <span className="truncate text-gray-300">{label}</span>
        <span className="font-mono text-red-300">{impact}%</span>
      </div>
      <ProgressBar value={impact} color="red" size="sm" />
      <div className="mt-3 space-y-1">
        {injuries.length === 0 ? (
          <p className="text-xs text-gray-500">{empty}</p>
        ) : (
          injuries.map((injury) => (
            <p key={injury} className="text-xs text-red-300">
              {injury}
            </p>
          ))
        )}
      </div>
    </div>
  );
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
  if (context.kind === "api") {
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

  if (context.api.events.length === 0) return <EmptyText label={empty} />;

  return (
    <div className="space-y-2">
      {context.api.events.map((event) => (
        <div key={event.id} className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-mono font-bold text-cyan-300">
              {event.minute}{event.minuteExtra ? `+${event.minuteExtra}` : ""}&apos;
            </span>
            <span className="text-gray-500">{event.team}</span>
          </div>
          <p className="mt-1 text-sm text-white">{event.type.replaceAll("_", " ")}</p>
          <p className="mt-1 text-xs text-gray-500">{event.playerName} {event.detail ? `- ${event.detail}` : ""}</p>
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
  if (context.kind === "api") {
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

  if (!context.api.stats) return <EmptyText label={labels.noData} />;
  const stats = context.api.stats;
  return (
    <div className="space-y-3">
      <CompareStat label={labels.possession} home={`${stats.possessionHome}%`} away={`${stats.possessionAway}%`} />
      <CompareStat label={labels.shots} home={stats.shotsHome} away={stats.shotsAway} />
      <CompareStat label={labels.shotsOnGoal} home={stats.shotsOnTargetHome} away={stats.shotsOnTargetAway} />
      <CompareStat label={labels.corners} home={stats.cornersHome} away={stats.cornersAway} />
      <CompareStat label={labels.fouls} home={stats.foulsHome} away={stats.foulsAway} />
      <CompareStat label={labels.cards} home={`${stats.yellowCardsHome}/${stats.redCardsHome}`} away={`${stats.yellowCardsAway}/${stats.redCardsAway}`} />
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

function LineupsPanel({
  context,
  labels,
}: {
  context: DetailContext;
  labels: DetailCopy;
}) {
  if (context.kind === "api") {
    if (context.api.lineups.length === 0) return <EmptyText label={labels.noData} />;
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {context.api.lineups.map((lineup) => (
          <div key={lineup.team.id} className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
            <div className="mb-3 flex items-center gap-3">
              <ApiTeamLogo name={lineup.team.name} logo={lineup.team.logo} size="sm" />
              <div>
                <p className="text-sm font-semibold text-white">{lineup.team.name}</p>
                <p className="text-xs text-gray-500">{lineup.formation ?? labels.noData}</p>
              </div>
            </div>
            <PlayerList title={labels.startingXi} players={lineup.startXI.map((item) => item.player.name).slice(0, 11)} empty={labels.noData} />
            <PlayerList title={labels.substitutes} players={lineup.substitutes.map((item) => item.player.name).slice(0, 8)} empty={labels.noData} />
          </div>
        ))}
      </div>
    );
  }

  if (!context.api.lineup) return <EmptyText label={labels.noData} />;
  const lineup = context.api.lineup;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
        <p className="mb-2 text-sm font-semibold text-white">
          {context.fixture.home.name} - {lineup.homeFormation}
        </p>
        <PlayerList title={labels.startingXi} players={lineup.homeStarting.map((player) => player.name)} empty={labels.noData} />
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
        <p className="mb-2 text-sm font-semibold text-white">
          {context.fixture.away.name} - {lineup.awayFormation}
        </p>
        <PlayerList title={labels.startingXi} players={lineup.awayStarting.map((player) => player.name)} empty={labels.noData} />
      </div>
    </div>
  );
}

function PlayerList({
  title,
  players,
  empty,
}: {
  title: string;
  players: string[];
  empty: string;
}) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-medium text-gray-400">{title}</p>
      {players.length === 0 ? (
        <p className="text-xs text-gray-600">{empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {players.map((player) => (
            <span key={player} className="truncate rounded border border-gray-800 bg-black/20 px-2 py-1 text-xs text-gray-400">
              {player}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function renderH2H(context: DetailContext, locale: string, empty: string) {
  if (context.kind === "api") {
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

  if (context.api.h2h.length === 0) return <EmptyText label={empty} />;
  return context.api.h2h.map((h2h) => (
    <div key={`${h2h.date}-${h2h.homeTeam}-${h2h.awayTeam}`} className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3 text-xs">
      <p className="text-gray-500">{formatDateTime(h2h.date, locale)} - {h2h.competition}</p>
      <p className="mt-1 text-white">
        {h2h.homeTeam} {h2h.score} {h2h.awayTeam}
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
