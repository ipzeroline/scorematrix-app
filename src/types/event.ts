export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  tournamentType: 'worldCup' | 'ucl' | 'afc' | 'custom';
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
