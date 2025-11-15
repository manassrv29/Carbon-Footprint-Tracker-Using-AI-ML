import { Request, Response } from 'express';
import { User } from '../models';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

interface Notification {
  id: number;
  type: 'achievement' | 'reminder' | 'challenge' | 'report' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export const getUserNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { page = 1, limit = 20, unread } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  // Mock notifications data - in real implementation, this would come from a Notifications table
  const allNotifications: Notification[] = [
    {
      id: 1,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'Congratulations! You\'ve earned the "Week Warrior" badge for tracking emissions for 7 consecutive days.',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      data: { badgeId: 'week-warrior', points: 100 }
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Daily Log Reminder',
      message: 'Don\'t forget to log your carbon emissions for today to maintain your streak!',
      read: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'challenge',
      title: 'Challenge Update',
      message: 'You\'re 75% complete with the "Green Week Challenge". Keep it up!',
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      data: { challengeId: 1, progress: 75 }
    },
    {
      id: 4,
      type: 'report',
      title: 'Weekly Report Available',
      message: 'Your weekly carbon footprint report is ready. You reduced emissions by 12% this week!',
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      data: { reportType: 'weekly', reduction: 12 }
    },
    {
      id: 5,
      type: 'system',
      title: 'New Feature: Auto-tracking',
      message: 'Try our new GPS auto-tracking feature to automatically log your transport emissions!',
      read: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Filter notifications
  let notifications = allNotifications;
  if (unread === 'true') {
    notifications = notifications.filter(n => !n.read);
  }

  // Pagination
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedNotifications = notifications.slice(startIndex, endIndex);

  const unreadCount = allNotifications.filter(n => !n.read).length;

  res.json({
    success: true,
    data: {
      notifications: paginatedNotifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: notifications.length,
        pages: Math.ceil(notifications.length / limitNum)
      },
      unreadCount
    },
    message: 'Notifications retrieved successfully'
  } as ApiResponse);
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const notificationId = parseInt(req.params.id as string);

  // In real implementation, update the notification in database
  // For now, just return success
  res.json({
    success: true,
    data: {
      notificationId,
      read: true,
      readAt: new Date().toISOString()
    },
    message: 'Notification marked as read'
  } as ApiResponse);
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  // In real implementation, update all user's notifications in database
  res.json({
    success: true,
    data: {
      markedCount: 3, // Mock count of notifications marked as read
      readAt: new Date().toISOString()
    },
    message: 'All notifications marked as read'
  } as ApiResponse);
});

export const getNotificationSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  // Get notification settings from user settings or defaults
  const settings = userRecord.settings ? JSON.parse(userRecord.settings) : {};
  const notificationSettings = settings.notifications || {
    email: true,
    push: true,
    weeklyReports: true,
    achievements: true,
    challenges: true,
    reminders: true
  };

  res.json({
    success: true,
    data: notificationSettings,
    message: 'Notification settings retrieved successfully'
  } as ApiResponse);
});

export const updateNotificationSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const newSettings = req.body;

  const userRecord = await User.findByPk(user.id);
  if (!userRecord) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    } as ApiResponse);
    return;
  }

  // Get current settings
  const currentSettings = userRecord.settings ? JSON.parse(userRecord.settings) : {};
  
  // Update notification settings
  const updatedSettings = {
    ...currentSettings,
    notifications: {
      ...currentSettings.notifications,
      ...newSettings
    }
  };

  await userRecord.update({
    settings: JSON.stringify(updatedSettings)
  });

  res.json({
    success: true,
    data: updatedSettings.notifications,
    message: 'Notification settings updated successfully'
  } as ApiResponse);
});

export const sendTestNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  // In real implementation, this would send actual notifications via email/push services
  const testNotification = {
    id: Date.now(),
    type: 'system' as const,
    title: 'Test Notification',
    message: 'This is a test notification to verify your notification settings are working correctly.',
    read: false,
    createdAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: {
      notification: testNotification,
      sentVia: ['app'], // In real implementation: ['email', 'push', 'app']
      timestamp: new Date().toISOString()
    },
    message: 'Test notification sent successfully'
  } as ApiResponse);
});
