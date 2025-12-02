import { body, param } from 'express-validator';
import { UserRole } from '../types';

export const updateUserRoleValidators = [
  param('id').isInt().withMessage('Invalid user ID'),
  body('role')
    .isIn([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN])
    .withMessage('Invalid role')
];

export const deleteUserValidators = [
  param('id').isInt().withMessage('Invalid user ID')
];

export const adminDeleteCourseValidators = [
  param('id').isInt().withMessage('Invalid course ID')
];
