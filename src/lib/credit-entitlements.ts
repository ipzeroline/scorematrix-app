export const CREDIT_ENTITLEMENT_KEYS = [
  "AI_ANALYSIS_MONTHLY",
  "DEEP_PREDICTION",
  "CONFIDENCE_BOOST",
  "PRO_STATISTICS",
  "PRIVATE_LEAGUE_LIMIT",
  "PRIVATE_LEAGUE_MEMBER_LIMIT",
  "STREAK_SHIELD_MONTHLY",
  "UNLIMITED_STREAK_SHIELD",
  "PREDICTION_BOOST_MONTHLY",
  "PRIORITY_SUPPORT",
] as const;

export type CurrentUserEntitlementKey = (typeof CREDIT_ENTITLEMENT_KEYS)[number];
export type CurrentUserEntitlements = Partial<Record<CurrentUserEntitlementKey, string>>;

type CreditFeatureSpec = {
  key: string;
  name: string;
  included: boolean;
  value?: string;
  highlighted?: boolean;
};

type CreditPackageEntitlementSpec = {
  entitlements: CurrentUserEntitlements;
  features: CreditFeatureSpec[];
};

const PACKAGE_ENTITLEMENTS_BY_PRICE_THB: Record<number, CreditPackageEntitlementSpec> = {
  50: {
    entitlements: {
      AI_ANALYSIS_MONTHLY: "3",
      DEEP_PREDICTION: "true",
      PRIVATE_LEAGUE_LIMIT: "3",
      PRIVATE_LEAGUE_MEMBER_LIMIT: "25",
      STREAK_SHIELD_MONTHLY: "1",
    },
    features: [
      { key: "aiInsightDaily", name: "aiInsightDaily", included: true, value: "3" },
      { key: "deepPrediction", name: "deepPrediction", included: true },
      { key: "confidenceBoost", name: "confidenceBoost", included: false },
      { key: "proStats", name: "proStats", included: false },
      { key: "privateLeagues", name: "privateLeagues", included: true, value: "3" },
      { key: "maxLeagueMembers", name: "maxLeagueMembers", included: true, value: "25" },
      { key: "streakShield", name: "streakShield", included: true, value: "1" },
      { key: "predictionBoost", name: "predictionBoost", included: false },
      { key: "prioritySupport", name: "prioritySupport", included: false },
    ],
  },
  100: {
    entitlements: {
      AI_ANALYSIS_MONTHLY: "5",
      DEEP_PREDICTION: "true",
      CONFIDENCE_BOOST: "true",
      PRIVATE_LEAGUE_LIMIT: "5",
      PRIVATE_LEAGUE_MEMBER_LIMIT: "50",
      STREAK_SHIELD_MONTHLY: "2",
      PREDICTION_BOOST_MONTHLY: "1",
    },
    features: [
      { key: "aiInsightDaily", name: "aiInsightDaily", included: true, value: "5" },
      { key: "deepPrediction", name: "deepPrediction", included: true },
      { key: "confidenceBoost", name: "confidenceBoost", included: true, highlighted: true },
      { key: "proStats", name: "proStats", included: false },
      { key: "privateLeagues", name: "privateLeagues", included: true, value: "5" },
      { key: "maxLeagueMembers", name: "maxLeagueMembers", included: true, value: "50" },
      { key: "streakShield", name: "streakShield", included: true, value: "2" },
      { key: "predictionBoost", name: "predictionBoost", included: true, value: "1" },
      { key: "prioritySupport", name: "prioritySupport", included: false },
    ],
  },
  200: {
    entitlements: {
      AI_ANALYSIS_MONTHLY: "10",
      DEEP_PREDICTION: "true",
      CONFIDENCE_BOOST: "true",
      PRO_STATISTICS: "true",
      PRIVATE_LEAGUE_LIMIT: "10",
      PRIVATE_LEAGUE_MEMBER_LIMIT: "100",
      STREAK_SHIELD_MONTHLY: "3",
      PREDICTION_BOOST_MONTHLY: "2",
    },
    features: [
      { key: "aiInsightDaily", name: "aiInsightDaily", included: true, value: "10" },
      { key: "deepPrediction", name: "deepPrediction", included: true },
      { key: "confidenceBoost", name: "confidenceBoost", included: true },
      { key: "proStats", name: "proStats", included: true, highlighted: true },
      { key: "privateLeagues", name: "privateLeagues", included: true, value: "10" },
      { key: "maxLeagueMembers", name: "maxLeagueMembers", included: true, value: "100" },
      { key: "streakShield", name: "streakShield", included: true, value: "3" },
      { key: "predictionBoost", name: "predictionBoost", included: true, value: "2" },
      { key: "prioritySupport", name: "prioritySupport", included: false },
    ],
  },
  500: {
    entitlements: {
      AI_ANALYSIS_MONTHLY: "unlimited",
      DEEP_PREDICTION: "true",
      CONFIDENCE_BOOST: "true",
      PRO_STATISTICS: "true",
      PRIVATE_LEAGUE_LIMIT: "20",
      PRIVATE_LEAGUE_MEMBER_LIMIT: "200",
      STREAK_SHIELD_MONTHLY: "5",
      PREDICTION_BOOST_MONTHLY: "3",
      PRIORITY_SUPPORT: "true",
    },
    features: [
      { key: "aiInsightDaily", name: "aiInsightDaily", included: true, value: "unlimited" },
      { key: "deepPrediction", name: "deepPrediction", included: true },
      { key: "confidenceBoost", name: "confidenceBoost", included: true },
      { key: "proStats", name: "proStats", included: true },
      { key: "privateLeagues", name: "privateLeagues", included: true, value: "20" },
      { key: "maxLeagueMembers", name: "maxLeagueMembers", included: true, value: "200" },
      { key: "streakShield", name: "streakShield", included: true, value: "5" },
      { key: "predictionBoost", name: "predictionBoost", included: true, value: "3" },
      { key: "prioritySupport", name: "prioritySupport", included: true, highlighted: true },
    ],
  },
  1000: {
    entitlements: {
      AI_ANALYSIS_MONTHLY: "unlimited",
      DEEP_PREDICTION: "true",
      CONFIDENCE_BOOST: "true",
      PRO_STATISTICS: "true",
      PRIVATE_LEAGUE_LIMIT: "unlimited",
      PRIVATE_LEAGUE_MEMBER_LIMIT: "500",
      UNLIMITED_STREAK_SHIELD: "true",
      PREDICTION_BOOST_MONTHLY: "5",
      PRIORITY_SUPPORT: "true",
    },
    features: [
      { key: "aiInsightDaily", name: "aiInsightDaily", included: true, value: "unlimited" },
      { key: "deepPrediction", name: "deepPrediction", included: true },
      { key: "confidenceBoost", name: "confidenceBoost", included: true },
      { key: "proStats", name: "proStats", included: true },
      { key: "privateLeagues", name: "privateLeagues", included: true, value: "unlimited" },
      { key: "maxLeagueMembers", name: "maxLeagueMembers", included: true, value: "500" },
      { key: "streakShield", name: "streakShield", included: true, value: "unlimited" },
      { key: "predictionBoost", name: "predictionBoost", included: true, value: "5" },
      { key: "prioritySupport", name: "prioritySupport", included: true },
    ],
  },
};

const ALLOWED_ENTITLEMENT_VALUES = new Map(
  CREDIT_ENTITLEMENT_KEYS.map((key) => [
    key,
    new Set(
      Object.values(PACKAGE_ENTITLEMENTS_BY_PRICE_THB)
        .map((spec) => spec.entitlements[key])
        .filter((value): value is string => typeof value === "string")
    ),
  ])
);

const PACKAGE_ENTITLEMENT_SPECS = Object.values(PACKAGE_ENTITLEMENTS_BY_PRICE_THB);

export function getCreditPackageEntitlementSpec(priceTHB: number) {
  return PACKAGE_ENTITLEMENTS_BY_PRICE_THB[priceTHB];
}

export function sanitizeCurrentUserEntitlements(
  entitlements: Record<string, unknown> | null | undefined
): CurrentUserEntitlements {
  if (!entitlements) return {};

  const sanitized: CurrentUserEntitlements = {};

  for (const key of CREDIT_ENTITLEMENT_KEYS) {
    const value = entitlements[key];
    if (typeof value !== "string") continue;
    if (!ALLOWED_ENTITLEMENT_VALUES.get(key)?.has(value)) continue;
    sanitized[key] = value;
  }

  if (!isAllowedEntitlementSet(sanitized)) return {};

  return sanitized;
}

function isAllowedEntitlementSet(entitlements: CurrentUserEntitlements) {
  const entries = Object.entries(entitlements) as Array<
    [CurrentUserEntitlementKey, string]
  >;

  if (entries.length === 0) return true;

  return PACKAGE_ENTITLEMENT_SPECS.some((spec) =>
    entries.every(([key, value]) => spec.entitlements[key] === value)
  );
}
