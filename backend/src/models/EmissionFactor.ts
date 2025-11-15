import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { EmissionFactor as EmissionFactorInterface } from '../types';

interface EmissionFactorCreationAttributes extends Optional<EmissionFactorInterface, 'id' | 'region' | 'createdAt' | 'updatedAt'> {}

class EmissionFactor extends Model<EmissionFactorInterface, EmissionFactorCreationAttributes> implements EmissionFactorInterface {
  public id!: number;
  public category!: string;
  public type!: string;
  public factor!: number;
  public unit!: string;
  public source!: string;
  public region?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public calculateEmission(value: number): number {
    return value * this.factor;
  }
}

EmissionFactor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    factor: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    tableName: 'emission_factors',
    indexes: [
      {
        unique: true,
        fields: ['category', 'type', 'region'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default EmissionFactor;
