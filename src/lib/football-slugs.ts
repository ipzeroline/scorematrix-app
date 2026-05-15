import type { ApiFootballFixture } from "@/lib/api-football";

type FixtureSlugInput = Pick<ApiFootballFixture, "id" | "apiFixtureId" | "home" | "away">;

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
