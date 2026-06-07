import { PredictApi } from "@/components/predict/PredictApi";
import { loadUpcomingFixtures } from "@/lib/football-page-data";

export const dynamic = "force-dynamic";

export default async function PredictPage() {
  const fixtures = await loadUpcomingFixtures();

  return <PredictApi fixtures={fixtures} currentTime={getCurrentTime()} />;
}

function getCurrentTime() {
  return Date.now();
}
