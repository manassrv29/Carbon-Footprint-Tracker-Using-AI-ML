import { Router } from 'express';
import { getWeeklyReport, getMonthlyReport } from '../controllers/reportsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/reports/weekly:
 *   get:
 *     summary: Get weekly carbon footprint report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the week (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Weekly report retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/weekly', authenticateToken, getWeeklyReport);

/**
 * @swagger
 * /api/reports/monthly:
 *   get:
 *     summary: Get monthly carbon footprint report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month number (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2025)
 *     responses:
 *       200:
 *         description: Monthly report retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/monthly', authenticateToken, getMonthlyReport);

export default router;
