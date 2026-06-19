export type ScoringRuleTier = {
  name?: string;
  description?: string;
  basePoints?: number;
  bonusPoints?: number;
  totalPoints?: number;
};

export type ScoringRules = {
  resultTiers?: Partial<Record<"exact" | "goalDiff" | "result", ScoringRuleTier>>;
  bonuses?: Record<string, { name?: string; points?: number }>;
  confidenceMultipliers?: Partial<
    Record<"safe" | "confident" | "bold", { name?: string; multiplier?: number }>
  >;
  boost?: { name?: string; description?: string; multiplier?: number };
  streak?: { name?: string; description?: string; bonusPerLevel?: number; formula?: string };
  formula?: { description?: string; profit?: string };
};
