import { Badge, Challenge, EmissionFactor } from '../models';
import { connectDatabase } from '../config/database';

const seedBadges = async (): Promise<void> => {
  const badges = [
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Log your first carbon footprint activity',
      icon: '🌱',
      category: 'getting_started',
      requirement: { type: 'activity' as const, value: 1 },
      isActive: true,
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      description: 'Maintain a 7-day streak',
      icon: '⚔️',
      category: 'consistency',
      requirement: { type: 'streak' as const, value: 7 },
      isActive: true,
    },
    {
      id: 'carbon_saver',
      name: 'Carbon Saver',
      description: 'Save 100kg of CO₂',
      icon: '💚',
      category: 'impact',
      requirement: { type: 'reduction' as const, value: 100 },
      isActive: true,
    },
    {
      id: 'point_collector',
      name: 'Point Collector',
      description: 'Earn 1000 eco points',
      icon: '⭐',
      category: 'gamification',
      requirement: { type: 'points' as const, value: 1000 },
      isActive: true,
    },
    {
      id: 'green_commuter',
      name: 'Green Commuter',
      description: 'Log 50 sustainable transport activities',
      icon: '🚲',
      category: 'transport',
      requirement: { type: 'activity' as const, value: 50, condition: 'transport' },
      isActive: true,
    },
    {
      id: 'plant_based',
      name: 'Plant Based',
      description: 'Log 30 plant-based meals',
      icon: '🥗',
      category: 'food',
      requirement: { type: 'activity' as const, value: 30, condition: 'food' },
      isActive: true,
    },
    {
      id: 'energy_efficient',
      name: 'Energy Efficient',
      description: 'Log 25 energy-saving activities',
      icon: '⚡',
      category: 'energy',
      requirement: { type: 'activity' as const, value: 25, condition: 'energy' },
      isActive: true,
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      description: 'Maintain a 30-day streak',
      icon: '👑',
      category: 'consistency',
      requirement: { type: 'streak' as const, value: 30 },
      isActive: true,
    },
  ];

  for (const badge of badges) {
    await Badge.upsert(badge);
  }

  console.log('✅ Badges seeded successfully');
};

const seedChallenges = async (): Promise<void> => {
  const now = new Date();
  const challenges = [
    {
      title: 'Green Week Challenge',
      description: 'Reduce your carbon footprint by 20% this week through sustainable choices',
      icon: '🌿',
      category: 'weekly',
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      targetMetric: 'co2_reduction_percentage',
      targetValue: 20,
      rewardPoints: 500,
      isActive: true,
    },
    {
      title: 'Plant-Based October',
      description: 'Eat plant-based meals for the entire month and track your impact',
      icon: '🥬',
      category: 'monthly',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      targetMetric: 'plant_based_meals',
      targetValue: 60,
      rewardPoints: 1000,
      isActive: true,
    },
    {
      title: 'Car-Free Challenge',
      description: 'Use only sustainable transport methods for 2 weeks',
      icon: '🚲',
      category: 'transport',
      startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      targetMetric: 'sustainable_transport_days',
      targetValue: 14,
      rewardPoints: 750,
      isActive: true,
    },
    {
      title: 'Energy Saver Sprint',
      description: 'Reduce energy consumption by 30% in your home this month',
      icon: '💡',
      category: 'energy',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      targetMetric: 'energy_reduction_percentage',
      targetValue: 30,
      rewardPoints: 800,
      isActive: true,
    },
  ];

  for (const challenge of challenges) {
    await Challenge.create(challenge);
  }

  console.log('✅ Challenges seeded successfully');
};

const seedEmissionFactors = async (): Promise<void> => {
  const emissionFactors = [
    // Transport
    { category: 'transport', type: 'car_petrol', factor: 0.21, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'car_diesel', factor: 0.17, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'car_electric', factor: 0.05, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'bus', factor: 0.089, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'train', factor: 0.041, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'flight_domestic', factor: 0.255, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'flight_international', factor: 0.195, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'motorcycle', factor: 0.113, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'bicycle', factor: 0, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },
    { category: 'transport', type: 'walking', factor: 0, unit: 'kg_co2_per_km', source: 'IPCC 2021', isActive: true },

    // Food
    { category: 'food', type: 'beef', factor: 27.0, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'pork', factor: 12.1, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'chicken', factor: 6.9, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'fish', factor: 6.1, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'dairy', factor: 3.2, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'eggs', factor: 4.8, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'vegetables', factor: 2.0, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'fruits', factor: 1.1, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'grains', factor: 1.4, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },
    { category: 'food', type: 'legumes', factor: 0.9, unit: 'kg_co2_per_kg', source: 'FAO 2019', isActive: true },

    // Energy
    { category: 'energy', type: 'electricity', factor: 0.5, unit: 'kg_co2_per_kwh', source: 'IEA 2021', isActive: true },
    { category: 'energy', type: 'natural_gas', factor: 0.185, unit: 'kg_co2_per_kwh', source: 'IEA 2021', isActive: true },
    { category: 'energy', type: 'heating_oil', factor: 0.264, unit: 'kg_co2_per_liter', source: 'IEA 2021', isActive: true },
    { category: 'energy', type: 'coal', factor: 0.354, unit: 'kg_co2_per_kg', source: 'IEA 2021', isActive: true },
    { category: 'energy', type: 'solar', factor: 0.041, unit: 'kg_co2_per_kwh', source: 'IEA 2021', isActive: true },
    { category: 'energy', type: 'wind', factor: 0.011, unit: 'kg_co2_per_kwh', source: 'IEA 2021', isActive: true },
    { category: 'energy', type: 'hydro', factor: 0.024, unit: 'kg_co2_per_kwh', source: 'IEA 2021', isActive: true },
  ];

  for (const factor of emissionFactors) {
    await EmissionFactor.create(factor);
  }

  console.log('✅ Emission factors seeded successfully');
};

const runSeeders = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDatabase();
    
    await seedEmissionFactors();
    await seedBadges();
    await seedChallenges();
    
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders();
}

export { seedBadges, seedChallenges, seedEmissionFactors };
