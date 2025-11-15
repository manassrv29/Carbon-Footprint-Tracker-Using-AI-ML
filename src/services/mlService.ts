const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface RecommendationInput {
  commute_mode: 'car' | 'bus' | 'bike' | 'walk' | 'train' | 'EV';
  distance_km: number;
  diet_type: 'veg' | 'non-veg' | 'mixed';
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
  body_type?: 'thin' | 'average' | 'overweight';
  sex?: 'male' | 'female';
  diet?: 'omnivore' | 'vegetarian' | 'vegan';
  shower?: 'daily' | 'weekly';
  heating?: 'gas' | 'electric' | 'solar' | 'none';
  transport?: 'car' | 'bus' | 'train' | 'walk/bicycle' | 'none';
  vehicle?: 'none' | 'petrol' | 'diesel' | 'ev';
  social?: 'low' | 'medium' | 'high';
  grocery?: number;
  flight?: 'never' | 'yearly' | 'monthly';
  vehicle_distance?: number;
  waste_weekly?: number;
  tv_daily_hour?: number;
  clothes_monthly?: number;
  internet_daily?: number;
  energy_eff?: 'Yes' | 'No';
  recycling?: 'None' | 'Basic' | 'Full';
  cooking?: 'electric' | 'gas' | 'wood';
}

export interface FuturePredictionInput {
  body_type?: 'thin' | 'average' | 'overweight';
  sex?: 'male' | 'female';
  diet?: 'omnivore' | 'vegetarian' | 'vegan';
  shower?: 'daily' | 'weekly' | 'rarely';
  heating?: 'gas' | 'electric' | 'solar' | 'none';
  transport?: 'car' | 'bus' | 'train' | 'walk/bicycle' | 'none';
  vehicle_type?: 'none' | 'petrol' | 'diesel' | 'ev';
  social_activity?: 'low' | 'medium' | 'high';
  monthly_grocery_bill?: number;
  air_travel_frequency?: 'never' | 'yearly' | 'monthly';
  vehicle_monthly_distance?: number;
  waste_bag_weekly_count?: number;
  tv_pc_daily_hour?: number;
  new_clothes_monthly?: number;
  internet_daily_hour?: number;
  energy_efficiency?: 'Yes' | 'No';
  recycling?: 'None' | 'Basic' | 'Full';
  cooking_with?: 'electric' | 'gas' | 'wood';
  waste_bag_size?: 'small' | 'medium' | 'large';
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

class MLService {
  private async makeRequest<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE_URL}/ml${endpoint}`;
    
    const options: RequestInit = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || result.message || 'API request failed');
      }

      return result.data;
    } catch (error) {
      console.error(`ML API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get carbon footprint recommendations
   */
  async getRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
    return this.makeRequest<RecommendationOutput>('/recommendations', input);
  }

  /**
   * Predict carbon emission based on lifestyle factors
   */
  async predictCarbonEmission(input: CarbonEmissionInput): Promise<{ emission: number }> {
    return this.makeRequest<{ emission: number }>('/carbon-emission', input);
  }

  /**
   * Predict future carbon emissions
   */
  async predictFutureEmission(input: FuturePredictionInput): Promise<{ future_emission: number }> {
    return this.makeRequest<{ future_emission: number }>('/future-prediction', input);
  }

  /**
   * Check ML service health
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }

  /**
   * Get information about available ML models
   */
  async getModelInfo(): Promise<{
    models: Array<{
      name: string;
      type: string;
      description: string;
      inputs: string[];
      outputs: string[];
    }>;
    version: string;
    last_updated: string;
  }> {
    return this.makeRequest('/models');
  }
}

export default new MLService();
