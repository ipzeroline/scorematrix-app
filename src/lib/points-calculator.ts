import { POINTS } from "./constants";

export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  streak: number
): { points: number; result: "exact" | "goalDiff" | "result" | "wrong"; comboMultiplier: number } {
  const predictedResult =
    predictedHome > predictedAway
      ? "home"
      : predictedHome < predictedAway
        ? "away"
        : "draw";
  const actualResult =
    actualHome > actualAway
      ? "home"
      : actualHome < actualAway
        ? "away"
        : "draw";

  const predictedGoalDiff = predictedHome - predictedAway;
  const actualGoalDiff = actualHome - actualAway;

  let basePoints: number;
  let result: "exact" | "goalDiff" | "result" | "wrong";

  if (predictedHome === actualHome && predictedAway === actualAway) {
    basePoints = POINTS.exactScore;
    result = "exact";
  } else if (predictedResult === actualResult && predictedGoalDiff === actualGoalDiff) {
    basePoints = POINTS.correctResultAndGoalDiff;
    result = "goalDiff";
  } else if (predictedResult === actualResult) {
    basePoints = POINTS.correctResult;
    result = "result";
  } else {
    basePoints = POINTS.wrongResult;
    result = "wrong";
  }

  const streakBonus = Math.min(streak - 1, 10) * POINTS.streakBonusPerLevel;
  const comboMultiplier = streak >= POINTS.comboThreshold ? POINTS.comboMultiplier : 1;

  const totalPoints = Math.round((basePoints + streakBonus) * comboMultiplier);

  return { points: totalPoints, result, comboMultiplier };
}
