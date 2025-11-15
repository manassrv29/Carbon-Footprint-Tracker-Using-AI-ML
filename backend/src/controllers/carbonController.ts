import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { CarbonLog, User } from '../models';
import { ApiResponse, CreateCarbonLogRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { calculateCO2Emission, calculateEcoPoints, getCategoryBreakdown, getWeeklyEmissions } from '../utils/emissions';

export const createCarbonLog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { category, activityType, value, source = 'manual', metadata, timestamp, co2Kg: providedCo2 }: CreateCarbonLogRequest = req.body;

  // Calculate CO2 emission (use provided value if available, e.g., from GPS auto-tracking)
  const co2Kg = providedCo2 !== undefined ? providedCo2 : await calculateCO2Emission(category, activityType, value);
  const ecoPoints = calculateEcoPoints(co2Kg, category);

  // Create carbon log
  const carbonLog = await CarbonLog.create({
    userId: user.id,
    category,
    activityType,
    value,
    co2Kg,
    source,
    metadata,
    timestamp: timestamp || new Date(),
  });

  // Update user statistics
  user.addEcoPoints(ecoPoints);
  user.totalCo2Saved = parseFloat(user.totalCo2Saved) + co2Kg;
  user.updateStreak(carbonLog.timestamp);
  await user.save();

  res.status(201).json({
    success: true,
    data: {
      carbonLog: {
        id: carbonLog.id,
        category: carbonLog.category,
        activityType: carbonLog.activityType,
        value: carbonLog.value,
        co2Kg: carbonLog.co2Kg,
        source: carbonLog.source,
        timestamp: carbonLog.timestamp,
      },
      ecoPointsEarned: ecoPoints,
      userStats: {
        level: user.level,
        ecoPoints: user.ecoPoints,
        streak: user.streak,
        totalCo2Saved: user.totalCo2Saved,
      },
    },
    message: 'Carbon log created successfully',
  } as ApiResponse);
});

export const getCarbonLogs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { page = 1, limit = 20, category, startDate, endDate } = req.query;

  const whereClause: any = { userId: user.id };
  
  if (category) {
    whereClause.category = category;
  }
  
  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate as string);
    if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate as string);
  }

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  
  const { rows: carbonLogs, count: total } = await CarbonLog.findAndCountAll({
    where: whereClause,
    order: [['timestamp', 'DESC']],
    limit: parseInt(limit as string),
    offset,
  });

  res.json({
    success: true,
    data: carbonLogs,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  } as ApiResponse);
});

export const getCarbonLogById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const carbonLog = await CarbonLog.findOne({
    where: { id, userId: user.id },
  });

  if (!carbonLog) {
    res.status(404).json({
      success: false,
      error: 'Carbon log not found',
    } as ApiResponse);
    return;
  }

  res.json({
    success: true,
    data: carbonLog,
  } as ApiResponse);
});

export const updateCarbonLog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;
  const { category, activityType, value, metadata, timestamp } = req.body;

  const carbonLog = await CarbonLog.findOne({
    where: { id, userId: user.id },
  });

  if (!carbonLog) {
    res.status(404).json({
      success: false,
      error: 'Carbon log not found',
    } as ApiResponse);
    return;
  }

  // Calculate new CO2 emission if values changed
  let newCo2Kg = carbonLog.co2Kg;
  if (category !== carbonLog.category || activityType !== carbonLog.activityType || value !== carbonLog.value) {
    newCo2Kg = await calculateCO2Emission(category || carbonLog.category, activityType || carbonLog.activityType, value || carbonLog.value);
  }

  // Update carbon log
  await carbonLog.update({
    category: category || carbonLog.category,
    activityType: activityType || carbonLog.activityType,
    value: value || carbonLog.value,
    co2Kg: newCo2Kg,
    metadata: metadata || carbonLog.metadata,
    timestamp: timestamp || carbonLog.timestamp,
  });

  // Recalculate user statistics (simplified - in production, consider more sophisticated approach)
  const userLogs = await CarbonLog.findAll({ where: { userId: user.id } });
  const totalCo2Saved = userLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
  const totalEcoPoints = userLogs.reduce((sum, log) => sum + calculateEcoPoints(parseFloat(log.co2Kg.toString()), log.category), 0);

  await user.update({
    totalCo2Saved,
    ecoPoints: totalEcoPoints,
    level: Math.floor(totalEcoPoints / 1000) + 1,
  });

  res.json({
    success: true,
    data: carbonLog,
    message: 'Carbon log updated successfully',
  } as ApiResponse);
});

export const deleteCarbonLog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const carbonLog = await CarbonLog.findOne({
    where: { id, userId: user.id },
  });

  if (!carbonLog) {
    res.status(404).json({
      success: false,
      error: 'Carbon log not found',
    } as ApiResponse);
    return;
  }

  await carbonLog.destroy();

  // Recalculate user statistics
  const userLogs = await CarbonLog.findAll({ where: { userId: user.id } });
  const totalCo2Saved = userLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
  const totalEcoPoints = userLogs.reduce((sum, log) => sum + calculateEcoPoints(parseFloat(log.co2Kg.toString()), log.category), 0);

  await user.update({
    totalCo2Saved,
    ecoPoints: totalEcoPoints,
    level: Math.floor(totalEcoPoints / 1000) + 1,
  });

  res.json({
    success: true,
    message: 'Carbon log deleted successfully',
  } as ApiResponse);
});

export const getCarbonStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period as string));

  const carbonLogs = await CarbonLog.findAll({
    where: {
      userId: user.id,
      timestamp: {
        [Op.gte]: startDate,
      },
    },
    order: [['timestamp', 'ASC']],
  });

  const categoryBreakdown = getCategoryBreakdown(carbonLogs);
  const weeklyEmissions = getWeeklyEmissions(carbonLogs);
  const totalEmissions = carbonLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
  const averageDaily = totalEmissions / parseInt(period as string);
  const weeklyAverage = totalEmissions / Math.ceil(parseInt(period as string) / 7);

  // Generate weekly data for chart
  const weeklyData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayLogs = carbonLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.toDateString() === date.toDateString();
    });
    const dayCo2 = dayLogs.reduce((sum, log) => sum + parseFloat(log.co2Kg.toString()), 0);
    const mainCategory = dayLogs.length > 0 ? (dayLogs[0]?.category || 'none') : 'none';
    
    weeklyData.push({
      date: date.toISOString(),
      co2: dayCo2,
      category: mainCategory
    });
  }

  res.json({
    success: true,
    data: {
      totalCo2: totalEmissions,
      weeklyAverage: weeklyAverage,
      monthlyTarget: 50, // Default target
      ecoPoints: user.ecoPoints,
      streak: user.streak,
      level: user.level,
      weeklyData: weeklyData,
      categoryBreakdown: categoryBreakdown,
      period: parseInt(period as string),
      averageDaily,
      logCount: carbonLogs.length,
    },
  } as ApiResponse);
});
