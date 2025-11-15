import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User as UserInterface } from '../types';

interface UserCreationAttributes extends Optional<UserInterface, 'id' | 'role' | 'organizationId' | 'level' | 'ecoPoints' | 'streak' | 'totalCo2Saved' | 'weeklyReduction' | 'dailyTarget' | 'isActive' | 'lastLoginAt' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserInterface, UserCreationAttributes> implements UserInterface {
  public id!: number;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public avatar?: string;
  public role!: 'user' | 'corporate';
  public organizationId?: number;
  public level!: number;
  public ecoPoints!: number;
  public streak!: number;
  public totalCo2Saved!: number;
  public weeklyReduction!: number;
  public dailyTarget!: number;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public settings?: string;
  public longestStreak?: number;
  public lastActiveDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public carbonLogs?: any[];
  public achievements?: any[];
  public challengeParticipations?: any[];
  public organization?: any;

  // Helper methods
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public updateLevel(): void {
    this.level = Math.floor(this.ecoPoints / 1000) + 1;
  }

  public addEcoPoints(points: number): void {
    this.ecoPoints += points;
    this.updateLevel();
  }

  public isUser(): boolean {
    return this.role === 'user';
  }

  public isCorporate(): boolean {
    return this.role === 'corporate';
  }

  public hasOrganization(): boolean {
    return this.organizationId !== null && this.organizationId !== undefined;
  }

  public updateStreak(lastActivity: Date): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const activityDate = new Date(lastActivity);
    activityDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === today.getTime()) {
      // Activity today, streak continues
      return;
    } else if (activityDate.getTime() === yesterday.getTime()) {
      // Activity yesterday, increment streak
      this.streak += 1;
    } else {
      // No recent activity, reset streak
      this.streak = 1;
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'corporate'),
      allowNull: false,
      defaultValue: 'user',
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    ecoPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalCo2Saved: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    weeklyReduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    dailyTarget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50.0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    settings: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    lastActiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'Users',
  }
);

export default User;
