export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  tournamentType:
    | 'worldCup'
    | 'ucl'
    | 'afc'
    | 'custom'
    | 'tournament'
    | 'single-match'
    | 'season';
  startDate: string;
  endDate: string;
  entryFee: number;
  entryFeePoints?: number;
  entryFeeCredits?: number;
  rewards: EventReward[];
  badges: EventBadge[];
  participantCount: number;
  maxParticipants?: number | null;
  bannerUrl?: string | null;
  isRegistered?: boolean;
  status: 'upcoming' | 'active' | 'ended';
  rules?: string[];
  matches?: EventMatchData[];
  leaderboard?: EventLeaderboardEntry[];
  leaderboardUserEntry?: {
    rank: number;
    totalPoints: number;
  } | null;
  leaderboardPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

export interface EventReward {
  rank: number | [number, number];
  freePoints: number;
  premiumCredits?: number;
  badge?: string;
}

export interface EventBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface EventMatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string | null;
  awayLogo?: string | null;
  date: string;
  status: 'upcoming' | 'live' | 'finished' | 'predicted';
  predictedScore?: string;
  actualScore?: string;
  isPredicted?: boolean;
}

export interface EventLeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl?: string | null;
  points: number;
  totalPoints?: number;
  accuracy: number;
  predictions: number;
  level?: number | null;
  xp?: number | null;
  isCurrentUser?: boolean;
}
