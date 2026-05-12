import type { LeaderboardEntry } from '@/types/leaderboard';

function generateEntries(seed: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  for (let i = 1; i <= 50; i++) {
    const userId = `user-${String(((i * seed + 7) % 98) + 1).padStart(3, '0')}`;
    const points = Math.max(500, 5000 - (i - 1) * (70 + (seed % 30)) + Math.floor(Math.random() * 200));
    entries.push({
      rank: i,
      userId,
      username: `player${((i * seed + 7) % 98) + 1}`,
      avatar: i % 3 === 0 ? '/images/avatars/default.svg' : null,
      points,
      accuracy: Math.min(95, 40 + Math.floor((50 - i) * 0.8) + Math.floor(Math.random() * 10)),
      streak: Math.floor(Math.random() * 15),
      level: Math.min(30, Math.max(1, 30 - i + 5)),
    });
  }
  return entries;
}

export const dailyLeaderboard: LeaderboardEntry[] = generateEntries(3);

export const weeklyLeaderboard: LeaderboardEntry[] = generateEntries(7);

export const seasonalLeaderboard: LeaderboardEntry[] = generateEntries(13);
