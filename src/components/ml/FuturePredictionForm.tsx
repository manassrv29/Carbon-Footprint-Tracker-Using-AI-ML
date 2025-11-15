import React, { useState } from 'react';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import mlService from '../../services/mlService';
import type { FuturePredictionInput } from '../../services/mlService';

interface FuturePredictionFormProps {
  onResult?: (emission: number) => void;
}

const FuturePredictionForm: React.FC<FuturePredictionFormProps> = ({ onResult }) => {
  const [formData, setFormData] = useState<FuturePredictionInput>({
    body_type: 'average',
    sex: 'male',
    diet: 'omnivore',
    shower: 'daily',
    heating: 'gas',
    transport: 'car',
    vehicle_type: 'petrol',
    social_activity: 'medium',
    monthly_grocery_bill: 400,
    air_travel_frequency: 'never',
    vehicle_monthly_distance: 500,
    waste_bag_weekly_count: 3,
    tv_pc_daily_hour: 2,
    new_clothes_monthly: 5,
    internet_daily_hour: 4,
    energy_efficiency: 'No',
    recycling: 'None',
    cooking_with: 'gas',
    waste_bag_size: 'medium'
  });
  
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FuturePredictionInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await mlService.predictFutureEmission(formData);
      setResult(response.future_emission);
      onResult?.(response.future_emission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict future emission');
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (emission: number) => {
    if (emission < 2) return 'text-green-600';
    if (emission < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendBackground = (emission: number) => {
    if (emission < 2) return 'bg-green-100';
    if (emission < 5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="mx-auto p-4 lg:p-6 xl:p-8 bg-white rounded-lg shadow-lg desktop-card" style={{ maxWidth: '1400px' }}>
      <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
        <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800">Future Carbon Emission Prediction</h2>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">
          <Calendar className="w-4 h-4 inline mr-2" />
          This model predicts your future carbon emissions based on current lifestyle trends and consumption patterns.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demographics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body Type</label>
              <select
                value={formData.body_type}
                onChange={(e) => handleInputChange('body_type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="thin">Thin</option>
                <option value="average">Average</option>
                <option value="overweight">Overweight</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diet</label>
              <select
                value={formData.diet}
                onChange={(e) => handleInputChange('diet', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="omnivore">Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transportation & Travel */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transportation & Travel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Transport</label>
              <select
                value={formData.transport}
                onChange={(e) => handleInputChange('transport', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="car">Car</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="walk/bicycle">Walk/Bicycle</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => handleInputChange('vehicle_type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="ev">Electric Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Vehicle Distance (km)</label>
              <input
                type="number"
                min="0"
                max="5000"
                value={formData.vehicle_monthly_distance}
                onChange={(e) => handleInputChange('vehicle_monthly_distance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Air Travel Frequency</label>
              <select
                value={formData.air_travel_frequency}
                onChange={(e) => handleInputChange('air_travel_frequency', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="never">Never</option>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consumption Patterns */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Consumption Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Grocery Bill ($)</label>
              <input
                type="number"
                min="0"
                max="2000"
                value={formData.monthly_grocery_bill}
                onChange={(e) => handleInputChange('monthly_grocery_bill', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Clothes Monthly</label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.new_clothes_monthly}
                onChange={(e) => handleInputChange('new_clothes_monthly', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TV/PC Daily Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={formData.tv_pc_daily_hour}
                onChange={(e) => handleInputChange('tv_pc_daily_hour', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internet Daily Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={formData.internet_daily_hour}
                onChange={(e) => handleInputChange('internet_daily_hour', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Environmental Practices */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Energy Efficiency</label>
              <select
                value={formData.energy_efficiency}
                onChange={(e) => handleInputChange('energy_efficiency', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recycling Level</label>
              <select
                value={formData.recycling}
                onChange={(e) => handleInputChange('recycling', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="None">None</option>
                <option value="Basic">Basic</option>
                <option value="Full">Full</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Waste Bag Size</label>
              <select
                value={formData.waste_bag_size}
                onChange={(e) => handleInputChange('waste_bag_size', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Target className="w-5 h-5" />
          {loading ? 'Predicting...' : 'Predict Future Emissions'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result !== null && (
        <div className="mt-8">
          <div className={`p-6 rounded-lg ${getTrendBackground(result)}`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Future Carbon Emission Prediction
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {result.toFixed(2)} kg CO₂
                </p>
                <p className="text-sm text-gray-600">projected daily emission</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${getTrendColor(result)}`}>
                  {result < 2 ? 'Sustainable' : result < 5 ? 'Moderate' : 'High Impact'}
                </p>
                <p className="text-xs text-gray-500">future trend</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded">
              <p className="text-sm text-gray-700">
                💡 <strong>Tip:</strong> This prediction is based on your current lifestyle patterns. 
                Making sustainable choices today can significantly improve your future carbon footprint.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuturePredictionForm;
