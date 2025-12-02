import { Router, Response } from 'express';
import { validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { AuthRequest, UserRole } from '../types';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import {
  studentCourseDetailsValidators,
  studentEnrollValidators,
  studentUnenrollValidators
} from '../validators/studentValidators';

const router = Router();

// All student routes require authentication and student role
router.use(authenticate);
router.use(roleCheck([UserRole.STUDENT]));

/**
 * @route   GET /api/student/courses
 * @desc    Browse all published courses
 * @access  Private (Student)
 */
router.get('/courses', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await Course.findPublished();

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
 * @route   GET /api/student/courses/:id
 * @desc    Get course details
 * @access  Private (Student)
 */
router.get(
  '/courses/:id',
  studentCourseDetailsValidators,
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
      const course = await Course.findById(courseId);

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { course }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route   POST /api/student/enroll/:courseId
 * @desc    Enroll in a course
 * @access  Private (Student)
 */
router.post(
  '/enroll/:courseId',
  studentEnrollValidators,
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

      const courseId = Number.parseInt(req.params.courseId);
      const userId = req.user.userId;

      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      // Check if already enrolled
      const alreadyEnrolled = await Enrollment.isEnrolled(userId, courseId);
      if (alreadyEnrolled) {
        res.status(409).json({
          success: false,
          message: 'Already enrolled in this course'
        });
        return;
      }

      // Enroll user
      const enrollment = await Enrollment.enroll(userId, courseId);

      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: { enrollment }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error enrolling in course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route   GET /api/student/my-courses
 * @desc    Get user's enrolled courses
 * @access  Private (Student)
 */
router.get('/my-courses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const enrollments = await Enrollment.getUserEnrollments(req.user.userId);

    res.status(200).json({
      success: true,
      data: { enrollments, count: enrollments.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   DELETE /api/student/unenroll/:courseId
 * @desc    Unenroll from a course
 * @access  Private (Student)
 */
router.delete(
  '/unenroll/:courseId',
  studentUnenrollValidators,
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

      const courseId = Number.parseInt(req.params.courseId);
      const userId = req.user.userId;

      const unenrolled = await Enrollment.unenroll(userId, courseId);

      if (!unenrolled) {
        res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Successfully unenrolled from course'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error unenrolling from course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
