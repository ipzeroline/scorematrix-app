import type { User } from '@/types/user';

const rankIds = ['bronze-3', 'bronze-2', 'bronze-1', 'silver-3', 'silver-2', 'silver-1', 'gold-3', 'gold-2', 'gold-1', 'platinum-3', 'platinum-2', 'platinum-1', 'diamond-3', 'diamond-2', 'diamond-1', 'master'];

function generateUsers(): User[] {
  const users: User[] = [];
  const avatars = [null, '/images/avatars/default.svg'];

  for (let i = 1; i <= 98; i++) {
    const id = `user-${String(i).padStart(3, '0')}`;
    const t = i; // seed for deterministic variation
    const level = Math.min(50, Math.max(1, Math.floor((t % 50) + 1)));
    const totalPredictions = t * 3 + (t % 7) * 10;
    const correctPredictions = Math.floor(totalPredictions * (0.4 + (t % 30) / 100));
    const accuracy = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0;

    users.push({
      id,
      username: `player${i}`,
      email: `player${i}@scormatrix.app`,
      displayName: `Player ${i}`,
      avatar: avatars[i % 2],
      bio: "",
      favoriteTeam: null,
      role: i <= 2 ? 'admin' : 'user',
      stats: {
        freePoints: Math.floor(Math.random() * 50000),
        premiumCredits: Math.floor(Math.random() * 5000),
        xp: level * 2000 + Math.floor(Math.random() * 1000),
        level,
        rank: rankIds[Math.min(rankIds.length - 1, Math.floor((level - 1) / 3))],
        streak: i % 16,
        bestStreak: 5 + (i % 26),
        totalPredictions,
        correctPredictions,
        accuracy,
        missionsCompleted: 10 + (i % 50),
        achievementsUnlocked: 3 + (i % 20),
        joinedLeagueCount: i % 11,
      },
      preferences: {
        locale: (['en', 'th', 'zh', 'ja', 'ko', 'vi'] as const)[i % 6],
        emailNotifications: i % 3 === 0,
        publicProfile: i % 2 === 0,
      },
      createdAt: new Date(Date.now() - (365 - i) * 86400000).toISOString(),
    });
  }

  // Ensure user-001 and user-002 are the admins with high stats
  users[0] = {
    ...users[0],
    username: 'admin_master',
    displayName: 'Admin Master',
    email: 'admin@scormatrix.app',
    role: 'admin',
    stats: {
      ...users[0].stats,
      freePoints: 100000,
      premiumCredits: 10000,
      xp: 150000,
      level: 50,
      rank: 'master',
      streak: 25,
      bestStreak: 50,
      totalPredictions: 2500,
      correctPredictions: 1800,
      accuracy: 72,
      missionsCompleted: 200,
      achievementsUnlocked: 25,
      joinedLeagueCount: 15,
    },
  };
  users[1] = {
    ...users[1],
    username: 'mod_support',
    displayName: 'Mod Support',
    email: 'mod@scormatrix.app',
    role: 'admin',
    stats: {
      ...users[1].stats,
      freePoints: 75000,
      premiumCredits: 5000,
      xp: 120000,
      level: 45,
      rank: 'diamond-1',
      streak: 12,
      bestStreak: 30,
      totalPredictions: 1800,
      correctPredictions: 1350,
      accuracy: 75,
      missionsCompleted: 150,
      achievementsUnlocked: 22,
      joinedLeagueCount: 10,
    },
  };

  return users;
}

export const users = generateUsers();
