import { Router } from 'express';
import authRoutes from './auth';
import carbonRoutes from './carbon';
import challengeRoutes from './challenges';
import statsRoutes from './stats';
import foodCarbonRoutes from './foodCarbon';
import corporateRoutes from './corporate';
import reportsRoutes from './reports';
import settingsRoutes from './settings';
import gamificationRoutes from './gamification';
import impactRoutes from './impact';
import uploadRoutes from './upload';
import notificationsRoutes from './notifications';
import mlRoutes from './mlRoutes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/carbon', carbonRoutes);
router.use('/challenges', challengeRoutes);
router.use('/stats', statsRoutes);
router.use('/corporate', corporateRoutes);
router.use('/food-carbon', foodCarbonRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/impact', impactRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/ml', mlRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Carbon Tracker API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
