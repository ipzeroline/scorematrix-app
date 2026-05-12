import { MatchStatus } from '@/types/common';
import type { Match } from '@/types/match';

const NOW = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

function hoursFromNow(h: number): string {
  return new Date(NOW + h * HOUR).toISOString();
}
function hoursAgo(h: number): string {
  return new Date(NOW - h * HOUR).toISOString();
}
function daysFromNow(d: number): string {
  return new Date(NOW + d * DAY).toISOString();
}
function daysAgo(d: number): string {
  return new Date(NOW - d * DAY).toISOString();
}

export const matches: Match[] = [
  // ===== 15 LIVE MATCHES (match-001 to match-015) =====
  { id: 'match-001', leagueId: 'league-01', homeTeamId: 'team-01', awayTeamId: 'team-02', homeScore: 2, awayScore: 1, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1.5), minute: 72, venue: 'United Stadium', round: 'Matchday 24', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-002', leagueId: 'league-01', homeTeamId: 'team-03', awayTeamId: 'team-05', homeScore: 0, awayScore: 0, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1), minute: 58, venue: 'North London Arena', round: 'Matchday 24', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-003', leagueId: 'league-02', homeTeamId: 'team-06', awayTeamId: 'team-08', homeScore: 3, awayScore: 1, status: MatchStatus.LIVE, kickoffTime: hoursAgo(2), minute: 81, venue: 'Camp Catalonia', round: 'Matchday 22', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-004', leagueId: 'league-02', homeTeamId: 'team-09', awayTeamId: 'team-10', homeScore: 1, awayScore: 1, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1.5), minute: 65, venue: 'Mestalla Este', round: 'Matchday 22', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-005', leagueId: 'league-03', homeTeamId: 'team-11', awayTeamId: 'team-13', homeScore: 2, awayScore: 0, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1), minute: 45, venue: 'Stadt Arena', round: 'Matchday 20', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-006', leagueId: 'league-03', homeTeamId: 'team-14', awayTeamId: 'team-15', homeScore: 0, awayScore: 1, status: MatchStatus.LIVE, kickoffTime: hoursAgo(0.8), minute: 38, venue: 'Nordrhein Park', round: 'Matchday 20', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-007', leagueId: 'league-04', homeTeamId: 'team-16', awayTeamId: 'team-18', homeScore: 1, awayScore: 2, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1.3), minute: 67, venue: 'San Siro Nord', round: 'Matchday 23', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-008', leagueId: 'league-04', homeTeamId: 'team-19', awayTeamId: 'team-20', homeScore: 2, awayScore: 2, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1.1), minute: 76, venue: 'Stadio Centro', round: 'Matchday 23', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-009', leagueId: 'league-05', homeTeamId: 'team-21', awayTeamId: 'team-23', homeScore: 4, awayScore: 0, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1.7), minute: 85, venue: 'Parc des Princes B', round: 'Matchday 21', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-010', leagueId: 'league-06', homeTeamId: 'team-26', awayTeamId: 'team-28', homeScore: 1, awayScore: 0, status: MatchStatus.LIVE, kickoffTime: hoursAgo(0.5), minute: 22, venue: 'Amsterdam Arena B', round: 'Matchday 19', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-011', leagueId: 'league-08', homeTeamId: 'team-36', awayTeamId: 'team-38', homeScore: 0, awayScore: 2, status: MatchStatus.LIVE, kickoffTime: hoursAgo(0.7), minute: 31, venue: 'Tokyo National Stadium', round: 'Matchday 16', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-012', leagueId: 'league-09', homeTeamId: 'team-41', awayTeamId: 'team-43', homeScore: 1, awayScore: 0, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1.8), minute: 89, venue: 'Seoul World Cup Stadium', round: 'Matchday 18', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-013', leagueId: 'league-12', homeTeamId: 'team-56', awayTeamId: 'team-57', homeScore: 2, awayScore: 1, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1.4), minute: 70, venue: 'Workers Stadium', round: 'Matchday 15', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-014', leagueId: 'league-07', homeTeamId: 'team-31', awayTeamId: 'team-33', homeScore: 1, awayScore: 3, status: MatchStatus.LIVE, kickoffTime: hoursAgo(1), minute: 55, venue: 'Estadio da Luz B', round: 'Matchday 17', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-015', leagueId: 'league-10', homeTeamId: 'team-46', awayTeamId: 'team-49', homeScore: 2, awayScore: 0, status: MatchStatus.LIVE, kickoffTime: hoursAgo(0.3), minute: 8, venue: 'Rajamangala Stadium', round: 'Matchday 14', isFeatured: false, isMatchOfTheDay: false },

  // ===== 50 UPCOMING MATCHES (match-016 to match-065) =====
  // Next 24 hours
  { id: 'match-016', leagueId: 'league-01', homeTeamId: 'team-02', awayTeamId: 'team-04', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(3), minute: null, venue: 'Mersey Stadium', round: 'Matchday 24', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-017', leagueId: 'league-01', homeTeamId: 'team-05', awayTeamId: 'team-01', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(6), minute: null, venue: 'East London Park', round: 'Matchday 24', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-018', leagueId: 'league-02', homeTeamId: 'team-07', awayTeamId: 'team-06', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(4), minute: null, venue: 'Wanda Metropolitano B', round: 'Matchday 22', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-019', leagueId: 'league-02', homeTeamId: 'team-10', awayTeamId: 'team-08', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(8), minute: null, venue: 'San Mames Norte', round: 'Matchday 22', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-020', leagueId: 'league-03', homeTeamId: 'team-12', awayTeamId: 'team-11', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(5), minute: null, venue: 'Signal Iduna Park 09', round: 'Matchday 20', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-021', leagueId: 'league-04', homeTeamId: 'team-17', awayTeamId: 'team-16', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(7), minute: null, venue: 'Stadio Olimpico Sud', round: 'Matchday 23', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-022', leagueId: 'league-05', homeTeamId: 'team-22', awayTeamId: 'team-24', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(9), minute: null, venue: 'Groupama Stadium B', round: 'Matchday 21', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-023', leagueId: 'league-06', homeTeamId: 'team-27', awayTeamId: 'team-29', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(12), minute: null, venue: 'Philips Stadion B', round: 'Matchday 19', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-024', leagueId: 'league-08', homeTeamId: 'team-37', awayTeamId: 'team-40', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: hoursFromNow(10), minute: null, venue: 'Panasonic Stadium', round: 'Matchday 16', isFeatured: true, isMatchOfTheDay: false },

  // Day 2
  { id: 'match-025', leagueId: 'league-01', homeTeamId: 'team-04', awayTeamId: 'team-03', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: daysFromNow(1), minute: null, venue: 'The Hawthorns Park', round: 'Matchday 25', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-026', leagueId: 'league-02', homeTeamId: 'team-06', awayTeamId: 'team-09', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: daysFromNow(1) + '', minute: null, venue: 'Camp Catalonia', round: 'Matchday 23', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-027', leagueId: 'league-03', homeTeamId: 'team-15', awayTeamId: 'team-12', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 1 * DAY + 3 * HOUR).toISOString(), minute: null, venue: 'Deutsche Bank Park 09', round: 'Matchday 21', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-028', leagueId: 'league-04', homeTeamId: 'team-20', awayTeamId: 'team-17', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 1 * DAY + 2 * HOUR).toISOString(), minute: null, venue: 'Giuseppe Meazza B', round: 'Matchday 24', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-029', leagueId: 'league-09', homeTeamId: 'team-42', awayTeamId: 'team-45', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 1 * DAY + 5 * HOUR).toISOString(), minute: null, venue: 'Busan Asiad Stadium', round: 'Matchday 19', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-030', leagueId: 'league-11', homeTeamId: 'team-51', awayTeamId: 'team-53', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 1 * DAY + 8 * HOUR).toISOString(), minute: null, venue: 'My Dinh National Stadium', round: 'Matchday 14', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-031', leagueId: 'league-12', homeTeamId: 'team-58', awayTeamId: 'team-60', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 1 * DAY + 6 * HOUR).toISOString(), minute: null, venue: 'Tianhe Stadium', round: 'Matchday 16', isFeatured: false, isMatchOfTheDay: false },

  // Day 3
  { id: 'match-032', leagueId: 'league-01', homeTeamId: 'team-01', awayTeamId: 'team-05', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 2 * DAY).toISOString(), minute: null, venue: 'United Stadium', round: 'Matchday 25', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-033', leagueId: 'league-02', homeTeamId: 'team-08', awayTeamId: 'team-07', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 2 * DAY + 2 * HOUR).toISOString(), minute: null, venue: 'Ramon Sanchez Pizjuan Sur', round: 'Matchday 23', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-034', leagueId: 'league-03', homeTeamId: 'team-13', awayTeamId: 'team-14', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 2 * DAY + 4 * HOUR).toISOString(), minute: null, venue: 'Red Bull Arena City', round: 'Matchday 21', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-035', leagueId: 'league-07', homeTeamId: 'team-32', awayTeamId: 'team-35', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 2 * DAY + 3 * HOUR).toISOString(), minute: null, venue: 'Estadio do Dragao B', round: 'Matchday 18', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-036', leagueId: 'league-08', homeTeamId: 'team-39', awayTeamId: 'team-36', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 2 * DAY + 7 * HOUR).toISOString(), minute: null, venue: 'Toyota Stadium', round: 'Matchday 17', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-037', leagueId: 'league-10', homeTeamId: 'team-47', awayTeamId: 'team-50', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 2 * DAY + 9 * HOUR).toISOString(), minute: null, venue: 'Chonburi Stadium', round: 'Matchday 15', isFeatured: false, isMatchOfTheDay: false },

  // Day 4
  { id: 'match-038', leagueId: 'league-01', homeTeamId: 'team-03', awayTeamId: 'team-02', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 3 * DAY + 1 * HOUR).toISOString(), minute: null, venue: 'North London Arena', round: 'Matchday 25', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-039', leagueId: 'league-04', homeTeamId: 'team-18', awayTeamId: 'team-19', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 3 * DAY + 3 * HOUR).toISOString(), minute: null, venue: 'Allianz Stadium Torino', round: 'Matchday 24', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-040', leagueId: 'league-05', homeTeamId: 'team-25', awayTeamId: 'team-21', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 3 * DAY).toISOString(), minute: null, venue: 'Roazhon Park B', round: 'Matchday 22', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-041', leagueId: 'league-06', homeTeamId: 'team-30', awayTeamId: 'team-26', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 3 * DAY + 5 * HOUR).toISOString(), minute: null, venue: 'Stadion Galgenwaard', round: 'Matchday 20', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-042', leagueId: 'league-09', homeTeamId: 'team-44', awayTeamId: 'team-41', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 3 * DAY + 2 * HOUR).toISOString(), minute: null, venue: 'Ulsan Munsu Stadium', round: 'Matchday 19', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-043', leagueId: 'league-12', homeTeamId: 'team-59', awayTeamId: 'team-56', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 3 * DAY + 6 * HOUR).toISOString(), minute: null, venue: 'Dalian Sports Center', round: 'Matchday 16', isFeatured: false, isMatchOfTheDay: false },

  // Day 5
  { id: 'match-044', leagueId: 'league-02', homeTeamId: 'team-07', awayTeamId: 'team-10', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 4 * DAY + 1 * HOUR).toISOString(), minute: null, venue: 'Wanda Metropolitano B', round: 'Matchday 23', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-045', leagueId: 'league-03', homeTeamId: 'team-11', awayTeamId: 'team-15', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 4 * DAY + 3 * HOUR).toISOString(), minute: null, venue: 'Stadt Arena', round: 'Matchday 21', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-046', leagueId: 'league-05', homeTeamId: 'team-23', awayTeamId: 'team-22', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 4 * DAY).toISOString(), minute: null, venue: 'Stade Louis II B', round: 'Matchday 22', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-047', leagueId: 'league-08', homeTeamId: 'team-38', awayTeamId: 'team-37', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 4 * DAY + 6 * HOUR).toISOString(), minute: null, venue: 'Nissan Stadium', round: 'Matchday 17', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-048', leagueId: 'league-11', homeTeamId: 'team-52', awayTeamId: 'team-55', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 4 * DAY + 8 * HOUR).toISOString(), minute: null, venue: 'Thong Nhat Stadium', round: 'Matchday 14', isFeatured: false, isMatchOfTheDay: false },

  // Day 6
  { id: 'match-049', leagueId: 'league-01', homeTeamId: 'team-02', awayTeamId: 'team-01', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 5 * DAY).toISOString(), minute: null, venue: 'Mersey Stadium', round: 'Matchday 25', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-050', leagueId: 'league-04', homeTeamId: 'team-16', awayTeamId: 'team-20', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 5 * DAY + 2 * HOUR).toISOString(), minute: null, venue: 'San Siro Nord', round: 'Matchday 24', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-051', leagueId: 'league-06', homeTeamId: 'team-28', awayTeamId: 'team-27', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 5 * DAY + 4 * HOUR).toISOString(), minute: null, venue: 'De Kuip B', round: 'Matchday 20', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-052', leagueId: 'league-07', homeTeamId: 'team-34', awayTeamId: 'team-31', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 5 * DAY + 1 * HOUR).toISOString(), minute: null, venue: 'Estadio Municipal de Braga B', round: 'Matchday 18', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-053', leagueId: 'league-10', homeTeamId: 'team-49', awayTeamId: 'team-48', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 5 * DAY + 7 * HOUR).toISOString(), minute: null, venue: 'Chang Arena', round: 'Matchday 15', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-054', leagueId: 'league-12', homeTeamId: 'team-57', awayTeamId: 'team-58', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 5 * DAY + 5 * HOUR).toISOString(), minute: null, venue: 'Shanghai Stadium', round: 'Matchday 16', isFeatured: false, isMatchOfTheDay: false },

  // Day 7
  { id: 'match-055', leagueId: 'league-02', homeTeamId: 'team-09', awayTeamId: 'team-06', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 6 * DAY + 2 * HOUR).toISOString(), minute: null, venue: 'Mestalla Este', round: 'Matchday 24', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-056', leagueId: 'league-03', homeTeamId: 'team-12', awayTeamId: 'team-14', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 6 * DAY).toISOString(), minute: null, venue: 'Signal Iduna Park 09', round: 'Matchday 22', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-057', leagueId: 'league-04', homeTeamId: 'team-17', awayTeamId: 'team-18', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 6 * DAY + 3 * HOUR).toISOString(), minute: null, venue: 'Stadio Olimpico Sud', round: 'Matchday 24', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-058', leagueId: 'league-05', homeTeamId: 'team-24', awayTeamId: 'team-25', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 6 * DAY + 1 * HOUR).toISOString(), minute: null, venue: 'Stade Pierre-Mauroy B', round: 'Matchday 22', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-059', leagueId: 'league-08', homeTeamId: 'team-40', awayTeamId: 'team-39', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 6 * DAY + 5 * HOUR).toISOString(), minute: null, venue: 'Noevir Stadium', round: 'Matchday 17', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-060', leagueId: 'league-09', homeTeamId: 'team-43', awayTeamId: 'team-44', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 6 * DAY + 2 * HOUR).toISOString(), minute: null, venue: 'Jeonju World Cup Stadium', round: 'Matchday 19', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-061', leagueId: 'league-11', homeTeamId: 'team-54', awayTeamId: 'team-51', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 6 * DAY + 6 * HOUR).toISOString(), minute: null, venue: 'Lach Tray Stadium', round: 'Matchday 15', isFeatured: false, isMatchOfTheDay: false },

  // Day 7 late
  { id: 'match-062', leagueId: 'league-01', homeTeamId: 'team-04', awayTeamId: 'team-01', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 7 * DAY).toISOString(), minute: null, venue: 'The Hawthorns Park', round: 'Matchday 26', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-063', leagueId: 'league-07', homeTeamId: 'team-33', awayTeamId: 'team-32', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 7 * DAY + 3 * HOUR).toISOString(), minute: null, venue: 'Estadio Jose Alvalade B', round: 'Matchday 18', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-064', leagueId: 'league-10', homeTeamId: 'team-46', awayTeamId: 'team-47', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 7 * DAY + 2 * HOUR).toISOString(), minute: null, venue: 'Rajamangala Stadium', round: 'Matchday 15', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-065', leagueId: 'league-12', homeTeamId: 'team-60', awayTeamId: 'team-59', homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, kickoffTime: new Date(NOW + 7 * DAY + 4 * HOUR).toISOString(), minute: null, venue: 'Shenzhen Universiade Center', round: 'Matchday 17', isFeatured: false, isMatchOfTheDay: false },

  // ===== 40 FINISHED MATCHES (match-066 to match-105) =====
  // 14 days ago
  { id: 'match-066', leagueId: 'league-01', homeTeamId: 'team-01', awayTeamId: 'team-03', homeScore: 3, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(14), minute: 90, venue: 'United Stadium', round: 'Matchday 23', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-067', leagueId: 'league-01', homeTeamId: 'team-05', awayTeamId: 'team-04', homeScore: 0, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(14), minute: 90, venue: 'East London Park', round: 'Matchday 23', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-068', leagueId: 'league-02', homeTeamId: 'team-06', awayTeamId: 'team-07', homeScore: 2, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(14), minute: 90, venue: 'Camp Catalonia', round: 'Matchday 21', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-069', leagueId: 'league-03', homeTeamId: 'team-11', awayTeamId: 'team-12', homeScore: 4, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(13), minute: 90, venue: 'Stadt Arena', round: 'Matchday 19', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-070', leagueId: 'league-04', homeTeamId: 'team-16', awayTeamId: 'team-17', homeScore: 1, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(13), minute: 90, venue: 'San Siro Nord', round: 'Matchday 22', isFeatured: true, isMatchOfTheDay: false },

  // 12-13 days ago
  { id: 'match-071', leagueId: 'league-02', homeTeamId: 'team-08', awayTeamId: 'team-10', homeScore: 2, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(12), minute: 90, venue: 'Ramon Sanchez Pizjuan Sur', round: 'Matchday 21', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-072', leagueId: 'league-03', homeTeamId: 'team-14', awayTeamId: 'team-13', homeScore: 1, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(12), minute: 90, venue: 'Nordrhein Park', round: 'Matchday 19', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-073', leagueId: 'league-05', homeTeamId: 'team-21', awayTeamId: 'team-24', homeScore: 5, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(12), minute: 90, venue: 'Parc des Princes B', round: 'Matchday 20', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-074', leagueId: 'league-06', homeTeamId: 'team-26', awayTeamId: 'team-27', homeScore: 3, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(11), minute: 90, venue: 'Amsterdam Arena B', round: 'Matchday 18', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-075', leagueId: 'league-08', homeTeamId: 'team-36', awayTeamId: 'team-39', homeScore: 1, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(11), minute: 90, venue: 'Tokyo National Stadium', round: 'Matchday 15', isFeatured: false, isMatchOfTheDay: false },

  // 10-11 days ago
  { id: 'match-076', leagueId: 'league-04', homeTeamId: 'team-19', awayTeamId: 'team-16', homeScore: 0, awayScore: 3, status: MatchStatus.FINISHED, kickoffTime: daysAgo(10), minute: 90, venue: 'Stadio Centro', round: 'Matchday 22', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-077', leagueId: 'league-05', homeTeamId: 'team-22', awayTeamId: 'team-23', homeScore: 2, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(10), minute: 90, venue: 'Groupama Stadium B', round: 'Matchday 20', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-078', leagueId: 'league-09', homeTeamId: 'team-41', awayTeamId: 'team-42', homeScore: 2, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(10), minute: 90, venue: 'Seoul World Cup Stadium', round: 'Matchday 17', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-079', leagueId: 'league-07', homeTeamId: 'team-31', awayTeamId: 'team-34', homeScore: 4, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(9), minute: 90, venue: 'Estadio da Luz B', round: 'Matchday 16', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-080', leagueId: 'league-10', homeTeamId: 'team-48', awayTeamId: 'team-46', homeScore: 1, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(9), minute: 90, venue: 'Thunderdome Stadium', round: 'Matchday 13', isFeatured: false, isMatchOfTheDay: false },

  // 8-9 days ago
  { id: 'match-081', leagueId: 'league-01', homeTeamId: 'team-04', awayTeamId: 'team-05', homeScore: 1, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(8), minute: 90, venue: 'The Hawthorns Park', round: 'Matchday 23', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-082', leagueId: 'league-02', homeTeamId: 'team-10', awayTeamId: 'team-06', homeScore: 0, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(8), minute: 90, venue: 'San Mames Norte', round: 'Matchday 21', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-083', leagueId: 'league-03', homeTeamId: 'team-15', awayTeamId: 'team-11', homeScore: 1, awayScore: 3, status: MatchStatus.FINISHED, kickoffTime: daysAgo(8), minute: 90, venue: 'Deutsche Bank Park 09', round: 'Matchday 19', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-084', leagueId: 'league-06', homeTeamId: 'team-29', awayTeamId: 'team-30', homeScore: 2, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(7), minute: 90, venue: 'AFAS Stadion B', round: 'Matchday 18', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-085', leagueId: 'league-12', homeTeamId: 'team-56', awayTeamId: 'team-58', homeScore: 2, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(7), minute: 90, venue: 'Workers Stadium', round: 'Matchday 14', isFeatured: true, isMatchOfTheDay: false },

  // 6-7 days ago
  { id: 'match-086', leagueId: 'league-04', homeTeamId: 'team-18', awayTeamId: 'team-20', homeScore: 1, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(6), minute: 90, venue: 'Allianz Stadium Torino', round: 'Matchday 22', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-087', leagueId: 'league-05', homeTeamId: 'team-25', awayTeamId: 'team-21', homeScore: 0, awayScore: 3, status: MatchStatus.FINISHED, kickoffTime: daysAgo(6), minute: 90, venue: 'Roazhon Park B', round: 'Matchday 20', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-088', leagueId: 'league-08', homeTeamId: 'team-37', awayTeamId: 'team-38', homeScore: 2, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(6), minute: 90, venue: 'Panasonic Stadium', round: 'Matchday 15', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-089', leagueId: 'league-09', homeTeamId: 'team-45', awayTeamId: 'team-41', homeScore: 0, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(5), minute: 90, venue: 'Pohang Steel Yard', round: 'Matchday 17', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-090', leagueId: 'league-11', homeTeamId: 'team-53', awayTeamId: 'team-52', homeScore: 3, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(5), minute: 90, venue: 'Hoa Xuan Stadium', round: 'Matchday 13', isFeatured: false, isMatchOfTheDay: false },

  // 4-5 days ago
  { id: 'match-091', leagueId: 'league-01', homeTeamId: 'team-02', awayTeamId: 'team-03', homeScore: 2, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(5), minute: 90, venue: 'Mersey Stadium', round: 'Matchday 23', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-092', leagueId: 'league-02', homeTeamId: 'team-07', awayTeamId: 'team-09', homeScore: 3, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(4), minute: 90, venue: 'Wanda Metropolitano B', round: 'Matchday 21', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-093', leagueId: 'league-07', homeTeamId: 'team-32', awayTeamId: 'team-33', homeScore: 1, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(4), minute: 90, venue: 'Estadio do Dragao B', round: 'Matchday 16', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-094', leagueId: 'league-10', homeTeamId: 'team-50', awayTeamId: 'team-49', homeScore: 2, awayScore: 3, status: MatchStatus.FINISHED, kickoffTime: daysAgo(4), minute: 90, venue: 'PAT Stadium', round: 'Matchday 13', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-095', leagueId: 'league-12', homeTeamId: 'team-57', awayTeamId: 'team-60', homeScore: 1, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(3), minute: 90, venue: 'Shanghai Stadium', round: 'Matchday 14', isFeatured: true, isMatchOfTheDay: false },

  // 2-3 days ago
  { id: 'match-096', leagueId: 'league-03', homeTeamId: 'team-13', awayTeamId: 'team-12', homeScore: 2, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(3), minute: 90, venue: 'Red Bull Arena City', round: 'Matchday 19', isFeatured: true, isMatchOfTheDay: true },
  { id: 'match-097', leagueId: 'league-04', homeTeamId: 'team-17', awayTeamId: 'team-19', homeScore: 4, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(3), minute: 90, venue: 'Stadio Olimpico Sud', round: 'Matchday 22', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-098', leagueId: 'league-06', homeTeamId: 'team-28', awayTeamId: 'team-26', homeScore: 0, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(2), minute: 90, venue: 'De Kuip B', round: 'Matchday 18', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-099', leagueId: 'league-08', homeTeamId: 'team-40', awayTeamId: 'team-36', homeScore: 1, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(2), minute: 90, venue: 'Noevir Stadium', round: 'Matchday 15', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-100', leagueId: 'league-09', homeTeamId: 'team-44', awayTeamId: 'team-43', homeScore: 3, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(2), minute: 90, venue: 'Ulsan Munsu Stadium', round: 'Matchday 17', isFeatured: false, isMatchOfTheDay: false },

  // Yesterday
  { id: 'match-101', leagueId: 'league-01', homeTeamId: 'team-03', awayTeamId: 'team-04', homeScore: 0, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(1), minute: 90, venue: 'North London Arena', round: 'Matchday 23', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-102', leagueId: 'league-05', homeTeamId: 'team-24', awayTeamId: 'team-22', homeScore: 1, awayScore: 1, status: MatchStatus.FINISHED, kickoffTime: daysAgo(1), minute: 90, venue: 'Stade Pierre-Mauroy B', round: 'Matchday 20', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-103', leagueId: 'league-07', homeTeamId: 'team-35', awayTeamId: 'team-31', homeScore: 0, awayScore: 4, status: MatchStatus.FINISHED, kickoffTime: daysAgo(1), minute: 90, venue: 'Estadio D. Afonso Henriques B', round: 'Matchday 16', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-104', leagueId: 'league-11', homeTeamId: 'team-51', awayTeamId: 'team-54', homeScore: 2, awayScore: 0, status: MatchStatus.FINISHED, kickoffTime: daysAgo(1), minute: 90, venue: 'My Dinh National Stadium', round: 'Matchday 13', isFeatured: true, isMatchOfTheDay: false },
  { id: 'match-105', leagueId: 'league-12', homeTeamId: 'team-59', awayTeamId: 'team-57', homeScore: 1, awayScore: 2, status: MatchStatus.FINISHED, kickoffTime: daysAgo(1), minute: 90, venue: 'Dalian Sports Center', round: 'Matchday 14', isFeatured: false, isMatchOfTheDay: false },

  // ===== 5 POSTPONED/CANCELLED (match-106 to match-110) =====
  { id: 'match-106', leagueId: 'league-02', homeTeamId: 'team-10', awayTeamId: 'team-07', homeScore: null, awayScore: null, status: MatchStatus.POSTPONED, kickoffTime: hoursFromNow(24), minute: null, venue: 'San Mames Norte', round: 'Matchday 22', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-107', leagueId: 'league-05', homeTeamId: 'team-23', awayTeamId: 'team-25', homeScore: null, awayScore: null, status: MatchStatus.POSTPONED, kickoffTime: daysAgo(2), minute: null, venue: 'Stade Louis II B', round: 'Matchday 20', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-108', leagueId: 'league-06', homeTeamId: 'team-30', awayTeamId: 'team-29', homeScore: null, awayScore: null, status: MatchStatus.CANCELLED, kickoffTime: daysAgo(5), minute: null, venue: 'Stadion Galgenwaard', round: 'Matchday 18', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-109', leagueId: 'league-08', homeTeamId: 'team-38', awayTeamId: 'team-40', homeScore: null, awayScore: null, status: MatchStatus.POSTPONED, kickoffTime: hoursFromNow(48), minute: null, venue: 'Nissan Stadium', round: 'Matchday 16', isFeatured: false, isMatchOfTheDay: false },
  { id: 'match-110', leagueId: 'league-11', homeTeamId: 'team-55', awayTeamId: 'team-52', homeScore: null, awayScore: null, status: MatchStatus.CANCELLED, kickoffTime: daysAgo(3), minute: null, venue: 'Can Tho Stadium', round: 'Matchday 13', isFeatured: false, isMatchOfTheDay: false },
];
