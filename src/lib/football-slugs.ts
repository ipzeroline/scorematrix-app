import type { ApiFootballFixture } from "@/lib/api-football";

type FixtureSlugInput = Pick<ApiFootballFixture, "id" | "apiFixtureId" | "home" | "away">;
type LeagueSlugInput = {
  id?: string | number | null;
  apiLeagueId?: number | null;
  name: string;
};

export function buildFixtureSeoSlug(fixture: FixtureSlugInput) {
  const fixtureId = fixture.apiFixtureId ?? extractApiFixtureId(fixture.id);
  if (!fixtureId) return fixture.id;

  const teams = slugify(`${fixture.home.name} vs ${fixture.away.name}`);
  return `${teams}-${fixtureId}`;
}

export function extractApiFixtureId(value: string) {
  if (/^\d+$/.test(value)) return Number.parseInt(value, 10);

  const legacy = value.match(/^api-football-(\d+)$/);
  if (legacy) return Number.parseInt(legacy[1], 10);

  const seo = value.match(/-(\d{5,})$/);
  if (seo) return Number.parseInt(seo[1], 10);

  return null;
}

export function buildLeagueSeoSlug(league: LeagueSlugInput) {
  const leagueId = league.apiLeagueId ?? extractNumericId(league.id);
  if (!leagueId) return String(league.id ?? slugify(league.name));

  const name = slugify(league.name);
  return name ? `${name}-${leagueId}` : String(leagueId);
}

export function extractFootballEntityId(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value) return null;

  if (/^\d+$/.test(value)) return Number.parseInt(value, 10);

  const seo = value.match(/-(\d+)$/);
  if (seo) return Number.parseInt(seo[1], 10);

  return null;
}

function extractNumericId(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value || !/^\d+$/.test(value)) return null;
  return Number.parseInt(value, 10);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
