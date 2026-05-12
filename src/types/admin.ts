export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalPredictions: number;
  totalRedemptions: number;
  pendingRedemptions: number;
  totalPremiumRevenue: number;
  fraudAlerts: number;
  apiSyncStatus: 'connected' | 'degraded' | 'disconnected';
  lastSyncAt: string;
}

export interface AdminLog {
  id: string;
  action: string;
  userId: string;
  username: string;
  detail: string;
  timestamp: string;
}
