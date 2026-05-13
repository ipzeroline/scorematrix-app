import { PredictApi } from "@/components/predict/PredictApi";
import { loadFixturesForDate, sortFixtures } from "@/lib/football-page-data";

export default async function PredictPage() {
  const fixtures = sortFixtures(await loadFixturesForDate(50));

  return <PredictApi fixtures={fixtures} />;
}
