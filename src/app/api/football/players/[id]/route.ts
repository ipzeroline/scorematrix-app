import {
  ApiFootballError,
  getApiFootballPlayerProfile,
} from "@/lib/api-football";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playerId = Number.parseInt(id, 10);

  if (!Number.isInteger(playerId) || playerId < 1) {
    return Response.json({ error: "Invalid player ID" }, { status: 400 });
  }

  try {
    return Response.json(await getApiFootballPlayerProfile(playerId), {
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch player profile", 500);

    return Response.json(
      { error: apiError.message, details: apiError.details },
      { status: apiError.status }
    );
  }
}
