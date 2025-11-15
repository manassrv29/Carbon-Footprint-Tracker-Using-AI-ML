import { useState, useEffect } from 'react';
import { Calendar, TrendingDown, Award, TreePine, Car, Lightbulb, Droplets } from 'lucide-react';
import { Card } from '../ui/Card';

interface WeeklyData {
  level: number;
  ecoPoints: number;
  streak: number;
  weeklyReduction: number;
  reductionGoal: number;
  dailyEmissions: Array<{
    day: string;
    date: string;
    target: number;
    actual: number;
    status: 'good' | 'warning' | 'exceeded';
  }>;
  categoryProgress: {
    transport: {
      current: number;
      target: number;
      reduction: number;
      realWorldImpact: {
        treesPerDay: number;
        kmSaved: number;
      };
    };
    food: {
      current: number;
      target: number;
      reduction: number;
      realWorldImpact: {
        mealsSaved: number;
        waterSaved: number;
      };
    };
    energy: {
      current: number;
      target: number;
      reduction: number;
      realWorldImpact: {
        ledHours: number;
        solarOffset: number;
      };
    };
  };
  environmentalEquivalents: {
    treesPlanted: number;
    carTravelSaved: number;
    energySaved: number;
    waterSaved: number;
  };
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
    daysToUnlock?: number;
  }>;
}

export const WeeklyReport: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/reports/weekly', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWeeklyData(data.data);
      } else {
        // Mock data for demonstration
        setWeeklyData({
          level: 1,
          ecoPoints: 1192,
          streak: 0,
          weeklyReduction: 12,
          reductionGoal: 15,
          dailyEmissions: [
            { day: 'Mon', date: '2025-10-21', target: 2.5, actual: 2.1, status: 'good' },
            { day: 'Tue', date: '2025-10-22', target: 2.5, actual: 1.8, status: 'good' },
            { day: 'Wed', date: '2025-10-23', target: 2.5, actual: 2.3, status: 'good' },
            { day: 'Thu', date: '2025-10-24', target: 2.5, actual: 1.8, status: 'good' },
            { day: 'Fri', date: '2025-10-25', target: 2.5, actual: 2.0, status: 'good' },
            { day: 'Sat', date: '2025-10-26', target: 2.5, actual: 1.6, status: 'good' },
            { day: 'Sun', date: '2025-10-27', target: 2.5, actual: 1.7, status: 'good' },
          ],
          categoryProgress: {
            transport: {
              current: 1.2,
              target: 0.8,
              reduction: -25,
              realWorldImpact: {
                treesPerDay: 0.04,
                kmSaved: 5.7,
              },
            },
            food: {
              current: 0.8,
              target: 0.6,
              reduction: -15,
              realWorldImpact: {
                mealsSaved: 1.2,
                waterSaved: 180,
              },
            },
            energy: {
              current: 0.4,
              target: 0.3,
              reduction: -20,
              realWorldImpact: {
                ledHours: 8,
                solarOffset: 0.6,
              },
            },
          },
          environmentalEquivalents: {
            treesPlanted: 12,
            carTravelSaved: 450,
            energySaved: 180,
            waterSaved: 5400,
          },
          achievements: [
            {
              id: 1,
              title: 'Week Champion',
              description: '7 days ago to unlock',
              icon: '🏆',
              daysToUnlock: 7,
            },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to fetch weekly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto p-4 lg:p-6 xl:p-8" style={{ maxWidth: '1400px' }}>
        <div className="animate-pulse space-y-6 lg:space-y-8">
          <div className="h-8 lg:h-10 bg-gray-200 rounded w-1/3 loading-shimmer"></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 lg:h-40 bg-gray-200 rounded-xl loading-shimmer"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!weeklyData) return null;

  const getProgressColor = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio <= 0.8) return 'bg-green-500';
    if (ratio <= 1.0) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressWidth = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 lg:py-12 space-y-8 lg:space-y-12" style={{ maxWidth: '1600px' }}>
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-6 lg:mb-8">
            <Calendar className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 lg:mb-6 desktop-heading-xl">
            Your Eco Dashboard
          </h1>
          <p className="text-xl lg:text-2xl xl:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed desktop-text-lg">
            Track your progress, earn rewards, and see your environmental impact
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Current Level</h3>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-3xl font-bold text-emerald-600">Level {weeklyData.level}</span>
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-xs text-gray-500">1000 points to next level</p>
            </div>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Eco Points</h3>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-3xl font-bold text-yellow-600">{weeklyData.ecoPoints}</span>
                <span className="text-sm text-gray-500">⭐</span>
              </div>
              <p className="text-xs text-gray-500">+192 this week</p>
            </div>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Streak</h3>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-3xl font-bold text-orange-600">{weeklyData.streak} days</span>
                <span className="text-sm">⚡</span>
              </div>
              <p className="text-xs text-gray-500">Keep it up!</p>
            </div>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Weekly Reduction</h3>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-3xl font-bold text-green-600">{weeklyData.weeklyReduction}%</span>
                <TrendingDown className="w-6 h-6 text-green-500" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(weeklyData.weeklyReduction / weeklyData.reductionGoal) * 100}%` }}></div>
              </div>
              <p className="text-xs text-gray-500">Goal: {weeklyData.reductionGoal}%</p>
            </div>
          </Card>
        </div>

        {/* Weekly Activity & Achievements */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weekly Activity */}
          <Card className="lg:col-span-2 backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <h3 className="text-2xl font-bold text-gray-900">Weekly Activity</h3>
            </div>
            <p className="text-gray-600 mb-6">Your daily carbon emissions vs. target</p>
            
            <div className="space-y-4">
              {weeklyData.dailyEmissions.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Target: {day.target}kg CO₂</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        day.status === 'good' ? 'bg-green-100 text-green-700' :
                        day.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {day.actual}kg
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(day.actual, day.target)}`}
                        style={{ width: `${getProgressWidth(day.actual, day.target)}%` }}
                      ></div>
                      <div className="absolute top-0 right-0 w-1 h-3 bg-gray-400 rounded-r-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-6 h-6 text-yellow-600" />
              <h3 className="text-2xl font-bold text-gray-900">Achievements</h3>
            </div>
            <p className="text-gray-600 mb-6">Badges you've earned</p>
            
            <div className="space-y-4">
              {weeklyData.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Category Progress */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Transport */}
          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Car className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Transport</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Current vs. target emissions</p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">{weeklyData.categoryProgress.transport.current}</span>
                <span className="text-sm text-gray-600">kg CO₂/day</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${getProgressWidth(weeklyData.categoryProgress.transport.current, weeklyData.categoryProgress.transport.target)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress to target</span>
                <span>{weeklyData.categoryProgress.transport.target} kg CO₂/day</span>
              </div>
              <div className="mt-2 text-sm">
                <span className={`${weeklyData.categoryProgress.transport.reduction < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyData.categoryProgress.transport.reduction}% possible
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900">Real-world impact:</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">Trees needed to offset:</span>
                <span className="font-medium">{weeklyData.categoryProgress.transport.realWorldImpact.treesPerDay} trees/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Equivalent distance:</span>
                <span className="font-medium">{weeklyData.categoryProgress.transport.realWorldImpact.kmSaved} km by car</span>
              </div>
            </div>
          </Card>

          {/* Food & Diet */}
          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">🍽️</span>
              <h3 className="text-xl font-bold text-gray-900">Food & Diet</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Current vs. target emissions</p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-green-600">{weeklyData.categoryProgress.food.current}</span>
                <span className="text-sm text-gray-600">kg CO₂/day</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${getProgressWidth(weeklyData.categoryProgress.food.current, weeklyData.categoryProgress.food.target)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress to target</span>
                <span>{weeklyData.categoryProgress.food.target} kg CO₂/day</span>
              </div>
              <div className="mt-2 text-sm">
                <span className={`${weeklyData.categoryProgress.food.reduction < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyData.categoryProgress.food.reduction}% possible
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900">Real-world impact:</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">Meals saved:</span>
                <span className="font-medium">{weeklyData.categoryProgress.food.realWorldImpact.mealsSaved} meat meals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water saved:</span>
                <span className="font-medium">{weeklyData.categoryProgress.food.realWorldImpact.waterSaved}L per day</span>
              </div>
            </div>
          </Card>

          {/* Energy Use */}
          <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Lightbulb className="w-8 h-8 text-yellow-600" />
              <h3 className="text-xl font-bold text-gray-900">Energy Use</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Current vs. target emissions</p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-yellow-600">{weeklyData.categoryProgress.energy.current}</span>
                <span className="text-sm text-gray-600">kg CO₂/day</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{ width: `${getProgressWidth(weeklyData.categoryProgress.energy.current, weeklyData.categoryProgress.energy.target)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress to target</span>
                <span>{weeklyData.categoryProgress.energy.target} kg CO₂/day</span>
              </div>
              <div className="mt-2 text-sm">
                <span className={`${weeklyData.categoryProgress.energy.reduction < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyData.categoryProgress.energy.reduction}% possible
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900">Real-world impact:</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">LED bulbs equivalent:</span>
                <span className="font-medium">{weeklyData.categoryProgress.energy.realWorldImpact.ledHours} hours daily</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Solar offset needed:</span>
                <span className="font-medium">{weeklyData.categoryProgress.energy.realWorldImpact.solarOffset} kWh</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Environmental Equivalents */}
        <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TreePine className="w-8 h-8 text-green-600" />
            <h3 className="text-2xl font-bold text-gray-900">Environmental Equivalents</h3>
          </div>
          <p className="text-gray-600 mb-8">What your carbon reduction means in real terms</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TreePine className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">{weeklyData.environmentalEquivalents.treesPlanted}</div>
              <div className="text-sm text-gray-600">Trees planted equivalent</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Car className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600 mb-2">{weeklyData.environmentalEquivalents.carTravelSaved}km</div>
              <div className="text-sm text-gray-600">Car travel saved per month</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">{weeklyData.environmentalEquivalents.energySaved}kWh</div>
              <div className="text-sm text-gray-600">Energy saved per month</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Droplets className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{weeklyData.environmentalEquivalents.waterSaved}L</div>
              <div className="text-sm text-gray-600">Water saved per month</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
