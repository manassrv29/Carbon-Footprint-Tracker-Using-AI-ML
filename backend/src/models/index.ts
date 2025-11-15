import sequelize from '../config/database';
import User from './User';
import Organization from './Organization';
import CarbonLog from './CarbonLog';
import EmissionFactor from './EmissionFactor';
import { Challenge, ChallengeParticipation } from './Challenge';
import { Achievement, Badge } from './Achievement';
import MLPrediction from './MLPrediction';

// Flag to prevent duplicate association initialization
let associationsInitialized = false;

// Function to initialize associations
export const initializeAssociations = () => {
  if (associationsInitialized) {
    return;
  }

  // User-Organization associations
  User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
  Organization.hasMany(User, { foreignKey: 'organizationId', as: 'employees' });

  // Carbon log associations
  User.hasMany(CarbonLog, { foreignKey: 'userId', as: 'carbonLogs' });
  CarbonLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Achievement associations
  User.hasMany(Achievement, { foreignKey: 'userId', as: 'achievements' });
  Achievement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Achievement.belongsTo(Badge, { foreignKey: 'badgeId', as: 'badge' });
  Badge.hasMany(Achievement, { foreignKey: 'badgeId', as: 'achievements' });

  // Challenge associations
  Challenge.hasMany(ChallengeParticipation, { foreignKey: 'challengeId', as: 'participations' });
  ChallengeParticipation.belongsTo(Challenge, { foreignKey: 'challengeId', as: 'challenge' });
  ChallengeParticipation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(ChallengeParticipation, { foreignKey: 'userId', as: 'challengeParticipations' });

  // ML Prediction associations
  User.hasMany(MLPrediction, { foreignKey: 'userId', as: 'mlPredictions' });
  MLPrediction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  associationsInitialized = true;
};

export {
  sequelize,
  User,
  Organization,
  CarbonLog,
  EmissionFactor,
  Challenge,
  ChallengeParticipation,
  Achievement,
  Badge,
  MLPrediction,
};

// Export database instance for sync operations
export default sequelize;
