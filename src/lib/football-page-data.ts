import {
  ApiFootballError,
  type ApiFootballFixture,
  getApiFootballFixtures,
  getApiFootballLiveFixtures,
  getApiFootballTodayFixtures,
  getApiFootballUpcomingFixtures,
} from "@/lib/api-football";
import { getThailandDateKey } from "@/lib/utils";
import { MatchStatus } from "@/types/common";

export async function loadFixturesForDate(
  limit?: number
): Promise<ApiFootballFixture[]> {
  const date = getThailandDateKey();

  try {
    const result = await getApiFootballFixtures({ date, limit });
    return result.fixtures;
  } catch (error) {
    logUnexpectedApiError(error);
    return [];
  }
}

export async function loadLiveFixtures(): Promise<{
  fixtures: ApiFootballFixture[];
  error: boolean;
}> {
  try {
    const result = await getApiFootballLiveFixtures();
    return {
      fixtures: result.fixtures,
      error: false,
    };
  } catch (error) {
    logUnexpectedApiError(error);
    return {
      fixtures: [],
      error: true,
    };
  }
}

export async function loadTodayFixtures(
  limit?: number
): Promise<ApiFootballFixture[]> {
  try {
    const result = await getApiFootballTodayFixtures({ limit });
    return result.fixtures;
  } catch (error) {
    logUnexpectedApiError(error);
    return [];
  }
}

export async function loadUpcomingFixtures(
  limit?: number
): Promise<ApiFootballFixture[]> {
  try {
    const result = await getApiFootballUpcomingFixtures({ limit });
    return result.fixtures;
  } catch (error) {
    logUnexpectedApiError(error);
    return [];
  }
}

export function pickRandomFixture(fixtures: ApiFootballFixture[]) {
  if (fixtures.length === 0) return undefined;
  return fixtures[Math.floor(Math.random() * fixtures.length)];
}

export function sortFixtures(fixtures: ApiFootballFixture[]) {
  return [...fixtures].sort((a, b) => {
    const statusWeight = {
      [MatchStatus.LIVE]: 0,
      [MatchStatus.UPCOMING]: 1,
      [MatchStatus.FINISHED]: 2,
      [MatchStatus.POSTPONED]: 3,
      [MatchStatus.CANCELLED]: 4,
    };

    return (
      statusWeight[a.status] - statusWeight[b.status] ||
      new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime()
    );
  });
}

function logUnexpectedApiError(error: unknown) {
  if (!(error instanceof ApiFootballError)) {
    console.error(error);
  }
}
