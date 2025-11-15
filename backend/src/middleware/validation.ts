import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details?.[0]?.message || 'Validation error',
      } as ApiResponse);
      return;
    }
    
    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  }),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  role: Joi.string().valid('user', 'corporate').default('user'),
  organizationId: Joi.number().integer().positive().optional(),
  organizationName: Joi.string().min(1).max(100).optional(),
  organizationDomain: Joi.string().domain().optional(),
  organizationIndustry: Joi.string().max(100).optional(),
  organizationSize: Joi.string().valid('startup', 'small', 'medium', 'large', 'enterprise').optional(),
}).custom((value, helpers) => {
  // If role is corporate, require either organizationId or organizationName
  if (value.role === 'corporate') {
    if (!value.organizationId && !value.organizationName) {
      return helpers.error('any.custom', {
        message: 'Corporate users must provide either organizationId or organizationName'
      });
    }
  }
  return value;
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const carbonLogSchema = Joi.object({
  category: Joi.string().valid('transport', 'food', 'energy', 'other').required(),
  activityType: Joi.string().min(1).max(100).required(),
  value: Joi.number().positive().required(),
  source: Joi.string().valid('manual', 'gps', 'ocr', 'api').optional(),
  metadata: Joi.object().optional(),
  timestamp: Joi.date().optional(),
  co2Kg: Joi.number().min(0).optional(), // Allow pre-calculated CO2 values
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  dailyTarget: Joi.number().positive(),
  avatar: Joi.string().uri(),
});

export const settingsSchema = Joi.object({
  notifications: Joi.object({
    email: Joi.boolean(),
    push: Joi.boolean(),
    weekly_reports: Joi.boolean(),
    achievements: Joi.boolean(),
  }),
  privacy: Joi.object({
    profile_visibility: Joi.string().valid('public', 'private', 'friends'),
    leaderboard_participation: Joi.boolean(),
    data_sharing: Joi.boolean(),
  }),
  auto_tracking: Joi.object({
    gps_enabled: Joi.boolean(),
    ocr_enabled: Joi.boolean(),
    barcode_enabled: Joi.boolean(),
  }),
  targets: Joi.object({
    daily_co2_limit: Joi.number().positive(),
    weekly_reduction_goal: Joi.number(),
    monthly_target: Joi.number().positive(),
  }),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'auto'),
    language: Joi.string(),
    currency: Joi.string(),
    units: Joi.string().valid('metric', 'imperial'),
  }),
}).optional();

export const challengeSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).required(),
  icon: Joi.string().min(1).max(50).required(),
  category: Joi.string().min(1).max(50).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  targetMetric: Joi.string().min(1).max(100).required(),
  targetValue: Joi.number().positive().required(),
  rewardPoints: Joi.number().integer().positive().required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
});

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Query validation error',
        message: error.details?.[0]?.message || 'Query validation error',
      } as ApiResponse);
      return;
    }
    
    next();
  };
};
