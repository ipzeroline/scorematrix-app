import { MatchStatus } from './common';

export interface Match {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoffTime: string;
  minute: number | null;
  venue: string;
  round: string;
  isFeatured: boolean;
  isMatchOfTheDay: boolean;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'goal' | 'card_yellow' | 'card_red' | 'substitution' | 'var' | 'penalty_missed' | 'penalty_scored' | 'own_goal';
  minute: number;
  minuteExtra: number | null;
  playerName: string;
  playerId: string;
  team: 'home' | 'away';
  detail: string | null;
}

export interface Lineup {
  matchId: string;
  homeFormation: string;
  awayFormation: string;
  homeStarting: PlayerLineup[];
  awayStarting: PlayerLineup[];
  homeSubs: PlayerLineup[];
  awaySubs: PlayerLineup[];
}

export interface PlayerLineup {
  playerId: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  x: number;
  y: number;
}

export interface MatchStats {
  matchId: string;
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
  yellowCardsHome: number;
  yellowCardsAway: number;
  redCardsHome: number;
  redCardsAway: number;
  offsidesHome: number;
  offsidesAway: number;
  passesHome: number;
  passesAway: number;
  passAccuracyHome: number;
  passAccuracyAway: number;
}
