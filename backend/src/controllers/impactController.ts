import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { CarbonLog, User } from '../models';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { getCategoryBreakdown } from '../utils/emissions';

export const getImpactVisualization = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { period = 'month' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      startDate = new Date(2020, 0, 1); // Arbitrary start date
      break;
    default: // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Get carbon logs for the period
  const carbonLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: {
        [Op.between]: [startDate, now],
      },
    },
    order: [['timestamp', 'ASC']],
  });

  const totalEmissions = carbonLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
  const categoryBreakdown = getCategoryBreakdown(carbonLogs);

  // Calculate daily/weekly/monthly breakdown based on period
  const timeSeriesData = [];
  const groupBy = period === 'week' ? 'day' : period === 'year' ? 'month' : 'day';
  
  if (groupBy === 'day') {
    const days = period === 'week' ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayLogs = carbonLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === date.toDateString();
      });
      const dayEmissions = dayLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
      
      timeSeriesData.push({
        date: date.toISOString().split('T')[0],
        emissions: parseFloat(dayEmissions.toFixed(2)),
        categories: getCategoryBreakdown(dayLogs)
      });
    }
  }

  res.json({
    success: true,
    data: {
      period,
      totalEmissions: parseFloat(totalEmissions.toFixed(2)),
      categoryBreakdown,
      timeSeriesData,
      averageDaily: parseFloat((totalEmissions / timeSeriesData.length).toFixed(2)),
      trend: totalEmissions > 0 ? 'stable' : 'improving', // Simplified trend calculation
      impactScore: Math.max(0, 100 - (totalEmissions * 2)) // Simple scoring system
    },
    message: 'Impact visualization data retrieved successfully'
  } as ApiResponse);
});

export const getEnvironmentalEquivalents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { period = 'month' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      startDate = new Date(2020, 0, 1);
      break;
    default: // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Get carbon logs and calculate total saved emissions
  const carbonLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: {
        [Op.between]: [startDate, now],
      },
    },
  });

  const totalEmissions = carbonLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
  
  // Assume user's target was higher, so calculate "saved" emissions
  const userRecord = await User.findByPk(user.id);
  const dailyTarget = userRecord?.dailyTarget || 2.5;
  const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const targetEmissions = dailyTarget * daysInPeriod;
  const savedEmissions = Math.max(0, targetEmissions - totalEmissions);

  // Environmental equivalents calculations
  const equivalents = {
    treesPlanted: Math.round(savedEmissions / 21.77), // 1 tree absorbs ~21.77kg CO2/year
    carMilesSaved: Math.round(savedEmissions / 0.404 * 0.621371), // 0.404kg CO2/km, convert to miles
    carKmSaved: Math.round(savedEmissions / 0.404), // 0.404kg CO2/km for average car
    energySavedKwh: Math.round(savedEmissions / 0.5), // ~0.5kg CO2/kWh average
    waterSavedLiters: Math.round(savedEmissions * 1000), // Rough estimate
    coalNotBurned: parseFloat((savedEmissions / 2.86).toFixed(1)), // 2.86kg CO2/kg coal
    gasNotUsed: parseFloat((savedEmissions / 2.3).toFixed(1)), // 2.3kg CO2/liter gasoline
    plasticBottlesSaved: Math.round(savedEmissions / 0.082), // ~82g CO2 per plastic bottle
    meatMealsSaved: Math.round(savedEmissions / 3.3), // ~3.3kg CO2 per beef meal
    flightHoursSaved: parseFloat((savedEmissions / 90).toFixed(1)) // ~90kg CO2/hour flight
  };

  // Real-world comparisons
  const comparisons = {
    phoneCharges: Math.round(savedEmissions / 0.0084), // 8.4g CO2 per smartphone charge
    lightBulbHours: Math.round(savedEmissions / 0.04), // 40g CO2 per hour LED bulb
    washingMachineLoads: Math.round(savedEmissions / 0.6), // 600g CO2 per load
    dishwasherCycles: Math.round(savedEmissions / 1.44), // 1.44kg CO2 per cycle
    showerMinutes: Math.round(savedEmissions / 0.17) // 170g CO2 per minute hot shower
  };

  res.json({
    success: true,
    data: {
      period,
      totalSavedEmissions: parseFloat(savedEmissions.toFixed(2)),
      actualEmissions: parseFloat(totalEmissions.toFixed(2)),
      targetEmissions: parseFloat(targetEmissions.toFixed(2)),
      equivalents,
      comparisons,
      impactMessage: savedEmissions > 0 
        ? `Great job! You've saved ${savedEmissions.toFixed(1)}kg of CO₂ this ${period}.`
        : `You're on track with your emissions this ${period}.`
    },
    message: 'Environmental equivalents calculated successfully'
  } as ApiResponse);
});

export const getImpactComparison = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  // Get user's carbon logs for the last month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const userLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: {
        [Op.between]: [monthStart, now],
      },
    },
  });

  const userEmissions = userLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
  const userDaily = userEmissions / now.getDate();

  // Mock global/national averages (in real implementation, these would be from research data)
  const averages = {
    global: {
      daily: 4.8, // Global average ~4.8 tons CO2/year = ~13.15 kg/day
      monthly: 146.4,
      yearly: 4800
    },
    national: {
      daily: 16.1, // US average ~16.1 tons CO2/year = ~44.1 kg/day
      monthly: 1341.7,
      yearly: 16100
    },
    recommended: {
      daily: 2.3, // Paris Agreement target ~2.3 tons CO2/year = ~6.3 kg/day
      monthly: 191.7,
      yearly: 2300
    }
  };

  // Calculate comparisons
  const comparisons = {
    vsGlobal: {
      percentage: ((userDaily - averages.global.daily) / averages.global.daily * 100),
      better: userDaily < averages.global.daily,
      difference: parseFloat((userDaily - averages.global.daily).toFixed(2))
    },
    vsNational: {
      percentage: ((userDaily - averages.national.daily) / averages.national.daily * 100),
      better: userDaily < averages.national.daily,
      difference: parseFloat((userDaily - averages.national.daily).toFixed(2))
    },
    vsRecommended: {
      percentage: ((userDaily - averages.recommended.daily) / averages.recommended.daily * 100),
      better: userDaily < averages.recommended.daily,
      difference: parseFloat((userDaily - averages.recommended.daily).toFixed(2))
    }
  };

  // Calculate user's percentile ranking (mock calculation)
  const percentileRank = userDaily < averages.recommended.daily ? 95 : 
                        userDaily < averages.global.daily ? 75 : 
                        userDaily < averages.national.daily ? 50 : 25;

  res.json({
    success: true,
    data: {
      userStats: {
        dailyAverage: parseFloat(userDaily.toFixed(2)),
        monthlyTotal: parseFloat(userEmissions.toFixed(2)),
        projectedYearly: parseFloat((userDaily * 365).toFixed(2))
      },
      averages,
      comparisons,
      percentileRank,
      impactRating: percentileRank >= 90 ? 'Excellent' :
                   percentileRank >= 75 ? 'Very Good' :
                   percentileRank >= 50 ? 'Good' :
                   percentileRank >= 25 ? 'Fair' : 'Needs Improvement',
      recommendations: [
        'Consider using public transport more often',
        'Reduce meat consumption 2-3 days per week',
        'Switch to renewable energy sources',
        'Optimize home heating and cooling'
      ]
    },
    message: 'Impact comparison data retrieved successfully'
  } as ApiResponse);
});

export const getImpactTrends = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { period = 'year' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  let groupBy: 'week' | 'month';
  
  switch (period) {
    case '6months':
      startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      groupBy = 'week';
      break;
    case '2years':
      startDate = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      groupBy = 'month';
      break;
    default: // year
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      groupBy = 'month';
  }

  // Get carbon logs for the period
  const carbonLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: {
        [Op.between]: [startDate, now],
      },
    },
    order: [['timestamp', 'ASC']],
  });

  // Group data by time period
  const trendData = [];
  const periodLength = groupBy === 'week' ? 7 : 30;
  const totalPeriods = Math.ceil((now.getTime() - startDate.getTime()) / (periodLength * 24 * 60 * 60 * 1000));

  for (let i = 0; i < totalPeriods; i++) {
    const periodStart = new Date(startDate.getTime() + i * periodLength * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(periodStart.getTime() + periodLength * 24 * 60 * 60 * 1000);
    
    const periodLogs = carbonLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= periodStart && logDate < periodEnd;
    });

    const periodEmissions = periodLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
    const categoryBreakdown = getCategoryBreakdown(periodLogs);

    trendData.push({
      period: groupBy === 'week' ? `Week ${i + 1}` : periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      startDate: periodStart.toISOString().split('T')[0],
      endDate: periodEnd.toISOString().split('T')[0],
      emissions: parseFloat(periodEmissions.toFixed(2)),
      categories: categoryBreakdown,
      dailyAverage: parseFloat((periodEmissions / periodLength).toFixed(2))
    });
  }

  // Calculate trend analysis
  const recentPeriods = trendData.slice(-3);
  const olderPeriods = trendData.slice(0, 3);
  
  const recentAverage = recentPeriods.reduce((sum, p) => sum + p.emissions, 0) / recentPeriods.length;
  const olderAverage = olderPeriods.reduce((sum, p) => sum + p.emissions, 0) / olderPeriods.length;
  
  const trendDirection = recentAverage < olderAverage ? 'improving' : 
                        recentAverage > olderAverage ? 'worsening' : 'stable';
  const trendPercentage = olderAverage > 0 ? ((recentAverage - olderAverage) / olderAverage * 100) : 0;

  res.json({
    success: true,
    data: {
      period,
      trendData,
      analysis: {
        direction: trendDirection,
        percentage: parseFloat(trendPercentage.toFixed(1)),
        recentAverage: parseFloat(recentAverage.toFixed(2)),
        olderAverage: parseFloat(olderAverage.toFixed(2)),
        bestPeriod: trendData.length > 0 ? trendData.reduce((min, p) => p.emissions < (min?.emissions || Infinity) ? p : min, trendData[0]) : null,
        worstPeriod: trendData.length > 0 ? trendData.reduce((max, p) => p.emissions > (max?.emissions || 0) ? p : max, trendData[0]) : null
      },
      insights: [
        trendDirection === 'improving' ? 'Great progress! Your emissions are trending downward.' :
        trendDirection === 'worsening' ? 'Consider reviewing your recent activities to identify areas for improvement.' :
        'Your emissions are stable. Look for new opportunities to reduce your footprint.',
        
        'Transport remains your largest emission category.',
        'Weekend emissions tend to be higher than weekdays.'
      ]
    },
    message: 'Impact trends retrieved successfully'
  } as ApiResponse);
});

export const getGlobalImpact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Mock global community statistics
  const globalStats = {
    totalUsers: 15847,
    totalCo2Saved: 2847.6, // in tons
    totalLogs: 89234,
    averageReduction: 18.5, // percentage
    topCountries: [
      { country: 'United States', users: 4521, co2Saved: 892.3 },
      { country: 'Germany', users: 2134, co2Saved: 445.7 },
      { country: 'United Kingdom', users: 1876, co2Saved: 387.2 },
      { country: 'Canada', users: 1543, co2Saved: 321.8 },
      { country: 'Australia', users: 1234, co2Saved: 267.4 }
    ],
    monthlyGrowth: {
      newUsers: 1247,
      additionalSavings: 234.5,
      growthRate: 8.5 // percentage
    },
    milestones: [
      {
        title: '1 Million kg CO₂ Saved',
        achievedDate: '2024-08-15',
        description: 'Community reached 1 million kg of CO₂ savings'
      },
      {
        title: '10,000 Active Users',
        achievedDate: '2024-09-22',
        description: 'Reached 10,000 active monthly users'
      }
    ],
    environmentalImpact: {
      treesEquivalent: Math.round(2847.6 * 1000 / 21.77), // Convert tons to kg, then to trees
      carMilesAvoided: Math.round(2847.6 * 1000 / 0.404 * 0.621371), // Convert to miles
      energySaved: Math.round(2847.6 * 1000 / 0.5), // kWh
      coalAvoided: parseFloat((2847.6 * 1000 / 2.86).toFixed(1)) // tons of coal
    },
    categoryBreakdown: {
      transport: 45.2,
      energy: 28.7,
      food: 18.9,
      other: 7.2
    }
  };

  res.json({
    success: true,
    data: globalStats,
    message: 'Global impact statistics retrieved successfully'
  } as ApiResponse);
});
