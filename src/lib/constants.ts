export const COLORS = {
  free: "#10b981",
  freeDim: "#059669",
  premium: "#f59e0b",
  premiumDim: "#d97706",
  cyan: "#22d3ee",
  magenta: "#d946ef",
  purple: "#8b5cf6",
  red: "#ef4444",
} as const;

export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2100,
  8: 2800,
  9: 3600,
  10: 4500,
  15: 10000,
  20: 20000,
  30: 50000,
  50: 100000,
};

export const POINTS = {
  exactScore: 10,
  correctResultAndGoalDiff: 7,
  correctResult: 5,
  wrongResult: 0,
  streakBonusPerLevel: 2,
  comboThreshold: 5,
  comboMultiplier: 1.5,
} as const;

export { LOCALES } from "@/i18n";
