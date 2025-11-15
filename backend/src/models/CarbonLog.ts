import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { CarbonLog as CarbonLogInterface } from '../types';
import User from './User';

interface CarbonLogCreationAttributes extends Optional<CarbonLogInterface, 'id' | 'createdAt' | 'updatedAt'> {}

class CarbonLog extends Model<CarbonLogInterface, CarbonLogCreationAttributes> implements CarbonLogInterface {
  public id!: number;
  public userId!: number;
  public category!: 'transport' | 'food' | 'energy' | 'other';
  public activityType!: string;
  public value!: number;
  public co2Kg!: number;
  public source!: 'manual' | 'gps' | 'ocr' | 'api';
  public metadata?: any;
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public user?: any;

  // Helper methods
  public getEcoPoints(): number {
    // Calculate eco points based on CO2 saved (assuming baseline emissions)
    return Math.floor(this.co2Kg * 10);
  }
}

CarbonLog.init(
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
    category: {
      type: DataTypes.ENUM('transport', 'food', 'energy', 'other'),
      allowNull: false,
    },
    activityType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    co2Kg: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    source: {
      type: DataTypes.ENUM('manual', 'gps', 'ocr', 'api'),
      allowNull: false,
      defaultValue: 'manual',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'carbon_logs',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['userId', 'timestamp'],
      },
    ],
  }
);

// Associations moved to models/index.ts

export default CarbonLog;
