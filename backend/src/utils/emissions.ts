import { EmissionFactor } from '../models';
import { Op } from 'sequelize';

// Enhanced emission factors based on IPCC 2023 data (kg CO2 per unit)
export const DEFAULT_EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.21, // per km
    car_diesel: 0.17, // per km
    car_electric: 0.05, // per km (varies by grid)
    car_hybrid: 0.12, // per km
    bus: 0.089, // per km
    train: 0.041, // per km
    flight_domestic: 0.255, // per km
    flight_international: 0.195, // per km
    flight_short: 0.285, // per km (<500km)
    motorcycle: 0.113, // per km
    scooter: 0.065, // per km
    bicycle: 0, // per km
    walking: 0, // per km
    subway: 0.028, // per km
    taxi: 0.25, // per km
    rideshare: 0.18, // per km (shared)
  },
  food: {
    beef: 27.0, // per kg
    lamb: 24.5, // per kg
    pork: 12.1, // per kg
    chicken: 6.9, // per kg
    turkey: 10.9, // per kg
    fish_farmed: 6.1, // per kg
    fish_wild: 2.9, // per kg
    seafood: 11.9, // per kg
    dairy_milk: 3.2, // per liter
    cheese: 13.5, // per kg
    butter: 23.8, // per kg
    yogurt: 2.2, // per kg
    eggs: 4.8, // per kg
    vegetables_local: 2.0, // per kg
    vegetables_imported: 3.5, // per kg
    fruits_local: 1.1, // per kg
    fruits_imported: 2.3, // per kg
    grains: 1.4, // per kg
    rice: 2.7, // per kg
    legumes: 0.9, // per kg
    nuts: 2.3, // per kg
    processed_food: 5.2, // per kg
  },
  energy: {
    electricity_grid: 0.5, // per kWh (average)
    electricity_coal: 0.82, // per kWh
    electricity_gas: 0.35, // per kWh
    natural_gas: 0.185, // per kWh
    heating_oil: 0.264, // per liter
    propane: 0.214, // per liter
    coal: 0.354, // per kg
    solar: 0.041, // per kWh
    wind: 0.011, // per kWh
    hydro: 0.024, // per kWh
    nuclear: 0.012, // per kWh
    biomass: 0.23, // per kWh
  },
  waste: {
    landfill: 0.57, // per kg
    recycling: 0.21, // per kg
    composting: 0.12, // per kg
    incineration: 0.89, // per kg
  },
  water: {
    tap_water: 0.0004, // per liter
    bottled_water: 0.25, // per liter
    hot_water: 0.0015, // per liter
  },
};

export const calculateCO2Emission = async (
  category: string,
  activityType: string,
  value: number,
  region?: string
): Promise<number> => {
  try {
    // Try to get emission factor from database
    const whereClause: any = {
      category,
      type: activityType,
      isActive: true,
    };
    
    if (region) {
      whereClause.region = region;
    } else {
      whereClause.region = { [Op.or]: [null, 'global'] };
    }

    const emissionFactor = await EmissionFactor.findOne({
      where: whereClause,
    });

    if (emissionFactor) {
      return emissionFactor.calculateEmission(value);
    }

    // Fallback to default factors
    const categoryFactors = DEFAULT_EMISSION_FACTORS[category as keyof typeof DEFAULT_EMISSION_FACTORS];
    if (categoryFactors && categoryFactors[activityType as keyof typeof categoryFactors]) {
      const factor = categoryFactors[activityType as keyof typeof categoryFactors];
      return value * factor;
    }

    // Default fallback
    console.warn(`No emission factor found for ${category}:${activityType}`);
    return value * 0.1; // Conservative estimate
  } catch (error) {
    console.error('Error calculating CO2 emission:', error);
    return value * 0.1; // Conservative fallback
  }
};

export const calculateEcoPoints = (co2Kg: number, category: string): number => {
  // Base points calculation: 10 points per kg CO2 saved
  let basePoints = Math.floor(co2Kg * 10);

  // Category multipliers for gamification
  const categoryMultipliers = {
    transport: 1.2,
    food: 1.0,
    energy: 1.1,
    other: 0.8,
  };

  const multiplier = categoryMultipliers[category as keyof typeof categoryMultipliers] || 1.0;
  return Math.floor(basePoints * multiplier);
};

export const calculateUserLevel = (ecoPoints: number): number => {
  return Math.floor(ecoPoints / 1000) + 1;
};

export const getNextLevelProgress = (ecoPoints: number): { current: number; next: number; progress: number } => {
  const currentLevel = calculateUserLevel(ecoPoints);
  const currentLevelPoints = (currentLevel - 1) * 1000;
  const nextLevelPoints = currentLevel * 1000;
  const progress = ((ecoPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  return {
    current: currentLevel,
    next: currentLevel + 1,
    progress: Math.min(100, Math.max(0, progress)),
  };
};

export const getRealWorldEquivalents = (co2Kg: number) => {
  return {
    trees: Math.ceil(co2Kg / 22), // Trees needed to offset (22kg CO2 per tree per year)
    carDistance: Math.floor(co2Kg / 0.21), // Equivalent km in petrol car
    energySaved: Math.floor(co2Kg / 0.5), // Equivalent kWh of electricity
    waterImpact: Math.floor(co2Kg * 1000), // Equivalent liters of water saved
  };
};

export const getCategoryBreakdown = (carbonLogs: any[]): { [key: string]: number } => {
  const breakdown = carbonLogs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + log.co2Kg;
    return acc;
  }, {});

  return breakdown;
};

export const getWeeklyEmissions = (carbonLogs: any[]): number[] => {
  const weeklyData = new Array(7).fill(0);
  const today = new Date();
  
  carbonLogs.forEach(log => {
    const logDate = new Date(log.timestamp);
    const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 0 && daysDiff < 7) {
      weeklyData[6 - daysDiff] += log.co2Kg;
    }
  });

  return weeklyData;
};
