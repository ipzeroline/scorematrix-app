import { PredictApi } from "@/components/predict/PredictApi";
import { loadUpcomingFixtures } from "@/lib/football-page-data";

export const dynamic = "force-dynamic";

export default async function PredictPage() {
  const fixtures = await loadUpcomingFixtures(undefined, 0);

  return <PredictApi fixtures={fixtures} />;
}

