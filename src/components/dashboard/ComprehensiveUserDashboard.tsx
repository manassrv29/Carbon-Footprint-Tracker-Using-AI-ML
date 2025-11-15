import { useState, useEffect } from 'react';
import { 
  User, Calendar, TrendingUp, Target, Award, Leaf, 
  Utensils, Zap, Car, Home, 
  BarChart3, PieChart, Clock, Star,
  CheckCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card } from '../ui/Card';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  level: number;
  ecoPoints: number;
  streak: number;
  totalCo2Saved: number;
  joinedDate: string;
  lastActiveDate: string;
  settings: {
    dailyTarget: number;
    notifications: boolean;
    privacy: string;
  };
}

interface MonthlyStats {
  currentMonth: {
    totalEmissions: number;
    dailyAverage: number;
    daysTracked: number;
    targetProgress: number;
  };
  previousMonth: {
    totalEmissions: number;
    dailyAverage: number;
    daysTracked: number;
  };
  yearToDate: {
    totalEmissions: number;
    monthlyAverage: number;
    bestMonth: string;
    worstMonth: string;
  };
  trends: {
    emissionChange: number;
    streakChange: number;
    pointsEarned: number;
  };
}

interface CategoryBreakdown {
  transport: { current: number; target: number; trend: number };
  food: { current: number; target: number; trend: number };
  energy: { current: number; target: number; trend: number };
  other: { current: number; target: number; trend: number };
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: string;
  progress?: number;
  isUnlocked: boolean;
}

interface Goal {
  id: number;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
  status: 'active' | 'completed' | 'overdue';
}

interface ActivityLog {
  id: number;
  date: string;
  category: string;
  activity: string;
  co2Amount: number;
  pointsEarned: number;
}

export function ComprehensiveUserDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'goals' | 'activity'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user profile data
      setUserProfile({
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'user@test.com',
        level: 5,
        ecoPoints: 1250,
        streak: 12,
        totalCo2Saved: 45.6,
        joinedDate: '2024-01-15',
        lastActiveDate: new Date().toISOString(),
        settings: {
          dailyTarget: 8.0,
          notifications: true,
          privacy: 'public'
        }
      });

      // Mock monthly stats
      setMonthlyStats({
        currentMonth: {
          totalEmissions: 156.8,
          dailyAverage: 5.2,
          daysTracked: 28,
          targetProgress: 85
        },
        previousMonth: {
          totalEmissions: 178.4,
          dailyAverage: 5.8,
          daysTracked: 31
        },
        yearToDate: {
          totalEmissions: 1847.2,
          monthlyAverage: 168.8,
          bestMonth: 'September',
          worstMonth: 'March'
        },
        trends: {
          emissionChange: -12.1,
          streakChange: 5,
          pointsEarned: 340
        }
      });

      // Mock category breakdown
      setCategoryBreakdown({
        transport: { current: 68.4, target: 60.0, trend: -8.2 },
        food: { current: 45.2, target: 50.0, trend: -2.1 },
        energy: { current: 32.8, target: 35.0, trend: -5.4 },
        other: { current: 10.4, target: 15.0, trend: 1.2 }
      });

      // Mock achievements
      setAchievements([
        {
          id: 1,
          title: 'Green Warrior',
          description: 'Maintained streak for 10+ days',
          icon: '🏆',
          category: 'streak',
          unlockedAt: '2024-10-20',
          isUnlocked: true
        },
        {
          id: 2,
          title: 'Carbon Cutter',
          description: 'Reduced emissions by 20% this month',
          icon: '✂️',
          category: 'reduction',
          unlockedAt: '2024-10-25',
          isUnlocked: true
        },
        {
          id: 3,
          title: 'Eco Champion',
          description: 'Reach 1000 eco points',
          icon: '🌟',
          category: 'points',
          progress: 85,
          unlockedAt: '',
          isUnlocked: false
        }
      ]);

      // Mock goals
      setGoals([
        {
          id: 1,
          title: 'Reduce Daily Emissions',
          description: 'Keep daily CO₂ under 8kg',
          target: 8.0,
          current: 5.2,
          deadline: '2024-12-31',
          category: 'emissions',
          status: 'active'
        },
        {
          id: 2,
          title: 'Green Transport Week',
          description: 'Use eco-friendly transport for 7 days',
          target: 7,
          current: 4,
          deadline: '2024-11-15',
          category: 'transport',
          status: 'active'
        }
      ]);

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          date: '2024-10-29',
          category: 'transport',
          activity: 'Bus commute - 15km',
          co2Amount: 1.34,
          pointsEarned: 25
        },
        {
          id: 2,
          date: '2024-10-29',
          category: 'food',
          activity: 'Vegetarian lunch',
          co2Amount: 0.8,
          pointsEarned: 15
        },
        {
          id: 3,
          date: '2024-10-28',
          category: 'energy',
          activity: 'Home electricity - 12kWh',
          co2Amount: 4.8,
          pointsEarned: 10
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-red-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-green-500" />;
    return <div className="w-4 h-4" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Car className="w-5 h-5" />;
      case 'food': return <Utensils className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5" />;
      case 'other': return <Home className="w-5 h-5" />;
      default: return <Leaf className="w-5 h-5" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'stats', label: 'Statistics', icon: PieChart },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'activity', label: 'Activity', icon: Clock }
  ];

  if (isLoading) {
    return (
      <div className="mx-auto p-4 lg:p-6 xl:p-8" style={{ maxWidth: '1600px' }}>
        <div className="animate-pulse space-y-6 lg:space-y-8">
          <div className="h-8 lg:h-10 bg-gray-200 rounded w-1/3 loading-shimmer"></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 lg:h-40 bg-gray-200 rounded-xl loading-shimmer"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile || !monthlyStats) {
    return (
      <div className="mx-auto p-4 lg:p-6 xl:p-8 text-center" style={{ maxWidth: '1600px' }}>
        <p className="text-gray-600 text-base lg:text-lg">Unable to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 lg:p-6 xl:p-8 space-y-6 lg:space-y-8" style={{ maxWidth: '1600px' }}>
      {/* Header with User Info */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold">
                Welcome back, {userProfile.firstName}!
              </h1>
              <p className="text-green-100 text-base lg:text-lg">
                Level {userProfile.level} • {userProfile.ecoPoints} Eco Points • {userProfile.streak} day streak
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm lg:text-base">Total CO₂ Saved</p>
            <p className="text-3xl lg:text-4xl font-bold">{userProfile.totalCo2Saved} kg</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-2 lg:px-4 border-b-2 font-medium text-sm lg:text-base transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`-ml-0.5 mr-2 h-5 w-5 lg:h-6 lg:w-6 ${
                  isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6 lg:space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            <Card className="p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 desktop-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm lg:text-base font-medium text-blue-600">This Month</p>
                  <p className="text-2xl lg:text-3xl font-bold text-blue-700">
                    {monthlyStats.currentMonth.totalEmissions.toFixed(1)} kg
                  </p>
                  <p className="text-xs lg:text-sm text-blue-600">
                    {monthlyStats.currentMonth.daysTracked} days tracked
                  </p>
                </div>
                <Calendar className="w-8 h-8 lg:w-10 lg:h-10 text-blue-500" />
              </div>
            </Card>

            <Card className="p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 desktop-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm lg:text-base font-medium text-green-600">Daily Average</p>
                  <p className="text-2xl lg:text-3xl font-bold text-green-700">
                    {monthlyStats.currentMonth.dailyAverage.toFixed(1)} kg
                  </p>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(monthlyStats.trends.emissionChange)}
                    <p className="text-xs lg:text-sm text-green-600">
                      {Math.abs(monthlyStats.trends.emissionChange).toFixed(1)}% vs last month
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10 text-green-500" />
              </div>
            </Card>

            <Card className="p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 desktop-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm lg:text-base font-medium text-purple-600">Target Progress</p>
                  <p className="text-2xl lg:text-3xl font-bold text-purple-700">
                    {monthlyStats.currentMonth.targetProgress}%
                  </p>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(monthlyStats.currentMonth.targetProgress)}`}
                      style={{ width: `${monthlyStats.currentMonth.targetProgress}%` }}
                    ></div>
                  </div>
                </div>
                <Target className="w-8 h-8 lg:w-10 lg:h-10 text-purple-500" />
              </div>
            </Card>

            <Card className="p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 desktop-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm lg:text-base font-medium text-yellow-600">Points Earned</p>
                  <p className="text-2xl lg:text-3xl font-bold text-yellow-700">
                    {monthlyStats.trends.pointsEarned}
                  </p>
                  <p className="text-xs lg:text-sm text-yellow-600">This month</p>
                </div>
                <Star className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-500" />
              </div>
            </Card>
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown && (
            <Card className="p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Emissions by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {Object.entries(categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category)}
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      {getTrendIcon(data.trend)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {data.current.toFixed(1)} kg</span>
                        <span>Target: {data.target.toFixed(1)} kg</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${data.current <= data.target ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((data.current / data.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6 lg:space-y-8">
          {/* Year-to-Date Stats */}
          <Card className="p-6 lg:p-8">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Year-to-Date Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {monthlyStats.yearToDate.totalEmissions.toFixed(0)}
                </p>
                <p className="text-sm lg:text-base text-gray-600">Total Emissions (kg)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {monthlyStats.yearToDate.monthlyAverage.toFixed(1)}
                </p>
                <p className="text-sm lg:text-base text-gray-600">Monthly Average (kg)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-green-600">
                  {monthlyStats.yearToDate.bestMonth}
                </p>
                <p className="text-sm lg:text-base text-gray-600">Best Month</p>
              </div>
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-red-600">
                  {monthlyStats.yearToDate.worstMonth}
                </p>
                <p className="text-sm lg:text-base text-gray-600">Needs Improvement</p>
              </div>
            </div>
          </Card>

          {/* Monthly Comparison */}
          <Card className="p-6 lg:p-8">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Monthly Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Current Month</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Emissions:</span>
                    <span className="font-semibold">{monthlyStats.currentMonth.totalEmissions.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Average:</span>
                    <span className="font-semibold">{monthlyStats.currentMonth.dailyAverage.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Tracked:</span>
                    <span className="font-semibold">{monthlyStats.currentMonth.daysTracked}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Previous Month</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Emissions:</span>
                    <span className="font-semibold">{monthlyStats.previousMonth.totalEmissions.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Average:</span>
                    <span className="font-semibold">{monthlyStats.previousMonth.dailyAverage.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Tracked:</span>
                    <span className="font-semibold">{monthlyStats.previousMonth.daysTracked}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6 lg:space-y-8">
          <Card className="p-6 lg:p-8">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Your Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-6 rounded-lg border-2 transition-all desktop-card ${
                    achievement.isUnlocked 
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    
                    {achievement.isUnlocked ? (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Unlocked!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${achievement.progress || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{achievement.progress || 0}% complete</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6 lg:space-y-8">
          <Card className="p-6 lg:p-8">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Your Goals</h3>
            <div className="space-y-6">
              {goals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-6 desktop-card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{goal.title}</h4>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {goal.current.toFixed(1)} / {goal.target.toFixed(1)}</span>
                      <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          goal.current >= goal.target ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6 lg:space-y-8">
          <Card className="p-6 lg:p-8">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg desktop-card">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-lg">
                      {getCategoryIcon(activity.category)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.activity}</p>
                      <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{activity.co2Amount.toFixed(1)} kg CO₂</p>
                    <p className="text-sm text-green-600">+{activity.pointsEarned} points</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
