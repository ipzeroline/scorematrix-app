import {
  ApiFootballError,
  type ApiFootballFixture,
  getApiFootballFixtures,
  getApiFootballLiveFixtures,
  getApiFootballUpcomingFixtures,
  getMockApiFootballFixtures,
} from "@/lib/api-football";
import { MatchStatus } from "@/types/common";

export async function loadFixturesForDate(
  limit?: number,
  revalidate = 60
): Promise<ApiFootballFixture[]> {
  const date = new Date().toISOString().slice(0, 10);

  try {
    const result = await getApiFootballFixtures({ date, limit, revalidate });
    return result.fixtures;
  } catch (error) {
    logUnexpectedApiError(error);
    return getMockApiFootballFixtures(limit);
  }
}

export async function loadLiveFixtures(
  limit = 24,
  revalidate = 15
): Promise<ApiFootballFixture[]> {
  try {
    const result = await getApiFootballLiveFixtures({ limit, revalidate });
    return result.fixtures;
  } catch (error) {
    logUnexpectedApiError(error);
    return [];
  }
}

export async function loadUpcomingFixtures(
  limit?: number,
  revalidate = 60
): Promise<ApiFootballFixture[]> {
  try {
    const result = await getApiFootballUpcomingFixtures({ limit, revalidate });
    return result.fixtures;
  } catch (error) {
    logUnexpectedApiError(error);
    return getMockApiFootballFixtures(limit);
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
