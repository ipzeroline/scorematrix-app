import { PredictionStatus, MatchResult } from '@/types/common';
import type { Prediction } from '@/types/prediction';

function generatePredictions(): Prediction[] {
  const predictions: Prediction[] = [];
  let counter = 0;

  // Helper
  function resultFromScores(home: number, away: number): MatchResult {
    if (home > away) return MatchResult.HOME;
    if (away > home) return MatchResult.AWAY;
    return MatchResult.DRAW;
  }

  function pointsFor(actualHome: number, actualAway: number, predHome: number, predAway: number, status: PredictionStatus): number {
    if (status === PredictionStatus.PENDING || status === PredictionStatus.PARTIAL) return 0;
    if (predHome === actualHome && predAway === actualAway) return 40; // exact score
    if (resultFromScores(predHome, predAway) === resultFromScores(actualHome, actualAway)) return 20; // correct result
    return 0;
  }

  // Finished matches data for reference (match-066 to match-105)
  const finishedMatches = [
    { id: 'match-066', home: 3, away: 1 }, { id: 'match-067', home: 0, away: 2 }, { id: 'match-068', home: 2, away: 2 },
    { id: 'match-069', home: 4, away: 1 }, { id: 'match-070', home: 1, away: 0 }, { id: 'match-071', home: 2, away: 0 },
    { id: 'match-072', home: 1, away: 1 }, { id: 'match-073', home: 5, away: 0 }, { id: 'match-074', home: 3, away: 2 },
    { id: 'match-075', home: 1, away: 0 }, { id: 'match-076', home: 0, away: 3 }, { id: 'match-077', home: 2, away: 1 },
    { id: 'match-078', home: 2, away: 0 }, { id: 'match-079', home: 4, away: 1 }, { id: 'match-080', home: 1, away: 1 },
    { id: 'match-081', home: 1, away: 0 }, { id: 'match-082', home: 0, away: 2 }, { id: 'match-083', home: 1, away: 3 },
    { id: 'match-084', home: 2, away: 2 }, { id: 'match-085', home: 2, away: 1 }, { id: 'match-086', home: 1, away: 1 },
    { id: 'match-087', home: 0, away: 3 }, { id: 'match-088', home: 2, away: 1 }, { id: 'match-089', home: 0, away: 2 },
    { id: 'match-090', home: 3, away: 2 }, { id: 'match-091', home: 2, away: 0 }, { id: 'match-092', home: 3, away: 1 },
    { id: 'match-093', home: 1, away: 0 }, { id: 'match-094', home: 2, away: 3 }, { id: 'match-095', home: 1, away: 0 },
    { id: 'match-096', home: 2, away: 2 }, { id: 'match-097', home: 4, away: 2 }, { id: 'match-098', home: 0, away: 1 },
    { id: 'match-099', home: 1, away: 2 }, { id: 'match-100', home: 3, away: 0 }, { id: 'match-101', home: 0, away: 1 },
    { id: 'match-102', home: 1, away: 1 }, { id: 'match-103', home: 0, away: 4 }, { id: 'match-104', home: 2, away: 0 },
    { id: 'match-105', home: 1, away: 2 },
  ];

  // Upcoming matches (match-016 to match-065)
  const upcomingMatchIds = Array.from({ length: 50 }, (_, i) => `match-${String(16 + i).padStart(3, '0')}`);

  // ---- PENDING predictions for upcoming matches (150) ----
  for (let i = 0; i < 150; i++) {
    const userId = `user-${String((i % 98) + 1).padStart(3, '0')}`;
    const matchId = upcomingMatchIds[i % upcomingMatchIds.length];
    const predHome = Math.floor(Math.random() * 4);
    const predAway = Math.floor(Math.random() * 3);
    counter++;
    predictions.push({
      id: `pred-${String(counter).padStart(3, '0')}`,
      userId,
      matchId,
      predictedHomeScore: predHome,
      predictedAwayScore: predAway,
      predictedResult: resultFromScores(predHome, predAway),
      actualHomeScore: null,
      actualAwayScore: null,
      actualResult: null,
      pointsEarned: 0,
      status: PredictionStatus.PENDING,
      createdAt: new Date(Date.now() - (Math.floor(Math.random() * 48)) * 3600000).toISOString(),
      lockedAt: null,
      isLocked: false,
      streakNumber: 1,
      comboMultiplier: 1.0,
    });
  }

  // ---- CORRECT predictions (150) ----
  for (let i = 0; i < 150; i++) {
    const fm = finishedMatches[i % finishedMatches.length];
    const userId = `user-${String(((i * 3 + 5) % 98) + 1).padStart(3, '0')}`;
    // Most predict exactly right or correct result
    const exact = i % 3 === 0;
    const predHome = exact ? fm.home : (fm.home + (i % 2 === 0 ? 0 : 1));
    const predAway = exact ? fm.away : (fm.away + (i % 2 === 0 ? 1 : 0));
    // Force CORRECT for half
    const finalStatus = i < 110 ? PredictionStatus.CORRECT : (i < 130 ? PredictionStatus.CORRECT : PredictionStatus.INCORRECT);
    counter++;
    predictions.push({
      id: `pred-${String(counter).padStart(3, '0')}`,
      userId,
      matchId: fm.id,
      predictedHomeScore: predHome,
      predictedAwayScore: predAway,
      predictedResult: resultFromScores(predHome, predAway),
      actualHomeScore: fm.home,
      actualAwayScore: fm.away,
      actualResult: resultFromScores(fm.home, fm.away),
      pointsEarned: finalStatus === PredictionStatus.CORRECT ? (exact ? 15 : 10) : 0,
      status: finalStatus,
      createdAt: new Date(Date.now() - (14 - (i % 14)) * 86400000).toISOString(),
      lockedAt: new Date(Date.now() - (14 - (i % 14)) * 86400000 + 3600000).toISOString(),
      isLocked: true,
      streakNumber: (i % 10) + 1,
      comboMultiplier: i % 3 === 0 ? 1.5 : 1.0,
    });
  }

  // ---- INCORRECT predictions (150) ----
  for (let i = 0; i < 150; i++) {
    const fm = finishedMatches[i % finishedMatches.length];
    const userId = `user-${String(((i * 7 + 11) % 98) + 1).padStart(3, '0')}`;
    // Predict wrong score
    const actualResult = resultFromScores(fm.home, fm.away);
    let predHome = fm.home;
    let predAway = fm.away;
    // Flip the result
    if (actualResult === MatchResult.HOME) { predHome = 0; predAway = fm.home; }
    else if (actualResult === MatchResult.AWAY) { predHome = fm.away; predAway = 0; }
    else { predHome = fm.home + 1; predAway = fm.away; }
    counter++;
    predictions.push({
      id: `pred-${String(counter).padStart(3, '0')}`,
      userId,
      matchId: fm.id,
      predictedHomeScore: predHome,
      predictedAwayScore: predAway,
      predictedResult: resultFromScores(predHome, predAway),
      actualHomeScore: fm.home,
      actualAwayScore: fm.away,
      actualResult: resultFromScores(fm.home, fm.away),
      pointsEarned: 0,
      status: PredictionStatus.INCORRECT,
      createdAt: new Date(Date.now() - (14 - (i % 14)) * 86400000).toISOString(),
      lockedAt: new Date(Date.now() - (14 - (i % 14)) * 86400000 + 3600000).toISOString(),
      isLocked: true,
      streakNumber: 1,
      comboMultiplier: 1.0,
    });
  }

  // ---- PARTIAL predictions (50) ----
  for (let i = 0; i < 50; i++) {
    const fm = finishedMatches[i % finishedMatches.length];
    const userId = `user-${String(((i * 5 + 23) % 98) + 1).padStart(3, '0')}`;
    counter++;
    predictions.push({
      id: `pred-${String(counter).padStart(3, '0')}`,
      userId,
      matchId: fm.id,
      predictedHomeScore: fm.home,
      predictedAwayScore: fm.away - 1 >= 0 ? fm.away - 1 : fm.away + 1,
      predictedResult: resultFromScores(fm.home, fm.away),
      actualHomeScore: fm.home,
      actualAwayScore: fm.away,
      actualResult: resultFromScores(fm.home, fm.away),
      pointsEarned: 5,
      status: PredictionStatus.PARTIAL,
      createdAt: new Date(Date.now() - (14 - (i % 14)) * 86400000).toISOString(),
      lockedAt: new Date(Date.now() - (14 - (i % 14)) * 86400000 + 3600000).toISOString(),
      isLocked: true,
      streakNumber: (i % 5) + 1,
      comboMultiplier: 1.0,
    });
  }

  return predictions;
}

export const predictions = generatePredictions();
