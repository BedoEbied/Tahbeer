import { Router, Response } from 'express';
import { validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { AuthRequest, UserRole, UpdateCourseDTO } from '../types';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import CourseController from '../controllers/courseController';
import { createCourseValidators, updateCourseValidators, deleteCourseValidators } from '../validators/courseValidators';
import { instructorCourseEnrollmentsValidators } from '../validators/instructorValidators';
const router = Router();

// All instructor routes require authentication and instructor/admin role
router.use(authenticate);
router.use(roleCheck([UserRole.INSTRUCTOR, UserRole.ADMIN]));

/**
 * @route   GET /api/instructor/courses
 * @desc    Get instructor's own courses
 * @access  Private (Instructor/Admin)
 */
router.get('/courses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const courses = await Course.findByInstructor(req.user.userId);

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
 * @route   POST /api/instructor/courses
 * @desc    Create new course
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/courses',
  createCourseValidators,
  CourseController.createCourse
);

/**
 * @route   PUT /api/instructor/courses/:id
 * @desc    Update own course
 * @access  Private (Instructor/Admin)
 */
router.put(
  '/courses/:id',
  updateCourseValidators,
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

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }

      const courseId = Number.parseInt(req.params.id);

      // Check if course exists and belongs to instructor (unless admin)
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      // Only course owner can update (unless admin)
      if (course.instructor_id !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own courses'
        });
        return;
      }

      const updateData: UpdateCourseDTO = req.body;
      const updated = await Course.update(courseId, updateData);

      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No updates provided'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Course updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route   DELETE /api/instructor/courses/:id
 * @desc    Delete own course
 * @access  Private (Instructor/Admin)
 */
router.delete(
  '/courses/:id',
  deleteCourseValidators,
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

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }

      const courseId = Number.parseInt(req.params.id);

      // Check if course exists and belongs to instructor (unless admin)
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      // Only course owner can delete (unless admin)
      if (course.instructor_id !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'You can only delete your own courses'
        });
        return;
      }

      await Course.delete(courseId);

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

/**
 * @route   GET /api/instructor/courses/:id/enrollments
 * @desc    Get enrollments for a course
 * @access  Private (Instructor/Admin)
 */
router.get(
  '/courses/:id/enrollments',
  instructorCourseEnrollmentsValidators,
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

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }

      const courseId = Number.parseInt(req.params.id);

      // Check if course exists and belongs to instructor (unless admin)
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      // Only course owner can view enrollments (unless admin)
      if (course.instructor_id !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'You can only view enrollments for your own courses'
        });
        return;
      }

      const enrollments = await Enrollment.getCourseEnrollments(courseId);

      res.status(200).json({
        success: true,
        data: { enrollments, count: enrollments.length }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching enrollments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
