import { useState, useEffect } from 'react';
import { TrendingUp, Award, Flame, Target, Calendar, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { getUserStats, getLogsForDate, calculateStreak, getDailyTarget } from '../../utils/storage';
import { calculateLevel, getPointsForNextLevel, formatCO2 } from '../../utils/emissions';
import type { UserStats, DailyEmission } from '../../types';

export function Dashboard() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyEmission[]>([]);
  const [todayEmissions, setTodayEmissions] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const stats = getUserStats();
    const currentStreak = calculateStreak();
    const updatedStats = { ...stats, streak: currentStreak };
    setUserStats(updatedStats);

    // Calculate today's emissions
    const today = new Date();
    const todayLogs = getLogsForDate(today);
    const todayTotal = todayLogs.reduce((sum, log) => sum + log.co2Kg, 0);
    setTodayEmissions(todayTotal);

    // Generate weekly data
    const weeklyEmissions: DailyEmission[] = [];
    const target = getDailyTarget();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const logs = getLogsForDate(date);
      
      const transport = logs.filter(l => l.category === 'transport').reduce((sum, l) => sum + l.co2Kg, 0);
      const food = logs.filter(l => l.category === 'food').reduce((sum, l) => sum + l.co2Kg, 0);
      const energy = logs.filter(l => l.category === 'energy').reduce((sum, l) => sum + l.co2Kg, 0);
      const total = transport + food + energy;
      
      weeklyEmissions.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        transport,
        food,
        energy,
        total,
        target
      });
    }
    
    setWeeklyData(weeklyEmissions);
  };

  if (!userStats) return <div>Loading...</div>;

  const level = calculateLevel(userStats.ecoPoints);
  const levelProgress = getPointsForNextLevel(userStats.ecoPoints);
  const dailyTarget = getDailyTarget();
  const todayProgress = Math.min((todayEmissions / dailyTarget) * 100, 100);
  const isOnTarget = todayEmissions <= dailyTarget;

  const quickActions = [
    { label: 'Log Transport', icon: '🚗', action: () => {} },
    { label: 'Add Meal', icon: '🍽️', action: () => {} },
    { label: 'Track Energy', icon: '⚡', action: () => {} },
    { label: 'View Challenges', icon: '🏆', action: () => {} }
  ];

  return (
    <section id="dashboard" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Dashboard</h2>
          <p className="text-muted-600 max-w-2xl mx-auto">
            Track your progress, view achievements, and stay motivated on your sustainability journey.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Level Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-600">Current Level</p>
                  <p className="text-2xl font-bold text-primary-600">Level {level}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-600 mb-1">
                  <span>{levelProgress.current} points</span>
                  <span>{levelProgress.total} points</span>
                </div>
                <div className="w-full bg-muted-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(levelProgress.current / levelProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eco Points Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-600">Eco Points</p>
                  <p className="text-2xl font-bold text-success-600">{userStats.ecoPoints.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-success-600" />
                </div>
              </div>
              <p className="text-sm text-muted-600 mt-2">
                +{levelProgress.needed} needed for next level
              </p>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-600">Current Streak</p>
                  <p className="text-2xl font-bold text-warning-600">{userStats.streak} days</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-warning-600" />
                </div>
              </div>
              <p className="text-sm text-muted-600 mt-2">
                Keep logging daily activities!
              </p>
            </CardContent>
          </Card>

          {/* Today's Progress Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-600">Today's Emissions</p>
                  <p className={`text-2xl font-bold ${isOnTarget ? 'text-success-600' : 'text-warning-600'}`}>
                    {formatCO2(todayEmissions)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isOnTarget ? 'bg-success-100' : 'bg-warning-100'
                }`}>
                  <Target className={`w-6 h-6 ${isOnTarget ? 'text-success-600' : 'text-warning-600'}`} />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-muted-600 mb-1">
                  <span>Target: {formatCO2(dailyTarget)}</span>
                  <span>{todayProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOnTarget ? 'bg-success-500' : 'bg-warning-500'
                    }`}
                    style={{ width: `${Math.min(todayProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weekly Activity Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{day.date}</span>
                        <span className="text-sm text-muted-600">{formatCO2(day.total)}</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-muted-200 rounded-full h-3">
                          {/* Target line */}
                          <div 
                            className="absolute top-0 w-0.5 bg-gray-400 h-3"
                            style={{ left: `${Math.min((day.target / (day.target * 1.5)) * 100, 100)}%` }}
                          ></div>
                          {/* Emissions bar */}
                          <div className="flex h-3 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500"
                              style={{ width: `${(day.transport / (day.target * 1.5)) * 100}%` }}
                            ></div>
                            <div 
                              className="bg-green-500"
                              style={{ width: `${(day.food / (day.target * 1.5)) * 100}%` }}
                            ></div>
                            <div 
                              className="bg-yellow-500"
                              style={{ width: `${(day.energy / (day.target * 1.5)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Transport</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Food</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Energy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-0.5 h-3 bg-gray-400"></div>
                    <span>Daily Target</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Achievements */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="flex flex-col items-center space-y-1 h-auto py-3"
                    >
                      <span className="text-lg">{action.icon}</span>
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userStats.badges.length > 0 ? (
                  <div className="space-y-3">
                    {userStats.badges.slice(0, 3).map((badge) => (
                      <div key={badge.id} className="flex items-center space-x-3 p-3 bg-muted-50 rounded-lg">
                        <div className="text-2xl">{badge.icon}</div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-600">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                    {userStats.badges.length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full">
                        View All Badges ({userStats.badges.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="w-12 h-12 text-muted-400 mx-auto mb-3" />
                    <p className="text-muted-600 text-sm">No badges yet</p>
                    <p className="text-muted-500 text-xs">Start logging activities to earn your first badge!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
