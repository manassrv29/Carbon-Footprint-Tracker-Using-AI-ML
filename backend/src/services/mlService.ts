import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface RecommendationInput {
  commute_mode: string;
  distance_km: number;
  diet_type: string;
  energy_usage_kWh: number;
}

export interface RecommendationOutput {
  current_emission: number;
  green_score: number;
  user_profile: {
    mobility_type: string;
    energy_profile: string;
    eco_awareness: string;
    eco_score: number;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    impact: string;
    difficulty: string;
    co2_saving: number;
    implementation: string;
  }>;
  personalization_note: string;
}

export interface CarbonEmissionInput {
  body_type: string;
  sex: string;
  diet: string;
  shower: string;
  heating: string;
  transport: string;
  vehicle: string;
  social: string;
  grocery: number;
  flight: string;
  vehicle_distance: number;
  waste_weekly: number;
  tv_daily_hour: number;
  clothes_monthly: number;
  internet_daily: number;
  energy_eff: string;
  recycling: string;
  cooking: string;
}

export interface FuturePredictionInput {
  body_type: string;
  sex: string;
  diet: string;
  shower: string;
  heating: string;
  transport: string;
  vehicle_type: string;
  social_activity: string;
  monthly_grocery_bill: number;
  air_travel_frequency: string;
  vehicle_monthly_distance: number;
  waste_bag_weekly_count: number;
  tv_pc_daily_hour: number;
  new_clothes_monthly: number;
  internet_daily_hour: number;
  energy_efficiency: string;
  recycling: string;
  cooking_with: string;
  waste_bag_size: string;
}

class MLService {
  private mlModelsPath: string;
  private pythonScriptPath: string;

  constructor() {
    this.mlModelsPath = path.join(__dirname, '../ml_models');
    this.pythonScriptPath = path.join(__dirname, '../../scripts');
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.pythonScriptPath)) {
      fs.mkdirSync(this.pythonScriptPath, { recursive: true });
    }
  }

  private async runPythonScript(scriptName: string, input: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.pythonScriptPath, scriptName);
      const python = spawn('python3', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        } else {
          try {
            const result = JSON.parse(stdout.trim());
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Python script output: ${stdout}`));
          }
        }
      });

      // Send input data to Python script
      python.stdin.write(JSON.stringify(input));
      python.stdin.end();
    });
  }

  async getRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
    try {
      const result = await this.runPythonScript('enhanced_recommendation_inference.py', input);
      return result;
    } catch (error) {
      console.error('Error in recommendation inference:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  async predictCarbonEmission(input: CarbonEmissionInput): Promise<{ emission: number }> {
    try {
      const result = await this.runPythonScript('carbon_inference.py', input);
      return result;
    } catch (error) {
      console.error('Error in carbon emission prediction:', error);
      throw new Error('Failed to predict carbon emission');
    }
  }

  async predictFutureEmission(input: FuturePredictionInput): Promise<{ future_emission: number }> {
    try {
      const result = await this.runPythonScript('future_inference.py', input);
      return result;
    } catch (error) {
      console.error('Error in future emission prediction:', error);
      throw new Error('Failed to predict future emission');
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      // Check if TFLite models exist
      const models = [
        'recommendation_model_v2.tflite',
        'carbonemission_surrogate.tflite',
        'future_prediction.tflite'
      ];

      for (const model of models) {
        const modelPath = path.join(this.mlModelsPath, model);
        if (!fs.existsSync(modelPath)) {
          console.error(`Model not found: ${modelPath}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('ML Service health check failed:', error);
      return false;
    }
  }
}

export default new MLService();
