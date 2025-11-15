import React, { useState, useEffect } from 'react';
import { Brain, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import RecommendationForm from './RecommendationForm';
import CarbonEmissionForm from './CarbonEmissionForm';
import FuturePredictionForm from './FuturePredictionForm';
import mlService from '../../services/mlService';

type ActiveTab = 'recommendations' | 'current' | 'future';

const MLDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('recommendations');
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    checkMLHealth();
    loadModelInfo();
  }, []);

  const checkMLHealth = async () => {
    try {
      const health = await mlService.checkHealth();
      setHealthStatus(health.status === 'healthy' ? 'healthy' : 'unhealthy');
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus('unhealthy');
    }
  };

  const loadModelInfo = async () => {
    try {
      const info = await mlService.getModelInfo();
      setModelInfo(info);
    } catch (error) {
      console.error('Failed to load model info:', error);
    }
  };

  const tabs = [
    {
      id: 'recommendations' as ActiveTab,
      label: 'Recommendations',
      description: 'Get personalized suggestions to reduce your carbon footprint',
      icon: Brain
    },
    {
      id: 'current' as ActiveTab,
      label: 'Current Emission',
      description: 'Calculate your current carbon emission based on lifestyle',
      icon: Activity
    },
    {
      id: 'future' as ActiveTab,
      label: 'Future Prediction',
      description: 'Predict future emissions based on current trends',
      icon: Activity
    }
  ];

  const renderHealthStatus = () => {
    if (healthStatus === 'checking') {
      return (
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm">Checking ML service...</span>
        </div>
      );
    }

    if (healthStatus === 'healthy') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">ML service is healthy</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">ML service unavailable</span>
      </div>
    );
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'recommendations':
        return <RecommendationForm />;
      case 'current':
        return <CarbonEmissionForm />;
      case 'future':
        return <FuturePredictionForm />;
      default:
        return <RecommendationForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16" style={{ maxWidth: '1600px' }}>
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" />
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">AI-Powered Carbon Analytics</h1>
          </div>
          <p className="text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Leverage machine learning models to analyze your carbon footprint, get personalized recommendations, 
            and predict future environmental impact.
          </p>
          
          {/* Health Status */}
          <div className="mt-4 lg:mt-6 flex justify-center">
            {renderHealthStatus()}
          </div>
        </div>

        {/* Model Information */}
        {modelInfo && (
          <div className="mb-6 lg:mb-8 bg-white p-4 lg:p-6 xl:p-8 rounded-lg shadow-sm border">
            <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800 mb-4">Available ML Models</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {modelInfo.models.map((model: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 lg:p-5 rounded-lg hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium lg:font-semibold text-gray-800 text-base lg:text-lg">{model.name}</h4>
                  <p className="text-sm lg:text-base text-gray-600 mt-2 leading-relaxed">{model.description}</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs lg:text-sm rounded-full font-medium">
                    {model.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6 lg:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap justify-center lg:justify-start space-x-4 lg:space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-2 lg:px-4 border-b-2 font-medium text-sm lg:text-base transition-all duration-200 ${
                      isActive
                        ? 'border-blue-500 text-blue-600 scale-105'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:scale-102'
                    }`}
                  >
                    <Icon
                      className={`-ml-0.5 mr-2 lg:mr-3 h-5 w-5 lg:h-6 lg:w-6 transition-colors ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className="text-xs lg:text-sm text-gray-400 font-normal hidden sm:block leading-tight">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {healthStatus === 'unhealthy' ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">ML Service Unavailable</h3>
              <p className="text-red-700 mb-4">
                The machine learning service is currently unavailable. Please check that:
              </p>
              <ul className="text-left text-red-700 max-w-md mx-auto space-y-1">
                <li>• The backend server is running</li>
                <li>• Python dependencies are installed</li>
                <li>• TensorFlow Lite models are properly loaded</li>
              </ul>
              <button
                onClick={checkMLHealth}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry Health Check
              </button>
            </div>
          ) : (
            renderActiveComponent()
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Powered by TensorFlow Lite • Models trained on sustainable lifestyle data • 
            Predictions are estimates based on current patterns
          </p>
        </div>
      </div>
    </div>
  );
};

export default MLDashboard;
