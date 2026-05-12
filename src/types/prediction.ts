import { MatchResult, PredictionStatus } from './common';

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedResult: MatchResult;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
  actualResult: MatchResult | null;
  pointsEarned: number;
  status: PredictionStatus;
  createdAt: string;
  lockedAt: string | null;
  isLocked: boolean;
  streakNumber: number;
  comboMultiplier: number;
}

export interface PredictionInput {
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}
