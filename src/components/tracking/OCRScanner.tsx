import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, CheckCircle, AlertCircle, Zap, Fuel, Droplets, ShoppingCart, TestTube } from 'lucide-react';
import OCRService from '../../services/ocrService';
import type { BillData, OCRResult } from '../../services/ocrService';
import { Card } from '../ui/Card';
import { sampleBillTexts } from '../../utils/ocrTestData';

interface OCRScannerProps {
  onBillProcessed?: (billData: BillData) => void;
}

export const OCRScanner: React.FC<OCRScannerProps> = ({ onBillProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ocrService = useRef<OCRService>(new OCRService());

  const getBillTypeIcon = (type: BillData['type']) => {
    switch (type) {
      case 'electricity': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'gas': return <Fuel className="w-5 h-5 text-orange-500" />;
      case 'water': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'grocery': return <ShoppingCart className="w-5 h-5 text-green-500" />;
      case 'fuel': return <Fuel className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBillTypeColor = (type: BillData['type']) => {
    switch (type) {
      case 'electricity': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'gas': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'water': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'grocery': return 'bg-green-50 border-green-200 text-green-800';
      case 'fuel': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const processImage = async (imageFile: File) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const ocrResult: OCRResult = await ocrService.current.processImage(imageFile);
      
      if (ocrResult.confidence < 50) {
        throw new Error('Image quality too low. Please try a clearer image.');
      }

      const billData = ocrService.current.parseBillData(ocrResult.text);
      
      if (billData.amount === 0) {
        throw new Error('Could not extract bill amount. Please check the image quality.');
      }

      setResult(billData);
      onBillProcessed?.(billData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const startCamera = async () => {
    try {
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
    } catch (error) {
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          await processImage(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const saveBill = async () => {
    if (!result) return;

    try {
      await ocrService.current.saveBillToBackend(result);
      setResult(null);
      // Show success message or redirect
    } catch (error) {
      setError('Failed to save bill data');
    }
  };

  const testWithSampleData = (billType: keyof typeof sampleBillTexts) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const sampleText = sampleBillTexts[billType];
      const billData = ocrService.current.parseBillData(sampleText);
      
      setResult(billData);
      onBillProcessed?.(billData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process sample data');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Controls */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bill & Receipt Scanner</h3>
            <p className="text-sm text-gray-600">
              Scan electricity, gas, water bills, or grocery receipts to auto-calculate CO₂
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={startCamera}
            disabled={isProcessing || showCamera}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Camera className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Take Photo</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Upload Image</span>
          </button>

          <div className="relative">
            <button
              onClick={() => testWithSampleData('electricity')}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              <TestTube className="w-5 h-5 text-purple-600" />
              <span className="text-purple-700 font-medium">Test Scanner</span>
            </button>
          </div>
        </div>

        {/* Test Data Buttons */}
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-medium text-purple-800 mb-3">Test with Sample Bills:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.keys(sampleBillTexts).map((billType) => (
              <button
                key={billType}
                onClick={() => testWithSampleData(billType as keyof typeof sampleBillTexts)}
                disabled={isProcessing}
                className="px-3 py-2 text-xs bg-white border border-purple-300 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50 capitalize"
              >
                {billType}
              </button>
            ))}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </Card>

      {/* Camera View */}
      {showCamera && (
        <Card className="p-6">
          <div className="text-center">
            <video
              ref={videoRef}
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={capturePhoto}
                disabled={isProcessing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing image...</span>
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

      {/* Results */}
      {result && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Scanned Bill Data</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getBillTypeColor(result.type)}`}>
              <div className="flex items-center space-x-2">
                {getBillTypeIcon(result.type)}
                <span className="capitalize">{result.type}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <p className="text-lg font-semibold text-gray-900">
                  {result.amount} {result.unit}
                </p>
              </div>
              
              {result.provider && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Provider</label>
                  <p className="text-gray-900 capitalize">{result.provider}</p>
                </div>
              )}
              
              {result.date && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-gray-900">{result.date.toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">CO₂ Emissions</label>
                <p className="text-lg font-semibold text-red-600">
                  {result.co2Emissions.toFixed(2)} kg CO₂
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Equivalent To</label>
                <p className="text-sm text-gray-600">
                  {(result.co2Emissions * 0.024).toFixed(1)} trees needed to offset
                </p>
              </div>
            </div>
          </div>

          {/* Raw Text Preview */}
          <details className="mb-4">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              View extracted text
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono">
              {result.rawText}
            </div>
          </details>

          <div className="flex space-x-3">
            <button
              onClick={saveBill}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save to Carbon Log</span>
            </button>
            
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Scan Another
            </button>
          </div>
        </Card>
      )}

      {/* Supported Bill Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Bill Types</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { type: 'electricity', label: 'Electricity', icon: <Zap className="w-5 h-5" /> },
            { type: 'gas', label: 'Gas', icon: <Fuel className="w-5 h-5" /> },
            { type: 'water', label: 'Water', icon: <Droplets className="w-5 h-5" /> },
            { type: 'fuel', label: 'Fuel', icon: <Fuel className="w-5 h-5" /> },
            { type: 'grocery', label: 'Grocery', icon: <ShoppingCart className="w-5 h-5" /> },
          ].map((item) => (
            <div key={item.type} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 mx-auto mb-2 text-gray-600">
                {item.icon}
              </div>
              <p className="text-sm font-medium text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Tips:</strong> Ensure text is clear and well-lit. The scanner works best with 
            high-contrast images where numbers and text are easily readable.
          </p>
        </div>
      </Card>
    </div>
  );
};
