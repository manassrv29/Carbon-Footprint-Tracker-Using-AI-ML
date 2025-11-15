import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, Bike, Footprints, Bus, Play, Square, Settings } from 'lucide-react';
import GPSTrackingService from '../../services/gpsTrackingService';
import { Card } from '../ui/Card';

// Define interfaces locally to avoid import issues
interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface TravelRoute {
  id: string;
  startLocation: Location;
  endLocation: Location;
  distance: number;
  duration: number;
  transportMode: 'walking' | 'cycling' | 'driving' | 'public_transport';
  co2Emissions: number;
  createdAt: Date;
}

interface GPSTrackerProps {
  onRouteDetected?: (route: TravelRoute) => void;
  onLocationUpdate?: (location: Location) => void;
}

export const GPSTracker: React.FC<GPSTrackerProps> = ({
  onRouteDetected,
  onLocationUpdate,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [recentRoutes, setRecentRoutes] = useState<TravelRoute[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const gpsService = useRef<GPSTrackingService | null>(null);

  useEffect(() => {
    // Initialize GPS service
    gpsService.current = new GPSTrackingService();
    
    // Override event handlers
    gpsService.current.onLocationUpdate = (location: Location) => {
      setCurrentLocation(location);
      onLocationUpdate?.(location);
    };
    
    gpsService.current.onRouteDetected = (route: TravelRoute) => {
      setRecentRoutes(prev => [route, ...prev.slice(0, 4)]); // Keep last 5 routes
      onRouteDetected?.(route);
    };
    
    gpsService.current.onLocationError = (error: GeolocationPositionError) => {
      setError(error.message);
      setIsTracking(false);
    };

    // Check permission status
    checkPermissionStatus();

    return () => {
      if (gpsService.current) {
        gpsService.current.stopTracking();
      }
    };
  }, [onLocationUpdate, onRouteDetected]);

  const checkPermissionStatus = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(permission.state);
      
      permission.addEventListener('change', () => {
        setPermissionStatus(permission.state);
      });
    } catch (error) {
      console.error('Error checking geolocation permission:', error);
    }
  };

  const startTracking = async () => {
    if (!gpsService.current) return;

    try {
      setError(null);
      await gpsService.current.startTracking();
      setIsTracking(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start GPS tracking');
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (gpsService.current) {
      gpsService.current.stopTracking();
      setIsTracking(false);
    }
  };

  const getTransportIcon = (mode: TravelRoute['transportMode']) => {
    switch (mode) {
      case 'walking': return <Footprints className="w-4 h-4" />;
      case 'cycling': return <Bike className="w-4 h-4" />;
      case 'driving': return <Car className="w-4 h-4" />;
      case 'public_transport': return <Bus className="w-4 h-4" />;
      default: return <Navigation className="w-4 h-4" />;
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatCO2 = (co2: number) => {
    if (co2 < 0.01) {
      return `${Math.round(co2 * 1000)}g`;
    }
    return `${co2.toFixed(2)}kg`;
  };

  return (
    <div className="space-y-6">
      {/* GPS Tracking Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isTracking ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">GPS Auto-Tracking</h3>
              <p className="text-sm text-gray-600">
                {isTracking ? 'Actively tracking your location' : 'Track your travel routes automatically'}
              </p>
            </div>
          </div>
          
          <button
            onClick={isTracking ? stopTracking : startTracking}
            disabled={permissionStatus === 'denied'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isTracking
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isTracking ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isTracking ? 'Stop' : 'Start'} Tracking</span>
          </button>
        </div>

        {/* Permission Status */}
        {permissionStatus === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">
              Location permission denied. Please enable location access in your browser settings to use GPS tracking.
            </p>
          </div>
        )}

        {permissionStatus === 'prompt' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-700 text-sm">
              Location permission required. Click "Start Tracking" to grant access.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Current Location */}
        {currentLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Current Location</p>
                <p className="text-xs text-blue-700">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </p>
              </div>
              <div className="text-xs text-blue-600">
                Accuracy: {currentLocation.accuracy ? `${Math.round(currentLocation.accuracy)}m` : 'Unknown'}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Routes */}
      {recentRoutes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Auto-Detected Routes</h3>
          <div className="space-y-3">
            {recentRoutes.map((route) => (
              <div
                key={route.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {getTransportIcon(route.transportMode)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {route.transportMode.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDistance(route.distance)} • {Math.round(route.duration)} min
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCO2(route.co2Emissions)} CO₂
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(route.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tracking Info */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">How GPS Tracking Works</h3>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
            <p>Automatically detects when you start and stop moving</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
            <p>Calculates distance and estimates transport mode based on speed</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
            <p>Automatically logs CO₂ emissions for each detected journey</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
            <p>Works in the background with minimal battery usage</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Privacy:</strong> Location data is processed locally and only distance/CO₂ calculations are stored. 
            Raw GPS coordinates are not saved to our servers.
          </p>
        </div>
      </Card>
    </div>
  );
};
