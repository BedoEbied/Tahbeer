import { param } from 'express-validator';

export const studentCourseDetailsValidators = [
  param('id').isInt().withMessage('Invalid course ID')
];

export const studentEnrollValidators = [
  param('courseId').isInt().withMessage('Invalid course ID')
];

export const studentUnenrollValidators = [
  param('courseId').isInt().withMessage('Invalid course ID')
];
