import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";
import type { LeaderboardEntry, LeaderboardReward } from "@/types/leaderboard";

export type ApiLeaderboardEntry = {
  rank: number;
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  accuracy: number;
  streak: number;
  level: number;
};

export type LeaderboardResponse = {
  period: {
    start: string;
    end: string;
  };
  entries: ApiLeaderboardEntry[];
  userEntry: ApiLeaderboardEntry | null;
  rewards: LeaderboardReward[];
};

type LeaderboardApiPayload =
  | LeaderboardResponse
  | {
      data?: LeaderboardResponse;
      leaderboard?: LeaderboardResponse;
    };

export const DEFAULT_LEADERBOARD_RESPONSE: LeaderboardResponse = {
  period: {
    start: "2026-05-25T00:00:00+07:00",
    end: "2026-05-25T02:25:13+07:00",
  },
  entries: [
    {
      rank: 1,
      userId: "213",
      username: null,
      avatarUrl: null,
      points: 5,
      accuracy: 0,
      streak: 1,
      level: 1,
    },
    {
      rank: 2,
      userId: "a1daad25-ed00-4723-b075-38d732da075f",
      username: null,
      avatarUrl: null,
      points: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
    },
    {
      rank: 3,
      userId: "a1dab8bc-9682-4fe3-8a6e-211c57b62809",
      username: null,
      avatarUrl: null,
      points: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
    },
    {
      rank: 4,
      userId: "a1dab993-c3e6-4ed6-b08d-33a5c4f46a68",
      username: null,
      avatarUrl: null,
      points: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
    },
    {
      rank: 5,
      userId: "a1dab9e3-cf0a-4ed3-b7d5-4b3aebdef2f7",
      username: null,
      avatarUrl: null,
      points: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
    },
    {
      rank: 6,
      userId: "210",
      username: null,
      avatarUrl: null,
      points: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
    },
    {
      rank: 7,
      userId: "211",
      username: null,
      avatarUrl: null,
      points: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
    },
    {
      rank: 8,
      userId: "212",
      username: null,
      avatarUrl: null,
      points: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
    },
    {
      rank: 9,
      userId: "a1db1838-af86-48f4-95fe-0c513789ee6f",
      username: null,
      avatarUrl: null,
      points: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
    },
  ],
  userEntry: null,
  rewards: [
    {
      rankRange: [1, 1],
      reward: {
        freePoints: 5000,
        premiumCredits: 200,
        badge: "weekly-champion",
      },
    },
    {
      rankRange: [2, 3],
      reward: {
        freePoints: 2000,
        premiumCredits: 100,
      },
    },
    {
      rankRange: [4, 10],
      reward: {
        freePoints: 1000,
      },
    },
    {
      rankRange: [11, 50],
      reward: {
        freePoints: 300,
      },
    },
  ],
};

export async function getLeaderboard(options?: ApiRequestOptions) {
  const response = await apiGetRaw<LeaderboardApiPayload>("/leaderboard", options);
  return normalizeLeaderboardResponse(response);
}

export function normalizeLeaderboardResponse(
  response: LeaderboardApiPayload
): LeaderboardResponse {
  if ("entries" in response && Array.isArray(response.entries)) return response;
  if ("data" in response && response.data?.entries) return response.data;
  if ("leaderboard" in response && response.leaderboard?.entries) {
    return response.leaderboard;
  }
  return DEFAULT_LEADERBOARD_RESPONSE;
}

export function mapApiLeaderboardEntry(entry: ApiLeaderboardEntry): LeaderboardEntry {
  return {
    rank: Number(entry.rank ?? 0),
    userId: String(entry.userId ?? ""),
    username: entry.username?.trim() || fallbackUsername(entry.userId),
    avatar: entry.avatarUrl,
    points: Number(entry.points ?? 0),
    accuracy: Number(entry.accuracy ?? 0),
    streak: Number(entry.streak ?? 0),
    level: Number(entry.level ?? 1),
  };
}

function fallbackUsername(userId: string) {
  const id = String(userId ?? "");
  if (!id) return "Player";
  return `User ${id.length > 8 ? id.slice(0, 8) : id}`;
}
