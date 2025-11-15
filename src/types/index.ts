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

// GPS and Location Types
export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export interface TravelRoute {
  id: string;
  startLocation: Location;
  endLocation: Location;
  distance: number; // in kilometers
  duration: number; // in minutes
  transportMode: 'walking' | 'cycling' | 'two_wheeler' | 'driving' | 'public_transport';
  avgSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  co2Emissions: number; // in kg
  confidence: number; // confidence in transport mode detection (0-1)
  createdAt: Date;
}

export interface GPSTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  minDistanceThreshold?: number; // minimum distance to consider as movement (meters)
  trackingInterval?: number; // tracking interval in milliseconds
}
