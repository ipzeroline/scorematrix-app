"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, memo } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import { buildPredictMatchHref } from "@/lib/predict-route";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { apiGetRaw, isAuthSessionExpiredError } from "@/lib/api-client";
import { useUserStore } from "@/stores/user-store";
import type { LocaleCode } from "@/i18n";
import {
  Brain,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ListFilter,
  LogIn,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Users,
  X,
} from "lucide-react";

type PredictableMatchResponse = {
  data?: PredictableMatchApiItem[];
};

type PredictableMatchApiItem = {
  provider_id?: number | string | null;
  league_id?: number | string | null;
  season?: number | string | null;
  status?: {
    short?: string | null;
    long?: string | null;
    elapsed?: number | null;
  } | null;
  teams?: {
    home?: {
      id?: number | string | null;
      name?: string | null;
      logo?: string | null;
    } | null;
    away?: {
      id?: number | string | null;
      name?: string | null;
      logo?: string | null;
    } | null;
  } | null;
  starts_at?: string | null;
  is_live?: boolean | null;
  is_terminal?: boolean | null;
  hasPredicted?: boolean | null;
  has_predicted?: boolean | null;
  alreadyPredicted?: boolean | null;
  already_predicted?: boolean | null;
  userPrediction?: unknown;
  user_prediction?: unknown;
  prediction?: unknown;
  league?: {
    id?: number | string | null;
    name?: string | null;
    country_flag?: string | null;
    logo?: string | null;
  } | null;
};

type PredictableMatch = {
  id: string;
  leagueKey: string;
  season: string | null;
  kickoffTime: string;
  isLive: boolean;
  isTerminal: boolean;
  hasPredicted: boolean;
  status: MatchStatus;
  statusLabel: string;
  league: {
    id: string | null;
    name: string;
    logo: string | null;
    countryFlag: string | null;
  };
  home: {
    id: string | null;
    name: string;
    logo: string | null;
  };
  away: {
    id: string | null;
    name: string;
    logo: string | null;
  };
};

type PredictionHistoryApiResponse = {
  data?: PredictionHistoryApiItem[];
  pagination?: PredictionHistoryPaginationApi | null;
};

type PredictionHistoryPaginationApi = {
  page?: number | string | null;
  limit?: number | string | null;
  total?: number | string | null;
  totalPages?: number | string | null;
  total_pages?: number | string | null;
};

type PredictionHistoryApiItem = {
  id?: string | number | null;
  fixtureId?: string | number | null;
  fixture_id?: string | number | null;
  matchId?: string | number | null;
  match_id?: string | number | null;
  predictedHomeScore?: number | null;
  predicted_home_score?: number | null;
  predictedAwayScore?: number | null;
  predicted_away_score?: number | null;
  actualHomeScore?: number | null;
  actual_home_score?: number | null;
  actualAwayScore?: number | null;
  actual_away_score?: number | null;
  pointsEarned?: number | null;
  points_earned?: number | null;
  status?: string | null;
  confidenceLevel?: string | null;
  confidence_level?: string | null;
  boostUsed?: boolean | null;
  boost_used?: boolean | null;
  firstScorerPlayerId?: string | number | null;
  first_scorer_player_id?: string | number | null;
  firstScorerPlayerName?: string | null;
  first_scorer_player_name?: string | null;
  firstScorer?: {
    name?: string | null;
  } | null;
  first_scorer?: {
    name?: string | null;
  } | null;
  createdAt?: string | null;
  created_at?: string | null;
  lockedAt?: string | null;
  locked_at?: string | null;
  halfTimeHome?: number | null;
  half_time_home?: number | null;
  halfTimeAway?: number | null;
  half_time_away?: number | null;
  totalGoals?: number | null;
  total_goals?: number | null;
  comboMultiplier?: number | null;
  combo_multiplier?: number | null;
  streakNumber?: number | null;
  streak_number?: number | null;
  pointsWagered?: number | null;
  points_wagered?: number | null;
  scoring?: ScoringApiBreakdown | null;
  score_breakdown?: ScoringApiBreakdown | null;
  breakdown?: ScoringApiBreakdown | null;
  scoringBreakdown?: ScoringApiBreakdown | null;
  resultType?: string | null;
  result_type?: string | null;
  predictedResult?: string | null;
  predicted_result?: string | null;
  actualResult?: string | null;
  actual_result_label?: string | null;
  match?: {
    homeTeam?: {
      name?: string | null;
      logo?: string | null;
    } | null;
    awayTeam?: {
      name?: string | null;
      logo?: string | null;
    } | null;
    home?: {
      name?: string | null;
      logo?: string | null;
    } | null;
    away?: {
      name?: string | null;
      logo?: string | null;
    } | null;
  } | null;
};

type PredictionHistoryItem = {
  id: string;
  matchId: string;
  home: string;
  away: string;
  homeLogo: string | null;
  awayLogo: string | null;
  predicted: string;
  actual: string;
  points: number;
  result: "correct" | "incorrect" | "pending" | "partial" | "void";
  resultType: string | null;
  confidenceLevel: string | null;
  boostUsed: boolean;
  firstScorerPlayerId: string | null;
  firstScorerPlayerName: string | null;
  createdAt: string | null;
  lockedAt: string | null;
  halfTimeHome: number | null;
  halfTimeAway: number | null;
  totalGoals: number | null;
  comboMultiplier: number;
  streakNumber: number;
  pointsWagered: number;
  scoring: ScoringApiBreakdown | null;
};

type PredictionHistoryStatusFilter = "all" | "pending" | "won" | "lost";
type PredictMatchFilter = "all" | "open" | "predicted" | "live";

type PredictionHistoryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

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

type ScoringRules = {
  resultTiers?: Record<
    string,
    {
      name?: string;
      description?: string;
      basePoints?: number;
      bonusPoints?: number;
      totalPoints?: number;
    }
  >;
  bonuses?: Record<string, { name?: string; points?: number }>;
  confidenceMultipliers?: Record<string, { name?: string; multiplier?: number }>;
  boost?: { name?: string; description?: string; multiplier?: number };
  streak?: { name?: string; description?: string; bonusPerLevel?: number; formula?: string };
  formula?: { description?: string; profit?: string };
};

type ScoringApiBreakdown = {
  stake?: number | null;
  base_points?: number | null;
  bonuses?: {
    result_tier?: { type?: string | null; points?: number | null } | null;
    first_scorer?: {
      earned?: boolean | null;
      predicted?: { player_id?: number | null } | null;
      actual?: { player_id?: number | null; player_name?: string | null } | null;
      points?: number | null;
    } | null;
    total_goals?: {
      earned?: boolean | null;
      predicted?: number | null;
      actual?: number | null;
      points?: number | null;
    } | null;
    half_time?: {
      earned?: boolean | null;
      predicted_home?: number | null;
      predicted_away?: number | null;
      actual_home?: number | null;
      actual_away?: number | null;
      actual?: {
        home?: number | null;
        away?: number | null;
      } | null;
      points?: number | null;
    } | null;
  } | null;
  subtotal_before_multipliers?: number | null;
  multipliers?: {
    confidence?: { level?: string | null; multiplier?: number | null } | null;
    boost?: { used?: boolean | null; multiplier?: number | null } | null;
    streak?: { streak_number?: number | null; bonus_per_level?: number | null; total?: number | null } | null;
  } | null;
  ranking_points?: number | null;
  profit?: number | null;
  total?: number | null;
};

type PredictPageCopy = {
  heroBadge: string;
  heroTitle: string;
  heroText: string;
  primaryCta: string;
  rulesCta: string;
  guestCta: string;
  skillFirst: string;
  noCash: string;
  aiReady: string;
  aiSignal: string;
  openForPrediction: string;
  startsIn: string;
  startsSoon: string;
  filtersTitle: string;
  filtersDescription: string;
  searchPlaceholder: string;
  allMatches: string;
  openMatches: string;
  predictedMatches: string;
  liveMatches: string;
  totalMatches: string;
  availableMatches: string;
  personalStats: string;
  platformPreview: string;
  accuracyLabel: string;
  pointsLabel: string;
  correctLabel: string;
  predictionsLabel: string;
  predictAction: string;
};

const PREDICT_PAGE_COPY: Record<LocaleCode, PredictPageCopy> = {
  th: {
    heroBadge: "ศูนย์ทายผลหลัก",
    heroTitle: "ทายผลบอลแบบใช้ทักษะ สะสมแต้ม และไต่อันดับ",
    heroText:
      "เลือกคู่ที่เปิดให้ทาย ตรวจบริบทแมตช์ ใช้ AI Insight ประกอบการตัดสินใจ แล้วส่งสกอร์ก่อนเริ่มแข่ง ไม่มีเงินจริงหรือการเดิมพัน",
    primaryCta: "ดูคู่ที่เปิดให้ทาย",
    rulesCta: "ดูกติกาคะแนน",
    guestCta: "สมัครเพื่อเริ่มทาย",
    skillFirst: "ใช้ทักษะฟุตบอล",
    noCash: "ไม่มีเงินจริง",
    aiReady: "ต่อยอดด้วย AI Insight",
    aiSignal: "AI",
    openForPrediction: "เปิดให้ทาย",
    startsIn: "เริ่มใน",
    startsSoon: "ใกล้เริ่ม",
    filtersTitle: "ค้นหาคู่ทายผล",
    filtersDescription: "กรองลีก ทีม สถานะคำทาย และคู่สดได้ในมุมมองเดียว",
    searchPlaceholder: "ค้นหาทีมหรือลีก...",
    allMatches: "ทั้งหมด",
    openMatches: "ยังไม่ทาย",
    predictedMatches: "ทายแล้ว",
    liveMatches: "สด",
    totalMatches: "คู่ทั้งหมด",
    availableMatches: "เปิดให้ทาย",
    personalStats: "สถิติของคุณ",
    platformPreview: "ภาพรวมสำหรับผู้เล่นใหม่",
    accuracyLabel: "ความแม่นยำ",
    pointsLabel: "แต้ม",
    correctLabel: "ทายถูก",
    predictionsLabel: "ทั้งหมด",
    predictAction: "ทายผลคู่นี้",
  },
  en: {
    heroBadge: "Primary Prediction Hub",
    heroTitle: "Predict football with skill, earn points, and climb the table",
    heroText:
      "Pick eligible fixtures, review match context, use AI Insight as support, and submit scores before kickoff. No real-money betting or cash wagering.",
    primaryCta: "View eligible matches",
    rulesCta: "Scoring rules",
    guestCta: "Create account",
    skillFirst: "Skill-first football",
    noCash: "No real-money betting",
    aiReady: "AI Insight ready",
    aiSignal: "AI",
    openForPrediction: "Open pick",
    startsIn: "Starts in",
    startsSoon: "Starting soon",
    filtersTitle: "Find prediction matches",
    filtersDescription: "Filter by league, team, prediction status, and live fixtures in one view.",
    searchPlaceholder: "Search team or league...",
    allMatches: "All",
    openMatches: "Unpredicted",
    predictedMatches: "Predicted",
    liveMatches: "Live",
    totalMatches: "Total matches",
    availableMatches: "Open picks",
    personalStats: "Your stats",
    platformPreview: "New player preview",
    accuracyLabel: "Accuracy",
    pointsLabel: "Points",
    correctLabel: "Correct",
    predictionsLabel: "Total",
    predictAction: "Predict match",
  },
  lo: {
    heroBadge: "ສູນທາຍຜົນຫຼັກ",
    heroTitle: "ທາຍຜົນບານດ້ວຍທັກສະ ສະສົມແຕ້ມ ແລະ ໄຕ່ອັນດັບ",
    heroText:
      "ເລືອກຄູ່ທີ່ເປີດໃຫ້ທາຍ, ກວດບໍລິບົດແມັດ, ໃຊ້ AI Insight ແລະ ສົ່ງສະກໍກ່ອນເລີ່ມແຂ່ງ ໂດຍບໍ່ມີເງິນຈິງ.",
    primaryCta: "ເບິ່ງຄູ່ທີ່ທາຍໄດ້",
    rulesCta: "ກະຕິກາຄະແນນ",
    guestCta: "ສ້າງບັນຊີ",
    skillFirst: "ເນັ້ນທັກສະບານ",
    noCash: "ບໍ່ມີເງິນຈິງ",
    aiReady: "ພ້ອມ AI Insight",
    aiSignal: "AI",
    openForPrediction: "ເປີດໃຫ້ທາຍ",
    startsIn: "ເລີ່ມໃນ",
    startsSoon: "ໃກ້ເລີ່ມ",
    filtersTitle: "ຄົ້ນຫາຄູ່ທາຍຜົນ",
    filtersDescription: "ກັ່ນຕອງລີກ, ທີມ, ສະຖານະຄຳທາຍ ແລະ ຄູ່ສົດ.",
    searchPlaceholder: "ຄົ້ນຫາທີມ ຫຼື ລີກ...",
    allMatches: "ທັງໝົດ",
    openMatches: "ຍັງບໍ່ທາຍ",
    predictedMatches: "ທາຍແລ້ວ",
    liveMatches: "ສົດ",
    totalMatches: "ຄູ່ທັງໝົດ",
    availableMatches: "ເປີດໃຫ້ທາຍ",
    personalStats: "ສະຖິຕິຂອງທ່ານ",
    platformPreview: "ພາບລວມຜູ້ໃຊ້ໃໝ່",
    accuracyLabel: "ຄວາມແມ່ນຍຳ",
    pointsLabel: "ແຕ້ມ",
    correctLabel: "ຖືກ",
    predictionsLabel: "ທັງໝົດ",
    predictAction: "ທາຍຄູ່ນີ້",
  },
  my: {
    heroBadge: "Prediction Hub",
    heroTitle: "Skill ဖြင့် ဘောလုံးခန့်မှန်းပြီး points စုကာ ranking တက်ပါ",
    heroText:
      "ခန့်မှန်းနိုင်သောပွဲများကိုရွေး၊ match context နှင့် AI Insight ကိုစစ်ပြီး kickoff မတိုင်မီ score တင်ပါ။ Real-money betting မရှိပါ။",
    primaryCta: "ခန့်မှန်းနိုင်သောပွဲများ",
    rulesCta: "Scoring rules",
    guestCta: "Account ဖွင့်ရန်",
    skillFirst: "Skill-first football",
    noCash: "Real money မရှိ",
    aiReady: "AI Insight ပါသည်",
    aiSignal: "AI",
    openForPrediction: "Open pick",
    startsIn: "Starts in",
    startsSoon: "Starting soon",
    filtersTitle: "Prediction matches ရှာရန်",
    filtersDescription: "League, team, prediction status နှင့် live fixtures ကို filter လုပ်ပါ။",
    searchPlaceholder: "Team သို့မဟုတ် league ရှာပါ...",
    allMatches: "အားလုံး",
    openMatches: "မခန့်မှန်းရသေး",
    predictedMatches: "ခန့်မှန်းပြီး",
    liveMatches: "Live",
    totalMatches: "စုစုပေါင်း",
    availableMatches: "Open picks",
    personalStats: "သင့် stats",
    platformPreview: "New player preview",
    accuracyLabel: "Accuracy",
    pointsLabel: "Points",
    correctLabel: "Correct",
    predictionsLabel: "Total",
    predictAction: "Predict match",
  },
  km: {
    heroBadge: "មជ្ឈមណ្ឌលទស្សន៍ទាយ",
    heroTitle: "ទស្សន៍ទាយបាល់ទាត់ដោយជំនាញ សន្សំពិន្ទុ និងឡើងចំណាត់ថ្នាក់",
    heroText:
      "ជ្រើសការប្រកួតដែលអាចទាយបាន ពិនិត្យបរិបទ ប្រើ AI Insight ហើយដាក់ពិន្ទុមុនចាប់ផ្តើម។ មិនមានការភ្នាល់ប្រាក់ពិត។",
    primaryCta: "មើលការប្រកួតដែលអាចទាយបាន",
    rulesCta: "ច្បាប់ពិន្ទុ",
    guestCta: "បង្កើតគណនី",
    skillFirst: "ផ្អែកលើជំនាញ",
    noCash: "គ្មានប្រាក់ពិត",
    aiReady: "មាន AI Insight",
    aiSignal: "AI",
    openForPrediction: "បើកឱ្យទាយ",
    startsIn: "ចាប់ផ្តើមក្នុង",
    startsSoon: "ជិតចាប់ផ្តើម",
    filtersTitle: "ស្វែងរកការប្រកួតទស្សន៍ទាយ",
    filtersDescription: "តម្រងលីគ ក្រុម ស្ថានភាព និងការប្រកួតផ្ទាល់ក្នុងមួយទំព័រ។",
    searchPlaceholder: "ស្វែងរកក្រុម ឬ លីគ...",
    allMatches: "ទាំងអស់",
    openMatches: "មិនទាន់ទាយ",
    predictedMatches: "ទាយរួច",
    liveMatches: "ផ្ទាល់",
    totalMatches: "ការប្រកួតសរុប",
    availableMatches: "បើកឱ្យទាយ",
    personalStats: "ស្ថិតិរបស់អ្នក",
    platformPreview: "ទិដ្ឋភាពអ្នកលេងថ្មី",
    accuracyLabel: "ភាពត្រឹមត្រូវ",
    pointsLabel: "ពិន្ទុ",
    correctLabel: "ត្រឹមត្រូវ",
    predictionsLabel: "សរុប",
    predictAction: "ទាយការប្រកួតនេះ",
  },
  zh: {
    heroBadge: "预测主中心",
    heroTitle: "用足球判断预测比分，累积积分并冲击排名",
    heroText:
      "选择可预测赛程，查看比赛背景，用 AI Insight 辅助判断，并在开赛前提交比分。无真钱投注或现金下注。",
    primaryCta: "查看可预测比赛",
    rulesCta: "计分规则",
    guestCta: "创建账号",
    skillFirst: "技巧型足球",
    noCash: "无真钱投注",
    aiReady: "支持 AI Insight",
    aiSignal: "AI",
    openForPrediction: "可预测",
    startsIn: "开始于",
    startsSoon: "即将开始",
    filtersTitle: "查找预测比赛",
    filtersDescription: "按联赛、球队、预测状态和实时比赛筛选。",
    searchPlaceholder: "搜索球队或联赛...",
    allMatches: "全部",
    openMatches: "未预测",
    predictedMatches: "已预测",
    liveMatches: "实时",
    totalMatches: "比赛总数",
    availableMatches: "可预测",
    personalStats: "你的数据",
    platformPreview: "新玩家概览",
    accuracyLabel: "准确率",
    pointsLabel: "积分",
    correctLabel: "正确",
    predictionsLabel: "总数",
    predictAction: "预测本场",
  },
};

function getPredictPageCopy(locale: string): PredictPageCopy {
  return PREDICT_PAGE_COPY[locale as LocaleCode] ?? PREDICT_PAGE_COPY.en;
}

export function PredictApi() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const copy = getPredictPageCopy(locale);
  const scoreCopy = getScoringBreakdownCopy(locale);
  const pathname = usePathname();
  const [tab, setTab] = useState("upcoming");
  const [matches, setMatches] = useState<PredictableMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matchesRequestFailed, setMatchesRequestFailed] = useState(false);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyRequestFailed, setHistoryRequestFailed] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] =
    useState<PredictionHistoryStatusFilter>("all");
  const [historyDateFilter, setHistoryDateFilter] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(20);
  const [matchSearch, setMatchSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState<PredictMatchFilter>("all");
  const [historyPagination, setHistoryPagination] =
    useState<PredictionHistoryPagination>({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });
  const [selectedPrediction, setSelectedPrediction] =
    useState<PredictionHistoryItem | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const isLoggedIn = useUserStore((store) => store.isLoggedIn);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const effectiveIsLoggedIn = mounted ? isLoggedIn : false;

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [scoringRules, setScoringRules] = useState<ScoringRules | null>(null);
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesRequestFailed, setRulesRequestFailed] = useState(false);

  const predictedMatchIds = useMemo(
    () => new Set(history.map((item) => item.matchId)),
    [history]
  );
  const matchSummary = useMemo(() => {
    const predicted = matches.filter((match) => match.hasPredicted || predictedMatchIds.has(match.id)).length;
    const live = matches.filter((match) => match.isLive || match.status === MatchStatus.LIVE).length;
    return {
      total: matches.length,
      predicted,
      open: Math.max(0, matches.length - predicted),
      live,
      leagues: new Set(matches.map((match) => match.leagueKey)).size,
    };
  }, [matches, predictedMatchIds]);

  const filteredMatches = useMemo(() => {
    const q = matchSearch.trim().toLowerCase();

    return matches.filter((match) => {
      const hasPredicted = match.hasPredicted || predictedMatchIds.has(match.id);
      if (matchFilter === "open" && hasPredicted) return false;
      if (matchFilter === "predicted" && !hasPredicted) return false;
      if (matchFilter === "live" && !(match.isLive || match.status === MatchStatus.LIVE)) return false;

      if (!q) return true;

      return (
        match.home.name.toLowerCase().includes(q) ||
        match.away.name.toLowerCase().includes(q) ||
        match.league.name.toLowerCase().includes(q)
      );
    });
  }, [matchFilter, matchSearch, matches, predictedMatchIds]);

  const groupedMatches = useMemo(
    () => groupPredictableMatchesByLeague(filteredMatches),
    [filteredMatches]
  );

  const stats = useMemo(() => {
    const total = historyPagination.total || history.length;
    const correct = history.filter((item) => item.result === "correct").length;
    const points = history.reduce((sum, item) => sum + item.points, 0);
    const accuracy = history.length > 0 ? Math.round((correct / history.length) * 100) : 0;
    return { total, correct, points, accuracy };
  }, [history, historyPagination.total]);

  const loadScoringRules = useCallback(async () => {
    if (scoringRules || loadingRules) return;

    setLoadingRules(true);
    setRulesRequestFailed(false);
    try {
      const resp = await apiGetRaw<{ data?: ScoringRules } & ScoringRules>(
        "/scoring-rules",
        { locale }
      );
      setScoringRules(resp?.data ?? resp);
    } catch (error) {
      console.error("Error loading scoring rules:", error);
      setRulesRequestFailed(true);
    } finally {
      setLoadingRules(false);
    }
  }, [loadingRules, locale, scoringRules]);

  const openRulesModal = useCallback(() => {
    setShowRulesModal(true);
    void loadScoringRules();
  }, [loadScoringRules, setShowRulesModal]);

  const handleSelectPrediction = (item: PredictionHistoryItem) => {
    setPlayerName(null);
    setLoadingPlayer(false);
    setSelectedPrediction(item);
  };

  const handleClosePrediction = () => {
    setSelectedPrediction(null);
    setPlayerName(null);
    setLoadingPlayer(false);
  };

  const updateHistoryStatusFilter = (nextStatus: PredictionHistoryStatusFilter) => {
    setHistoryStatusFilter(nextStatus);
    setHistoryPage(1);
  };

  const updateHistoryDateFilter = (nextDate: string) => {
    setHistoryDateFilter(nextDate);
    setHistoryPage(1);
  };

  const updateHistoryLimit = (nextLimit: number) => {
    setHistoryLimit(nextLimit);
    setHistoryPage(1);
  };

  const resetHistoryFilters = () => {
    setHistoryStatusFilter("all");
    setHistoryDateFilter("");
    setHistoryLimit(20);
    setHistoryPage(1);
  };

  useEffect(() => {
    let cancelled = false;

    const loadMatches = async () => {
      setLoadingMatches(true);

      try {
        setMatchesRequestFailed(false);
        const response = await apiGetRaw<PredictableMatchResponse>(
          "/predictable-matches?excludePredicted=false",
          {
            locale,
            token: isLoggedIn ? undefined : null,
          }
        );

        if (!cancelled) {
          setMatches(normalizePredictableMatches(response.data));
        }
      } catch (error) {
        if (!cancelled) {
          if (!isAuthSessionExpiredError(error)) {
            console.error("Error loading predictable matches:", error);
          }
          setMatches([]);
          setMatchesRequestFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingMatches(false);
        }
      }
    };

    void loadMatches();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, locale]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      setLoadingHistory(true);
      setHistoryRequestFailed(false);

      try {
        const query = new URLSearchParams({
          page: String(historyPage),
          limit: String(historyLimit),
        });

        if (historyStatusFilter !== "all") {
          query.set("status", historyStatusFilter);
        }

        if (isValidDateFilter(historyDateFilter)) {
          query.set("date", historyDateFilter);
        }

        const response = await apiGetRaw<PredictionHistoryApiResponse>(
          `/predictions?${query.toString()}`,
          { locale }
        );

        if (!cancelled) {
          setHistory(normalizePredictionHistory(response.data, matches));
          setHistoryPagination(
            normalizeHistoryPagination(response.pagination, historyPage, historyLimit)
          );
        }
      } catch (error) {
        if (!cancelled && !isAuthSessionExpiredError(error)) {
          console.error("Error loading prediction history:", error);
          setHistory([]);
          setHistoryRequestFailed(true);
          setHistoryPagination({
            page: historyPage,
            limit: historyLimit,
            total: 0,
            totalPages: 1,
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [
    historyDateFilter,
    historyLimit,
    historyPage,
    historyStatusFilter,
    isLoggedIn,
    locale,
    matches,
  ]);

  useEffect(() => {
    if (!selectedPrediction || !selectedPrediction.firstScorerPlayerId) return;
    if (selectedPrediction.firstScorerPlayerName) return;

    const firstScorerPlayerId = selectedPrediction.firstScorerPlayerId;
    const controller = new AbortController();

    const loadPlayerName = async () => {
      setLoadingPlayer(true);
      setPlayerName(null);

      try {
        const response = await fetch(
          `/api/football/players/${encodeURIComponent(firstScorerPlayerId)}`,
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
        setPlayerName(getPlayerNameFromProfilePayload(payload));
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setPlayerName(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingPlayer(false);
        }
      }
    };

    void loadPlayerName();

    return () => {
      controller.abort();
    };
  }, [selectedPrediction]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (selectedPrediction) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPrediction]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8 px-4 sm:px-0">
      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card
          neon="cyan"
          className="relative overflow-hidden border-cyan-300/20 bg-[#08111b] p-4 md:p-6"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-200 via-sky-400 to-transparent" />
          <div className="absolute right-0 top-0 h-full w-40 bg-[linear-gradient(135deg,transparent_0%,rgba(34,211,238,0.08)_42%,transparent_43%,transparent_58%,rgba(59,130,246,0.08)_59%,transparent_100%)] pointer-events-none" />

          <div className="relative flex min-h-0 flex-col justify-center gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-cyan-300">
                <Sparkles size={11} aria-hidden="true" />
                {copy.heroBadge}
              </div>
              <h1 className="mt-3 max-w-3xl font-display text-3xl font-black leading-tight text-white md:text-5xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-gray-400 md:text-base md:leading-7">
                {copy.heroText}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { icon: Target, label: copy.skillFirst, tone: "text-cyan-200" },
                { icon: ShieldCheck, label: copy.noCash, tone: "text-emerald-200" },
                { icon: Brain, label: copy.aiReady, tone: "text-violet-200" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-black text-gray-300"
                  >
                    <Icon size={15} className={item.tone} aria-hidden="true" />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="#predict-matches"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3.5 py-2 text-sm font-black text-black transition-colors hover:bg-cyan-400"
              >
                <Target size={15} aria-hidden="true" />
                {copy.primaryCta}
              </Link>
              <button
                type="button"
                onClick={openRulesModal}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-600 px-3.5 py-2 text-sm font-bold text-gray-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
              >
                <Medal size={15} aria-hidden="true" />
                {copy.rulesCta}
              </button>
              {!effectiveIsLoggedIn && (
                <Link
                  href={`/${locale}/auth/register?next=${encodeURIComponent(pathname)}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-3.5 py-2 text-sm font-bold text-emerald-100 transition-colors hover:border-emerald-300/50"
                >
                  <LogIn size={15} aria-hidden="true" />
                  {copy.guestCta}
                </Link>
              )}
            </div>
          </div>
        </Card>

        <Card className="grid grid-cols-2 gap-2 border-cyan-300/10 bg-[#090b10] p-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="col-span-2 flex items-center justify-between px-1 pb-1">
            <p className="text-xs font-black uppercase tracking-wide text-cyan-300">
              {effectiveIsLoggedIn ? copy.personalStats : copy.platformPreview}
            </p>
            {!effectiveIsLoggedIn && (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-1 text-[10px] font-black text-emerald-200">
                {copy.noCash}
              </span>
            )}
          </div>
          {[
            {
              label: copy.predictionsLabel,
              shortLabel: copy.predictionsLabel,
              value: effectiveIsLoggedIn ? stats.total : matchSummary.total,
              color: "text-cyan-400",
              indicatorBg: "bg-cyan-500",
              glowColor: "shadow-[0_0_8px_rgba(56,189,248,0.5)]",
              icon: Users,
            },
            {
              label: copy.correctLabel,
              shortLabel: copy.correctLabel,
              value: effectiveIsLoggedIn ? stats.correct : matchSummary.open,
              color: "text-green-400",
              indicatorBg: "bg-green-500",
              glowColor: "shadow-[0_0_8px_rgba(16,185,129,0.5)]",
              icon: CheckCheck,
            },
            {
              label: copy.accuracyLabel,
              shortLabel: copy.accuracyLabel,
              value: effectiveIsLoggedIn ? `${stats.accuracy}%` : matchSummary.live,
              color: "text-amber-400",
              indicatorBg: "bg-amber-500",
              glowColor: "shadow-[0_0_8px_rgba(245,158,11,0.5)]",
              icon: effectiveIsLoggedIn ? ShieldCheck : Timer,
            },
            {
              label: copy.pointsLabel,
              shortLabel: copy.pointsLabel,
              value: effectiveIsLoggedIn ? stats.points.toLocaleString() : matchSummary.leagues,
              color: "text-emerald-400",
              indicatorBg: "bg-emerald-500",
              glowColor: "shadow-[0_0_8px_rgba(16,185,129,0.5)]",
              icon: effectiveIsLoggedIn ? Trophy : CalendarDays,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                title={item.label}
                aria-label={`${item.label}: ${item.value}`}
                className="group relative flex min-h-[64px] items-center justify-between gap-2 overflow-hidden rounded-xl border border-white/10 bg-[#0c111a] p-3 transition-colors hover:border-cyan-300/25"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03]", item.color)}>
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black leading-5 text-white">
                      {item.shortLabel}
                    </p>
                    <span className={cn("mt-1 block h-1 w-8 rounded-full", item.indicatorBg, item.glowColor)} />
                  </div>
                </div>
                <p className={cn("shrink-0 font-mono text-2xl font-black leading-none md:text-3xl", item.color)}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </Card>
      </section>

      <Card
        id="predict-matches"
        className="relative overflow-hidden border-cyan-300/15 bg-[#07080b] p-0 shadow-[0_18px_70px_rgba(0,0,0,0.32)]"
      >
        {/* Esports accent line */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500/70" />

        {/* Card Header containing Tabs */}
        <div className="mt-[2px] flex flex-col border-b border-cyan-300/10 bg-gradient-to-r from-[#0d111a] via-[#07080b] to-[#0d111a] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            tabs={[
              {
                key: "upcoming",
                label: t("prediction.upcomingMatches"),
                count: filteredMatches.length,
              },
              {
                key: "history",
                label: t("prediction.predictionHistory"),
                count: effectiveIsLoggedIn ? historyPagination.total : undefined,
              },
            ]}
            activeTab={tab}
            onChange={setTab}
            className="border-b-0 bg-transparent py-0 h-auto"
          />
          <div className="flex items-center gap-2 py-2 sm:py-0 self-end sm:self-auto">
            {tab === "upcoming" ? (
              <Badge variant="cyan" size="sm" className="font-bold tracking-wide">
                {copy.totalMatches} {matches.length}
              </Badge>
            ) : (
              effectiveIsLoggedIn && (
                <Badge variant="green" size="sm" className="font-bold tracking-wide">
                  {t("prediction.historyTotal", { total: historyPagination.total })}
                </Badge>
              )
            )}
          </div>
        </div>

        <div className="bg-[#050508] p-3 sm:p-4">
          {tab === "upcoming" ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-cyan-300/10 bg-[#080d14] p-3">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-black text-white">
                      <ListFilter size={15} className="text-cyan-300" aria-hidden="true" />
                      {copy.filtersTitle}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-gray-500">
                      {copy.filtersDescription}
                    </p>
                  </div>
                  {(matchSearch || matchFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setMatchSearch("");
                        setMatchFilter("all");
                      }}
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-700/80 px-2.5 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-200"
                    >
                      <X size={13} aria-hidden="true" />
                      {t("matches.clearFilters")}
                    </button>
                  )}
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto] lg:items-center">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      aria-hidden="true"
                    />
                    <input
                      value={matchSearch}
                      onChange={(event) => setMatchSearch(event.target.value)}
                      placeholder={copy.searchPlaceholder}
                      className="min-h-10 w-full rounded-lg border border-gray-700 bg-black/30 py-2 pl-9 pr-10 text-sm font-semibold text-white placeholder-gray-500 outline-none transition-colors focus:border-cyan-300/50"
                    />
                    {matchSearch && (
                      <button
                        type="button"
                        onClick={() => setMatchSearch("")}
                        aria-label={t("matches.clearSearch")}
                        className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-cyan-200"
                      >
                        <X size={13} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-wrap gap-2">
                    {([
                      ["all", copy.allMatches, matchSummary.total],
                      ["open", copy.openMatches, matchSummary.open],
                      ["predicted", copy.predictedMatches, matchSummary.predicted],
                      ["live", copy.liveMatches, matchSummary.live],
                    ] as const).map(([key, label, count]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMatchFilter(key)}
                        className={cn(
                          "inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black transition-colors",
                          matchFilter === key
                            ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                            : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-cyan-300/30 hover:text-cyan-200"
                        )}
                      >
                        <span>{label}</span>
                        <span className="font-mono text-[11px] opacity-80">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loadingMatches ? (
                <div className="space-y-3 animate-pulse">
                  <div className="rounded-xl border border-gray-800 bg-[#0c0d12] divide-y divide-gray-800/50">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="grid min-h-12 grid-cols-[118px_minmax(160px,1fr)_64px_minmax(160px,1fr)_160px] items-center gap-3 px-5 py-2.5"
                      >
                        <Skeleton className="h-4 w-12 rounded" />
                        <div className="flex items-center gap-2 justify-end">
                          <Skeleton className="h-3.5 w-20 rounded" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-7 w-12 mx-auto rounded" />
                        <div className="flex items-center gap-2 justify-start">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-3.5 w-20 rounded" />
                        </div>
                        <Skeleton className="h-7 w-16 justify-self-end rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : matchesRequestFailed ? (
                <EmptyState
                  title={t("prediction.loadingUnavailableTitle")}
                  description={t("prediction.loadingUnavailableDescription")}
                />
              ) : matches.length === 0 ? (
                <EmptyState
                  title={t("prediction.noUpcomingMatches")}
                  description={t("prediction.checkBackLater")}
                />
              ) : filteredMatches.length === 0 ? (
                <EmptyState
                  icon={<Search size={28} />}
                  title={t("prediction.noMatchesAfterFilterTitle")}
                  description={t("prediction.noMatchesAfterFilterDescription")}
                />
              ) : (
                <div className="space-y-3">
                    {groupedMatches.map((group) => (
                      <div key={group.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 px-1 py-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <ApiLeagueLogo
                              name={group.league.name}
                              logo={group.league.logo}
                              size="xl"
                            />
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="min-w-0 truncate text-[13px] font-black uppercase tracking-[0.11em] text-cyan-100/85 sm:text-sm">
                                  {group.league.name}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] px-2.5 font-mono text-xs font-black text-cyan-100/85">
                            <span>{group.matches.length}</span>
                            <span className="font-sans text-[10px] uppercase tracking-wide text-cyan-200/75">
                              {t("matches.metricMatches")}
                            </span>
                          </span>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#07080b] shadow-[0_14px_44px_rgba(0,0,0,0.24)]">
                          <div className="hidden md:grid grid-cols-[190px_minmax(150px,1fr)_58px_minmax(150px,1fr)_138px] items-center gap-3 border-b border-cyan-300/10 bg-[#0d111a] px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-300">
                            <div className="pl-1">
                              {t("matches.dateFilter")} / {t("football.table.time")}
                            </div>
                            <div className="text-right pr-2">{t("football.table.home")}</div>
                            <div className="text-center">VS</div>
                            <div className="text-left pl-2">{t("football.table.away")}</div>
                            <div className="text-right pr-1">{t("prediction.predictResult")}</div>
                          </div>
                          <div className="divide-y divide-white/[0.06]">
                            {group.matches.map((match, index) => {
                              const hasPredicted =
                                match.hasPredicted || predictedMatchIds.has(match.id);
                              const predictMatchHref = buildPredictMatchHref(
                                locale,
                                match.id,
                                match.home.id ?? "",
                                match.away.id ?? ""
                              );

                              return (
                                <PredictMatchRow
                                  key={match.id}
                                  match={match}
                                  index={index}
                                  locale={locale}
                                  t={t}
                                  isLoggedIn={effectiveIsLoggedIn}
                                  hasPredicted={hasPredicted}
                                  predictMatchHref={predictMatchHref}
                                  copy={copy}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {effectiveIsLoggedIn ? (
                <div className="rounded-2xl border border-cyan-300/10 bg-[#080d14] p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-cyan-300">
                        <Search size={13} />
                        {t("prediction.historySearch")}
                      </label>
                      <div className="grid gap-2 sm:grid-cols-[1fr_180px_120px]">
                        <div className="flex min-w-0 flex-wrap gap-2">
                          {(["all", "pending", "won", "lost"] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateHistoryStatusFilter(status)}
                              className={cn(
                                "min-h-9 rounded-lg border px-3 text-xs font-black uppercase tracking-wide transition-colors",
                                historyStatusFilter === status
                                  ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                                  : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-cyan-300/30 hover:text-cyan-200"
                              )}
                            >
                              {t(`prediction.historyStatus.${status}`)}
                            </button>
                          ))}
                        </div>

                        <input
                          type="date"
                          value={historyDateFilter}
                          onChange={(event) => updateHistoryDateFilter(event.target.value)}
                          className="min-h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-sm font-semibold text-gray-200 outline-none transition-colors [color-scheme:dark] hover:border-cyan-300/30 focus:border-cyan-300/50"
                          aria-label={t("prediction.historyDate")}
                        />

                        <select
                          value={historyLimit}
                          onChange={(event) => updateHistoryLimit(Number(event.target.value))}
                          className="min-h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-sm font-semibold text-gray-200 outline-none transition-colors [color-scheme:dark] hover:border-cyan-300/30 focus:border-cyan-300/50"
                          aria-label={t("prediction.historyLimit")}
                        >
                          {[20, 50].map((limit) => (
                            <option key={limit} value={limit}>
                              {t("prediction.historyLimitOption", { limit })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetHistoryFilters}
                      className="self-start lg:self-auto"
                    >
                      {t("prediction.historyReset")}
                    </Button>
                  </div>
                </div>
              ) : null}

              {!effectiveIsLoggedIn ? (
                <EmptyState
                  title={t("prediction.predictionHistory")}
                  description={t("prediction.filterHelpGuest")}
                  action={
                    <Link href={`/${locale}/auth/login?next=${encodeURIComponent(pathname)}`}>
                      <Button variant="outline" size="sm">
                        <LogIn size={14} />
                        {t("prediction.signIn")}
                      </Button>
                    </Link>
                  }
                />
              ) : loadingHistory ? (
                <div className="space-y-3 animate-pulse">
                  <div className="rounded-xl border border-gray-800 bg-[#0c0d12] divide-y divide-gray-800/50">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="grid min-h-12 grid-cols-[130px_140px_1fr_120px_1fr_120px] items-center gap-2 px-5 py-2.5"
                      >
                        <Skeleton className="h-4 w-16 rounded" />
                        <Skeleton className="h-4.5 w-24 rounded" />
                        <div className="flex items-center gap-2 justify-end">
                          <Skeleton className="h-3.5 w-20 rounded" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-7 w-12 mx-auto rounded" />
                        <div className="flex items-center gap-2 justify-start">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-3.5 w-20 rounded" />
                        </div>
                        <Skeleton className="h-7 w-12 justify-self-end rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : historyRequestFailed ? (
                <EmptyState
                  title={t("prediction.historyUnavailableTitle")}
                  description={t("prediction.historyUnavailableDescription")}
                />
              ) : history.length === 0 ? (
                <EmptyState
                  title={t("prediction.noPredictions")}
                  description={
                    historyStatusFilter !== "all" || historyDateFilter
                      ? t("prediction.noPredictionsAfterFilter")
                      : t("prediction.startPredictingHistory")
                  }
                />
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-800/70 bg-[#07080b]">
                    {/* Desktop Table Header */}
                    <div className="hidden md:grid grid-cols-[130px_140px_1fr_120px_1fr_120px] items-center gap-2 px-5 py-2.5 bg-[#0d0e14] border-b border-gray-800/80 text-[10px] uppercase font-extrabold tracking-widest text-gray-500">
                      <div className="pl-1">{t("prediction.historySubmittedStatus")}</div>
                      <div>{t("prediction.historyMatch")}</div>
                      <div className="text-right pr-5">{t("football.table.home")}</div>
                      <div className="text-center">{t("prediction.historyScoreColumn")}</div>
                      <div className="text-left pl-5">{t("football.table.away")}</div>
                      <div className="text-right pr-4">{t("prediction.pointsEarned")}</div>
                    </div>
                    <div className="divide-y divide-gray-800/30">
                      {history.map((item, index) => (
                        <HistoryMatchRow
                          key={item.id}
                          item={item}
                          index={index}
                          locale={locale}
                          t={t}
                          onClick={() => handleSelectPrediction(item)}
                        />
                      ))}
                    </div>
                  </div>
                  <HistoryPaginationControls
                    pagination={historyPagination}
                    loading={loadingHistory}
                    t={t}
                    onPageChange={setHistoryPage}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </Card>

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

      {selectedPrediction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={handleClosePrediction}
          />

          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#060913] shadow-2xl shadow-cyan-950/30">
            <button
              onClick={handleClosePrediction}
              className="absolute right-4 top-4 z-10 rounded-full border border-gray-800 bg-black/40 p-1.5 text-gray-500 transition-all duration-200 hover:border-cyan-500/50 hover:text-cyan-300"
              aria-label="Close prediction history modal"
            >
              <X size={14} />
            </button>

            <div className="overflow-y-auto p-6">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
                    {scoreCopy.receipt}
                  </span>
                  <p className="mt-2 text-xs text-gray-500">
                    {formatHistoryTimestamp(selectedPrediction.createdAt, locale)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {selectedPrediction.home} vs {selectedPrediction.away}
                  </p>
                </div>
                <Badge
                  variant={toHistoryBadgeVariant(selectedPrediction.result)}
                  className="shrink-0 px-2.5 py-1 text-[11px]"
                >
                  {t(`prediction.${selectedPrediction.result}`)}
                </Badge>
              </div>

              <div className="space-y-5">
                {selectedPrediction.result === "void" && (
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-700/60 bg-gray-900/60 px-4 py-3">
                    <span className="mt-0.5 shrink-0 text-base">⚠️</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-300">การแข่งขันนี้ถูกโมฆะ</p>
                      <p className="mt-0.5 text-xs text-gray-500">แมตช์นี้ถูกเลื่อนหรือยกเลิก — คะแนนที่ได้รับเท่ากับ 0</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-[1.25fr_0.95fr]">
                  <div className="rounded-2xl border border-gray-800/80 bg-black/40 p-4">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <HistoryTeam
                        name={selectedPrediction.home}
                        logo={selectedPrediction.homeLogo}
                        accent="cyan"
                      />

                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/6 px-4 py-3 text-center font-mono">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-cyan-300/80">
                          {t("prediction.yourPrediction")}
                        </div>
                        <div className="mt-1 text-3xl font-black text-cyan-300">
                          {selectedPrediction.predicted}
                        </div>
                      </div>

                      <HistoryTeam
                        name={selectedPrediction.away}
                        logo={selectedPrediction.awayLogo}
                        accent="magenta"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <HistoryOutcomeCard
                        label={t("prediction.yourPrediction")}
                        value={selectedPrediction.predicted}
                        valueClassName="text-cyan-300"
                        toneClassName="border-cyan-500/15 bg-cyan-500/5"
                      />
                      <HistoryOutcomeCard
                        label={t("prediction.actualResult")}
                        value={selectedPrediction.actual}
                        valueClassName="text-white"
                        toneClassName="border-emerald-500/15 bg-emerald-500/5"
                      />
                    </div>
                  </div>

                  <div className={cn(
                    "rounded-2xl border p-4",
                    selectedPrediction.result === "void"
                      ? "border-gray-700/40 bg-gray-900/30"
                      : "border-emerald-500/20 bg-emerald-500/5"
                  )}>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                      <HistorySummaryStat
                        label={t("prediction.pointsEarned")}
                        value={`+${selectedPrediction.points} ${scoreCopy.pointsAbbr}`}
                        valueClassName={selectedPrediction.result === "void" ? "text-gray-400" : "text-emerald-300"}
                      />
                      <HistorySummaryStat
                        label={scoreCopy.result}
                        value={t(`prediction.${selectedPrediction.result}`)}
                        valueClassName={historyTierTextClass(selectedPrediction.result)}
                      />
                      {selectedPrediction.resultType && selectedPrediction.result !== "void" && (
                        <HistorySummaryStat
                          label={scoreCopy.resultType}
                          value={formatResultType(selectedPrediction.resultType, scoreCopy)}
                          valueClassName="text-amber-300"
                        />
                      )}
                      <HistorySummaryStat
                        label={scoreCopy.confidence}
                        value={formatHistoryConfidence(selectedPrediction.confidenceLevel, scoreCopy)}
                        valueClassName="text-violet-300"
                      />
                      <HistorySummaryStat
                        label={scoreCopy.boost}
                        value={selectedPrediction.boostUsed ? scoreCopy.on : scoreCopy.off}
                        valueClassName={
                          selectedPrediction.boostUsed
                            ? "text-fuchsia-300"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </div>

                {selectedPrediction.scoring ? (
                  <ScoringBreakdownSection
                    scoring={selectedPrediction.scoring}
                    prediction={selectedPrediction}
                    firstScorerPlayerName={
                      loadingPlayer
                        ? null
                        : selectedPrediction.firstScorerPlayerName || playerName || null
                    }
                  />
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <HistoryModalSection
                      title={scoreCopy.predictionSetup}
                      tone="text-cyan-300"
                      className="border-cyan-500/10"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <HistoryModalMetric
                          label={t("predictionForm.payload.pointsWagered")}
                          value={`${Number(selectedPrediction.pointsWagered).toLocaleString()} ${scoreCopy.pointsAbbr}`}
                          valueClassName="text-cyan-300"
                        />
                        <HistoryModalMetric
                          label={t("prediction.combo")}
                          value={`x${selectedPrediction.comboMultiplier}`}
                          valueClassName="text-amber-300"
                        />
                        <HistoryModalMetric
                          label={t("prediction.streak")}
                          value={String(selectedPrediction.streakNumber)}
                          valueClassName="text-emerald-300"
                        />
                        <HistoryModalMetric
                          label={scoreCopy.boost}
                          value={selectedPrediction.boostUsed ? scoreCopy.on : scoreCopy.off}
                          valueClassName={
                            selectedPrediction.boostUsed
                              ? "text-fuchsia-300"
                              : "text-gray-300"
                          }
                        />
                      </div>
                    </HistoryModalSection>

                    <HistoryModalSection
                      title="Extra Picks"
                      tone="text-fuchsia-300"
                      className="border-fuchsia-500/10"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <HistoryModalMetric
                          label={t("predictionForm.summary.halfTime")}
                          value={
                            selectedPrediction.halfTimeHome !== null &&
                            selectedPrediction.halfTimeAway !== null
                              ? `${selectedPrediction.halfTimeHome} - ${selectedPrediction.halfTimeAway}`
                              : "-"
                          }
                        />
                        <HistoryModalMetric
                          label={t("predictionForm.deep.totalGoals")}
                          value={
                            selectedPrediction.totalGoals !== null
                              ? String(selectedPrediction.totalGoals)
                              : "-"
                          }
                          valueClassName="text-amber-300"
                        />
                        <HistoryModalMetric
                          label={t("predictionForm.deep.firstScorer")}
                          value={
                            selectedPrediction.firstScorerPlayerId
                              ? loadingPlayer
                                ? "Loading..."
                                : selectedPrediction.firstScorerPlayerName || playerName || "-"
                              : t("predictionForm.deep.noGoal")
                          }
                          valueClassName="text-cyan-300"
                          className="sm:col-span-2"
                        />
                      </div>
                    </HistoryModalSection>
                  </div>
                )}

                <HistoryModalSection
                  title="Timeline"
                  tone="text-gray-300"
                  className="border-gray-800/80"
                >
                  <div className="space-y-2">
                    <HistoryTimelineRow
                      label={t("prediction.submittedAt")}
                      value={formatHistoryTimestamp(selectedPrediction.createdAt, locale)}
                    />
                    <HistoryTimelineRow
                      label={t("prediction.lockedAt")}
                      value={formatHistoryTimestamp(selectedPrediction.lockedAt, locale)}
                    />
                  </div>
                </HistoryModalSection>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClosePrediction}
                  >
                    Close
                  </Button>
                  <Link
                    href={`/${locale}/matches/detail/${selectedPrediction.matchId}`}
                    onClick={handleClosePrediction}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/20"
                  >
                    ดูรายละเอียด
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Modal
        open={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="กติกาการให้คะแนน"
        size="lg"
      >
        <div className="space-y-4">
          {loadingRules ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-full rounded" />
            </div>
          ) : rulesRequestFailed ? (
            <div className="text-sm text-rose-300">ไม่สามารถโหลดกติกาได้</div>
          ) : scoringRules ? (
            <div className="space-y-4">
              {/* Result tiers */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">Result Tiers</h3>
                <div className="space-y-2">
                  {Object.entries(scoringRules.resultTiers || {}).map(
                    ([key, tier]) => (
                      <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{tier.name}</div>
                            <div className="mt-1 text-xs text-gray-400 wrap-break-word whitespace-normal">{tier.description}</div>
                          </div>
                          <div className="min-w-[5.5rem] text-right font-mono text-sm text-white">
                            <div>Base: {tier.basePoints}</div>
                            <div>Bonus: {tier.bonusPoints}</div>
                            <div className="font-semibold">Total: {tier.totalPoints}</div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Bonuses */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">Bonuses</h3>
                <div className="space-y-2">
                  {Object.entries(scoringRules.bonuses || {}).map(([key, bonus]) => (
                    <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{bonus.name}</div>
                        </div>
                        <div className="text-sm font-mono text-white min-w-16">{bonus.points} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence multipliers */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">{scoreCopy.multipliers}</h3>
                <div className="space-y-2">
                  {Object.entries(scoringRules.confidenceMultipliers || {}).map(
                    ([key, c]) => (
                      <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                          </div>
                          <div className="text-sm font-mono text-white min-w-12">x{c.multiplier}</div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Boost / Streak / Formula */}
              {scoringRules.boost ? (
                <div className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                  <div className="text-sm font-semibold text-white">{scoringRules.boost.name}</div>
                  <div className="mt-1 text-xs text-gray-400">{scoringRules.boost.description} (x{scoringRules.boost.multiplier})</div>
                </div>
              ) : null}

              {scoringRules.streak ? (
                <div className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                  <div className="text-sm font-semibold text-white">{scoringRules.streak.name}</div>
                  <div className="mt-1 text-xs text-gray-400">{scoringRules.streak.description}</div>
                  {scoringRules.streak.bonusPerLevel ? (
                    <div className="mt-2 text-sm font-mono text-white">Bonus per level: {scoringRules.streak.bonusPerLevel}</div>
                  ) : null}
                  {scoringRules.streak.formula ? (
                    <div className="mt-1 text-xs text-gray-400">Formula: {scoringRules.streak.formula}</div>
                  ) : null}
                </div>
              ) : null}

              {scoringRules.formula ? (
                <div className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                  <div className="text-sm font-semibold text-white">Formula</div>
                  <div className="mt-1 text-xs text-gray-400">{scoringRules.formula.description}</div>
                  {scoringRules.formula.profit ? (
                    <div className="mt-2 text-sm font-mono text-white">{scoringRules.formula.profit}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-gray-300">ไม่มีข้อมูล</div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function normalizePredictionHistory(
  data: PredictionHistoryApiItem[] | undefined,
  matches: PredictableMatch[]
) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => {
      const matchId = toSegment(
        item.fixtureId ?? item.fixture_id ?? item.matchId ?? item.match_id
      );
      if (!matchId) return null;

      const match = matches.find((entry) => entry.id === matchId);
      const home =
        match?.home.name ??
        item.match?.homeTeam?.name?.trim() ??
        item.match?.home?.name?.trim() ??
        "Home Team";
      const away =
        match?.away.name ??
        item.match?.awayTeam?.name?.trim() ??
        item.match?.away?.name?.trim() ??
        "Away Team";
      const predictedHomeScore = toNullableNumber(
        item.predictedHomeScore ?? item.predicted_home_score
      );
      const predictedAwayScore = toNullableNumber(
        item.predictedAwayScore ?? item.predicted_away_score
      );
      const actualHomeScore = toNullableNumber(
        item.actualHomeScore ?? item.actual_home_score
      );
      const actualAwayScore = toNullableNumber(
        item.actualAwayScore ?? item.actual_away_score
      );

      return {
        id: toSegment(item.id) ?? `${matchId}-${index}`,
        matchId,
        home,
        away,
        homeLogo:
          match?.home.logo ??
          item.match?.homeTeam?.logo?.trim() ??
          item.match?.home?.logo?.trim() ??
          null,
        awayLogo:
          match?.away.logo ??
          item.match?.awayTeam?.logo?.trim() ??
          item.match?.away?.logo?.trim() ??
          null,
        predicted: `${predictedHomeScore ?? 0}-${predictedAwayScore ?? 0}`,
        actual:
          actualHomeScore !== null && actualAwayScore !== null
            ? `${actualHomeScore}-${actualAwayScore}`
            : "-",
        points: toNullableNumber(item.pointsEarned ?? item.points_earned) ?? 0,
        result: mapPredictionHistoryResult(item.status),
        confidenceLevel:
          toSegment(item.confidenceLevel ?? item.confidence_level) ?? null,
        boostUsed: Boolean(item.boostUsed ?? item.boost_used),
        firstScorerPlayerId:
          toSegment(item.firstScorerPlayerId ?? item.first_scorer_player_id) ??
          null,
        firstScorerPlayerName:
          toSegment(
            item.firstScorerPlayerName ??
              item.first_scorer_player_name ??
              item.firstScorer?.name ??
              item.first_scorer?.name
          ) ?? null,
        createdAt: toSegment(item.createdAt ?? item.created_at),
        lockedAt: toSegment(item.lockedAt ?? item.locked_at),
        halfTimeHome: toNullableNumber(item.halfTimeHome ?? item.half_time_home),
        halfTimeAway: toNullableNumber(item.halfTimeAway ?? item.half_time_away),
        totalGoals: toNullableNumber(item.totalGoals ?? item.total_goals),
        comboMultiplier:
          toNullableNumber(item.comboMultiplier ?? item.combo_multiplier) ?? 1,
        streakNumber:
          toNullableNumber(item.streakNumber ?? item.streak_number) ?? 0,
        pointsWagered:
          toNullableNumber(item.pointsWagered ?? item.points_wagered) ?? 0,
        resultType: toSegment(item.resultType ?? item.result_type) ?? null,
        scoring: (isRecord(item.scoringBreakdown) ? item.scoringBreakdown :
          isRecord(item.scoring) ? item.scoring :
          isRecord(item.score_breakdown) ? item.score_breakdown :
          isRecord(item.breakdown) ? item.breakdown :
          null) as ScoringApiBreakdown | null,
      } satisfies PredictionHistoryItem;
    })
    .filter((item): item is PredictionHistoryItem => item !== null);
}

function normalizeHistoryPagination(
  pagination: PredictionHistoryPaginationApi | null | undefined,
  fallbackPage: number,
  fallbackLimit: number
): PredictionHistoryPagination {
  const page = clampPositiveInteger(
    toNullableNumber(pagination?.page),
    fallbackPage
  );
  const limit = clampInteger(
    toNullableNumber(pagination?.limit),
    fallbackLimit,
    1,
    50
  );
  const total = Math.max(0, Math.trunc(toNullableNumber(pagination?.total) ?? 0));
  const totalPages = Math.max(
    1,
    Math.trunc(
      toNullableNumber(pagination?.totalPages ?? pagination?.total_pages) ??
        Math.ceil(total / Math.max(1, limit))
    )
  );

  return { page, limit, total, totalPages };
}

function normalizePredictableMatches(
  data: PredictableMatchApiItem[] | undefined
): PredictableMatch[] {
  if (!Array.isArray(data)) return [];

  const matches: PredictableMatch[] = [];

  for (const item of data) {
    const matchId = toSegment(item.provider_id);
    const homeId = toSegment(item.teams?.home?.id);
    const awayId = toSegment(item.teams?.away?.id);
    const kickoffTime = item.starts_at?.trim();

    if (!matchId || !homeId || !awayId || !kickoffTime) {
      continue;
    }

    const status = mapPredictableMatchStatus(item);
    const leagueId = toSegment(item.league?.id ?? item.league_id);
    const season = toSegment(item.season);

    matches.push({
      id: matchId,
      leagueKey: `${leagueId ?? "league"}-${season ?? "season"}`,
      season,
      kickoffTime,
      isLive: item.is_live === true,
      isTerminal: item.is_terminal === true,
      hasPredicted:
        item.hasPredicted === true ||
        item.has_predicted === true ||
        item.alreadyPredicted === true ||
        item.already_predicted === true ||
        (item.userPrediction !== null && item.userPrediction !== undefined) ||
        (item.user_prediction !== null && item.user_prediction !== undefined) ||
        (item.prediction !== null && item.prediction !== undefined),
      status,
      statusLabel: buildPredictableStatusLabel(item),
      league: {
        id: leagueId,
        name: item.league?.name?.trim() || "League",
        logo: item.league?.logo?.trim() || null,
        countryFlag: item.league?.country_flag?.trim() || null,
      },
      home: {
        id: homeId,
        name: item.teams?.home?.name?.trim() || "Home Team",
        logo: item.teams?.home?.logo?.trim() || null,
      },
      away: {
        id: awayId,
        name: item.teams?.away?.name?.trim() || "Away Team",
        logo: item.teams?.away?.logo?.trim() || null,
      },
    });
  }

  return matches.sort((left, right) => {
    const leftTime = new Date(left.kickoffTime).getTime();
    const rightTime = new Date(right.kickoffTime).getTime();

    if (!Number.isFinite(leftTime) && !Number.isFinite(rightTime)) return 0;
    if (!Number.isFinite(leftTime)) return 1;
    if (!Number.isFinite(rightTime)) return -1;
    return leftTime - rightTime;
  });
}

function groupPredictableMatchesByLeague(matches: PredictableMatch[]) {
  const groups = new Map<
    string,
    {
      key: string;
      league: PredictableMatch["league"];
      matches: PredictableMatch[];
    }
  >();

  for (const match of matches) {
    const key = match.leagueKey || match.league.name;
    const current =
      groups.get(key) ??
      {
        key,
        league: match.league,
        matches: [],
      };

    current.matches.push(match);
    groups.set(key, current);
  }

  return Array.from(groups.values());
}

function mapPredictableMatchStatus(item: PredictableMatchApiItem) {
  const shortStatus = String(item.status?.short ?? "").toUpperCase();

  if (item.is_live) return MatchStatus.LIVE;
  if (item.is_terminal) return MatchStatus.FINISHED;
  if (["PST", "POSTP", "SUSP"].includes(shortStatus)) {
    return MatchStatus.POSTPONED;
  }
  if (["CANC", "ABD", "AWD", "WO"].includes(shortStatus)) {
    return MatchStatus.CANCELLED;
  }

  return MatchStatus.UPCOMING;
}

function buildPredictableStatusLabel(item: PredictableMatchApiItem) {
  const longStatus = item.status?.long?.trim();
  const shortStatus = item.status?.short?.trim();
  return longStatus || shortStatus || "Upcoming";
}

function toSegment(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const segment = String(value).trim();
  return segment.length > 0 ? segment : null;
}

function toNullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampPositiveInteger(value: number | null, fallback: number) {
  return clampInteger(value, fallback, 1, Number.MAX_SAFE_INTEGER);
}

function clampInteger(value: number | null, fallback: number, min: number, max: number) {
  const nextValue = Math.trunc(value ?? fallback);
  if (!Number.isFinite(nextValue)) return fallback;
  return Math.min(max, Math.max(min, nextValue));
}

function isValidDateFilter(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function mapPredictionHistoryResult(status: string | null | undefined) {
  const normalized = String(status ?? "").trim().toLowerCase();

  if (normalized === "pending") return "pending";
  if (normalized === "won" || normalized === "correct" || normalized === "winner") return "correct";
  if (normalized === "partial") return "partial";
  if (normalized === "void") return "void";
  return "incorrect";
}

function toHistoryBadgeVariant(result: PredictionHistoryItem["result"]) {
  switch (result) {
    case "correct":
      return "green";
    case "pending":
      return "cyan";
    case "partial":
      return "gold";
    case "void":
      return "default";
    default:
      return "red";
  }
}

function historyTierTextClass(result: PredictionHistoryItem["result"]) {
  switch (result) {
    case "correct":
      return "text-emerald-300";
    case "partial":
      return "text-amber-300";
    case "pending":
      return "text-cyan-300";
    case "void":
      return "text-gray-400";
    default:
      return "text-rose-300";
  }
}

function formatResultType(value: string | null, copy: ScoringBreakdownCopy) {
  switch (value) {
    case "exact":    return copy.tiers.exact;
    case "goalDiff":
    case "goal_diff": return copy.tiers.goalDiff;
    case "result":   return copy.tiers.result;
    case "wrong":    return copy.tiers.wrong;
    default:         return value ?? "-";
  }
}

function formatHistoryConfidence(value: string | null, copy: ScoringBreakdownCopy) {
  return formatConfidenceLevel(value, copy);
}

function formatHistoryTimestamp(value: string | null, locale: string) {
  if (!value) return "-";

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale);
}

function formatHistoryDate(value: string | null, locale: string) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return formatDate(date.toISOString(), locale);
}

function formatHistoryTime(value: string | null, locale: string) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return formatTime(date.toISOString(), locale);
}

function getPredictRowStatusLabel(match: PredictableMatch, copy: PredictPageCopy) {
  if (match.status === MatchStatus.UPCOMING) return copy.openForPrediction;
  return match.statusLabel;
}

function formatKickoffCountdown(kickoffTime: string, copy: PredictPageCopy) {
  const kickoff = new Date(kickoffTime).getTime();
  if (!Number.isFinite(kickoff)) return null;

  const diffMs = kickoff - Date.now();
  if (diffMs <= 0) return null;

  const totalMinutes = Math.ceil(diffMs / 60_000);
  if (totalMinutes <= 30) return copy.startsSoon;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${copy.startsIn} ${days}d${remainingHours > 0 ? ` ${remainingHours}h` : ""}`;
  }

  if (hours > 0) {
    return `${copy.startsIn} ${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  }

  return `${copy.startsIn} ${minutes}m`;
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

function HistoryPaginationControls({
  pagination,
  loading,
  t,
  onPageChange,
}: {
  pagination: PredictionHistoryPagination;
  loading: boolean;
  t: ReturnType<typeof useTranslations>;
  onPageChange: (page: number) => void;
}) {
  const start = pagination.total === 0
    ? 0
    : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.total, pagination.page * pagination.limit);
  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#080d14] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-gray-400">
        {t("prediction.historyPaginationSummary", {
          start,
          end,
          total: pagination.total,
        })}
      </p>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrevious || loading}
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
        >
          <ChevronLeft size={14} />
          {t("prediction.previousPage")}
        </Button>
        <span className="min-w-20 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-center font-mono text-xs font-black text-cyan-200">
          {pagination.page}/{pagination.totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext || loading}
          onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
        >
          {t("prediction.nextPage")}
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

const PredictMatchRow = memo(function PredictMatchRow({
  match,
  index,
  locale,
  t,
  isLoggedIn,
  hasPredicted,
  predictMatchHref,
  copy,
}: {
  match: PredictableMatch;
  index: number;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  isLoggedIn: boolean;
  hasPredicted: boolean;
  predictMatchHref: string;
  copy: PredictPageCopy;
}) {
  const router = useRouter();
  const matchDate = formatDate(match.kickoffTime, locale);
  const matchTime = formatTime(match.kickoffTime, locale);
  const statusGroup = match.status;
  const statusLabel = getPredictRowStatusLabel(match, copy);
  const timeUntilKickoff = formatKickoffCountdown(match.kickoffTime, copy);
  const actionHref = isLoggedIn
    ? predictMatchHref
    : `/${locale}/auth/login?next=${encodeURIComponent(predictMatchHref)}`;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => router.push(actionHref)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(actionHref);
        }
      }}
      className="group relative cursor-pointer transition-all duration-200 outline-none"
    >
      {/* Desktop Grid Row */}
      <div
        className={cn(
          "hidden min-h-[62px] grid-cols-[190px_minmax(150px,1fr)_58px_minmax(150px,1fr)_138px] items-center gap-3 border-l-2 px-4 py-2 transition-all duration-200 md:grid",
          hasPredicted
            ? "border-l-emerald-400 bg-gradient-to-r from-emerald-400/[0.08] via-[#0b1118] to-[#090b10]"
            : "border-l-cyan-400/30 group-hover:border-l-cyan-300",
          index % 2 === 0 ? "bg-[#0b0f16]" : "bg-[#080b10]",
          "hover:bg-[#101827] group-focus-visible:bg-[#101827]"
        )}
      >
        {/* Column 1: Time / Status */}
        <div className="min-w-0 pl-1">
          <div className="inline-flex min-w-[172px] flex-col rounded-xl border border-cyan-300/12 bg-black/20 px-3 py-2">
            <span className="mb-1 block whitespace-nowrap text-[11px] font-bold leading-none text-gray-500">
              {matchDate}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="min-w-[48px] font-mono text-lg font-black leading-none tracking-wide text-cyan-100">
                {matchTime}
              </span>
            <span className={cn(
              "whitespace-nowrap rounded-md border border-cyan-300/15 bg-cyan-300/[0.05] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-cyan-100",
              statusGroup === MatchStatus.LIVE && "bg-green-500/10 text-green-400 border-green-500/20",
              statusGroup === MatchStatus.POSTPONED && "bg-amber-500/10 text-amber-400 border-amber-500/20",
              statusGroup === MatchStatus.CANCELLED && "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {statusLabel}
            </span>
            {timeUntilKickoff && (
              <span className="whitespace-nowrap rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-gray-400">
                {timeUntilKickoff}
              </span>
            )}
            </div>
          </div>
        </div>

        {/* Column 2: Home Team */}
        <div className="flex min-w-0 items-center justify-end gap-2 pr-2 text-right">
          <span className="max-w-[240px] truncate text-sm font-extrabold tracking-wide text-gray-300 transition-colors group-hover:text-cyan-300">
            {match.home.name}
          </span>
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={match.home.name}
              logo={match.home.logo}
              size="xs"
              accent="cyan"
            />
          </div>
        </div>

        {/* Column 3: VS Pill */}
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div className="flex min-w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-1 text-[11px] font-black tracking-wider text-cyan-200">
            <span className="px-1 text-[11px] font-black uppercase text-cyan-200">
              VS
            </span>
          </div>
        </div>

        {/* Column 4: Away Team */}
        <div className="flex min-w-0 items-center justify-start gap-2 pl-2 text-left">
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={match.away.name}
              logo={match.away.logo}
              size="xs"
              accent="magenta"
            />
          </div>
          <span className="max-w-[240px] truncate text-sm font-extrabold tracking-wide text-gray-300 transition-colors group-hover:text-violet-300">
            {match.away.name}
          </span>
        </div>

        {/* Column 5: Actions */}
        <div className="flex items-center justify-end gap-2 pr-1">
          {!hasPredicted && (
            <span className="hidden rounded-md border border-violet-300/20 bg-violet-300/[0.06] px-1.5 py-1 text-[9px] font-black text-violet-200 xl:inline-flex">
              {copy.aiSignal}
            </span>
          )}
          {isLoggedIn ? (
            hasPredicted ? (
              <span className="inline-flex h-7 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 text-[10px] font-black uppercase tracking-wide text-emerald-300">
                <CheckCheck size={13} className="mr-1.5" />
                {t("prediction.alreadyPredicted")}
              </span>
            ) : (
              <Link
                href={predictMatchHref}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-7 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/[0.12] px-2.5 text-[10px] font-black uppercase tracking-wide text-cyan-100 transition-colors hover:border-cyan-200/50 hover:bg-cyan-300/20"
              >
                {copy.predictAction}
              </Link>
            )
          ) : (
            <Link
              href={actionHref}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex h-7 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.05] px-2.5 text-[10px] font-black uppercase tracking-wide text-cyan-100 transition-colors hover:border-cyan-300/45"
            >
              {t("prediction.signInToPredict")}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Row Layout */}
      <div
        className={cn(
          "border-b border-gray-900/60 border-l-4 px-3.5 py-3.5 transition-all duration-200 md:hidden",
          hasPredicted
            ? "border-l-emerald-500 bg-gradient-to-r from-emerald-500/[0.03] to-transparent"
            : "border-l-cyan-500/20",
          index % 2 === 0 ? "bg-[#0c0d12]" : "bg-[#090a0e]"
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-10 min-w-14 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] px-2">
              <span className="font-mono text-base font-black leading-none text-cyan-100">
              {matchTime}
              </span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold leading-none text-gray-500">
                {matchDate}
              </div>
              {timeUntilKickoff && (
                <span className="mt-1 inline-flex rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] font-black text-gray-400">
                  {timeUntilKickoff}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-100">
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] items-center gap-2.5">
          <div className="min-w-0">
            <div className="mb-1.5 flex justify-center">
              <ApiTeamLogo
                name={match.home.name}
                logo={match.home.logo}
                size="sm"
                accent="cyan"
              />
            </div>
            <span className="block truncate text-center text-sm font-black leading-tight text-gray-300">
              {match.home.name}
            </span>
          </div>

          <div className="flex justify-center">
            <div className="grid h-10 w-12 place-items-center rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs font-black text-cyan-300">
              VS
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex justify-center">
            <ApiTeamLogo
              name={match.away.name}
              logo={match.away.logo}
              size="sm"
              accent="magenta"
            />
            </div>
            <span className="block truncate text-center text-sm font-black leading-tight text-gray-300">
              {match.away.name}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <div className="min-w-0">
            <span className="block truncate text-xs font-semibold text-gray-500">
              {match.season ? t("prediction.seasonLabel", { season: match.season }) : t("prediction.kickoffLabel")}
            </span>
          </div>
          <div className="shrink-0">
            {isLoggedIn ? (
              hasPredicted ? (
                <span className="inline-flex h-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-black text-emerald-400">
                  <CheckCheck size={13} className="mr-1" />
                  {t("prediction.alreadyPredicted")}
                </span>
              ) : (
                <Link
                  href={predictMatchHref}
                  onClick={(event) => event.stopPropagation()}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/[0.12] px-3 text-xs font-black uppercase tracking-wide text-cyan-100 transition-colors"
              >
                  {copy.predictAction}
                </Link>
              )
            ) : (
              <Link
                href={actionHref}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] px-3 text-xs font-black text-gray-300"
              >
                {t("prediction.signInToPredict")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

const HistoryMatchRow = memo(function HistoryMatchRow({
  item,
  index,
  locale,
  t,
  onClick,
}: {
  item: PredictionHistoryItem;
  index: number;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  onClick: () => void;
}) {
  const statusLabel = t(`prediction.${item.result}`);
  const resultClass = historyTierTextClass(item.result);
  const submittedDate = formatHistoryDate(item.createdAt, locale);
  const submittedTime = formatHistoryTime(item.createdAt, locale);
  const pointsLabel = item.points > 0 ? `+${item.points} PTS` : "0 PTS";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="group relative cursor-pointer transition-all duration-200 outline-none"
    >
      {/* Desktop Grid Row */}
      <div
        className={cn(
          "hidden min-h-[66px] grid-cols-[190px_minmax(170px,1fr)_minmax(150px,1fr)_108px_minmax(150px,1fr)_128px] items-center gap-3 border-l-2 px-4 py-2 transition-all duration-200 md:grid",
          item.result === "correct"
            ? "border-l-emerald-500 bg-gradient-to-r from-emerald-500/[0.04] via-[#09100f] to-transparent"
            : item.result === "incorrect"
            ? "border-l-rose-500/30 group-hover:border-l-rose-500"
            : "border-l-cyan-500/20 group-hover:border-l-cyan-400",
          index % 2 === 0 ? "bg-[#0c0d12]" : "bg-[#090a0e]",
          "hover:bg-[#121622] group-focus-visible:bg-[#121622]"
        )}
      >
        {/* Column 1: Time / Status */}
        <div className="min-w-0 pl-1">
          <div className="inline-flex min-w-[172px] flex-col rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <span className="mb-1 block whitespace-nowrap text-[11px] font-bold leading-none text-gray-500">
              {submittedDate}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="min-w-[54px] font-mono text-sm font-black leading-none tracking-wide text-gray-200">
                {submittedTime}
              </span>
            <span className={cn(
              "whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide",
              item.result === "correct" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              item.result === "incorrect" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
              item.result === "pending" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
              item.result === "partial" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
              item.result === "void" && "bg-gray-500/10 text-gray-400 border-gray-500/20"
            )}>
              {statusLabel}
            </span>
            </div>
          </div>
        </div>

        {/* Column 2: Tournament (League) */}
        <div className="flex min-w-0 flex-col justify-center pr-2">
          <span className="truncate text-sm font-black text-gray-200 transition-colors group-hover:text-cyan-200">
            {item.home} vs {item.away}
          </span>
          <span className="mt-1 truncate text-[10px] font-bold text-gray-500">
            {t("prediction.yourPrediction")}
          </span>
        </div>

        {/* Column 3: Home Team */}
        <div className="flex min-w-0 items-center justify-end gap-2 pr-1 text-right">
          <span className="max-w-[210px] truncate text-sm font-extrabold tracking-wide text-gray-200 transition-colors group-hover:text-cyan-200">
            {item.home}
          </span>
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={item.home}
              logo={item.homeLogo}
              size="xs"
              accent="cyan"
            />
          </div>
        </div>

        {/* Column 4: Prediction & Actual Scores */}
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div className="inline-flex min-h-8 min-w-[82px] items-center justify-center gap-1.5 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] px-2 font-mono text-sm font-black">
            <span className="text-cyan-200">{item.predicted}</span>
            <span className="text-gray-600">/</span>
            <span className="text-white">{item.actual}</span>
          </div>
          <span className="mt-1 text-[9px] font-bold text-gray-500">
            {t("prediction.predicted")} / {t("prediction.actualResult")}
          </span>
        </div>

        {/* Column 5: Away Team */}
        <div className="flex min-w-0 items-center justify-start gap-2 pl-1 text-left">
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={item.away}
              logo={item.awayLogo}
              size="xs"
              accent="magenta"
            />
          </div>
          <span className="max-w-[210px] truncate text-sm font-extrabold tracking-wide text-gray-200 transition-colors group-hover:text-magenta-200">
            {item.away}
          </span>
        </div>

        {/* Column 6: Reward / Detail */}
        <div className="flex items-center justify-end gap-2 pr-1">
          <span className={cn(
            "inline-flex min-h-8 min-w-[82px] items-center justify-center rounded-lg border px-2 font-mono text-xs font-black",
            item.points > 0
              ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300"
              : "border-white/10 bg-white/[0.03] text-gray-500"
          )}>
            {pointsLabel}
          </span>
          <ChevronRight
            size={15}
            className="text-gray-650 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200"
          />
        </div>
      </div>

      {/* Mobile Row Layout */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 md:hidden px-3.5 py-2.5 transition-all duration-200 border-l-2 border-b border-gray-900/60",
          item.result === "correct"
            ? "border-l-emerald-500 bg-gradient-to-r from-emerald-500/[0.03] to-transparent"
            : item.result === "incorrect"
            ? "border-l-rose-500/30"
            : "border-l-cyan-500/20",
          index % 2 === 0 ? "bg-[#0c0d12]" : "bg-[#090a0e]"
        )}
      >
        {/* Left column */}
        <div className="flex min-w-[84px] shrink-0 flex-col justify-center gap-1">
          <span className="font-mono text-xs font-black text-gray-300">
            {submittedTime}
          </span>
          <span className="text-[9px] font-semibold text-gray-500">
            {submittedDate}
          </span>
          <span className={cn("w-fit rounded-md border border-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase", resultClass)}>
            {statusLabel}
          </span>
        </div>

        {/* Center column */}
        <div className="flex items-center justify-center gap-2 flex-1 min-w-0 px-1">
          <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0 text-right">
            <span className="text-xs font-bold text-gray-200 truncate">
              {item.home}
            </span>
            <div className="shrink-0">
              <ApiTeamLogo
                name={item.home}
                logo={item.homeLogo}
                size="xs"
                accent="cyan"
              />
            </div>
          </div>

          <div className="shrink-0 text-center flex flex-col items-center">
            <span className="font-mono text-[10px] font-bold text-cyan-300">{item.predicted}</span>
            <span className="font-mono text-[9px] text-gray-500">({item.actual})</span>
          </div>

          <div className="flex items-center justify-start gap-1.5 flex-1 min-w-0 text-left">
            <div className="shrink-0">
              <ApiTeamLogo
                name={item.away}
                logo={item.awayLogo}
                size="xs"
                accent="magenta"
              />
            </div>
            <span className="text-xs font-bold text-gray-300 truncate">
              {item.away}
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="flex items-center justify-end gap-1 shrink-0 pl-1">
          <span className={cn("font-mono text-[10px] font-bold", item.points > 0 ? "text-green-400" : "text-gray-500")}>
            {item.points > 0 ? `+${item.points}` : "0"}
          </span>
          <ChevronRight size={14} className="text-gray-500" />
        </div>
      </div>
    </article>
  );
});

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

function HistoryTeam({
  name,
  logo,
  accent,
}: {
  name: string;
  logo: string | null;
  accent: "cyan" | "magenta";
}) {
  return (
    <div className="min-w-0 text-center">
      <div className="mb-2 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} accent={accent} />
      </div>
      <p className="line-clamp-2 text-xs font-medium text-white">{name}</p>
    </div>
  );
}

function HistoryOutcomeCard({
  label,
  value,
  valueClassName,
  toneClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  toneClassName?: string;
}) {
  return (
    <div className={cn("rounded-2xl border px-4 py-3", toneClassName)}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-xl font-black text-white", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function HistorySummaryStat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/10 bg-black/20 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-lg font-black text-white", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function HistoryModalSection({
  title,
  tone,
  className,
  children,
}: {
  title: string;
  tone?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border bg-black/30 p-4", className)}>
      <div className={cn("text-xs font-black uppercase tracking-[0.18em]", tone)}>
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function HistoryModalMetric({
  label,
  value,
  valueClassName,
  className,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-gray-800/80 bg-black/25 px-3 py-2.5", className)}>
      <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-sm font-semibold text-white", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function HistoryTimelineRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-800/80 bg-black/20 px-3 py-2.5">
      <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

// ----------------------------------------------------
// Scoring Breakdown Section (prediction history modal)
// ----------------------------------------------------
function ScoringBreakdownSection({
  scoring,
  prediction,
  firstScorerPlayerName,
}: {
  scoring: ScoringApiBreakdown;
  prediction: PredictionHistoryItem;
  firstScorerPlayerName: string | null;
}) {
  const { locale } = useParams<{ locale: string }>();
  const copy = getScoringBreakdownCopy(locale);
  const stake = scoring.stake ?? 0;
  const basePoints = scoring.base_points ?? 0;
  const subtotal = scoring.subtotal_before_multipliers ?? 0;
  const rankingPoints = scoring.ranking_points ?? 0;
  const profit = scoring.profit ?? 0;
  const total = scoring.total ?? 0;

  const bonuses = scoring.bonuses ?? {};
  const multipliers = scoring.multipliers ?? {};

  const confidenceLevel = multipliers.confidence?.level ?? "-";
  const confidenceMultiplier = multipliers.confidence?.multiplier ?? 1;
  const boostUsed = multipliers.boost?.used ?? false;
  const boostMultiplier = multipliers.boost?.multiplier ?? 1;
  const streakNumber = multipliers.streak?.streak_number ?? 0;
  const streakBonusPerLevel = multipliers.streak?.bonus_per_level ?? 2;
  const streakTotal = multipliers.streak?.total ?? 0;

  const tierMeta = (type: string | null | undefined): { label: string; sublabel: string; tone: "gold" | "green" | "cyan" | "red" } => {
    switch (type) {
      case "exact":
        return { label: copy.tiers.exact, sublabel: copy.tiers.exactHint, tone: "gold" };
      case "goal_diff":
      case "goalDiff":
        return { label: copy.tiers.goalDiff, sublabel: copy.tiers.goalDiffHint, tone: "green" };
      case "result":
        return { label: copy.tiers.result, sublabel: copy.tiers.resultHint, tone: "cyan" };
      default:
        return { label: copy.tiers.wrong, sublabel: copy.tiers.wrongHint, tone: "red" };
    }
  };

  const tier = tierMeta(bonuses.result_tier?.type);
  const tierEarned = bonuses.result_tier?.type !== "wrong" && bonuses.result_tier?.type != null;
  const firstScorerPredicted =
    firstScorerPlayerName ??
    formatIdValue(bonuses.first_scorer?.predicted?.player_id, copy);
  const firstScorerActual =
    bonuses.first_scorer?.actual?.player_name ??
    formatIdValue(bonuses.first_scorer?.actual?.player_id, copy);
  const halfTimeActualHome =
    bonuses.half_time?.actual_home ?? bonuses.half_time?.actual?.home ?? null;
  const halfTimeActualAway =
    bonuses.half_time?.actual_away ?? bonuses.half_time?.actual?.away ?? null;

  return (
    <div className="rounded-2xl border border-gray-800/80 bg-black/30 p-4">
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
            {copy.title}
          </p>
          <h3 className="mt-1 font-mono text-lg font-black text-white">
            #{prediction.id}
          </h3>
          <div className="mt-2 space-y-1 text-xs text-gray-400">
            <p>
              {copy.predicted}:{" "}
              <span className="font-mono font-black text-white">
                {prediction.predicted}
              </span>
              {prediction.halfTimeHome !== null && prediction.halfTimeAway !== null && (
                <span className="font-mono text-cyan-200">
                  {" "}
                  | HT {prediction.halfTimeHome}-{prediction.halfTimeAway}
                </span>
              )}
            </p>
            <p>
              {copy.actual}:{" "}
              <span className="font-mono font-black text-cyan-200">
                {prediction.actual}
              </span>
              {bonuses.result_tier && (
                <span className="text-gray-500">
                  {" "}
                  ({tier.label} - {tier.sublabel})
                </span>
              )}
            </p>
            <p>
              {copy.confidence}:{" "}
              <span className="font-black text-emerald-300">
                {formatConfidenceLevel(confidenceLevel, copy)} (×{confidenceMultiplier.toFixed(1)})
              </span>
              {" · "}
              {copy.stake}:{" "}
              <span className="font-mono font-black text-amber-300">
                {stake.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-right">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
            {copy.total}
          </p>
          <p className="font-mono text-xl font-black text-emerald-300">
            {total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
          {copy.scoreCalculation}
        </p>
        <ScoreStepRow
          earned={basePoints > 0}
          label={copy.basePoints}
          detail={copy.resultScore}
          points={basePoints}
        />
        {bonuses.result_tier && (
          <ScoreStepRow
            earned={tierEarned}
            label={tier.label}
            detail={tier.sublabel}
            points={bonuses.result_tier.points ?? 0}
          />
        )}
        {bonuses.total_goals && (
          <ScoreStepRow
            earned={bonuses.total_goals.earned ?? false}
            label={copy.totalGoals}
            detail={formatPredictionActualDetail(
              bonuses.total_goals.predicted,
              bonuses.total_goals.actual,
              copy
            )}
            points={bonuses.total_goals.points ?? 0}
          />
        )}
        {bonuses.half_time && (
          <ScoreStepRow
            earned={bonuses.half_time.earned ?? false}
            label={copy.halfTime}
            detail={formatPredictionActualDetail(
              formatScorePair(
                bonuses.half_time.predicted_home,
                bonuses.half_time.predicted_away
              ),
              formatScorePair(halfTimeActualHome, halfTimeActualAway),
              copy
            )}
            points={bonuses.half_time.points ?? 0}
          />
        )}
        {bonuses.first_scorer && (
          <ScoreStepRow
            earned={bonuses.first_scorer.earned ?? false}
            label={copy.firstScorer}
            detail={formatPredictionActualDetail(
              firstScorerPredicted,
              firstScorerActual,
              copy
            )}
            points={bonuses.first_scorer.points ?? 0}
          />
        )}

        <ScoreDivider />
        <ScoreTotalRow label={copy.subtotal} value={subtotal} />
        <ScoreFormulaRow
          label={`${copy.confidence}: ${formatConfidenceLevel(confidenceLevel, copy)}`}
          value={`×${confidenceMultiplier.toFixed(1)}`}
        />
        <ScoreFormulaRow
          label={`${copy.boost}: ${boostUsed ? copy.on : copy.off}`}
          value={`×${boostMultiplier.toFixed(1)}`}
        />
        <ScoreFormulaRow
          label={`${copy.streak} #${streakNumber} (×${streakBonusPerLevel}/${copy.level})`}
          value={`+${streakTotal}`}
        />

        <ScoreDivider />
        <ScoreTotalRow label={copy.rankingPoints} value={rankingPoints} highlight />
        <ScoreTotalRow label={copy.refund} value={stake} tone="text-amber-300" prefix="+" />
        <ScoreDivider />
        <ScoreTotalRow label={copy.received} value={total} highlight size="lg" />
        <ScoreTotalRow
          label={copy.profit}
          value={profit}
          tone={profit >= 0 ? "text-emerald-300" : "text-rose-300"}
          prefix={profit >= 0 ? "+" : ""}
        />
      </div>
    </div>
  );
}

function ScoreStepRow({
  earned,
  label,
  detail,
  points,
}: {
  earned: boolean;
  label: string;
  detail?: React.ReactNode;
  points: number;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border border-gray-800/60 bg-black/20 px-3 py-2">
      <span className={cn("pt-0.5 text-sm", earned ? "text-emerald-300" : "text-gray-600")}>
        {earned ? "✓" : "✗"}
      </span>
      <div className="min-w-0">
        <p className={cn("text-sm font-bold", earned ? "text-white" : "text-gray-400")}>
          {label}
        </p>
        {detail && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{detail}</p>
        )}
      </div>
      <span
        className={cn(
          "font-mono text-sm font-black",
          earned ? "text-emerald-300" : "text-gray-500"
        )}
      >
        {points > 0 ? `+${points}` : "0"}
      </span>
    </div>
  );
}

function ScoreDivider() {
  return <div className="my-2 border-t border-dashed border-gray-800" />;
}

function ScoreFormulaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-black text-violet-300">{value}</span>
    </div>
  );
}

function ScoreTotalRow({
  label,
  value,
  highlight,
  tone,
  prefix = "",
  size = "md",
}: {
  label: string;
  value: number;
  highlight?: boolean;
  tone?: string;
  prefix?: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-3 py-2",
        highlight ? "border border-emerald-500/25 bg-emerald-500/5" : "bg-transparent"
      )}
    >
      <span
        className={cn(
          "font-bold",
          highlight ? "text-emerald-300" : "text-gray-500",
          size === "lg" ? "text-sm uppercase tracking-wide" : "text-xs"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono font-black",
          tone ?? (highlight ? "text-emerald-300" : "text-white"),
          size === "lg" ? "text-xl" : "text-sm"
        )}
      >
        {prefix}
        {value.toLocaleString()}
      </span>
    </div>
  );
}

type ScoringBreakdownCopy = {
  receipt: string;
  title: string;
  scoreCalculation: string;
  result: string;
  resultType: string;
  predictionSetup: string;
  bonusPoints: string;
  stake: string;
  pointsWagered: string;
  basePoints: string;
  resultScore: string;
  extraBonuses: string;
  firstScorer: string;
  totalGoals: string;
  halfTime: string;
  predicted: string;
  actual: string;
  id: string;
  subtotal: string;
  multipliers: string;
  confidence: string;
  boost: string;
  streak: string;
  level: string;
  on: string;
  off: string;
  rankingPoints: string;
  refund: string;
  received: string;
  profit: string;
  total: string;
  pointsAbbr: string;
  confidenceLevels: Record<string, string>;
  tiers: {
    exact: string;
    exactHint: string;
    goalDiff: string;
    goalDiffHint: string;
    result: string;
    resultHint: string;
    wrong: string;
    wrongHint: string;
  };
};

const scoringBreakdownCopy: Record<string, ScoringBreakdownCopy> = {
  th: {
    receipt: "ใบรับคำทาย",
    title: "สรุปคะแนน",
    scoreCalculation: "คิดคะแนน",
    result: "ผลลัพธ์",
    resultType: "ประเภทผลลัพธ์",
    predictionSetup: "ข้อมูลคำทาย",
    bonusPoints: "แต้มโบนัส",
    stake: "แต้มที่ใช้ทาย",
    pointsWagered: "แต้มเดิมพัน",
    basePoints: "แต้มพื้นฐาน",
    resultScore: "คะแนนผลลัพธ์",
    extraBonuses: "โบนัสพิเศษ",
    firstScorer: "ผู้ทำประตูแรก",
    totalGoals: "จำนวนประตูรวม",
    halfTime: "สกอร์ครึ่งแรก",
    predicted: "ทาย",
    actual: "ผลจริง",
    id: "รหัส",
    subtotal: "รวมก่อนคูณ",
    multipliers: "ตัวคูณ",
    confidence: "ความมั่นใจ",
    boost: "บูสต์",
    streak: "สตรีค",
    level: "ระดับ",
    on: "เปิด",
    off: "ปิด",
    rankingPoints: "คะแนนจัดอันดับ",
    refund: "คืนทุน",
    received: "ได้รับ",
    profit: "กำไร",
    total: "รวม",
    pointsAbbr: "แต้ม",
    confidenceLevels: { safe: "ปลอดภัย", confident: "มั่นใจ", bold: "กล้าเสี่ยง" },
    tiers: {
      exact: "ถูกสกอร์เป๊ะ",
      exactHint: "สกอร์ตรงทุกประตู",
      goalDiff: "ผลต่างประตูถูก",
      goalDiffHint: "ถูกผลต่างประตู",
      result: "ผลแพ้ชนะถูก",
      resultHint: "ถูกฝั่งผลการแข่งขัน",
      wrong: "ผิดทั้งหมด",
      wrongHint: "ทายผิดฝั่ง",
    },
  },
  en: {
    receipt: "Prediction Receipt",
    title: "Score Breakdown",
    scoreCalculation: "Score calculation",
    result: "Result",
    resultType: "Result Type",
    predictionSetup: "Prediction Setup",
    bonusPoints: "bonus pts",
    stake: "Stake",
    pointsWagered: "pts wagered",
    basePoints: "Base Points",
    resultScore: "result score",
    extraBonuses: "Extra Bonuses",
    firstScorer: "First Scorer",
    totalGoals: "Total Goals",
    halfTime: "Half Time",
    predicted: "Predicted",
    actual: "Actual",
    id: "ID",
    subtotal: "Subtotal before multipliers",
    multipliers: "Multipliers",
    confidence: "Confidence",
    boost: "Boost",
    streak: "Streak",
    level: "level",
    on: "on",
    off: "off",
    rankingPoints: "Ranking Points",
    refund: "Stake returned",
    received: "Received",
    profit: "Profit",
    total: "Total",
    pointsAbbr: "pts",
    confidenceLevels: { safe: "safe", confident: "confident", bold: "bold" },
    tiers: {
      exact: "Exact score",
      exactHint: "Exact final score",
      goalDiff: "Goal difference correct",
      goalDiffHint: "Correct goal difference",
      result: "Correct result",
      resultHint: "Correct match result",
      wrong: "Wrong",
      wrongHint: "Wrong result side",
    },
  },
  lo: {
    receipt: "ໃບສະຫຼຸບການທາຍ",
    title: "ສະຫຼຸບຄະແນນ",
    scoreCalculation: "ຄິດຄະແນນ",
    result: "ຜົນ",
    resultType: "ປະເພດຜົນ",
    predictionSetup: "ຂໍ້ມູນການທາຍ",
    bonusPoints: "ຄະແນນໂບນັດ",
    stake: "ຄະແນນທີ່ໃຊ້ທາຍ",
    pointsWagered: "ຄະແນນວາງ",
    basePoints: "ຄະແນນພື້ນຖານ",
    resultScore: "ຄະແນນຜົນ",
    extraBonuses: "ໂບນັດພິເສດ",
    firstScorer: "ຜູ້ຍິງປະຕູທຳອິດ",
    totalGoals: "ຈຳນວນປະຕູລວມ",
    halfTime: "ສະກໍເຄິ່ງທຳອິດ",
    predicted: "ທາຍ",
    actual: "ຜົນຈິງ",
    id: "ລະຫັດ",
    subtotal: "ລວມກ່ອນຄູນ",
    multipliers: "ຕົວຄູນ",
    confidence: "ຄວາມໝັ້ນໃຈ",
    boost: "ບູສ",
    streak: "ສະຕຣີກ",
    level: "ລະດັບ",
    on: "ເປີດ",
    off: "ປິດ",
    rankingPoints: "ຄະແນນຈັດອັນດັບ",
    refund: "ຄືນທຶນ",
    received: "ໄດ້ຮັບ",
    profit: "ກຳໄລ",
    total: "ລວມ",
    pointsAbbr: "ຄະແນນ",
    confidenceLevels: { safe: "ປອດໄພ", confident: "ໝັ້ນໃຈ", bold: "ກ້າສ່ຽງ" },
    tiers: {
      exact: "ຖືກສະກໍເປະ",
      exactHint: "ສະກໍສຸດທ້າຍຖືກເປະ",
      goalDiff: "ຜົນຕ່າງປະຕູຖືກ",
      goalDiffHint: "ຖືກຜົນຕ່າງປະຕູ",
      result: "ຜົນແຂ່ງຂັນຖືກ",
      resultHint: "ຖືກຝັ່ງຜົນແຂ່ງຂັນ",
      wrong: "ຜິດ",
      wrongHint: "ທາຍຜິດຝັ່ງ",
    },
  },
  my: {
    receipt: "ခန့်မှန်းချက်လက်ခံဖြတ်ပိုင်း",
    title: "အမှတ်ခွဲခြမ်းစိတ်ဖြာချက်",
    scoreCalculation: "အမှတ်တွက်ချက်မှု",
    result: "ရလဒ်",
    resultType: "ရလဒ်အမျိုးအစား",
    predictionSetup: "ခန့်မှန်းချက်အချက်အလက်",
    bonusPoints: "ဘောနပ်စ်မှတ်",
    stake: "ခန့်မှန်းရာတွင်သုံးသောမှတ်",
    pointsWagered: "သုံးထားသောမှတ်",
    basePoints: "အခြေခံမှတ်",
    resultScore: "ရလဒ်မှတ်",
    extraBonuses: "အပိုဘောနပ်စ်",
    firstScorer: "ပထမဂိုးသွင်းသူ",
    totalGoals: "စုစုပေါင်းဂိုး",
    halfTime: "ပထမပိုင်းစကอร์",
    predicted: "ခန့်မှန်း",
    actual: "ရလဒ်",
    id: "ID",
    subtotal: "မြှောက်ကိန်းမတိုင်မီစုစုပေါင်း",
    multipliers: "မြှောက်ကိန်းများ",
    confidence: "ယုံကြည်မှု",
    boost: "Boost",
    streak: "စတရိခ်",
    level: "အဆင့်",
    on: "ဖွင့်",
    off: "ပိတ်",
    rankingPoints: "အဆင့်မှတ်",
    refund: "အရင်းပြန်",
    received: "ရရှိသည်",
    profit: "အမြတ်",
    total: "စုစုပေါင်း",
    pointsAbbr: "မှတ်",
    confidenceLevels: { safe: "လုံခြုံ", confident: "ယုံကြည်", bold: "စွန့်စား" },
    tiers: {
      exact: "စကอร์အတိအကျမှန်",
      exactHint: "နောက်ဆုံးစကอร์အတိအကျမှန်",
      goalDiff: "ဂိုးကွာဟချက်မှန်",
      goalDiffHint: "ဂိုးကွာဟချက်မှန်",
      result: "ရလဒ်မှန်",
      resultHint: "ပွဲရလဒ်ဘက်မှန်",
      wrong: "မှား",
      wrongHint: "ရလဒ်ဘက်မှား",
    },
  },
  km: {
    receipt: "បង្កាន់ដៃទស្សន៍ទាយ",
    title: "សង្ខេបពិន្ទុ",
    scoreCalculation: "គណនាពិន្ទុ",
    result: "លទ្ធផល",
    resultType: "ប្រភេទលទ្ធផល",
    predictionSetup: "ព័ត៌មានទស្សន៍ទាយ",
    bonusPoints: "ពិន្ទុបន្ថែម",
    stake: "ពិន្ទុបានដាក់",
    pointsWagered: "ពិន្ទុដែលប្រើ",
    basePoints: "ពិន្ទុមូលដ្ឋាន",
    resultScore: "ពិន្ទុលទ្ធផល",
    extraBonuses: "បន្ថែមពិសេស",
    firstScorer: "អ្នកស៊ុតដំបូង",
    totalGoals: "គ្រាប់បាល់សរុប",
    halfTime: "ពិន្ទុតង់ទី១",
    predicted: "ទាយ",
    actual: "លទ្ធផលពិត",
    id: "ID",
    subtotal: "សរុបមុនគុណ",
    multipliers: "មេគុណ",
    confidence: "ទំនុកចិត្ត",
    boost: "Boost",
    streak: "ស្ទ្រីក",
    level: "កម្រិត",
    on: "បើក",
    off: "បិទ",
    rankingPoints: "ពិន្ទុចំណាត់ថ្នាក់",
    refund: "សងដើម",
    received: "ទទួលបាន",
    profit: "ចំណេញ",
    total: "សរុប",
    pointsAbbr: "ពិន្ទុ",
    confidenceLevels: { safe: "សុវត្ថិភាព", confident: "មានទំនុកចិត្ត", bold: "ហ៊ានប្រថុយ" },
    tiers: {
      exact: "ពិន្ទុត្រឹមត្រូវ",
      exactHint: "ពិន្ទុចុងក្រោយត្រឹមត្រូវ",
      goalDiff: "គម្លាតគ្រាប់ត្រឹមត្រូវ",
      goalDiffHint: "គម្លាតគ្រាប់ត្រឹមត្រូវ",
      result: "លទ្ធផលត្រឹមត្រូវ",
      resultHint: "ជ្រើសរើសលទ្ធផលត្រឹមត្រូវ",
      wrong: "ខុស",
      wrongHint: "ជ្រើសរើសលទ្ធផលខុស",
    },
  },
  zh: {
    receipt: "预测记录",
    title: "得分明细",
    scoreCalculation: "得分计算",
    result: "结果",
    resultType: "结果类型",
    predictionSetup: "预测设置",
    bonusPoints: "奖励分",
    stake: "投入积分",
    pointsWagered: "已投入",
    basePoints: "基础分",
    resultScore: "赛果得分",
    extraBonuses: "额外奖励",
    firstScorer: "首位进球者",
    totalGoals: "总进球",
    halfTime: "半场比分",
    predicted: "预测",
    actual: "实际",
    id: "ID",
    subtotal: "乘数前小计",
    multipliers: "乘数",
    confidence: "信心",
    boost: "加成",
    streak: "连中",
    level: "级",
    on: "开",
    off: "关",
    rankingPoints: "排名积分",
    refund: "返还本金",
    received: "获得",
    profit: "收益",
    total: "总计",
    pointsAbbr: "分",
    confidenceLevels: { safe: "稳妥", confident: "自信", bold: "大胆" },
    tiers: {
      exact: "比分全中",
      exactHint: "最终比分完全正确",
      goalDiff: "净胜球正确",
      goalDiffHint: "进球差正确",
      result: "赛果正确",
      resultHint: "胜平负方向正确",
      wrong: "未命中",
      wrongHint: "赛果方向错误",
    },
  },
};

function getScoringBreakdownCopy(locale: string | undefined) {
  return scoringBreakdownCopy[locale ?? ""] ?? scoringBreakdownCopy.en;
}

function formatPredictionActualDetail(
  predicted: string | number | null | undefined,
  actual: string | number | null | undefined,
  copy: ScoringBreakdownCopy
) {
  return (
    <>
      <span className="text-gray-500">
        {copy.predicted}: {formatDisplayValue(predicted)}
      </span>
      <span className="px-1 text-gray-600">→</span>
      <span className="font-black text-cyan-200">
        {copy.actual}: {formatDisplayValue(actual)}
      </span>
    </>
  );
}

function formatDisplayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatIdValue(value: string | number | null | undefined, copy: ScoringBreakdownCopy) {
  if (value === null || value === undefined || value === "") return null;
  return `${copy.id}: #${value}`;
}

function formatScorePair(home: number | null | undefined, away: number | null | undefined) {
  if (home === null || home === undefined || away === null || away === undefined) {
    return null;
  }
  return `${home}-${away}`;
}

function formatConfidenceLevel(value: string | null | undefined, copy: ScoringBreakdownCopy) {
  if (!value) return "-";
  return copy.confidenceLevels[value] ?? value;
}
