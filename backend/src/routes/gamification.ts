import { Router } from 'express';
import { 
  getUserLevel, 
  getEcoPoints, 
  getUserStreak, 
  getBadges, 
  getRewards,
  claimReward,
  getLevelProgress
} from '../controllers/gamificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/gamification/level:
 *   get:
 *     summary: Get user level and progress
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User level retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/level', authenticateToken, getUserLevel);

/**
 * @swagger
 * /api/gamification/points:
 *   get:
 *     summary: Get user eco points and history
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eco points retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/points', authenticateToken, getEcoPoints);

/**
 * @swagger
 * /api/gamification/streak:
 *   get:
 *     summary: Get user streak information
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Streak information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/streak', authenticateToken, getUserStreak);

/**
 * @swagger
 * /api/gamification/badges:
 *   get:
 *     summary: Get user badges and achievements
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/badges', authenticateToken, getBadges);

/**
 * @swagger
 * /api/gamification/rewards:
 *   get:
 *     summary: Get available rewards for user
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rewards retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/rewards', authenticateToken, getRewards);

/**
 * @swagger
 * /api/gamification/rewards/{id}/claim:
 *   post:
 *     summary: Claim a reward
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reward claimed successfully
 *       400:
 *         description: Insufficient points or already claimed
 *       401:
 *         description: Unauthorized
 */
router.post('/rewards/:id/claim', authenticateToken, claimReward);

/**
 * @swagger
 * /api/gamification/progress:
 *   get:
 *     summary: Get overall gamification progress
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/progress', authenticateToken, getLevelProgress);

export default router;
