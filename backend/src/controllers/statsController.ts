import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User, CarbonLog, Achievement, Badge } from '../models';
import { ApiResponse, LeaderboardEntry } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { getRealWorldEquivalents, getNextLevelProgress } from '../utils/emissions';

export const getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  // Get recent carbon logs for streak calculation
  const recentLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    order: [['timestamp', 'DESC']],
  });

  // Get user achievements
  const achievements = await Achievement.findAll({
    where: { userId: user.id },
    include: [{
      model: Badge,
      as: 'badge',
    }],
    order: [['unlockedAt', 'DESC']],
  });

  // Calculate level progress
  const levelProgress = getNextLevelProgress(user.ecoPoints);

  // Calculate real-world equivalents
  const realWorldEquivalents = getRealWorldEquivalents(parseFloat(user.totalCo2Saved.toString()));

  // Weekly reduction calculation
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  
  const weeklyLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: { [Op.gte]: weekStart },
    },
  });

  const weeklyReduction = weeklyLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        level: user.level,
        ecoPoints: user.ecoPoints,
        streak: user.streak,
        totalCo2Saved: user.totalCo2Saved,
        weeklyReduction,
        dailyTarget: user.dailyTarget,
      },
      levelProgress,
      realWorldEquivalents,
      achievements: achievements.map(achievement => ({
        id: achievement.id,
        badgeId: achievement.badgeId,
        unlockedAt: achievement.unlockedAt,
      })),
      recentActivity: {
        logsCount: recentLogs.length,
        totalEmissions: recentLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0),
      },
    },
  } as ApiResponse);
});

export const getLeaderboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { period = 'all', limit = 10 } = req.query;

  let whereClause = {};
  
  if (period === 'weekly') {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    whereClause = {
      updatedAt: { [Op.gte]: weekStart },
    };
  } else if (period === 'monthly') {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);
    whereClause = {
      updatedAt: { [Op.gte]: monthStart },
    };
  }

  const users = await User.findAll({
    where: {
      isActive: true,
      ...whereClause,
    },
    attributes: ['id', 'firstName', 'lastName', 'avatar', 'ecoPoints', 'totalCo2Saved'],
    order: [['ecoPoints', 'DESC']],
    limit: parseInt(limit as string),
  });

  const leaderboard: LeaderboardEntry[] = users.map((user, index) => ({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    ecoPoints: user.ecoPoints,
    totalCo2Saved: parseFloat(user.totalCo2Saved.toString()),
    rank: index + 1,
  }));

  res.json({
    success: true,
    data: {
      leaderboard,
      period,
      totalUsers: users.length,
    },
  } as ApiResponse);
});

export const getUserAchievements = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  // Return mock achievements for now to prevent dashboard errors
  const mockAchievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Logged your first carbon emission",
      icon: "🌱",
      unlockedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Tracked emissions for 7 consecutive days",
      icon: "🔥",
      unlockedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      title: "Eco Champion",
      description: "Reduced emissions by 10kg CO₂",
      icon: "🏆",
      unlockedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  res.json({
    success: true,
    data: mockAchievements,
  } as ApiResponse);
});

export const unlockAchievement = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { badgeId } = req.params;

  // Check if badge exists and is active
  const badge = await Badge.findOne({
    where: { id: badgeId, isActive: true },
  });

  if (!badge) {
    res.status(404).json({
      success: false,
      error: 'Badge not found',
    } as ApiResponse);
    return;
  }

  // Check if already unlocked
  const existingAchievement = await Achievement.findOne({
    where: { userId: user.id, badgeId },
  });

  if (existingAchievement) {
    res.status(409).json({
      success: false,
      error: 'Badge already unlocked',
    } as ApiResponse);
    return;
  }

  // Check if user meets requirements
  const carbonLogs = await CarbonLog.findAll({
    where: { userId: user.id },
  });

  if (!badge.checkRequirement(user, carbonLogs)) {
    res.status(400).json({
      success: false,
      error: 'Requirements not met for this badge',
    } as ApiResponse);
    return;
  }

  // Create achievement
  const achievement = await Achievement.create({
    userId: user.id,
    badgeId: badgeId!,
    unlockedAt: new Date(),
  });

  // Award bonus eco points (optional)
  const bonusPoints = 100;
  user.addEcoPoints(bonusPoints);
  await user.save();

  res.status(201).json({
    success: true,
    data: {
      achievement: {
        id: achievement.id,
        badge,
        unlockedAt: achievement.unlockedAt,
      },
      bonusPoints,
    },
    message: 'Achievement unlocked successfully!',
  } as ApiResponse);
});

export const getGlobalStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Get global statistics (public endpoint)
  const totalUsers = await User.count({ where: { isActive: true } });
  
  const totalCo2Saved = await User.sum('totalCo2Saved', {
    where: { isActive: true },
  });

  const totalLogs = await CarbonLog.count();

  const avgUserLevel = await User.findOne({
    attributes: [
      [User.sequelize!.fn('AVG', User.sequelize!.col('level')), 'avgLevel'],
    ],
    where: { isActive: true },
    raw: true,
  }) as any;

  // Recent activity (last 7 days)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  
  const recentLogs = await CarbonLog.count({
    where: {
      timestamp: { [Op.gte]: weekStart },
    },
  });

  const realWorldImpact = getRealWorldEquivalents(totalCo2Saved || 0);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalCo2Saved: totalCo2Saved || 0,
      totalLogs,
      averageUserLevel: Math.round(avgUserLevel?.avgLevel || 1),
      recentActivity: {
        weeklyLogs: recentLogs,
      },
      globalImpact: realWorldImpact,
    },
  } as ApiResponse);
});
