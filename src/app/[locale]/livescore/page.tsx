import { Livescore, type FixturesPayload } from "@/components/livescore/Livescore";
import {
  ApiFootballError,
  getApiFootballLiveFixtures,
  getMockApiFootballFixtures,
} from "@/lib/api-football";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LivescorePage({ params }: Props) {
  const { locale } = await params;
  const initialPayload = await loadInitialFixtures();

  return <Livescore initialPayload={initialPayload} locale={locale} />;
}

async function loadInitialFixtures(): Promise<FixturesPayload> {
  try {
    return await getApiFootballLiveFixtures();
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch football fixtures", 500);
    const fixtures = getMockApiFootballFixtures(50);

    return {
      source: "mock",
      fetchedAt: new Date().toISOString(),
      count: fixtures.length,
      fixtures,
      rateLimit: {
        requestsRemaining: null,
        requestsLimit: null,
      },
      warning: apiError.message,
    };
  }
}
