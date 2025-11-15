import type { Badge } from '../types';

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_log',
    name: 'Getting Started',
    description: 'Log your first carbon activity',
    icon: '🌱',
    requirement: { type: 'activity', value: 1 }
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Log activities for 7 consecutive days',
    icon: '🔥',
    requirement: { type: 'streak', value: 7 }
  },
  {
    id: 'month_streak',
    name: 'Monthly Master',
    description: 'Log activities for 30 consecutive days',
    icon: '💪',
    requirement: { type: 'streak', value: 30 }
  },
  {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    description: 'Earn 1000 eco points',
    icon: '⚡',
    requirement: { type: 'points', value: 1000 }
  },
  {
    id: 'carbon_saver',
    name: 'Carbon Saver',
    description: 'Reduce emissions by 50kg CO₂',
    icon: '🌍',
    requirement: { type: 'reduction', value: 50 }
  },
  {
    id: 'green_commuter',
    name: 'Green Commuter',
    description: 'Use eco-friendly transport 20 times',
    icon: '🚲',
    requirement: { type: 'activity', value: 20 }
  },
  {
    id: 'plant_based',
    name: 'Plant Powered',
    description: 'Log 30 vegetarian/vegan meals',
    icon: '🥬',
    requirement: { type: 'activity', value: 30 }
  },
  {
    id: 'energy_saver',
    name: 'Energy Saver',
    description: 'Track renewable energy usage 10 times',
    icon: '☀️',
    requirement: { type: 'activity', value: 10 }
  },
  {
    id: 'climate_champion',
    name: 'Climate Champion',
    description: 'Reduce emissions by 500kg CO₂',
    icon: '🏆',
    requirement: { type: 'reduction', value: 500 }
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Log activities for 100 consecutive days',
    icon: '👑',
    requirement: { type: 'streak', value: 100 }
  }
];
