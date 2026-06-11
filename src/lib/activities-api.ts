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

/**
 * Point-ledger types are served by /points/transactions; everything else by
 * /activities. In practice both endpoints return the same unified log, so this
 * only routes a single-type request — the unfiltered feed always uses
 * /activities to avoid duplicate fetches.
 */
const TRANSACTION_TYPES = new Set<ActivityType>([
  "checkin",
  "points_spent",
  "points_earned",
  "referral_earned",
]);

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
  const query = `page=${page}&limit=${limit}`;
  const base =
    type && TRANSACTION_TYPES.has(type) ? "/points/transactions" : "/activities";
  const path = type ? `${base}?type=${type}&${query}` : `/activities?${query}`;

  const response = await apiGetRaw<unknown>(path, { locale });

  return {
    items: normalizeActivities(response).sort(byCreatedAtDesc),
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
    const type = pickString(raw.type, raw.activity_type, raw.event);
    if (!type) return [];

    return [
      {
        id: pickString(raw.id, raw._id, raw.uuid) ?? `${type}-${index}`,
        type,
        amount: pickAmount(raw),
        context: pickContext(raw),
        createdAt: pickString(raw.createdAt, raw.created_at, raw.date),
      },
    ];
  });
}

/** Prefer the point change; fall back to item quantity for boost/shield items. */
function pickAmount(raw: Record<string, unknown>): number | null {
  const points = pickNumber(raw.pointsChange, raw.amount, raw.points, raw.value);
  if (points !== null && points !== 0) return points;
  const qty = pickNumber(raw.itemQtyChange);
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
  if (!metadata) return null;

  const match = pickString(metadata.match, metadata.title, metadata.name);
  if (match) {
    const score = pickString(metadata.score);
    return score ? `${match} · ${score}` : match;
  }
  return pickString(metadata.description, metadata.reason, metadata.message);
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (isRecord(payload.data) && Array.isArray(payload.data.items)) {
    return payload.data.items;
  }
  return [];
}

/** hasMore from the pagination envelope ({ page, totalPages }). */
function hasMorePages(payload: unknown, currentPage: number): boolean {
  if (!isRecord(payload)) return false;
  const pagination = isRecord(payload.pagination)
    ? payload.pagination
    : isRecord(payload.meta)
      ? payload.meta
      : undefined;
  if (!pagination) return false;

  const page = pickNumber(pagination.page) ?? currentPage;
  const totalPages = pickNumber(pagination.totalPages, pagination.total_pages);
  if (totalPages !== null) return page < totalPages;
  return false;
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
