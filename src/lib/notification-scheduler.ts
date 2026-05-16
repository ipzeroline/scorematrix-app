// Match reminder scheduler
// Determines which matches are within reminder windows (1h before, 30min before)

interface ReminderMatch {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
}

export function getMatchesInReminderWindow(
  matches: ReminderMatch[],
  minutesBefore: 60 | 30
): ReminderMatch[] {
  const now = Date.now();
  return matches.filter((m) => {
    const kickoff = new Date(m.kickoffTime).getTime();
    const diff = kickoff - now;
    // Within the window: less than minutesBefore but more than 2 minutes away
    return diff > 120000 && diff <= minutesBefore * 60000;
  });
}

export function getMatchResultNotifications(
  matches: { matchId: string; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; endedAt: string }[]
) {
  const now = Date.now();
  return matches.filter((m) => {
    const ended = new Date(m.endedAt).getTime();
    const diff = now - ended;
    // Match ended within last 5 minutes
    return diff > 0 && diff <= 300000;
  });
}
