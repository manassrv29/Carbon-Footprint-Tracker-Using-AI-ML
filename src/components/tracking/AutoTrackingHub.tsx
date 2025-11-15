import { useState } from 'react';
import { MapPin, Camera, Scan, TrendingUp, Info } from 'lucide-react';
import { GPSTracker } from './GPSTracker';
import { OCRScanner } from './OCRScanner';
import { BarcodeScanner } from './BarcodeScanner';
import { Card } from '../ui/Card';
import type { TravelRoute, Location } from '../../types';
import type { BillData } from '../../services/ocrService';
import type { FoodCarbonData } from '../../services/barcodeService';

interface AutoTrackingStats {
  totalRoutes: number;
  totalBills: number;
  totalFoodItems: number;
  totalCO2Saved: number;
}

export const AutoTrackingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gps' | 'ocr' | 'barcode'>('gps');
  const [stats, setStats] = useState<AutoTrackingStats>({
    totalRoutes: 0,
    totalBills: 0,
    totalFoodItems: 0,
    totalCO2Saved: 0,
  });

  const tabs = [
    {
      id: 'gps' as const,
      label: 'GPS Tracking',
      icon: <MapPin className="w-5 h-5" />,
      description: 'Auto-detect travel routes',
    },
    {
      id: 'ocr' as const,
      label: 'Bill Scanner',
      icon: <Camera className="w-5 h-5" />,
      description: 'Scan utility bills & receipts',
    },
    {
      id: 'barcode' as const,
      label: 'Food Scanner',
      icon: <Scan className="w-5 h-5" />,
      description: 'Scan packaged food items',
    },
  ];

  const handleRouteDetected = (route: TravelRoute) => {
    setStats(prev => ({
      ...prev,
      totalRoutes: prev.totalRoutes + 1,
      totalCO2Saved: prev.totalCO2Saved + route.co2Emissions,
    }));
  };

  const handleBillProcessed = (billData: BillData) => {
    setStats(prev => ({
      ...prev,
      totalBills: prev.totalBills + 1,
      totalCO2Saved: prev.totalCO2Saved + billData.co2Emissions,
    }));
  };

  const handleFoodScanned = (carbonData: FoodCarbonData) => {
    setStats(prev => ({
      ...prev,
      totalFoodItems: prev.totalFoodItems + 1,
      totalCO2Saved: prev.totalCO2Saved + carbonData.totalCO2,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100/10 to-teal-100/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 lg:py-12 space-y-8 lg:space-y-12" style={{ maxWidth: '1600px' }}>
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-6 lg:mb-8">
            <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 lg:mb-6 desktop-heading-xl">
            Auto-Tracking Hub
          </h2>
          <p className="text-xl lg:text-2xl xl:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed desktop-text-lg">
            Automatically track your carbon footprint using GPS, camera scanning, and smart detection
          </p>
        </div>

        {/* Stats Overview */}
        <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Auto-Tracking Statistics
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-blue-600 mb-1">{stats.totalRoutes}</p>
                <p className="text-sm font-medium text-blue-700">Routes Detected</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <Camera className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-green-600 mb-1">{stats.totalBills}</p>
                <p className="text-sm font-medium text-green-700">Bills Scanned</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <Scan className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-orange-600 mb-1">{stats.totalFoodItems}</p>
                <p className="text-sm font-medium text-orange-700">Food Items</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.totalCO2Saved.toFixed(1)}kg</p>
                <p className="text-sm font-medium text-emerald-700">Total CO₂ Tracked</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-102'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-white/20' 
                    : 'bg-gray-200 group-hover:bg-gray-300'
                }`}>
                  {tab.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div className={`text-xs transition-colors duration-300 ${
                    activeTab === tab.id 
                      ? 'text-white/80' 
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        <div className="min-h-[600px] relative">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl">
            <div className="p-8 h-full">
              {activeTab === 'gps' && (
                <GPSTracker
                  onRouteDetected={handleRouteDetected}
                  onLocationUpdate={(_location: Location) => {
                    // Handle location updates if needed
                  }}
                />
              )}
              
              {activeTab === 'ocr' && (
                <OCRScanner onBillProcessed={handleBillProcessed} />
              )}
              
              {activeTab === 'barcode' && (
                <BarcodeScanner onFoodScanned={handleFoodScanned} />
              )}
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <Card className="backdrop-blur-sm bg-white/95 border border-white/50 shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Info className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              About Auto-Tracking
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-gray-600">
            <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
                <h4 className="text-lg font-bold text-blue-900">GPS Tracking</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Detects travel routes automatically</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Estimates transport mode by speed</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Calculates CO₂ from distance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Works in background</span>
                </li>
              </ul>
            </div>
            
            <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="w-8 h-8 text-green-600" />
                <h4 className="text-lg font-bold text-green-900">Bill Scanning</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>OCR extracts text from images</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Recognizes utility bills & receipts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Auto-calculates emissions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Supports multiple bill types</span>
                </li>
              </ul>
            </div>
            
            <div className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Scan className="w-8 h-8 text-orange-600" />
                <h4 className="text-lg font-bold text-orange-900">Food Scanning</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Scans product barcodes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Looks up food databases</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Calculates food carbon footprint</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Tracks nutritional info</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Info className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-amber-800">Privacy & Permissions</h4>
            </div>
            <p className="text-amber-700 leading-relaxed">
              Auto-tracking requires camera and location permissions. All data is processed locally when possible, 
              and only aggregated CO₂ calculations are stored on our servers. Raw location data and images are not saved.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
