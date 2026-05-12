import type { MatchEvent } from '@/types/match';

// Player ID ranges per team (approximate, based on players.ts generation order)
// team-01: 001-011, team-02: 012-022, team-03: 023-031, team-04: 032-042, team-05: 043-053
// team-06: 054-064, team-07: 065-075, team-08: 076-086, team-09: 087-097, team-10: 098-108
// team-11: 109-116, team-12: 117-123, team-13: 124-130, team-14: 131-137, team-15: 138-144
// team-16: 145-151, team-17: 152-158, team-18: 159-165, team-19: 166-172, team-20: 173-179
// team-21: 180-186, team-22: 187-193, team-23: 194-200

// Helper to get player name by ID (simplified - using ID as reference)
const P = (id: string) => id; // player name = player ID for consistency

let eventCounter = 0;
function ev(matchId: string, type: MatchEvent['type'], minute: number, playerId: string, team: 'home' | 'away', detail: string | null = null, minuteExtra: number | null = null): MatchEvent {
  eventCounter++;
  return {
    id: `event-${String(eventCounter).padStart(4, '0')}`,
    matchId,
    type,
    minute,
    minuteExtra,
    playerName: `Player ${playerId}`,
    playerId,
    team,
    detail,
  };
}

export const matchEvents: MatchEvent[] = [
  // ===== LIVE MATCH EVENTS (match-001 to match-015) =====
  // match-001: London United vs Mersey City (2-1, 72')
  ev('match-001', 'goal', 12, 'player-006', 'home', 'Left-footed strike from outside the box'),
  ev('match-001', 'goal', 34, 'player-019', 'away', 'Header from corner kick'),
  ev('match-001', 'goal', 56, 'player-010', 'home', 'Penalty converted to bottom right'),
  ev('match-001', 'card_yellow', 41, 'player-014', 'away', 'Tactical foul'),
  ev('match-001', 'substitution', 60, 'player-013', 'away', null),

  // match-002: North London FC vs East London Rovers (0-0, 58')
  ev('match-002', 'card_yellow', 22, 'player-025', 'home', 'Late tackle'),
  ev('match-002', 'card_yellow', 39, 'player-048', 'away', 'Dissent'),
  ev('match-002', 'var', 51, 'player-024', 'home', 'Penalty check - no penalty'),

  // match-003: Real Catalonia vs Sevilla Sur (3-1, 81')
  ev('match-003', 'goal', 8, 'player-061', 'home', 'Solo run and finish'),
  ev('match-003', 'goal', 15, 'player-063', 'home', 'Tap-in from close range'),
  ev('match-003', 'goal', 29, 'player-082', 'away', 'Free kick from 25 yards'),
  ev('match-003', 'goal', 64, 'player-062', 'home', 'Volley from cross'),
  ev('match-003', 'card_red', 71, 'player-079', 'away', 'Serious foul play'),
  ev('match-003', 'card_yellow', 45, 'player-057', 'home', 'Time wasting'),

  // match-004: Valencia Este vs Bilbao Norte (1-1, 65')
  ev('match-004', 'goal', 18, 'player-104', 'away', 'Long-range effort'),
  ev('match-004', 'goal', 52, 'player-093', 'home', 'Penalty scored'),
  ev('match-004', 'card_yellow', 35, 'player-091', 'home', 'Handball'),
  ev('match-004', 'card_yellow', 62, 'player-101', 'away', 'Tripping'),

  // match-005: FC Bayern Stadt vs RB Leipzig City (2-0, 45')
  ev('match-005', 'goal', 23, 'player-115', 'home', 'Powerful header'),
  ev('match-005', 'goal', 37, 'player-116', 'home', 'Counter-attack goal'),
  ev('match-005', 'card_yellow', 14, 'player-126', 'away', 'Reckless challenge'),

  // match-006: Bayer Nordrhein vs Eintracht Frankfurt 09 (0-1, 38')
  ev('match-006', 'goal', 16, 'player-143', 'away', 'Clinical finish'),
  ev('match-006', 'card_yellow', 28, 'player-135', 'home', 'Professional foul'),
  ev('match-006', 'card_yellow', 33, 'player-140', 'away', 'Diving'),

  // match-007: AC Milano Nord vs Juventus Torino (1-2, 67')
  ev('match-007', 'goal', 5, 'player-163', 'away', 'Early strike'),
  ev('match-007', 'goal', 31, 'player-151', 'home', 'Equalizer from set piece'),
  ev('match-007', 'goal', 59, 'player-165', 'away', 'Breakaway goal'),
  ev('match-007', 'card_yellow', 44, 'player-150', 'home', 'Late tackle'),
  ev('match-007', 'card_yellow', 55, 'player-161', 'away', 'Time wasting'),
  ev('match-007', 'substitution', 62, 'player-149', 'home', null),

  // match-008: Napoli Centro vs Inter Milano B (2-2, 76')
  ev('match-008', 'goal', 11, 'player-170', 'home', 'Curler from edge of box'),
  ev('match-008', 'goal', 24, 'player-177', 'away', 'Near post finish'),
  ev('match-008', 'goal', 48, 'player-178', 'away', 'Volley from cross'),
  ev('match-008', 'goal', 70, 'player-172', 'home', 'Late equalizer'),
  ev('match-008', 'card_yellow', 38, 'player-168', 'home', 'Foul'),
  ev('match-008', 'card_yellow', 66, 'player-175', 'away', 'Foul'),
  ev('match-008', 'substitution', 72, 'player-169', 'home', null),

  // match-009: Paris Saint-Germain B vs AS Monaco B (4-0, 85')
  ev('match-009', 'goal', 3, 'player-185', 'home', 'Quick start'),
  ev('match-009', 'goal', 19, 'player-186', 'home', 'One-two combination'),
  ev('match-009', 'own_goal', 44, 'player-196', 'away', 'Deflected off defender'),
  ev('match-009', 'goal', 72, 'player-184', 'home', 'Header'),
  ev('match-009', 'card_yellow', 55, 'player-195', 'away', 'Foul'),
  ev('match-009', 'substitution', 65, 'player-186', 'home', null),

  // match-010: Ajax Amsterdam B vs Feyenoord Rotterdam B (1-0, 22')
  ev('match-010', 'goal', 8, 'player-205', 'home', 'Early breakthrough'),
  ev('match-010', 'card_yellow', 17, 'player-213', 'away', 'Foul'),

  // match-011: Tokyo Samurai vs Yokohama Typhoon (0-2, 31')
  ev('match-011', 'goal', 4, 'player-239', 'away', 'Quick counter'),
  ev('match-011', 'goal', 27, 'player-241', 'away', 'Free kick curler'),
  ev('match-011', 'card_yellow', 14, 'player-231', 'home', 'Tactical foul'),
  ev('match-011', 'card_yellow', 25, 'player-238', 'away', 'Diving'),

  // match-012: FC Seoul United vs Jeonbuk Tigers (1-0, 89')
  ev('match-012', 'goal', 78, 'player-252', 'home', 'Late winner'),
  ev('match-012', 'card_yellow', 35, 'player-253', 'home', 'Foul'),
  ev('match-012', 'card_yellow', 52, 'player-263', 'away', 'Foul'),
  ev('match-012', 'card_yellow', 81, 'player-262', 'away', 'Dissent'),
  ev('match-012', 'card_red', 89, 'player-264', 'away', 'Violent conduct'),
  ev('match-012', 'substitution', 70, 'player-250', 'home', null),

  // match-013: Beijing Dynasty vs Shanghai Dragons (2-1, 70')
  ev('match-013', 'goal', 10, 'player-369', 'home', 'Header'),
  ev('match-013', 'goal', 33, 'player-375', 'away', 'Equalizer'),
  ev('match-013', 'goal', 58, 'player-371', 'home', 'Long shot'),
  ev('match-013', 'card_yellow', 42, 'player-373', 'away', 'Foul'),
  ev('match-013', 'substitution', 62, 'player-372', 'home', null),

  // match-014: SL Benfica B vs Sporting Lisbon B (1-3, 55')
  ev('match-014', 'goal', 7, 'player-199', 'away', 'Early goal'),
  ev('match-014', 'goal', 22, 'player-196', 'home', 'Equalizer from penalty'),
  ev('match-014', 'goal', 38, 'player-200', 'away', 'Clinical finish'),
  ev('match-014', 'goal', 51, 'player-198', 'away', 'Breakaway'),
  ev('match-014', 'card_yellow', 30, 'player-194', 'home', 'Foul'),
  ev('match-014', 'substitution', 46, 'player-193', 'home', null),

  // match-015: Bangkok United vs Buriram United B (2-0, 8')
  ev('match-015', 'goal', 3, 'player-305', 'home', 'Quick opener'),
  ev('match-015', 'card_yellow', 6, 'player-320', 'away', 'Early foul'),

  // ===== FINISHED MATCH EVENTS (match-066 to match-105) =====
  // match-066: London United 3-1 North London FC (Matchday 23)
  ev('match-066', 'goal', 17, 'player-006', 'home', 'Opener'),
  ev('match-066', 'goal', 28, 'player-029', 'away', 'Equalizer'),
  ev('match-066', 'goal', 45, 'player-010', 'home', 'Penalty'),
  ev('match-066', 'goal', 76, 'player-008', 'home', 'Sealer'),
  ev('match-066', 'card_yellow', 38, 'player-003', 'home', 'Foul'),
  ev('match-066', 'card_yellow', 52, 'player-026', 'away', 'Foul'),
  ev('match-066', 'substitution', 70, 'player-008', 'home', null),
  ev('match-066', 'substitution', 80, 'player-011', 'home', null),

  // match-067: East London Rovers 0-2 West Midland Albion
  ev('match-067', 'goal', 23, 'player-040', 'away', 'Set piece'),
  ev('match-067', 'goal', 67, 'player-038', 'away', 'Counter'),
  ev('match-067', 'card_yellow', 41, 'player-046', 'home', 'Foul'),
  ev('match-067', 'card_yellow', 55, 'player-035', 'away', 'Foul'),

  // match-068: Real Catalonia 2-2 Atletico Madrid B
  ev('match-068', 'goal', 9, 'player-061', 'home', 'Early goal'),
  ev('match-068', 'goal', 25, 'player-073', 'away', 'Header'),
  ev('match-068', 'goal', 55, 'player-064', 'home', 'Free kick'),
  ev('match-068', 'goal', 82, 'player-074', 'away', 'Late equalizer'),
  ev('match-068', 'card_yellow', 31, 'player-058', 'home', 'Tactical'),
  ev('match-068', 'card_yellow', 68, 'player-069', 'away', 'Foul'),

  // match-069: FC Bayern Stadt 4-1 Dortmund 09
  ev('match-069', 'goal', 6, 'player-115', 'home', 'Opener'),
  ev('match-069', 'goal', 15, 'player-116', 'home', 'Doubled'),
  ev('match-069', 'goal', 31, 'player-121', 'away', 'Pulled one back'),
  ev('match-069', 'goal', 58, 'player-112', 'home', 'Restored lead'),
  ev('match-069', 'goal', 84, 'player-114', 'home', 'Late fourth'),
  ev('match-069', 'card_yellow', 22, 'player-110', 'home', 'Foul'),
  ev('match-069', 'card_yellow', 44, 'player-120', 'away', 'Foul'),

  // match-070: AC Milano Nord 1-0 AS Roma Sud
  ev('match-070', 'goal', 73, 'player-151', 'home', 'Winner'),
  ev('match-070', 'card_yellow', 28, 'player-148', 'home', 'Tactical'),
  ev('match-070', 'card_yellow', 46, 'player-155', 'away', 'Foul'),
  ev('match-070', 'card_yellow', 67, 'player-156', 'away', 'Foul'),
  ev('match-070', 'substitution', 60, 'player-149', 'home', null),

  // match-071: Sevilla Sur 2-0 Bilbao Norte
  ev('match-071', 'goal', 34, 'player-082', 'home', 'Opener'),
  ev('match-071', 'goal', 67, 'player-083', 'home', 'Sealer'),
  ev('match-071', 'card_yellow', 19, 'player-100', 'away', 'Late tackle'),
  ev('match-071', 'card_yellow', 58, 'player-080', 'home', 'Foul'),
  ev('match-071', 'substitution', 72, 'player-085', 'home', null),

  // match-072: Bayer Nordrhein 1-1 RB Leipzig City
  ev('match-072', 'goal', 12, 'player-127', 'away', 'Opener'),
  ev('match-072', 'goal', 78, 'player-136', 'home', 'Equalizer'),
  ev('match-072', 'card_yellow', 25, 'player-125', 'away', 'Foul'),
  ev('match-072', 'card_yellow', 44, 'player-134', 'home', 'Foul'),
  ev('match-072', 'card_yellow', 63, 'player-128', 'away', 'Time wasting'),
  ev('match-072', 'substitution', 70, 'player-131', 'home', null),

  // match-073: PSG B 5-0 LOSC Lille B
  ev('match-073', 'goal', 4, 'player-185', 'home', 'Early'),
  ev('match-073', 'goal', 12, 'player-186', 'home', 'Double'),
  ev('match-073', 'goal', 28, 'player-184', 'home', 'Hat-trick build'),
  ev('match-073', 'goal', 45, 'player-183', 'home', 'Penalty'),
  ev('match-073', 'goal', 81, 'player-182', 'home', 'Fifth'),
  ev('match-073', 'card_yellow', 50, 'player-207', 'away', 'Foul'),
  ev('match-073', 'substitution', 65, 'player-186', 'home', null),

  // match-074: Ajax Amsterdam B 3-2 PSV Eindhoven B
  ev('match-074', 'goal', 8, 'player-202', 'home', 'Opener'),
  ev('match-074', 'goal', 18, 'player-217', 'away', 'Equalizer'),
  ev('match-074', 'goal', 36, 'player-205', 'home', 'Restore lead'),
  ev('match-074', 'goal', 58, 'player-220', 'away', 'Equalized again'),
  ev('match-074', 'goal', 79, 'player-203', 'home', 'Winner'),
  ev('match-074', 'card_yellow', 22, 'player-210', 'home', 'Foul'),
  ev('match-074', 'card_yellow', 40, 'player-219', 'away', 'Foul'),
  ev('match-074', 'substitution', 74, 'player-204', 'home', null),

  // match-075: Tokyo Samurai 1-0 Nagoya Phoenix
  ev('match-075', 'goal', 42, 'player-235', 'home', 'Match winner'),
  ev('match-075', 'card_yellow', 16, 'player-232', 'home', 'Foul'),
  ev('match-075', 'card_yellow', 33, 'player-244', 'away', 'Foul'),
  ev('match-075', 'card_yellow', 71, 'player-246', 'away', 'Dissent'),

  // match-076: Napoli Centro 0-3 AC Milano Nord
  ev('match-076', 'goal', 19, 'player-150', 'away', 'Opener'),
  ev('match-076', 'goal', 38, 'player-151', 'away', 'Doubled'),
  ev('match-076', 'goal', 64, 'player-149', 'away', 'Third'),
  ev('match-076', 'card_yellow', 27, 'player-168', 'home', 'Foul'),
  ev('match-076', 'card_red', 55, 'player-167', 'home', 'Second yellow'),
  ev('match-076', 'penalty_missed', 42, 'player-169', 'home', 'Saved by keeper'),

  // match-077: Olympique Lyon B 2-1 AS Monaco B
  ev('match-077', 'goal', 22, 'player-198', 'away', 'Opener'),
  ev('match-077', 'goal', 44, 'player-190', 'home', 'Equalizer'),
  ev('match-077', 'goal', 68, 'player-191', 'home', 'Winner'),
  ev('match-077', 'card_yellow', 31, 'player-196', 'away', 'Foul'),
  ev('match-077', 'card_yellow', 52, 'player-189', 'home', 'Foul'),

  // match-078: FC Seoul United 2-0 Busan Warriors
  ev('match-078', 'goal', 15, 'player-254', 'home', 'Opener'),
  ev('match-078', 'goal', 82, 'player-252', 'home', 'Sealer'),
  ev('match-078', 'card_yellow', 33, 'player-260', 'away', 'Foul'),
  ev('match-078', 'card_yellow', 67, 'player-258', 'away', 'Foul'),
  ev('match-078', 'substitution', 75, 'player-253', 'home', null),

  // match-079: SL Benfica B 4-1 SC Braga B
  ev('match-079', 'goal', 5, 'player-194', 'home', 'Quick start'),
  ev('match-079', 'goal', 19, 'player-196', 'home', 'Second'),
  ev('match-079', 'goal', 38, 'player-207', 'away', 'Pulled back'),
  ev('match-079', 'goal', 56, 'player-195', 'home', 'Third'),
  ev('match-079', 'goal', 74, 'player-197', 'home', 'Fourth'),
  ev('match-079', 'card_yellow', 41, 'player-206', 'away', 'Foul'),
  ev('match-079', 'substitution', 68, 'player-196', 'home', null),

  // match-080: Muang Thong Utd 1-1 Bangkok United
  ev('match-080', 'goal', 28, 'player-311', 'home', 'Opener'),
  ev('match-080', 'goal', 63, 'player-305', 'away', 'Equalizer'),
  ev('match-080', 'card_yellow', 44, 'player-314', 'home', 'Foul'),
  ev('match-080', 'card_yellow', 72, 'player-303', 'away', 'Foul'),

  // match-081: West Midland Albion 1-0 East London Rovers
  ev('match-081', 'goal', 55, 'player-038', 'home', 'Decisive goal'),
  ev('match-081', 'card_yellow', 18, 'player-045', 'away', 'Foul'),
  ev('match-081', 'card_yellow', 62, 'player-036', 'home', 'Foul'),
  ev('match-081', 'card_yellow', 78, 'player-049', 'away', 'Foul'),

  // match-082: Bilbao Norte 0-2 Real Catalonia
  ev('match-082', 'goal', 23, 'player-062', 'away', 'Opener'),
  ev('match-082', 'goal', 71, 'player-063', 'away', 'Sealer'),
  ev('match-082', 'card_yellow', 36, 'player-101', 'home', 'Foul'),
  ev('match-082', 'card_red', 58, 'player-100', 'home', 'Denial of goalscoring opportunity'),
  ev('match-082', 'penalty_scored', 71, 'player-063', 'away', 'From penalty spot'),

  // match-083: Eintracht Frankfurt 09 1-3 FC Bayern Stadt
  ev('match-083', 'goal', 14, 'player-115', 'away', 'Opener'),
  ev('match-083', 'goal', 31, 'player-144', 'home', 'Equalizer'),
  ev('match-083', 'goal', 52, 'player-112', 'away', 'Header'),
  ev('match-083', 'goal', 84, 'player-114', 'away', 'Late goal'),
  ev('match-083', 'card_yellow', 26, 'player-141', 'home', 'Foul'),
  ev('match-083', 'card_yellow', 45, 'player-109', 'away', 'Foul'),

  // match-084: AZ Alkmaar B 2-2 FC Utrecht B
  ev('match-084', 'goal', 10, 'player-222', 'home', 'Opener'),
  ev('match-084', 'goal', 33, 'player-228', 'away', 'Equalizer'),
  ev('match-084', 'goal', 49, 'player-227', 'away', 'Ahead'),
  ev('match-084', 'goal', 86, 'player-223', 'home', 'Late equalizer'),
  ev('match-084', 'card_yellow', 57, 'player-225', 'home', 'Foul'),
  ev('match-084', 'card_yellow', 73, 'player-229', 'away', 'Tactical'),

  // match-085: Beijing Dynasty 2-1 Guangzhou Tigers
  ev('match-085', 'goal', 22, 'player-371', 'home', 'Opener'),
  ev('match-085', 'goal', 44, 'player-383', 'away', 'Equalizer'),
  ev('match-085', 'goal', 76, 'player-369', 'home', 'Winner'),
  ev('match-085', 'card_yellow', 34, 'player-380', 'away', 'Foul'),
  ev('match-085', 'substitution', 68, 'player-370', 'home', null),

  // match-086: Juventus Torino 1-1 Inter Milano B
  ev('match-086', 'goal', 39, 'player-163', 'home', 'Opener'),
  ev('match-086', 'goal', 69, 'player-177', 'away', 'Equalizer'),
  ev('match-086', 'card_yellow', 28, 'player-161', 'home', 'Foul'),
  ev('match-086', 'card_yellow', 45, 'player-175', 'away', 'Foul'),
  ev('match-086', 'card_yellow', 77, 'player-173', 'away', 'Tactical'),
  ev('match-086', 'substitution', 65, 'player-160', 'home', null),
  ev('match-086', 'substitution', 80, 'player-165', 'home', null),

  // match-087: Stade Rennais B 0-3 PSG B
  ev('match-087', 'goal', 15, 'player-183', 'away', 'Opener'),
  ev('match-087', 'goal', 47, 'player-185', 'away', 'Second'),
  ev('match-087', 'goal', 73, 'player-186', 'away', 'Third'),
  ev('match-087', 'card_yellow', 26, 'player-206', 'home', 'Foul'),
  ev('match-087', 'card_yellow', 61, 'player-182', 'away', 'Foul'),

  // match-088: Osaka Dragons 2-1 Yokohama Typhoon
  ev('match-088', 'goal', 19, 'player-240', 'away', 'Opener'),
  ev('match-088', 'goal', 36, 'player-237', 'home', 'Equalizer'),
  ev('match-088', 'goal', 82, 'player-234', 'home', 'Late winner'),
  ev('match-088', 'card_yellow', 28, 'player-236', 'home', 'Foul'),
  ev('match-088', 'card_yellow', 52, 'player-242', 'away', 'Foul'),
  ev('match-088', 'substitution', 70, 'player-233', 'home', null),

  // match-089: Pohang Steelers B 0-2 FC Seoul United
  ev('match-089', 'goal', 25, 'player-255', 'away', 'Opener'),
  ev('match-089', 'goal', 65, 'player-254', 'away', 'Sealer'),
  ev('match-089', 'card_yellow', 41, 'player-292', 'home', 'Foul'),
  ev('match-089', 'card_yellow', 59, 'player-250', 'away', 'Foul'),
  ev('match-089', 'substitution', 55, 'player-291', 'home', null),

  // match-090: Da Nang United 3-2 Ho Chi Minh City FC
  ev('match-090', 'goal', 12, 'player-355', 'home', 'Opener'),
  ev('match-090', 'goal', 22, 'player-361', 'away', 'Equalizer'),
  ev('match-090', 'goal', 39, 'player-358', 'home', 'Restore lead'),
  ev('match-090', 'goal', 55, 'player-363', 'away', 'Equalized again'),
  ev('match-090', 'goal', 78, 'player-356', 'home', 'Winner'),
  ev('match-090', 'card_yellow', 33, 'player-359', 'home', 'Foul'),
  ev('match-090', 'card_yellow', 48, 'player-360', 'away', 'Foul'),
  ev('match-090', 'substitution', 65, 'player-358', 'home', null),

  // match-091: Mersey City 2-0 North London FC
  ev('match-091', 'goal', 33, 'player-019', 'home', 'Opener'),
  ev('match-091', 'goal', 74, 'player-020', 'home', 'Sealer'),
  ev('match-091', 'card_yellow', 21, 'player-013', 'home', 'Foul'),
  ev('match-091', 'card_yellow', 45, 'player-027', 'away', 'Foul'),
  ev('match-091', 'substitution', 68, 'player-020', 'home', null),

  // match-092: Atletico Madrid B 3-1 Valencia Este
  ev('match-092', 'goal', 7, 'player-073', 'home', 'Opener'),
  ev('match-092', 'goal', 25, 'player-074', 'home', 'Doubled'),
  ev('match-092', 'goal', 48, 'player-095', 'away', 'Pulled one back'),
  ev('match-092', 'goal', 81, 'player-071', 'home', 'Sealer'),
  ev('match-092', 'card_yellow', 38, 'player-091', 'away', 'Foul'),
  ev('match-092', 'card_yellow', 66, 'player-068', 'home', 'Tactical'),

  // match-093: FC Porto B 1-0 Sporting Lisbon B
  ev('match-093', 'goal', 63, 'player-202', 'home', 'Winner'),
  ev('match-093', 'card_yellow', 17, 'player-200', 'away', 'Foul'),
  ev('match-093', 'card_yellow', 31, 'player-204', 'home', 'Foul'),
  ev('match-093', 'card_yellow', 55, 'player-197', 'away', 'Dissent'),
  ev('match-093', 'card_yellow', 77, 'player-199', 'away', 'Foul'),

  // match-094: Port FC Bangkok 2-3 Buriram United B
  ev('match-094', 'goal', 11, 'player-330', 'home', 'Opener'),
  ev('match-094', 'goal', 18, 'player-321', 'away', 'Equalizer'),
  ev('match-094', 'goal', 35, 'player-328', 'home', 'Restore lead'),
  ev('match-094', 'goal', 52, 'player-322', 'away', 'Equalized'),
  ev('match-094', 'goal', 87, 'player-323', 'away', 'Late winner'),
  ev('match-094', 'card_yellow', 44, 'player-326', 'home', 'Foul'),
  ev('match-094', 'card_yellow', 76, 'player-318', 'away', 'Foul'),

  // match-095: Shanghai Dragons 1-0 Shenzhen Phoenix
  ev('match-095', 'goal', 41, 'player-375', 'home', 'Match winner'),
  ev('match-095', 'card_yellow', 25, 'player-373', 'home', 'Foul'),
  ev('match-095', 'card_yellow', 58, 'player-387', 'away', 'Tactical'),
  ev('match-095', 'card_red', 83, 'player-388', 'away', 'Serious foul play'),

  // match-096: RB Leipzig City 2-2 Dortmund 09
  ev('match-096', 'goal', 15, 'player-121', 'away', 'Opener'),
  ev('match-096', 'goal', 33, 'player-127', 'home', 'Equalizer'),
  ev('match-096', 'goal', 56, 'player-122', 'away', 'Ahead again'),
  ev('match-096', 'goal', 83, 'player-129', 'home', 'Late equalizer'),
  ev('match-096', 'card_yellow', 27, 'player-125', 'home', 'Foul'),
  ev('match-096', 'card_yellow', 41, 'player-118', 'away', 'Foul'),
  ev('match-096', 'substitution', 70, 'player-126', 'home', null),
  ev('match-096', 'substitution', 75, 'player-119', 'away', null),

  // match-097: AS Roma Sud 4-2 Napoli Centro
  ev('match-097', 'goal', 3, 'player-156', 'home', 'Quick start'),
  ev('match-097', 'goal', 14, 'player-157', 'home', 'Doubled'),
  ev('match-097', 'goal', 28, 'player-169', 'away', 'Pulled back'),
  ev('match-097', 'goal', 44, 'player-155', 'home', 'Third'),
  ev('match-097', 'goal', 61, 'player-170', 'away', 'Reduced gap'),
  ev('match-097', 'goal', 76, 'player-158', 'home', 'Fourth'),
  ev('match-097', 'card_yellow', 35, 'player-154', 'home', 'Foul'),
  ev('match-097', 'card_yellow', 49, 'player-167', 'away', 'Foul'),

  // match-098: Feyenoord Rotterdam B 0-1 Ajax Amsterdam B
  ev('match-098', 'goal', 58, 'player-204', 'away', 'Decisive goal'),
  ev('match-098', 'card_yellow', 22, 'player-213', 'home', 'Foul'),
  ev('match-098', 'card_yellow', 37, 'player-202', 'away', 'Tactical'),
  ev('match-098', 'card_yellow', 64, 'player-215', 'home', 'Foul'),
  ev('match-098', 'substitution', 68, 'player-211', 'home', null),

  // match-099: Kobe Strikers 1-2 Tokyo Samurai
  ev('match-099', 'goal', 27, 'player-234', 'away', 'Opener'),
  ev('match-099', 'goal', 44, 'player-254', 'home', 'Equalizer'),
  ev('match-099', 'goal', 71, 'player-235', 'away', 'Winner'),
  ev('match-099', 'card_yellow', 39, 'player-253', 'home', 'Foul'),
  ev('match-099', 'card_yellow', 62, 'player-231', 'away', 'Tactical'),

  // match-100: Ulsan Storm 3-0 Jeonbuk Tigers
  ev('match-100', 'goal', 16, 'player-275', 'home', 'Opener'),
  ev('match-100', 'goal', 42, 'player-277', 'home', 'Second'),
  ev('match-100', 'goal', 79, 'player-276', 'home', 'Third'),
  ev('match-100', 'card_yellow', 24, 'player-267', 'away', 'Foul'),
  ev('match-100', 'card_yellow', 55, 'player-274', 'home', 'Foul'),

  // match-101: North London FC 0-1 West Midland Albion
  ev('match-101', 'goal', 49, 'player-038', 'away', 'Decisive goal'),
  ev('match-101', 'card_yellow', 12, 'player-027', 'home', 'Foul'),
  ev('match-101', 'card_yellow', 64, 'player-037', 'away', 'Tactical'),
  ev('match-101', 'card_yellow', 78, 'player-026', 'home', 'Dissent'),

  // match-102: LOSC Lille B 1-1 Olympique Lyon B
  ev('match-102', 'goal', 21, 'player-191', 'away', 'Opener'),
  ev('match-102', 'goal', 85, 'player-209', 'home', 'Late equalizer'),
  ev('match-102', 'card_yellow', 33, 'player-208', 'home', 'Foul'),
  ev('match-102', 'card_yellow', 54, 'player-190', 'away', 'Foul'),
  ev('match-102', 'substitution', 70, 'player-207', 'home', null),
  ev('match-102', 'substitution', 78, 'player-192', 'away', null),

  // match-103: Vitoria Guimaraes B 0-4 SL Benfica B
  ev('match-103', 'goal', 9, 'player-196', 'away', 'Opener'),
  ev('match-103', 'goal', 27, 'player-194', 'away', 'Second'),
  ev('match-103', 'goal', 55, 'player-197', 'away', 'Third'),
  ev('match-103', 'goal', 73, 'player-195', 'away', 'Fourth'),
  ev('match-103', 'card_yellow', 38, 'player-212', 'home', 'Foul'),
  ev('match-103', 'card_yellow', 44, 'player-192', 'away', 'Tactical'),

  // match-104: Hanoi FC 2-0 Hai Phong FC
  ev('match-104', 'goal', 31, 'player-346', 'home', 'Opener'),
  ev('match-104', 'goal', 68, 'player-348', 'home', 'Sealer'),
  ev('match-104', 'card_yellow', 19, 'player-344', 'home', 'Foul'),
  ev('match-104', 'card_yellow', 53, 'player-357', 'away', 'Foul'),
  ev('match-104', 'substitution', 60, 'player-348', 'home', null),

  // match-105: Dalian Ocean 1-2 Shanghai Dragons
  ev('match-105', 'goal', 10, 'player-376', 'away', 'Opener'),
  ev('match-105', 'goal', 38, 'player-390', 'home', 'Equalizer'),
  ev('match-105', 'goal', 77, 'player-374', 'away', 'Winner'),
  ev('match-105', 'card_yellow', 24, 'player-389', 'home', 'Foul'),
  ev('match-105', 'card_yellow', 49, 'player-378', 'away', 'Foul'),
  ev('match-105', 'card_yellow', 82, 'player-393', 'home', 'Tactical'),
];
