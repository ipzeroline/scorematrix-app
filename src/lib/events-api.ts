import { apiGetRaw, apiPostRaw, type ApiRequestOptions } from "@/lib/api-client";
import type { SpecialEvent, EventReward, EventBadge, EventMatchData, EventLeaderboardEntry } from "@/types/event";

export type ApiEvent = {
  id: string;
  title: string;
  description: string;
  eventType: "tournament" | "single-match" | "season" | string;
  entryFeePoints: number;
  entryFeeCredits: number;
  startAt: string;
  endAt: string;
  maxParticipants: number | null;
  currentParticipants: number;
  bannerUrl: string | null;
  status: "upcoming" | "active" | "ended";
  isRegistered: boolean;
  rewards?: EventReward[];
  badges?: EventBadge[];
  rules?: string[];
  matches?: unknown[];
  leaderboard?: ApiEventLeaderboardPayload;
};

export type ApiEventLeaderboardPayload =
  | ApiEventLeaderboardEntry[]
  | {
      entries?: ApiEventLeaderboardEntry[];
      userEntry?: {
        rank?: number | string | null;
        totalPoints?: number | string | null;
        total_points?: number | string | null;
      } | null;
      pagination?: {
        page?: number | string | null;
        limit?: number | string | null;
        total?: number | string | null;
        totalPages?: number | string | null;
        total_pages?: number | string | null;
      } | null;
    };

export type ApiEventLeaderboardEntry = EventLeaderboardEntry & {
  avatarUrl?: string | null;
  avatar_url?: string | null;
  totalPoints?: number;
  total_points?: number;
  level?: number | null;
  xp?: number | null;
  member?: unknown;
  user?: unknown;
  profile?: unknown;
  stats?: unknown;
  userStats?: unknown;
  user_stats?: unknown;
};

export type EventLeaderboardResponse = {
  entries: EventLeaderboardEntry[];
  userEntry: {
    rank: number;
    totalPoints: number;
  } | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
};

export type EventsResponse = {
  data: ApiEvent[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
};

export type EventResponse = {
  data: ApiEvent;
};

export type RegisterEventResponse = {
  data: {
    eventId: string;
    isRegistered: boolean;
    entryFeePoints: number;
    entryFeeCredits: number;
    wallet?: {
      freePoints?: number;
      premiumCredits?: number;
    };
    registeredAt: string;
  };
};

export type GetEventsParams = {
  status?: ApiEvent["status"];
  eventType?: ApiEvent["eventType"];
  search?: string;
  page?: number;
  limit?: number;
};

type EventsApiPayload =
  | ApiEvent[]
  | EventsResponse
  | {
      events?: ApiEvent[];
    };

type EventApiPayload =
  | ApiEvent
  | EventResponse
  | {
      event?: ApiEvent;
      entries?: ApiEventLeaderboardEntry[];
      userEntry?: {
        rank?: number | string | null;
        totalPoints?: number | string | null;
        total_points?: number | string | null;
      } | null;
      pagination?: {
        page?: number | string | null;
        limit?: number | string | null;
        total?: number | string | null;
        totalPages?: number | string | null;
        total_pages?: number | string | null;
      } | null;
    };

export const DEFAULT_EVENTS_RESPONSE: EventsResponse = {
  data: [
    {
      id: "afc-champions-2026",
      title: "AFC Champions League 2026",
      description:
        "ทายผลเอเอฟซี แชมเปี้ยนส์ลีก\n\n🏆 ทีมจากทั่วเอเชีย\n📅 กันยายน - พฤศจิกายน 2026",
      eventType: "tournament",
      entryFeePoints: 100,
      entryFeeCredits: 0,
      startAt: "2026-09-01 00:00:00",
      endAt: "2026-11-30 23:59:59",
      maxParticipants: null,
      currentParticipants: 0,
      bannerUrl: null,
      status: "upcoming",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 30000, premiumCredits: 3000, badge: "afc2026-champion" },
        { rank: 2, freePoints: 15000, premiumCredits: 1500 },
        { rank: 3, freePoints: 7500, premiumCredits: 750 },
        { rank: [4, 10], freePoints: 3000, premiumCredits: 300 },
        { rank: [11, 25], freePoints: 1500 },
      ],
      badges: [
        { id: "afc2026-champion", name: "AFC Oracle", icon: "trophy", description: "Won the AFC Champions League 2026 predictor" },
        { id: "afc2026-participant", name: "AFC Player", icon: "globe", description: "Participated in the AFC Champions League 2026 predictor" },
      ],
    },
    {
      id: "epl-2026-27-kickoff",
      title: "PL เปิดฤดูกาล 2026/27",
      description: "ทายผลพรีเมียร์ลีกนัดเปิดสนามฤดูกาลใหม่\n\n📅 สิงหาคม 2026",
      eventType: "tournament",
      entryFeePoints: 200,
      entryFeeCredits: 0,
      startAt: "2026-08-01 00:00:00",
      endAt: "2026-08-16 18:00:00",
      maxParticipants: null,
      currentParticipants: 0,
      bannerUrl: null,
      status: "upcoming",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 50000, premiumCredits: 5000, badge: "epl2026-champion" },
        { rank: 2, freePoints: 25000, premiumCredits: 2500 },
        { rank: 3, freePoints: 12000, premiumCredits: 1200 },
        { rank: [4, 10], freePoints: 5000, premiumCredits: 500 },
        { rank: [11, 50], freePoints: 2000 },
        { rank: [51, 100], freePoints: 1000 },
      ],
      badges: [
        { id: "epl2026-champion", name: "PL Kickoff King", icon: "trophy", description: "Won the Premier League 2026/27 kickoff predictor" },
        { id: "epl2026-participant", name: "PL Kickoff Player", icon: "star", description: "Participated in the PL 2026/27 kickoff event" },
      ],
    },
    {
      id: "wc-2026-final",
      title: "ฟุตบอลโลก 2026 รอบชิง",
      description:
        "ทายผลรอบชิงชนะเลิศ FIFA World Cup 2026\n\n🏆 MetLife Stadium, New Jersey\n📅 19 กรกฎาคม 2026",
      eventType: "single-match",
      entryFeePoints: 500,
      entryFeeCredits: 50,
      startAt: "2026-07-01 00:00:00",
      endAt: "2026-07-19 18:00:00",
      maxParticipants: null,
      currentParticipants: 0,
      bannerUrl: null,
      status: "upcoming",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 100000, premiumCredits: 5000, badge: "wc2026-champion" },
        { rank: 2, freePoints: 50000, premiumCredits: 2500, badge: "wc2026-runnerup" },
        { rank: 3, freePoints: 25000, premiumCredits: 1000, badge: "wc2026-third" },
        { rank: [4, 10], freePoints: 10000, premiumCredits: 500 },
        { rank: [11, 50], freePoints: 5000 },
        { rank: [51, 100], freePoints: 2500 },
      ],
      badges: [
        { id: "wc2026-champion", name: "World Cup Oracle", icon: "trophy", description: "Won the 2026 World Cup Final predictor" },
        { id: "wc2026-runnerup", name: "World Cup Silver", icon: "medal", description: "2nd place in the 2026 World Cup Final predictor" },
        { id: "wc2026-third", name: "World Cup Bronze", icon: "medal", description: "3rd place in the 2026 World Cup Final predictor" },
        { id: "wc2026-participant", name: "World Cup 2026 Player", icon: "globe", description: "Participated in the 2026 World Cup Final predictor" },
      ],
      matches: [
        { id: "wc-semi-01", homeTeam: "France", awayTeam: "England", date: "2026-07-14T20:00:00Z", status: "predicted", predictedScore: "2-1" },
        { id: "wc-semi-02", homeTeam: "Spain", awayTeam: "Germany", date: "2026-07-15T20:00:00Z", status: "predicted", predictedScore: "1-2" },
        { id: "wc-final-01", homeTeam: "TBD", awayTeam: "TBD", date: "2026-07-19T18:00:00Z", status: "upcoming" },
      ],
      leaderboard: [
        { rank: 1, username: "WorldChamp", points: 2450, accuracy: 88, predictions: 28 },
        { rank: 2, username: "GoalKing", points: 2320, accuracy: 84, predictions: 28 },
        { rank: 3, username: "FootOracle", points: 2180, accuracy: 81, predictions: 27 },
        { rank: 4, username: "ScoreMaster", points: 2050, accuracy: 79, predictions: 28 },
        { rank: 5, username: "BallSeer", points: 1950, accuracy: 77, predictions: 26 },
      ],
    },
    {
      id: "copa-america-2026",
      title: "Copa América 2026",
      description:
        "ทำนายผลโคปาอเมริกา 2026\n\n🌎 ทีมชาติอเมริกาใต้\n📅 มิถุนายน - กรกฎาคม 2026",
      eventType: "tournament",
      entryFeePoints: 300,
      entryFeeCredits: 20,
      startAt: "2026-06-01 00:00:00",
      endAt: "2026-07-15 23:59:59",
      maxParticipants: 10000,
      currentParticipants: 342,
      bannerUrl: null,
      status: "active",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 80000, premiumCredits: 4000, badge: "copa2026-champion" },
        { rank: 2, freePoints: 40000, premiumCredits: 2000, badge: "copa2026-runnerup" },
        { rank: 3, freePoints: 20000, premiumCredits: 1000 },
        { rank: [4, 10], freePoints: 8000, premiumCredits: 400 },
        { rank: [11, 50], freePoints: 3000 },
        { rank: [51, 100], freePoints: 1500 },
        { rank: [101, 200], freePoints: 500 },
      ],
      badges: [
        { id: "copa2026-champion", name: "Copa América Oracle", icon: "trophy", description: "Won the Copa América 2026 predictor" },
        { id: "copa2026-runnerup", name: "Copa América Silver", icon: "medal", description: "2nd place in Copa América 2026" },
        { id: "copa2026-participant", name: "Copa Player", icon: "globe", description: "Participated in Copa América 2026" },
      ],
      matches: [
        { id: "copa-match-01", homeTeam: "Argentina", awayTeam: "Brazil", date: "2026-06-20T20:00:00Z", status: "upcoming" },
        { id: "copa-match-02", homeTeam: "Uruguay", awayTeam: "Colombia", date: "2026-06-21T18:00:00Z", status: "predicted", predictedScore: "2-1" },
        { id: "copa-match-03", homeTeam: "Chile", awayTeam: "Paraguay", date: "2026-06-21T21:00:00Z", status: "live" },
        { id: "copa-match-04", homeTeam: "Ecuador", awayTeam: "Peru", date: "2026-06-19T20:00:00Z", status: "finished", actualScore: "2-0" },
        { id: "copa-match-05", homeTeam: "Venezuela", awayTeam: "Bolivia", date: "2026-06-19T18:00:00Z", status: "predicted", predictedScore: "1-1" },
        { id: "copa-match-06", homeTeam: "Brazil", awayTeam: "Uruguay", date: "2026-06-24T20:00:00Z", status: "upcoming" },
        { id: "copa-match-07", homeTeam: "Argentina", awayTeam: "Colombia", date: "2026-06-25T20:00:00Z", status: "upcoming" },
      ],
      leaderboard: [
        { rank: 1, username: "FutbolKing", points: 1240, accuracy: 82, predictions: 15 },
        { rank: 2, username: "CopaMaster", points: 1180, accuracy: 78, predictions: 15 },
        { rank: 3, username: "SudamericaPro", points: 1095, accuracy: 75, predictions: 14 },
        { rank: 4, username: "GoalHunter", points: 1020, accuracy: 72, predictions: 15 },
        { rank: 5, username: "PredicThor", points: 980, accuracy: 71, predictions: 14 },
        { rank: 6, username: "BallWizard", points: 920, accuracy: 68, predictions: 13 },
        { rank: 7, username: "ScoreSeeker", points: 880, accuracy: 67, predictions: 15 },
        { rank: 8, username: "คุณ", points: 680, accuracy: 65, predictions: 12, isCurrentUser: true },
        { rank: 9, username: "FootballFan", points: 640, accuracy: 62, predictions: 14 },
        { rank: 10, username: "MatchPoint", points: 600, accuracy: 60, predictions: 13 },
      ],
    },
    {
      id: "ucl-2026-final",
      title: "UCL 2026 รอบชิง",
      description:
        "ทายผลยูฟ่าแชมเปี้ยนส์ลีก รอบชิง\n\n🏟️ Puskás Aréna, Budapest\n📅 30 พฤษภาคม 2026",
      eventType: "single-match",
      entryFeePoints: 300,
      entryFeeCredits: 30,
      startAt: "2026-05-20 00:00:00",
      endAt: "2026-05-30 18:00:00",
      maxParticipants: 5000,
      currentParticipants: 0,
      bannerUrl: null,
      status: "upcoming",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 60000, premiumCredits: 3000, badge: "ucl2026-champion" },
        { rank: 2, freePoints: 30000, premiumCredits: 1500 },
        { rank: 3, freePoints: 15000, premiumCredits: 750 },
        { rank: [4, 10], freePoints: 5000, premiumCredits: 500 },
        { rank: [11, 50], freePoints: 2000 },
      ],
      badges: [
        { id: "ucl2026-champion", name: "European Oracle", icon: "trophy", description: "Won the UCL 2026 Final predictor" },
        { id: "ucl2026-participant", name: "UCL Player", icon: "star", description: "Participated in the UCL 2026 Final predictor" },
      ],
    },
    {
      id: "el-classico-2026",
      title: "El Clásico พิเศษ",
      description: "ศึกเอลกลาซิโก\n\n⚔️ บาร์เซโลน่า vs เรอัล มาดริด\n🏟️ Camp Nou",
      eventType: "single-match",
      entryFeePoints: 100,
      entryFeeCredits: 10,
      startAt: "2026-05-20 00:00:00",
      endAt: "2026-06-01 18:00:00",
      maxParticipants: 2000,
      currentParticipants: 856,
      bannerUrl: null,
      status: "active",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 25000, premiumCredits: 1000, badge: "elclassico2026-champion" },
        { rank: 2, freePoints: 12000, premiumCredits: 500 },
        { rank: 3, freePoints: 6000, premiumCredits: 250 },
        { rank: [4, 10], freePoints: 2000, premiumCredits: 100 },
        { rank: [11, 25], freePoints: 800 },
      ],
      badges: [
        { id: "elclassico2026-champion", name: "El Clásico King", icon: "trophy", description: "Won the El Clásico 2026 predictor" },
        { id: "elclassico2026-participant", name: "Clásico Player", icon: "zap", description: "Participated in El Clásico 2026" },
      ],
    },
    {
      id: "fa-cup-2026",
      title: "FA Cup 2026 รอบชิง",
      description: "FA Cup Final 2026\n\n🏟️ Wembley Stadium\n📅 16 พฤษภาคม 2026",
      eventType: "single-match",
      entryFeePoints: 200,
      entryFeeCredits: 20,
      startAt: "2026-05-01 00:00:00",
      endAt: "2026-05-16 14:00:00",
      maxParticipants: 3000,
      currentParticipants: 2198,
      bannerUrl: null,
      status: "ended",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 40000, premiumCredits: 2000, badge: "facup2026-champion" },
        { rank: 2, freePoints: 20000, premiumCredits: 1000 },
        { rank: 3, freePoints: 10000, premiumCredits: 500 },
        { rank: [4, 10], freePoints: 4000, premiumCredits: 200 },
        { rank: [11, 50], freePoints: 1500 },
      ],
      badges: [
        { id: "facup2026-champion", name: "FA Cup Oracle", icon: "trophy", description: "Won the FA Cup 2026 Final predictor" },
        { id: "facup2026-participant", name: "FA Cup Player", icon: "shield", description: "Participated in the FA Cup 2026 Final predictor" },
      ],
    },
    {
      id: "thai-league-2026",
      title: "ไทยลีก 2026/27 ทำนายแม่น",
      description:
        "ทำนายผลบอลไทยลีกทั้งฤดูกาล 2026/27\n\n🇹🇭 ทีมไทยแลนด์\n📅 แข่งขันทุกสัปดาห์",
      eventType: "season",
      entryFeePoints: 0,
      entryFeeCredits: 0,
      startAt: "2026-05-01 00:00:00",
      endAt: "2027-04-30 23:59:59",
      maxParticipants: null,
      currentParticipants: 128,
      bannerUrl: null,
      status: "active",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 20000, premiumCredits: 2000, badge: "thaileague2026-champion" },
        { rank: 2, freePoints: 10000, premiumCredits: 1000 },
        { rank: 3, freePoints: 5000, premiumCredits: 500 },
        { rank: [4, 10], freePoints: 2000 },
        { rank: [11, 25], freePoints: 800 },
        { rank: [26, 50], freePoints: 300 },
      ],
      badges: [
        { id: "thaileague2026-champion", name: "ไทยลีกออราเคิล", icon: "trophy", description: "Won the Thai League 2026/27 predictor" },
        { id: "thaileague2026-participant", name: "ไทยลีกเพลเยอร์", icon: "flag", description: "Participated in Thai League 2026/27" },
      ],
    },
    {
      id: "derby-milan-2026",
      title: "Derby della Madonnina",
      description:
        "ศึกมิลานดาร์บี้\n\n🔴⚫ AC Milan vs Inter Milan 🔵⚫\n🏟️ San Siro\n📅 10 พฤษภาคม 2026",
      eventType: "single-match",
      entryFeePoints: 150,
      entryFeeCredits: 15,
      startAt: "2026-04-20 00:00:00",
      endAt: "2026-05-10 18:00:00",
      maxParticipants: 1500,
      currentParticipants: 1203,
      bannerUrl: null,
      status: "ended",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 30000, premiumCredits: 1500, badge: "milan-derby2026-champion" },
        { rank: 2, freePoints: 15000, premiumCredits: 750 },
        { rank: 3, freePoints: 7500, premiumCredits: 350 },
        { rank: [4, 10], freePoints: 3000, premiumCredits: 150 },
        { rank: [11, 25], freePoints: 1000 },
      ],
      badges: [
        { id: "milan-derby2026-champion", name: "Derby King", icon: "trophy", description: "Won the Derby della Madonnina 2026 predictor" },
        { id: "milan-derby2026-participant", name: "Derby Player", icon: "zap", description: "Participated in Derby della Madonnina 2026" },
      ],
    },
  ],
};

export async function getEvents(
  params: GetEventsParams = {},
  options?: ApiRequestOptions
) {
  const response = await apiGetRaw<EventsApiPayload>(
    buildEventsPath(params),
    options
  );
  return normalizeEventsResponse(response);
}

export async function getEvent(eventId: string, options?: ApiRequestOptions) {
  const response = await apiGetRaw<EventApiPayload>(
    `/events/${encodeURIComponent(eventId)}`,
    options
  );
  return normalizeEventResponse(response);
}

export async function registerEvent(eventId: string, options?: ApiRequestOptions) {
  return apiPostRaw<RegisterEventResponse>(
    `/events/${encodeURIComponent(eventId)}/register`,
    undefined,
    options
  );
}

export function normalizeEventsResponse(response: EventsApiPayload): EventsResponse {
  if (Array.isArray(response)) return { data: response };
  if ("data" in response && Array.isArray(response.data)) return response;
  if ("events" in response && Array.isArray(response.events)) {
    return { data: response.events };
  }
  throw new Error("Invalid events response");
}

export function normalizeEventResponse(response: EventApiPayload): EventResponse {
  const record = readRecord(response);
  const dataRecord = readRecord(record?.data);

  if (dataRecord && "event" in dataRecord && isApiEvent(dataRecord.event)) {
    return {
      data: mergeEventLeaderboard(dataRecord.event, dataRecord),
    };
  }

  if (record && "event" in record && isApiEvent(record.event)) {
    return {
      data: mergeEventLeaderboard(record.event, record),
    };
  }

  if (record && "data" in record && isApiEvent(record.data)) {
    return {
      data: mergeEventLeaderboard(record.data, record),
    };
  }

  if (isApiEvent(response)) return { data: response };
  throw new Error("Invalid event response");
}

function mergeEventLeaderboard(event: ApiEvent, source: Record<string, unknown>): ApiEvent {
  const dataRecord = readRecord(source.data);
  const entries =
    readArray(source.entries) ??
    readArray(dataRecord?.entries) ??
    readArray(readRecord(source.leaderboard)?.entries) ??
    readArray(readRecord(dataRecord?.leaderboard)?.entries);
  const userEntry =
    readRecord(source.userEntry) ??
    readRecord(source.user_entry) ??
    readRecord(dataRecord?.userEntry) ??
    readRecord(dataRecord?.user_entry) ??
    readRecord(readRecord(source.leaderboard)?.userEntry) ??
    readRecord(readRecord(source.leaderboard)?.user_entry) ??
    readRecord(readRecord(dataRecord?.leaderboard)?.userEntry) ??
    readRecord(readRecord(dataRecord?.leaderboard)?.user_entry);
  const pagination =
    readRecord(source.pagination) ??
    readRecord(dataRecord?.pagination) ??
    readRecord(readRecord(source.leaderboard)?.pagination) ??
    readRecord(readRecord(dataRecord?.leaderboard)?.pagination);

  if (!entries && !userEntry && !pagination) return event;

  return {
    ...event,
    leaderboard: {
      entries: entries as ApiEventLeaderboardEntry[] | undefined,
      userEntry,
      pagination,
    },
  };
}

export function mapApiEvent(event: ApiEvent): SpecialEvent {
  const leaderboard = normalizeEventLeaderboard(event.leaderboard);

  return {
    id: event.id,
    name: event.title,
    description: event.description,
    tournamentType: mapEventType(event.eventType),
    startDate: event.startAt,
    endDate: event.endAt,
    entryFee: Number(event.entryFeeCredits ?? 0),
    entryFeePoints: Number(event.entryFeePoints ?? 0),
    entryFeeCredits: Number(event.entryFeeCredits ?? 0),
    rewards: event.rewards ?? [],
    badges: event.badges ?? [],
    matches: normalizeEventMatches(event.matches),
    leaderboard: leaderboard.entries,
    leaderboardUserEntry: leaderboard.userEntry,
    leaderboardPagination: leaderboard.pagination,
    participantCount: resolveEventParticipantCount(event, leaderboard),
    maxParticipants: event.maxParticipants,
    bannerUrl: event.bannerUrl,
    isRegistered: event.isRegistered,
    status: event.status,
    rules: event.rules ?? [],
  };
}

function resolveEventParticipantCount(
  event: ApiEvent,
  leaderboard: ReturnType<typeof normalizeEventLeaderboard>
) {
  const leaderboardTotal = leaderboard.pagination?.total;
  if (typeof leaderboardTotal === "number" && Number.isFinite(leaderboardTotal)) {
    return leaderboardTotal;
  }

  return Number(event.currentParticipants ?? 0);
}

function normalizeEventLeaderboard(payload: ApiEventLeaderboardPayload | undefined) {
  if (!payload) {
    return {
      entries: [],
      userEntry: null,
      pagination: null,
    };
  }

  if (Array.isArray(payload)) {
    return {
      entries: payload.map((entry) => normalizeEventLeaderboardEntry(entry)),
      userEntry: null,
      pagination: null,
    };
  }

  const userEntryRecord = readRecord(payload.userEntry);
  const userEntry = userEntryRecord
    ? {
        rank: readNumber(userEntryRecord.rank) ?? 0,
        totalPoints:
          readNumber(userEntryRecord.totalPoints, userEntryRecord.total_points) ?? 0,
      }
    : null;
  const paginationRecord = readRecord(payload.pagination);
  const entries = (payload.entries ?? []).map((entry) =>
    normalizeEventLeaderboardEntry(entry, userEntry)
  );

  return {
    entries,
    userEntry,
    pagination: paginationRecord
      ? {
          page: readNumber(paginationRecord.page) ?? 1,
          limit: readNumber(paginationRecord.limit) ?? entries.length,
          total: readNumber(paginationRecord.total) ?? entries.length,
          totalPages:
            readNumber(paginationRecord.totalPages, paginationRecord.total_pages) ?? 1,
        }
      : null,
  };
}

export function normalizeEventLeaderboardResponse(
  response: unknown
): EventLeaderboardResponse {
  const record = readRecord(response);
  const data = readRecord(record?.data);
  const source = data ?? record;
  const leaderboard = readRecord(source?.leaderboard);
  const entries =
    readArray(source?.entries) ??
    readArray(leaderboard?.entries) ??
    (Array.isArray(response) ? response : undefined);
  const userEntry =
    readRecord(source?.userEntry) ??
    readRecord(source?.user_entry) ??
    readRecord(leaderboard?.userEntry) ??
    readRecord(leaderboard?.user_entry);
  const pagination =
    readRecord(source?.pagination) ?? readRecord(leaderboard?.pagination);

  return normalizeEventLeaderboard({
    entries: (entries ?? []) as ApiEventLeaderboardEntry[],
    userEntry: userEntry
      ? {
          rank: readNumber(userEntry.rank) ?? 0,
          totalPoints:
            readNumber(userEntry.totalPoints, userEntry.total_points) ?? 0,
        }
      : null,
    pagination: pagination
      ? {
          page: readNumber(pagination.page) ?? 1,
          limit: readNumber(pagination.limit) ?? entries?.length ?? 0,
          total: readNumber(pagination.total) ?? entries?.length ?? 0,
          totalPages:
            readNumber(pagination.totalPages, pagination.total_pages) ?? 1,
        }
      : null,
  });
}

function normalizeEventLeaderboardEntry(
  entry: ApiEventLeaderboardEntry,
  userEntry?: { rank: number; totalPoints: number } | null
): EventLeaderboardEntry {
  const member = readRecord(entry.member);
  const user = readRecord(entry.user);
  const profile = readRecord(entry.profile);
  const stats =
    readRecord(entry.userStats) ??
    readRecord(entry.user_stats) ??
    readRecord(entry.stats) ??
    readRecord(member?.userStats) ??
    readRecord(member?.user_stats) ??
    readRecord(member?.stats) ??
    readRecord(user?.userStats) ??
    readRecord(user?.user_stats) ??
    readRecord(user?.stats);
  const totalPoints =
    readNumber(entry.totalPoints, entry.total_points, entry.points) ?? 0;

  return {
    rank: readNumber(entry.rank) ?? 0,
    username:
      readString(entry.username, member?.username, user?.username, profile?.username) ??
      "Unknown",
    avatarUrl: readString(
      entry.avatarUrl,
      entry.avatar_url,
      member?.avatarUrl,
      member?.avatar_url,
      user?.avatarUrl,
      user?.avatar_url,
      profile?.avatarUrl,
      profile?.avatar_url
    ),
    points: totalPoints,
    totalPoints,
    accuracy:
      readNumber(entry.accuracy, stats?.accuracy, stats?.predictionAccuracy) ?? 0,
    predictions:
      readNumber(entry.predictions, stats?.predictions, stats?.totalPredictions) ?? 0,
    level: readNumber(entry.level, stats?.level, member?.level, user?.level),
    xp: readNumber(entry.xp, stats?.xp, member?.xp, user?.xp),
    isCurrentUser:
      entry.isCurrentUser ??
      (userEntry
        ? userEntry.rank === (readNumber(entry.rank) ?? 0) &&
          userEntry.totalPoints === totalPoints
        : undefined),
  };
}

function normalizeEventMatches(matches: unknown[] | undefined): EventMatchData[] {
  if (!Array.isArray(matches)) return [];

  return matches.map((match, index) => {
    const record = readRecord(match) ?? {};
    const homeTeam = readTeamName(
      record.homeTeam,
      record.home_team,
      record.home,
      record.homeTeamName,
      record.home_team_name
    );
    const awayTeam = readTeamName(
      record.awayTeam,
      record.away_team,
      record.away,
      record.awayTeamName,
      record.away_team_name
    );
    const predictedScore = readScore(
      record.predictedScore,
      record.predicted_score,
      record.prediction,
      record.userPrediction,
      record.user_prediction,
      record.myPrediction,
      record.my_prediction,
      record.predictions
    );
    const predictionRecord =
      readRecord(record.prediction) ??
      readRecord(record.userPrediction) ??
      readRecord(record.user_prediction) ??
      readRecord(record.myPrediction) ??
      readRecord(record.my_prediction) ??
      readFirstRecord(record.predictions);
    const predictionStatus = readString(
      record.predictionStatus,
      record.prediction_status,
      predictionRecord?.status
    );
    const isPredicted =
      readBoolean(
        record.isPredicted,
        record.is_predicted,
        record.hasPrediction,
        record.has_prediction,
        record.predicted,
        record.is_predicted_by_user,
        record.has_user_prediction,
        predictionRecord?.isPredicted,
        predictionRecord?.is_predicted
      ) ??
      Boolean(predictedScore || predictionRecord || predictionStatus === "predicted");

    return {
      id:
        readString(record.id, record.matchId, record.match_id, record.fixtureId, record.fixture_id) ??
        `event-match-${index + 1}`,
      homeTeam: homeTeam ?? "-",
      awayTeam: awayTeam ?? "-",
      homeLogo: readTeamLogo(record.homeTeam, record.home_team, record.home),
      awayLogo: readTeamLogo(record.awayTeam, record.away_team, record.away),
      date:
        readString(
          record.date,
          record.matchDate,
          record.match_date,
          record.kickoffAt,
          record.kickoff_at,
          record.startAt,
          record.start_at
        ) ?? "",
      status: normalizeEventMatchStatus(
        readString(record.status, predictionStatus),
        isPredicted
      ),
      predictedScore,
      actualScore: readScore(record.actualScore, record.actual_score, record.score),
      isPredicted,
    };
  });
}

function readTeamName(...values: unknown[]) {
  for (const value of values) {
    const text = readString(value);
    if (text) return text;

    const record = readRecord(value);
    const name = readString(
      record?.name,
      record?.displayName,
      record?.display_name,
      record?.shortName,
      record?.short_name
    );
    if (name) return name;
  }

  return null;
}

function readTeamLogo(...values: unknown[]) {
  for (const value of values) {
    const record = readRecord(value);
    const logo = readString(
      record?.logo,
      record?.logoUrl,
      record?.logo_url,
      record?.image,
      record?.imageUrl,
      record?.image_url
    );
    if (logo) return logo;
  }

  return null;
}

function readScore(...values: unknown[]): string | undefined {
  for (const value of values) {
    const text = readString(value);
    if (text) return text;

    const firstRecord = readFirstRecord(value);
    if (firstRecord) {
      const firstScore = readScore(firstRecord);
      if (firstScore) return firstScore;
    }

    const record = readRecord(value);
    const home = readNumber(
      record?.home,
      record?.homeScore,
      record?.home_score,
      record?.homeTeamScore,
      record?.home_team_score,
      record?.predictedHomeScore,
      record?.predicted_home_score
    );
    const away = readNumber(
      record?.away,
      record?.awayScore,
      record?.away_score,
      record?.awayTeamScore,
      record?.away_team_score,
      record?.predictedAwayScore,
      record?.predicted_away_score
    );
    if (home !== null && away !== null) return `${home}-${away}`;
  }

  return undefined;
}

function readFirstRecord(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value.map(readRecord).find(Boolean);
}

function normalizeEventMatchStatus(
  status: string | null,
  isPredicted = false
): EventMatchData["status"] {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  const liveStatuses = new Set(["live", "1h", "2h", "ht", "et", "bt", "p", "pen"]);
  const finishedStatuses = new Set([
    "finished",
    "ended",
    "ft",
    "aet",
    "awarded",
    "cancelled",
    "canceled",
    "postponed",
    "suspended",
    "abandoned",
  ]);

  if (liveStatuses.has(normalizedStatus)) return "live";
  if (finishedStatuses.has(normalizedStatus)) return "finished";
  if (normalizedStatus === "predicted") return "predicted";
  if (isPredicted) return "predicted";
  return "upcoming";
}

function readBoolean(...values: unknown[]): boolean | null {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number" && Number.isFinite(value)) return value !== 0;
    if (typeof value === "string" && value.trim()) {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes"].includes(normalized)) return true;
      if (["false", "0", "no"].includes(normalized)) return false;
    }
  }
  return null;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function readArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function readString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function readNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function mapEventType(eventType: ApiEvent["eventType"]): SpecialEvent["tournamentType"] {
  if (eventType === "tournament") return "tournament";
  if (eventType === "season") return "season";
  if (eventType === "single-match") return "single-match";
  return "custom";
}

function isApiEvent(value: unknown): value is ApiEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value
  );
}

function buildEventsPath(params: GetEventsParams) {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.eventType) searchParams.set("eventType", params.eventType);
  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return query ? `/events?${query}` : "/events";
}
