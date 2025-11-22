import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { UserRole } from '../types';
import CourseController from '../controllers/courseController';
import { authenticate } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

// Middleware for instructor and admin roles
const instructorOrAdmin = [UserRole.INSTRUCTOR, UserRole.ADMIN];

/**
 * @route   GET /api/courses
 * @desc    Get all courses with optional filtering and pagination
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['published']).withMessage('Invalid status filter'),
  ],
  CourseController.getAllCourses
);

/**
 * @route   GET /api/courses/:id
 * @desc    Get a single course by ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid course ID'),
  ],
  CourseController.getCourseById
);

/**
 * @route   GET /api/courses/instructor/:instructorId
 * @desc    Get all courses by a specific instructor
 * @access  Public
 */
router.get(
  '/instructor/:instructorId',
  [
    param('instructorId').isInt({ min: 1 }).withMessage('Invalid instructor ID'),
  ],
  CourseController.getInstructorCourses
);

// Protected routes - require authentication
router.use(authenticate);

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/',
  [
    roleCheck(instructorOrAdmin),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a non-negative number'),
    body('image_url').optional().isURL().withMessage('Invalid image URL'),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Invalid status'),
  ],
  CourseController.createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update a course
 * @access  Private (Instructor/Admin)
 */
router.put(
  '/:id',
  [
    roleCheck(instructorOrAdmin),
    param('id').isInt({ min: 1 }).withMessage('Invalid course ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a non-negative number'),
    body('image_url').optional().isURL().withMessage('Invalid image URL'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Invalid status'),
  ],
  CourseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Private (Instructor/Admin)
 */
router.delete(
  '/:id',
  [
    roleCheck(instructorOrAdmin),
    param('id').isInt({ min: 1 }).withMessage('Invalid course ID'),
  ],
  CourseController.deleteCourse
);

export default router;