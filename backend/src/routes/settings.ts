import { Router } from 'express';
import { getUserSettings, updateUserSettings, resetUserSettings } from '../controllers/settingsController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { settingsSchema } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings and preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getUserSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user settings and preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *                   weekly_reports:
 *                     type: boolean
 *                   achievements:
 *                     type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   profile_visibility:
 *                     type: string
 *                     enum: [public, private, friends]
 *                   leaderboard_participation:
 *                     type: boolean
 *                   data_sharing:
 *                     type: boolean
 *               auto_tracking:
 *                 type: object
 *                 properties:
 *                   gps_enabled:
 *                     type: boolean
 *                   ocr_enabled:
 *                     type: boolean
 *                   barcode_enabled:
 *                     type: boolean
 *               targets:
 *                 type: object
 *                 properties:
 *                   daily_co2_limit:
 *                     type: number
 *                   weekly_reduction_goal:
 *                     type: number
 *                   monthly_target:
 *                     type: number
 *               preferences:
 *                 type: object
 *                 properties:
 *                   theme:
 *                     type: string
 *                     enum: [light, dark, auto]
 *                   language:
 *                     type: string
 *                   currency:
 *                     type: string
 *                   units:
 *                     type: string
 *                     enum: [metric, imperial]
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/', authenticateToken, validateRequest(settingsSchema), updateUserSettings);

/**
 * @swagger
 * /api/settings/reset:
 *   post:
 *     summary: Reset user settings to defaults
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings reset successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/reset', authenticateToken, resetUserSettings);

export default router;
