interface BarcodeResult {
  code: string;
  format: string;
  confidence?: number;
}

interface FoodItem {
  barcode: string;
  name: string;
  brand?: string;
  category: string;
  co2PerUnit: number; // kg CO2 per unit (gram, piece, etc.)
  unit: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  source: string;
}

interface FoodCarbonData {
  item: FoodItem;
  quantity: number;
  totalCO2: number;
  confidence: number;
}

class BarcodeService {
  private scanner: any = null;
  private isInitialized: boolean = false;
  private foodDatabase: Map<string, FoodItem> = new Map();

  constructor() {
    this.initializeScanner();
    this.loadFoodDatabase();
  }

  /**
   * Initialize barcode scanner
   */
  private async initializeScanner(): Promise<void> {
    try {
      // Dynamic import to avoid bundling issues
      const { BrowserMultiFormatReader } = await import('@zxing/library');
      this.scanner = new BrowserMultiFormatReader();
      this.isInitialized = true;
      console.log('Barcode scanner initialized');
    } catch (error) {
      console.error('Failed to initialize barcode scanner:', error);
      throw new Error('Barcode scanner initialization failed');
    }
  }

  /**
   * Load food carbon database
   */
  private async loadFoodDatabase(): Promise<void> {
    try {
      // Load sample data first
      this.loadSampleFoodData();
      
      // Load from local database
      const localData = localStorage.getItem('food_carbon_db');
      if (localData) {
        const items = JSON.parse(localData);
        items.forEach((item: FoodItem) => {
          this.foodDatabase.set(item.barcode, item);
        });
      }

      // Load additional data from backend
      await this.syncWithBackend();
    } catch (error) {
      console.error('Failed to load food database:', error);
    }
  }

  /**
   * Load sample food data for testing
   */
  private loadSampleFoodData(): void {
    const sampleFoods: FoodItem[] = [
      {
        barcode: '123456789012',
        name: 'Organic Whole Milk',
        brand: 'Horizon Organic',
        category: 'dairy',
        co2PerUnit: 0.017, // 17g CO2 per 100g
        unit: 'g',
        nutritionalInfo: {
          calories: 150,
          protein: 8,
          carbs: 12,
          fat: 8,
        },
        source: 'sample',
      },
      {
        barcode: '234567890123',
        name: 'Ground Beef 80/20',
        brand: 'Organic Valley',
        category: 'meat',
        co2PerUnit: 0.027, // 27g CO2 per 100g
        unit: 'g',
        nutritionalInfo: {
          calories: 250,
          protein: 20,
          carbs: 0,
          fat: 20,
        },
        source: 'sample',
      },
      {
        barcode: '345678901234',
        name: 'Organic Bananas',
        brand: 'Dole',
        category: 'fruits',
        co2PerUnit: 0.001, // 1g CO2 per 100g
        unit: 'g',
        nutritionalInfo: {
          calories: 89,
          protein: 1,
          carbs: 23,
          fat: 0,
        },
        source: 'sample',
      },
      {
        barcode: '456789012345',
        name: 'Whole Wheat Bread',
        brand: 'Dave\'s Killer Bread',
        category: 'grains',
        co2PerUnit: 0.003, // 3g CO2 per 100g
        unit: 'g',
        nutritionalInfo: {
          calories: 260,
          protein: 5,
          carbs: 46,
          fat: 4,
        },
        source: 'sample',
      },
      {
        barcode: '567890123456',
        name: 'Coca-Cola Classic',
        brand: 'Coca-Cola',
        category: 'beverages',
        co2PerUnit: 0.005, // 5g CO2 per 100g
        unit: 'g',
        nutritionalInfo: {
          calories: 140,
          protein: 0,
          carbs: 39,
          fat: 0,
        },
        source: 'sample',
      },
    ];

    sampleFoods.forEach(item => {
      this.foodDatabase.set(item.barcode, item);
    });

    console.log('Barcode: Loaded sample food database with', sampleFoods.length, 'items');
  }

  /**
   * Sync with backend food database
   */
  private async syncWithBackend(): Promise<void> {
    try {
      const response = await fetch('/api/food-carbon/database');
      if (response.ok) {
        const items = await response.json();
        items.forEach((item: FoodItem) => {
          this.foodDatabase.set(item.barcode, item);
        });
        
        // Cache locally
        localStorage.setItem('food_carbon_db', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Failed to sync with backend food database:', error);
    }
  }

  /**
   * Scan barcode from camera
   */
  async scanFromCamera(videoElement: HTMLVideoElement): Promise<BarcodeResult> {
    if (!this.isInitialized) {
      await this.initializeScanner();
    }

    try {
      console.log('Barcode: Starting camera scan...');
      const result = await this.scanner.decodeOnceFromVideoDevice(undefined, videoElement);
      
      console.log('Barcode: Scan successful:', result.getText());
      
      return {
        code: result.getText(),
        format: result.getBarcodeFormat().toString(),
      };
    } catch (error) {
      console.error('Barcode scanning failed:', error);
      throw new Error('No barcode detected. Please try again.');
    }
  }

  /**
   * Scan barcode from image file
   */
  async scanFromImage(imageFile: File): Promise<BarcodeResult> {
    if (!this.isInitialized) {
      await this.initializeScanner();
    }

    try {
      console.log('Barcode: Scanning image file...', imageFile.name);
      
      // Create image element
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            const result = await this.scanner.decodeFromImageElement(img);
            URL.revokeObjectURL(imageUrl);
            
            console.log('Barcode: Image scan successful:', result.getText());
            
            resolve({
              code: result.getText(),
              format: result.getBarcodeFormat().toString(),
            });
          } catch (error) {
            URL.revokeObjectURL(imageUrl);
            reject(new Error('No barcode found in image'));
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Image barcode scanning failed:', error);
      throw new Error('Failed to scan barcode from image');
    }
  }

  /**
   * Look up food item by barcode
   */
  async lookupFoodItem(barcode: string): Promise<FoodItem | null> {
    // Check local database first
    const localItem = this.foodDatabase.get(barcode);
    if (localItem) {
      return localItem;
    }

    // Try external APIs
    try {
      // Try Open Food Facts API
      const openFoodItem = await this.queryOpenFoodFacts(barcode);
      if (openFoodItem) {
        this.foodDatabase.set(barcode, openFoodItem);
        return openFoodItem;
      }

      // Try USDA FoodData Central (if available)
      const usdaItem = await this.queryUSDAFoodData(barcode);
      if (usdaItem) {
        this.foodDatabase.set(barcode, usdaItem);
        return usdaItem;
      }

      return null;
    } catch (error) {
      console.error('Food lookup failed:', error);
      return null;
    }
  }

  /**
   * Query Open Food Facts API
   */
  private async queryOpenFoodFacts(barcode: string): Promise<FoodItem | null> {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        
        // Estimate CO2 based on category and ingredients
        const co2PerUnit = this.estimateCO2FromProduct(product);

        return {
          barcode,
          name: product.product_name || 'Unknown Product',
          brand: product.brands,
          category: product.categories_tags?.[0] || 'unknown',
          co2PerUnit,
          unit: 'g',
          nutritionalInfo: {
            calories: product.nutriments?.energy_kcal_100g,
            protein: product.nutriments?.proteins_100g,
            carbs: product.nutriments?.carbohydrates_100g,
            fat: product.nutriments?.fat_100g,
          },
          source: 'openfoodfacts',
        };
      }

      return null;
    } catch (error) {
      console.error('Open Food Facts query failed:', error);
      return null;
    }
  }

  /**
   * Query USDA FoodData Central API
   */
  private async queryUSDAFoodData(_barcode: string): Promise<FoodItem | null> {
    try {
      // This would require USDA API key
      // For now, return null as it's not implemented
      return null;
    } catch (error) {
      console.error('USDA FoodData query failed:', error);
      return null;
    }
  }

  /**
   * Estimate CO2 emissions from product data
   */
  private estimateCO2FromProduct(product: any): number {
    // CO2 estimation factors (kg CO2 per 100g)
    const categoryFactors: { [key: string]: number } = {
      'meat': 0.027, // 27g CO2 per 100g
      'dairy': 0.017, // 17g CO2 per 100g
      'fish': 0.011, // 11g CO2 per 100g
      'vegetables': 0.002, // 2g CO2 per 100g
      'fruits': 0.001, // 1g CO2 per 100g
      'grains': 0.003, // 3g CO2 per 100g
      'beverages': 0.005, // 5g CO2 per 100g
      'snacks': 0.008, // 8g CO2 per 100g
      'processed': 0.012, // 12g CO2 per 100g
    };

    // Analyze categories and ingredients
    const categories = product.categories_tags || [];
    const ingredients = product.ingredients_text || '';

    let estimatedFactor = 0.005; // Default factor

    // Check for high-impact categories
    for (const category of categories) {
      const categoryLower = category.toLowerCase();
      
      if (categoryLower.includes('meat') || categoryLower.includes('beef') || categoryLower.includes('pork')) {
        estimatedFactor = Math.max(estimatedFactor, categoryFactors.meat);
      } else if (categoryLower.includes('dairy') || categoryLower.includes('cheese') || categoryLower.includes('milk')) {
        estimatedFactor = Math.max(estimatedFactor, categoryFactors.dairy);
      } else if (categoryLower.includes('fish') || categoryLower.includes('seafood')) {
        estimatedFactor = Math.max(estimatedFactor, categoryFactors.fish);
      } else if (categoryLower.includes('vegetable') || categoryLower.includes('plant')) {
        estimatedFactor = Math.max(estimatedFactor, categoryFactors.vegetables);
      } else if (categoryLower.includes('fruit')) {
        estimatedFactor = Math.max(estimatedFactor, categoryFactors.fruits);
      } else if (categoryLower.includes('grain') || categoryLower.includes('cereal')) {
        estimatedFactor = Math.max(estimatedFactor, categoryFactors.grains);
      } else if (categoryLower.includes('beverage') || categoryLower.includes('drink')) {
        estimatedFactor = Math.max(estimatedFactor, categoryFactors.beverages);
      } else if (categoryLower.includes('snack') || categoryLower.includes('candy')) {
        estimatedFactor = Math.max(estimatedFactor, categoryFactors.snacks);
      }
    }

    // Check ingredients for high-impact items
    const ingredientsLower = ingredients.toLowerCase();
    if (ingredientsLower.includes('beef') || ingredientsLower.includes('meat')) {
      estimatedFactor = Math.max(estimatedFactor, categoryFactors.meat);
    } else if (ingredientsLower.includes('dairy') || ingredientsLower.includes('milk')) {
      estimatedFactor = Math.max(estimatedFactor, categoryFactors.dairy);
    }

    return estimatedFactor; // kg CO2 per 100g
  }

  /**
   * Calculate carbon footprint for scanned food
   */
  calculateFoodCarbon(foodItem: FoodItem, quantity: number): FoodCarbonData {
    const totalCO2 = (foodItem.co2PerUnit * quantity) / 100; // Convert to kg CO2
    
    return {
      item: foodItem,
      quantity,
      totalCO2,
      confidence: foodItem.source === 'local' ? 0.9 : 0.7,
    };
  }

  /**
   * Save food consumption to backend
   */
  async saveFoodConsumption(carbonData: FoodCarbonData): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/carbon/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: 'food',
          activityType: 'packaged_food',
          value: carbonData.quantity,
          co2Kg: carbonData.totalCO2,
          source: 'api',
          metadata: {
            barcode: carbonData.item.barcode,
            productName: carbonData.item.name,
            brand: carbonData.item.brand,
            category: carbonData.item.category,
            unit: carbonData.item.unit,
            confidence: carbonData.confidence,
            scanDate: new Date(),
            autoDetected: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save food consumption to backend');
      }

      console.log('Food consumption saved to backend');
    } catch (error) {
      console.error('Error saving food consumption:', error);
      throw error;
    }
  }

  /**
   * Add custom food item to database
   */
  addCustomFoodItem(foodItem: FoodItem): void {
    this.foodDatabase.set(foodItem.barcode, foodItem);
    
    // Update local storage
    const items = Array.from(this.foodDatabase.values());
    localStorage.setItem('food_carbon_db', JSON.stringify(items));
  }

  /**
   * Get all food items from database
   */
  getAllFoodItems(): FoodItem[] {
    return Array.from(this.foodDatabase.values());
  }

  /**
   * Search food items by name
   */
  searchFoodItems(query: string): FoodItem[] {
    const queryLower = query.toLowerCase();
    return Array.from(this.foodDatabase.values()).filter(item =>
      item.name.toLowerCase().includes(queryLower) ||
      item.brand?.toLowerCase().includes(queryLower) ||
      item.category.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Get camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Stop the stream immediately as we just wanted to check permissions
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.scanner) {
      this.scanner.reset();
    }
  }
}

export default BarcodeService;
export type { BarcodeResult, FoodItem, FoodCarbonData };
