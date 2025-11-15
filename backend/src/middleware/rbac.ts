import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { AuthenticatedRequest } from './auth';

export interface RoleBasedRequest extends AuthenticatedRequest {
  user?: any;
}

// Role-based access control middleware
export const requireRole = (allowedRoles: ('user' | 'corporate')[]) => {
  return (req: RoleBasedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions for this resource',
        message: `Required role: ${allowedRoles.join(' or ')}, current role: ${user.role}`,
      } as ApiResponse);
      return;
    }

    next();
  };
};

// Specific role middlewares
export const requireUser = requireRole(['user']);
export const requireCorporate = requireRole(['corporate']);
export const requireAnyRole = requireRole(['user', 'corporate']);

// Organization-based access control
export const requireSameOrganization = (req: RoleBasedRequest, res: Response, next: NextFunction): void => {
  const user = req.user;
  const { organizationId } = req.params;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    } as ApiResponse);
    return;
  }

  // Corporate users can only access their own organization's data
  if (user.role === 'corporate') {
    if (!user.organizationId) {
      res.status(403).json({
        success: false,
        error: 'Corporate user must be associated with an organization',
      } as ApiResponse);
      return;
    }

    if (organizationId && parseInt(organizationId) !== user.organizationId) {
      res.status(403).json({
        success: false,
        error: 'Access denied: Cannot access other organization data',
      } as ApiResponse);
      return;
    }
  }

  next();
};

// Check if user can access corporate features
export const requireOrganizationAccess = (req: RoleBasedRequest, res: Response, next: NextFunction): void => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    } as ApiResponse);
    return;
  }

  if (user.role === 'corporate' && !user.organizationId) {
    res.status(403).json({
      success: false,
      error: 'Corporate user must be associated with an organization',
    } as ApiResponse);
    return;
  }

  next();
};
