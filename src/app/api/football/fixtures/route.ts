import {
  ApiFootballError,
  getApiFootballFixtureList,
} from "@/lib/api-football";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = toPositiveInt(searchParams.get("limit"), 500);
  const date = toDate(searchParams.get("date"));
  const statusGroup = toStatusGroup(searchParams.get("status_group"));
  const status = toRawStatus(searchParams.get("status"));
  const timezone = toTimezone(searchParams.get("timezone"));

  try {
    const result = await getApiFootballFixtureList({
      date,
      statusGroup,
      status,
      league: searchParams.get("league") ?? undefined,
      timezone,
      limit,
    });

    return Response.json(result, {
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch football fixtures", 500);

    return Response.json(
      {
        fetchedAt: new Date().toISOString(),
        date: date ?? null,
        counts: emptyCounts(),
        query: Object.fromEntries(searchParams.entries()),
        count: 0,
        fixtures: [],
        rateLimit: {
          requestsRemaining: null,
          requestsLimit: null,
        },
        error: apiError.message,
      },
      { status: apiError.status }
    );
  }
}

function toPositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 500);
}

function toDate(value: string | null): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function toStatusGroup(value: string | null) {
  const groups = ["live", "upcoming", "finished", "postponed", "cancelled"] as const;
  return groups.find((group) => group === value);
}

function toRawStatus(value: string | null): string | undefined {
  return value && /^[A-Z0-9-]+$/i.test(value) ? value.toUpperCase() : undefined;
}

function toTimezone(value: string | null): string | undefined {
  return value && /^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+$/.test(value)
    ? value
    : undefined;
}

function emptyCounts() {
  return {
    total: 0,
    live: 0,
    upcoming: 0,
    finished: 0,
    postponed: 0,
    cancelled: 0,
  };
}
