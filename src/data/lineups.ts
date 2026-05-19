import type { Lineup, PlayerLineup } from '@/types/match';

// Player ID ranges per team (first player ID for each team based on generation order in players.ts)
// team-01: 1, team-02: 12, team-03: 23, team-04: 32, team-05: 43, team-06: 54
// team-07: 65, team-08: 76, team-09: 87, team-10: 98, team-11: 109, team-12: 117
// team-13: 124, team-14: 131, team-15: 138, team-16: 145, team-17: 152, team-18: 159
// team-19: 166, team-20: 173, team-21: 180, team-22: 187, team-23: 194, team-24: 201
// team-25: 208, team-26: 214, team-27: 221, team-28: 228, team-29: 235, team-30: 241
// team-31: 247, team-32: 254, team-33: 261, team-34: 268, team-35: 274, team-36: 280
// team-37: 287, team-38: 294, team-39: 301, team-40: 308, team-41: 315, team-42: 322
// team-43: 329, team-44: 336, team-45: 343, team-46: 350, team-47: 357, team-48: 364
// team-49: 371, team-50: 378, team-51: 385, team-52: 392, team-53: 399, team-54: 406
// team-55: 413, team-56: 420, team-57: 427, team-58: 434, team-59: 441, team-60: 448

const teamPlayerStart: Record<string, number> = {
  'team-01': 1, 'team-02': 12, 'team-03': 23, 'team-04': 32, 'team-05': 43,
  'team-06': 54, 'team-07': 65, 'team-08': 76, 'team-09': 87, 'team-10': 98,
  'team-11': 109, 'team-12': 117, 'team-13': 124, 'team-14': 131, 'team-15': 138,
  'team-16': 145, 'team-17': 152, 'team-18': 159, 'team-19': 166, 'team-20': 173,
  'team-21': 180, 'team-22': 187, 'team-23': 194, 'team-24': 201, 'team-25': 208,
  'team-26': 214, 'team-27': 221, 'team-28': 228, 'team-29': 235, 'team-30': 241,
  'team-31': 247, 'team-32': 254, 'team-33': 261, 'team-34': 268, 'team-35': 274,
  'team-36': 280, 'team-37': 287, 'team-38': 294, 'team-39': 301, 'team-40': 308,
  'team-41': 315, 'team-42': 322, 'team-43': 329, 'team-44': 336, 'team-45': 343,
  'team-46': 350, 'team-47': 357, 'team-48': 364, 'team-49': 371, 'team-50': 378,
  'team-51': 385, 'team-52': 392, 'team-53': 399, 'team-54': 406, 'team-55': 413,
  'team-56': 420, 'team-57': 427, 'team-58': 434, 'team-59': 441, 'team-60': 448,
};

function pid(teamId: string, offset: number): string {
  const base = teamPlayerStart[teamId] || 1;
  return `player-${String(base + offset).padStart(3, '0')}`;
}

function p(teamId: string, offset: number, x: number, y: number): PlayerLineup {
  return {
    playerId: pid(teamId, offset),
    name: `Player ${pid(teamId, offset)}`,
    number: offset + 1,
    position: getPosition(offset),
    x,
    y,
  };
}

function getPosition(idx: number): PlayerLineup['position'] {
  if (idx === 0) return 'GK';
  if (idx <= 4 || idx === 5) return 'DEF';
  if (idx <= 7 || idx === 8) return 'MID';
  return 'FWD';
}

// Formation position templates
function formation433(teamId: string): { starting: PlayerLineup[]; subs: PlayerLineup[] } {
  return {
    starting: [
      p(teamId, 0, 50, 90), // GK
      p(teamId, 1, 20, 65), p(teamId, 2, 38, 70), p(teamId, 3, 62, 70), p(teamId, 4, 80, 65), // DEF
      p(teamId, 5, 25, 40), p(teamId, 6, 50, 35), p(teamId, 7, 75, 40), // MID
      p(teamId, 8, 20, 15), p(teamId, 9, 50, 10), p(teamId, 10, 80, 15), // FWD
    ],
    subs: [p(teamId, 11, 50, 50), p(teamId, 12, 50, 50), p(teamId, 13, 50, 50)],
  };
}

function formation442(teamId: string): { starting: PlayerLineup[]; subs: PlayerLineup[] } {
  return {
    starting: [
      p(teamId, 0, 50, 90), // GK
      p(teamId, 1, 20, 65), p(teamId, 2, 38, 70), p(teamId, 3, 62, 70), p(teamId, 4, 80, 65), // DEF
      p(teamId, 5, 20, 40), p(teamId, 6, 40, 40), p(teamId, 7, 60, 40), p(teamId, 8, 80, 40), // MID
      p(teamId, 9, 38, 15), p(teamId, 10, 62, 15), // FWD
    ],
    subs: [p(teamId, 11, 50, 50), p(teamId, 12, 50, 50), p(teamId, 13, 50, 50)],
  };
}

function formation352(teamId: string): { starting: PlayerLineup[]; subs: PlayerLineup[] } {
  return {
    starting: [
      p(teamId, 0, 50, 90), // GK
      p(teamId, 1, 25, 70), p(teamId, 2, 50, 70), p(teamId, 3, 75, 70), // DEF
      p(teamId, 4, 15, 40), p(teamId, 5, 35, 40), p(teamId, 6, 50, 40), p(teamId, 7, 65, 40), p(teamId, 8, 85, 40), // MID
      p(teamId, 9, 38, 15), p(teamId, 10, 62, 15), // FWD
    ],
    subs: [p(teamId, 11, 50, 50), p(teamId, 12, 50, 50)],
  };
}

function formation4231(teamId: string): { starting: PlayerLineup[]; subs: PlayerLineup[] } {
  return {
    starting: [
      p(teamId, 0, 50, 90), // GK
      p(teamId, 1, 20, 65), p(teamId, 2, 38, 70), p(teamId, 3, 62, 70), p(teamId, 4, 80, 65), // DEF
      p(teamId, 5, 38, 45), p(teamId, 6, 62, 45), // DEF MID
      p(teamId, 7, 20, 25), p(teamId, 8, 50, 22), p(teamId, 9, 80, 25), // ATT MID
      p(teamId, 10, 50, 10), // FWD
    ],
    subs: [p(teamId, 11, 50, 50), p(teamId, 12, 50, 50), p(teamId, 13, 50, 50)],
  };
}

type FormationFn = (teamId: string) => { starting: PlayerLineup[]; subs: PlayerLineup[] };
const formations: FormationFn[] = [formation433, formation442, formation352, formation4231];

// Matches data: { matchId, homeTeamId, awayTeamId, homeFormation, awayFormation }
const lineupMatches: { matchId: string; homeTeamId: string; awayTeamId: string; homeIdx: number; awayIdx: number }[] = [
  { matchId: 'match-066', homeTeamId: 'team-01', awayTeamId: 'team-03', homeIdx: 0, awayIdx: 1 },
  { matchId: 'match-067', homeTeamId: 'team-05', awayTeamId: 'team-04', homeIdx: 1, awayIdx: 2 },
  { matchId: 'match-068', homeTeamId: 'team-06', awayTeamId: 'team-07', homeIdx: 0, awayIdx: 3 },
  { matchId: 'match-069', homeTeamId: 'team-11', awayTeamId: 'team-12', homeIdx: 3, awayIdx: 0 },
  { matchId: 'match-070', homeTeamId: 'team-16', awayTeamId: 'team-17', homeIdx: 0, awayIdx: 2 },
  { matchId: 'match-071', homeTeamId: 'team-08', awayTeamId: 'team-10', homeIdx: 1, awayIdx: 3 },
  { matchId: 'match-072', homeTeamId: 'team-14', awayTeamId: 'team-13', homeIdx: 2, awayIdx: 0 },
  { matchId: 'match-073', homeTeamId: 'team-21', awayTeamId: 'team-24', homeIdx: 0, awayIdx: 1 },
  { matchId: 'match-074', homeTeamId: 'team-26', awayTeamId: 'team-27', homeIdx: 3, awayIdx: 2 },
  { matchId: 'match-075', homeTeamId: 'team-36', awayTeamId: 'team-39', homeIdx: 1, awayIdx: 0 },
  { matchId: 'match-076', homeTeamId: 'team-19', awayTeamId: 'team-16', homeIdx: 0, awayIdx: 3 },
  { matchId: 'match-077', homeTeamId: 'team-22', awayTeamId: 'team-23', homeIdx: 2, awayIdx: 1 },
  { matchId: 'match-078', homeTeamId: 'team-41', awayTeamId: 'team-42', homeIdx: 0, awayIdx: 2 },
  { matchId: 'match-079', homeTeamId: 'team-31', awayTeamId: 'team-34', homeIdx: 3, awayIdx: 1 },
  { matchId: 'match-080', homeTeamId: 'team-48', awayTeamId: 'team-46', homeIdx: 1, awayIdx: 0 },
  { matchId: 'match-081', homeTeamId: 'team-04', awayTeamId: 'team-05', homeIdx: 2, awayIdx: 3 },
  { matchId: 'match-082', homeTeamId: 'team-10', awayTeamId: 'team-06', homeIdx: 1, awayIdx: 0 },
  { matchId: 'match-083', homeTeamId: 'team-15', awayTeamId: 'team-11', homeIdx: 3, awayIdx: 2 },
  { matchId: 'match-084', homeTeamId: 'team-29', awayTeamId: 'team-30', homeIdx: 0, awayIdx: 1 },
  { matchId: 'match-085', homeTeamId: 'team-56', awayTeamId: 'team-58', homeIdx: 0, awayIdx: 2 },
  { matchId: 'match-086', homeTeamId: 'team-18', awayTeamId: 'team-20', homeIdx: 1, awayIdx: 3 },
  { matchId: 'match-087', homeTeamId: 'team-25', awayTeamId: 'team-21', homeIdx: 2, awayIdx: 0 },
  { matchId: 'match-088', homeTeamId: 'team-37', awayTeamId: 'team-38', homeIdx: 0, awayIdx: 1 },
  { matchId: 'match-089', homeTeamId: 'team-45', awayTeamId: 'team-41', homeIdx: 3, awayIdx: 0 },
  { matchId: 'match-090', homeTeamId: 'team-53', awayTeamId: 'team-52', homeIdx: 1, awayIdx: 2 },
  { matchId: 'match-091', homeTeamId: 'team-02', awayTeamId: 'team-03', homeIdx: 0, awayIdx: 3 },
  { matchId: 'match-092', homeTeamId: 'team-07', awayTeamId: 'team-09', homeIdx: 2, awayIdx: 1 },
  { matchId: 'match-093', homeTeamId: 'team-32', awayTeamId: 'team-33', homeIdx: 1, awayIdx: 0 },
  { matchId: 'match-094', homeTeamId: 'team-50', awayTeamId: 'team-49', homeIdx: 3, awayIdx: 2 },
  { matchId: 'match-095', homeTeamId: 'team-57', awayTeamId: 'team-60', homeIdx: 0, awayIdx: 1 },
  { matchId: 'match-096', homeTeamId: 'team-13', awayTeamId: 'team-12', homeIdx: 2, awayIdx: 0 },
  { matchId: 'match-097', homeTeamId: 'team-17', awayTeamId: 'team-19', homeIdx: 0, awayIdx: 3 },
  { matchId: 'match-098', homeTeamId: 'team-28', awayTeamId: 'team-26', homeIdx: 1, awayIdx: 0 },
  { matchId: 'match-099', homeTeamId: 'team-40', awayTeamId: 'team-36', homeIdx: 3, awayIdx: 2 },
  { matchId: 'match-100', homeTeamId: 'team-44', awayTeamId: 'team-43', homeIdx: 0, awayIdx: 1 },
  { matchId: 'match-101', homeTeamId: 'team-03', awayTeamId: 'team-04', homeIdx: 2, awayIdx: 3 },
  { matchId: 'match-102', homeTeamId: 'team-24', awayTeamId: 'team-22', homeIdx: 1, awayIdx: 0 },
  { matchId: 'match-103', homeTeamId: 'team-35', awayTeamId: 'team-31', homeIdx: 3, awayIdx: 0 },
  { matchId: 'match-104', homeTeamId: 'team-51', awayTeamId: 'team-54', homeIdx: 0, awayIdx: 2 },
  { matchId: 'match-105', homeTeamId: 'team-59', awayTeamId: 'team-57', homeIdx: 1, awayIdx: 0 },
];

const formationNames = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'];

export const lineups: Lineup[] = lineupMatches.map((m) => {
  const homeF = formations[m.homeIdx](m.homeTeamId);
  const awayF = formations[m.awayIdx](m.awayTeamId);
  return {
    matchId: m.matchId,
    homeFormation: formationNames[m.homeIdx],
    awayFormation: formationNames[m.awayIdx],
    homeStarting: homeF.starting,
    awayStarting: awayF.starting,
    homeSubs: homeF.subs,
    awaySubs: awayF.subs,
  };
});
