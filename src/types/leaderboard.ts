import { LeaderboardPeriod } from './common';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  points: number;
  accuracy: number;
  streak: number;
  level: number;
}

export interface Leaderboard {
  type: LeaderboardPeriod;
  period: { start: string; end: string };
  entries: LeaderboardEntry[];
}

export interface PrivateLeague {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  memberCount: number;
  maxMembers: number;
  members: PrivateLeagueMember[];
  createdAt: string;
}

export interface PrivateLeagueMember {
  userId: string;
  username: string;
  avatar: string | null;
  points: number;
  accuracy: number;
  joinedAt: string;
}
