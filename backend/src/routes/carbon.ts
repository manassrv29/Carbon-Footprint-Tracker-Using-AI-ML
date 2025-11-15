import { Router } from 'express';
import { 
  createCarbonLog, 
  getCarbonLogs, 
  getCarbonLogById, 
  updateCarbonLog, 
  deleteCarbonLog, 
  getCarbonStats 
} from '../controllers/carbonController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { carbonLogSchema, paginationSchema } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/carbon/logs:
 *   post:
 *     summary: Create a new carbon log entry
 *     tags: [Carbon Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - activityType
 *               - value
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [transport, food, energy, other]
 *               activityType:
 *                 type: string
 *               value:
 *                 type: number
 *               source:
 *                 type: string
 *                 enum: [manual, gps, ocr, api]
 *               metadata:
 *                 type: object
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Carbon log created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logs', authenticateToken, validateRequest(carbonLogSchema), createCarbonLog);

/**
 * @swagger
 * /api/carbon/logs:
 *   get:
 *     summary: Get user's carbon logs
 *     tags: [Carbon Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [transport, food, energy, other]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Carbon logs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/logs', authenticateToken, validateQuery(paginationSchema), getCarbonLogs);

/**
 * @swagger
 * /api/carbon/logs/{id}:
 *   get:
 *     summary: Get a specific carbon log by ID
 *     tags: [Carbon Logs]
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
 *         description: Carbon log retrieved successfully
 *       404:
 *         description: Carbon log not found
 *       401:
 *         description: Unauthorized
 */
router.get('/logs/:id', authenticateToken, getCarbonLogById);

/**
 * @swagger
 * /api/carbon/logs/{id}:
 *   put:
 *     summary: Update a carbon log entry
 *     tags: [Carbon Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [transport, food, energy, other]
 *               activityType:
 *                 type: string
 *               value:
 *                 type: number
 *               metadata:
 *                 type: object
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Carbon log updated successfully
 *       404:
 *         description: Carbon log not found
 *       401:
 *         description: Unauthorized
 */
router.put('/logs/:id', authenticateToken, updateCarbonLog);

/**
 * @swagger
 * /api/carbon/logs/{id}:
 *   delete:
 *     summary: Delete a carbon log entry
 *     tags: [Carbon Logs]
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
 *         description: Carbon log deleted successfully
 *       404:
 *         description: Carbon log not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/logs/:id', authenticateToken, deleteCarbonLog);

/**
 * @swagger
 * /api/carbon/stats:
 *   get:
 *     summary: Get carbon statistics for user
 *     tags: [Carbon Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include in statistics
 *     responses:
 *       200:
 *         description: Carbon statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticateToken, getCarbonStats);


/**
 * @swagger
 * /api/carbon/export:
 *   get:
 *     summary: Export user's carbon data
 *     tags: [Carbon Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json, pdf]
 *           default: csv
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Data exported successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/export', authenticateToken, getCarbonLogs);

export default router;
