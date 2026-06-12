import {
  ApiFootballError,
  getApiFootballTodayFixtures,
} from "@/lib/api-football";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = toPositiveInt(searchParams.get("limit"));

  try {
    const result = await getApiFootballTodayFixtures(
      typeof limit === "number"
        ? {
            limit,
          }
        : {}
    );

    return Response.json(result, {
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch today football fixtures", 500);

    return Response.json(
      {
        fetchedAt: new Date().toISOString(),
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

function toPositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return undefined;
  return Math.min(parsed, 100);
}
