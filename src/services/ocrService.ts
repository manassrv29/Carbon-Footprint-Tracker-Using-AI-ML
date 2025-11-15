interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface BillData {
  type: 'electricity' | 'gas' | 'water' | 'grocery' | 'fuel' | 'unknown';
  amount: number;
  unit: string;
  date?: Date;
  provider?: string;
  co2Emissions: number;
  rawText: string;
}

interface OCROptions {
  language: string;
  engineMode: number;
  pageSegMode: number;
}

class OCRService {
  private worker: any = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeTesseract();
  }

  /**
   * Initialize Tesseract.js worker
   */
  private async initializeTesseract(): Promise<void> {
    try {
      // Dynamic import to avoid bundling issues
      const { createWorker } = await import('tesseract.js');
      
      this.worker = await createWorker('eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789.,ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz /-:$₹€£¥',
      });
      
      this.isInitialized = true;
      console.log('OCR service initialized');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw new Error('OCR service initialization failed');
    }
  }

  /**
   * Process image file and extract text
   */
  async processImage(imageFile: File): Promise<OCRResult> {
    if (!this.isInitialized) {
      console.log('OCR: Initializing Tesseract...');
      await this.initializeTesseract();
    }

    try {
      console.log('OCR: Processing image...', imageFile.name, imageFile.size);
      const { data } = await this.worker.recognize(imageFile);
      
      console.log('OCR: Text extracted with confidence:', data.confidence);
      console.log('OCR: Extracted text preview:', data.text.substring(0, 200));
      
      return {
        text: data.text,
        confidence: data.confidence,
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to process image. Please try a clearer image.');
    }
  }

  /**
   * Process camera capture
   */
  async processCameraCapture(canvas: HTMLCanvasElement): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initializeTesseract();
    }

    try {
      const { data } = await this.worker.recognize(canvas);
      
      return {
        text: data.text,
        confidence: data.confidence,
      };
    } catch (error) {
      console.error('Camera OCR processing failed:', error);
      throw new Error('Failed to process camera capture');
    }
  }

  /**
   * Parse bill data from OCR text
   */
  parseBillData(ocrText: string): BillData {
    const text = ocrText.toLowerCase();
    
    console.log('OCR: Parsing bill data from text length:', ocrText.length);
    
    // Detect bill type
    const billType = this.detectBillType(text);
    console.log('OCR: Detected bill type:', billType);
    
    // Extract amount and unit
    const { amount, unit } = this.extractAmountAndUnit(text, billType);
    console.log('OCR: Extracted amount and unit:', amount, unit);
    
    // Extract date
    const date = this.extractDate(text);
    console.log('OCR: Extracted date:', date);
    
    // Extract provider
    const provider = this.extractProvider(text, billType);
    console.log('OCR: Extracted provider:', provider);
    
    // Calculate CO2 emissions
    const co2Emissions = this.calculateEmissionsFromBill(amount, unit, billType);
    console.log('OCR: Calculated CO2 emissions:', co2Emissions);

    return {
      type: billType,
      amount,
      unit,
      date,
      provider,
      co2Emissions,
      rawText: ocrText,
    };
  }

  /**
   * Detect bill type from text content
   */
  private detectBillType(text: string): BillData['type'] {
    const patterns = {
      electricity: [
        'electricity', 'electric', 'power', 'kwh', 'kilowatt', 'energy bill', 'utility bill',
        'pge', 'sce', 'sdge', 'duke energy', 'con edison', 'national grid', 'entergy',
        'electric company', 'power company', 'energy usage', 'meter reading'
      ],
      gas: [
        'gas', 'natural gas', 'lpg', 'cubic meter', 'm3', 'therms', 'ccf', 'mcf',
        'socalgas', 'dominion', 'centerpoint', 'gas company', 'gas service',
        'heating gas', 'propane', 'butane'
      ],
      water: [
        'water', 'water bill', 'liters', 'gallons', 'cubic meter', 'water service',
        'municipal water', 'city water', 'water department', 'water utility',
        'sewer', 'wastewater', 'water usage', 'meter reading'
      ],
      grocery: [
        'grocery', 'supermarket', 'food', 'walmart', 'target', 'safeway', 'kroger',
        'whole foods', 'costco', 'trader joe', 'aldi', 'publix', 'wegmans',
        'food store', 'market', 'receipt', 'total', 'subtotal'
      ],
      fuel: [
        'fuel', 'petrol', 'gasoline', 'diesel', 'gas station', 'shell', 'bp',
        'exxon', 'chevron', 'mobil', 'texaco', 'arco', 'citgo', '76',
        'fuel receipt', 'pump', 'gallons', 'liters'
      ],
    };

    // Score each type based on keyword matches
    const scores: Record<string, number> = {};
    
    for (const [type, keywords] of Object.entries(patterns)) {
      scores[type] = keywords.reduce((score, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        return score + (matches ? matches.length : 0);
      }, 0);
    }

    // Find the type with the highest score
    const bestMatch = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );

    return bestMatch[1] > 0 ? bestMatch[0] as BillData['type'] : 'unknown';
  }

  /**
   * Extract amount and unit from text
   */
  private extractAmountAndUnit(text: string, billType: BillData['type']): { amount: number; unit: string } {
    const patterns = {
      electricity: [
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*kwh/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*kilowatt[-\s]*hours?/i,
        /energy\s*consumed[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
        /usage[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)\s*kwh/i,
        /current\s*reading[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      ],
      gas: [
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*m[³3]/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*cubic\s*meters?/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*therms?/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*ccf/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*mcf/i,
        /gas\s*usage[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      ],
      water: [
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*liters?/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*gallons?/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*m[³3]/i,
        /water\s*usage[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
        /consumption[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      ],
      fuel: [
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*liters?/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*gallons?/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*gal/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*l\b/i,
        /fuel\s*amount[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      ],
      grocery: [
        /total[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i,
        /amount[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i,
        /subtotal[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i,
        /balance[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      ],
    };

    const typePatterns = billType !== 'unknown' ? patterns[billType] : [];
    
    // Try type-specific patterns first
    for (const pattern of typePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        return {
          amount,
          unit: this.getUnitForBillType(billType),
        };
      }
    }

    // Fallback patterns for any bill type
    const fallbackPatterns = [
      /amount[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      /total[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      /\$(\d+(?:,\d{3})*(?:\.\d+)?)/,
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*dollars?/i,
    ];

    for (const pattern of fallbackPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        return {
          amount,
          unit: billType === 'grocery' ? 'USD' : this.getUnitForBillType(billType),
        };
      }
    }

    return { amount: 0, unit: 'unknown' };
  }

  /**
   * Get default unit for bill type
   */
  private getUnitForBillType(billType: BillData['type']): string {
    const units = {
      electricity: 'kWh',
      gas: 'm3',
      water: 'liters',
      fuel: 'liters',
      grocery: 'USD',
      unknown: 'units',
    };

    return units[billType];
  }

  /**
   * Extract date from text
   */
  private extractDate(text: string): Date | undefined {
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})[,\s]+(\d{2,4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return new Date(match[0]);
        } catch {
          continue;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract provider/company name
   */
  private extractProvider(text: string, billType: BillData['type']): string | undefined {
    const providerPatterns = {
      electricity: ['pge', 'sdge', 'sce', 'duke energy', 'con edison'],
      gas: ['pge', 'socalgas', 'national grid', 'dominion'],
      water: ['water department', 'municipal water', 'city water'],
      fuel: ['shell', 'bp', 'exxon', 'chevron', 'mobil'],
      grocery: ['walmart', 'target', 'safeway', 'kroger', 'whole foods'],
    };

    const patterns = billType !== 'unknown' ? providerPatterns[billType] : [];
    
    for (const provider of patterns) {
      if (text.includes(provider)) {
        return provider;
      }
    }

    return undefined;
  }

  /**
   * Calculate CO2 emissions from bill data
   */
  private calculateEmissionsFromBill(amount: number, unit: string, billType: BillData['type']): number {
    // Updated emission factors based on EPA and international standards (kg CO2 per unit)
    const emissionFactors = {
      electricity: { 
        'kwh': 0.4, // US average grid emission factor
        'kilowatt': 0.4,
        'units': 0.4 // fallback for electricity
      },
      gas: { 
        'm3': 1.98, // Natural gas combustion
        'm³': 1.98,
        'therms': 5.3, // 1 therm = ~100 cubic feet
        'ccf': 5.3, // 100 cubic feet
        'mcf': 53.0, // 1000 cubic feet
        'units': 2.0 // fallback for gas
      },
      water: { 
        'liters': 0.0003, // Water treatment and distribution
        'gallons': 0.0011, // 1 gallon = ~3.785 liters
        'm3': 0.3,
        'm³': 0.3,
        'units': 0.0003 // fallback for water
      },
      fuel: { 
        'liters': 2.31, // Gasoline combustion
        'gallons': 8.75, // 1 gallon = ~3.785 liters
        'gal': 8.75,
        'l': 2.31,
        'units': 2.31 // fallback for fuel
      },
      grocery: { 
        'usd': 0.8, // Average food carbon intensity per dollar
        'dollars': 0.8,
        '$': 0.8,
        'units': 0.8 // fallback for grocery
      },
    };

    const factors = billType !== 'unknown' ? emissionFactors[billType] : null;
    if (!factors) return 0;

    const normalizedUnit = unit.toLowerCase();
    const factor = (factors as any)[normalizedUnit] || (factors as any)['units'] || 0;
    
    console.log(`OCR: Calculating emissions for ${amount} ${unit} (${billType}): ${amount} * ${factor} = ${amount * factor} kg CO2`);
    
    return amount * factor;
  }

  /**
   * Save bill data to backend
   */
  async saveBillToBackend(billData: BillData): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Map bill type to carbon log category
      const categoryMap = {
        electricity: 'energy',
        gas: 'energy',
        water: 'energy',
        fuel: 'transport',
        grocery: 'food',
        unknown: 'other',
      };

      const response = await fetch('/api/carbon/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: categoryMap[billData.type],
          activityType: billData.type,
          value: billData.amount,
          co2Kg: billData.co2Emissions,
          source: 'ocr',
          metadata: {
            unit: billData.unit,
            provider: billData.provider,
            scanDate: new Date(),
            billDate: billData.date,
            rawText: billData.rawText,
            autoDetected: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save bill data to backend');
      }

      console.log('Bill data saved to backend');
    } catch (error) {
      console.error('Error saving bill data:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export default OCRService;
export type { OCRResult, BillData, OCROptions };
