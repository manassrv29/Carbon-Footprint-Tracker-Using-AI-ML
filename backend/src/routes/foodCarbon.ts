import { Router } from 'express';
import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Mock food carbon database for barcode scanning
const mockFoodDatabase = [
  {
    id: '1234567890123',
    name: 'Organic Bananas',
    brand: 'Fresh Market',
    category: 'fruits',
    carbonPerGram: 0.0007,
    nutritionPer100g: {
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3
    }
  },
  {
    id: '2345678901234',
    name: 'Whole Wheat Bread',
    brand: 'Bakery Fresh',
    category: 'grains',
    carbonPerGram: 0.0012,
    nutritionPer100g: {
      calories: 247,
      protein: 13.2,
      carbs: 41.0,
      fat: 4.2
    }
  },
  {
    id: '3456789012345',
    name: 'Chicken Breast',
    brand: 'Farm Fresh',
    category: 'meat',
    carbonPerGram: 0.0061,
    nutritionPer100g: {
      calories: 165,
      protein: 31.0,
      carbs: 0,
      fat: 3.6
    }
  },
  {
    id: '4567890123456',
    name: 'Almond Milk',
    brand: 'Plant Based',
    category: 'dairy_alternatives',
    carbonPerGram: 0.0009,
    nutritionPer100g: {
      calories: 17,
      protein: 0.6,
      carbs: 0.3,
      fat: 1.1
    }
  }
];

/**
 * @swagger
 * /api/food-carbon/database:
 *   get:
 *     summary: Get food carbon database for barcode scanning
 *     tags: [Food Carbon]
 *     responses:
 *       200:
 *         description: Food database retrieved successfully
 */
router.get('/database', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: mockFoodDatabase,
    message: 'Food carbon database retrieved successfully'
  } as ApiResponse);
}));

/**
 * @swagger
 * /api/food-carbon/search:
 *   get:
 *     summary: Search food items by barcode or name
 *     tags: [Food Carbon]
 *     parameters:
 *       - in: query
 *         name: barcode
 *         schema:
 *           type: string
 *         description: Barcode to search for
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Food name to search for
 *     responses:
 *       200:
 *         description: Food items found
 *       404:
 *         description: No food items found
 */
router.get('/search', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { barcode, name } = req.query;
  
  let results = mockFoodDatabase;
  
  if (barcode) {
    results = results.filter(item => item.id === barcode);
  }
  
  if (name) {
    const searchTerm = (name as string).toLowerCase();
    results = results.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.brand.toLowerCase().includes(searchTerm)
    );
  }
  
  if (results.length === 0) {
    res.status(404).json({
      success: false,
      error: 'No food items found',
      data: []
    } as ApiResponse);
    return;
  }
  
  res.json({
    success: true,
    data: results,
    message: `Found ${results.length} food item(s)`
  } as ApiResponse);
}));

export default router;
