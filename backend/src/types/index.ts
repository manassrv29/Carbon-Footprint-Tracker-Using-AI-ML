export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'corporate';
  organizationId?: number;
  level: number;
  ecoPoints: number;
  streak: number;
  totalCo2Saved: number;
  weeklyReduction: number;
  dailyTarget: number;
  isActive: boolean;
  lastLoginAt?: Date;
  settings?: string;
  longestStreak?: number;
  lastActiveDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarbonLog {
  id: number;
  userId: number;
  category: 'transport' | 'food' | 'energy' | 'other';
  activityType: string;
  value: number;
  co2Kg: number;
  source: 'manual' | 'gps' | 'ocr' | 'api';
  metadata?: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: number;
  userId: number;
  badgeId: string;
  unlockedAt: Date;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: {
    type: 'streak' | 'reduction' | 'points' | 'activity';
    value: number;
    condition?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  startDate: Date;
  endDate: Date;
  targetMetric: string;
  targetValue: number;
  rewardPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeParticipation {
  id: number;
  userId: number;
  challengeId: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  joinedAt: Date;
}

export interface EmissionFactor {
  id: number;
  category: string;
  type: string;
  factor: number;
  unit: string;
  source: string;
  region?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'corporate';
  organizationId?: number;
  organizationName?: string;
  organizationDomain?: string;
  organizationIndustry?: string;
  organizationSize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
}

export interface CreateCarbonLogRequest {
  category: 'transport' | 'food' | 'energy' | 'other';
  activityType: string;
  value: number;
  source?: 'manual' | 'gps' | 'ocr' | 'api';
  metadata?: any;
  timestamp?: Date;
  co2Kg?: number; // Optional pre-calculated CO2 value for auto-tracking
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  dailyTarget?: number;
  avatar?: string;
}

export interface LeaderboardEntry {
  userId: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  ecoPoints: number;
  totalCo2Saved: number;
  rank: number;
}
