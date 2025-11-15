import bcrypt from 'bcryptjs';
import { User, Organization } from '../models';

export const seedUsers = async (): Promise<void> => {
  try {
    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seeding');
      return;
    }

    // Create test organization for corporate users
    const testOrg = await Organization.create({
      name: 'Test Corporation',
      domain: 'testcorp.com',
      industry: 'Technology',
      size: 'medium',
      country: 'USA',
      website: 'https://testcorp.com',
      description: 'A test organization for development purposes',
    });

    // Hash password for test users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test users
    const testUsers = [
      {
        email: 'user@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'user' as const,
        organizationId: undefined,
        level: 1,
        ecoPoints: 0,
        streak: 0,
        totalCo2Saved: 0,
        dailyTarget: 50,
        isActive: true,
      },
      {
        email: 'corporate@test.com',
        password: hashedPassword,
        firstName: 'Corporate',
        lastName: 'Admin',
        role: 'corporate' as const,
        organizationId: testOrg.id,
        level: 1,
        ecoPoints: 0,
        streak: 0,
        totalCo2Saved: 0,
        dailyTarget: 50,
        isActive: true,
      },
      {
        email: 'demo@example.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'Account',
        role: 'user' as const,
        organizationId: undefined,
        level: 5,
        ecoPoints: 1250,
        streak: 7,
        totalCo2Saved: 45.6,
        dailyTarget: 40,
        isActive: true,
      }
    ];

    await User.bulkCreate(testUsers);

    console.log('✅ Test users seeded successfully:');
    console.log('   - user@test.com (password: password123)');
    console.log('   - corporate@test.com (password: password123)');
    console.log('   - demo@example.com (password: password123)');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};
