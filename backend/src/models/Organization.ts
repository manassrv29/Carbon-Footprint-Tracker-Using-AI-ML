import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface OrganizationInterface {
  id: number;
  name: string;
  domain?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  country?: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface OrganizationCreationAttributes extends Optional<OrganizationInterface, 'id' | 'domain' | 'industry' | 'size' | 'country' | 'website' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Organization extends Model<OrganizationInterface, OrganizationCreationAttributes> implements OrganizationInterface {
  public id!: number;
  public name!: string;
  public domain?: string;
  public industry?: string;
  public size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  public country?: string;
  public website?: string;
  public description?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public employees?: any[];

  // Helper methods
  public getEmployeeCount(): string {
    const sizeMap = {
      startup: '1-10',
      small: '11-50',
      medium: '51-200',
      large: '201-1000',
      enterprise: '1000+',
    };
    return this.size ? sizeMap[this.size] : 'Unknown';
  }

  public getDomainFromEmail(email: string): boolean {
    if (!this.domain) return false;
    const emailDomain = email.split('@')[1];
    return emailDomain === this.domain;
  }
}

Organization.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isLowercase: true,
      },
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    size: {
      type: DataTypes.ENUM('startup', 'small', 'medium', 'large', 'enterprise'),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: 'Organizations',
  }
);

export default Organization;
