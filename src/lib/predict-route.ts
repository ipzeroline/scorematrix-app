import { extractApiFixtureId } from "@/lib/football-slugs";

export function buildPredictMatchHref(
  locale: string,
  matchSegment: string,
  homeTeamId: string | number | null | undefined,
  awayTeamId: string | number | null | undefined
) {
  const match = normalizeMatchSegment(matchSegment);
  const home = stringifyRouteSegment(homeTeamId);
  const away = stringifyRouteSegment(awayTeamId);

  if (!home || !away) {
    return `/${locale}/predict/${match}`;
  }

  return `/${locale}/predict/${match}/${home}/${away}`;
}

export function normalizePredictMatchSegment(matchSegment: string) {
  return normalizeMatchSegment(matchSegment);
}

function normalizeMatchSegment(matchSegment: string) {
  return String(extractApiFixtureId(matchSegment) ?? matchSegment).trim();
}

function stringifyRouteSegment(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const segment = String(value).trim();
  return segment.length > 0 ? segment : null;
}
