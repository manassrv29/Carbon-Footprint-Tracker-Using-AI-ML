import type { CarbonLog, UserStats } from '../types';

const STORAGE_KEYS = {
  CARBON_LOGS: 'carbon_logs',
  USER_STATS: 'user_stats',
  DAILY_TARGET: 'daily_target',
} as const;

export function saveCarbonLog(log: CarbonLog): void {
  const logs = getCarbonLogs();
  logs.push(log);
  localStorage.setItem(STORAGE_KEYS.CARBON_LOGS, JSON.stringify(logs));
}

export function getCarbonLogs(): CarbonLog[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CARBON_LOGS);
  if (!stored) return [];
  
  try {
    const logs = JSON.parse(stored);
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  } catch {
    return [];
  }
}

export function getLogsForDate(date: Date): CarbonLog[] {
  const logs = getCarbonLogs();
  const targetDate = date.toDateString();
  return logs.filter(log => log.timestamp.toDateString() === targetDate);
}

export function getLogsForDateRange(startDate: Date, endDate: Date): CarbonLog[] {
  const logs = getCarbonLogs();
  return logs.filter(log => 
    log.timestamp >= startDate && log.timestamp <= endDate
  );
}

export function getUserStats(): UserStats {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
  if (!stored) {
    const defaultStats: UserStats = {
      userId: 'user_1',
      level: 1,
      ecoPoints: 0,
      streak: 0,
      weeklyReduction: 0,
      totalCo2Saved: 0,
      badges: []
    };
    saveUserStats(defaultStats);
    return defaultStats;
  }
  
  try {
    const stats = JSON.parse(stored);
    return {
      ...stats,
      badges: stats.badges.map((badge: any) => ({
        ...badge,
        unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined
      }))
    };
  } catch {
    return {
      userId: 'user_1',
      level: 1,
      ecoPoints: 0,
      streak: 0,
      weeklyReduction: 0,
      totalCo2Saved: 0,
      badges: []
    };
  }
}

export function saveUserStats(stats: UserStats): void {
  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
}

export function updateUserStats(updates: Partial<UserStats>): UserStats {
  const currentStats = getUserStats();
  const updatedStats = { ...currentStats, ...updates };
  saveUserStats(updatedStats);
  return updatedStats;
}

export function getDailyTarget(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY_TARGET);
  return stored ? parseFloat(stored) : 10; // Default 10kg CO2 per day
}

export function setDailyTarget(target: number): void {
  localStorage.setItem(STORAGE_KEYS.DAILY_TARGET, target.toString());
}

export function calculateStreak(): number {
  const logs = getCarbonLogs();
  if (logs.length === 0) return 0;
  
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check each day going backwards
  while (true) {
    const logsForDate = getLogsForDate(currentDate);
    if (logsForDate.length === 0) {
      // If today has no logs, don't break streak yet
      if (currentDate.toDateString() === today.toDateString()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
    
    // Don't go back more than 365 days
    if (streak > 365) break;
  }
  
  return streak;
}
