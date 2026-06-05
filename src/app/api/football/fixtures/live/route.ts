import {
  ApiFootballError,
  getApiFootballLiveFixtures,
} from "@/lib/api-football";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = toPositiveInt(searchParams.get("limit"), 100);

  try {
    const result = await getApiFootballLiveFixtures({
      limit,
      revalidate: 0,
    });

    return Response.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch live football fixtures", 500);

    return Response.json(
      {
        source: "api-football",
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

function toPositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 100);
}
