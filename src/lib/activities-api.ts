import { apiGetRaw } from "@/lib/api-client";

/** All activity types exposed by the ScoreMatrix activity feeds. */
export const ACTIVITY_TYPES = [
  "prediction_placed",
  "prediction_won",
  "prediction_lost",
  "points_earned",
  "xp_gained",
  "checkin",
  "points_spent",
  "boost_used",
  "boost_received",
  "shield_used",
  "shield_received",
  "mission_claimed",
  "reward_redeemed",
  "referral_earned",
  "level_up",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ActivityCategory = "all" | "predictions" | "points" | "items";

/** Maps each category tab to the set of activity types it includes. */
export const CATEGORY_TYPES: Record<
  Exclude<ActivityCategory, "all">,
  ActivityType[]
> = {
  predictions: ["prediction_placed", "prediction_won", "prediction_lost"],
  points: [
    "points_earned",
    "points_spent",
    "xp_gained",
    "level_up",
    "checkin",
    "referral_earned",
    "mission_claimed",
  ],
  items: [
    "boost_used",
    "boost_received",
    "shield_used",
    "shield_received",
    "reward_redeemed",
  ],
};

export const CATEGORY_ORDER: ActivityCategory[] = [
  "all",
  "predictions",
  "points",
  "items",
];

export function isKnownActivityType(type: string): type is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(type);
}

/** Normalized activity item used by the UI, decoupled from backend shape. */
export type ActivityItem = {
  id: string;
  type: string;
  /** Signed point/XP change (negative = spent). null when nothing changed. */
  amount: number | null;
  /** Human context derived from metadata, e.g. "Argentina vs Iceland 3-0". */
  context: string | null;
  createdAt: string | null;
};

export type ActivityFeedResult = {
  items: ActivityItem[];
  hasMore: boolean;
};

type FetchActivityFeedOptions = {
  /** When set, narrows to a single type via the owning endpoint. */
  type?: ActivityType | null;
  page: number;
  limit: number;
  locale: string;
};

/**
 * Loads one page of activity, newest-first. A `type` narrows to a single type
 * via its owning endpoint; otherwise the unified /activities feed is used.
 */
export async function fetchActivityFeed({
  type,
  page,
  limit,
  locale,
}: FetchActivityFeedOptions): Promise<ActivityFeedResult> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await apiGetRaw<unknown>(
    `/points/transactions?${params.toString()}`,
    { locale }
  );
  const normalizedItems = normalizeActivities(response).sort(byCreatedAtDesc);

  return {
    items: type
      ? normalizedItems.filter((item) => item.type === type)
      : normalizedItems,
    hasMore: hasMorePages(response, page),
  };
}

function byCreatedAtDesc(a: ActivityItem, b: ActivityItem): number {
  const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
  const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
  return tb - ta;
}

/**
 * Maps the backend activity/transaction shape to {@link ActivityItem}.
 * Real shape: { id, type, pointsChange, itemType, itemQtyChange, metadata,
 * createdAt }. Read defensively so older/variant payloads still parse.
 */
export function normalizeActivities(payload: unknown): ActivityItem[] {
  return extractList(payload).flatMap((raw, index) => {
    if (!isRecord(raw)) return [];
    const type =
      pickString(raw.type, raw.activity_type, raw.event) ??
      deriveActivityType(raw);
    if (!type) return [];

    return [
      {
        id: pickString(raw.id, raw._id, raw.uuid) ?? `${type}-${index}`,
        type,
        amount: pickAmount(raw),
        context: pickContext(raw),
        createdAt: pickString(
          raw.createdAt,
          raw.created_at,
          raw.transactionDate,
          raw.transaction_date,
          raw.date
        ),
      },
    ];
  });
}

/** Prefer the point change; fall back to item quantity for boost/shield items. */
function pickAmount(raw: Record<string, unknown>): number | null {
  const points = pickNumber(
    raw.pointsChange,
    raw.points_change,
    raw.amount,
    raw.points,
    raw.value,
    raw.freePointsChange,
    raw.free_points_change,
    raw.premiumCreditsChange,
    raw.premium_credits_change,
    raw.creditChange,
    raw.credit_change
  );
  if (points !== null && points !== 0) return points;
  const qty = pickNumber(raw.itemQtyChange, raw.item_qty_change);
  if (qty !== null && qty !== 0) return qty;
  return points; // 0 or null — UI hides zero amounts
}

/** Build a short context string from metadata (match name, score, etc.). */
function pickContext(raw: Record<string, unknown>): string | null {
  const metadata = isRecord(raw.metadata)
    ? raw.metadata
    : isRecord(raw.meta)
      ? raw.meta
      : undefined;
  if (!metadata) {
    return pickString(raw.description, raw.reason, raw.message, raw.source);
  }

  const match = pickString(metadata.match, metadata.title, metadata.name);
  if (match) {
    const score = pickString(metadata.score);
    return score ? `${match} · ${score}` : match;
  }
  return pickString(
    metadata.description,
    metadata.reason,
    metadata.message,
    metadata.league_name,
    raw.description,
    raw.reason,
    raw.message,
    raw.source
  );
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.transactions)) return payload.transactions;
  if (Array.isArray(payload.history)) return payload.history;
  if (Array.isArray(payload.activities)) return payload.activities;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.results)) return payload.results;
  if (isRecord(payload.data) && Array.isArray(payload.data.items)) {
    return payload.data.items;
  }
  if (isRecord(payload.data) && Array.isArray(payload.data.transactions)) {
    return payload.data.transactions;
  }
  if (isRecord(payload.data) && Array.isArray(payload.data.history)) {
    return payload.data.history;
  }
  if (isRecord(payload.data) && Array.isArray(payload.data.activities)) {
    return payload.data.activities;
  }
  if (isRecord(payload.data) && Array.isArray(payload.data.records)) {
    return payload.data.records;
  }
  return [];
}

/** hasMore from the pagination envelope ({ page, totalPages }). */
function hasMorePages(payload: unknown, currentPage: number): boolean {
  if (!isRecord(payload)) return false;
  const data = isRecord(payload.data) ? payload.data : undefined;
  const pagination = isRecord(payload.pagination)
    ? payload.pagination
    : data && isRecord(data.pagination)
      ? data.pagination
    : isRecord(payload.meta)
      ? payload.meta
      : data && isRecord(data.meta)
        ? data.meta
      : undefined;
  if (!pagination) return false;

  const page = pickNumber(pagination.page) ?? currentPage;
  const totalPages = pickNumber(
    pagination.totalPages,
    pagination.total_pages,
    pagination.lastPage,
    pagination.last_page
  );
  if (totalPages !== null) return page < totalPages;
  return false;
}

function deriveActivityType(raw: Record<string, unknown>): ActivityType | null {
  const source = pickString(raw.source, raw.referenceType, raw.reference_type);
  const amount = pickAmount(raw);
  const normalizedSource = source?.toLowerCase();

  if (normalizedSource?.includes("checkin")) return "checkin";
  if (normalizedSource?.includes("mission")) return "mission_claimed";
  if (normalizedSource?.includes("referral")) return "referral_earned";
  if (normalizedSource?.includes("redemption")) return "reward_redeemed";
  if (normalizedSource?.includes("reward")) return "reward_redeemed";
  if (normalizedSource?.includes("prediction")) {
    return amount !== null && amount < 0 ? "prediction_placed" : "prediction_won";
  }
  if (normalizedSource?.includes("purchase")) return "points_earned";
  if (amount !== null && amount < 0) return "points_spent";
  if (amount !== null && amount > 0) return "points_earned";
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}
