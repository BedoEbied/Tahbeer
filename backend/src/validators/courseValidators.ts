import { body, param, query } from 'express-validator';

export const getAllCoursesValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['published']).withMessage('Invalid status filter')
];

export const getCourseByIdValidators = [
  param('id').isInt({ min: 1 }).withMessage('Invalid course ID')
];

export const getInstructorCoursesValidators = [
  param('instructorId').isInt({ min: 1 }).withMessage('Invalid instructor ID')
];

export const createCourseValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('image_url').optional().isURL().withMessage('Invalid image URL'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status')
];

export const deleteCourseValidators = [
  param('id').isInt({ min: 1 }).withMessage('Invalid course ID')
];

export const updateCourseValidators = [
  param('id').isInt({ min: 1 }).withMessage('Invalid course ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('image_url').optional().isURL().withMessage('Invalid image URL'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];
