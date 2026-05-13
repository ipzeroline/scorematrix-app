import { Livescore, type FixturesPayload } from "@/components/livescore/Livescore";
import {
  ApiFootballError,
  getApiFootballFixtures,
  getMockApiFootballFixtures,
} from "@/lib/api-football";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LivescorePage({ params }: Props) {
  const { locale } = await params;
  const initialPayload = await loadInitialFixtures();

  return <Livescore initialPayload={initialPayload} locale={locale} />;
}

async function loadInitialFixtures(): Promise<FixturesPayload> {
  const date = new Date().toISOString().slice(0, 10);

  try {
    return await getApiFootballFixtures({ date, limit: 50 });
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch API-Football fixtures", 500);
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
