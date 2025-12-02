import { body } from 'express-validator';
import { UserRole } from '../types';

export const registerValidators = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role')
    .optional()
    .isIn([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN])
    .withMessage('Invalid role')
];

export const loginValidators = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];
