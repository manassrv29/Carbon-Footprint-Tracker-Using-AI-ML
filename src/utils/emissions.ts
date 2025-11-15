import type { EmissionFactor } from '../types';

// IPCC emission factors and data sources
export const EMISSION_FACTORS: EmissionFactor[] = [
  // Transport (kg CO2 per km)
  { category: 'transport', type: 'car_petrol', factor: 0.192, unit: 'km' },
  { category: 'transport', type: 'car_diesel', factor: 0.171, unit: 'km' },
  { category: 'transport', type: 'car_electric', factor: 0.053, unit: 'km' },
  { category: 'transport', type: 'car_hybrid', factor: 0.109, unit: 'km' },
  { category: 'transport', type: 'bus', factor: 0.089, unit: 'km' },
  { category: 'transport', type: 'train', factor: 0.041, unit: 'km' },
  { category: 'transport', type: 'subway', factor: 0.028, unit: 'km' },
  { category: 'transport', type: 'bicycle', factor: 0, unit: 'km' },
  { category: 'transport', type: 'walking', factor: 0, unit: 'km' },
  { category: 'transport', type: 'motorcycle', factor: 0.113, unit: 'km' },
  { category: 'transport', type: 'flight_domestic', factor: 0.255, unit: 'km' },
  { category: 'transport', type: 'flight_international', factor: 0.195, unit: 'km' },
  
  // Food (kg CO2 per meal/serving)
  { category: 'food', type: 'beef', factor: 6.61, unit: 'meal' },
  { category: 'food', type: 'lamb', factor: 5.94, unit: 'meal' },
  { category: 'food', type: 'pork', factor: 1.21, unit: 'meal' },
  { category: 'food', type: 'chicken', factor: 0.879, unit: 'meal' },
  { category: 'food', type: 'fish', factor: 1.24, unit: 'meal' },
  { category: 'food', type: 'vegetarian', factor: 0.38, unit: 'meal' },
  { category: 'food', type: 'vegan', factor: 0.25, unit: 'meal' },
  { category: 'food', type: 'dairy', factor: 0.72, unit: 'serving' },
  { category: 'food', type: 'processed', factor: 1.85, unit: 'meal' },
  
  // Energy (kg CO2 per kWh) - average grid intensity
  { category: 'energy', type: 'electricity', factor: 0.475, unit: 'kWh' },
  { category: 'energy', type: 'natural_gas', factor: 0.185, unit: 'kWh' },
  { category: 'energy', type: 'heating_oil', factor: 0.245, unit: 'kWh' },
  { category: 'energy', type: 'renewable', factor: 0.02, unit: 'kWh' },
];

export function calculateEmission(category: string, type: string, value: number): number {
  const factor = EMISSION_FACTORS.find(f => f.category === category && f.type === type);
  if (!factor) {
    console.warn(`No emission factor found for ${category}:${type}`);
    return 0;
  }
  return factor.factor * value;
}

export function getEmissionFactor(category: string, type: string): EmissionFactor | undefined {
  return EMISSION_FACTORS.find(f => f.category === category && f.type === type);
}

export function formatCO2(kg: number): string {
  if (kg < 1) {
    return `${Math.round(kg * 1000)}g CO₂`;
  } else if (kg < 1000) {
    return `${kg.toFixed(2)}kg CO₂`;
  } else {
    return `${(kg / 1000).toFixed(2)}t CO₂`;
  }
}

export function calculateEcoPoints(co2Saved: number): number {
  // 1 kg CO2 saved = 10 eco points
  return Math.round(co2Saved * 10);
}

export function calculateLevel(ecoPoints: number): number {
  // Level progression: 100 points per level initially, increasing by 50 each level
  let level = 1;
  let pointsNeeded = 100;
  let totalPoints = 0;
  
  while (totalPoints + pointsNeeded <= ecoPoints) {
    totalPoints += pointsNeeded;
    level++;
    pointsNeeded += 50;
  }
  
  return level;
}

export function getPointsForNextLevel(currentPoints: number): { current: number; needed: number; total: number } {
  const currentLevel = calculateLevel(currentPoints);
  let totalPointsForCurrentLevel = 0;
  let pointsPerLevel = 100;
  
  for (let i = 1; i < currentLevel; i++) {
    totalPointsForCurrentLevel += pointsPerLevel;
    pointsPerLevel += 50;
  }
  
  const pointsInCurrentLevel = currentPoints - totalPointsForCurrentLevel;
  const pointsNeededForNextLevel = pointsPerLevel;
  
  return {
    current: pointsInCurrentLevel,
    needed: pointsNeededForNextLevel - pointsInCurrentLevel,
    total: pointsNeededForNextLevel
  };
}
