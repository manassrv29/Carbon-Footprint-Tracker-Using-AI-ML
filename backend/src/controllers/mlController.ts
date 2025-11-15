import { Request, Response } from 'express';
import mlService, { RecommendationInput, CarbonEmissionInput, FuturePredictionInput } from '../services/mlService';
import Joi from 'joi';
import { MLPrediction } from '../models';

// Validation schemas
const recommendationSchema = Joi.object({
  commute_mode: Joi.string().valid('car', 'bus', 'bike', 'walk', 'train', 'EV').required(),
  distance_km: Joi.number().min(0).max(500).required(),
  diet_type: Joi.string().valid('veg', 'non-veg', 'mixed').required(),
  energy_usage_kWh: Joi.number().min(0).max(2000).required()
});

const carbonEmissionSchema = Joi.object({
  body_type: Joi.string().valid('thin', 'average', 'overweight').default('average'),
  sex: Joi.string().valid('male', 'female').default('male'),
  diet: Joi.string().valid('omnivore', 'vegetarian', 'vegan').default('omnivore'),
  shower: Joi.string().valid('daily', 'weekly').default('daily'),
  heating: Joi.string().valid('gas', 'electric', 'solar', 'none').default('gas'),
  transport: Joi.string().valid('car', 'bus', 'train', 'walk/bicycle', 'none').default('car'),
  vehicle: Joi.string().valid('none', 'petrol', 'diesel', 'ev').default('petrol'),
  social: Joi.string().valid('low', 'medium', 'high').default('medium'),
  grocery: Joi.number().min(0).max(2000).default(400),
  flight: Joi.string().valid('never', 'yearly', 'monthly').default('never'),
  vehicle_distance: Joi.number().min(0).max(5000).default(500),
  waste_weekly: Joi.number().min(0).max(20).default(3),
  tv_daily_hour: Joi.number().min(0).max(24).default(2),
  clothes_monthly: Joi.number().min(0).max(50).default(5),
  internet_daily: Joi.number().min(0).max(24).default(4),
  energy_eff: Joi.string().valid('Yes', 'No').default('No'),
  recycling: Joi.string().valid('None', 'Basic', 'Full').default('None'),
  cooking: Joi.string().valid('electric', 'gas', 'wood').default('gas')
});

const futurePredictionSchema = Joi.object({
  body_type: Joi.string().valid('thin', 'average', 'overweight').default('average'),
  sex: Joi.string().valid('male', 'female').default('male'),
  diet: Joi.string().valid('omnivore', 'vegetarian', 'vegan').default('omnivore'),
  shower: Joi.string().valid('daily', 'weekly', 'rarely').default('daily'),
  heating: Joi.string().valid('gas', 'electric', 'solar', 'none').default('gas'),
  transport: Joi.string().valid('car', 'bus', 'train', 'walk/bicycle', 'none').default('car'),
  vehicle_type: Joi.string().valid('none', 'petrol', 'diesel', 'ev').default('petrol'),
  social_activity: Joi.string().valid('low', 'medium', 'high').default('medium'),
  monthly_grocery_bill: Joi.number().min(0).max(2000).default(400),
  air_travel_frequency: Joi.string().valid('never', 'yearly', 'monthly').default('never'),
  vehicle_monthly_distance: Joi.number().min(0).max(5000).default(500),
  waste_bag_weekly_count: Joi.number().min(0).max(20).default(3),
  tv_pc_daily_hour: Joi.number().min(0).max(24).default(2),
  new_clothes_monthly: Joi.number().min(0).max(50).default(5),
  internet_daily_hour: Joi.number().min(0).max(24).default(4),
  energy_efficiency: Joi.string().valid('Yes', 'No').default('No'),
  recycling: Joi.string().valid('None', 'Basic', 'Full').default('None'),
  cooking_with: Joi.string().valid('electric', 'gas', 'wood').default('gas'),
  waste_bag_size: Joi.string().valid('small', 'medium', 'large').default('medium')
});

export class MLController {
  /**
   * Helper function to save ML prediction to database
   */
  private async savePrediction(
    userId: number,
    predictionType: 'recommendation' | 'carbon_emission' | 'future_prediction',
    inputData: any,
    outputData: any,
    userProfile?: any
  ): Promise<void> {
    try {
      await MLPrediction.create({
        userId,
        predictionType,
        inputData,
        outputData,
        userProfile,
      });
    } catch (error) {
      console.error('Error saving ML prediction:', error);
      // Don't throw error - prediction saving failure shouldn't break the response
    }
  }

  /**
   * Get carbon footprint recommendations
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = recommendationSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.details?.[0]?.message || 'Invalid input data'
        });
        return;
      }

      const input: RecommendationInput = value;
      const result = await mlService.getRecommendations(input);

      // Save prediction to database (extract userId from request - you may need to add auth middleware)
      const userId = (req as any).user?.id || 1; // Default to user ID 1 for demo
      await this.savePrediction(userId, 'recommendation', input, result, result.user_profile);

      res.json({
        success: true,
        data: result,
        message: 'Recommendations generated successfully'
      });
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Predict carbon emission
   */
  async predictCarbonEmission(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = carbonEmissionSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.details?.[0]?.message || 'Invalid input data'
        });
        return;
      }

      const input: CarbonEmissionInput = value;
      const result = await mlService.predictCarbonEmission(input);

      // Save prediction to database
      const userId = (req as any).user?.id || 1; // Default to user ID 1 for demo
      await this.savePrediction(userId, 'carbon_emission', input, result);

      res.json({
        success: true,
        data: result,
        message: 'Carbon emission predicted successfully'
      });
    } catch (error) {
      console.error('Error in predictCarbonEmission:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Predict future carbon emission
   */
  async predictFutureEmission(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = futurePredictionSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.details?.[0]?.message || 'Invalid input data'
        });
        return;
      }

      const input: FuturePredictionInput = value;
      const result = await mlService.predictFutureEmission(input);

      // Save prediction to database
      const userId = (req as any).user?.id || 1; // Default to user ID 1 for demo
      await this.savePrediction(userId, 'future_prediction', input, result);

      res.json({
        success: true,
        data: result,
        message: 'Future emission predicted successfully'
      });
    } catch (error) {
      console.error('Error in predictFutureEmission:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Health check for ML service
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await mlService.healthCheck();
      
      res.json({
        success: true,
        data: {
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString()
        },
        message: isHealthy ? 'ML service is healthy' : 'ML service has issues'
      });
    } catch (error) {
      console.error('Error in ML health check:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get ML prediction history for a user
   */
  async getPredictionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || 1; // Default to user ID 1 for demo
      const { type, limit = 10, offset = 0 } = req.query;

      const whereClause: any = { userId };
      if (type && ['recommendation', 'carbon_emission', 'future_prediction'].includes(type as string)) {
        whereClause.predictionType = type;
      }

      const predictions = await MLPrediction.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      const total = await MLPrediction.count({ where: whereClause });

      res.json({
        success: true,
        data: {
          predictions,
          pagination: {
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            hasMore: total > parseInt(offset as string) + parseInt(limit as string)
          }
        },
        message: 'Prediction history retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getPredictionHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve prediction history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get information about available ML models
   */
  async getModelInfo(req: Request, res: Response): Promise<void> {
    try {
      const modelInfo = {
        models: [
          {
            name: 'recommendation_model_v2',
            type: 'TensorFlow Lite',
            description: 'Provides carbon footprint recommendations based on lifestyle choices',
            inputs: ['commute_mode', 'distance_km', 'diet_type', 'energy_usage_kWh'],
            outputs: ['current_emission', 'green_score', 'recommendations']
          },
          {
            name: 'carbonemission_surrogate',
            type: 'TensorFlow Lite',
            description: 'Predicts carbon emission based on detailed lifestyle factors',
            inputs: ['body_type', 'sex', 'diet', 'transport', 'energy_usage', 'etc'],
            outputs: ['emission']
          },
          {
            name: 'future_prediction',
            type: 'TensorFlow Lite',
            description: 'Predicts future carbon emissions based on current trends',
            inputs: ['lifestyle_factors', 'consumption_patterns', 'etc'],
            outputs: ['future_emission']
          }
        ],
        version: '1.0.0',
        last_updated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: modelInfo,
        message: 'Model information retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getModelInfo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve model information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new MLController();
