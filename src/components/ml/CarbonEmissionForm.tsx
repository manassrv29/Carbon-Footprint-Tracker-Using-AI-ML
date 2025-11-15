import React, { useState } from 'react';
import { BarChart3, Zap, Home } from 'lucide-react';
import mlService from '../../services/mlService';
import type { CarbonEmissionInput } from '../../services/mlService';

interface CarbonEmissionFormProps {
  onResult?: (emission: number) => void;
}

const CarbonEmissionForm: React.FC<CarbonEmissionFormProps> = ({ onResult }) => {
  const [formData, setFormData] = useState<CarbonEmissionInput>({
    body_type: 'average',
    sex: 'male',
    diet: 'omnivore',
    shower: 'daily',
    heating: 'gas',
    transport: 'car',
    vehicle: 'petrol',
    social: 'medium',
    grocery: 400,
    flight: 'never',
    vehicle_distance: 500,
    waste_weekly: 3,
    tv_daily_hour: 2,
    clothes_monthly: 5,
    internet_daily: 4,
    energy_eff: 'No',
    recycling: 'None',
    cooking: 'gas'
  });
  
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CarbonEmissionInput, value: string | number) => {
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
      const response = await mlService.predictCarbonEmission(formData);
      setResult(response.emission);
      onResult?.(response.emission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict carbon emission');
    } finally {
      setLoading(false);
    }
  };

  const getEmissionLevel = (emission: number) => {
    if (emission < 2) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (emission < 5) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="mx-auto p-4 lg:p-6 xl:p-8 bg-white rounded-lg shadow-lg desktop-card" style={{ maxWidth: '1400px' }}>
      <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
        <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800">Carbon Emission Prediction</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
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

        {/* Transportation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transportation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
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
                value={formData.vehicle}
                onChange={(e) => handleInputChange('vehicle', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="ev">Electric Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Distance (km/month)</label>
              <input
                type="number"
                min="0"
                max="5000"
                value={formData.vehicle_distance}
                onChange={(e) => handleInputChange('vehicle_distance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Home & Energy */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Home & Energy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heating Source</label>
              <select
                value={formData.heating}
                onChange={(e) => handleInputChange('heating', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gas">Gas</option>
                <option value="electric">Electric</option>
                <option value="solar">Solar</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Method</label>
              <select
                value={formData.cooking}
                onChange={(e) => handleInputChange('cooking', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="electric">Electric</option>
                <option value="gas">Gas</option>
                <option value="wood">Wood</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Energy Efficient</label>
              <select
                value={formData.energy_eff}
                onChange={(e) => handleInputChange('energy_eff', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lifestyle</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Grocery ($)</label>
              <input
                type="number"
                min="0"
                max="2000"
                value={formData.grocery}
                onChange={(e) => handleInputChange('grocery', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TV/PC Daily Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={formData.tv_daily_hour}
                onChange={(e) => handleInputChange('tv_daily_hour', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internet Daily Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={formData.internet_daily}
                onChange={(e) => handleInputChange('internet_daily', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Zap className="w-5 h-5" />
          {loading ? 'Calculating...' : 'Predict Carbon Emission'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result !== null && (
        <div className="mt-8">
          <div className={`p-6 rounded-lg ${getEmissionLevel(result).bg}`}>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Predicted Carbon Emission</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {result.toFixed(2)} kg CO₂
                </p>
                <p className="text-sm text-gray-600">per day</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${getEmissionLevel(result).color}`}>
                  {getEmissionLevel(result).level} Impact
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonEmissionForm;
