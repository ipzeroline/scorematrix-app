import { PredictApiDemo } from "@/components/predict/PredictApiDemo";
import { loadFixturesForDate, sortFixtures } from "@/lib/football-page-data";

export default async function PredictPage() {
  const fixtures = sortFixtures(await loadFixturesForDate(50));

  return <PredictApiDemo fixtures={fixtures} />;
}
