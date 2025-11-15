import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireCorporate, requireOrganizationAccess } from '../middleware/rbac';
import { Organization, User } from '../models';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Apply authentication and corporate role requirement to all routes
router.use(authenticateToken);
router.use(requireCorporate);
router.use(requireOrganizationAccess);

/**
 * @swagger
 * /api/corporate/dashboard:
 *   get:
 *     summary: Get corporate dashboard data
 *     tags: [Corporate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Corporate dashboard data retrieved successfully
 *       403:
 *         description: Access denied - Corporate role required
 */
router.get('/dashboard', asyncHandler(async (req: any, res: Response) => {
  const user = req.user;
  
  // Get organization details
  const organization = await Organization.findByPk(user.organizationId);
  
  if (!organization) {
    res.status(404).json({
      success: false,
      error: 'Organization not found'
    } as ApiResponse);
    return;
  }

  // Get employees separately
  const employees = await User.findAll({
    where: { organizationId: user.organizationId },
    attributes: ['id', 'firstName', 'lastName', 'email', 'level', 'ecoPoints', 'streak', 'totalCo2Saved']
  });

  // Mock data for now (will be replaced when CarbonLog is available)
  const totalCarbonLogs = 0;
  const totalCo2Saved = 0;

  const totalEcoPoints = employees.reduce((sum: number, emp: any) => sum + emp.ecoPoints, 0);
  const averageCo2PerEmployee = employees.length ? totalCo2Saved / employees.length : 0;

  // Get top performers
  const topPerformers = employees
    .sort((a: any, b: any) => b.ecoPoints - a.ecoPoints)
    .slice(0, 5);

  // Get all employees for the response
  const allEmployees = employees.map((emp: any) => ({
    id: emp.id,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
    level: emp.level,
    ecoPoints: emp.ecoPoints,
    streak: emp.streak,
    totalCo2Saved: emp.totalCo2Saved || 0
  }));

  res.json({
    success: true,
    data: {
      organization: {
        id: organization.id,
        name: organization.name,
        domain: organization.domain,
        industry: organization.industry,
        size: organization.size,
        employeeCount: employees.length
      },
      metrics: {
        totalEmployees: employees.length,
        totalCarbonLogs,
        totalCo2Saved,
        totalEcoPoints,
        averageCo2PerEmployee
      },
      employees: allEmployees,
      topPerformers
    },
    message: 'Corporate dashboard data retrieved successfully'
  } as ApiResponse);
}));

/**
 * @swagger
 * /api/corporate/employees:
 *   get:
 *     summary: Get organization employees
 *     tags: [Corporate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 */
router.get('/employees', asyncHandler(async (req: any, res: Response) => {
  const user = req.user;
  
  const employees = await User.findAll({
    where: { organizationId: user.organizationId },
    attributes: ['id', 'firstName', 'lastName', 'email', 'level', 'ecoPoints', 'streak', 'totalCo2Saved', 'createdAt']
  });

  res.json({
    success: true,
    data: employees,
    message: 'Employees retrieved successfully'
  } as ApiResponse);
}));

/**
 * @swagger
 * /api/corporate/analytics:
 *   get:
 *     summary: Get organization analytics
 *     tags: [Corporate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics', asyncHandler(async (req: any, res: Response) => {
  const user = req.user;
  
  // Get all employees in the organization
  const employees = await User.findAll({
    where: { organizationId: user.organizationId },
    attributes: ['id']
  });
  
  const employeeIds = employees.map(emp => emp.id);
  
  // Mock analytics data (will be replaced when CarbonLog is available)
  const categoryBreakdown = {
    transport: 0,
    food: 0,
    energy: 0,
    other: 0
  };

  const monthlyTrends = {};

  res.json({
    success: true,
    data: {
      categoryBreakdown,
      monthlyTrends,
      totalLogs: 0,
      totalCo2Saved: 0
    },
    message: 'Analytics retrieved successfully'
  } as ApiResponse);
}));

/**
 * @swagger
 * /api/corporate/organization:
 *   get:
 *     summary: Get organization details
 *     tags: [Corporate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 */
router.get('/organization', asyncHandler(async (req: any, res: Response) => {
  const user = req.user;
  
  const organization = await Organization.findByPk(user.organizationId);
  
  if (!organization) {
    res.status(404).json({
      success: false,
      error: 'Organization not found'
    } as ApiResponse);
    return;
  }

  res.json({
    success: true,
    data: organization,
    message: 'Organization details retrieved successfully'
  } as ApiResponse);
}));

/**
 * @swagger
 * /api/corporate/organization:
 *   put:
 *     summary: Update organization details
 *     tags: [Corporate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *               industry:
 *                 type: string
 *               size:
 *                 type: string
 *                 enum: [startup, small, medium, large, enterprise]
 *     responses:
 *       200:
 *         description: Organization updated successfully
 */
router.put('/organization', asyncHandler(async (req: any, res: Response) => {
  const user = req.user;
  const { name, domain, industry, size } = req.body;
  
  const organization = await Organization.findByPk(user.organizationId);
  
  if (!organization) {
    res.status(404).json({
      success: false,
      error: 'Organization not found'
    } as ApiResponse);
    return;
  }

  await organization.update({
    name: name || organization.name,
    domain: domain || organization.domain,
    industry: industry || organization.industry,
    size: size || organization.size
  });

  res.json({
    success: true,
    data: organization,
    message: 'Organization updated successfully'
  } as ApiResponse);
}));

export default router;
