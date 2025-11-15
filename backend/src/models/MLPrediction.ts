import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Define the attributes interface
export interface MLPredictionAttributes {
  id: number;
  userId: number;
  predictionType: 'recommendation' | 'carbon_emission' | 'future_prediction';
  inputData: object;
  outputData: object;
  userProfile?: object;
  createdAt: Date;
  updatedAt: Date;
}

// Define the creation attributes (optional id, createdAt, updatedAt)
interface MLPredictionCreationAttributes extends Optional<MLPredictionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'userProfile'> {}

// Define the model class
class MLPrediction extends Model<MLPredictionAttributes, MLPredictionCreationAttributes> implements MLPredictionAttributes {
  public id!: number;
  public userId!: number;
  public predictionType!: 'recommendation' | 'carbon_emission' | 'future_prediction';
  public inputData!: object;
  public outputData!: object;
  public userProfile?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
MLPrediction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    predictionType: {
      type: DataTypes.ENUM('recommendation', 'carbon_emission', 'future_prediction'),
      allowNull: false,
      comment: 'Type of ML prediction made',
    },
    inputData: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Input data provided by user for ML prediction',
    },
    outputData: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'ML model prediction results',
    },
    userProfile: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'User profile data generated for recommendations',
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
    tableName: 'ml_predictions',
    modelName: 'MLPrediction',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
        name: 'ml_predictions_user_id',
      },
      {
        fields: ['predictionType'],
        name: 'ml_predictions_type',
      },
      {
        fields: ['createdAt'],
        name: 'ml_predictions_created_at',
      },
      {
        fields: ['userId', 'predictionType'],
        name: 'ml_predictions_user_type',
      },
    ],
  }
);

export default MLPrediction;
