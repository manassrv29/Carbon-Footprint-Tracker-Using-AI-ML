import React, { useState } from 'react';
import { Lightbulb, Calculator, Leaf } from 'lucide-react';
import mlService from '../../services/mlService';
import type { RecommendationInput, RecommendationOutput } from '../../services/mlService';

interface RecommendationFormProps {
  onResult?: (result: RecommendationOutput) => void;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ onResult }) => {
  const [formData, setFormData] = useState<RecommendationInput>({
    commute_mode: 'car',
    distance_km: 10,
    diet_type: 'mixed',
    energy_usage_kWh: 300
  });
  
  const [result, setResult] = useState<RecommendationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof RecommendationInput, value: string | number) => {
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
      const recommendations = await mlService.getRecommendations(formData);
      setResult(recommendations);
      onResult?.(recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="mx-auto p-4 lg:p-6 xl:p-8 bg-white rounded-lg shadow-lg" style={{ maxWidth: '1400px' }}>
      <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
        <Lightbulb className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800">Carbon Footprint Recommendations</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Commute Mode */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
              Commute Mode
            </label>
            <select
              value={formData.commute_mode}
              onChange={(e) => handleInputChange('commute_mode', e.target.value as any)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
            >
              <option value="car">Car</option>
              <option value="bus">Bus</option>
              <option value="bike">Bike</option>
              <option value="walk">Walk</option>
              <option value="train">Train</option>
              <option value="EV">Electric Vehicle</option>
            </select>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
              Daily Distance (km)
            </label>
            <input
              type="number"
              min="0"
              max="500"
              value={formData.distance_km}
              onChange={(e) => handleInputChange('distance_km', parseFloat(e.target.value) || 0)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
            />
          </div>

          {/* Diet Type */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
              Diet Type
            </label>
            <select
              value={formData.diet_type}
              onChange={(e) => handleInputChange('diet_type', e.target.value as any)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
            >
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Energy Usage */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
              Monthly Energy Usage (kWh)
            </label>
            <input
              type="number"
              min="0"
              max="2000"
              value={formData.energy_usage_kWh}
              onChange={(e) => handleInputChange('energy_usage_kWh', parseFloat(e.target.value) || 0)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full lg:w-auto lg:mx-auto flex items-center justify-center gap-2 lg:gap-3 bg-blue-600 text-white py-3 lg:py-4 px-6 lg:px-8 text-base lg:text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg transform hover:scale-105"
        >
          <Calculator className="w-5 h-5 lg:w-6 lg:h-6" />
          {loading ? 'Analyzing...' : 'Get Recommendations'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 lg:mt-12 space-y-6 lg:space-y-8">
          {/* Current Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-gray-50 p-4 lg:p-6 xl:p-8 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800 mb-2 lg:mb-3">Current Emission</h3>
              <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
                {result.current_emission} kg CO₂/day
              </p>
            </div>
            
            <div className={`p-4 lg:p-6 xl:p-8 rounded-lg hover:opacity-90 transition-all ${getScoreBackground(result.green_score)}`}>
              <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800 mb-2 lg:mb-3">Green Score</h3>
              <p className={`text-2xl lg:text-3xl xl:text-4xl font-bold ${getScoreColor(result.green_score)}`}>
                {result.green_score}/100
              </p>
            </div>
          </div>

          {/* User Profile */}
          {result.user_profile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6 xl:p-8 mb-6 lg:mb-8">
              <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800 mb-3 lg:mb-4">Your Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 text-sm lg:text-base">
                <div>
                  <span className="font-medium text-gray-700">Mobility Type:</span>
                  <p className="text-blue-700 capitalize">{result.user_profile.mobility_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Energy Profile:</span>
                  <p className="text-blue-700 capitalize">{result.user_profile.energy_profile.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Eco Awareness:</span>
                  <p className="text-blue-700 capitalize">{result.user_profile.eco_awareness}</p>
                </div>
              </div>
              {result.personalization_note && (
                <p className="text-sm text-blue-600 mt-2 italic">{result.personalization_note}</p>
              )}
            </div>
          )}

          {/* Enhanced Recommendations */}
          {result.recommendations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Personalized Recommendations
              </h3>
              
              <div className="space-y-4">
                {result.recommendations.map((rec, index) => {
                  const getTypeColor = (type: string) => {
                    switch (type) {
                      case 'transport': return 'bg-blue-50 border-blue-200 text-blue-800';
                      case 'energy': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
                      case 'diet': return 'bg-green-50 border-green-200 text-green-800';
                      case 'lifestyle': return 'bg-purple-50 border-purple-200 text-purple-800';
                      default: return 'bg-gray-50 border-gray-200 text-gray-800';
                    }
                  };

                  const getImpactColor = (impact: string) => {
                    switch (impact) {
                      case 'Very High': return 'text-red-600 bg-red-100';
                      case 'High': return 'text-orange-600 bg-orange-100';
                      case 'Medium': return 'text-yellow-600 bg-yellow-100';
                      case 'Low': return 'text-green-600 bg-green-100';
                      default: return 'text-gray-600 bg-gray-100';
                    }
                  };

                  const getDifficultyColor = (difficulty: string) => {
                    switch (difficulty) {
                      case 'Easy': return 'text-green-600 bg-green-100';
                      case 'Medium': return 'text-yellow-600 bg-yellow-100';
                      case 'High': return 'text-red-600 bg-red-100';
                      default: return 'text-gray-600 bg-gray-100';
                    }
                  };

                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(rec.type)}`}>
                            {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                          </span>
                          <h4 className="text-lg font-semibold text-gray-800">{rec.title}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            -{rec.co2_saving.toFixed(2)} kg CO₂
                          </p>
                          <p className="text-xs text-gray-500">potential saving</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{rec.description}</p>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(rec.impact)}`}>
                          Impact: {rec.impact}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                          Difficulty: {rec.difficulty}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">How to implement:</span> {rec.implementation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.recommendations.length === 0 && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                🏆 Excellent! You're already following a low-carbon lifestyle!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationForm;
