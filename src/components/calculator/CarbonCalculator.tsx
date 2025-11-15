import { useState } from 'react';
import { Car, Utensils, Zap, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { calculateEmission, calculateEcoPoints, formatCO2 } from '../../utils/emissions';
import { saveCarbonLog, getUserStats, updateUserStats } from '../../utils/storage';
import type { CarbonLog } from '../../types';

export function CarbonCalculator() {
  const [activeTab, setActiveTab] = useState<'transport' | 'food' | 'energy'>('transport');
  const [transportData, setTransportData] = useState({
    type: 'car_petrol',
    distance: ''
  });
  const [foodData, setFoodData] = useState({
    type: 'chicken',
    meals: ''
  });
  const [energyData, setEnergyData] = useState({
    type: 'electricity',
    usage: ''
  });

  const tabs = [
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'food', label: 'Food & Diet', icon: Utensils },
    { id: 'energy', label: 'Energy', icon: Zap }
  ];

  const transportTypes = [
    { value: 'car_petrol', label: 'Petrol Car' },
    { value: 'car_diesel', label: 'Diesel Car' },
    { value: 'car_electric', label: 'Electric Car' },
    { value: 'car_hybrid', label: 'Hybrid Car' },
    { value: 'bus', label: 'Bus' },
    { value: 'train', label: 'Train' },
    { value: 'subway', label: 'Subway/Metro' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'walking', label: 'Walking' },
    { value: 'motorcycle', label: 'Motorcycle' }
  ];

  const foodTypes = [
    { value: 'beef', label: 'Beef' },
    { value: 'lamb', label: 'Lamb' },
    { value: 'pork', label: 'Pork' },
    { value: 'chicken', label: 'Chicken' },
    { value: 'fish', label: 'Fish' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'processed', label: 'Processed Food' }
  ];

  const energyTypes = [
    { value: 'electricity', label: 'Grid Electricity' },
    { value: 'natural_gas', label: 'Natural Gas' },
    { value: 'heating_oil', label: 'Heating Oil' },
    { value: 'renewable', label: 'Renewable Energy' }
  ];

  const calculateCurrentEmission = () => {
    switch (activeTab) {
      case 'transport':
        return transportData.distance ? calculateEmission('transport', transportData.type, parseFloat(transportData.distance)) : 0;
      case 'food':
        return foodData.meals ? calculateEmission('food', foodData.type, parseFloat(foodData.meals)) : 0;
      case 'energy':
        return energyData.usage ? calculateEmission('energy', energyData.type, parseFloat(energyData.usage)) : 0;
      default:
        return 0;
    }
  };

  const handleSave = () => {
    const emission = calculateCurrentEmission();
    if (emission <= 0) return;

    let log: CarbonLog;
    let activityType: string;
    let value: number;

    switch (activeTab) {
      case 'transport':
        activityType = transportData.type;
        value = parseFloat(transportData.distance);
        break;
      case 'food':
        activityType = foodData.type;
        value = parseFloat(foodData.meals);
        break;
      case 'energy':
        activityType = energyData.type;
        value = parseFloat(energyData.usage);
        break;
    }

    log = {
      id: Date.now().toString(),
      category: activeTab,
      activityType,
      value,
      co2Kg: emission,
      timestamp: new Date(),
      source: 'manual'
    };

    saveCarbonLog(log);

    // Update user stats
    const currentStats = getUserStats();
    const ecoPoints = calculateEcoPoints(emission);
    updateUserStats({
      ecoPoints: currentStats.ecoPoints + ecoPoints
    });

    // Reset form
    switch (activeTab) {
      case 'transport':
        setTransportData({ ...transportData, distance: '' });
        break;
      case 'food':
        setFoodData({ ...foodData, meals: '' });
        break;
      case 'energy':
        setEnergyData({ ...energyData, usage: '' });
        break;
    }

    alert(`Activity logged! +${ecoPoints} eco points earned!`);
  };

  const currentEmission = calculateCurrentEmission();

  return (
    <section id="calculator" className="py-16 bg-muted-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Carbon Calculator</h2>
          <p className="text-muted-600 max-w-2xl mx-auto">
            Track your daily carbon footprint across transport, food, and energy consumption. 
            Get real-time feedback and earn eco-points for logging your activities.
          </p>
        </div>

        <Card>
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b border-muted-200 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-muted-600 hover:text-primary-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Transport Tab */}
          {activeTab === 'transport' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Type
                </label>
                <select
                  value={transportData.type}
                  onChange={(e) => setTransportData({ ...transportData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {transportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (km)
                </label>
                <input
                  type="number"
                  value={transportData.distance}
                  onChange={(e) => setTransportData({ ...transportData, distance: e.target.value })}
                  placeholder="Enter distance in kilometers"
                  className="w-full px-3 py-2 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Food Tab */}
          {activeTab === 'food' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  value={foodData.type}
                  onChange={(e) => setFoodData({ ...foodData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {foodTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Meals
                </label>
                <input
                  type="number"
                  value={foodData.meals}
                  onChange={(e) => setFoodData({ ...foodData, meals: e.target.value })}
                  placeholder="Enter number of meals"
                  className="w-full px-3 py-2 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Energy Tab */}
          {activeTab === 'energy' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Type
                </label>
                <select
                  value={energyData.type}
                  onChange={(e) => setEnergyData({ ...energyData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {energyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage (kWh)
                </label>
                <input
                  type="number"
                  value={energyData.usage}
                  onChange={(e) => setEnergyData({ ...energyData, usage: e.target.value })}
                  placeholder="Enter energy usage in kWh"
                  className="w-full px-3 py-2 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Results and Save */}
          <div className="mt-8 pt-6 border-t border-muted-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCO2(currentEmission)}
                </div>
                <div className="text-sm text-muted-600">
                  Carbon footprint for this activity
                </div>
                {currentEmission > 0 && (
                  <div className="text-sm text-success-600 font-medium">
                    +{calculateEcoPoints(currentEmission)} eco points
                  </div>
                )}
              </div>
              <Button
                onClick={handleSave}
                disabled={currentEmission <= 0}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Log Activity</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
