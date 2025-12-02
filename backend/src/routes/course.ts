import { Router } from 'express';
import { UserRole } from '../types';
import CourseController from '../controllers/courseController';
import { authenticate } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import {
  getAllCoursesValidators,
  getCourseByIdValidators,
  getInstructorCoursesValidators,
  createCourseValidators,
  updateCourseValidators,
  deleteCourseValidators
} from '../validators/courseValidators';

const router = Router();

// Middleware for instructor and admin roles
const instructorOrAdmin = [UserRole.INSTRUCTOR, UserRole.ADMIN];

/**
 * @route   GET /api/course
 * @desc    Get all courses with optional filtering and pagination
 * @access  Public
 */
router.get('/', getAllCoursesValidators, CourseController.getAllCourses);

/**
 * @route   GET /api/course/:id
 * @desc    Get a single course by ID
 * @access  Public
 */
router.get('/:id', getCourseByIdValidators, CourseController.getCourseById);

/**
 * @route   GET /api/course/instructor/:instructorId
 * @desc    Get all courses by a specific instructor
 * @access  Public
 */
router.get(
  '/instructor/:instructorId',
  getInstructorCoursesValidators,
  CourseController.getInstructorCourses
);

// Protected routes - require authentication
router.use(authenticate);

/**
 * @route   POST /api/course
 * @desc    Create a new course
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/',
  [roleCheck(instructorOrAdmin), ...createCourseValidators],
  CourseController.createCourse
);

/**
 * @route   PUT /api/course/:id
 * @desc    Update a course
 * @access  Private (Instructor/Admin)
 */
router.put(
  '/:id',
  [roleCheck(instructorOrAdmin), ...updateCourseValidators],
  CourseController.updateCourse
);

/**
 * @route   DELETE /api/course/:id
 * @desc    Delete a course
 * @access  Private (Instructor/Admin)
 */
router.delete(
  '/:id',
  [roleCheck(instructorOrAdmin), ...deleteCourseValidators],
  CourseController.deleteCourse
);

export default router;
