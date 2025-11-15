import { useState, useEffect } from 'react';
import { TreePine, Car, Lightbulb, Droplets, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { getLogsForDateRange } from '../../utils/storage';
import { formatCO2 } from '../../utils/emissions';
import type { CarbonLog } from '../../types';

export function ImpactVisualizer() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [, setLogs] = useState<CarbonLog[]>([]);
  const [categoryData, setCategoryData] = useState({
    transport: 0,
    food: 0,
    energy: 0,
    total: 0
  });

  useEffect(() => {
    loadImpactData();
  }, [timeRange]);

  const loadImpactData = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const rangeLogs = getLogsForDateRange(startDate, endDate);
    setLogs(rangeLogs);

    const transport = rangeLogs.filter(l => l.category === 'transport').reduce((sum, l) => sum + l.co2Kg, 0);
    const food = rangeLogs.filter(l => l.category === 'food').reduce((sum, l) => sum + l.co2Kg, 0);
    const energy = rangeLogs.filter(l => l.category === 'energy').reduce((sum, l) => sum + l.co2Kg, 0);
    const total = transport + food + energy;

    setCategoryData({ transport, food, energy, total });
  };

  const getEquivalents = (co2Kg: number) => {
    return {
      trees: Math.ceil(co2Kg / 22), // 1 tree absorbs ~22kg CO2/year
      carKm: Math.round(co2Kg / 0.192), // Average car emissions
      lightbulbs: Math.round(co2Kg / (0.475 * 0.06 * 24 * 365)), // 60W bulb for a year
      water: Math.round(co2Kg * 1000 / 0.298) // Liters of water (0.298g CO2/L)
    };
  };

  const equivalents = getEquivalents(categoryData.total);

  const impactCards = [
    {
      icon: TreePine,
      title: 'Trees Needed',
      value: equivalents.trees,
      unit: 'trees',
      description: 'to offset your emissions',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Car,
      title: 'Car Distance',
      value: equivalents.carKm,
      unit: 'km',
      description: 'equivalent car travel',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Lightbulb,
      title: 'Energy Saved',
      value: equivalents.lightbulbs,
      unit: 'bulb-years',
      description: '60W bulbs for a year',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Droplets,
      title: 'Water Impact',
      value: equivalents.water,
      unit: 'liters',
      description: 'water carbon footprint',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    }
  ];

  const categoryBreakdown = [
    {
      category: 'Transport',
      value: categoryData.transport,
      percentage: categoryData.total > 0 ? (categoryData.transport / categoryData.total) * 100 : 0,
      color: 'bg-blue-500',
      icon: '🚗'
    },
    {
      category: 'Food',
      value: categoryData.food,
      percentage: categoryData.total > 0 ? (categoryData.food / categoryData.total) * 100 : 0,
      color: 'bg-green-500',
      icon: '🍽️'
    },
    {
      category: 'Energy',
      value: categoryData.energy,
      percentage: categoryData.total > 0 ? (categoryData.energy / categoryData.total) * 100 : 0,
      color: 'bg-yellow-500',
      icon: '⚡'
    }
  ];

  return (
    <section id="impact" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Impact Visualizer</h2>
          <p className="text-muted-600 max-w-2xl mx-auto">
            Understand your environmental impact through real-world equivalents and category breakdowns.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-muted-200">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 capitalize ${
                  timeRange === range
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-muted-600 hover:text-primary-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Total Emissions Summary */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-4 bg-muted-50 rounded-2xl px-8 py-6">
            <div className="text-center">
              <p className="text-sm text-muted-600 mb-1">Total Emissions</p>
              <p className="text-3xl font-bold text-gray-900">{formatCO2(categoryData.total)}</p>
              <p className="text-sm text-muted-600 capitalize">this {timeRange}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Category Breakdown */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Category Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categoryBreakdown.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium text-gray-900">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCO2(item.value)}</p>
                          <p className="text-sm text-muted-600">{item.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-muted-200 rounded-full h-3">
                        <div 
                          className={`${item.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {categoryData.total === 0 && (
                  <div className="text-center py-8">
                    <TrendingDown className="w-12 h-12 text-muted-400 mx-auto mb-3" />
                    <p className="text-muted-600">No emissions data for this period</p>
                    <p className="text-muted-500 text-sm">Start logging activities to see your impact!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress to Target */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Progress to Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.75)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success-600">75%</p>
                        <p className="text-xs text-muted-600">on target</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-600 mb-2">Monthly Reduction Goal</p>
                  <p className="text-lg font-semibold text-gray-900">25% reduction</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Environmental Equivalents */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Real-World Impact</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} hover>
                  <CardContent>
                    <div className="text-center">
                      <div className={`w-16 h-16 ${card.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`w-8 h-8 ${card.color}`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{card.title}</h4>
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {card.value.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-600 ml-1">{card.unit}</span>
                      </div>
                      <p className="text-sm text-muted-600">{card.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tips for Improvement */}
        {categoryData.total > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>💡 Tips for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚲</div>
                    <h4 className="font-medium mb-2">Choose Green Transport</h4>
                    <p className="text-sm text-muted-600">
                      Walk, bike, or use public transport to reduce your transport emissions by up to 80%.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌱</div>
                    <h4 className="font-medium mb-2">Eat More Plants</h4>
                    <p className="text-sm text-muted-600">
                      Plant-based meals can reduce food emissions by 50-90% compared to meat-heavy diets.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">💡</div>
                    <h4 className="font-medium mb-2">Save Energy</h4>
                    <p className="text-sm text-muted-600">
                      Switch to LED bulbs and unplug devices to cut energy consumption by 20-30%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
