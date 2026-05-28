import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PredictErrorShell } from "@/components/predict/PredictErrorShell";
import { PredictMatchForm } from "@/components/predict/PredictMatchForm";
import { ApiFootballError } from "@/lib/api-football";
import { loadPredictMatchRouteContext } from "@/lib/predict-match-data";
import { buildPredictMatchHref, normalizePredictMatchSegment } from "@/lib/predict-route";

type Props = {
  params: Promise<{
    locale: string;
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
  }>;
};

export default async function PredictMatchCanonicalPage({ params }: Props) {
  const { locale, matchId, homeTeamId, awayTeamId } = await params;
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

  if (!context) {
    return (
      <PredictErrorShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
        <h1 className="text-lg font-bold text-white">
          {t("matchDetail.unavailableTitle")}
        </h1>
        <p className="mt-2 text-sm text-amber-300">{loadErrorMessage}</p>
      </PredictErrorShell>
    );
  }

  const canonicalHref = buildPredictMatchHref(
    locale,
    context.matchSegment,
    context.homeTeamId,
    context.awayTeamId
  );
  const currentHref = `/${locale}/predict/${matchId}/${homeTeamId}/${awayTeamId}`;

  if (
    currentHref !== canonicalHref ||
    matchId !== normalizePredictMatchSegment(matchId)
  ) {
    redirect(canonicalHref);
  }

  return <PredictMatchForm locale={locale} match={context.match} />;
}
