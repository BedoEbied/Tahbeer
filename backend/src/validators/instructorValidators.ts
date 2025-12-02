import { param } from 'express-validator';

export const instructorCourseEnrollmentsValidators = [
  param('id').isInt().withMessage('Invalid course ID')
];
