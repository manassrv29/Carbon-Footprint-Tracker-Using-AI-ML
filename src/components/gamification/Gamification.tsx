import { useState } from 'react';
import { Trophy, Users, Calendar, Target, Star, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Challenge, Badge } from '../../types';
import { getUserStats } from '../../utils/storage';
import { AVAILABLE_BADGES } from '../../data/badges';

export function Gamification() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'badges'>('challenges');
  const [userStats] = useState(getUserStats());

  const activeChallenges: Challenge[] = [
    {
      id: 'green_week',
      title: 'Green Week Challenge',
      description: 'Use only eco-friendly transport for 7 days',
      icon: '🌱',
      startDate: new Date('2024-10-20'),
      endDate: new Date('2024-10-27'),
      targetMetric: 'eco_transport_days',
      targetValue: 7,
      participants: ['user_1', 'user_2', 'user_3'],
      progress: 3
    },
    {
      id: 'plant_based_month',
      title: 'Plant-Based October',
      description: 'Log 20 vegetarian or vegan meals this month',
      icon: '🥬',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-31'),
      targetMetric: 'plant_meals',
      targetValue: 20,
      participants: ['user_1', 'user_4', 'user_5'],
      progress: 12
    },
    {
      id: 'energy_saver',
      title: 'Energy Efficiency Challenge',
      description: 'Reduce energy consumption by 25% this week',
      icon: '⚡',
      startDate: new Date('2024-10-21'),
      endDate: new Date('2024-10-28'),
      targetMetric: 'energy_reduction',
      targetValue: 25,
      participants: ['user_1', 'user_6'],
      progress: 15
    }
  ];

  const leaderboardData = [
    { rank: 1, name: 'EcoWarrior2024', points: 2450, badge: '👑', reduction: '125kg' },
    { rank: 2, name: 'GreenCommuter', points: 2180, badge: '🥈', reduction: '98kg' },
    { rank: 3, name: 'PlantPowered', points: 1950, badge: '🥉', reduction: '87kg' },
    { rank: 4, name: 'You', points: userStats.ecoPoints, badge: '⭐', reduction: '65kg' },
    { rank: 5, name: 'CarbonCrusher', points: 1420, badge: '🌟', reduction: '52kg' },
    { rank: 6, name: 'SustainableSam', points: 1280, badge: '💚', reduction: '48kg' },
  ];

  const tabs = [
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'badges', label: 'Badges', icon: Award }
  ];

  const joinChallenge = (challengeId: string) => {
    alert(`Joined challenge: ${challengeId}`);
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const checkBadgeProgress = (badge: Badge) => {
    switch (badge.requirement.type) {
      case 'points':
        return Math.min((userStats.ecoPoints / badge.requirement.value) * 100, 100);
      case 'streak':
        return Math.min((userStats.streak / badge.requirement.value) * 100, 100);
      case 'reduction':
        return Math.min((userStats.totalCo2Saved / badge.requirement.value) * 100, 100);
      default:
        return 0;
    }
  };

  const isBadgeUnlocked = (badge: Badge) => {
    return userStats.badges.some(b => b.id === badge.id);
  };

  return (
    <section id="challenges" className="py-16 bg-muted-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Gamification Hub</h2>
          <p className="text-muted-600 max-w-2xl mx-auto">
            Join challenges, compete with others, and earn badges on your sustainability journey.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-muted-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-muted-600 hover:text-primary-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} hover>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{challenge.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-muted-600 mb-4">
                      {challenge.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-muted-600 mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.targetValue}</span>
                      </div>
                      <div className="w-full bg-muted-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(challenge.progress! / challenge.targetValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-600">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants.length} participants</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-600">
                        <Calendar className="w-4 h-4" />
                        <span>{getDaysRemaining(challenge.endDate)} days left</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => joinChallenge(challenge.id)}
                      className="w-full"
                    >
                      {challenge.participants.includes('user_1') ? 'Participating' : 'Join Challenge'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-warning-500" />
                  <span>Global Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboardData.map((user) => (
                    <div
                      key={user.rank}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${
                        user.name === 'You'
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-white border-muted-200 hover:bg-muted-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted-100 font-bold text-sm">
                          {user.rank}
                        </div>
                        <div className="text-2xl">{user.badge}</div>
                        <div>
                          <p className={`font-medium ${user.name === 'You' ? 'text-primary-700' : 'text-gray-900'}`}>
                            {user.name}
                          </p>
                          <p className="text-sm text-muted-600">
                            {user.reduction} CO₂ saved
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-success-600">
                          {user.points.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-600">eco points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {AVAILABLE_BADGES.map((badge) => {
              const isUnlocked = isBadgeUnlocked(badge);
              const progress = checkBadgeProgress(badge);
              
              return (
                <Card key={badge.id} hover>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale opacity-50'}`}>
                        {badge.icon}
                      </div>
                      <h3 className={`font-semibold mb-2 ${isUnlocked ? 'text-gray-900' : 'text-muted-500'}`}>
                        {badge.name}
                      </h3>
                      <p className={`text-sm mb-4 ${isUnlocked ? 'text-muted-600' : 'text-muted-400'}`}>
                        {badge.description}
                      </p>

                      {isUnlocked ? (
                        <div className="flex items-center justify-center space-x-2 text-success-600 font-medium">
                          <Star className="w-4 h-4 fill-current" />
                          <span>Unlocked!</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-full bg-muted-200 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-500">
                            {progress.toFixed(0)}% complete
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
