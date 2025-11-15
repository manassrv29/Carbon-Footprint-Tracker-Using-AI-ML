export interface CarbonLog {
  id: string;
  category: 'transport' | 'food' | 'energy' | 'other';
  activityType: string;
  value: number;
  co2Kg: number;
  timestamp: Date;
  source: 'manual' | 'gps' | 'ocr' | 'api';
}

export interface UserStats {
  userId: string;
  level: number;
  ecoPoints: number;
  streak: number;
  weeklyReduction: number;
  totalCo2Saved: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  requirement: {
    type: 'streak' | 'reduction' | 'points' | 'activity';
    value: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  startDate: Date;
  endDate: Date;
  targetMetric: string;
  targetValue: number;
  participants: string[];
  progress?: number;
}

export interface EmissionFactor {
  category: string;
  type: string;
  factor: number; // kg CO2 per unit
  unit: string;
}

export interface DailyEmission {
  date: string;
  transport: number;
  food: number;
  energy: number;
  total: number;
  target: number;
}
