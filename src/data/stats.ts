export interface LeagueAccuracy {
  leagueId: string;
  leagueName: string;
  accuracy: number;
  predictions: number;
  points: number;
  correctCount: number;
}

export interface DailyForm {
  date: string;
  accuracy: number;
  points: number;
  predictions: number;
}

export const LEAGUE_ACCURACY: LeagueAccuracy[] = [
  { leagueId: 'PL', leagueName: 'Premier League', accuracy: 72, predictions: 45, points: 340, correctCount: 32 },
  { leagueId: 'PD', leagueName: 'La Liga', accuracy: 65, predictions: 38, points: 260, correctCount: 25 },
  { leagueId: 'BL1', leagueName: 'Bundesliga', accuracy: 78, predictions: 22, points: 185, correctCount: 17 },
  { leagueId: 'SA', leagueName: 'Serie A', accuracy: 68, predictions: 30, points: 210, correctCount: 20 },
  { leagueId: 'FL1', leagueName: 'Ligue 1', accuracy: 60, predictions: 18, points: 115, correctCount: 11 },
  { leagueId: 'DED', leagueName: 'Eredivisie', accuracy: 74, predictions: 15, points: 120, correctCount: 11 },
  { leagueId: 'J1', leagueName: 'J1 League', accuracy: 82, predictions: 10, points: 88, correctCount: 8 },
  { leagueId: 'K1', leagueName: 'K League 1', accuracy: 70, predictions: 12, points: 90, correctCount: 8 },
  { leagueId: 'T1', leagueName: 'Thai League 1', accuracy: 85, predictions: 8, points: 72, correctCount: 7 },
  { leagueId: 'V1', leagueName: 'V.League 1', accuracy: 75, predictions: 6, points: 48, correctCount: 5 },
  { leagueId: 'CSL', leagueName: 'Chinese Super League', accuracy: 67, predictions: 14, points: 98, correctCount: 9 },
  { leagueId: 'PPL', leagueName: 'Primeira Liga', accuracy: 71, predictions: 8, points: 60, correctCount: 6 },
];

export const DAILY_FORM_30_DAY: DailyForm[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2026-05-16');
  d.setDate(d.getDate() - (29 - i));
  const accuracyBase = 50 + Math.random() * 40;
  return {
    date: d.toISOString().slice(0, 10),
    accuracy: Math.round(accuracyBase),
    points: Math.round(5 + Math.random() * 40),
    predictions: Math.round(1 + Math.random() * 5),
  };
});
