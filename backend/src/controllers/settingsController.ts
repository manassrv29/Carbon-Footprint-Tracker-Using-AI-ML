import { Request, Response } from 'express';
import { User } from '../models';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    weekly_reports: boolean;
    achievements: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    leaderboard_participation: boolean;
    data_sharing: boolean;
  };
  auto_tracking: {
    gps_enabled: boolean;
    ocr_enabled: boolean;
    barcode_enabled: boolean;
  };
  targets: {
    daily_co2_limit: number;
    weekly_reduction_goal: number;
    monthly_target: number;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    units: 'metric' | 'imperial';
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    weekly_reports: true,
    achievements: true,
  },
  privacy: {
    profile_visibility: 'public',
    leaderboard_participation: true,
    data_sharing: false,
  },
  auto_tracking: {
    gps_enabled: true,
    ocr_enabled: true,
    barcode_enabled: true,
  },
  targets: {
    daily_co2_limit: 2.5,
    weekly_reduction_goal: 10,
    monthly_target: 50,
  },
  preferences: {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    units: 'metric',
  },
};

export const getUserSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  // Get settings from user record or use defaults
  const settings = userRecord.settings ? JSON.parse(userRecord.settings) : defaultSettings;

  res.json({
    success: true,
    data: settings,
    message: 'User settings retrieved successfully'
  } as ApiResponse);
});

export const updateUserSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const settingsUpdate = req.body;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  // Get current settings or defaults
  const currentSettings = userRecord.settings ? JSON.parse(userRecord.settings) : defaultSettings;

  // Merge with updates
  const updatedSettings = {
    ...currentSettings,
    ...settingsUpdate,
    notifications: {
      ...currentSettings.notifications,
      ...(settingsUpdate.notifications || {})
    },
    privacy: {
      ...currentSettings.privacy,
      ...(settingsUpdate.privacy || {})
    },
    auto_tracking: {
      ...currentSettings.auto_tracking,
      ...(settingsUpdate.auto_tracking || {})
    },
    targets: {
      ...currentSettings.targets,
      ...(settingsUpdate.targets || {})
    },
    preferences: {
      ...currentSettings.preferences,
      ...(settingsUpdate.preferences || {})
    }
  };

  // Update user record
  await userRecord.update({
    settings: JSON.stringify(updatedSettings),
    dailyTarget: updatedSettings.targets.daily_co2_limit
  });

  res.json({
    success: true,
    data: updatedSettings,
    message: 'Settings updated successfully'
  } as ApiResponse);
});

export const resetUserSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  // Reset to default settings
  await userRecord.update({
    settings: JSON.stringify(defaultSettings),
    dailyTarget: defaultSettings.targets.daily_co2_limit
  });

  res.json({
    success: true,
    data: defaultSettings,
    message: 'Settings reset to defaults successfully'
  } as ApiResponse);
});
