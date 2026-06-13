import test from "node:test";
import assert from "node:assert/strict";
import {
  isIgnorableFixtureSupplementError,
  normalizeFixtureDetailsPayload,
} from "./api-football-fixture-details.ts";

test("normalizes fixture details returned under data", () => {
  const result = normalizeFixtureDetailsPayload({
    data: {
      provider_id: 1545451,
      fixture: {
        id: 1545451,
        date: "2026-05-25T01:00:00+00:00",
        venue: { name: "Estadio Olimpico Universitario", city: "Mexico City" },
        status: { short: "FT", long: "Match Finished", elapsed: 90 },
      },
      league: {
        id: 262,
        name: "Liga MX",
        country: "Mexico",
        logo: "https://media.api-sports.io/football/leagues/262.png",
        flag: "https://media.api-sports.io/flags/mx.svg",
        season: 2025,
        round: "Clausura - Final",
      },
      teams: {
        home: {
          id: 2286,
          name: "U.N.A.M. - Pumas",
          logo: "https://media.api-sports.io/football/teams/2286.png",
          winner: false,
        },
        away: {
          id: 2295,
          name: "Cruz Azul",
          logo: "https://media.api-sports.io/football/teams/2295.png",
          winner: true,
        },
      },
      goals: { home: 1, away: 2 },
      events: [{ type: "Goal" }],
      lineups: [{ formation: "4-4-2" }],
      statistics: [{ team: { id: 2286 } }],
      players: [{ team: { id: 2286 }, players: [] }],
    },
    fetchedAt: "2026-05-25T15:21:33+07:00",
  });

  assert.ok(result.fixture);
  const fixture = result.fixture as {
    apiFixtureId: number | null;
    league: { name: string };
    home: { name: string };
    away: { name: string };
    status: string;
    score: { home: number | null };
    venue: string;
  };

  assert.equal(fixture.apiFixtureId, 1545451);
  assert.equal(fixture.league.name, "Liga MX");
  assert.equal(fixture.home.name, "U.N.A.M. - Pumas");
  assert.equal(fixture.away.name, "Cruz Azul");
  assert.equal(fixture.status, "finished");
  assert.equal(fixture.score.home, 1);
  assert.equal(fixture.venue, "Estadio Olimpico Universitario, Mexico City");
  assert.equal(result.events.length, 1);
  assert.equal(result.lineups.length, 1);
  assert.deepEqual(
    (result.lineups[0] as { startXI: unknown[]; substitutes: unknown[] }).startXI,
    []
  );
  assert.deepEqual(
    (result.lineups[0] as { startXI: unknown[]; substitutes: unknown[] }).substitutes,
    []
  );
  assert.equal(result.statistics.length, 1);
  assert.equal(result.playerStats.length, 1);
});

test("normalizes snake-case and incomplete lineup payloads", () => {
  const result = normalizeFixtureDetailsPayload({
    fixture: { id: "fixture-1" },
    lineups: [
      {
        team: { id: "42", name: "Example FC" },
        start_xi: [{ player: { id: "7", name: "Player Seven", number: "10" } }],
      },
    ],
  });

  const lineup = result.lineups[0] as {
    team: { id: number; name: string; logo: string | null };
    coach: { id: number | null; name: string | null; photo: string | null };
    startXI: { player: { id: number | null; name: string; number: number | null } }[];
    substitutes: unknown[];
  };

  assert.equal(lineup.team.id, 42);
  assert.equal(lineup.team.logo, null);
  assert.equal(lineup.coach.name, null);
  assert.equal(lineup.startXI[0].player.id, 7);
  assert.equal(lineup.startXI[0].player.number, 10);
  assert.deepEqual(lineup.substitutes, []);
});

test("adapts raw fixture detail response to match detail UI fields", () => {
  const result = normalizeFixtureDetailsPayload({
    data: {
      provider_id: 1545451,
      fixture: {
        id: 1545451,
        date: "2026-05-25T01:00:00+00:00",
        venue: { name: null, city: "Mexico City" },
        status: { short: "FT", long: "Match Finished", elapsed: 90 },
      },
      league: { id: 262, name: "Liga MX", country: "Mexico", season: 2025 },
      teams: {
        home: { id: 2286, name: "U.N.A.M. - Pumas" },
        away: { id: 2295, name: "Cruz Azul" },
      },
      score: {
        fulltime: { home: 1, away: 2 },
      },
      events: [
        {
          time: { elapsed: 36, extra: null },
          team: { id: 2295, name: "Cruz Azul" },
          player: { id: 6441, name: "J. Paradela" },
          assist: { id: 51616, name: "G. Fernandez" },
          type: "subst",
          detail: "Substitution 1",
          comments: null,
        },
      ],
      lineups: [
        {
          team: { id: 2286, name: "U.N.A.M. - Pumas" },
          formation: "4-4-2",
          startXI: [],
          substitutes: [],
          coach: { id: 25660, name: "Efrain Juarez" },
        },
      ],
      statistics: [
        {
          team: { id: 2286, name: "U.N.A.M. - Pumas" },
          statistics: [{ type: "Ball Possession", value: "47%" }],
        },
      ],
      players: [
        {
          team: { id: 2286, name: "U.N.A.M. - Pumas" },
          players: [
            {
              player: { id: 731, name: "Keylor Navas" },
              statistics: [
                {
                  games: { minutes: 90, position: "G", rating: "6.6", captain: true },
                  goals: { total: null, assists: 0 },
                  shots: { total: null, on: null },
                  passes: { accuracy: "27" },
                  cards: { yellow: 0, red: 0 },
                },
              ],
            },
          ],
        },
      ],
    },
  });

  assert.ok(result.fixture);
  const fixture = result.fixture as {
    score: { home: number | null; away: number | null };
    venue: string;
  };
  const event = result.events[0] as { type: string };
  const playerTeam = result.playerStats[0] as {
    players: { player: { name: string }; statistics: { games: { captain: boolean } }[] }[];
  };

  assert.deepEqual(fixture.score, { home: null, away: null });
  assert.deepEqual(result.scoreBreakdown.fulltime, { home: 1, away: 2 });
  assert.equal(fixture.venue, "Mexico City");
  assert.equal(event.type, "Substitution");
  assert.equal(result.lineups.length, 1);
  assert.equal(result.statistics.length, 1);
  assert.equal(playerTeam.players[0].player.name, "Keylor Navas");
  assert.equal(playerTeam.players[0].statistics[0].games.captain, true);
});

test("keeps current goals separate from score periods", () => {
  const result = normalizeFixtureDetailsPayload({
    data: {
      provider_id: 1545451,
      fixture: {
        id: 1545451,
        status: { short: "HT", long: "Halftime", elapsed: 45 },
      },
      teams: {
        home: { id: 2286, name: "Home" },
        away: { id: 2295, name: "Away" },
      },
      goals: { home: 2, away: 1 },
      score: {
        halftime: { home: 2, away: 1 },
        fulltime: { home: null, away: null },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      },
    },
  });

  assert.deepEqual((result.fixture as { score: unknown }).score, { home: 2, away: 1 });
  assert.deepEqual(result.scoreBreakdown, {
    halftime: { home: 2, away: 1 },
    fulltime: { home: null, away: null },
    extratime: { home: null, away: null },
    penalty: { home: null, away: null },
  });
});

test("does not fallback current goals from fulltime score", () => {
  const result = normalizeFixtureDetailsPayload({
    data: {
      provider_id: 1545451,
      fixture: { id: 1545451, status: { short: "FT" } },
      teams: {
        home: { id: 2286, name: "Home" },
        away: { id: 2295, name: "Away" },
      },
      score: {
        fulltime: { home: 2, away: 1 },
      },
    },
  });

  assert.deepEqual((result.fixture as { score: unknown }).score, {
    home: null,
    away: null,
  });
  assert.deepEqual(result.scoreBreakdown.fulltime, { home: 2, away: 1 });
});

test("treats 404 supplement failures as empty optional data", () => {
  assert.equal(isIgnorableFixtureSupplementError({ status: 404 }), true);
  assert.equal(isIgnorableFixtureSupplementError({ status: 500 }), false);
  assert.equal(isIgnorableFixtureSupplementError(new Error("network")), false);
});
