import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Challenge, ChallengeParticipation, User } from '../models';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getChallenges = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, category, status = 'active' } = req.query;

  const whereClause: any = {};
  
  if (category) {
    whereClause.category = category;
  }

  if (status === 'active') {
    const now = new Date();
    whereClause.isActive = true;
    whereClause.startDate = { [Op.lte]: now };
    whereClause.endDate = { [Op.gte]: now };
  } else if (status === 'upcoming') {
    whereClause.isActive = true;
    whereClause.startDate = { [Op.gt]: new Date() };
  } else if (status === 'completed') {
    whereClause.endDate = { [Op.lt]: new Date() };
  }

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  
  const { rows: challenges, count: total } = await Challenge.findAndCountAll({
    where: whereClause,
    order: [['startDate', 'ASC']],
    limit: parseInt(limit as string),
    offset,
    include: [{
      model: ChallengeParticipation,
      as: 'participations',
      attributes: ['id'],
    }],
  });

  // Add participation count to each challenge
  const challengesWithStats = challenges.map(challenge => ({
    ...challenge.toJSON(),
    participantCount: challenge.participations?.length || 0,
    daysRemaining: challenge.getDaysRemaining(),
    isOngoing: challenge.isOngoing(),
  }));

  res.json({
    success: true,
    data: challengesWithStats,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  } as ApiResponse);
});

export const getChallengeById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = (req as any).user;

  const challenge = await Challenge.findByPk(id, {
    include: [{
      model: ChallengeParticipation,
      as: 'participations',
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'avatar'],
      }],
    }],
  });

  if (!challenge) {
    res.status(404).json({
      success: false,
      error: 'Challenge not found',
    } as ApiResponse);
    return;
  }

  // Check if current user is participating
  let userParticipation = null;
  if (user) {
    userParticipation = await ChallengeParticipation.findOne({
      where: { userId: user.id, challengeId: challenge.id },
    });
  }

  res.json({
    success: true,
    data: {
      ...challenge.toJSON(),
      participantCount: challenge.participations?.length || 0,
      daysRemaining: challenge.getDaysRemaining(),
      isOngoing: challenge.isOngoing(),
      userParticipation: userParticipation ? {
        progress: userParticipation.progress,
        isCompleted: userParticipation.isCompleted,
        joinedAt: userParticipation.joinedAt,
      } : null,
    },
  } as ApiResponse);
});

export const joinChallenge = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const challenge = await Challenge.findByPk(id);
  if (!challenge) {
    res.status(404).json({
      success: false,
      error: 'Challenge not found',
    } as ApiResponse);
    return;
  }

  if (!challenge.isOngoing()) {
    res.status(400).json({
      success: false,
      error: 'Challenge is not currently active',
    } as ApiResponse);
    return;
  }

  // Check if already participating
  const existingParticipation = await ChallengeParticipation.findOne({
    where: { userId: user.id, challengeId: challenge.id },
  });

  if (existingParticipation) {
    res.status(409).json({
      success: false,
      error: 'Already participating in this challenge',
    } as ApiResponse);
    return;
  }

  // Create participation
  const participation = await ChallengeParticipation.create({
    userId: user.id,
    challengeId: challenge.id,
  });

  res.status(201).json({
    success: true,
    data: {
      participation: {
        id: participation.id,
        progress: participation.progress,
        joinedAt: participation.joinedAt,
      },
    },
    message: 'Successfully joined challenge',
  } as ApiResponse);
});

export const leaveChallenge = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;

  const participation = await ChallengeParticipation.findOne({
    where: { userId: user.id, challengeId: id },
  });

  if (!participation) {
    res.status(404).json({
      success: false,
      error: 'Not participating in this challenge',
    } as ApiResponse);
    return;
  }

  await participation.destroy();

  res.json({
    success: true,
    message: 'Successfully left challenge',
  } as ApiResponse);
});

export const getUserChallenges = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { status = 'active' } = req.query;

  const whereClause: any = { userId: user.id };
  
  if (status === 'completed') {
    whereClause.isCompleted = true;
  } else if (status === 'active') {
    whereClause.isCompleted = false;
  }

  const participations = await ChallengeParticipation.findAll({
    where: whereClause,
    include: [{
      model: Challenge,
      as: 'challenge',
      where: status === 'active' ? {
        isActive: true,
        endDate: { [Op.gte]: new Date() },
      } : {},
    }],
    order: [['joinedAt', 'DESC']],
  });

  const challengesWithProgress = participations.map(participation => ({
    ...participation.challenge?.toJSON(),
    participation: {
      progress: participation.progress,
      isCompleted: participation.isCompleted,
      joinedAt: participation.joinedAt,
      completedAt: participation.completedAt,
    },
    daysRemaining: participation.challenge?.getDaysRemaining() || 0,
    isOngoing: participation.challenge?.isOngoing() || false,
  }));

  res.json({
    success: true,
    data: challengesWithProgress,
  } as ApiResponse);
});

export const updateChallengeProgress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;
  const { progress } = req.body;

  const participation = await ChallengeParticipation.findOne({
    where: { userId: user.id, challengeId: id },
    include: [{
      model: Challenge,
      as: 'challenge',
    }],
  });

  if (!participation) {
    res.status(404).json({
      success: false,
      error: 'Not participating in this challenge',
    } as ApiResponse);
    return;
  }

  const updateData: any = { progress };

  // Check if challenge is completed
  if (participation.challenge && progress >= participation.challenge.targetValue && !participation.isCompleted) {
    updateData.isCompleted = true;
    updateData.completedAt = new Date();

    // Award eco points
    user.addEcoPoints(participation.challenge.rewardPoints);
    await user.save();
  }

  await participation.update(updateData);

  res.json({
    success: true,
    data: {
      participation: {
        progress: participation.progress,
        isCompleted: participation.isCompleted,
        completedAt: participation.completedAt,
      },
      ecoPointsAwarded: updateData.isCompleted ? (participation.challenge?.rewardPoints || 0) : 0,
    },
    message: updateData.isCompleted ? 'Challenge completed! Eco points awarded.' : 'Progress updated',
  } as ApiResponse);
});
