import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

/**
 * Role-based access control middleware
 * Checks if authenticated user has one of the allowed roles
 */
export const roleCheck = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Access forbidden. Insufficient permissions.',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};
