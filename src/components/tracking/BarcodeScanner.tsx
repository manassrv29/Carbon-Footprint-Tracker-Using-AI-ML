import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Scan, CheckCircle, AlertCircle, Search, TestTube } from 'lucide-react';
import BarcodeService from '../../services/barcodeService';
import type { FoodItem, FoodCarbonData, BarcodeResult } from '../../services/barcodeService';
import { Card } from '../ui/Card';

interface BarcodeScannerProps {
  onFoodScanned?: (carbonData: FoodCarbonData) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onFoodScanned }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeService = useRef<BarcodeService>(new BarcodeService());

  useEffect(() => {
    return () => {
      stopCamera();
      barcodeService.current.cleanup();
    };
  }, []);

  const startCamera = async () => {
    try {
      const hasPermission = await barcodeService.current.requestCameraPermission();
      if (!hasPermission) {
        setError('Camera permission denied');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setShowCamera(true);
      setError(null);
      startBarcodeScanning();
    } catch (error) {
      setError('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsScanning(false);
  };

  const startBarcodeScanning = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    
    try {
      const result: BarcodeResult = await barcodeService.current.scanFromCamera(videoRef.current);
      await handleBarcodeResult(result);
      stopCamera();
    } catch (error) {
      console.error('Barcode scanning failed:', error);
      // Continue scanning - this is expected when no barcode is found
      if (showCamera) {
        setTimeout(startBarcodeScanning, 1000); // Retry after 1 second
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const result: BarcodeResult = await barcodeService.current.scanFromImage(file);
      await handleBarcodeResult(result);
    } catch (error) {
      setError('No barcode found in image');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeResult = async (result: BarcodeResult) => {
    try {
      const foodItem = await barcodeService.current.lookupFoodItem(result.code);
      
      if (foodItem) {
        setScannedItem(foodItem);
        setError(null);
      } else {
        setError(`Product not found for barcode: ${result.code}`);
      }
    } catch (error) {
      setError('Failed to lookup product information');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = barcodeService.current.searchFoodItems(searchQuery);
    setSearchResults(results);
  };

  const selectSearchResult = (item: FoodItem) => {
    setScannedItem(item);
    setSearchResults([]);
    setSearchQuery('');
  };

  const calculateAndSave = async () => {
    if (!scannedItem) return;

    try {
      const carbonData = barcodeService.current.calculateFoodCarbon(scannedItem, quantity);
      await barcodeService.current.saveFoodConsumption(carbonData);
      
      onFoodScanned?.(carbonData);
      setScannedItem(null);
      setQuantity(100);
    } catch (error) {
      setError('Failed to save food consumption data');
    }
  };

  const testWithSampleBarcode = (barcode: string) => {
    setIsScanning(true);
    setError(null);

    // Simulate barcode scan result
    const mockResult: BarcodeResult = {
      code: barcode,
      format: 'EAN_13',
    };

    handleBarcodeResult(mockResult);
  };

  const formatCO2 = (co2: number) => {
    if (co2 < 0.01) {
      return `${Math.round(co2 * 1000)}g`;
    }
    return `${co2.toFixed(2)}kg`;
  };

  const getTotalCO2 = () => {
    if (!scannedItem) return 0;
    return (scannedItem.co2PerUnit * quantity) / 100;
  };

  return (
    <div className="space-y-6">
      {/* Scanner Controls */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Food Barcode Scanner</h3>
            <p className="text-sm text-gray-600">
              Scan packaged food items to automatically calculate CO₂ emissions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button
            onClick={startCamera}
            disabled={isScanning || showCamera}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <Camera className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Scan Barcode</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Upload Image</span>
          </button>

          <button
            onClick={() => testWithSampleBarcode('123456789012')}
            disabled={isScanning}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            <TestTube className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-medium">Test Scanner</span>
          </button>
        </div>

        {/* Test Sample Products */}
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-medium text-purple-800 mb-3">Test with Sample Products:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => testWithSampleBarcode('123456789012')}
              disabled={isScanning}
              className="px-3 py-2 text-xs bg-white border border-purple-300 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              🥛 Organic Milk
            </button>
            <button
              onClick={() => testWithSampleBarcode('234567890123')}
              disabled={isScanning}
              className="px-3 py-2 text-xs bg-white border border-purple-300 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              🥩 Ground Beef
            </button>
            <button
              onClick={() => testWithSampleBarcode('345678901234')}
              disabled={isScanning}
              className="px-3 py-2 text-xs bg-white border border-purple-300 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              🍌 Bananas
            </button>
            <button
              onClick={() => testWithSampleBarcode('456789012345')}
              disabled={isScanning}
              className="px-3 py-2 text-xs bg-white border border-purple-300 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              🍞 Wheat Bread
            </button>
            <button
              onClick={() => testWithSampleBarcode('567890123456')}
              disabled={isScanning}
              className="px-3 py-2 text-xs bg-white border border-purple-300 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              🥤 Coca-Cola
            </button>
          </div>
        </div>

        {/* Manual Search */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search for food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </Card>

      {/* Camera View */}
      {showCamera && (
        <Card className="p-6">
          <div className="text-center">
            <div className="relative inline-block">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-32 border-2 border-green-500 rounded-lg bg-transparent">
                  <div className="w-full h-full border-2 border-dashed border-green-300 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              Position the barcode within the frame
            </p>
            
            <button
              onClick={stopCamera}
              className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel Scanning
            </button>
          </div>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
          <div className="space-y-2">
            {searchResults.slice(0, 5).map((item) => (
              <button
                key={item.barcode}
                onClick={() => selectSearchResult(item)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.brand} • {item.category}</p>
                  </div>
                  <p className="text-sm font-medium text-green-600">
                    {formatCO2(item.co2PerUnit)}/100g
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Processing Status */}
      {isScanning && !showCamera && (
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-gray-700">Scanning barcode...</span>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Scanned Item Details */}
      {scannedItem && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Scanned Product</h3>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {scannedItem.source}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Product Name</label>
                <p className="text-lg font-semibold text-gray-900">{scannedItem.name}</p>
              </div>
              
              {scannedItem.brand && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Brand</label>
                  <p className="text-gray-900">{scannedItem.brand}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900 capitalize">{scannedItem.category}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Barcode</label>
                <p className="text-gray-600 font-mono text-sm">{scannedItem.barcode}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">CO₂ per 100g</label>
                <p className="text-lg font-semibold text-orange-600">
                  {formatCO2(scannedItem.co2PerUnit)}
                </p>
              </div>
              
              <div>
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantity (grams)
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  max="10000"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Total CO₂ Emissions</label>
                <p className="text-xl font-bold text-red-600">
                  {formatCO2(getTotalCO2())}
                </p>
              </div>
            </div>
          </div>

          {/* Nutritional Info */}
          {scannedItem.nutritionalInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Nutritional Info (per 100g)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {scannedItem.nutritionalInfo.calories && (
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="ml-1 font-medium">{scannedItem.nutritionalInfo.calories}</span>
                  </div>
                )}
                {scannedItem.nutritionalInfo.protein && (
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <span className="ml-1 font-medium">{scannedItem.nutritionalInfo.protein}g</span>
                  </div>
                )}
                {scannedItem.nutritionalInfo.carbs && (
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <span className="ml-1 font-medium">{scannedItem.nutritionalInfo.carbs}g</span>
                  </div>
                )}
                {scannedItem.nutritionalInfo.fat && (
                  <div>
                    <span className="text-gray-600">Fat:</span>
                    <span className="ml-1 font-medium">{scannedItem.nutritionalInfo.fat}g</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={calculateAndSave}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Add to Carbon Log</span>
            </button>
            
            <button
              onClick={() => setScannedItem(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Scan Another
            </button>
          </div>
        </Card>
      )}

      {/* How It Works */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Food Scanning Works</h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
            <p>Scan barcodes on packaged food products</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
            <p>Automatically looks up product information from food databases</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
            <p>Calculates CO₂ emissions based on ingredients and production methods</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
            <p>Tracks your food-related carbon footprint automatically</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Data Sources:</strong> Product information comes from Open Food Facts and other 
            public food databases. CO₂ calculations are based on scientific research and industry data.
          </p>
        </div>
      </Card>
    </div>
  );
};
