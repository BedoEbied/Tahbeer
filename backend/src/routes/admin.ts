import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { AuthRequest, UserRole } from '../types';
import User from '../models/User';
import Course from '../models/Course';

const router = Router();

// All admin routes require authentication and admin/instructor role
router.use(authenticate);
router.use(roleCheck([UserRole.ADMIN, UserRole.INSTRUCTOR]));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin/Instructor)
 */
router.get('/users', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.findAll();

    res.status(200).json({
      success: true,
      data: { users, count: users.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin/Instructor)
 */
router.put(
  '/users/:id/role',
  [
    param('id').isInt().withMessage('Invalid user ID'),
    body('role')
      .isIn([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN])
      .withMessage('Invalid role')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const userId = Number.parseInt(req.params.id);
      const { role } = req.body;

      const updated = await User.updateRole(userId, role);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user role',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin/Instructor)
 */
router.delete(
  '/users/:id',
  [param('id').isInt().withMessage('Invalid user ID')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const userId = Number.parseInt(req.params.id);

      // Prevent self-deletion
      if (req.user?.userId === userId) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
        return;
      }

      const deleted = await User.delete(userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses (including drafts)
 * @access  Private (Admin/Instructor)
 */
router.get('/courses', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await Course.findAll();

    res.status(200).json({
      success: true,
      data: { courses, count: courses.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   DELETE /api/admin/courses/:id
 * @desc    Delete any course
 * @access  Private (Admin/Instructor)
 */
router.delete(
  '/courses/:id',
  [param('id').isInt().withMessage('Invalid course ID')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const courseId = Number.parseInt(req.params.id);
      const deleted = await Course.delete(courseId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
