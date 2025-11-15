import { Router } from 'express';
import { 
  getUserStats, 
  getLeaderboard, 
  getUserAchievements, 
  unlockAchievement, 
  getGlobalStats 
} from '../controllers/statsController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/stats/user:
 *   get:
 *     summary: Get user statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/user', authenticateToken, getUserStats);

/**
 * @swagger
 * /api/stats/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, weekly, monthly]
 *           default: all
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @swagger
 * /api/stats/achievements:
 *   get:
 *     summary: Get user achievements
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User achievements retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/achievements', authenticateToken, getUserAchievements);

/**
 * @swagger
 * /api/stats/achievements/{badgeId}/unlock:
 *   post:
 *     summary: Unlock an achievement
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Achievement unlocked successfully
 *       400:
 *         description: Requirements not met
 *       404:
 *         description: Badge not found
 *       409:
 *         description: Badge already unlocked
 *       401:
 *         description: Unauthorized
 */
router.post('/achievements/:badgeId/unlock', authenticateToken, unlockAchievement);

/**
 * @swagger
 * /api/stats/global:
 *   get:
 *     summary: Get global statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Global statistics retrieved successfully
 */
router.get('/global', getGlobalStats);

export default router;
