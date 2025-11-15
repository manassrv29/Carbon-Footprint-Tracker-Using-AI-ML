import { Request, Response } from 'express';
import { User } from '../models';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      error: 'No file uploaded'
    } as ApiResponse);
    return;
  }

  try {
    // Update user's avatar field with the file path
    const userRecord = await User.findByPk(user.id);
    if (!userRecord) {
      // Clean up uploaded file if user not found
      fs.unlinkSync(file.path);
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    // Delete old profile image if it exists
    if (userRecord.avatar && userRecord.avatar !== '/default-avatar.png') {
      const oldImagePath = path.join(process.cwd(), 'uploads', userRecord.avatar);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new avatar path
    const avatarPath = `/uploads/profiles/${file.filename}`;
    await userRecord.update({ avatar: avatarPath });

    res.json({
      success: true,
      data: {
        avatarUrl: avatarPath,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      },
      message: 'Profile image uploaded successfully'
    } as ApiResponse);

  } catch (error) {
    // Clean up uploaded file on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
});

export const uploadReceiptImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      error: 'No file uploaded'
    } as ApiResponse);
    return;
  }

  try {
    // In a real implementation, this would:
    // 1. Process the image with OCR service (Google Vision, AWS Textract, etc.)
    // 2. Extract text and identify carbon-related items
    // 3. Calculate emissions and create carbon logs
    // 4. Return the processed results

    // Mock OCR processing results
    const mockOcrResults = {
      extractedText: "Gas Station Receipt\nShell Station\nRegular Unleaded: 15.2 gal\n$45.60\nTotal: $45.60",
      identifiedItems: [
        {
          category: 'transport',
          activityType: 'fuel',
          quantity: 15.2,
          unit: 'gallons',
          estimatedCo2: 135.4, // 15.2 gal * 8.9 kg CO2/gal
          confidence: 0.92
        }
      ],
      processingTime: 1.2,
      confidence: 0.89
    };

    // Store receipt metadata (in real implementation, you might want to keep the image for audit purposes)
    const receiptData = {
      userId: user.id,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      processed: true,
      ocrResults: mockOcrResults
    };

    res.json({
      success: true,
      data: {
        receiptId: Date.now().toString(), // Mock ID
        filename: file.filename,
        ocrResults: mockOcrResults,
        suggestedLogs: mockOcrResults.identifiedItems.map(item => ({
          category: item.category,
          activityType: item.activityType,
          value: item.quantity,
          co2Kg: item.estimatedCo2,
          source: 'ocr',
          metadata: {
            receiptId: Date.now().toString(),
            confidence: item.confidence,
            extractedText: mockOcrResults.extractedText
          }
        }))
      },
      message: 'Receipt processed successfully'
    } as ApiResponse);

  } catch (error) {
    // Clean up uploaded file on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
});
