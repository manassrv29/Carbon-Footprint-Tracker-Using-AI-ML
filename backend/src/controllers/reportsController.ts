import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { CarbonLog, User } from '../models';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { getCategoryBreakdown } from '../utils/emissions';

export const getWeeklyReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { week } = req.query;

  // Calculate week start and end dates
  const now = new Date();
  const weekStart = week ? new Date(week as string) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Get carbon logs for the week
  const carbonLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: {
        [Op.between]: [weekStart, weekEnd],
      },
    },
    order: [['timestamp', 'ASC']],
  });

  // Calculate daily emissions
  const dailyEmissions = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const dayLogs = carbonLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.toDateString() === date.toDateString();
    });
    
    const dayEmissions = dayLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
    
    dailyEmissions.push({
      day: days[date.getDay()],
      date: date.toISOString().split('T')[0],
      target: 2.5, // Default daily target
      actual: dayEmissions,
      status: dayEmissions <= 2.5 ? 'good' : dayEmissions <= 3.0 ? 'warning' : 'exceeded'
    });
  }

  // Calculate category progress
  const categoryBreakdown = getCategoryBreakdown(carbonLogs);
  const totalEmissions = carbonLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
  
  const categoryProgress = {
    transport: {
      current: categoryBreakdown.transport || 0,
      target: 0.8,
      reduction: -25,
      realWorldImpact: {
        treesPerDay: ((categoryBreakdown.transport || 0) / 21.77).toFixed(2),
        kmSaved: ((categoryBreakdown.transport || 0) / 0.21).toFixed(1),
      },
    },
    food: {
      current: categoryBreakdown.food || 0,
      target: 0.6,
      reduction: -15,
      realWorldImpact: {
        mealsSaved: 1.2,
        waterSaved: 180,
      },
    },
    energy: {
      current: categoryBreakdown.energy || 0,
      target: 0.3,
      reduction: -20,
      realWorldImpact: {
        ledHours: 8,
        solarOffset: 0.6,
      },
    },
  };

  // Calculate environmental equivalents
  const environmentalEquivalents = {
    treesPlanted: Math.round(totalEmissions / 21.77 * 12),
    carTravelSaved: Math.round(totalEmissions / 0.21 * 450),
    energySaved: Math.round(totalEmissions * 180),
    waterSaved: Math.round(totalEmissions * 5400),
  };

  // Weekly reduction calculation
  const weeklyReduction = 12; // Mock calculation

  res.json({
    success: true,
    data: {
      level: user.level,
      ecoPoints: user.ecoPoints,
      streak: user.streak,
      weeklyReduction,
      reductionGoal: 15,
      dailyEmissions,
      categoryProgress,
      environmentalEquivalents,
      achievements: [
        {
          id: 1,
          title: 'Week Champion',
          description: '7 days ago to unlock',
          icon: '🏆',
          daysToUnlock: 7,
        },
      ],
    },
  } as ApiResponse);
});

export const getMonthlyReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { month, year } = req.query;

  // Calculate month start and end dates
  const now = new Date();
  const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
  const targetYear = year ? parseInt(year as string) : now.getFullYear();
  
  const monthStart = new Date(targetYear, targetMonth, 1);
  const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  // Get carbon logs for the month
  const carbonLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: {
        [Op.between]: [monthStart, monthEnd],
      },
    },
    order: [['timestamp', 'ASC']],
  });

  // Calculate total emissions
  const totalEmissions = carbonLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);

  // Calculate weekly breakdown
  const weeklyBreakdown = [];
  const weeksInMonth = Math.ceil((monthEnd.getDate() - monthStart.getDate() + 1) / 7);
  
  for (let week = 1; week <= weeksInMonth; week++) {
    const weekStartDate = new Date(monthStart);
    weekStartDate.setDate(monthStart.getDate() + (week - 1) * 7);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    if (weekEndDate > monthEnd) {
      weekEndDate.setTime(monthEnd.getTime());
    }

    const weekLogs = carbonLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= weekStartDate && logDate <= weekEndDate;
    });

    const weekEmissions = weekLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
    const categoryBreakdown = getCategoryBreakdown(weekLogs);

    weeklyBreakdown.push({
      week,
      startDate: weekStartDate.toISOString().split('T')[0],
      endDate: weekEndDate.toISOString().split('T')[0],
      emissions: parseFloat(weekEmissions.toFixed(1)),
      target: 15.0,
      categories: {
        transport: parseFloat((categoryBreakdown.transport || 0).toFixed(1)),
        food: parseFloat((categoryBreakdown.food || 0).toFixed(1)),
        energy: parseFloat((categoryBreakdown.energy || 0).toFixed(1)),
        other: parseFloat((categoryBreakdown.other || 0).toFixed(1)),
      },
    });
  }

  // Calculate category trends (mock data for now)
  const categoryTrends = {
    transport: {
      current: parseFloat((totalEmissions * 0.6).toFixed(1)),
      lastMonth: parseFloat((totalEmissions * 0.75).toFixed(1)),
      trend: 'down' as const,
      percentage: -20
    },
    food: {
      current: parseFloat((totalEmissions * 0.25).toFixed(1)),
      lastMonth: parseFloat((totalEmissions * 0.3).toFixed(1)),
      trend: 'down' as const,
      percentage: -18
    },
    energy: {
      current: parseFloat((totalEmissions * 0.15).toFixed(1)),
      lastMonth: parseFloat((totalEmissions * 0.2).toFixed(1)),
      trend: 'down' as const,
      percentage: -14
    }
  };

  // Environmental impact calculations
  const environmentalImpact = {
    treesEquivalent: Math.round(totalEmissions / 21.77 * 28),
    carKmSaved: Math.round(totalEmissions / 0.21 * 1250),
    energySavedKwh: Math.round(totalEmissions * 420),
    waterSavedLiters: Math.round(totalEmissions * 15600),
    co2OffsetKg: parseFloat(totalEmissions.toFixed(1)),
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  res.json({
    success: true,
    data: {
      month: monthNames[targetMonth],
      year: targetYear,
      totalEmissions: parseFloat(totalEmissions.toFixed(1)),
      reductionFromLastMonth: -18,
      level: user.level,
      ecoPoints: user.ecoPoints,
      streak: user.streak,
      weeklyBreakdown,
      categoryTrends,
      monthlyGoals: {
        totalTarget: 50.0,
        achieved: totalEmissions <= 50.0,
        categories: {
          transport: { target: 25.0, achieved: categoryTrends.transport.current <= 25.0 },
          food: { target: 12.0, achieved: categoryTrends.food.current <= 12.0 },
          energy: { target: 8.0, achieved: categoryTrends.energy.current <= 8.0 }
        }
      },
      environmentalImpact,
      achievements: [
        {
          id: 1,
          title: 'Monthly Champion',
          description: 'Achieved monthly reduction goal',
          icon: '🏆',
          unlockedDate: new Date().toISOString(),
          category: 'goals'
        },
        {
          id: 2,
          title: 'Green Commuter',
          description: 'Reduced transport emissions by 20%',
          icon: '🚲',
          unlockedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'transport'
        }
      ],
      insights: [
        {
          type: 'success',
          title: 'Great Progress!',
          description: 'You reduced your carbon footprint by 18% this month compared to last month.',
        },
        {
          type: 'info',
          title: 'Transport Focus',
          description: 'Transport remains your largest emission source. Consider carpooling or public transport.',
          action: 'View transport tips'
        }
      ]
    },
  } as ApiResponse);
});
