import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PredictErrorShell } from "@/components/predict/PredictErrorShell";
import { ApiFootballError } from "@/lib/api-football";
import { loadPredictMatchRouteContext } from "@/lib/predict-match-data";
import { buildPredictMatchHref } from "@/lib/predict-route";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
};

export default async function PredictMatchPage({ params }: Props) {
  const { locale, matchId } = await params;
  const t = await getTranslations({ locale });
  let context: Awaited<ReturnType<typeof loadPredictMatchRouteContext>> = null;
  let loadErrorMessage: string | undefined;

  try {
    context = await loadPredictMatchRouteContext(matchId);
  } catch (error) {
    loadErrorMessage =
      error instanceof ApiFootballError
        ? error.message
        : t("matchDetail.loadError");
  }

  if (context) {
    redirect(
      buildPredictMatchHref(
        locale,
        context.matchSegment,
        context.homeTeamId,
        context.awayTeamId
      )
    );
  }

  return (
    <PredictErrorShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
      <h1 className="text-lg font-bold text-white">
        {t("matchDetail.unavailableTitle")}
      </h1>
      <p className="mt-2 text-sm text-amber-300">{loadErrorMessage}</p>
    </PredictErrorShell>
  );
}
