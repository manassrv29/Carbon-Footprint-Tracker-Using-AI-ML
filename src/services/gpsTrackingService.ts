import type { Location, TravelRoute, GPSTrackingOptions } from '../types';

class GPSTrackingService {
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private currentLocation: Location | null = null;
  private locationHistory: Location[] = [];
  private routes: TravelRoute[] = [];
  private options: GPSTrackingOptions;
  
  private readonly defaultOptions: GPSTrackingOptions = {
    enableHighAccuracy: true,
    timeout: 15000, // Increased for better accuracy
    maximumAge: 30000, // Reduced for fresher data
    minDistanceThreshold: 25, // Reduced for better sensitivity
    trackingInterval: 20000, // More frequent updates (20 seconds)
  };

  constructor(options: Partial<GPSTrackingOptions> = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Start GPS tracking
   */
  async startTracking(): Promise<void> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    if (this.isTracking) {
      console.warn('GPS tracking is already active');
      return;
    }

    try {
      // Request permission first
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        throw new Error('Geolocation permission denied');
      }

      this.isTracking = true;
      this.watchId = navigator.geolocation.watchPosition(
        this.handleLocationUpdate.bind(this),
        this.handleLocationError.bind(this),
        {
          enableHighAccuracy: this.options.enableHighAccuracy,
          timeout: this.options.timeout,
          maximumAge: this.options.maximumAge,
        }
      );

      console.log('GPS tracking started');
    } catch (error) {
      this.isTracking = false;
      throw error;
    }
  }

  /**
   * Stop GPS tracking
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    console.log('GPS tracking stopped');
  }

  /**
   * Handle location updates
   */
  private handleLocationUpdate(position: GeolocationPosition): void {
    const newLocation: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: Date.now(),
      accuracy: position.coords.accuracy,
    };

    console.log('GPS: New location received:', newLocation);

    // Check if this is a significant movement
    if (this.currentLocation && !this.isSignificantMovement(this.currentLocation, newLocation)) {
      console.log('GPS: Movement not significant enough, skipping');
      return;
    }

    // Update current location
    this.currentLocation = newLocation;
    this.locationHistory.push(newLocation);

    console.log('GPS: Location history length:', this.locationHistory.length);

    // Analyze for potential routes
    this.analyzeForRoutes();

    // Trigger location update event
    this.onLocationUpdate(newLocation);
  }

  /**
   * Handle location errors
   */
  private handleLocationError(error: GeolocationPositionError): void {
    console.error('GPS tracking error:', error.message);
    this.onLocationError(error);
  }

  /**
   * Check if movement is significant enough to track
   */
  private isSignificantMovement(oldLocation: Location, newLocation: Location): boolean {
    const distance = this.calculateDistance(oldLocation, newLocation);
    return distance >= (this.options.minDistanceThreshold || 50);
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate speed statistics from location history
   */
  private calculateSpeedsFromHistory(): { avgSpeed: number; maxSpeed: number } {
    if (this.locationHistory.length < 2) {
      return { avgSpeed: 0, maxSpeed: 0 };
    }

    const recentLocations = this.locationHistory.slice(-10); // Last 10 locations
    const speeds: number[] = [];

    for (let i = 1; i < recentLocations.length; i++) {
      const prev = recentLocations[i - 1];
      const curr = recentLocations[i];
      
      const distance = this.calculateDistance(prev, curr); // meters
      const timeDiff = curr.timestamp - prev.timestamp; // milliseconds
      
      if (timeDiff > 0) {
        const speedMps = distance / (timeDiff / 1000); // meters per second
        const speedKmh = speedMps * 3.6; // convert to km/h
        
        // Filter out unrealistic speeds (GPS errors)
        if (speedKmh <= 200) { // Max reasonable speed
          speeds.push(speedKmh);
        }
      }
    }

    if (speeds.length === 0) {
      return { avgSpeed: 0, maxSpeed: 0 };
    }

    const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);

    return { avgSpeed, maxSpeed };
  }

  /**
   * Analyze location history for potential travel routes
   */
  private analyzeForRoutes(): void {
    if (this.locationHistory.length < 5) return;

    // Enhanced journey detection with speed analysis
    const recentLocations = this.locationHistory.slice(-15); // Last 15 locations
    
    // Calculate total distance and check for movement patterns
    let totalDistance = 0;
    let movingSegments = 0;
    let stationarySegments = 0;
    
    for (let i = 1; i < recentLocations.length; i++) {
      const distance = this.calculateDistance(recentLocations[i-1], recentLocations[i]);
      const timeDiff = recentLocations[i].timestamp - recentLocations[i-1].timestamp;
      
      totalDistance += distance;
      
      if (timeDiff > 0) {
        const speed = (distance / (timeDiff / 1000)) * 3.6; // km/h
        if (speed > 2) {
          movingSegments++;
        } else {
          stationarySegments++;
        }
      }
    }
    
    const startLocation = recentLocations[0];
    const endLocation = recentLocations[recentLocations.length - 1];
    const totalTimeDiff = endLocation.timestamp - startLocation.timestamp;
    const directDistance = this.calculateDistance(startLocation, endLocation);
    
    // Enhanced journey criteria
    const minTime = 3 * 60 * 1000; // 3 minutes
    const minDistance = 200; // 200 meters
    const minMovingRatio = 0.3; // At least 30% of segments should show movement
    
    const movingRatio = movingSegments / (movingSegments + stationarySegments);
    
    console.log(`GPS: Journey analysis - Distance: ${directDistance.toFixed(0)}m, Time: ${(totalTimeDiff/60000).toFixed(1)}min, Moving ratio: ${(movingRatio*100).toFixed(0)}%`);
    
    if (totalTimeDiff > minTime && 
        directDistance > minDistance && 
        movingRatio > minMovingRatio) {
      
      console.log('GPS: Valid journey detected');
      
      // Check if we haven't already created a route for this journey
      const recentRouteTime = this.routes.length > 0 ? this.routes[this.routes.length - 1].createdAt.getTime() : 0;
      const timeSinceLastRoute = Date.now() - recentRouteTime;
      
      if (timeSinceLastRoute > 3 * 60 * 1000) { // At least 3 minutes since last route
        console.log('GPS: Creating new route');
        this.createRoute(startLocation, endLocation, directDistance, totalTimeDiff);
      } else {
        console.log('GPS: Route too recent, skipping');
      }
    } else {
      console.log('GPS: Journey criteria not met');
    }
  }

  /**
   * Create a travel route and calculate CO2 emissions
   */
  private async createRoute(
    start: Location,
    end: Location,
    distance: number,
    duration: number
  ): Promise<void> {
    // Calculate speeds from recent location history for better accuracy
    const speeds = this.calculateSpeedsFromHistory();
    const avgSpeed = speeds.avgSpeed;
    const maxSpeed = speeds.maxSpeed;

    // Detect transport mode based on speed patterns and distance
    const detection = this.detectTransportMode(avgSpeed, distance, maxSpeed);

    // Calculate CO2 emissions
    const co2Emissions = this.calculateCO2Emissions(distance / 1000, detection.mode);

    const route: TravelRoute = {
      id: `route_${Date.now()}`,
      startLocation: start,
      endLocation: end,
      distance: distance / 1000, // Convert to km
      duration: duration / (1000 * 60), // Convert to minutes
      transportMode: detection.mode,
      avgSpeed,
      maxSpeed,
      co2Emissions,
      confidence: detection.confidence,
      createdAt: new Date(),
    };

    this.routes.push(route);
    
    console.log(`GPS: Route created - ${route.distance.toFixed(2)} km in ${route.duration.toFixed(1)} min via ${route.transportMode} (${(route.confidence * 100).toFixed(0)}% confidence)`);
    
    // Save to backend
    await this.saveRouteToBackend(route);
    
    // Trigger route detected event
    this.onRouteDetected(route);
  }

  /**
   * Detect transport mode based on speed, distance, and movement patterns
   */
  private detectTransportMode(avgSpeed: number, distance: number, maxSpeed: number): { 
    mode: TravelRoute['transportMode']; 
    confidence: number 
  } {
    const distanceKm = distance / 1000;
    
    console.log(`GPS: Analyzing transport mode - Avg Speed: ${avgSpeed.toFixed(1)} km/h, Max Speed: ${maxSpeed.toFixed(1)} km/h, Distance: ${distanceKm.toFixed(2)} km`);
    
    // Enhanced transport mode detection with confidence scoring
    if (avgSpeed < 3) {
      return { mode: 'walking', confidence: 0.9 };
    }
    
    if (avgSpeed >= 3 && avgSpeed < 12) {
      // Could be walking fast, cycling slow, or stationary in traffic
      if (maxSpeed < 15) {
        return { mode: 'walking', confidence: 0.7 };
      } else {
        return { mode: 'cycling', confidence: 0.8 };
      }
    }
    
    if (avgSpeed >= 12 && avgSpeed < 25) {
      // Cycling or slow two-wheeler
      if (maxSpeed < 30) {
        return { mode: 'cycling', confidence: 0.85 };
      } else {
        return { mode: 'two_wheeler', confidence: 0.75 };
      }
    }
    
    if (avgSpeed >= 25 && avgSpeed < 45) {
      // Two-wheeler in city or car in heavy traffic
      if (maxSpeed < 60) {
        return { mode: 'two_wheeler', confidence: 0.8 };
      } else {
        return { mode: 'driving', confidence: 0.7 };
      }
    }
    
    if (avgSpeed >= 45 && avgSpeed < 80) {
      // Car or fast two-wheeler
      if (distanceKm > 20 && maxSpeed > 100) {
        return { mode: 'driving', confidence: 0.9 };
      } else {
        return { mode: 'driving', confidence: 0.8 };
      }
    }
    
    if (avgSpeed >= 80) {
      // High-speed travel - likely car on highway or public transport
      if (distanceKm > 50) {
        return { mode: 'public_transport', confidence: 0.8 };
      } else {
        return { mode: 'driving', confidence: 0.85 };
      }
    }
    
    // Fallback
    return { mode: 'driving', confidence: 0.5 };
  }

  /**
   * Calculate CO2 emissions based on distance and transport mode
   */
  private calculateCO2Emissions(distanceKm: number, mode: TravelRoute['transportMode']): number {
    // Enhanced emission factors (kg CO2 per km) based on real-world data
    const emissionFactors = {
      walking: 0, // Zero emissions
      cycling: 0, // Zero emissions
      two_wheeler: 0.084, // Motorcycle/scooter average (50-150cc)
      driving: 0.192, // Average passenger car (updated EPA data)
      public_transport: 0.089, // Bus/train average
    };

    const factor = emissionFactors[mode] || 0.192; // Default to car if unknown
    const emissions = distanceKm * factor;
    
    console.log(`GPS: CO2 calculation - ${distanceKm.toFixed(2)} km × ${factor} kg/km = ${emissions.toFixed(3)} kg CO2 (${mode})`);
    
    return emissions;
  }

  /**
   * Save route to backend
   */
  private async saveRouteToBackend(route: TravelRoute): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/carbon/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: 'transport',
          activityType: route.transportMode,
          value: route.distance,
          co2Kg: route.co2Emissions,
          source: 'gps',
          metadata: {
            startLocation: route.startLocation,
            endLocation: route.endLocation,
            duration: route.duration,
            avgSpeed: route.avgSpeed,
            maxSpeed: route.maxSpeed,
            confidence: route.confidence,
            autoDetected: true,
            detectionMethod: 'speed_analysis',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save route to backend');
      }

      console.log('Route saved to backend:', route.id);
    } catch (error) {
      console.error('Error saving route to backend:', error);
    }
  }

  /**
   * Get current location
   */
  getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  /**
   * Get location history
   */
  getLocationHistory(): Location[] {
    return [...this.locationHistory];
  }

  /**
   * Get detected routes
   */
  getRoutes(): TravelRoute[] {
    return [...this.routes];
  }

  /**
   * Clear location history
   */
  clearHistory(): void {
    this.locationHistory = [];
    this.routes = [];
  }

  /**
   * Event handlers (can be overridden)
   */
  public onLocationUpdate(location: Location): void {
    // Override in implementation
    console.log('Location updated:', location);
  }

  public onLocationError(error: GeolocationPositionError): void {
    // Override in implementation
    console.error('Location error:', error);
  }

  public onRouteDetected(route: TravelRoute): void {
    // Override in implementation
    console.log('Route detected:', route);
  }

  /**
   * Check if tracking is active
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Get transport mode statistics
   */
  getTransportStats(): {
    totalDistance: number;
    totalCO2: number;
    modeBreakdown: Record<string, { distance: number; co2: number; count: number }>;
  } {
    const stats = {
      totalDistance: 0,
      totalCO2: 0,
      modeBreakdown: {} as Record<string, { distance: number; co2: number; count: number }>,
    };

    this.routes.forEach(route => {
      stats.totalDistance += route.distance;
      stats.totalCO2 += route.co2Emissions;

      if (!stats.modeBreakdown[route.transportMode]) {
        stats.modeBreakdown[route.transportMode] = { distance: 0, co2: 0, count: 0 };
      }

      stats.modeBreakdown[route.transportMode].distance += route.distance;
      stats.modeBreakdown[route.transportMode].co2 += route.co2Emissions;
      stats.modeBreakdown[route.transportMode].count += 1;
    });

    return stats;
  }

  /**
   * Get recent speed information
   */
  getCurrentSpeed(): { current: number; average: number; max: number } {
    const speeds = this.calculateSpeedsFromHistory();
    return {
      current: speeds.avgSpeed, // Most recent average
      average: speeds.avgSpeed,
      max: speeds.maxSpeed,
    };
  }

  /**
   * Predict transport mode for current movement
   */
  predictCurrentTransportMode(): {
    mode: TravelRoute['transportMode'];
    confidence: number;
    speed: number;
  } {
    const speeds = this.calculateSpeedsFromHistory();
    
    if (speeds.avgSpeed === 0) {
      return { mode: 'walking', confidence: 0.5, speed: 0 };
    }

    const detection = this.detectTransportMode(speeds.avgSpeed, 1000, speeds.maxSpeed);
    
    return {
      mode: detection.mode,
      confidence: detection.confidence,
      speed: speeds.avgSpeed,
    };
  }
}

export default GPSTrackingService;
