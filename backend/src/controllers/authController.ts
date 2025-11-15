import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Organization } from '../models';
import { ApiResponse, AuthTokens, LoginRequest, RegisterRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const generateTokens = (userId: number, role: string): AuthTokens => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  
  const accessToken = jwt.sign(
    { userId, role },
    secret,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
};

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    role = 'user',
    organizationId,
    organizationName,
    organizationDomain,
    organizationIndustry,
    organizationSize
  }: RegisterRequest = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    res.status(409).json({
      success: false,
      error: 'User already exists with this email',
    } as ApiResponse);
    return;
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  let finalOrganizationId = organizationId;

  // Handle corporate user registration
  if (role === 'corporate') {
    if (organizationId) {
      // Verify organization exists
      const organization = await Organization.findByPk(organizationId);
      if (!organization) {
        res.status(400).json({
          success: false,
          error: 'Organization not found',
        } as ApiResponse);
        return;
      }
    } else if (organizationName) {
      // Create new organization
      const organization = await Organization.create({
        name: organizationName,
        domain: organizationDomain,
        industry: organizationIndustry,
        size: organizationSize,
      });
      finalOrganizationId = organization.id;
    } else {
      res.status(400).json({
        success: false,
        error: 'Corporate users must provide either organizationId or organizationName',
      } as ApiResponse);
      return;
    }
  }

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role,
    organizationId: finalOrganizationId,
  });

  // Generate tokens
  const tokens = generateTokens(user.id, user.role);

  // Update last login
  await user.update({ lastLoginAt: new Date() });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        level: user.level,
        ecoPoints: user.ecoPoints,
        streak: user.streak,
        totalCo2Saved: user.totalCo2Saved,
        dailyTarget: user.dailyTarget,
      },
      tokens,
      redirectTo: user.role === 'corporate' ? '/corporate/home' : '/user/home',
    },
    message: 'User registered successfully',
  } as ApiResponse);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Find user
  const user = await User.findOne({ where: { email, isActive: true } });
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    } as ApiResponse);
    return;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    } as ApiResponse);
    return;
  }

  // Generate tokens
  const tokens = generateTokens(user.id, user.role);

  // Update last login
  await user.update({ lastLoginAt: new Date() });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        level: user.level,
        ecoPoints: user.ecoPoints,
        streak: user.streak,
        totalCo2Saved: user.totalCo2Saved,
        dailyTarget: user.dailyTarget,
      },
      tokens,
      redirectTo: user.role === 'corporate' ? '/corporate/home' : '/user/home',
    },
    message: 'Login successful',
  } as ApiResponse);
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      level: user.level,
      ecoPoints: user.ecoPoints,
      streak: user.streak,
      totalCo2Saved: user.totalCo2Saved,
      weeklyReduction: user.weeklyReduction,
      dailyTarget: user.dailyTarget,
      createdAt: user.createdAt,
    },
  } as ApiResponse);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { firstName, lastName, dailyTarget, avatar } = req.body;

  const updateData: any = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (dailyTarget) updateData.dailyTarget = dailyTarget;
  if (avatar) updateData.avatar = avatar;

  await user.update(updateData);

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      level: user.level,
      ecoPoints: user.ecoPoints,
      streak: user.streak,
      totalCo2Saved: user.totalCo2Saved,
      weeklyReduction: user.weeklyReduction,
      dailyTarget: user.dailyTarget,
    },
    message: 'Profile updated successfully',
  } as ApiResponse);
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  // Soft delete - mark as inactive
  await user.update({ isActive: false });

  res.json({
    success: true,
    message: 'Account deleted successfully',
  } as ApiResponse);
});
