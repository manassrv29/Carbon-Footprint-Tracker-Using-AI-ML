import { Router } from 'express';
import mlController from '../controllers/mlController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RecommendationInput:
 *       type: object
 *       required:
 *         - commute_mode
 *         - distance_km
 *         - diet_type
 *         - energy_usage_kWh
 *       properties:
 *         commute_mode:
 *           type: string
 *           enum: [car, bus, bike, walk, train, EV]
 *           description: Mode of transportation
 *         distance_km:
 *           type: number
 *           minimum: 0
 *           maximum: 500
 *           description: Daily distance traveled in kilometers
 *         diet_type:
 *           type: string
 *           enum: [veg, non-veg, mixed]
 *           description: Type of diet
 *         energy_usage_kWh:
 *           type: number
 *           minimum: 0
 *           maximum: 2000
 *           description: Monthly energy usage in kWh
 *     
 *     RecommendationOutput:
 *       type: object
 *       properties:
 *         current_emission:
 *           type: number
 *           description: Current daily CO2 emission in kg
 *         green_score:
 *           type: number
 *           description: Green score out of 100
 *         recommendations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               commute_mode:
 *                 type: string
 *               diet_type:
 *                 type: string
 *               emission_saving:
 *                 type: number
 *               comfort_level:
 *                 type: string
 */

/**
 * @swagger
 * /api/ml/recommendations:
 *   post:
 *     summary: Get carbon footprint recommendations
 *     tags: [ML Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecommendationInput'
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RecommendationOutput'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/recommendations', mlController.getRecommendations.bind(mlController));

/**
 * @swagger
 * /api/ml/carbon-emission:
 *   post:
 *     summary: Predict carbon emission based on lifestyle factors
 *     tags: [ML Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body_type:
 *                 type: string
 *                 enum: [thin, average, overweight]
 *               sex:
 *                 type: string
 *                 enum: [male, female]
 *               diet:
 *                 type: string
 *                 enum: [omnivore, vegetarian, vegan]
 *               shower:
 *                 type: string
 *                 enum: [daily, weekly]
 *               heating:
 *                 type: string
 *                 enum: [gas, electric, solar, none]
 *               transport:
 *                 type: string
 *                 enum: [car, bus, train, walk/bicycle, none]
 *               vehicle:
 *                 type: string
 *                 enum: [none, petrol, diesel, ev]
 *               social:
 *                 type: string
 *                 enum: [low, medium, high]
 *               grocery:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 2000
 *               flight:
 *                 type: string
 *                 enum: [never, yearly, monthly]
 *               vehicle_distance:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5000
 *               waste_weekly:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 20
 *               tv_daily_hour:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *               clothes_monthly:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               internet_daily:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *               energy_eff:
 *                 type: string
 *                 enum: [Yes, No]
 *               recycling:
 *                 type: string
 *                 enum: [None, Basic, Full]
 *               cooking:
 *                 type: string
 *                 enum: [electric, gas, wood]
 *     responses:
 *       200:
 *         description: Carbon emission predicted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     emission:
 *                       type: number
 *                       description: Predicted carbon emission
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/carbon-emission', mlController.predictCarbonEmission.bind(mlController));

/**
 * @swagger
 * /api/ml/future-prediction:
 *   post:
 *     summary: Predict future carbon emissions
 *     tags: [ML Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body_type:
 *                 type: string
 *                 enum: [thin, average, overweight]
 *               sex:
 *                 type: string
 *                 enum: [male, female]
 *               diet:
 *                 type: string
 *                 enum: [omnivore, vegetarian, vegan]
 *               shower:
 *                 type: string
 *                 enum: [daily, weekly, rarely]
 *               heating:
 *                 type: string
 *                 enum: [gas, electric, solar, none]
 *               transport:
 *                 type: string
 *                 enum: [car, bus, train, walk/bicycle, none]
 *               vehicle_type:
 *                 type: string
 *                 enum: [none, petrol, diesel, ev]
 *               social_activity:
 *                 type: string
 *                 enum: [low, medium, high]
 *               monthly_grocery_bill:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 2000
 *               air_travel_frequency:
 *                 type: string
 *                 enum: [never, yearly, monthly]
 *               vehicle_monthly_distance:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5000
 *               waste_bag_weekly_count:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 20
 *               tv_pc_daily_hour:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *               new_clothes_monthly:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               internet_daily_hour:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *               energy_efficiency:
 *                 type: string
 *                 enum: [Yes, No]
 *               recycling:
 *                 type: string
 *                 enum: [None, Basic, Full]
 *               cooking_with:
 *                 type: string
 *                 enum: [electric, gas, wood]
 *               waste_bag_size:
 *                 type: string
 *                 enum: [small, medium, large]
 *     responses:
 *       200:
 *         description: Future emission predicted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     future_emission:
 *                       type: number
 *                       description: Predicted future carbon emission
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/future-prediction', mlController.predictFutureEmission.bind(mlController));

/**
 * @swagger
 * /api/ml/health:
 *   get:
 *     summary: Check ML service health
 *     tags: [ML Models]
 *     responses:
 *       200:
 *         description: Health check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 */
router.get('/health', mlController.healthCheck.bind(mlController));

/**
 * @swagger
 * /api/ml/models:
 *   get:
 *     summary: Get information about available ML models
 *     tags: [ML Models]
 *     responses:
 *       200:
 *         description: Model information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     models:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           inputs:
 *                             type: array
 *                             items:
 *                               type: string
 *                           outputs:
 *                             type: array
 *                             items:
 *                               type: string
 *                     version:
 *                       type: string
 *                     last_updated:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 */
router.get('/models', mlController.getModelInfo.bind(mlController));

/**
 * @swagger
 * /api/ml/history:
 *   get:
 *     summary: Get ML prediction history for the current user
 *     tags: [ML Models]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [recommendation, carbon_emission, future_prediction]
 *         description: Filter by prediction type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Prediction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     predictions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           predictionType:
 *                             type: string
 *                           inputData:
 *                             type: object
 *                           outputData:
 *                             type: object
 *                           userProfile:
 *                             type: object
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *                 message:
 *                   type: string
 */
router.get('/history', mlController.getPredictionHistory.bind(mlController));

export default router;
