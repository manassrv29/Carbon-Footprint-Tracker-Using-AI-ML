import { useState, useEffect } from 'react';
import { Car, Utensils, Zap, Calculator, TrendingDown, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';

interface CarbonLogData {
  category: 'transport' | 'food' | 'energy';
  activityType: string;
  value: number;
  source: 'manual';
  metadata?: any;
}

interface CalculationResult {
  co2Kg: number;
  ecoPoints: number;
  category: string;
  activityType: string;
  value: number;
}

export function EnhancedCarbonCalculator() {
  const [activeTab, setActiveTab] = useState<'transport' | 'food' | 'energy'>('transport');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  // Form data states
  const [transportData, setTransportData] = useState({
    type: 'car_petrol',
    distance: ''
  });
  const [foodData, setFoodData] = useState({
    type: 'beef',
    weight: ''
  });
  const [energyData, setEnergyData] = useState({
    type: 'electricity_grid',
    usage: ''
  });

  const tabs = [
    { id: 'transport', label: 'Transport', icon: Car, color: 'from-blue-500 to-cyan-500' },
    { id: 'food', label: 'Food & Diet', icon: Utensils, color: 'from-green-500 to-emerald-500' },
    { id: 'energy', label: 'Energy', icon: Zap, color: 'from-yellow-500 to-orange-500' }
  ];

  const transportTypes = [
    { value: 'car_petrol', label: 'Petrol Car', unit: 'km' },
    { value: 'car_diesel', label: 'Diesel Car', unit: 'km' },
    { value: 'car_electric', label: 'Electric Car', unit: 'km' },
    { value: 'car_hybrid', label: 'Hybrid Car', unit: 'km' },
    { value: 'bus', label: 'Bus', unit: 'km' },
    { value: 'train', label: 'Train', unit: 'km' },
    { value: 'subway', label: 'Subway/Metro', unit: 'km' },
    { value: 'flight_domestic', label: 'Domestic Flight', unit: 'km' },
    { value: 'flight_international', label: 'International Flight', unit: 'km' },
    { value: 'motorcycle', label: 'Motorcycle', unit: 'km' },
    { value: 'bicycle', label: 'Bicycle', unit: 'km' },
    { value: 'walking', label: 'Walking', unit: 'km' }
  ];

  const foodTypes = [
    { value: 'beef', label: 'Beef', unit: 'kg' },
    { value: 'lamb', label: 'Lamb', unit: 'kg' },
    { value: 'pork', label: 'Pork', unit: 'kg' },
    { value: 'chicken', label: 'Chicken', unit: 'kg' },
    { value: 'turkey', label: 'Turkey', unit: 'kg' },
    { value: 'fish_farmed', label: 'Farmed Fish', unit: 'kg' },
    { value: 'fish_wild', label: 'Wild Fish', unit: 'kg' },
    { value: 'seafood', label: 'Seafood', unit: 'kg' },
    { value: 'dairy_milk', label: 'Milk', unit: 'liters' },
    { value: 'cheese', label: 'Cheese', unit: 'kg' },
    { value: 'eggs', label: 'Eggs', unit: 'kg' },
    { value: 'vegetables_local', label: 'Local Vegetables', unit: 'kg' },
    { value: 'fruits_local', label: 'Local Fruits', unit: 'kg' },
    { value: 'grains', label: 'Grains', unit: 'kg' },
    { value: 'legumes', label: 'Legumes', unit: 'kg' }
  ];

  const energyTypes = [
    { value: 'electricity_grid', label: 'Grid Electricity', unit: 'kWh' },
    { value: 'electricity_coal', label: 'Coal Electricity', unit: 'kWh' },
    { value: 'electricity_gas', label: 'Gas Electricity', unit: 'kWh' },
    { value: 'natural_gas', label: 'Natural Gas', unit: 'kWh' },
    { value: 'heating_oil', label: 'Heating Oil', unit: 'liters' },
    { value: 'propane', label: 'Propane', unit: 'liters' },
    { value: 'solar', label: 'Solar Energy', unit: 'kWh' },
    { value: 'wind', label: 'Wind Energy', unit: 'kWh' },
    { value: 'hydro', label: 'Hydro Energy', unit: 'kWh' }
  ];

  const calculateEmissions = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      let data: CarbonLogData;
      
      switch (activeTab) {
        case 'transport':
          if (!transportData.distance) {
            setMessage({ type: 'error', text: 'Please enter distance' });
            return;
          }
          data = {
            category: 'transport',
            activityType: transportData.type,
            value: parseFloat(transportData.distance),
            source: 'manual'
          };
          break;
        case 'food':
          if (!foodData.weight) {
            setMessage({ type: 'error', text: 'Please enter weight/amount' });
            return;
          }
          data = {
            category: 'food',
            activityType: foodData.type,
            value: parseFloat(foodData.weight),
            source: 'manual'
          };
          break;
        case 'energy':
          if (!energyData.usage) {
            setMessage({ type: 'error', text: 'Please enter energy usage' });
            return;
          }
          data = {
            category: 'energy',
            activityType: energyData.type,
            value: parseFloat(energyData.usage),
            source: 'manual'
          };
          break;
        default:
          return;
      }

      const response = await fetch('/api/carbon/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate emissions');
      }

      setCalculation({
        co2Kg: result.data.carbonLog.co2Kg,
        ecoPoints: result.data.ecoPointsEarned,
        category: result.data.carbonLog.category,
        activityType: result.data.carbonLog.activityType,
        value: result.data.carbonLog.value
      });

      setMessage({ type: 'success', text: 'Carbon log saved successfully!' });
      
      // Reset form
      if (activeTab === 'transport') setTransportData({ ...transportData, distance: '' });
      if (activeTab === 'food') setFoodData({ ...foodData, weight: '' });
      if (activeTab === 'energy') setEnergyData({ ...energyData, usage: '' });
      
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'transport': return transportData;
      case 'food': return foodData;
      case 'energy': return energyData;
    }
  };

  const getCurrentTypes = () => {
    switch (activeTab) {
      case 'transport': return transportTypes;
      case 'food': return foodTypes;
      case 'energy': return energyTypes;
    }
  };

  const updateCurrentData = (field: string, value: string) => {
    switch (activeTab) {
      case 'transport':
        setTransportData(prev => ({ ...prev, [field]: value }));
        break;
      case 'food':
        setFoodData(prev => ({ ...prev, [field]: value }));
        break;
      case 'energy':
        setEnergyData(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  const getValueField = () => {
    switch (activeTab) {
      case 'transport': return 'distance';
      case 'food': return 'weight';
      case 'energy': return 'usage';
    }
  };

  const getValueLabel = () => {
    switch (activeTab) {
      case 'transport': return 'Distance';
      case 'food': return 'Weight/Amount';
      case 'energy': return 'Usage';
    }
  };

  const currentData = getCurrentData();
  const currentTypes = getCurrentTypes();
  const valueField = getValueField();
  const selectedType = currentTypes.find(t => t.value === currentData.type);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="mx-auto p-4 lg:p-6 xl:p-8 space-y-6 lg:space-y-8" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="text-center space-y-4 lg:space-y-6">
        <div className="flex items-center justify-center space-x-3 lg:space-x-4">
          <Calculator className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" />
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent desktop-heading-lg">
            Carbon Footprint Calculator
          </h1>
        </div>
        <p className="text-gray-600 text-base lg:text-lg xl:text-xl max-w-3xl mx-auto leading-relaxed desktop-text-lg">
          Track your daily carbon emissions across transport, food, and energy consumption. 
          Get real-time calculations and earn eco-points for sustainable choices.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Calculator Form */}
      <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
        <div className="space-y-6">
          {/* Activity Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Activity Type
            </label>
            <select
              value={currentData.type}
              onChange={(e) => updateCurrentData('type', e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
            >
              {currentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {getValueLabel()} ({selectedType?.unit})
            </label>
            <input
              type="number"
              value={currentData[valueField as keyof typeof currentData]}
              onChange={(e) => updateCurrentData(valueField, e.target.value)}
              placeholder={`Enter ${getValueLabel().toLowerCase()} in ${selectedType?.unit}`}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
              step="0.1"
              min="0"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateEmissions}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Calculate & Save</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Results */}
      {calculation && (
        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <TrendingDown className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-800">Carbon Footprint Calculated</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {calculation.co2Kg.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">kg CO₂ emitted</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  +{calculation.ecoPoints}
                </div>
                <div className="text-sm text-gray-600">eco-points earned</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700 capitalize">
                  {calculation.activityType.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-gray-600">
                  {calculation.value} {selectedType?.unit}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
