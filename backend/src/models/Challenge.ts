import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Define interfaces directly to avoid type conflicts
export interface ChallengeInterface {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  startDate: Date;
  endDate: Date;
  targetMetric: string;
  targetValue: number;
  rewardPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeParticipationInterface {
  id: number;
  userId: number;
  challengeId: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ChallengeCreationAttributes extends Optional<ChallengeInterface, 'id' | 'createdAt' | 'updatedAt'> {}
interface ChallengeParticipationCreationAttributes extends Optional<ChallengeParticipationInterface, 'id' | 'progress' | 'isCompleted' | 'completedAt' | 'joinedAt' | 'createdAt' | 'updatedAt'> {}

class Challenge extends Model<ChallengeInterface, ChallengeCreationAttributes> implements ChallengeInterface {
  public id!: number;
  public title!: string;
  public description!: string;
  public icon!: string;
  public category!: string;
  public startDate!: Date;
  public endDate!: Date;
  public targetMetric!: string;
  public targetValue!: number;
  public rewardPoints!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public participations?: ChallengeParticipation[];

  // Helper methods
  public isExpired(): boolean {
    return new Date() > this.endDate;
  }

  public isOngoing(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  public getDaysRemaining(): number {
    const now = new Date();
    const diffTime = this.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

class ChallengeParticipation extends Model<ChallengeParticipationInterface, ChallengeParticipationCreationAttributes> implements ChallengeParticipationInterface {
  public id!: number;
  public userId!: number;
  public challengeId!: number;
  public progress!: number;
  public isCompleted!: boolean;
  public completedAt?: Date;
  public readonly joinedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public challenge?: Challenge;

  // Helper methods
  public getProgressPercentage(): number {
    return Math.min(100, (this.progress / 100) * 100);
  }
}

Challenge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    targetMetric: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    targetValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    rewardPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'challenges',
    indexes: [
      {
        fields: ['isActive'],
      },
      {
        fields: ['startDate', 'endDate'],
      },
      {
        fields: ['category'],
      },
    ],
  }
);

ChallengeParticipation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    challengeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    progress: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'challenge_participations',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'challengeId'],
      },
      {
        fields: ['isCompleted'],
      },
    ],
  }
);

// Associations will be defined in models/index.ts to avoid circular dependencies

export { Challenge, ChallengeParticipation };
