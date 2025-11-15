import { Router } from 'express';
import { 
  getImpactVisualization, 
  getEnvironmentalEquivalents, 
  getImpactComparison,
  getImpactTrends,
  getGlobalImpact
} from '../controllers/impactController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/impact/visualization:
 *   get:
 *     summary: Get impact visualization data
 *     tags: [Impact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *           default: month
 *     responses:
 *       200:
 *         description: Impact visualization data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/visualization', authenticateToken, getImpactVisualization);

/**
 * @swagger
 * /api/impact/equivalents:
 *   get:
 *     summary: Get environmental equivalents for user's carbon savings
 *     tags: [Impact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *           default: month
 *     responses:
 *       200:
 *         description: Environmental equivalents retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/equivalents', authenticateToken, getEnvironmentalEquivalents);

/**
 * @swagger
 * /api/impact/comparison:
 *   get:
 *     summary: Compare user's impact with averages and goals
 *     tags: [Impact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Impact comparison data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/comparison', authenticateToken, getImpactComparison);

/**
 * @swagger
 * /api/impact/trends:
 *   get:
 *     summary: Get impact trends over time
 *     tags: [Impact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [6months, year, 2years]
 *           default: year
 *     responses:
 *       200:
 *         description: Impact trends retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/trends', authenticateToken, getImpactTrends);

/**
 * @swagger
 * /api/impact/global:
 *   get:
 *     summary: Get global community impact statistics
 *     tags: [Impact]
 *     responses:
 *       200:
 *         description: Global impact statistics retrieved successfully
 */
router.get('/global', getGlobalImpact);

export default router;
