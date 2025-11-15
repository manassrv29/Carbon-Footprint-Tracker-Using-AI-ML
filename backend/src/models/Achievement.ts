import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Achievement as AchievementInterface, Badge as BadgeInterface } from '../types';
import User from './User';

interface AchievementCreationAttributes extends Optional<AchievementInterface, 'id' | 'createdAt'> {}
interface BadgeCreationAttributes extends Optional<BadgeInterface, 'createdAt' | 'updatedAt'> {}

class Achievement extends Model<AchievementInterface, AchievementCreationAttributes> implements AchievementInterface {
  public id!: number;
  public userId!: number;
  public badgeId!: string;
  public unlockedAt!: Date;
  public readonly createdAt!: Date;

  // Association properties
  public user?: any;
  public badge?: any;
}

class Badge extends Model<BadgeInterface, BadgeCreationAttributes> implements BadgeInterface {
  public id!: string;
  public name!: string;
  public description!: string;
  public icon!: string;
  public category!: string;
  public requirement!: {
    type: 'streak' | 'reduction' | 'points' | 'activity';
    value: number;
    condition?: string;
  };
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public achievements?: any[];

  // Helper methods
  public checkRequirement(user: User, carbonLogs: any[]): boolean {
    switch (this.requirement.type) {
      case 'streak':
        return user.streak >= this.requirement.value;
      case 'points':
        return user.ecoPoints >= this.requirement.value;
      case 'reduction':
        return user.totalCo2Saved >= this.requirement.value;
      case 'activity':
        return carbonLogs.length >= this.requirement.value;
      default:
        return false;
    }
  }
}

Achievement.init(
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
    badgeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    unlockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'achievements',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'badgeId'],
      },
      {
        fields: ['userId'],
      },
    ],
  }
);

Badge.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
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
    requirement: {
      type: DataTypes.JSON,
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
    tableName: 'badges',
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

// Associations will be defined in models/index.ts to avoid circular dependencies

export { Achievement, Badge };
