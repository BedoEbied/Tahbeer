import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Course } from '../models/Course';
import { CreateCourseDTO, UpdateCourseDTO, ApiResponse, CourseWithInstructor } from '../types';

/**
 * Course Controller - handles HTTP requests for course operations
 */
class CourseController {
  /**
   * Create a new course (Instructor only)
   */
  static async createCourse(req: any, res: Response, next: NextFunction) {
    try {
      // Input validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        } as ApiResponse);
      }

      const instructorId = req.user.userId;
      const courseData: CreateCourseDTO = req.body;
      
      const course = await Course.create(courseData, instructorId);

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all courses with pagination and filtering
   */
  static async getAllCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      
      let courses: CourseWithInstructor[];
      
      if (status === 'published') {
        courses = await Course.findPublished();
      } else {
        courses = await Course.findAll();
      }

      // Get query parameters for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      // Apply pagination
      const paginatedCourses = courses.slice(startIndex, endIndex);

      return res.json({
        success: true,
        data: paginatedCourses,
        pagination: {
          total: courses.length,
          page,
          limit,
          totalPages: Math.ceil(courses.length / limit),
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single course by ID
   */
  static async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = parseInt(req.params.id);
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        } as ApiResponse);
      }

      return res.json({
        success: true,
        data: course,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a course (Instructor only)
   */
  static async updateCourse(req: any, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        } as ApiResponse);
      }

      const courseId = parseInt(req.params.id);
      const instructorId = req.user.userId;
      const updateData: UpdateCourseDTO = req.body;

      // Check if course exists and belongs to the instructor
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        } as ApiResponse);
      }

      if (course.instructor_id !== instructorId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this course',
        } as ApiResponse);
      }

      const isUpdated = await Course.update(courseId, updateData);
      if (!isUpdated) {
        throw new Error('Failed to update course');
      }

      const updatedCourse = await Course.findById(courseId);

      return res.json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a course (Instructor or Admin only)
   */
  static async deleteCourse(req: any, res: Response, next: NextFunction) {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user.userId;
      const userRole = req.user.role;

      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        } as ApiResponse);
      }

      // Check if user is the instructor or admin
      if (course.instructor_id !== userId && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this course',
        } as ApiResponse);
      }

      const isDeleted = await Course.delete(courseId);
      if (!isDeleted) {
        throw new Error('Failed to delete course');
      }

      return res.json({
        success: true,
        message: 'Course deleted successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get courses by instructor ID
   */
  static async getInstructorCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const instructorId = parseInt(req.params.instructorId);
      const courses = await Course.findByInstructor(instructorId);

      return res.json({
        success: true,
        data: courses,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export default CourseController;