import { Router } from 'express';
import { 
  getChallenges, 
  getChallengeById, 
  joinChallenge, 
  leaveChallenge, 
  getUserChallenges, 
  updateChallengeProgress 
} from '../controllers/challengeController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { paginationSchema } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/challenges:
 *   get:
 *     summary: Get all challenges
 *     tags: [Challenges]
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
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, upcoming, completed]
 *           default: active
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully
 */
router.get('/', optionalAuth, validateQuery(paginationSchema), getChallenges);

/**
 * @swagger
 * /api/challenges/{id}:
 *   get:
 *     summary: Get a specific challenge by ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Challenge retrieved successfully
 *       404:
 *         description: Challenge not found
 */
router.get('/:id', optionalAuth, getChallengeById);

/**
 * @swagger
 * /api/challenges/{id}/join:
 *   post:
 *     summary: Join a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Successfully joined challenge
 *       400:
 *         description: Challenge not active
 *       409:
 *         description: Already participating
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/join', authenticateToken, joinChallenge);

/**
 * @swagger
 * /api/challenges/{id}/leave:
 *   delete:
 *     summary: Leave a challenge
 *     tags: [Challenges]
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
 *         description: Successfully left challenge
 *       404:
 *         description: Not participating in challenge
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/leave', authenticateToken, leaveChallenge);

/**
 * @swagger
 * /api/challenges/my:
 *   get:
 *     summary: Get user's challenges
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed]
 *           default: active
 *     responses:
 *       200:
 *         description: User challenges retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my/challenges', authenticateToken, getUserChallenges);

/**
 * @swagger
 * /api/challenges/{id}/progress:
 *   put:
 *     summary: Update challenge progress
 *     tags: [Challenges]
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
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: number
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       404:
 *         description: Not participating in challenge
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/progress', authenticateToken, updateChallengeProgress);

export default router;
