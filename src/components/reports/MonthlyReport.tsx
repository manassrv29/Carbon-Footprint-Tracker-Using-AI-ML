import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Award, TreePine, Car, Lightbulb, Droplets } from 'lucide-react';
import { Card } from '../ui/Card';

interface MonthlyData {
  month: string;
  year: number;
  totalEmissions: number;
  reductionFromLastMonth: number;
  level: number;
  ecoPoints: number;
  streak: number;
  weeklyBreakdown: Array<{
    week: number;
    startDate: string;
    endDate: string;
    emissions: number;
    target: number;
    categories: {
      transport: number;
      food: number;
      energy: number;
      other: number;
    };
  }>;
  categoryTrends: {
    transport: {
      current: number;
      lastMonth: number;
      trend: 'up' | 'down' | 'stable';
      percentage: number;
    };
    food: {
      current: number;
      lastMonth: number;
      trend: 'up' | 'down' | 'stable';
      percentage: number;
    };
    energy: {
      current: number;
      lastMonth: number;
      trend: 'up' | 'down' | 'stable';
      percentage: number;
    };
  };
  monthlyGoals: {
    totalTarget: number;
    achieved: boolean;
    categories: {
      transport: { target: number; achieved: boolean };
      food: { target: number; achieved: boolean };
      energy: { target: number; achieved: boolean };
    };
  };
  environmentalImpact: {
    treesEquivalent: number;
    carKmSaved: number;
    energySavedKwh: number;
    waterSavedLiters: number;
    co2OffsetKg: number;
  };
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
    unlockedDate: string;
    category: string;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }>;
}

export const MonthlyReport: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/reports/monthly', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMonthlyData(data.data);
      } else {
        // Mock data for demonstration
        setMonthlyData({
          month: 'October',
          year: 2025,
          totalEmissions: 45.2,
          reductionFromLastMonth: -18,
          level: 2,
          ecoPoints: 2450,
          streak: 12,
          weeklyBreakdown: [
            {
              week: 1,
              startDate: '2025-10-01',
              endDate: '2025-10-07',
              emissions: 12.5,
              target: 15.0,
              categories: { transport: 7.2, food: 3.1, energy: 2.2, other: 0 }
            },
            {
              week: 2,
              startDate: '2025-10-08',
              endDate: '2025-10-14',
              emissions: 11.8,
              target: 15.0,
              categories: { transport: 6.8, food: 2.9, energy: 2.1, other: 0 }
            },
            {
              week: 3,
              startDate: '2025-10-15',
              endDate: '2025-10-21',
              emissions: 10.4,
              target: 15.0,
              categories: { transport: 5.9, food: 2.7, energy: 1.8, other: 0 }
            },
            {
              week: 4,
              startDate: '2025-10-22',
              endDate: '2025-10-28',
              emissions: 10.5,
              target: 15.0,
              categories: { transport: 6.1, food: 2.6, energy: 1.8, other: 0 }
            }
          ],
          categoryTrends: {
            transport: {
              current: 26.0,
              lastMonth: 32.5,
              trend: 'down',
              percentage: -20
            },
            food: {
              current: 11.3,
              lastMonth: 13.8,
              trend: 'down',
              percentage: -18
            },
            energy: {
              current: 7.9,
              lastMonth: 9.2,
              trend: 'down',
              percentage: -14
            }
          },
          monthlyGoals: {
            totalTarget: 50.0,
            achieved: true,
            categories: {
              transport: { target: 25.0, achieved: false },
              food: { target: 12.0, achieved: true },
              energy: { target: 8.0, achieved: true }
            }
          },
          environmentalImpact: {
            treesEquivalent: 28,
            carKmSaved: 1250,
            energySavedKwh: 420,
            waterSavedLiters: 15600,
            co2OffsetKg: 45.2
          },
          achievements: [
            {
              id: 1,
              title: 'Monthly Champion',
              description: 'Achieved monthly reduction goal',
              icon: '🏆',
              unlockedDate: '2025-10-25',
              category: 'goals'
            },
            {
              id: 2,
              title: 'Green Commuter',
              description: 'Reduced transport emissions by 20%',
              icon: '🚲',
              unlockedDate: '2025-10-20',
              category: 'transport'
            },
            {
              id: 3,
              title: 'Energy Saver',
              description: 'Consistently low energy usage',
              icon: '💡',
              unlockedDate: '2025-10-15',
              category: 'energy'
            }
          ],
          insights: [
            {
              type: 'success',
              title: 'Great Progress!',
              description: 'You reduced your carbon footprint by 18% this month compared to last month.',
            },
            {
              type: 'info',
              title: 'Transport Focus',
              description: 'Transport remains your largest emission source. Consider carpooling or public transport.',
              action: 'View transport tips'
            },
            {
              type: 'warning',
              title: 'Weekend Spikes',
              description: 'Your emissions tend to increase on weekends. Plan eco-friendly weekend activities.',
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!monthlyData) return null;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      case 'stable': return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {monthlyData.month} {monthlyData.year} Report
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your comprehensive monthly carbon footprint analysis and achievements
          </p>
        </div>

        {/* Key Monthly Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Emissions</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">{monthlyData.totalEmissions}kg</div>
              <div className={`text-sm flex items-center justify-center space-x-1 ${
                monthlyData.reductionFromLastMonth < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{monthlyData.reductionFromLastMonth}%</span>
                <span>{monthlyData.reductionFromLastMonth < 0 ? '📉' : '📈'}</span>
              </div>
              <p className="text-xs text-gray-500">vs last month</p>
            </div>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Level Progress</h3>
              <div className="text-3xl font-bold text-indigo-600 mb-2">Level {monthlyData.level}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-gray-500">{monthlyData.ecoPoints} eco points</p>
            </div>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Goal</h3>
              <div className={`text-3xl font-bold mb-2 ${monthlyData.monthlyGoals.achieved ? 'text-green-600' : 'text-orange-600'}`}>
                {monthlyData.monthlyGoals.achieved ? '✅' : '🎯'}
              </div>
              <p className="text-sm font-medium">{monthlyData.monthlyGoals.achieved ? 'Achieved!' : 'In Progress'}</p>
              <p className="text-xs text-gray-500">Target: {monthlyData.monthlyGoals.totalTarget}kg</p>
            </div>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Streak</h3>
              <div className="text-3xl font-bold text-orange-600 mb-2">{monthlyData.streak}</div>
              <p className="text-sm font-medium">days active</p>
              <p className="text-xs text-gray-500">Keep it up! 🔥</p>
            </div>
          </Card>
        </div>

        {/* Weekly Breakdown Chart */}
        <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900">Weekly Breakdown</h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {monthlyData.weeklyBreakdown.map((week, index) => (
              <div key={index} className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Week {week.week}</h4>
                <div className="text-2xl font-bold text-blue-600 mb-2">{week.emissions}kg</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full ${week.emissions <= week.target ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min((week.emissions / week.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">Target: {week.target}kg</p>
                
                {/* Category breakdown */}
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-600">🚗 Transport:</span>
                    <span>{week.categories.transport}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">🍽️ Food:</span>
                    <span>{week.categories.food}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">⚡ Energy:</span>
                    <span>{week.categories.energy}kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Trends */}
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(monthlyData.categoryTrends).map(([category, data]) => (
            <Card key={category} className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                <span className="text-2xl">
                  {category === 'transport' ? '🚗' : category === 'food' ? '🍽️' : '⚡'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This month:</span>
                  <span className="font-semibold">{data.current}kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last month:</span>
                  <span className="font-semibold">{data.lastMonth}kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Change:</span>
                  <span className={`font-semibold flex items-center space-x-1 ${getTrendColor(data.trend)}`}>
                    <span>{data.percentage}%</span>
                    <span>{getTrendIcon(data.trend)}</span>
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${data.trend === 'down' ? 'bg-green-500' : data.trend === 'up' ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.abs(data.percentage)}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Environmental Impact */}
        <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TreePine className="w-8 h-8 text-green-600" />
            <h3 className="text-2xl font-bold text-gray-900">Monthly Environmental Impact</h3>
          </div>
          <p className="text-gray-600 mb-8">Your carbon reduction this month equals:</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TreePine className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">{monthlyData.environmentalImpact.treesEquivalent}</div>
              <div className="text-sm text-gray-600">Trees planted equivalent</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Car className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{monthlyData.environmentalImpact.carKmSaved}km</div>
              <div className="text-sm text-gray-600">Car travel avoided</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">{monthlyData.environmentalImpact.energySavedKwh}kWh</div>
              <div className="text-sm text-gray-600">Energy saved</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Droplets className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-cyan-600 mb-2">{monthlyData.environmentalImpact.waterSavedLiters}L</div>
              <div className="text-sm text-gray-600">Water saved</div>
            </div>
          </div>
        </Card>

        {/* Achievements & Insights */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Monthly Achievements */}
          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-6 h-6 text-yellow-600" />
              <h3 className="text-2xl font-bold text-gray-900">Monthly Achievements</h3>
            </div>
            
            <div className="space-y-4">
              {monthlyData.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    achievement.category === 'goals' ? 'bg-purple-100 text-purple-700' :
                    achievement.category === 'transport' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {achievement.category}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Insights & Recommendations */}
          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Insights & Tips</h3>
            </div>
            
            <div className="space-y-4">
              {monthlyData.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  insight.type === 'success' ? 'bg-green-50 border-green-200' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className={`flex items-center space-x-2 mb-2 ${
                    insight.type === 'success' ? 'text-green-700' :
                    insight.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    <span className="text-lg">
                      {insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <span className="font-semibold">{insight.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  {insight.action && (
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      {insight.action} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
