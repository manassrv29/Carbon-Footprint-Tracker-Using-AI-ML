import { Request, Response } from 'express';
import { User, Achievement } from '../models';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getUserLevel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  const currentLevel = userRecord.level;
  const currentPoints = userRecord.ecoPoints;
  const pointsForNextLevel = currentLevel * 1000; // 1000 points per level
  const progressToNext = (currentPoints % 1000) / 1000 * 100;

  res.json({
    success: true,
    data: {
      currentLevel,
      currentPoints,
      pointsForNextLevel,
      progressToNext,
      pointsToNextLevel: pointsForNextLevel - (currentPoints % 1000)
    },
    message: 'User level retrieved successfully'
  } as ApiResponse);
});

export const getEcoPoints = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  // Mock points history - in real implementation, this would come from a PointsHistory table
  const pointsHistory = [
    { date: new Date().toISOString(), points: 50, reason: 'Daily carbon log', type: 'earned' },
    { date: new Date(Date.now() - 86400000).toISOString(), points: 100, reason: 'Weekly goal achieved', type: 'earned' },
    { date: new Date(Date.now() - 172800000).toISOString(), points: 25, reason: 'Streak milestone', type: 'earned' }
  ];

  res.json({
    success: true,
    data: {
      totalPoints: userRecord.ecoPoints,
      availablePoints: userRecord.ecoPoints, // Points not spent on rewards
      pointsHistory,
      weeklyEarned: 175,
      monthlyEarned: 850
    },
    message: 'Eco points retrieved successfully'
  } as ApiResponse);
});

export const getUserStreak = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  const currentStreak = userRecord.streak;
  const longestStreak = userRecord.longestStreak || currentStreak;
  const streakGoal = 30; // 30-day streak goal
  const daysUntilMilestone = Math.max(0, streakGoal - currentStreak);

  res.json({
    success: true,
    data: {
      currentStreak,
      longestStreak,
      streakGoal,
      daysUntilMilestone,
      streakMultiplier: Math.min(1 + (currentStreak * 0.1), 3.0), // Max 3x multiplier
      lastActivity: userRecord.lastActiveDate || new Date().toISOString()
    },
    message: 'Streak information retrieved successfully'
  } as ApiResponse);
});

export const getBadges = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  // Mock badges data - in real implementation, this would come from UserAchievements table
  const badges = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Logged your first carbon emission',
      icon: '🌱',
      category: 'beginner',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'common'
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: 'Tracked emissions for 7 consecutive days',
      icon: '🔥',
      category: 'streak',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'uncommon'
    },
    {
      id: 3,
      name: 'Eco Champion',
      description: 'Reduced emissions by 50kg CO₂',
      icon: '🏆',
      category: 'achievement',
      unlocked: false,
      progress: 75,
      requirement: '50kg CO₂ reduction',
      rarity: 'rare'
    },
    {
      id: 4,
      name: 'Green Commuter',
      description: 'Use eco-friendly transport 20 times',
      icon: '🚲',
      category: 'transport',
      unlocked: false,
      progress: 40,
      requirement: '20 eco-friendly trips',
      rarity: 'uncommon'
    }
  ];

  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  const totalCount = badges.length;

  res.json({
    success: true,
    data: {
      badges,
      unlockedCount,
      totalCount,
      completionPercentage: (unlockedCount / totalCount) * 100
    },
    message: 'Badges retrieved successfully'
  } as ApiResponse);
});

export const getRewards = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  // Mock rewards data
  const rewards = [
    {
      id: 1,
      name: 'Coffee Shop Discount',
      description: '10% off at participating eco-friendly coffee shops',
      cost: 500,
      category: 'discount',
      icon: '☕',
      available: true,
      claimed: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: 'Tree Planting Certificate',
      description: 'Plant a tree in your name',
      cost: 1000,
      category: 'environmental',
      icon: '🌳',
      available: userRecord.ecoPoints >= 1000,
      claimed: false
    },
    {
      id: 3,
      name: 'Eco Product Bundle',
      description: 'Sustainable products starter pack',
      cost: 2000,
      category: 'product',
      icon: '📦',
      available: userRecord.ecoPoints >= 2000,
      claimed: false
    },
    {
      id: 4,
      name: 'Carbon Offset Credits',
      description: 'Offset 1 ton of CO₂ emissions',
      cost: 1500,
      category: 'offset',
      icon: '🌍',
      available: userRecord.ecoPoints >= 1500,
      claimed: false
    }
  ];

  res.json({
    success: true,
    data: {
      rewards,
      userPoints: userRecord.ecoPoints,
      availableRewards: rewards.filter(r => r.available && !r.claimed).length
    },
    message: 'Rewards retrieved successfully'
  } as ApiResponse);
});

export const claimReward = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const rewardId = parseInt(req.params.id as string);

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  // Mock reward lookup - in real implementation, this would be from database
  const rewards = [
    { id: 1, cost: 500, name: 'Coffee Shop Discount' },
    { id: 2, cost: 1000, name: 'Tree Planting Certificate' },
    { id: 3, cost: 2000, name: 'Eco Product Bundle' },
    { id: 4, cost: 1500, name: 'Carbon Offset Credits' }
  ];

  const reward = rewards.find(r => r.id === rewardId);
  if (!reward) {
    res.status(404).json({
      success: false,
      error: 'Reward not found'
    } as ApiResponse);
    return;
  }

  if (userRecord.ecoPoints < reward.cost) {
    res.status(400).json({
      success: false,
      error: 'Insufficient eco points'
    } as ApiResponse);
    return;
  }

  // Deduct points and mark reward as claimed
  await userRecord.update({
    ecoPoints: userRecord.ecoPoints - reward.cost
  });

  // In real implementation, you would also create a ClaimedReward record

  res.json({
    success: true,
    data: {
      reward,
      remainingPoints: userRecord.ecoPoints - reward.cost,
      claimedAt: new Date().toISOString()
    },
    message: `${reward.name} claimed successfully!`
  } as ApiResponse);
});

export const getLevelProgress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  const level = userRecord.level;
  const points = userRecord.ecoPoints;
  const streak = userRecord.streak;
  
  // Calculate various progress metrics
  const levelProgress = (points % 1000) / 1000 * 100;
  const nextLevelPoints = (level + 1) * 1000;
  const pointsToNextLevel = nextLevelPoints - points;

  // Mock achievement progress
  const achievementProgress = {
    totalAchievements: 20,
    unlockedAchievements: 8,
    nearCompletion: [
      { name: 'Eco Champion', progress: 75, target: 100 },
      { name: 'Green Commuter', progress: 40, target: 100 }
    ]
  };

  res.json({
    success: true,
    data: {
      level: {
        current: level,
        progress: levelProgress,
        pointsToNext: pointsToNextLevel
      },
      points: {
        total: points,
        weeklyEarned: 175,
        monthlyEarned: 850
      },
      streak: {
        current: streak,
        longest: userRecord.longestStreak || streak,
        multiplier: Math.min(1 + (streak * 0.1), 3.0)
      },
      achievements: achievementProgress,
      overallProgress: {
        profileCompletion: 85,
        activityScore: 92,
        impactRating: 'High'
      }
    },
    message: 'Gamification progress retrieved successfully'
  } as ApiResponse);
});
